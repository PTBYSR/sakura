# storage.py
from pymongo import MongoClient
from datetime import datetime
from typing import Optional, Dict, Any
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
    



    def save_complete_user_data(self, user_data: Dict[str, Any]) -> bool:
        """
        Save or update complete user data from chatbot widget
        This method handles ALL user fields: ip, location, device, vibe, etc.
        """
        email = user_data.get("email")
        if not email:
            print("❌ No email provided in user_data")
            return False
        
        existing_user = self.users.find_one({"email": email})
        
        if existing_user:
            # Update existing user with all new data
            print(f"🔄 Updating existing user: {email}")
            update_data = {
                "name": user_data.get("name", existing_user.get("name", "Anonymous")),
                "last_seen": user_data.get("lastSeen", datetime.utcnow().isoformat()),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Add optional fields if provided
            if "ip" in user_data:
                update_data["ip"] = user_data["ip"]
            if "location" in user_data:
                update_data["location"] = user_data["location"]
            if "device" in user_data:
                update_data["device"] = user_data["device"]
            if "vibe" in user_data:
                update_data["vibe"] = user_data["vibe"]
            if "visitDuration" in user_data:
                update_data["visit_duration"] = user_data["visitDuration"]
            if "chatId" in user_data:
                update_data["chat_id"] = user_data["chatId"]
            if "totalVisits" in user_data:
                update_data["total_visits"] = user_data["totalVisits"]
            if "timestamp" in user_data:
                update_data["timestamp"] = user_data["timestamp"]
            
            result = self.users.update_one(
                {"email": email},
                {"$set": update_data}
            )
            print(f"✅ Updated user {email} - Matched: {result.matched_count}, Modified: {result.modified_count}")
            return True
        else:
            # Create new user with all provided data
            print(f"✨ Creating new user: {email}")
            new_user = {
                "email": email,
                "name": user_data.get("name", "Anonymous"),
                "created_at": user_data.get("timestamp", datetime.utcnow().isoformat()),
                "last_seen": user_data.get("lastSeen", datetime.utcnow().isoformat()),
                "total_visits": user_data.get("totalVisits", 1),
            }
            
            # Add optional fields if provided
            if "ip" in user_data:
                new_user["ip"] = user_data["ip"]
            if "location" in user_data:
                new_user["location"] = user_data["location"]
            if "device" in user_data:
                new_user["device"] = user_data["device"]
            if "vibe" in user_data:
                new_user["vibe"] = user_data["vibe"]
            if "visitDuration" in user_data:
                new_user["visit_duration"] = user_data["visitDuration"]
            if "chatId" in user_data:
                new_user["chat_id"] = user_data["chatId"]
            if "timestamp" in user_data:
                new_user["timestamp"] = user_data["timestamp"]
            
            self.users.insert_one(new_user)
            print(f"✅ Created new user: {email} with all fields")
            return True

    # --- Chats ---

    def get_chat(self, chat_id: str):
        """Return a chat document by ID or None"""
        return self.chats.find_one({"chat_id": chat_id})


    def update_state(self, chat_id, state_updates: dict):
        """Merge new values into the current state for this chat"""
        self.chats.update_one(
            {"chat_id": chat_id},
            {"$set": {f"state.{k}": v for k, v in state_updates.items()}}
        )

    def get_state(self, chat_id):
        chat = self.chats.find_one({"chat_id": chat_id}, {"state": 1})
        return chat.get("state", {}) if chat else {}


    def set_chat_state(self, chat_id, state: dict):
        self.chats.update_one(
            {"chat_id": chat_id},
            {"$set": {"state": state}}
        )

    def get_chat_state(self, chat_id):
        chat = self.chats.find_one({"chat_id": chat_id})
        return chat.get("state")

    def start_chat(self, user_id):
        chat_id = str(uuid.uuid4())
        self.chats.insert_one({
            "chat_id": chat_id,
            "user_id": user_id,
            "status": "open",  # ✅ important!
            "session": {
                "start_time": datetime.utcnow(),
                "end_time": None,
                "duration": None
            },
            "messages": []
        })
        print(f"💾 Inserting chat: {chat_id}")
        return chat_id

    def get_or_create_open_chat(self, user_id: str):
        """Find an open chat for this user or create a new one"""
        open_chat = self.chats.find_one({"user_id": user_id, "status": "open"})
        if open_chat:
            print(f"♻️ Reusing existing open ticket {open_chat['chat_id']} for user {user_id}")
            return open_chat["chat_id"]

        # No open chat, create a new one
        return self.create_chat(user_id)
    def create_chat(self, user_id: str):
        """Start a new support ticket for a user"""
        chat_id = str(uuid.uuid4())
        chat_doc = {
            "chat_id": chat_id,
            "user_id": user_id,
            "status": "open",
            "created_at": datetime.utcnow(),
            "messages": []
        }
        self.chats.insert_one(chat_doc)
        print(f"🎫 New ticket created: {chat_id} for user {user_id}")
        return chat_id


    def add_message(self, chat_id, role, text, msg_type="reply"):
        """
        Store a message in the chat.
        msg_type = "reply" (user-visible) or "debug" (internal/logging)
        """
        print(f"💾 Adding message to {chat_id}: [{role}] ({msg_type}) {text}")
        result = self.chats.update_one(
            {"chat_id": chat_id},
            {"$push": {
                "messages": {
                    "role": role,
                    "text": text,
                    "type": msg_type,
                    "timestamp": datetime.utcnow()
                }
            }}
        )
        if result.modified_count == 0:
            print(f"⚠️ Chat {chat_id} not found!")
        else:
            print(f"💾 Added message to ticket {chat_id}: [{role}] ({msg_type}) {text}")

        print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

       
    # def end_chat(self, chat_id):
    #     chat = self.chats.find_one({"chat_id": chat_id})
    #     if chat and chat["session"]["end_time"] is None:
    #         end_time = datetime.utcnow()
    #         duration = (end_time - chat["session"]["start_time"]).seconds
    #         self.chats.update_one(
    #             {"chat_id": chat_id},
    #             {"$set": {
    #                 "session.end_time": end_time,
    #                 "session.duration": duration
    #             }}
    #         )

    def close_chat(self, chat_id: str):
        """Close a ticket once resolved"""
        self.chats.update_one(
            {"chat_id": chat_id},
            {"$set": {"status": "closed"}}
        )
        print(f"✅ Ticket {chat_id} closed.")
