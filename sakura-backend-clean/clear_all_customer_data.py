"""
Script to delete ALL widget customer and chat data from MongoDB.
This deletes everything from:
- 'customers' collection (all widget customers)
- 'customer-chats' collection (all chats)

No filtering - deletes everything.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from app.core.settings import get_settings

def clear_all_customer_data():
    """Delete ALL widget customer and chat data."""
    settings = get_settings()
    
    try:
        client = MongoClient(settings.mongo_uri)
        db = client.sakura
        
        customers_collection = db.customers
        chats_collection = db["customer-chats"]
        
        # Count before deletion
        customers_count = customers_collection.count_documents({})
        chats_count = chats_collection.count_documents({})
        
        print(f"📊 Current data:")
        print(f"   - Widget customers: {customers_count}")
        print(f"   - Customer chats: {chats_count}")
        
        if customers_count == 0 and chats_count == 0:
            print("\n✅ Database is already empty.")
            return
        
        # Delete ALL customers (no filter - deletes everything)
        print(f"\n🗑️  Deleting ALL {customers_count} widget customers...")
        customers_result = customers_collection.delete_many({})
        print(f"✅ Deleted {customers_result.deleted_count} widget customers")
        
        # Delete ALL chats (no filter - deletes everything)
        print(f"🗑️  Deleting ALL {chats_count} customer chats...")
        chats_result = chats_collection.delete_many({})
        print(f"✅ Deleted {chats_result.deleted_count} customer chats")
        
        # Verify deletion
        remaining_customers = customers_collection.count_documents({})
        remaining_chats = chats_collection.count_documents({})
        
        print(f"\n✅ Cleanup complete!")
        print(f"   - Remaining widget customers: {remaining_customers}")
        print(f"   - Remaining customer chats: {remaining_chats}")
        
        if remaining_customers == 0 and remaining_chats == 0:
            print("\n🎉 All customer data deleted! Database is clean.")
        else:
            print("\n⚠️  Warning: Some data may still exist.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    clear_all_customer_data()

