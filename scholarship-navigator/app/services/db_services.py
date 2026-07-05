from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional, List, Dict, Any
from app.database.connection import get_db

# ============================================================================
# Utilities
# ============================================================================
def to_object_id(id_str: str) -> Optional[ObjectId]:
    """Safely convert a string representation of ID to BSON ObjectId."""
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None

# ============================================================================
# Seeding Database
# ============================================================================
def seed_default_scholarships():
    """Seed the database with default scholarships if empty."""
    db = get_db()
    if db["scholarships"].count_documents({}) == 0:
        default_scholarships = [
            {
                "_id": ObjectId("64bf71e1140026e1e81f1811"),
                "title": "Google Women Techmakers Scholarship",
                "organization": "Google LLC",
                "amount": "₹1,50,000",
                "deadline": "2026-09-30",
                "eligibility": "GPA >= 3.5, CS/IT female student, Income <= ₹12,00,000",
                "description": "Supports women pursuing computer science degrees globally to become active leaders in technology.",
                "applicationLink": "https://buildyourfuture.withgoogle.com/scholarships/women-techmakers-scholarship",
                "createdAt": datetime.utcnow()
            },
            {
                "_id": ObjectId("64bf71e1140026e1e81f1812"),
                "title": "Tata Trust Scholarship for Higher Education",
                "organization": "Tata Trust Foundation",
                "amount": "₹80,000",
                "deadline": "2026-10-15",
                "eligibility": "GPA >= 3.0, Any discipline, Income <= ₹6,00,000",
                "description": "Awarded to undergraduate students with outstanding academic records who are facing financial hardship.",
                "applicationLink": "https://www.tatatrusts.org/our-work/individual-grants/education",
                "createdAt": datetime.utcnow()
            },
            {
                "_id": ObjectId("64bf71e1140026e1e81f1813"),
                "title": "National Merit Fellowship Scheme",
                "organization": "Government of India",
                "amount": "₹2,00,000",
                "deadline": "2026-11-20",
                "eligibility": "GPA >= 3.7, STEM domains, Income <= ₹8,00,000",
                "description": "National support for students pursuing graduate programs in scientific and research domains.",
                "applicationLink": "https://scholarships.gov.in",
                "createdAt": datetime.utcnow()
            },
            {
                "_id": ObjectId("64bf71e1140026e1e81f1814"),
                "title": "Global Access Education Fund",
                "organization": "Access Alliance",
                "amount": "₹1,20,000",
                "deadline": "2026-11-01",
                "eligibility": "GPA >= 3.0, Any discipline, Income <= ₹4,50,000",
                "description": "Supports low-income undergraduate students to achieve their higher education aspirations.",
                "applicationLink": "https://globalaccessfund.org",
                "createdAt": datetime.utcnow()
            },
            {
                "_id": ObjectId("64bf71e1140026e1e81f1815"),
                "title": "Microsoft Research Fellowship",
                "organization": "Microsoft Corp",
                "amount": "₹2,50,000",
                "deadline": "2026-12-15",
                "eligibility": "GPA >= 3.8, CS/Engineering Graduate, Income <= ₹15,00,000",
                "description": "Grant supporting advanced graduate work in machine learning and computer systems research.",
                "applicationLink": "https://microsoft.com/research/academic-programs",
                "createdAt": datetime.utcnow()
            }
        ]
        db["scholarships"].insert_many(default_scholarships)
        print("Seeded default scholarships database successfully.")

# ============================================================================
# Users Service
# ============================================================================
def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    user_copy = user_data.copy()
    user_copy["createdAt"] = datetime.utcnow()
    # Check if already exists by email to prevent duplicate onboarding
    existing = db["users"].find_one({"email": user_copy["email"]})
    if existing:
        db["users"].update_one({"email": user_copy["email"]}, {"$set": user_copy})
        return db["users"].find_one({"email": user_copy["email"]})
    
    result = db["users"].insert_one(user_copy)
    user_copy["_id"] = result.inserted_id
    return user_copy

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    return db["users"].find_one({"email": email})

def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(user_id)
    if not oid:
        return None
    return db["users"].find_one({"_id": oid})

def update_user(email: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = get_db()
    db["users"].update_one({"email": email}, {"$set": user_data})
    return db["users"].find_one({"email": email})

def list_users() -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["users"].find({}))

