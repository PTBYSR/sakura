"""
Knowledge base API routes for managing websites and documents.
"""
import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Form
from typing import List, Optional, Union
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from pymongo.database import Database
from bson import ObjectId

from app.services.website_crawler_service import get_website_crawler_service, WebsiteCrawlerService
from app.services.vector_store_service import get_vector_store_service, VectorStoreService
from app.services.faq_embedding_service import get_faq_embedding_service, FAQEmbeddingService
from app.services.file_processing_service import get_file_processing_service, FileProcessingService
from app.core.database import get_database
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from fastapi import UploadFile, File as FastAPIFile
import tempfile
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/knowledge-base", tags=["Knowledge Base"])


def to_iso_string(value: Union[datetime, str, None], default: Optional[datetime] = None) -> str:
    """Safely convert a datetime value to ISO format string."""
    if value is None:
        if default is None:
            default = datetime.now()
        return default.isoformat()
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, str):
        # If it's already a string, try to parse and return ISO format
        try:
            # Try parsing common formats and returning ISO
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            return dt.isoformat()
        except:
            # If parsing fails, return as-is
            return value
    # Fallback: convert to string
    return str(value)


class WebsiteRequest(BaseModel):
    url: HttpUrl
    dashboard_user_id: Optional[str] = None


class WebsiteResponse(BaseModel):
    id: str
    url: str
    dashboard_user_id: Optional[str] = None
    title: str
    status: str
    pagesExtracted: int
    totalChunks: int
    createdAt: str
    lastUpdated: str
    error: Optional[str] = None


def index_website_chunks_in_vector_store(
    website_id: str,
    crawler_service: WebsiteCrawlerService,
    vector_store_service: VectorStoreService
):
    """Background task to index website chunks into vector store."""
    try:
        chunks = crawler_service.get_website_chunks(website_id)
        if not chunks:
            return
        
        # Convert chunks to LangChain Documents
        documents = []
        for chunk in chunks:
            metadata = {
                "source": chunk.get("source", ""),
                "website_id": chunk.get("website_id", website_id),
                "domain": chunk.get("domain", ""),
                "title": chunk.get("title", ""),
                "chunk_index": chunk.get("chunk_index", 0),
                "chunk_id": chunk.get("id", ""),
            }
            # Add headings if available
            if chunk.get("headings"):
                metadata["headings"] = ", ".join(chunk.get("headings", []))
            
            doc = Document(
                page_content=chunk.get("text", ""),
                metadata=metadata
            )
            documents.append(doc)
        
        # Add documents to vector store
        if documents and vector_store_service.is_initialized():
            vector_store = vector_store_service.get_vector_store()
            if vector_store:
                vector_store.add_documents(documents)
                # Save the updated index
                from app.core.settings import get_settings
                settings = get_settings()
                vector_store.save_local(str(settings.faiss_index_path))
                print(f"✅ Indexed {len(documents)} chunks from website {website_id}")
    except Exception as e:
        print(f"❌ Error indexing chunks for website {website_id}: {e}")


