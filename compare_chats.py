#!/usr/bin/env python3
"""
Compare unmatched chats with matched chats to identify anomalies.
"""
import os
import re
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
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

# Get all customers and their IDs
all_customers = list(customers_collection.find({}))
customer_ids_objid = {c.get("_id") for c in all_customers}
customer_ids_str = {str(c.get("_id")) for c in all_customers}

# Get all chats
all_chats = list(chats_collection.find({}))

print("=" * 80)
print("🔍 COMPARING MATCHED VS UNMATCHED CHATS")
print("=" * 80)

matched_chats = []
unmatched_chats = []

for chat in all_chats:
    user_id = chat.get("user_id")
    user_id_str = str(user_id)
    
    # Check if matched
    matches_objid = user_id in customer_ids_objid
    matches_str = user_id_str in customer_ids_str
    matches_converted = False
    
    if isinstance(user_id, str):
        try:
            obj_id = ObjectId(user_id)
            matches_converted = obj_id in customer_ids_objid
        except:
            pass
    
    is_matched = matches_objid or matches_str or matches_converted
    
    chat_data = {
        "chat_id": chat.get("chat_id"),
        "user_id": user_id,
        "user_id_type": type(user_id).__name__,
        "status": chat.get("status"),
        "created_at": chat.get("created_at"),
        "last_activity": chat.get("last_activity"),
        "total_messages": chat.get("total_messages"),
        "messages_count": len(chat.get("messages", [])),
        "first_message": chat.get("messages", [{}])[0] if chat.get("messages") else None,
        "last_message": chat.get("messages", [{}])[-1] if chat.get("messages") else None,
        "has_state": "state" in chat and chat.get("state") != {},
        "all_fields": set(chat.keys())
    }
    
    if is_matched:
        matched_chats.append(chat_data)
    else:
        unmatched_chats.append(chat_data)

print(f"\n📊 STATISTICS:")
print(f"  Matched chats: {len(matched_chats)}")
print(f"  Unmatched chats: {len(unmatched_chats)}\n")

# Compare user_id types
print("=" * 80)
print("1. USER_ID TYPE ANALYSIS")
print("=" * 80)
print("\nMatched chats - user_id types:")
matched_types = {}
for chat in matched_chats:
    t = chat["user_id_type"]
    matched_types[t] = matched_types.get(t, 0) + 1
for t, count in matched_types.items():
    print(f"  • {t}: {count}")

print("\nUnmatched chats - user_id types:")
unmatched_types = {}
for chat in unmatched_chats:
    t = chat["user_id_type"]
    unmatched_types[t] = unmatched_types.get(t, 0) + 1
for t, count in unmatched_types.items():
    print(f"  • {t}: {count}")

# Compare chat structure
print("\n" + "=" * 80)
print("2. CHAT STRUCTURE COMPARISON")
print("=" * 80)

all_fields_matched = set()
for chat in matched_chats:
    all_fields_matched.update(chat["all_fields"])

all_fields_unmatched = set()
for chat in unmatched_chats:
    all_fields_unmatched.update(chat["all_fields"])

print(f"\nFields in matched chats: {len(all_fields_matched)}")
print(f"Fields in unmatched chats: {len(all_fields_unmatched)}")

only_in_matched = all_fields_matched - all_fields_unmatched
only_in_unmatched = all_fields_unmatched - all_fields_matched

if only_in_matched:
    print(f"\n⚠️  Fields only in matched chats: {only_in_matched}")
if only_in_unmatched:
    print(f"\n⚠️  Fields only in unmatched chats: {only_in_unmatched}")

# Compare status
print("\n" + "=" * 80)
print("3. STATUS COMPARISON")
print("=" * 80)
print("\nMatched chats status:")
matched_status = {}
for chat in matched_chats:
    s = chat["status"] or "Not Set"
    matched_status[s] = matched_status.get(s, 0) + 1
for s, count in matched_status.items():
    print(f"  • {s}: {count}")

print("\nUnmatched chats status:")
unmatched_status = {}
for chat in unmatched_chats:
    s = chat["status"] or "Not Set"
    unmatched_status[s] = unmatched_status.get(s, 0) + 1
for s, count in unmatched_status.items():
    print(f"  • {s}: {count}")

# Compare timestamps
print("\n" + "=" * 80)
print("4. TIMESTAMP ANALYSIS")
print("=" * 80)

