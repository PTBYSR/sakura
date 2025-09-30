# storage.py
from pymongo import MongoClient
from datetime import datetime
import uuid

class ChatStorage:
    def __init__(self, uri, db_name="sakura"):
        print(f"✅ Connected to DB: {db_name}, URI: {uri}")
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.users = self.db["users"]
        self.chats = self.db["chats"]

    # --- Users ---
    def get_or_create_user(self, email, name=None):
        user = self.users.find_one({"email": email})
        if not user:
            user = {
                "email": email,
                "name": name,
                "last_seen": datetime.utcnow(),
                "total_visits": 1
            }
            self.users.insert_one(user)
        else:
            self.users.update_one(
                {"email": email},
                {"$set": {"last_seen": datetime.utcnow()},
                 "$inc": {"total_visits": 1}}
            )
        return self.users.find_one({"email": email})

    # --- Chats ---
    def start_chat(self, user_id):
        chat_id = str(uuid.uuid4())
        self.chats.insert_one({
            "chat_id": chat_id,
            "user_id": user_id,
            "session": {
                "start_time": datetime.utcnow(),
                "end_time": None,
                "duration": None
            },
            "messages": []
        })
        print(f"💾 Inserting chat: {chat_id}")
        return chat_id

    def add_message(self, chat_id, role, text):
        print(f"💾 Adding message to {chat_id}: [{role}] {text}")
        self.chats.update_one(
            {"chat_id": chat_id},
            {"$push": {"messages": {
                "role": role,
                "text": text,
                "timestamp": datetime.utcnow()
            }}}
        )

       
    def end_chat(self, chat_id):
        chat = self.chats.find_one({"chat_id": chat_id})
        if chat and chat["session"]["end_time"] is None:
            end_time = datetime.utcnow()
            duration = (end_time - chat["session"]["start_time"]).seconds
            self.chats.update_one(
                {"chat_id": chat_id},
                {"$set": {
                    "session.end_time": end_time,
                    "session.duration": duration
                }}
            )