def remove_website_chunks_from_vector_store(
    website_id: str,
    vector_store_service: VectorStoreService
):
    """Remove website chunks from vector store by filtering out documents with matching website_id."""
    try:
        if not vector_store_service.is_initialized():
            print("❌ Vector store not initialized, skipping removal")
            return False
        
        vector_store = vector_store_service.get_vector_store()
        if not vector_store:
            print("❌ Vector store instance not available")
            return False
        
        # Get all documents from the vector store
        # FAISS stores documents in docstore, we need to filter them
        from app.core.settings import get_settings
        settings = get_settings()
        
        # Access the docstore to get all documents
        docstore = vector_store.docstore
        
        # Collect all documents that should be kept (not from the deleted website)
        documents_to_keep = []
        removed_count = 0
        
        # Iterate through all documents in the docstore
        # FAISS uses InMemoryDocstore which stores documents in _dict
        if hasattr(docstore, '_dict'):
            for doc_id, doc in docstore._dict.items():
                # Check if this document belongs to the deleted website
                metadata = getattr(doc, 'metadata', {})
                if not isinstance(metadata, dict):
                    # If metadata is not a dict, keep the document to be safe
                    documents_to_keep.append(doc)
                    continue
                    
                doc_website_id = metadata.get('website_id', '')
                
                if doc_website_id != website_id:
                    # Keep this document
                    documents_to_keep.append(doc)
                else:
                    removed_count += 1
        else:
            # Fallback: if we can't access docstore, try searching for all documents
            # This is less efficient but more robust
            print(f"⚠️ Cannot access docstore directly, using alternative method...")
            # Perform a broad search to get many documents (limited to reasonable number)
            try:
                all_docs = vector_store.similarity_search("", k=10000)  # Large k to get many docs
                seen_ids = set()
                for doc in all_docs:
                    metadata = getattr(doc, 'metadata', {})
                    if isinstance(metadata, dict):
                        doc_website_id = metadata.get('website_id', '')
                        # Use a combination of content and metadata to identify unique documents
                        doc_key = (doc.page_content[:100], doc_website_id)
                        if doc_key not in seen_ids:
                            seen_ids.add(doc_key)
                            if doc_website_id != website_id:
                                documents_to_keep.append(doc)
                            else:
                                removed_count += 1
            except Exception as e:
                print(f"⚠️ Alternative method failed: {e}, will rebuild from scratch")
                documents_to_keep = []
        
        if removed_count == 0:
            print(f"ℹ️ No chunks found for website {website_id} in vector store")
            return True
        
        # Rebuild the vector store with remaining documents
        if documents_to_keep:
            print(f"🔄 Rebuilding vector store with {len(documents_to_keep)} documents (removed {removed_count} from website {website_id})...")
            
            # Create new vector store from remaining documents
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            new_vector_store = FAISS.from_documents(documents_to_keep, embeddings)
            
            # Save the updated index
            new_vector_store.save_local(str(settings.faiss_index_path))
            
            # Update the vector store service instance
            vector_store_service.vector_store = new_vector_store
            
            print(f"✅ Removed {removed_count} chunks from website {website_id}")
        else:
            # If no documents left, create a minimal index
            print(f"⚠️ All documents removed. Creating minimal index...")
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            new_vector_store = FAISS.from_texts(
                ["Welcome to Sakura AI Assistant!"],
                embeddings
            )
            new_vector_store.save_local(str(settings.faiss_index_path))
            vector_store_service.vector_store = new_vector_store
            print(f"✅ Removed all chunks from website {website_id} (index now minimal)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error removing website chunks from vector store: {e}")
        import traceback
        traceback.print_exc()
        return False


@router.post("/websites", response_model=WebsiteResponse, status_code=202)
async def add_website(
    request: WebsiteRequest,
    background_tasks: BackgroundTasks,
    crawler_service: WebsiteCrawlerService = Depends(get_website_crawler_service),
    vector_store_service: VectorStoreService = Depends(get_vector_store_service)
):
    """Add a new website to crawl and index."""
    url_str = str(request.url)
    
    # Create initial website entry (status: pending)
    from datetime import datetime
    from urllib.parse import urlparse
    
    parsed = urlparse(url_str)
    domain_name = parsed.netloc.replace("www.", "").replace(".", "_")
    website_id = f"{domain_name}_{int(datetime.now().timestamp())}"
    
    # Create initial metadata entry in database if available
    initial_website = {
        "id": website_id,
        "url": url_str,
        "title": parsed.netloc.replace("www.", ""),
        "status": "pending",
        "pagesExtracted": 0,
        "totalChunks": 0,
        "createdAt": datetime.now().isoformat(),
        "lastUpdated": datetime.now().isoformat(),
        "error": None,
        "dashboard_user_id": request.dashboard_user_id  # Store dashboard user ID
    }
    
    # Store initial entry in database or file-based storage
    db = get_database()
    if db:
        websites_collection = db.websites
        websites_collection.update_one(
            {"website_id": website_id},
            {
                "$set": {
                    "website_id": website_id,
                    "url": url_str,
                    "title": parsed.netloc.replace("www.", ""),
                    "domain": domain_name,
                    "status": "pending",
                    "pages_extracted": 0,
                    "total_chunks": 0,
                    "dashboard_user_id": request.dashboard_user_id,
                    "last_updated": datetime.now()
                },
                "$setOnInsert": {
                    "created_at": datetime.now(),
                    "error": None,
                    "config": {
                        "max_pages": crawler_service.max_pages,
                        "chunk_size": crawler_service.chunk_size,
                        "overlap": crawler_service.overlap
                    }
                }
            },
            upsert=True
        )
        logger.info(f"✅ Created initial website entry in database: {website_id}")
    else:
        # Fallback to file-based storage
        crawler_service.websites_metadata[website_id] = initial_website
        crawler_service._save_metadata()
    
    # Run crawling in background
    def process_website():
        try:
            # Process website (this will update the metadata and store chunks in MongoDB)
            website = crawler_service.process_website(
                url_str, 
                website_id, 
                dashboard_user_id=request.dashboard_user_id
            )
            # After crawling completes, index chunks in vector store (load from MongoDB)
            if website["status"] == "completed":
                index_website_chunks_in_vector_store(
                    website["id"],
                    crawler_service,
                    vector_store_service
                )
        except Exception as e:
            print(f"Error processing website {url_str}: {e}")
    
    background_tasks.add_task(process_website)
    
    return WebsiteResponse(**initial_website)


