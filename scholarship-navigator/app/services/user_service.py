from datetime import datetime
from typing import Optional, Dict, Any
from app.database.connection import get_db
from app.auth.security import hash_password, verify_password

def register_new_user(user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Register a new student account. Returns None if the email is already in use."""
    db = get_db()
    email_clean = user_data["email"].strip().lower()
    
    # Check if duplicate exists
    existing = db["users"].find_one({"email": email_clean})
    if existing:
        return None
        
    user_copy = user_data.copy()
    user_copy["email"] = email_clean
    user_copy["password"] = hash_password(user_copy["password"])
    user_copy["createdAt"] = datetime.utcnow()
    user_copy["updatedAt"] = datetime.utcnow()
    
    result = db["users"].insert_one(user_copy)
    user_copy["_id"] = result.inserted_id
    
    # Remove password before returning
    if "password" in user_copy:
        del user_copy["password"]
    return user_copy

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Verify login credentials. Returns user dict on success, None on failure."""
    db = get_db()
    email_clean = email.strip().lower()
    user = db["users"].find_one({"email": email_clean})
    if not user:
        return None
        
    if verify_password(password, user["password"]):
        user_copy = user.copy()
        if "password" in user_copy:
            del user_copy["password"]
        return user_copy
    return None

def get_user_profile(email: str) -> Optional[Dict[str, Any]]:
    """Fetch user profile metadata without exposing hashed password secrets."""
    db = get_db()
    email_clean = email.strip().lower()
    user = db["users"].find_one({"email": email_clean})
    if user:
        user_copy = user.copy()
        if "password" in user_copy:
            del user_copy["password"]
        return user_copy
    return None

def update_user_profile(email: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update user profile metadata."""
    db = get_db()
    email_clean = email.strip().lower()
    
    # Filter out fields that shouldn't be updated directly or require special logic (like password)
    filtered_updates = {k: v for k, v in updates.items() if k not in ["_id", "email", "password", "createdAt"]}
    filtered_updates["updatedAt"] = datetime.utcnow()
    
    db["users"].update_one({"email": email_clean}, {"$set": filtered_updates})
    return get_user_profile(email_clean)
