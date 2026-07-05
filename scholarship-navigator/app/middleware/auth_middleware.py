from fastapi import Header, HTTPException, Depends, status
from typing import Optional
from app.auth.security import decode_access_token
from app.services.user_service import get_user_profile

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """FastAPI Dependency to retrieve and authenticate the current session user via Bearer JWT."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please sign in."
        )
        
    try:
        token_type, token = authorization.split(" ")
        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header scheme. Must use Bearer token."
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: 'Bearer <token>'"
        )
        
    payload = decode_access_token(token)
    if not payload or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your authentication session has expired or is invalid. Please sign in again."
        )
        
    user = get_user_profile(payload["email"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account corresponding to this session was not found."
        )
        
    return user
