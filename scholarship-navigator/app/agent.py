# ruff: noqa: F401
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
import json
import re
from zoneinfo import ZoneInfo

from google.adk import Context, Workflow
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.events import Event, RequestInput
from google.adk.models import Gemini
from google.adk.tools.agent_tool import AgentTool
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from google.adk.workflow import node
from google.genai import types

from app.config import config

# =====================================================================
# MCP TOOLSET SETUP (stdio transport connection to app.mcp_server)
# =====================================================================

import logging
logger = logging.getLogger(__name__)

# Defensive validation and temporary debug logging before Pydantic model creation
command = "uv"
args = ["run", "python", "-m", "app.mcp_server"]

if command is None:
    raise ValueError("command cannot be None.")
assert isinstance(command, str), "command must be a string."
if args is None:
    raise ValueError("args cannot be None.")
assert isinstance(args, list), "args must be a list."
for arg in args:
    assert isinstance(arg, str), "args elements must be strings."

logger.debug({
    "model_name": "StdioServerParameters",
    "command": command,
    "command_type": type(command).__name__,
    "args": args,
    "args_type": type(args).__name__,
})

mcp_toolset = MCPToolset(
    connection_params=StdioServerParameters(
        command=command,
        args=args
    )
)

# =====================================================================
# SPECIALIZED SUB-AGENTS
# =====================================================================

scholarship_matcher = Agent(
    name="scholarship_matcher",
    model=Gemini(
        model=config.model,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are ScholarshipMatcher, an expert scholarship match agent. "
        "Your task is to analyze the student's profile (such as GPA, major, career goals, interests, location) "
        "and recommend the most relevant scholarships from our database. "
        "Use the search_scholarships tool to find matching opportunities. "
        "Use get_scholarship_details and check_gpa_eligibility to check detailed info and eligibility. "
        "Provide details for each match: name, amount, deadline, eligibility criteria, and a brief explanation "
        "of why the student fits. Output the matched list in a clean, structured markdown format."
    ),
    tools=[mcp_toolset],
)

materials_helper = Agent(
    name="materials_helper",
    model=Gemini(
        model=config.model,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are MaterialsHelper, an expert scholarship application assistant. "
        "Your task is to help the student prepare and refine their application materials. "
        "Use get_scholarship_details or check_gpa_eligibility if you need to double-check details for a scholarship. "
        "This includes outlining/editing statements of purpose (SOP) or essays, structuring academic resumes, "
        "and creating a personalized checklist of required documents (transcripts, reference letters, etc.). "
        "Focus on academic integrity: guide and review their drafts, rather than writing them from scratch. "
        "Format your suggestions and checklists in structured, easy-to-read markdown."
    ),
    tools=[mcp_toolset],
)

# Wrap specialized agents as tools for parent delegation
matcher_tool = AgentTool(agent=scholarship_matcher)
materials_tool = AgentTool(agent=materials_helper)

# =====================================================================
# ORCHESTRATOR AGENT
# =====================================================================

orchestrator_agent = Agent(
    name="orchestrator",
    model=Gemini(
        model=config.model,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are ScholarNavigatorOrchestrator, the central coordinator for Scholar Navigator. "
        "Your role is to understand the student's request and delegate tasks to the appropriate specialized tools: "
        "- Use scholarship_matcher to find/match scholarships or analyze eligibility. "
        "- Use materials_helper to draft/edit essays, SOPs, resumes, or compile application checklists. "
        "If a request requires a combination, call both tools sequentially or as needed. "
        "Ensure a supportive and professional tone. "
        "If the user is asking to finalize, submit, verify, or review critical/high-value application materials, "
        "you MUST explicitly include 'Action: HITL_APPROVAL_REQUIRED' in your response to trigger a human-in-the-loop verification step."
    ),
    tools=[matcher_tool, materials_tool],
)

# =====================================================================
# WORKFLOW FUNCTION NODES (ADK 2.0 Graph API)
# =====================================================================

