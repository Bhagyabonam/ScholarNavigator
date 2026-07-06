import logging
from contextlib import aclosing
from typing import Optional
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google.genai import types
from google.adk.runners import Runner
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scholarship", tags=["Scholarship Chat"])

class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None
    user_id: Optional[str] = None
    sessionId: Optional[str] = None
    session_id: Optional[str] = None

@router.post("/chat")
async def scholarship_chat(req: ChatRequest, request: Request):
    user_id = req.userId or req.user_id
    session_id = req.sessionId or req.session_id
    
    if not user_id:
        user_id = "default_user"
    if not session_id:
        session_id = "default_session"

    logger.info(f"Received scholarship chat query. user_id={user_id}, session_id={session_id}")

    try:
        new_message = types.Content(
            role="user",
            parts=[types.Part.from_text(text=req.message)]
        )

        runner = getattr(request.app.state, "runner", None)
        if not runner:
            from app.agent import app as adk_app
            from app.app_utils import services
            runner = Runner(
                app=adk_app,
                session_service=services.get_session_service(),
                artifact_service=services.get_artifact_service(),
                auto_create_session=True,
            )

        response_text = None
        model_texts = []
        async with aclosing(
            runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=new_message,
            )
        ) as agen:
            async for event in agen:
                print("EVENT:", event)
                # Capture the final output from final_output node if available
                if event.node_info and event.node_info.name == "final_output" and event.output is not None:
                    response_text = str(event.output)
                # If there's an adk_request_input function call (HITL pause)
                elif event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.function_call and part.function_call.name == "adk_request_input":
                            if part.function_call.args and "message" in part.function_call.args:
                                response_text = str(part.function_call.args["message"])
                # Fallback to model text parts
                if event.content and event.content.parts and event.author != "user":
                    for part in event.content.parts:
                        if part.text:
                            model_texts.append(part.text)

        # Fallback to session state check
        if not response_text:
            session = await runner.session_service.get_session(
                app_name=runner.app_name,
                user_id=user_id,
                session_id=session_id,
            )
            if session:
                response_text = session.state.get("final_response") or session.state.get("orchestrator_response")

        # Fallback to accumulated model text
        if not response_text and model_texts:
            response_text = "".join(model_texts).strip()

        if not response_text:
            response_text = "No response generated."

        return {
            "success": True,
            "response": response_text,
            "session_id": session_id
        }

    # except Exception as e:
    #     logger.error(f"Error executing agent workflow: {e}", exc_info=True)
    #     return JSONResponse(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         content={
    #             "success": False,
    #             "error": str(e)
    #         }
    #     )
    

    except Exception as e:
        traceback.print_exc()
        logger.exception("Chat route crashed")

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": str(e)
            }
        )
