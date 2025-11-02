#!/usr/bin/env python3
"""
Script to list all chat instances from the database with their category and status.
"""
import os
import re
import sys
from pymongo import MongoClient
from datetime import datetime
import certifi

def get_mongo_uri():
    """Get MongoDB URI from environment or .env file."""
    # Try environment variables first
    mongo_uri = (
        os.getenv("MONGO_URI") or 
        os.getenv("MONGODB_URI") or 
        os.getenv("DATABASE_URL")
    )
    
    # If not in environment, try reading from .env file
    if not mongo_uri:
        env_files = [".env", "sakura-backend-clean/.env", ".env.local"]
        for env_file in env_files:
            if os.path.exists(env_file):
                try:
                    with open(env_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            # Match MONGO_URI or MONGODB_URI lines
                            match = re.search(r'(?:MONGO_URI|MONGODB_URI)=(?:"|\'?)([^"\'\n]+)(?:"|\'?)', line)
                            if match:
                                mongo_uri = match.group(1)
                                break
                    if mongo_uri:
                        break
                except Exception as e:
                    print(f"⚠️  Could not read {env_file}: {e}")
    
    if not mongo_uri:
        mongo_uri = "mongodb://localhost:27017"
    
    return mongo_uri

def format_timestamp(timestamp):
    """Format timestamp for display."""
    if isinstance(timestamp, datetime):
        return timestamp.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(timestamp, str):
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except:
            return str(timestamp)
    return str(timestamp) if timestamp else "N/A"

def main():
    mongo_uri = get_mongo_uri()
    db_name = os.getenv("DB_NAME", "sakura")

    print("=" * 80)
    print("📊 ALL CHAT INSTANCES FROM DATABASE")
    print("=" * 80)
    print(f"\n🔌 Connecting to MongoDB...")
    print(f"   URI: {mongo_uri.split('@')[0]}@...")  # Mask credentials
    print(f"   Database: {db_name}\n")

    try:
        client = MongoClient(mongo_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=20000, connectTimeoutMS=20000, socketTimeoutMS=20000)
        client.admin.command('ping')
        db = client[db_name]
        print("✅ Connected successfully!\n")

        customers_collection = db.customers
        chats_collection = db["customer-chats"]

        # Get all customers
        customers = list(customers_collection.find({}))
        
        # Also get all chats to see if any don't match customers
        all_chats = list(chats_collection.find({}))
        
        if not customers and not all_chats:
            print("⚠️  No customers or chats found in the database.")
            return

        total_chats = 0
        category_stats = {}
        status_stats = {}
        matched_user_ids = set()

        print(f"Found {len(customers)} customer(s)\n")
        print("=" * 80)

        for idx, customer in enumerate(customers, 1):
            customer_id = customer.get("_id")
            customer_email = customer.get("email", "Unknown")
            customer_name = customer.get("name", "Unknown User")
            customer_category = customer.get("category", "Not Set")
            customer_status = customer.get("status", "Not Set")

            # Get all chats for this customer - try both ObjectId and string matching
            user_chats = list(chats_collection.find({"user_id": customer_id}))
            # Also try string match in case user_id is stored as string
            if not user_chats:
                user_chats = list(chats_collection.find({"user_id": str(customer_id)}))
            
            # Update stats
            for chat in user_chats:
                chat_user_id = chat.get("user_id")
                if chat_user_id:
                    matched_user_ids.add(str(chat_user_id))
                
                if customer_category not in category_stats:
                    category_stats[customer_category] = 0
                category_stats[customer_category] += 1
                
                chat_status = chat.get("status", "Not Set")
                if chat_status not in status_stats:
                    status_stats[chat_status] = 0
                status_stats[chat_status] += 1

            total_chats += len(user_chats)

            print(f"\n👤 CUSTOMER #{idx}")
            print(f"   Name: {customer_name}")
            print(f"   Email: {customer_email}")
            print(f"   ID: {customer_id}")
            print(f"   📁 Category: {customer_category}")
            print(f"   📊 Status: {customer_status}")
            print(f"   💬 Total Chats: {len(user_chats)}")
            
            if user_chats:
                print(f"\n   📋 CHATS:")
                for chat_idx, chat in enumerate(user_chats, 1):
                    chat_id = chat.get("chat_id", "Unknown")
                    chat_status = chat.get("status", "Not Set")
                    created_at = chat.get("created_at")
                    last_activity = chat.get("last_activity")
                    total_messages = chat.get("total_messages", len(chat.get("messages", [])))
                    
                    print(f"\n   └─ Chat #{chat_idx}:")
                    print(f"      Chat ID: {chat_id}")
                    print(f"      Status: {chat_status}")
                    print(f"      Messages: {total_messages}")
                    print(f"      Created: {format_timestamp(created_at)}")
                    print(f"      Last Activity: {format_timestamp(last_activity)}")
            else:
                print(f"   ⚠️  No chats found for this customer")
            
            print("-" * 80)

        # Summary statistics
        print("\n" + "=" * 80)
        print("📈 SUMMARY STATISTICS")
        print("=" * 80)
        print(f"\nTotal Customers: {len(customers)}")
        print(f"Total Chats: {total_chats}")
        
        print(f"\n📁 By Category:")
        for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {category}: {count} chat(s)")
        
        print(f"\n📊 By Status:")
        for status, count in sorted(status_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {status}: {count} chat(s)")

        # Breakdown by category + status combination
        print(f"\n🔍 BREAKDOWN BY CATEGORY + STATUS:")
        print("-" * 80)
        
        for customer in customers:
            customer_category = customer.get("category", "Not Set")
            customer_id = customer.get("_id")
            user_chats = list(chats_collection.find({"user_id": customer_id}))
            
            for chat in user_chats:
                chat_status = chat.get("status", "Not Set")
                combination_key = f"{customer_category} + {chat_status}"
                if combination_key not in category_stats:
                    category_stats[combination_key] = 0
                category_stats[combination_key] += 1
        
        # Show combinations
        combinations = {k: v for k, v in category_stats.items() if " + " in k}
        for combo, count in sorted(combinations.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {combo}: {count} chat(s)")

        # Show chats that don't match any customer
        print("\n" + "=" * 80)
        print("⚠️  CHATS WITHOUT MATCHING CUSTOMERS")
        print("=" * 80)
        unmatched_chats = []
        for chat in all_chats:
            chat_user_id = str(chat.get("user_id", ""))
            if chat_user_id not in matched_user_ids:
                unmatched_chats.append(chat)
        
        if unmatched_chats:
            print(f"\nFound {len(unmatched_chats)} chat(s) without matching customer:")
            for chat in unmatched_chats:
                print(f"\n   Chat ID: {chat.get('chat_id')}")
                print(f"   Status: {chat.get('status', 'Not Set')}")
                print(f"   User ID: {chat.get('user_id')}")
                print(f"   Messages: {len(chat.get('messages', []))}")
        else:
            print("\n✅ All chats have matching customers!")

        print("\n" + "=" * 80)
        print("✅ Done!")
        print("=" * 80)

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if 'client' in locals() and client:
            client.close()

if __name__ == "__main__":
    main()

