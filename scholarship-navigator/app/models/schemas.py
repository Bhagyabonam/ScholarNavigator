from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ============================================================================
# Serialization Helpers for MongoDB BSON ObjectId conversion
# ============================================================================
def serialize_doc(doc) -> dict:
    """Helper to convert MongoDB BSON document to serializable dict."""
    if doc is None:
        return {}
    doc_copy = doc.copy()
    if "_id" in doc_copy:
        doc_copy["_id"] = str(doc_copy["_id"])
    # Convert other ObjectIds in standard fields if necessary
    for field in ["userId", "scholarshipId", "applicationId"]:
        if field in doc_copy and doc_copy[field] is not None:
            doc_copy[field] = str(doc_copy[field])
    return doc_copy

def serialize_list(docs) -> list:
    """Helper to convert MongoDB cursor results to serializable list."""
    return [serialize_doc(d) for d in docs]

# ============================================================================
# Pydantic Schemas
# ============================================================================
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    dob: Optional[str] = None
    degree: str
    branch: str
    year: str
    college: Optional[str] = None
    university: Optional[str] = None
    cgpa: float
    percentage: Optional[float] = None
    prevEducation: Optional[str] = None
    familyIncome: float
    category: str
    gender: Optional[str] = None
    interests: Optional[str] = None
    preferences: Optional[List[str]] = None
    bio: Optional[str] = None
    achievements: Optional[str] = None
    skills: Optional[str] = None
    projects: Optional[str] = None
    createdAt: Optional[datetime] = None

class UserSchema(UserBase):
    id: Optional[str] = Field(None, alias="_id")

class ScholarshipBase(BaseModel):
    title: str
    organization: str
    amount: str
    deadline: str
    eligibility: Optional[str] = None
    description: str
    applicationLink: Optional[str] = None
    createdAt: Optional[datetime] = None

class ScholarshipSchema(ScholarshipBase):
    id: Optional[str] = Field(None, alias="_id")

class ApplicationBase(BaseModel):
    userId: str
    scholarshipId: str
    status: str
    progress: int
    documentsUploaded: int
    totalDocuments: int
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class ApplicationSchema(ApplicationBase):
    id: Optional[str] = Field(None, alias="_id")

class DocumentBase(BaseModel):
    applicationId: str
    documentName: str
    uploaded: bool
    fileUrl: Optional[Optional[str]] = None
    uploadedAt: Optional[datetime] = None

class DocumentSchema(DocumentBase):
    id: Optional[str] = Field(None, alias="_id")

class SavedScholarshipBase(BaseModel):
    userId: str
    scholarshipId: str
    savedAt: Optional[datetime] = None

class SavedScholarshipSchema(SavedScholarshipBase):
    id: Optional[str] = Field(None, alias="_id")

class AIRecommendationBase(BaseModel):
    applicationId: str
    recommendation: str
    priority: str
    generatedAt: Optional[datetime] = None

class AIRecommendationSchema(AIRecommendationBase):
    id: Optional[str] = Field(None, alias="_id")

class NotificationBase(BaseModel):
    userId: str
    title: str
    message: str
    isRead: bool
    createdAt: Optional[datetime] = None

class NotificationSchema(NotificationBase):
    id: Optional[str] = Field(None, alias="_id")
