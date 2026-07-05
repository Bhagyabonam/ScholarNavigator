from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import List, Optional
from app.models.schemas import (
    UserBase, UserSchema, ScholarshipBase, ScholarshipSchema,
    ApplicationBase, ApplicationSchema, DocumentBase, DocumentSchema,
    SavedScholarshipBase, SavedScholarshipSchema, AIRecommendationBase, AIRecommendationSchema,
    NotificationBase, NotificationSchema, serialize_doc, serialize_list
)
from app.services import db_services
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api", tags=["MongoDB CRUD Operations"])

# ============================================================================
# Users Endpoints (Protected)
# ============================================================================
@router.post("/users", response_model=dict)
def upsert_user(user: UserBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_user(user.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving user: {e}")

@router.get("/users/{email}", response_model=dict)
def get_user_by_email(email: str, current_user: dict = Depends(get_current_user)):
    res = db_services.get_user_by_email(email)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(res)

@router.get("/users", response_model=List[dict])
def list_users(current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.list_users())

# ============================================================================
# Scholarships Endpoints
# ============================================================================
@router.post("/scholarships", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_scholarship(sch: ScholarshipBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_scholarship(sch.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving scholarship: {e}")

@router.get("/scholarships", response_model=List[dict])
def list_scholarships():
    return serialize_list(db_services.list_scholarships())

@router.get("/scholarships/{id}", response_model=dict)
def get_scholarship(id: str):
    res = db_services.get_scholarship(id)
    if not res:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return serialize_doc(res)

@router.delete("/scholarships/{id}")
def delete_scholarship(id: str, current_user: dict = Depends(get_current_user)):
    success = db_services.delete_scholarship(id)
    if not success:
        raise HTTPException(status_code=404, detail="Scholarship not found or invalid ID")
    return {"status": "success", "message": "Scholarship deleted successfully"}

# ============================================================================
# Applications Endpoints
# ============================================================================
@router.post("/applications", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_application(app: ApplicationBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_application(app.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating application: {e}")

@router.get("/applications", response_model=List[dict])
def list_applications(userId: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.list_applications(userId))

@router.get("/applications/{id}", response_model=dict)
def get_application(id: str, current_user: dict = Depends(get_current_user)):
    res = db_services.get_application(id)
    if not res:
        raise HTTPException(status_code=404, detail="Application not found")
    return serialize_doc(res)

@router.put("/applications/{id}/status", response_model=dict)
def update_application_status(id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing 'status' key in request payload")
    res = db_services.update_application_status(id, new_status)
    if not res:
        raise HTTPException(status_code=404, detail="Application not found or invalid ID")
    return serialize_doc(res)

@router.delete("/applications/{id}")
def delete_application(id: str, current_user: dict = Depends(get_current_user)):
    success = db_services.delete_application(id)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found or invalid ID")
    return {"status": "success", "message": "Application deleted successfully"}

# ============================================================================
# Documents Endpoints
# ============================================================================
@router.post("/documents", response_model=dict)
def create_document(doc: DocumentBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_document(doc.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving document: {e}")

@router.get("/documents", response_model=List[dict])
def list_documents(applicationId: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.list_documents(applicationId))

@router.put("/documents/{id}", response_model=dict)
def update_document(id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    uploaded = payload.get("uploaded", True)
    file_url = payload.get("fileUrl")
    res = db_services.update_document_status(id, uploaded, file_url)
    if not res:
        raise HTTPException(status_code=404, detail="Document not found or invalid ID")
    return serialize_doc(res)

@router.delete("/documents/{id}")
def delete_document(id: str, current_user: dict = Depends(get_current_user)):
    success = db_services.delete_document(id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or invalid ID")
    return {"status": "success", "message": "Document deleted successfully"}

# ============================================================================
# Saved Scholarships Endpoints
# ============================================================================
@router.post("/saved-scholarships", response_model=dict)
def save_scholarship(payload: dict, current_user: dict = Depends(get_current_user)):
    user_id = payload.get("userId")
    sch_id = payload.get("scholarshipId")
    if not user_id or not sch_id:
        raise HTTPException(status_code=400, detail="Missing 'userId' or 'scholarshipId' parameters")
    try:
        res = db_services.save_scholarship(user_id, sch_id)
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving scholarship match: {e}")

@router.delete("/saved-scholarships")
def unsave_scholarship(userId: str = Query(...), scholarshipId: str = Query(...), current_user: dict = Depends(get_current_user)):
    success = db_services.unsave_scholarship(userId, scholarshipId)
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found to delete")
    return {"status": "success", "message": "Scholarship removed from bookmarks"}

@router.get("/saved-scholarships/{userId}", response_model=List[dict])
def list_saved_scholarships(userId: str, current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.list_saved_scholarships(userId))

# ============================================================================
# AI Recommendations Endpoints
# ============================================================================
@router.post("/ai-recommendations", response_model=dict)
def create_recommendation(rec: AIRecommendationBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_recommendation(rec.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving AI recommendation: {e}")

@router.get("/ai-recommendations/{appId}", response_model=List[dict])
def get_recommendations_by_application(appId: str, current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.get_recommendations_by_application(appId))

# ============================================================================
# Notifications Endpoints
# ============================================================================
@router.post("/notifications", response_model=dict)
def create_notification(notif: NotificationBase, current_user: dict = Depends(get_current_user)):
    try:
        res = db_services.create_notification(notif.model_dump())
        return serialize_doc(res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating notification: {e}")

@router.get("/notifications/{userId}", response_model=List[dict])
def list_notifications(userId: str, current_user: dict = Depends(get_current_user)):
    return serialize_list(db_services.list_notifications(userId))

@router.put("/notifications/{id}/read", response_model=dict)
def mark_notification_as_read(id: str, current_user: dict = Depends(get_current_user)):
    res = db_services.mark_notification_as_read(id)
    if not res:
        raise HTTPException(status_code=404, detail="Notification not found or invalid ID")
    return serialize_doc(res)
