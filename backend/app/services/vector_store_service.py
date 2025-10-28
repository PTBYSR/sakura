"""
Vector store service for FAISS-based similarity search.
"""
import jsonlines
from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from app.core.settings import Settings
from app.services.embeddings_service import EmbeddingsService


class VectorStoreService:
    """Service for managing vector store operations."""
    
    def __init__(self, settings: Settings, embeddings_service: EmbeddingsService):
        self.settings = settings
        self.embeddings_service = embeddings_service
        self.vector_store: Optional[FAISS] = None
        
    def initialize_vector_store(self) -> None:
        """Initialize the vector store from JSONL files or cached index."""
        print("📚 Initializing knowledge base...")
        
        kb_folder = Path(self.settings.jsonl_data_path)
        index_dir = Path(self.settings.faiss_index_path)
        
        if not kb_folder.exists():
            print("⚠️  Warning: jsonl_data folder not found. Creating empty vector store.")
            # Create a dummy document to initialize the vector store
            dummy_doc = Document(page_content="Welcome to Sakura customer support", metadata={"id": "dummy"})
            embeddings = self.embeddings_service.get_embeddings()
            self.vector_store = FAISS.from_documents([dummy_doc], embeddings)
            return
        
        if index_dir.exists():
            print("🔄 Loading cached FAISS index...")
            try:
                embeddings = self.embeddings_service.get_embeddings()
                self.vector_store = FAISS.load_local(
                    str(index_dir),
                    embeddings,
                    allow_dangerous_deserialization=True
                )
                print("✅ FAISS index loaded successfully")
            except Exception as e:
                print(f"❌ Error loading FAISS index: {e}")
                print("🔄 Building new index...")
                self._build_new_index(kb_folder, index_dir)
        else:
            print("⚡ Building FAISS index from JSONL files...")
            self._build_new_index(kb_folder, index_dir)
    
    def _build_new_index(self, kb_folder: Path, index_dir: Path) -> None:
        """Build a new FAISS index from JSONL files."""
        docs = []
        
        jsonl_files = list(kb_folder.glob("*.jsonl"))
        print(f"📁 Found {len(jsonl_files)} JSONL files")
        
        for jsonl_file in jsonl_files:
            print(f"📖 Loading {jsonl_file.name}...")
            try:
                with jsonlines.open(jsonl_file) as reader:
                    for line in reader:
                        doc = Document(
                            page_content=line.get("text", ""),
                            metadata={
                                "id": line.get("id", ""),
                                "source": line.get("source", ""),
                                "title": line.get("title", ""),
                                "chunk_index": line.get("chunk_index", 0)
                            }
                        )
                        docs.append(doc)
            except Exception as e:
                print(f"❌ Error loading {jsonl_file.name}: {e}")
        
        print(f"📚 Total documents loaded: {len(docs)}")
        
        if docs:
            print("🔨 Building FAISS index...")
            embeddings = self.embeddings_service.get_embeddings()
            self.vector_store = FAISS.from_documents(docs, embeddings)
            self.vector_store.save_local(str(index_dir))
            print("✅ FAISS index built and saved")
        else:
            print("⚠️  No documents found, creating dummy vector store")
            dummy_doc = Document(page_content="Welcome to Sakura customer support", metadata={"id": "dummy"})
            embeddings = self.embeddings_service.get_embeddings()
            self.vector_store = FAISS.from_documents([dummy_doc], embeddings)
    
    def similarity_search(self, query: str, top_k: int = 3) -> List[Document]:
        """Perform similarity search on the vector store."""
        if self.vector_store is None:
            print("❌ Vector store not initialized")
            return []
        
        try:
            results = self.vector_store.similarity_search(query, k=top_k)
            return results
        except Exception as e:
            print(f"❌ Error during similarity search: {e}")
            return []
    
    def get_vector_store(self) -> Optional[FAISS]:
        """Get the vector store instance."""
        return self.vector_store
    
    def is_initialized(self) -> bool:
        """Check if vector store is initialized."""
        return self.vector_store is not None


# Global vector store service instance
vector_store_service: Optional[VectorStoreService] = None


def init_vector_store_service(settings: Settings, embeddings_service: EmbeddingsService) -> VectorStoreService:
    """Initialize vector store service."""
    global vector_store_service
    vector_store_service = VectorStoreService(settings, embeddings_service)
    vector_store_service.initialize_vector_store()
    return vector_store_service


def get_vector_store_service() -> VectorStoreService:
    """Get vector store service instance for dependency injection."""
    if not vector_store_service:
        raise Exception("Vector store service not initialized. Call init_vector_store_service() first.")
    return vector_store_service