@node
async def security_checkpoint(ctx: Context, node_input: str | types.Content | None = None) -> Event:
    """Checks input for prompt injection, scrubs PII, and runs domain safety checks."""
    if node_input is None:
        raise ValueError("User input (node_input) cannot be None.")
    
    if isinstance(node_input, types.Content):
        parts_text = [p.text for p in node_input.parts if p.text]
        query = "".join(parts_text)
    elif isinstance(node_input, str):
        query = node_input
    else:
        raise ValueError(f"Unexpected input type: {type(node_input)}")

    assert isinstance(query, str), "Query must be a string."
    audit_log = []
    
    # 1. Prompt Injection Detection
    injection_keywords = [
        "ignore previous instructions", 
        "ignore instructions", 
        "system prompt", 
        "you are now a", 
        "override system"
    ]
    has_injection = any(kw in query.lower() for kw in injection_keywords)
    if has_injection:
        audit_log.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "severity": "CRITICAL",
            "event": "Prompt Injection Detected",
            "query": query
        })
        print(f"[AUDIT LOG] {json.dumps(audit_log[-1])}")
        ctx.session.state["final_response"] = "Security Warning: Potential prompt injection detected. Request blocked."
        return Event(route="SECURITY_EVENT")

    # 2. PII Scrubbing
    pii_found = False
    
    # SSN check
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    if re.search(ssn_pattern, query):
        query = re.sub(ssn_pattern, "[SSN REDACTED]", query)
        pii_found = True
        
    # Email check
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, query):
        query = re.sub(email_pattern, "[EMAIL REDACTED]", query)
        pii_found = True
        
    # Phone check
    phone_pattern = r'\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b'
    if re.search(phone_pattern, query):
        query = re.sub(phone_pattern, "[PHONE REDACTED]", query)
        pii_found = True
        
    if pii_found:
        audit_log.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "severity": "WARNING",
            "event": "PII Detected and Scrubbed",
            "original_query": node_input,
            "scrubbed_query": query
        })
        print(f"[AUDIT LOG] {json.dumps(audit_log[-1])}")
    else:
        audit_log.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "severity": "INFO",
            "event": "Input Safety Check Passed",
            "query": query
        })
        print(f"[AUDIT LOG] {json.dumps(audit_log[-1])}")

    # 3. Domain Specific Safety Check: Academic Integrity Check
    cheating_keywords = ["write the essay for me", "do my homework", "write my statement of purpose from scratch"]
    if any(kw in query.lower() for kw in cheating_keywords):
        audit_log.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "severity": "WARNING",
            "event": "Academic Integrity Policy Warning",
            "query": query
        })
        print(f"[AUDIT LOG] {json.dumps(audit_log[-1])}")
        ctx.session.state["final_response"] = (
            "Academic Integrity Policy: I can help you review, outline, or edit your statement of purpose "
            "and essay, but I cannot write it for you from scratch. Please provide your own draft or outline!"
        )
        return Event(route="SECURITY_EVENT")

    # Save scrubbed query to state for the next node
    ctx.session.state["scrubbed_query"] = query
    return Event(route="CLEAN")


@node(rerun_on_resume=True)
async def orchestrator_node(ctx: Context, node_input: str | types.Content | None = None) -> str:
    """Executes the orchestrator agent using the scrubbed query from session state."""
    if isinstance(node_input, types.Content):
        parts_text = [p.text for p in node_input.parts if p.text]
        extracted_input = "".join(parts_text)
    elif isinstance(node_input, str):
        extracted_input = node_input
    else:
        extracted_input = ""

    query = ctx.session.state.get("scrubbed_query", "") or extracted_input or ""
    if not query:
        raise ValueError("Query (scrubbed_query or node_input) cannot be empty or None.")
    assert isinstance(query, str), "Query must be a string."
    
    # use_as_output=True: the agent's text response is used as this node's output
    # and is returned by run_node.
    agent_response = await ctx.run_node(
        orchestrator_agent,
        node_input=query,
        use_as_output=True,
    )
    
    # Guard against None — agent may return None if it produced no text output.
    if agent_response is None:
        agent_response = ""
    agent_response = str(agent_response).strip()
    if not agent_response:
        agent_response = (
            "I'm sorry, I was unable to generate a response. "
            "Please try rephrasing your question."
        )
    
    ctx.session.state["orchestrator_response"] = agent_response
    
    if "HITL_APPROVAL_REQUIRED" in agent_response:
        ctx.session.state["needs_approval"] = True
    else:
        ctx.session.state["final_response"] = agent_response
        
    return agent_response


@node
async def check_approval(ctx: Context, node_input: str | types.Content | None = None) -> Event:
    """Decides if the flow requires human approval based on session state."""
    if ctx.session.state.get("needs_approval", False):
        return Event(route="NEEDS_APPROVAL")
    return Event(route="AUTO_APPROVE")


@node(rerun_on_resume=True)
async def human_approval(ctx: Context, node_input: str | types.Content | None = None):
    """Pauses the workflow to request human feedback, then resumes with details saved."""
    if ctx.session.state.get("human_approved", False):
        yield Event()
        return
        
    # Pause and ask for human verification
    yield RequestInput(
        message=(
            "✋ Scholar Navigator is about to match or assist with sensitive application details. "
            "Please review the proposal and type 'approve' to proceed or specify changes:"
        )
    )
    
    ctx.session.state["human_approved"] = True
    
    orig_resp = ctx.session.state.get("orchestrator_response", "")
    ctx.session.state["final_response"] = f"{orig_resp}\n\n[Human Approved / Changes reviewed: User proceeded]"
    yield Event()


@node
async def final_output(ctx: Context, node_input: str | types.Content | None = None) -> str:
    """Returns the final response stored in the session state."""
    return ctx.session.state.get("final_response", "No response generated.")


# =====================================================================
# WORKFLOW DEFINITION (Orchestration Graph)
# =====================================================================

root_agent = Workflow(
    name="scholar_navigator_workflow",
    nodes=[security_checkpoint, orchestrator_node, check_approval, human_approval, final_output],
    edges=[
        # START → security_checkpoint (unconditional)
        ("START", security_checkpoint),
        # security_checkpoint → orchestrator_node if CLEAN, else final_output if SECURITY_EVENT
        (security_checkpoint, {
            "CLEAN": orchestrator_node,
            "SECURITY_EVENT": final_output,
        }),
        # orchestrator_node → check_approval (unconditional)
        (orchestrator_node, check_approval),
        # check_approval → human_approval if NEEDS_APPROVAL, else final_output if AUTO_APPROVE
        (check_approval, {
            "NEEDS_APPROVAL": human_approval,
            "AUTO_APPROVE": final_output,
        }),
        # human_approval → final_output (unconditional)
        (human_approval, final_output),
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
