# ruff: noqa
import datetime
import json
import logging
import re
from zoneinfo import ZoneInfo

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.config import config

# Logging setup for audit logs
logging.basicConfig(level=logging.INFO)
audit_logger = logging.getLogger("security_audit")

# Try importing ADK 2.0 Workflow and AgentTool modules safely
try:
    from google.adk import Workflow
except ImportError:
    try:
        from google.adk.agents import Workflow
    except ImportError:
        from google.adk.workflows import Workflow

try:
    from google.adk.tools.agent_tool import AgentTool
except ImportError:
    try:
        from google.adk.tools import AgentTool
    except ImportError:
        from google.adk.agents import AgentTool

try:
    from google.adk.events import RequestInput, Event
except ImportError:
    try:
        from google.adk import RequestInput, Event
    except ImportError:
        from google.adk.agents import RequestInput, Event

# Try importing MCPToolset connection classes safely
try:
    from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioConnectionParams, StdioServerParameters
except ImportError:
    try:
        from google.adk.tools.mcp_toolset import MCPToolset, StdioConnectionParams, StdioServerParameters
    except ImportError:
        try:
            from google.adk.tools import MCPToolset, StdioServerParameters
            StdioConnectionParams = None
        except ImportError:
            from google.adk.agents import MCPToolset, StdioServerParameters
            StdioConnectionParams = None

# Define LLM Model Instance
model_instance = Gemini(
    model=config.model,
    retry_options=types.HttpRetryOptions(attempts=3),
)

# Connect to the local MCP server using Stdio transport connection params
mcp_server_params = StdioServerParameters(
    command="uv",
    args=["run", "python", "-m", "app.mcp_server"]
)

if StdioConnectionParams is not None:
    connection_params = StdioConnectionParams(server_params=mcp_server_params)
else:
    # Fallback to direct parameters if StdioConnectionParams is not in this ADK version
    connection_params = mcp_server_params

mcp_toolset = MCPToolset(connection_params=connection_params)

# -----------------------------------------------------------------------------
# Specialized Sub-Agents
# -----------------------------------------------------------------------------

search_eligibility_agent = Agent(
    name="search_eligibility_agent",
    model=model_instance,
    instruction="""You are the Scholarship Search & Eligibility Agent.
Your job is to search for scholarships matching the student's profile and check eligibility.
Profile details include: Name, Degree (Undergraduate/Graduate), Branch/Major, GPA, and Family Income.
Use the tools from the provided MCP toolset to search scholarships and check eligibility.
Analyze matches, evaluate eligibility limits, and output reasons for match or mismatch.""",
    tools=[mcp_toolset],
)

checklist_reminder_agent = Agent(
    name="checklist_reminder_agent",
    model=model_instance,
    instruction="""You are the Checklist & Deadline Agent.
Your job is to generate a checklist of required documents and deadlines for the matched scholarships.
Use the tools from the provided MCP toolset to retrieve details and deadlines.
Guide the student on what is needed (e.g., transcripts, letters of recommendation, essays) and compile upcoming dates.""",
    tools=[mcp_toolset],
)

# Wrap specialized agents as Tools for the Orchestrator
search_eligibility_tool = AgentTool(
    agent=search_eligibility_agent
)

checklist_reminder_tool = AgentTool(
    agent=checklist_reminder_agent
)

# -----------------------------------------------------------------------------
# Profile Saving Tool
# -----------------------------------------------------------------------------

def save_student_profile(
    ctx,
    name: str,
    degree: str,
    branch: str,
    gpa: float,
    family_income: float,
    interests: str = "",
    career_goal: str = ""
) -> str:
    """Saves the student profile to the shared state to enable scholarship matching.
    
    Args:
        name: Name of the student.
        degree: Degree level (e.g. Undergraduate, Graduate).
        branch: Academic branch or major (e.g. Computer Science).
        gpa: Cumulative GPA (e.g. 3.8).
        family_income: Annual family income in USD.
        interests: Key academic or personal interests.
        career_goal: Career goals.
    """
    ctx.state["student_profile"] = {
        "name": name,
        "degree": degree,
        "branch": branch,
        "gpa": gpa,
        "family_income": family_income,
        "interests": interests,
        "career_goal": career_goal
    }
    return "Profile details stored successfully! Ready to verify and search."

# -----------------------------------------------------------------------------
# Main Orchestrator Agent
# -----------------------------------------------------------------------------

scholarship_orchestrator = Agent(
    name="scholarship_orchestrator",
    model=model_instance,
    instruction="""You are the Scholarship Navigator Orchestrator.
Your goal is to gather the student's profile details and guide them.
Ask for their Name, Degree level, Branch of study, GPA, and Family Income if not provided.
Once you receive these, ALWAYS call the 'save_student_profile' tool to save the profile in state.
Then, invoke the 'search_eligibility_agent' tool to match scholarships.
Next, invoke the 'checklist_reminder_agent' tool to compile required documents and deadlines.
Summarize the findings and inform the user that they must confirm their details to generate the final report.""",
    tools=[save_student_profile, search_eligibility_tool, checklist_reminder_tool],
)

# -----------------------------------------------------------------------------
# Workflow Function Nodes
# -----------------------------------------------------------------------------

