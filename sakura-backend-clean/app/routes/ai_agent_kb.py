"""
AI Agent Knowledge Base selection management API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from pymongo.database import Database
from bson import ObjectId

from app.core.database import get_database
from app.services.vector_store_service import get_vector_store_service, VectorStoreService
from app.services.website_crawler_service import get_website_crawler_service, WebsiteCrawlerService
from app.services.faq_embedding_service import get_faq_embedding_service, FAQEmbeddingService
from app.services.file_processing_service import get_file_processing_service, FileProcessingService

router = APIRouter(prefix="/api/ai-agent", tags=["AI Agent KB Selection"])


class KBItemSelection(BaseModel):
    """Model for a single KB item selection."""
    id: str = Field(..., description="KB item ID")
    type: str = Field(..., description="KB item type: 'website', 'faq', or 'file'")


class KBSelectionRequest(BaseModel):
    """Request model for updating KB selections."""
    enabled_kb_items: List[KBItemSelection] = Field(default_factory=list, description="List of enabled KB items")
    dashboard_user_id: Optional[str] = Field(None, description="Dashboard user ID")


class KBSelectionResponse(BaseModel):
    """Response model for KB selections."""
    success: bool
    enabled_kb_items: List[KBItemSelection]
    dashboard_user_id: Optional[str]
    updated_at: str


def get_enabled_kb_items(dashboard_user_id: str, db: Database) -> List[KBItemSelection]:
    """Get enabled KB items for a dashboard user."""
    if db is None:
        return []
    
    collection = db["ai-agent-kb-selections"]
    doc = collection.find_one({"dashboard_user_id": dashboard_user_id})
    
    if doc:
        return [
            KBItemSelection(id=item["id"], type=item["type"])
            for item in doc.get("enabled_kb_items", [])
        ]
    return []


def save_enabled_kb_items(
    dashboard_user_id: str,
    enabled_items: List[KBItemSelection],
    db: Database
) -> None:
    """Save enabled KB items for a dashboard user."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    collection = db["ai-agent-kb-selections"]
    collection.update_one(
        {"dashboard_user_id": dashboard_user_id},
        {
            "$set": {
                "enabled_kb_items": [
                    {"id": item.id, "type": item.type}
                    for item in enabled_items
                ],
                "updated_at": datetime.now()
            }
        },
        upsert=True
    )


@router.get("/kb-selection", response_model=KBSelectionResponse)
async def get_kb_selection(
    dashboard_user_id: str = Query(..., description="Dashboard user ID"),
    db: Database = Depends(get_database)
):
    """Get current KB selections for a dashboard user."""
    try:
        enabled_items = get_enabled_kb_items(dashboard_user_id, db)
        
        return KBSelectionResponse(
            success=True,
            enabled_kb_items=enabled_items,
            dashboard_user_id=dashboard_user_id,
            updated_at=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"❌ Error getting KB selection: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting KB selection: {str(e)}")


@router.post("/kb-selection", response_model=KBSelectionResponse)
async def update_kb_selection(
    request: KBSelectionRequest,
    db: Database = Depends(get_database),
    vector_store_service: VectorStoreService = Depends(get_vector_store_service),
    crawler_service: WebsiteCrawlerService = Depends(get_website_crawler_service),
    faq_embedding_service: FAQEmbeddingService = Depends(get_faq_embedding_service),
    file_processing_service: FileProcessingService = Depends(get_file_processing_service)
):
    """Update KB selections and rebuild vector store with only enabled items."""
    try:
        if not request.dashboard_user_id:
            raise HTTPException(status_code=400, detail="dashboard_user_id is required")
        
        # Save selections to database
        save_enabled_kb_items(
            request.dashboard_user_id,
            request.enabled_kb_items,
            db
        )
        
        # Rebuild vector store with only enabled items
        # This will be done synchronously for now (can be moved to background if needed)
        from app.services.kb_vector_store_manager import rebuild_vector_store_with_enabled_items
        
        # Convert to dict format for the rebuild function
        enabled_items_dict = [
            {"id": item.id, "type": item.type}
            for item in request.enabled_kb_items
        ]
        
        # Rebuild vector store (this will filter chunks by enabled items)
        rebuild_vector_store_with_enabled_items(
            dashboard_user_id=request.dashboard_user_id,
            enabled_items=enabled_items_dict,
            db=db,
            vector_store_service=vector_store_service,
            crawler_service=crawler_service,
            faq_embedding_service=faq_embedding_service,
            file_processing_service=file_processing_service
        )
        
        return KBSelectionResponse(
            success=True,
            enabled_kb_items=request.enabled_kb_items,
            dashboard_user_id=request.dashboard_user_id,
            updated_at=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating KB selection: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating KB selection: {str(e)}")

