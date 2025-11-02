#!/usr/bin/env python3
"""
Count total number of chat instances in the database.
"""
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

chats_collection = db["customer-chats"]
customers_collection = db.customers

# Count all chats
total_chats = chats_collection.count_documents({})

print("=" * 80)
print("📊 TOTAL CHAT INSTANCES IN DATABASE")
print("=" * 80)
print(f"\nTotal chats in 'customer-chats' collection: {total_chats}\n")

# Count by status
print("Breakdown by chat status:")
status_counts = {}
for chat in chats_collection.find({}):
    status = chat.get("status", "Not Set")
    status_counts[status] = status_counts.get(status, 0) + 1

for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  • {status}: {count} chat(s)")

# Count chats matched to customers
print(f"\nBreakdown by customer category:")
customers = list(customers_collection.find({}))
category_counts = {}
matched_chats = 0
unmatched_chats = 0

for customer in customers:
    customer_id = customer.get("_id")
    category = customer.get("category", "Not Set")
    
    user_chats = list(chats_collection.find({"user_id": customer_id}))
    if not user_chats:
        user_chats = list(chats_collection.find({"user_id": str(customer_id)}))
    
    if user_chats:
        matched_chats += len(user_chats)
        category_counts[category] = category_counts.get(category, 0) + len(user_chats)

unmatched_chats = total_chats - matched_chats

print(f"  • Total matched to customers: {matched_chats}")
print(f"  • Unmatched chats: {unmatched_chats}\n")

print("By customer category:")
for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  • {category}: {count} chat(s)")

# Show unmatched chats
if unmatched_chats > 0:
    print(f"\n⚠️  {unmatched_chats} chat(s) don't have matching customers:")
    all_customer_ids = {str(c.get("_id")) for c in customers}
    for chat in chats_collection.find({}):
        chat_user_id = str(chat.get("user_id", ""))
        if chat_user_id not in all_customer_ids:
            print(f"   - Chat ID: {chat.get('chat_id')}, User ID: {chat_user_id}")

print("\n" + "=" * 80)

client.close()

