#!/usr/bin/env python3
"""
Investigate why chats are unmatched - check user_id vs customer _id matching.
"""
import os
import re
from pymongo import MongoClient
from bson import ObjectId
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

print("=" * 80)
print("🔍 INVESTIGATING UNMATCHED CHATS")
print("=" * 80)

# Get all customer IDs (both ObjectId and string formats)
all_customers = list(customers_collection.find({}))
customer_ids_objid = {c.get("_id") for c in all_customers}
customer_ids_str = {str(c.get("_id")) for c in all_customers}

print(f"\nTotal customers: {len(all_customers)}")
print(f"Customer _id types in database: ObjectId\n")

# Get all chats
all_chats = list(chats_collection.find({}))
print(f"Total chats: {len(all_chats)}\n")

print("-" * 80)
print("UNMATCHED CHATS ANALYSIS:")
print("-" * 80)

unmatched = []
matched = []

for chat in all_chats:
    chat_id = chat.get("chat_id")
    user_id = chat.get("user_id")
    user_id_type = type(user_id).__name__
    user_id_str = str(user_id)
    
    # Check if it matches
    matches_objid = user_id in customer_ids_objid
    matches_str = user_id_str in customer_ids_str
    
    # Try to convert to ObjectId if it's a string
    matches_converted = False
    if isinstance(user_id, str):
        try:
            obj_id = ObjectId(user_id)
            matches_converted = obj_id in customer_ids_objid
        except:
            pass
    
    if not (matches_objid or matches_str or matches_converted):
        unmatched.append({
            "chat_id": chat_id,
            "user_id": user_id,
            "user_id_type": user_id_type,
            "user_id_str": user_id_str,
            "messages_count": len(chat.get("messages", []))
        })
    else:
        matched.append({
            "chat_id": chat_id,
            "user_id": user_id,
            "user_id_type": user_id_type
        })

print(f"\n✅ Matched chats: {len(matched)}")
print(f"❌ Unmatched chats: {len(unmatched)}\n")

if unmatched:
    print("UNMATCHED CHAT DETAILS:")
    print("-" * 80)
    for chat in unmatched:
        print(f"\nChat ID: {chat['chat_id']}")
        print(f"  user_id: {chat['user_id']}")
        print(f"  user_id type: {chat['user_id_type']}")
        print(f"  user_id (string): {chat['user_id_str']}")
        print(f"  Messages: {chat['messages_count']}")
        
        # Check if any customer has similar ID
        print(f"\n  Checking for similar customer IDs...")
        found_similar = False
        
        # Try direct ObjectId conversion
        if isinstance(chat['user_id'], str):
            try:
                obj_id = ObjectId(chat['user_id'])
                print(f"    Converted to ObjectId: {obj_id}")
                customer = customers_collection.find_one({"_id": obj_id})
                if customer:
                    print(f"    ✅ FOUND MATCH! Customer: {customer.get('name')} ({customer.get('email')})")
                    found_similar = True
                else:
                    print(f"    ❌ No customer found with this ObjectId")
            except Exception as e:
                print(f"    ⚠️  Cannot convert to ObjectId: {e}")
        
        # Check if it's a substring match
        for customer in all_customers:
            customer_id_str = str(customer.get("_id"))
            if chat['user_id_str'] in customer_id_str or customer_id_str in chat['user_id_str']:
                if not found_similar:
                    print(f"    🔍 Partial match found: Customer ID {customer_id_str} (name: {customer.get('name')})")
                    print(f"       Difference: Chat user_id is {len(chat['user_id_str'])} chars, Customer _id is {len(customer_id_str)} chars")
        
        if not found_similar:
            print(f"    ❌ No matching customer found")

print("\n" + "=" * 80)
print("EXISTING CUSTOMER IDs (for reference):")
print("=" * 80)
for customer in all_customers[:10]:  # Show first 10
    print(f"  {customer.get('name')}: {customer.get('_id')} (type: {type(customer.get('_id')).__name__})")

client.close()

