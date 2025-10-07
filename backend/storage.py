# storage.py
import certifi
from pymongo import MongoClient
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class ChatStorage:
    def __init__(self, uri, db_name="sakura"):
        print(f"✅ Connected to DB: {db_name}, URI: {uri}")
        self.client = MongoClient(
             uri,
                tlsCAFile=certifi.where(),  # ← ADD THIS
                serverSelectionTimeoutMS=5000
        )
        self.client.admin.command('ping')
        print("✅ SUCCESS! MongoDB connected")
    
        # List databases to confirm
        print("📋 Available databases:", self.client.list_database_names())
        self.db = self.client[db_name]
        self.users = self.db["users"]
        self.chats = self.db["chats"]

    # --- Users ---
    def get_or_create_user(self, email, name=None):
        user = self.users.find_one({"email": email})
        if not user:
            user = {
                "email": email,
                "name": name or "Anonymous",
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

    
    def update_state(self, chat_id: str, updates: dict) -> bool:
        """
        Merge updates into the chat's `state` sub-document safely.
        Example:
            update_state(chat_id, {"aop_name": "Reschedule Flight", "step_id": "verify_identity"})
        """
        if not updates:
            return True

        try:
            set_doc = {f"state.{k}": v for k, v in updates.items()}
            result = self.chats.update_one({"chat_id": chat_id}, {"$set": set_doc})
            if result.matched_count == 0:
                print(f"⚠️ Chat {chat_id} not found while updating state.")
            return True
        except Exception as e:
            print(f"❌ Error updating state for {chat_id}: {e}")
            return False


    def save_complete_user_data(self, user_data: Dict[str, Any]) -> bool:
        email = user_data.get("email")
        if not email:
            print("❌ No email provided in user_data")
            return False
        
        existing_user = self.users.find_one({"email": email})
        
        if existing_user:
            print(f"🔄 Updating existing user: {email}")
            update_data = {
                "name": user_data.get("name", existing_user.get("name", "Anonymous")),
                "last_seen": user_data.get("lastSeen", datetime.utcnow().isoformat()),
                "updated_at": datetime.utcnow().isoformat()
            }
            optional_fields = ["ip", "location", "device", "vibe", "visitDuration", "chatId", "totalVisits", "timestamp"]
            for field in optional_fields:
                if field in user_data:
                    update_data[field if field != "chatId" else "chat_id"] = user_data[field]
                    if field == "visitDuration":
                        update_data["visit_duration"] = user_data[field]
                    if field == "totalVisits":
                        update_data["total_visits"] = user_data[field]

            result = self.users.update_one({"email": email}, {"$set": update_data})
            print(f"✅ Updated user {email} - Matched: {result.matched_count}, Modified: {result.modified_count}")
            return True
        else:
            print(f"✨ Creating new user: {email}")
            new_user = {
                "email": email,
                "name": user_data.get("name", "Anonymous"),
                "created_at": user_data.get("timestamp", datetime.utcnow().isoformat()),
                "last_seen": user_data.get("lastSeen", datetime.utcnow().isoformat()),
                "total_visits": user_data.get("totalVisits", 1),
            }
            optional_fields = ["ip", "location", "device", "vibe", "visitDuration", "chatId", "timestamp"]
            for field in optional_fields:
                if field in user_data:
                    key = field if field != "chatId" else "chat_id"
                    new_user[key] = user_data[field]
                    if field == "visitDuration":
                        new_user["visit_duration"] = user_data[field]

            self.users.insert_one(new_user)
            print(f"✅ Created new user: {email} with all fields")
            return True

    # --- Chats ---
    def create_chat(self, user_id: str):
        chat_id = str(uuid.uuid4())
        chat_doc = {
            "chat_id": chat_id,
            "user_id": user_id,
            "aop_name": None,
            "tags": [],
            "status": "open",
            "priority": "normal",
            "assigned_agent": None,
            "last_activity": datetime.utcnow(),
            "messages": [],
            "avatar": None,
            "visited_pages": [],
            "total_messages": 0,
            "created_at": datetime.utcnow()
        }
        self.chats.insert_one(chat_doc)
        print(f"🎫 New ticket created: {chat_id} for user {user_id}")
        return chat_id


    def save_state(self, chat_id: str, state: dict):
        """Save or update the workflow state for a chat."""
        try:
            self.chats.update_one(
                {"chat_id": chat_id},
                {"$set": {"state": state}},
                upsert=True
            )
            print(f"💾 State saved for chat {chat_id}: {state}")
            return True
        except Exception as e:
            print(f"❌ Error saving state for {chat_id}: {e}")
            return False

    def get_or_create_open_chat(self, user_id: str):
        open_chat = self.chats.find_one({"user_id": user_id, "status": "open"})
        if open_chat:
            print(f"♻️ Reusing existing open ticket {open_chat['chat_id']} for user {user_id}")
            return open_chat["chat_id"]
        return self.create_chat(user_id)

    def add_message(self, chat_id, role, text, msg_type="reply", read=False, tags=None, timestamp=None):
        tags = tags or []
        ts = timestamp or datetime.utcnow()
        result = self.chats.update_one(
            {"chat_id": chat_id},
            {
                "$push": {
                    "messages": {
                        "role": role,
                        "text": text,
                        "type": msg_type,
                        "tags": tags,
                        "read": read,
                        "timestamp": ts
                    }
                },
                "$set": {"last_activity": ts},
                "$inc": {"total_messages": 1}
            }
        )
        if result.modified_count == 0:
            print(f"⚠️ Chat {chat_id} not found!")
        else:
            print(f"💾 Added message to ticket {chat_id}: [{role}] ({msg_type}) {text}")


        # --- 🔹 Auto-update category whenever a new message is added ---
        self.auto_update_chat_category(chat_id)
   
   
   
    def update_chat_metadata(self, chat_id, aop_name=None, tags=None, last_activity=None, total_messages=None):
        update_doc = {}
        if aop_name is not None:
            update_doc["aop_name"] = aop_name
        if tags is not None:
            update_doc["tags"] = tags
        if last_activity is not None:
            update_doc["last_activity"] = last_activity
        if total_messages is not None:
            update_doc["total_messages"] = total_messages
        if update_doc:
            self.chats.update_one({"chat_id": chat_id}, {"$set": update_doc})

    def get_chat(self, chat_id: str):
        return self.chats.find_one({"chat_id": chat_id})
    

    def get_message_count(self, chat_id: str) -> int:
        chat = self.chats.find_one({"chat_id": chat_id}, {"total_messages": 1})
        if chat:
            return chat.get("total_messages", 0)
        return 0



    def get_state(self, chat_id: str):
        """Retrieve the workflow state for a chat."""
        chat = self.chats.find_one({"chat_id": chat_id})
        if chat and "state" in chat:
            return chat["state"]
        return {}

    def set_chat_state(self, chat_id: str, state: dict):
        """Sets or updates the AOP workflow state for a chat session."""
        try:
            self.chats.update_one(
                {"chat_id": chat_id},
                {"$set": {"state": state}},
                upsert=True
            )
            print(f"💾 Updated chat state for {chat_id}: {state}")
        except Exception as e:
            print(f"❌ Error updating chat state for {chat_id}: {e}")

    def close_chat(self, chat_id: str):
        self.chats.update_one({"chat_id": chat_id}, {"$set": {"status": "closed"}})
        print(f"✅ Ticket {chat_id} closed.")

    def clear_state(self, chat_id: str):
        """Remove the `state` subdocument for a chat (used when an AOP completes or is cancelled)."""
        try:
            self.chats.update_one({"chat_id": chat_id}, {"$unset": {"state": ""}})
            print(f"🧹 Cleared state for chat {chat_id}")
            return True
        except Exception as e:
            print(f"❌ Error clearing state for {chat_id}: {e}")
            return False


    def auto_update_chat_category(self, chat_id: str):
        """
        Automatically categorize a chat based on its status and recent messages.
        Categories:
        - human-chats: ongoing chat with a human
        - ai-active: recent user messages not yet replied by AI
        - ai-resolved: AI finished interaction
        - escalated: flagged for human intervention
        - resolved: closed chats
        """
        chat = self.get_chat(chat_id)
        if not chat:
            print(f"⚠️ Chat {chat_id} not found for categorization")
            return

        messages = chat.get("messages", [])
        category = "human-chats"  # default


        # Rule 1: Escalation flag (optional field you can set in your chat doc)
        if chat.get("escalated", False):
            category = "escalated"

        # Rule 2: Closed chat → resolved
        elif chat.get("status") == "closed":
            category = "resolved"
        # Rule 3: Check for AI messages
        elif any(msg.get("role") == "assistant" for msg in messages[-5:]):
        # Ensure timestamps are datetime objects
            last_user_msg = next((m for m in reversed(messages) if m["role"] == "user"), None)
            last_assistant_msg = next((m for m in reversed(messages) if m["role"] == "assistant"), None)
            if last_user_msg and last_assistant_msg:
                user_ts = last_user_msg["timestamp"]
                assistant_ts = last_assistant_msg["timestamp"]
                if isinstance(user_ts, str):
                    user_ts = datetime.fromisoformat(user_ts)
                if isinstance(assistant_ts, str):
                    assistant_ts = datetime.fromisoformat(assistant_ts)

                if user_ts > assistant_ts:
                    category = "ai-active"
                else:
                    category = "ai-resolved"
            else:
                category = "ai-active"
        

        self.chats.update_one({"chat_id": chat_id}, {"$set": {"category": category}})
        print(f"🗂 Chat {chat_id} categorized as {category}")
