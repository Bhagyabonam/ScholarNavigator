from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserSignUp(BaseModel):
    fullName: str
    email: str
    password: str
    phoneNumber: Optional[str] = None
    degree: str
    branch: str
    year: str
    cgpa: float
    familyIncome: float
    country: str
    state: str
    category: Optional[str] = None
    gender: Optional[str] = None
    interests: str

class UserSignIn(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
