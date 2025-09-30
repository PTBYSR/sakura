from pymongo import MongoClient
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "sakura")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users = db["users"]

def get_or_create_user(email: str, name: str):
    user = users.find_one({"email": email})
    if not user:
        user = {"email": email, "name": name}
        users.insert_one(user)
    return user
