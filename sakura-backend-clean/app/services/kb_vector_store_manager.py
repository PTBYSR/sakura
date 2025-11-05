"""
Service for managing vector store with enabled KB items only.
"""
import logging
from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from pymongo.database import Database

from app.services.vector_store_service import VectorStoreService
from app.services.website_crawler_service import WebsiteCrawlerService
from app.services.faq_embedding_service import FAQEmbeddingService
from app.services.file_processing_service import FileProcessingService
from app.core.settings import get_settings

logger = logging.getLogger(__name__)


def rebuild_vector_store_with_enabled_items(
    dashboard_user_id: str,
    enabled_items: List[dict],
    db: Database,
    vector_store_service: VectorStoreService,
    crawler_service: WebsiteCrawlerService,
    faq_embedding_service: FAQEmbeddingService,
    file_processing_service: FileProcessingService
) -> None:
    """
    Rebuild vector store with only chunks from enabled KB items.
    
    Args:
        dashboard_user_id: Dashboard user ID
        enabled_items: List of enabled KB items with 'id' and 'type'
        db: Database instance
        vector_store_service: Vector store service
        crawler_service: Website crawler service
        faq_embedding_service: FAQ embedding service
        file_processing_service: File processing service
    """
    try:
        if not vector_store_service.is_initialized():
            logger.warning("Vector store not initialized, skipping rebuild")
            return
        
        logger.info(f"🔄 Rebuilding vector store for user {dashboard_user_id} with {len(enabled_items)} enabled items")
        
        # Create a set of enabled item IDs by type for fast lookup
        enabled_websites = {item["id"] for item in enabled_items if item["type"] == "website"}
        enabled_faqs = {item["id"] for item in enabled_items if item["type"] == "faq"}
        enabled_files = {item["id"] for item in enabled_items if item["type"] == "file"}
        
        # Collect all documents from enabled items
        all_documents = []
        
        # 1. Get website chunks
        if enabled_websites:
            for website_id in enabled_websites:
                try:
                    chunks = crawler_service.get_website_chunks(website_id)
                    if chunks:
                        for chunk in chunks:
                            metadata = {
                                "source": chunk.get("source", ""),
                                "website_id": chunk.get("website_id", website_id),
                                "domain": chunk.get("domain", ""),
                                "title": chunk.get("title", ""),
                                "chunk_index": chunk.get("chunk_index", 0),
                                "chunk_id": chunk.get("id", ""),
                                "type": "website",
                            }
                            if chunk.get("headings"):
                                metadata["headings"] = ", ".join(chunk.get("headings", []))
                            
                            doc = Document(
                                page_content=chunk.get("text", ""),
                                metadata=metadata
                            )
                            all_documents.append(doc)
                        logger.info(f"✅ Added {len(chunks)} chunks from website {website_id}")
                except Exception as e:
                    logger.error(f"❌ Error loading chunks for website {website_id}: {e}")
        
        # 2. Get FAQ chunks (from FAQ database)
        if enabled_faqs and db is not None:
            try:
                # Get FAQs from database
                faqs_collection = db.faqs
                from bson import ObjectId
                
                logger.info(f"🔍 Looking for {len(enabled_faqs)} enabled FAQs: {enabled_faqs}")
                
                for faq_id in enabled_faqs:
                    try:
                        faq_doc = None
                        
                        # Extract ObjectId from various formats
                        # Handle formats like: "faq-{ObjectId}", "{ObjectId}", or just the ObjectId string
                        actual_id = faq_id
                        if faq_id.startswith("faq-"):
                            actual_id = faq_id.replace("faq-", "")
                        elif faq_id.startswith("faq_"):
                            actual_id = faq_id.replace("faq_", "")
                        
                        # Strategy 1: Try direct ObjectId lookup with extracted ID
                        if ObjectId.is_valid(actual_id):
                            try:
                                faq_doc = faqs_collection.find_one({"_id": ObjectId(actual_id)})
                                if faq_doc:
                                    logger.info(f"✅ Found FAQ {faq_id} (using {actual_id}) via ObjectId lookup")
                            except Exception as e:
                                logger.warning(f"⚠️ ObjectId lookup failed for {faq_id} (extracted {actual_id}): {e}")
                        
                        # Strategy 2: Try string match on _id converted to string
                        if not faq_doc:
                            all_faqs = faqs_collection.find({"dashboard_user_id": dashboard_user_id})
                            for faq in all_faqs:
                                faq_str_id = str(faq["_id"])
                                # Match exact string ID or ObjectId string representation
                                # Also check if the stored ID matches the extracted ID
                                if (faq_str_id == faq_id or 
                                    faq_str_id == str(faq_id) or 
                                    faq_str_id == actual_id or
                                    faq_str_id == str(actual_id)):
                                    faq_doc = faq
                                    logger.info(f"✅ Found FAQ {faq_id} via string match (found as {faq_str_id})")
                                    break
                        
                        # Strategy 3: Try finding by dashboard_user_id and matching any ID field
                        if not faq_doc:
                            all_faqs = faqs_collection.find({"dashboard_user_id": dashboard_user_id})
                            for faq in all_faqs:
                                # Check if faq has an 'id' field that matches
                                if (faq.get("id") == faq_id or 
                                    str(faq.get("id")) == str(faq_id) or
                                    faq.get("id") == actual_id or
                                    str(faq.get("id")) == str(actual_id)):
                                    faq_doc = faq
                                    logger.info(f"✅ Found FAQ {faq_id} via id field match")
                                    break
                        
                        if faq_doc:
                            question = faq_doc.get("question", "")
                            answer = faq_doc.get("answer", "")
                            content = f"Q: {question}\n\nA: {answer}"
                            
                            metadata = {
                                "source": "faq",
                                "faq_id": str(faq_doc["_id"]),
                                "type": "faq",
                                "question": question,
                            }
                            
                            doc = Document(
                                page_content=content,
                                metadata=metadata
                            )
                            all_documents.append(doc)
                            logger.info(f"✅ Added FAQ document: {question[:50]}...")
                        else:
                            logger.warning(f"⚠️ FAQ {faq_id} not found in database for user {dashboard_user_id}")
                    except Exception as e:
                        logger.error(f"❌ Error loading FAQ {faq_id}: {e}")
                        import traceback
                        traceback.print_exc()
                        
                logger.info(f"📊 Total FAQ documents added: {len([d for d in all_documents if d.metadata.get('type') == 'faq'])}")
            except Exception as e:
                logger.error(f"❌ Error loading FAQs: {e}")
                import traceback
                traceback.print_exc()
        
        # 3. Get file chunks
        if enabled_files:
            for file_id in enabled_files:
                try:
                    chunks = file_processing_service.get_file_chunks(file_id)
                    if chunks:
                        for chunk in chunks:
                            metadata = {
                                "source": chunk.get("source", ""),
                                "file_id": chunk.get("file_id", file_id),
                                "chunk_index": chunk.get("chunk_index", 0),
                                "chunk_id": chunk.get("id", ""),
                                "type": "file",
                            }
                            
                            doc = Document(
                                page_content=chunk.get("text", ""),
                                metadata=metadata
                            )
                            all_documents.append(doc)
                        logger.info(f"✅ Added {len(chunks)} chunks from file {file_id}")
                except Exception as e:
                    logger.error(f"❌ Error loading chunks for file {file_id}: {e}")
        
        # Rebuild vector store with collected documents
        if all_documents:
            logger.info(f"📚 Rebuilding vector store with {len(all_documents)} documents")
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            
            # Create new vector store from documents
            new_vector_store = FAISS.from_documents(all_documents, embeddings)
            
            # Save the updated index
            settings = get_settings()
            new_vector_store.save_local(str(settings.faiss_index_path))
            
            # Update the vector store service instance
            vector_store_service.vector_store = new_vector_store
            
            logger.info(f"✅ Successfully rebuilt vector store with {len(all_documents)} documents")
        else:
            # If no documents, create minimal index
            logger.warning("⚠️ No documents to index, creating minimal index")
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            new_vector_store = FAISS.from_texts(
                ["Welcome to Sakura AI Assistant!"],
                embeddings
            )
            settings = get_settings()
            new_vector_store.save_local(str(settings.faiss_index_path))
            vector_store_service.vector_store = new_vector_store
            logger.info("✅ Created minimal vector store")
            
    except Exception as e:
        logger.error(f"❌ Error rebuilding vector store: {e}")
        import traceback
        traceback.print_exc()
        raise


def get_enabled_kb_item_ids(dashboard_user_id: str, db: Database) -> dict:
    """
    Get enabled KB item IDs grouped by type.
    
    Returns:
        dict with keys: 'websites', 'faqs', 'files' containing lists of IDs
    """
    if db is None:
        return {"websites": [], "faqs": [], "files": []}
    
    collection = db["ai-agent-kb-selections"]
    doc = collection.find_one({"dashboard_user_id": dashboard_user_id})
    
    if not doc:
        return {"websites": [], "faqs": [], "files": []}
    
    enabled_items = doc.get("enabled_kb_items", [])
    result = {"websites": [], "faqs": [], "files": []}
    
    for item in enabled_items:
        item_type = item.get("type", "")
        item_id = item.get("id", "")
        if item_type == "website":
            result["websites"].append(item_id)
        elif item_type == "faq":
            result["faqs"].append(item_id)
        elif item_type == "file":
            result["files"].append(item_id)
    
    return result

