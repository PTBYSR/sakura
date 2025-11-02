#!/usr/bin/env python3
import os
import re
from pymongo import MongoClient
import certifi

def get_mongo_uri():
    mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
    if not mongo_uri:
        env_files = [".env", "sakura-backend-clean/.env", ".env.local"]
        for env_file in env_files:
            if os.path.exists(env_file):
                try:
                    with open(env_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            match = re.search(r'(?:MONGO_URI|MONGODB_URI)=(?:"|\'?)([^"\'\n]+)(?:"|\'?)', line)
                            if match:
                                mongo_uri = match.group(1)
                                break
                    if mongo_uri:
                        break
                except Exception as e:
                    print(f"Could not read {env_file}: {e}")
    return mongo_uri or "mongodb://localhost:27017"

client = MongoClient(get_mongo_uri(), tlsCAFile=certifi.where())
db = client['sakura']

print("Collections:", db.list_collection_names())
print("\nChecking customer-chats collection:")
chats = list(db["customer-chats"].find({}))
print(f"Total chats: {len(chats)}")

for chat in chats[:10]:
    print(f"\nChat ID: {chat.get('chat_id')}")
    print(f"  Status: {chat.get('status')}")
    print(f"  User ID: {chat.get('user_id')}")
    print(f"  Messages: {len(chat.get('messages', []))}")

client.close()

