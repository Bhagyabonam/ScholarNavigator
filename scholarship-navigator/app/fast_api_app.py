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

import contextlib
import os
from collections.abc import AsyncIterator

import google.auth
from a2a.server.tasks import InMemoryTaskStore
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.runners import Runner
from google.cloud import logging as google_cloud_logging

from app.app_utils import services
from app.app_utils.a2a import attach_a2a_routes
from app.app_utils.reasoning_engine_adapter import (
    attach_reasoning_engine_routes,
)
from app.app_utils.telemetry import (
    setup_agent_engine_telemetry,
    setup_telemetry,
)
from app.app_utils.typing import Feedback

load_dotenv()
setup_telemetry()
# Must run before get_fast_api_app to set the tracer provider resource.
setup_agent_engine_telemetry()
# Setup logging client (fallback to python native logger if GCP credentials are not present)
gcp_logging_enabled = False
try:
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "false").lower() in ("true", "1"):
        _, project_id = google.auth.default()
        logging_client = google_cloud_logging.Client()
        logger = logging_client.logger(__name__)
        gcp_logging_enabled = True
except Exception as e:
    import logging as local_logging
    local_logging.warning(f"Could not connect to Google Cloud Logging: {e}. Using local console fallback.")

if not gcp_logging_enabled:
    import logging as local_logging
    class LocalFallbackLogger:
        def log_struct(self, data, severity="INFO"):
            local_logging.info(f"[{severity}] Struct Log: {data}")
        def info(self, msg):
            local_logging.info(msg)
        def warning(self, msg):
            local_logging.warning(msg)
        def error(self, msg):
            local_logging.error(msg)
    logger = LocalFallbackLogger()

allow_origins = (
    os.getenv("ALLOW_ORIGINS", "").split(",") if os.getenv("ALLOW_ORIGINS") else None
)

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Runner for the A2A path, sharing the same session/artifact services as the
    # adk_api and reasoning_engine paths (see services.py). Imported here so the
    # agent is built after env/telemetry setup.
    from app.agent import app as adk_app
    from app.agent import root_agent

    runner = Runner(
        app=adk_app,
        session_service=services.get_session_service(),
        artifact_service=services.get_artifact_service(),
        auto_create_session=True,
    )
    # Shared by the A2A path and the reasoning_engine adapter routes.
    app.state.runner = runner
    app.state.agent_app_name = adk_app.name
    await attach_a2a_routes(
        app,
        agent=root_agent,
        runner=runner,
        task_store=InMemoryTaskStore(),
        rpc_path=f"/a2a/{adk_app.name}",
    )
    # Initialize and seed MongoDB Atlas database
    from app.database.connection import init_db
    from app.services.db_services import seed_default_scholarships
    try:
        init_db()
        seed_default_scholarships()
    except Exception as e:
        logger.error(f"Error initializing MongoDB Atlas database: {e}")
    yield


app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    artifact_service_uri=services.ARTIFACT_SERVICE_URI,
    allow_origins=allow_origins,
    session_service_uri=services.SESSION_SERVICE_URI,
    otel_to_cloud=False,
    lifespan=lifespan,
)
app.title = "scholarship-navigator"
app.description = "API for interacting with the Agent scholarship-navigator"

# Enable CORS for frontend integration
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy routes so the Vertex AI Console Playground (reasoning_engine SDK) can
# talk to this agent alongside the native adk_api routes.
attach_reasoning_engine_routes(app)

# Include MongoDB Atlas CRUD routing
from app.routes.scholarship_routes import router as mongodb_router
app.include_router(mongodb_router)

# Include Authentication routing
from app.routes.auth_routes import router as auth_router
app.include_router(auth_router)


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback."""
    logger.log_struct(feedback.model_dump(), severity="INFO")
    return {"status": "success"}


# -----------------------------------------------------------------------------
# Custom Frontend API and HTML Delivery Routes
# -----------------------------------------------------------------------------
from fastapi.responses import HTMLResponse, JSONResponse
from google.genai import types
import json

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    static_file_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    if os.path.exists(static_file_path):
        with open(static_file_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Scholarship Navigator Frontend Not Found</h1>"


@app.post("/api/scholarship/match")
async def match_scholarship_api(profile: dict, request: Request):
    """API endpoint to initialize session, save profile, and trigger agent workflow."""
    runner = request.app.state.runner
    user_id = "web_user"
    
    # Create a fresh agent session
    session = await runner.session_service.create_session(
        user_id=user_id, 
        app_name=request.app.state.agent_app_name
    )
    
    # Pre-populate state with the profile so the functions have it
    session.state["student_profile"] = profile
    await runner.session_service.update_session(session)
    
    # Trigger matching query to orchestrator
    message = types.Content(
        role="user",
        parts=[types.Part.from_text(
            text=f"Please match scholarships for {profile.get('name')}. "
                 f"Profile: Degree={profile.get('degree')}, Branch={profile.get('branch')}, "
                 f"GPA={profile.get('gpa')}, Income={profile.get('family_income')}."
        )]
    )
    
    response_text = ""
    async for event in runner.run(
        new_message=message,
        user_id=user_id,
        session_id=session.id,
    ):
        if event.content and event.content.parts:
            response_text += "".join(part.text for part in event.content.parts if part.text)
            
    # Retrieve updated state
    updated_session = await runner.session_service.get_session(session.id)
    
    return JSONResponse({
        "session_id": session.id,
        "response": response_text,
        "state": updated_session.state
    })


@app.post("/api/scholarship/confirm")
async def confirm_scholarship_api(data: dict, request: Request):
    """API endpoint to confirm profile details and resume the workflow to get the final report."""
    runner = request.app.state.runner
    session_id = data.get("session_id")
    confirm_msg = data.get("confirm_msg", "yes")
    user_id = "web_user"
    
    message = types.Content(
        role="user",
        parts=[types.Part.from_text(text=confirm_msg)]
    )
    
    response_text = ""
    async for event in runner.run(
        new_message=message,
        user_id=user_id,
        session_id=session_id,
    ):
        if event.content and event.content.parts:
            response_text += "".join(part.text for part in event.content.parts if part.text)
            
    updated_session = await runner.session_service.get_session(session_id)
    
    return JSONResponse({
        "response": response_text,
        "state": updated_session.state
    })


@app.post("/api/scholarship/chat")
async def chat_scholarship_api(data: dict, request: Request):
    """API endpoint to send a message to a session and get the response."""
    runner = request.app.state.runner
    session_id = data.get("session_id")
    user_msg = data.get("message")
    user_id = "web_user"
    
    # If no session_id is provided, create one
    if not session_id:
        session = await runner.session_service.create_session(
            user_id=user_id, 
            app_name=request.app.state.agent_app_name
        )
        session_id = session.id
        
    message = types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_msg)]
    )
    
    response_text = ""
    async for event in runner.run(
        new_message=message,
        user_id=user_id,
        session_id=session_id,
    ):
        if event.content and event.content.parts:
            response_text += "".join(part.text for part in event.content.parts if part.text)
            
    updated_session = await runner.session_service.get_session(session_id)
    
    return JSONResponse({
        "session_id": session_id,
        "response": response_text,
        "state": updated_session.state
    })


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

