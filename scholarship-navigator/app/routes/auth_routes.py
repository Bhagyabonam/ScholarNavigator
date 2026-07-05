from fastapi import APIRouter, HTTPException, status, Depends
from app.models.auth_schemas import UserSignUp, UserSignIn, TokenResponse
from app.models.schemas import serialize_doc
from app.services import user_service
from app.auth.security import create_access_token
from app.middleware.auth_middleware import get_current_user
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["User Authentication"])

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
def sign_up_user(payload: UserSignUp):
    """Sign up a new student account using MongoDB Atlas."""
    user_dict = payload.model_dump()
    created_user = user_service.register_new_user(user_dict)
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email is already registered."
        )
    return serialize_doc(created_user)

@router.post("/signin", response_model=TokenResponse)
def sign_in_user(payload: UserSignIn):
    """Authenticate a student user, generate a secure JWT access token."""
    user = user_service.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
    
    # Generate Access Token
    access_token_expires = timedelta(days=7)
    access_token = create_access_token(
        data={"email": user["email"], "name": user["fullName"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_doc(user)
    }

@router.post("/social", response_model=TokenResponse)
def social_login_user(payload: dict):
    """Authenticate via mock OAuth (Google/Microsoft), dynamically registers or recovers from Atlas."""
    from app.database.connection import get_db
    from datetime import datetime
    
    email = payload.get("email", "bhagyasribonam@gmail.com").strip().lower()
    name = payload.get("name", "Bhagya Sri Lakshmi")
    
    db = get_db()
    user = db["users"].find_one({"email": email})
    if not user:
        # Create a new user profile automatically for the social login
        new_user = {
            "fullName": name,
            "email": email,
            "password": "$2b$12$MockHashedPasswordPlaceholderSinceSocialLoginsDoNotVerifyCredentialsDirectly",
            "phoneNumber": "+917993319941",
            "degree": "Undergraduate",
            "branch": "Computer Science",
            "year": "3rd Year",
            "cgpa": 8.5,
            "familyIncome": 450000.0,
            "country": "India",
            "state": "Telangana",
            "interests": "Machine Learning",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        db["users"].insert_one(new_user)
        user = db["users"].find_one({"email": email})
        
    access_token_expires = timedelta(days=7)
    access_token = create_access_token(
        data={"email": user["email"], "name": user["fullName"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_doc(user)
    }

@router.get("/me", response_model=dict)
def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current logged-in user profile from session context."""
    return serialize_doc(current_user)