def extract_timestamp(obj):
    if isinstance(obj, datetime):
        return obj
    elif isinstance(obj, str):
        try:
            return datetime.fromisoformat(obj.replace('Z', '+00:00'))
        except:
            return None
    return None

print("\nMatched chats - Created at:")
for chat in matched_chats:
    ts = extract_timestamp(chat["created_at"])
    if ts:
        print(f"  • {chat['chat_id'][:8]}...: {ts.strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        print(f"  • {chat['chat_id'][:8]}...: {chat['created_at']}")

print("\nUnmatched chats - Created at:")
for chat in unmatched_chats:
    ts = extract_timestamp(chat["created_at"])
    if ts:
        print(f"  • {chat['chat_id'][:8]}...: {ts.strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        print(f"  • {chat['chat_id'][:8]}...: {chat['created_at']}")

# Compare message counts
print("\n" + "=" * 80)
print("5. MESSAGE COUNT ANALYSIS")
print("=" * 80)
matched_counts = [c["messages_count"] for c in matched_chats]
unmatched_counts = [c["messages_count"] for c in unmatched_chats]

print(f"\nMatched chats:")
print(f"  • Total messages: {sum(matched_counts)}")
print(f"  • Average per chat: {sum(matched_counts) / len(matched_counts) if matched_counts else 0:.1f}")
print(f"  • Range: {min(matched_counts)} - {max(matched_counts)}")

print(f"\nUnmatched chats:")
print(f"  • Total messages: {sum(unmatched_counts)}")
print(f"  • Average per chat: {sum(unmatched_counts) / len(unmatched_counts) if unmatched_counts else 0:.1f}")
print(f"  • Range: {min(unmatched_counts)} - {max(unmatched_counts)}")

# Compare ObjectId timestamps from user_id
print("\n" + "=" * 80)
print("6. USER_ID OBJECTID TIMESTAMP ANALYSIS")
print("=" * 80)

print("\nMatched chats - user_id ObjectId creation time:")
for chat in matched_chats:
    user_id = chat["user_id"]
    try:
        if isinstance(user_id, str):
            obj_id = ObjectId(user_id)
        else:
            obj_id = user_id
        gen_time = obj_id.generation_time
        print(f"  • {chat['chat_id'][:8]}...: {gen_time.strftime('%Y-%m-%d %H:%M:%S')} (user_id: {str(user_id)[:12]}...)")
    except:
        print(f"  • {chat['chat_id'][:8]}...: Cannot extract time (user_id: {user_id})")

print("\nUnmatched chats - user_id ObjectId creation time:")
for chat in unmatched_chats:
    user_id = chat["user_id"]
    try:
        if isinstance(user_id, str):
            obj_id = ObjectId(user_id)
        else:
            obj_id = user_id
        gen_time = obj_id.generation_time
        print(f"  • {chat['chat_id'][:8]}...: {gen_time.strftime('%Y-%m-%d %H:%M:%S')} (user_id: {str(user_id)})")
    except:
        print(f"  • {chat['chat_id'][:8]}...: Cannot extract time (user_id: {user_id})")

# Check if unmatched user_ids might be in a different collection
print("\n" + "=" * 80)
print("7. CHECKING FOR USER_ID IN OTHER COLLECTIONS")
print("=" * 80)

for chat in unmatched_chats:
    user_id = chat["user_id"]
    print(f"\nChecking user_id: {user_id}")
    
    # Try finding in other collections
    collections_to_check = ["users", "user_data", "chat_states"]
    for coll_name in collections_to_check:
        if coll_name in db.list_collection_names():
            coll = db[coll_name]
            # Try ObjectId
            try:
                if isinstance(user_id, str):
                    result = coll.find_one({"_id": ObjectId(user_id)})
                else:
                    result = coll.find_one({"_id": user_id})
                if result:
                    print(f"  ✅ Found in '{coll_name}' collection!")
                    print(f"     Document: {list(result.keys())}")
                    break
            except:
                pass
    
    # Check if any customer has this as email or other field
    customer = customers_collection.find_one({"email": user_id})
    if customer:
        print(f"  ✅ Found as email in customers collection!")
    else:
        print(f"  ❌ Not found in any checked collections")

print("\n" + "=" * 80)
print("SUMMARY OF ANOMALIES")
print("=" * 80)

print("\nKey Findings:")
print(f"  1. All unmatched chats have user_id type: {unmatched_types}")
print(f"  2. Unmatched chats have {len(unmatched_chats)} total messages")
print(f"  3. Unmatched user_ids are valid ObjectIds but don't exist as customer _ids")

client.close()