@router.get("/websites", response_model=List[WebsiteResponse])
async def list_websites(
    dashboard_user_id: Optional[str] = Query(None, description="Filter by dashboard user ID"),
    crawler_service: WebsiteCrawlerService = Depends(get_website_crawler_service)
):
    """List websites, optionally filtered by dashboard user ID."""
    # Pass dashboard_user_id to service for database-level filtering
    websites = crawler_service.list_websites(dashboard_user_id=dashboard_user_id)
    
    return [WebsiteResponse(**website) for website in websites]


@router.get("/websites/{website_id}", response_model=WebsiteResponse)
async def get_website(
    website_id: str,
    crawler_service: WebsiteCrawlerService = Depends(get_website_crawler_service)
):
    """Get website details by ID."""
    website = crawler_service.get_website(website_id)
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return WebsiteResponse(**website)


@router.delete("/websites/{website_id}", status_code=204)
async def delete_website(
    website_id: str,
    crawler_service: WebsiteCrawlerService = Depends(get_website_crawler_service),
    vector_store_service: VectorStoreService = Depends(get_vector_store_service)
):
    """Delete a website and its chunks from both files and vector store."""
    success = crawler_service.delete_website(website_id)
    if not success:
        raise HTTPException(status_code=404, detail="Website not found")
    
    # Remove chunks from vector store
    remove_website_chunks_from_vector_store(website_id, vector_store_service)
    
    return None


# ==================== FAQs Endpoints ====================

class FAQRequest(BaseModel):
    """Request model for creating/updating FAQs."""
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)
    dashboard_user_id: Optional[str] = None


class FAQResponse(BaseModel):
    """Response model for FAQ."""
    id: str
    question: str
    answer: str
    tags: List[str]
    createdAt: str
    updatedAt: str


