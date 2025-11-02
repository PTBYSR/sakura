#!/usr/bin/env python3
"""
Count chat instances that should appear in agent-inbox/active-chats
Criteria:
- user.category === "agent-inbox"
- user.status === "active"
- user has at least one chat
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

customers_collection = db.customers
chats_collection = db["customer-chats"]

print("=" * 80)
print("📊 COUNTING CHATS FOR: /inbox/agent-inbox/active-chats")
print("=" * 80)
print("\nCriteria:")
print("  • user.category === 'agent-inbox'")
print("  • user.status === 'active'")
print("  • user has at least one chat")
print("\n" + "-" * 80)

# Get all customers with category="agent-inbox" and status="active"
customers = list(customers_collection.find({
    "category": "agent-inbox",
    "status": "active"
}))

print(f"\nFound {len(customers)} customers with category='agent-inbox' and status='active'\n")

matching_users = []
total_chats = 0

for customer in customers:
    customer_id = customer.get("_id")
    customer_email = customer.get("email", "Unknown")
    customer_name = customer.get("name", "Unknown User")
    
    # Get chats for this customer
    user_chats_list = list(chats_collection.find({"user_id": customer_id}))
    # Try string match if no matches
    if not user_chats_list:
        user_chats_list = list(chats_collection.find({"user_id": str(customer_id)}))
    
    if user_chats_list:
        matching_users.append({
            "name": customer_name,
            "email": customer_email,
            "chats": len(user_chats_list)
        })
        total_chats += len(user_chats_list)
        print(f"✅ {customer_name} ({customer_email})")
        print(f"   Has {len(user_chats_list)} chat(s)")
        for chat in user_chats_list:
            print(f"   - Chat ID: {chat.get('chat_id')}")
            print(f"     Messages: {len(chat.get('messages', []))}")
        print()

print("=" * 80)
print("📈 SUMMARY")
print("=" * 80)
print(f"\nTotal users matching criteria: {len(matching_users)}")
print(f"Total chats to display: {total_chats}\n")

if matching_users:
    print("Users and their chat counts:")
    for user in matching_users:
        print(f"  • {user['name']}: {user['chats']} chat(s)")
else:
    print("⚠️  No users found matching the criteria!")
    print("\nPossible reasons:")
    print("  • No customers have category='agent-inbox'")
    print("  • No customers have status='active'")
    print("  • Customers with matching criteria have no chats")
    print("  • Chat user_id doesn't match customer _id (ObjectId mismatch)")

print("\n" + "=" * 80)

client.close()

