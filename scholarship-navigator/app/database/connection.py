import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Read environment variables
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "scholarship_navigator")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI or MONGODB_URL must be configured in your environment or .env file.")

# Singleton Client instance
_client = None

def get_mongo_client():
    global _client
    if _client is None:
        try:
            _client = MongoClient(MONGODB_URI)
            # Ping to verify connection
            _client.admin.command('ping')
            print("Successfully connected and pinged MongoDB Atlas Cluster.")
        except ConnectionFailure as e:
            print(f"Could not connect to MongoDB Atlas: {e}")
            raise e
    return _client

def get_db():
    client = get_mongo_client()
    return client[DATABASE_NAME]

def init_db():
    db = get_db()
    required_collections = [
        "users",
        "scholarships",
        "applications",
        "documents",
        "savedScholarships",
        "ai_recommendations",
        "notifications"
    ]
    existing_collections = db.list_collection_names()
    for col in required_collections:
        if col not in existing_collections:
            db.create_collection(col)
            print(f"Created collection: {col}")