# ============================================================================
# Scholarships Service
# ============================================================================
def create_scholarship(sch_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    sch_copy = sch_data.copy()
    sch_copy["createdAt"] = datetime.utcnow()
    result = db["scholarships"].insert_one(sch_copy)
    sch_copy["_id"] = result.inserted_id
    return sch_copy

def get_scholarship(sch_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(sch_id)
    if not oid:
        return None
    return db["scholarships"].find_one({"_id": oid})

def list_scholarships() -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["scholarships"].find({}))

def delete_scholarship(sch_id: str) -> bool:
    db = get_db()
    oid = to_object_id(sch_id)
    if not oid:
        return False
    res = db["scholarships"].delete_one({"_id": oid})
    return res.deleted_count > 0

# ============================================================================
# Applications Service
# ============================================================================
def create_application(app_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    app_copy = app_data.copy()
    app_copy["createdAt"] = datetime.utcnow()
    app_copy["updatedAt"] = datetime.utcnow()
    
    # Check if user already has an application for this scholarship
    existing = db["applications"].find_one({
        "userId": app_copy["userId"],
        "scholarshipId": app_copy["scholarshipId"]
    })
    if existing:
        return existing
        
    result = db["applications"].insert_one(app_copy)
    app_copy["_id"] = result.inserted_id
    return app_copy

def get_application(app_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(app_id)
    if not oid:
        return None
    return db["applications"].find_one({"_id": oid})

def list_applications(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    query = {}
    if user_id:
        query["userId"] = user_id
    return list(db["applications"].find(query))

def update_application_status(app_id: str, status: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(app_id)
    if not oid:
        return None
    db["applications"].update_one(
        {"_id": oid},
        {"$set": {"status": status, "updatedAt": datetime.utcnow()}}
    )
    return db["applications"].find_one({"_id": oid})

def update_application_progress(app_id: str, doc_count: int, total_docs: int) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(app_id)
    if not oid:
        return None
    progress = int((doc_count / (total_docs or 1)) * 100)
    db["applications"].update_one(
        {"_id": oid},
        {"$set": {
            "progress": progress,
            "documentsUploaded": doc_count,
            "totalDocuments": total_docs,
            "updatedAt": datetime.utcnow()
        }}
    )
    return db["applications"].find_one({"_id": oid})

def delete_application(app_id: str) -> bool:
    db = get_db()
    oid = to_object_id(app_id)
    if not oid:
        return False
    res = db["applications"].delete_one({"_id": oid})
    return res.deleted_count > 0

# ============================================================================
# Documents Service
# ============================================================================
def create_document(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    doc_copy = doc_data.copy()
    doc_copy["uploadedAt"] = datetime.utcnow()
    
    # Check if document already exists for this application
    existing = db["documents"].find_one({
        "applicationId": doc_copy["applicationId"],
        "documentName": doc_copy["documentName"]
    })
    if existing:
        db["documents"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"uploaded": doc_copy["uploaded"], "fileUrl": doc_copy.get("fileUrl"), "uploadedAt": datetime.utcnow()}}
        )
        return db["documents"].find_one({"_id": existing["_id"]})
        
    result = db["documents"].insert_one(doc_copy)
    doc_copy["_id"] = result.inserted_id
    return doc_copy

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(doc_id)
    if not oid:
        return None
    return db["documents"].find_one({"_id": oid})

def list_documents(application_id: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    query = {}
    if application_id:
        query["applicationId"] = application_id
    return list(db["documents"].find(query))

def update_document_status(doc_id: str, uploaded: bool, file_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(doc_id)
    if not oid:
        return None
    update_data = {"uploaded": uploaded, "uploadedAt": datetime.utcnow()}
    if file_url is not None:
        update_data["fileUrl"] = file_url
    db["documents"].update_one({"_id": oid}, {"$set": update_data})
    return db["documents"].find_one({"_id": oid})

def delete_document(doc_id: str) -> bool:
    db = get_db()
    oid = to_object_id(doc_id)
    if not oid:
        return False
    res = db["documents"].delete_one({"_id": oid})
    return res.deleted_count > 0

# ============================================================================
# Saved Scholarships Service
# ============================================================================
def save_scholarship(user_id: str, sch_id: str) -> Dict[str, Any]:
    db = get_db()
    existing = db["savedScholarships"].find_one({
        "userId": user_id,
        "scholarshipId": sch_id
    })
    if existing:
        return existing
    doc = {
        "userId": user_id,
        "scholarshipId": sch_id,
        "savedAt": datetime.utcnow()
    }
    result = db["savedScholarships"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc

def unsave_scholarship(user_id: str, sch_id: str) -> bool:
    db = get_db()
    res = db["savedScholarships"].delete_one({
        "userId": user_id,
        "scholarshipId": sch_id
    })
    return res.deleted_count > 0

def list_saved_scholarships(user_id: str) -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["savedScholarships"].find({"userId": user_id}))

# ============================================================================
# AI Recommendations Service
# ============================================================================
def create_recommendation(rec_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    rec_copy = rec_data.copy()
    rec_copy["generatedAt"] = datetime.utcnow()
    result = db["ai_recommendations"].insert_one(rec_copy)
    rec_copy["_id"] = result.inserted_id
    return rec_copy

def get_recommendations_by_application(app_id: str) -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["ai_recommendations"].find({"applicationId": app_id}))

def list_recommendations() -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["ai_recommendations"].find({}))

# ============================================================================
# Notifications Service
# ============================================================================
def create_notification(notif_data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    notif_copy = notif_data.copy()
    notif_copy["createdAt"] = datetime.utcnow()
    result = db["notifications"].insert_one(notif_copy)
    notif_copy["_id"] = result.inserted_id
    return notif_copy

def mark_notification_as_read(notif_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    oid = to_object_id(notif_id)
    if not oid:
        return None
    db["notifications"].update_one({"_id": oid}, {"$set": {"isRead": True}})
    return db["notifications"].find_one({"_id": oid})

def list_notifications(user_id: str) -> List[Dict[str, Any]]:
    db = get_db()
    return list(db["notifications"].find({"userId": user_id}))