@router.get("/faqs", response_model=List[FAQResponse])
async def get_faqs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    dashboard_user_id: Optional[str] = Query(None, description="Filter by dashboard user ID"),
    db: Database = Depends(get_database)
):
    """Get FAQs with optional search, pagination, and user filtering."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        query = {}
        
        # Filter by dashboard_user_id if provided
        if dashboard_user_id:
            query["dashboard_user_id"] = dashboard_user_id
        
        # Add search filter if provided
        if search:
            search_query = {
                "$or": [
                    {"question": {"$regex": search, "$options": "i"}},
                    {"answer": {"$regex": search, "$options": "i"}}
                ]
            }
            # Merge search query with existing query
            if query:
                query = {"$and": [query, search_query]}
            else:
                query = search_query
        
        # Get FAQs with pagination
        # Sort by createdAt descending, but handle cases where field might not exist
        try:
            cursor = collection.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        except Exception:
            # Fallback if sorting fails
            cursor = collection.find(query).skip(skip).limit(limit)
        faqs = []
        
        for doc in cursor:
            faq = {
                "id": str(doc["_id"]),
                "question": doc.get("question", ""),
                "answer": doc.get("answer", ""),
                "tags": doc.get("tags", []),
                "createdAt": to_iso_string(doc.get("createdAt")),
                "updatedAt": to_iso_string(doc.get("updatedAt"))
            }
            faqs.append(FAQResponse(**faq))
        
        return faqs
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error fetching FAQs: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ {error_detail}")
        raise HTTPException(status_code=500, detail=f"Error fetching FAQs: {str(e)}")


@router.get("/faqs/{faq_id}", response_model=FAQResponse)
async def get_faq(
    faq_id: str,
    db: Database = Depends(get_database)
):
    """Get a single FAQ by ID."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        
        # Validate ObjectId format
        if not ObjectId.is_valid(faq_id):
            raise HTTPException(status_code=400, detail="Invalid FAQ ID format")
        
        doc = collection.find_one({"_id": ObjectId(faq_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="FAQ not found")
        
        return FAQResponse(
            id=str(doc["_id"]),
            question=doc.get("question", ""),
            answer=doc.get("answer", ""),
            tags=doc.get("tags", []),
            createdAt=to_iso_string(doc.get("createdAt")),
            updatedAt=to_iso_string(doc.get("updatedAt"))
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching FAQ: {str(e)}")


@router.post("/faqs", response_model=FAQResponse, status_code=201)
async def create_faq(
    request: FAQRequest,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_database),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service)
):
    """Create a new FAQ and generate embedding asynchronously."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        
        # Create FAQ document
        now = datetime.now()
        faq_doc = {
            "question": request.question,
            "answer": request.answer,
            "tags": request.tags,
            "createdAt": now,
            "updatedAt": now,
            "dashboard_user_id": request.dashboard_user_id  # Store dashboard user ID
        }
        
        # Insert into database
        result = collection.insert_one(faq_doc)
        faq_id = str(result.inserted_id)
        
        # Generate embedding in background task (non-blocking)
        def generate_embedding():
            faq_embedding_service.add_faq_embedding(
                faq_id=faq_id,
                question=request.question,
                answer=request.answer
            )
        
        background_tasks.add_task(generate_embedding)
        
        # Return created FAQ
        return FAQResponse(
            id=faq_id,
            question=request.question,
            answer=request.answer,
            tags=request.tags,
            createdAt=now.isoformat(),
            updatedAt=now.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating FAQ: {str(e)}")


@router.put("/faqs/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: str,
    request: FAQRequest,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_database),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service)
):
    """Update an existing FAQ and regenerate embedding asynchronously."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        
        # Validate ObjectId format
        if not ObjectId.is_valid(faq_id):
            raise HTTPException(status_code=400, detail="Invalid FAQ ID format")
        
        # Check if FAQ exists
        existing = collection.find_one({"_id": ObjectId(faq_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="FAQ not found")
        
        # Update FAQ
        update_doc = {
            "$set": {
                "question": request.question,
                "answer": request.answer,
                "tags": request.tags,
                "updatedAt": datetime.now()
            }
        }
        
        # Preserve dashboard_user_id if provided (for ownership), otherwise keep existing
        if request.dashboard_user_id:
            update_doc["$set"]["dashboard_user_id"] = request.dashboard_user_id
        
        collection.update_one({"_id": ObjectId(faq_id)}, update_doc)
        
        # Regenerate embedding in background task (non-blocking)
        def update_embedding():
            faq_embedding_service.update_faq_embedding(
                faq_id=faq_id,
                question=request.question,
                answer=request.answer
            )
        
        background_tasks.add_task(update_embedding)
        
        # Get updated FAQ
        updated = collection.find_one({"_id": ObjectId(faq_id)})
        
        return FAQResponse(
            id=str(updated["_id"]),
            question=updated.get("question", ""),
            answer=updated.get("answer", ""),
            tags=updated.get("tags", []),
            createdAt=to_iso_string(updated.get("createdAt")),
            updatedAt=to_iso_string(updated.get("updatedAt"))
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating FAQ: {str(e)}")


@router.delete("/faqs/{faq_id}", status_code=204)
async def delete_faq(
    faq_id: str,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_database),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service)
):
    """Delete a FAQ and its embedding."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        
        # Validate ObjectId format
        if not ObjectId.is_valid(faq_id):
            raise HTTPException(status_code=400, detail="Invalid FAQ ID format")
        
        # Delete FAQ from database
        result = collection.delete_one({"_id": ObjectId(faq_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="FAQ not found")
        
        # Delete embedding in background task and rebuild index
        def delete_embedding():
            faq_embedding_service.delete_faq_embedding(
                faq_id=faq_id,
                db=db,
                rebuild_after_delete=True
            )
        
        background_tasks.add_task(delete_embedding)
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting FAQ: {str(e)}")


@router.delete("/faqs", status_code=204)
async def delete_multiple_faqs(
    background_tasks: BackgroundTasks,
    faq_ids: List[str] = Query(..., alias="ids"),
    db: Database = Depends(get_database),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service)
):
    """Delete multiple FAQs by their IDs and remove their embeddings."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.faqs
        
        # Convert string IDs to ObjectIds
        object_ids = []
        valid_faq_ids = []
        for faq_id in faq_ids:
            if ObjectId.is_valid(faq_id):
                object_ids.append(ObjectId(faq_id))
                valid_faq_ids.append(faq_id)
        
        if not object_ids:
            raise HTTPException(status_code=400, detail="No valid FAQ IDs provided")
        
        # Delete FAQs from database
        result = collection.delete_many({"_id": {"$in": object_ids}})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="No FAQs found to delete")
        
        # Delete embeddings in background task and rebuild index
        def delete_embeddings():
            faq_embedding_service.delete_multiple_faq_embeddings(
                faq_ids=valid_faq_ids,
                db=db,
                rebuild_after_delete=True
            )
        
        background_tasks.add_task(delete_embeddings)
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting FAQs: {str(e)}")


# ==================== FAQ Retrieval Endpoints ====================

class FAQSearchRequest(BaseModel):
    """Request model for FAQ search."""
    query: str = Field(..., min_length=1, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20)
    score_threshold: float = Field(default=0.0, ge=0.0, le=1.0)


class FAQSearchResult(BaseModel):
    """Response model for FAQ search result."""
    faq_id: str
    question: str
    answer: str
    score: float
    distance: float


@router.post("/faqs/search", response_model=List[FAQSearchResult])
async def search_faqs(
    request: FAQSearchRequest,
    db: Database = Depends(get_database),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service)
):
    """
    Search for similar FAQs using semantic similarity.
    This endpoint embeds the query and finds the most relevant FAQs.
    """
    try:
        results = faq_embedding_service.search_similar_faqs(
            query=request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold
        )
        
        # Fetch full FAQ details from database for each result
        if db:
            collection = db.faqs
            enhanced_results = []
            
            for result in results:
                faq_id = result["faq_id"]
                if ObjectId.is_valid(faq_id):
                    faq_doc = collection.find_one({"_id": ObjectId(faq_id)})
                    if faq_doc:
                        enhanced_results.append(FAQSearchResult(
                            faq_id=faq_id,
                            question=faq_doc.get("question", result.get("question", "")),
                            answer=faq_doc.get("answer", result.get("answer", "")),
                            score=result.get("score", 0.0),
                            distance=result.get("distance", 0.0)
                        ))
            
            # Return enhanced results if available, otherwise return basic results
            if enhanced_results:
                return enhanced_results
        
        # Fallback to basic results if database is not available
        return [
            FAQSearchResult(**result) for result in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching FAQs: {str(e)}")


# ==================== FILE PROCESSING ENDPOINTS ====================

class FileResponse(BaseModel):
    id: str
    name: str
    originalName: str
    type: str
    size: int
    status: str
    pagesExtracted: int
    totalChunks: int
    createdAt: str
    lastUpdated: str
    error: Optional[str] = None


def index_file_chunks_in_vector_store(
    file_id: str,
    file_processing_service: FileProcessingService,
    vector_store_service: VectorStoreService
):
    """Background task to index file chunks into vector store."""
    try:
        chunks = file_processing_service.get_file_chunks(file_id)
        if not chunks:
            return
        
        # Convert chunks to LangChain Documents
        documents = []
        for chunk in chunks:
            metadata = {
                "source": chunk.get("source", ""),
                "file_id": chunk.get("file_id", file_id),
                "chunk_index": chunk.get("chunk_index", 0),
                "chunk_id": chunk.get("id", ""),
                "type": "file"  # Mark as file chunk
            }
            
            doc = Document(
                page_content=chunk.get("text", ""),
                metadata=metadata
            )
            documents.append(doc)
        
        # Add documents to vector store
        if documents and vector_store_service.is_initialized():
            vector_store = vector_store_service.get_vector_store()
            if vector_store:
                vector_store.add_documents(documents)
                # Save the updated index
                from app.core.settings import get_settings
                settings = get_settings()
                vector_store.save_local(str(settings.faiss_index_path))
                logger.info(f"✅ Indexed {len(documents)} chunks from file {file_id}")
    except Exception as e:
        logger.error(f"❌ Error indexing chunks for file {file_id}: {e}")


def remove_file_chunks_from_vector_store(
    file_id: str,
    vector_store_service: VectorStoreService
):
    """Remove file chunks from vector store by filtering out documents with matching file_id."""
    try:
        if not vector_store_service.is_initialized():
            logger.warning("❌ Vector store not initialized, skipping removal")
            return False
        
        vector_store = vector_store_service.get_vector_store()
        if not vector_store:
            logger.warning("❌ Vector store instance not available")
            return False
        
        from app.core.settings import get_settings
        settings = get_settings()
        
        # Access the docstore to get all documents
        docstore = vector_store.docstore
        
        # Collect all documents that should be kept (not from the deleted file)
        documents_to_keep = []
        removed_count = 0
        
        # Iterate through all documents in the docstore
        if hasattr(docstore, '_dict'):
            for doc_id, doc in docstore._dict.items():
                metadata = getattr(doc, 'metadata', {})
                if not isinstance(metadata, dict):
                    documents_to_keep.append(doc)
                    continue
                    
                doc_file_id = metadata.get('file_id', '')
                
                if doc_file_id != file_id:
                    documents_to_keep.append(doc)
                else:
                    removed_count += 1
        
        if removed_count == 0:
            logger.info(f"ℹ️ No chunks found for file {file_id} in vector store")
            return True
        
        # Rebuild the vector store with remaining documents
        if documents_to_keep:
            logger.info(f"🔄 Rebuilding vector store with {len(documents_to_keep)} documents (removed {removed_count} from file {file_id})...")
            
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            new_vector_store = FAISS.from_documents(documents_to_keep, embeddings)
            new_vector_store.save_local(str(settings.faiss_index_path))
            vector_store_service.vector_store = new_vector_store
            
            logger.info(f"✅ Removed {removed_count} chunks from file {file_id}")
        else:
            # If no documents left, create a minimal index
            logger.warning(f"⚠️ All documents removed. Creating minimal index...")
            embeddings = vector_store_service.embeddings_service.get_embeddings()
            new_vector_store = FAISS.from_texts(
                ["Welcome to Sakura AI Assistant!"],
                embeddings
            )
            new_vector_store.save_local(str(settings.faiss_index_path))
            vector_store_service.vector_store = new_vector_store
            logger.info(f"✅ Removed all chunks from file {file_id} (index now minimal)")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error removing file chunks from vector store: {e}")
        import traceback
        traceback.print_exc()
        return False


@router.post("/files", response_model=FileResponse, status_code=202)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    dashboard_user_id: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    file_processing_service: FileProcessingService = Depends(get_file_processing_service),
    vector_store_service: VectorStoreService = Depends(get_vector_store_service)
):
    """Upload a file for processing and indexing."""
    # Validate file type
    allowed_extensions = {'.pdf', '.txt', '.docx', '.csv', '.xlsx', '.xls'}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Generate file ID
    file_id = f"file_{uuid.uuid4().hex[:12]}_{int(datetime.now().timestamp())}"
    
    # Determine file type
    file_type_map = {
        '.pdf': 'pdf',
        '.txt': 'txt',
        '.docx': 'docx',
        '.csv': 'csv',
        '.xlsx': 'xlsx',
        '.xls': 'xlsx'
    }
    file_type = file_type_map.get(file_extension, 'other')
    
    # Save file temporarily
    temp_dir = Path(tempfile.gettempdir())
    temp_file_path = temp_dir / f"{file_id}_{file.filename}"
    
    try:
        # Save uploaded file
        with open(temp_file_path, 'wb') as f:
            content = await file.read()
            f.write(content)
            file_size = len(content)
        
        # Create initial file entry in database
        db = get_database()
        if db is not None:
            files_collection = db.files
            files_collection.update_one(
                {"file_id": file_id},
                {
                    "$set": {
                        "file_id": file_id,
                        "name": file.filename,
                        "original_name": file.filename,
                        "type": file_type,
                        "size": file_size,
                        "status": "pending",
                        "pages_extracted": 0,
                        "total_chunks": 0,
                        "dashboard_user_id": dashboard_user_id,
                        "last_updated": datetime.now()
                    },
                    "$setOnInsert": {
                        "created_at": datetime.now(),
                        "error": None,
                        "config": {
                            "chunk_size": file_processing_service.chunk_size,
                            "overlap": file_processing_service.overlap
                        }
                    }
                },
                upsert=True
            )
            logger.info(f"✅ Created initial file entry in database: {file_id}")
        
        # Return initial response
        initial_file = {
            "id": file_id,
            "name": file.filename,
            "originalName": file.filename,
            "type": file_type,
            "size": file_size,
            "status": "pending",
            "pagesExtracted": 0,
            "totalChunks": 0,
            "createdAt": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat(),
            "error": None
        }
        
        # Process file in background
        def process_file():
            try:
                # Process file (extract text, chunk, store in MongoDB)
                processed_file = file_processing_service.process_file(
                    temp_file_path,
                    file.filename,
                    file_type,
                    file_id,
                    dashboard_user_id=dashboard_user_id
                )
                # After processing completes, index chunks in vector store
                if processed_file.get("status") == "completed":
                    index_file_chunks_in_vector_store(
                        file_id,
                        file_processing_service,
                        vector_store_service
                    )
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {e}")
            finally:
                # Clean up temp file
                if temp_file_path.exists():
                    temp_file_path.unlink()
        
        background_tasks.add_task(process_file)
        
        return FileResponse(**initial_file)
        
    except Exception as e:
        # Clean up temp file on error
        if temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")


@router.get("/files", response_model=List[FileResponse])
async def list_files(
    dashboard_user_id: Optional[str] = Query(None, description="Filter by dashboard user ID"),
    file_processing_service: FileProcessingService = Depends(get_file_processing_service)
):
    """List files, optionally filtered by dashboard user ID."""
    files = file_processing_service.list_files(dashboard_user_id=dashboard_user_id)
    return [FileResponse(**file) for file in files]


@router.get("/files/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    file_processing_service: FileProcessingService = Depends(get_file_processing_service)
):
    """Get file metadata by ID."""
    file = file_processing_service.get_file(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(**file)


@router.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    file_processing_service: FileProcessingService = Depends(get_file_processing_service),
    vector_store_service: VectorStoreService = Depends(get_vector_store_service)
):
    """Delete a file and its chunks from database and vector store."""
    file = file_processing_service.get_file(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from database
    success = file_processing_service.delete_file(file_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete file from database")
    
    # Remove chunks from vector store in background
    def remove_from_vector_store():
        remove_file_chunks_from_vector_store(file_id, vector_store_service)
    
    background_tasks.add_task(remove_from_vector_store)
    
    return {"message": "File deleted successfully", "file_id": file_id}

