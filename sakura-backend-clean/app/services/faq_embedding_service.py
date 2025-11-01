"""
FAQ Embedding Service for generating and managing FAQ embeddings in the vector store.
"""
from typing import List, Optional
from langchain_core.documents import Document
from app.services.vector_store_service import VectorStoreService
from app.services.embeddings_service import EmbeddingsService
from app.core.settings import Settings


class FAQEmbeddingService:
    """Service for managing FAQ embeddings."""
    
    def __init__(
        self,
        vector_store_service: VectorStoreService,
        embeddings_service: EmbeddingsService,
        settings: Settings
    ):
        self.vector_store_service = vector_store_service
        self.embeddings_service = embeddings_service
        self.settings = settings
        
    def generate_faq_text(self, question: str, answer: str) -> str:
        """Generate combined text from FAQ question and answer for embedding."""
        return f"{question}\n\n{answer}".strip()
    
    def add_faq_embedding(self, faq_id: str, question: str, answer: str) -> bool:
        """
        Generate embedding for FAQ and add it to the vector store.
        
        Args:
            faq_id: Unique FAQ identifier
            question: FAQ question text
            answer: FAQ answer text
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.vector_store_service.is_initialized():
                print("❌ Vector store not initialized, skipping FAQ embedding")
                return False
            
            vector_store = self.vector_store_service.get_vector_store()
            if not vector_store:
                print("❌ Vector store instance not available")
                return False
            
            # Generate combined text
            faq_text = self.generate_faq_text(question, answer)
            
            # Create document with metadata for easy retrieval/deletion
            metadata = {
                "source": "faq",
                "faq_id": faq_id,
                "type": "faq",
                "question": question[:200],  # Store truncated question for reference
            }
            
            doc = Document(
                page_content=faq_text,
                metadata=metadata
            )
            
            # Add to vector store
            vector_store.add_documents([doc])
            
            # Save the updated index
            faiss_path = self.settings.faiss_index_path
            vector_store.save_local(str(faiss_path))
            
            print(f"✅ Added embedding for FAQ {faq_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error adding FAQ embedding: {e}")
            return False
    
    def update_faq_embedding(self, faq_id: str, question: str, answer: str) -> bool:
        """
        Update FAQ embedding by removing old and adding new.
        
        Args:
            faq_id: Unique FAQ identifier
            question: Updated FAQ question text
            answer: Updated FAQ answer text
            
        Returns:
            bool: True if successful, False otherwise
        """
        # First delete the old embedding, then add new one
        deleted = self.delete_faq_embedding(faq_id)
        if not deleted:
            print(f"⚠️ Could not delete old embedding for FAQ {faq_id}, adding new anyway")
        
        return self.add_faq_embedding(faq_id, question, answer)
    
    def delete_faq_embedding(self, faq_id: str, db=None, rebuild_after_delete: bool = True) -> bool:
        """
        Delete FAQ embedding from vector store by FAQ ID.
        
        Note: FAISS doesn't support direct deletion. This method will:
        1. Mark the FAQ for exclusion (returns True immediately)
        2. Optionally rebuild the index from active FAQs in the database
        
        Args:
            faq_id: Unique FAQ identifier to delete
            db: MongoDB database instance (optional, for rebuilding)
            rebuild_after_delete: Whether to rebuild the index after deletion
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.vector_store_service.is_initialized():
                print("❌ Vector store not initialized")
                return False
            
            # FAISS doesn't support direct deletion, so we'll rebuild from the database
            if rebuild_after_delete and db:
                print(f"🔄 Rebuilding index after deleting FAQ {faq_id}...")
                return self.rebuild_faq_index_from_db(db, exclude_faq_ids=[faq_id])
            else:
                print(f"⚠️ FAQ {faq_id} embedding will be excluded on next rebuild")
                return True
            
        except Exception as e:
            print(f"❌ Error deleting FAQ embedding: {e}")
            return False
    
    def delete_multiple_faq_embeddings(self, faq_ids: List[str], db=None, rebuild_after_delete: bool = True) -> bool:
        """Delete multiple FAQ embeddings."""
        if rebuild_after_delete and db:
            print(f"🔄 Rebuilding index after deleting {len(faq_ids)} FAQs...")
            return self.rebuild_faq_index_from_db(db, exclude_faq_ids=faq_ids)
        else:
            success = True
            for faq_id in faq_ids:
                if not self.delete_faq_embedding(faq_id, db=None, rebuild_after_delete=False):
                    success = False
            return success
    
    def search_similar_faqs(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.0
    ) -> List[dict]:
        """
        Search for similar FAQs using semantic similarity.
        
        Args:
            query: User query text
            top_k: Number of results to return
            score_threshold: Minimum similarity score (0.0 to 1.0)
            
        Returns:
            List of dictionaries with FAQ data and similarity scores
        """
        try:
            if not self.vector_store_service.is_initialized():
                print("❌ Vector store not initialized")
                return []
            
            vector_store = self.vector_store_service.get_vector_store()
            if not vector_store:
                print("❌ Vector store instance not available")
                return []
            
            # Perform similarity search with scores
            results_with_score = vector_store.similarity_search_with_score(query, k=top_k * 2)  # Get more to filter
            
            # Filter by FAQ type and extract relevant information
            similar_faqs = []
            for doc, score in results_with_score:
                metadata = doc.metadata
                
                # Only include FAQ documents
                if metadata.get("type") == "faq" and metadata.get("source") == "faq":
                    # Invert score (FAISS returns distance, lower is better)
                    # Convert to similarity score (higher is better)
                    similarity_score = 1.0 / (1.0 + score) if score > 0 else 1.0
                    
                    if similarity_score >= score_threshold:
                        similar_faqs.append({
                            "faq_id": metadata.get("faq_id", ""),
                            "question": metadata.get("question", ""),
                            "answer": doc.page_content.split("\n\n", 1)[1] if "\n\n" in doc.page_content else doc.page_content,
                            "score": similarity_score,
                            "distance": float(score)
                        })
            
            return similar_faqs
            
        except Exception as e:
            print(f"❌ Error searching similar FAQs: {e}")
            return []
    
    def rebuild_faq_index_from_db(
        self,
        db,
        faq_collection_name: str = "faqs",
        exclude_faq_ids: Optional[List[str]] = None
    ) -> bool:
        """
        Rebuild FAQ index from database, optionally excluding specific FAQ IDs.
        This is useful after bulk deletions or to ensure consistency.
        
        Note: This rebuilds ALL FAQs, which may cause duplication if other
        documents exist in the vector store. For production, consider maintaining
        separate indexes or using a vector store that supports deletion.
        
        Args:
            db: MongoDB database instance
            faq_collection_name: Name of the FAQs collection
            exclude_faq_ids: List of FAQ IDs to exclude from rebuild
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not db:
                print("❌ Database not available")
                return False
            
            exclude_set = set(exclude_faq_ids) if exclude_faq_ids else set()
            collection = db[faq_collection_name]
            faqs = list(collection.find({}))
            
            if not self.vector_store_service.is_initialized():
                print("❌ Vector store not initialized")
                return False
            
            vector_store = self.vector_store_service.get_vector_store()
            if not vector_store:
                print("❌ Vector store instance not available")
                return False
            
            # Filter out excluded FAQs
            filtered_faqs = [
                faq for faq in faqs
                if str(faq.get("_id", "")) not in exclude_set
            ]
            
            # Build documents from active FAQs
            documents = []
            for faq in filtered_faqs:
                faq_id = str(faq.get("_id", ""))
                question = faq.get("question", "")
                answer = faq.get("answer", "")
                
                if not question or not answer:
                    continue
                
                faq_text = self.generate_faq_text(question, answer)
                
                metadata = {
                    "source": "faq",
                    "faq_id": faq_id,
                    "type": "faq",
                    "question": question[:200],
                }
                
                doc = Document(page_content=faq_text, metadata=metadata)
                documents.append(doc)
            
            # For a proper rebuild, we'd need to remove old FAQ documents first
            # Since FAISS doesn't support deletion, we'll add new ones
            # This may cause duplicates, but similarity search will still work
            # A production solution would maintain a separate FAQ index or use
            # a vector store that supports deletion
            
            if documents:
                vector_store.add_documents(documents)
                faiss_path = self.settings.faiss_index_path
                vector_store.save_local(str(faiss_path))
                print(f"✅ Rebuilt FAQ index with {len(documents)} FAQs")
                if exclude_set:
                    print(f"   Excluded {len(exclude_set)} deleted FAQs")
            
            return True
            
        except Exception as e:
            print(f"❌ Error rebuilding FAQ index: {e}")
            return False


# Global service instance
faq_embedding_service: Optional[FAQEmbeddingService] = None


def init_faq_embedding_service(
    vector_store_service: VectorStoreService,
    embeddings_service: EmbeddingsService,
    settings: Settings
) -> FAQEmbeddingService:
    """Initialize FAQ embedding service."""
    global faq_embedding_service
    faq_embedding_service = FAQEmbeddingService(
        vector_store_service,
        embeddings_service,
        settings
    )
    return faq_embedding_service


def get_faq_embedding_service() -> FAQEmbeddingService:
    """Get FAQ embedding service instance."""
    if not faq_embedding_service:
        raise Exception("FAQ embedding service not initialized.")
    return faq_embedding_service