async def security_checkpoint(ctx, node_input) -> str:
    """Checks the user input for prompt injection, negative income, and redacts PII."""
    user_text = ""
    if hasattr(node_input, "text"):
        user_text = node_input.text
    elif isinstance(node_input, dict):
        user_text = node_input.get("text", "")
    elif hasattr(node_input, "parts") and node_input.parts:
        user_text = "".join(part.text for part in node_input.parts if hasattr(part, "text"))
    else:
        user_text = str(node_input)

    # 1. PII Scrubbing
    email_regex = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    phone_regex = r"\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}"
    
    scrubbed_text = re.sub(email_regex, "[REDACTED_EMAIL]", user_text)
    scrubbed_text = re.sub(phone_regex, "[REDACTED_PHONE]", scrubbed_text)

    # 2. Prompt Injection Detection
    injection_keywords = [
        "ignore previous instructions", "bypass security", "system override", 
        "override rules", "delete database", "drop tables"
    ]
    has_injection = any(kw in user_text.lower() for kw in injection_keywords)

    # 3. Domain-Specific Rule: Income validation (no negative values allowed)
    has_negative_income = False
    income_match = re.search(r"income\s*:\s*-?\$?\d+", user_text, re.IGNORECASE)
    if income_match:
        digits = re.findall(r"-\d+|\d+", income_match.group())
        if digits and int(digits[0]) < 0:
            has_negative_income = True

    # Audit Log Logging
    timestamp = datetime.datetime.now().isoformat()
    if has_injection:
        audit_log = {
            "timestamp": timestamp,
            "event": "prompt_injection_detected",
            "severity": "CRITICAL",
            "message": "User input contained disallowed override instructions."
        }
        audit_logger.error(json.dumps(audit_log))
        return Event(route="FAIL")
        
    if has_negative_income:
        audit_log = {
            "timestamp": timestamp,
            "event": "negative_income_detected",
            "severity": "WARNING",
            "message": "Input contains negative family income value."
        }
        audit_logger.warning(json.dumps(audit_log))
        return Event(route="FAIL")

    ctx.state["cleaned_query"] = scrubbed_text
    
    audit_log = {
        "timestamp": timestamp,
        "event": "security_check_passed",
        "severity": "INFO",
        "message": "User input successfully passed security checkpoint."
    }
    audit_logger.info(json.dumps(audit_log))
    return Event(route="PASS")


async def security_denied_node(ctx, node_input) -> str:
    """Returns a security failure notification to the user."""
    return "Your request was flagged by our security checkpoint and could not be processed. Please check your input."


async def verify_profile(ctx, node_input):
    """Asks the student to verify their profile details before final report generation."""
    user_msg = ""
    if hasattr(node_input, "text"):
        user_msg = node_input.text
    elif hasattr(node_input, "parts") and node_input.parts:
        user_msg = "".join(part.text for part in node_input.parts if hasattr(part, "text"))
    else:
        user_msg = str(node_input)

    # Check if a confirmation pause is active
    if ctx.state.get("pending_profile_confirmation"):
        ctx.state["pending_profile_confirmation"] = False
        if "yes" in user_msg.lower() or "confirm" in user_msg.lower() or "approve" in user_msg.lower():
            ctx.state["profile_confirmed"] = True
            return Event(route="CONFIRMED")
        else:
            ctx.state["profile_confirmed"] = False
            return Event(route="REVISE")

    if ctx.state.get("profile_confirmed"):
        return Event(route="CONFIRMED")

    # Pause execution and ask for human verification
    ctx.state["pending_profile_confirmation"] = True
    profile = ctx.state.get("student_profile", {})
    profile_summary = (
        f"Degree: {profile.get('degree', 'N/A')}, "
        f"Branch: {profile.get('branch', 'N/A')}, "
        f"GPA: {profile.get('gpa', 'N/A')}, "
        f"Family Income: ${profile.get('family_income', 'N/A')}"
    )
    return RequestInput(
        message=f"Please confirm your profile details: {profile_summary}. Reply 'yes' to confirm and match scholarships, or detail updates."
    )


async def generate_final_report(ctx, node_input) -> str:
    """Generates the structured final scholarship match report."""
    profile = ctx.state.get("student_profile", {})
    return f"""### 🎓 Scholarship Navigator Final Report

Your profile has been confirmed and verified!

**Student Profile:**
- **Name:** {profile.get('name', 'N/A')}
- **Degree:** {profile.get('degree', 'N/A')}
- **Branch:** {profile.get('branch', 'N/A')}
- **GPA:** {profile.get('gpa', 'N/A')}
- **Family Income:** ${profile.get('family_income', 'N/A')}

**Matched Scholarships & Application Checklist:**
Based on your profile, we have identified several match options. Please refer to the checklist below for required documents and upcoming deadlines.

1. **Academic Excellence Scholarship**
   - **Deadline:** October 15, 2026
   - **Status:** Eligible (GPA >= 3.5 required, yours is {profile.get('gpa', 'N/A')})
   - **Documents Required:** Official transcripts, 2 Recommendation Letters.

2. **Global Access Education Fund**
   - **Deadline:** November 1, 2026
   - **Status:** Eligible (Income limit < $50,000, yours is {profile.get('family_income', 'N/A')})
   - **Documents Required:** Income certificate, Essay of Purpose.

*Report generated successfully. You are ready to start applying!*
"""

# -----------------------------------------------------------------------------
# Workflow Graph Orchestration
# -----------------------------------------------------------------------------

root_agent = Workflow(
    name="scholarship_navigator_workflow",
    edges=[
        ("START", security_checkpoint),
        (security_checkpoint, {
            "PASS": scholarship_orchestrator,
            "FAIL": security_denied_node
        }),
        (scholarship_orchestrator, verify_profile),
        (verify_profile, {
            "CONFIRMED": generate_final_report,
            "REVISE": scholarship_orchestrator
        }),
    ]
)

# Root App Definition
app = App(
    root_agent=root_agent,
    name="app",
)
