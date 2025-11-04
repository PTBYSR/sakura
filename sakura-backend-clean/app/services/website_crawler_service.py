"""
Website crawling and chunking service.
Now stores chunks and metadata in MongoDB instead of JSONL files.
"""
import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse, urljoin
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from pymongo.database import Database

from app.core.settings import Settings


logger = logging.getLogger(__name__)


class WebsiteCrawlerService:
    """Service for crawling websites and extracting chunks."""
    
    def __init__(self, settings: Settings, db: Optional[Database] = None):
        self.settings = settings
        self.db = db
        
        # Keep file-based storage as fallback for backward compatibility
        self.websites_data_dir = Path("app/data/websites")
        self.websites_data_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.websites_data_dir / "metadata.json"
        
        # Configuration
        self.max_pages = int(os.getenv("WEBSITE_MAX_PAGES", "50"))
        self.chunk_size = int(os.getenv("WEBSITE_CHUNK_SIZE", "200"))
        self.overlap = int(os.getenv("WEBSITE_CHUNK_OVERLAP", "50"))
        self.request_timeout = int(os.getenv("WEBSITE_REQUEST_TIMEOUT", "10"))
        
        # Initialize database indexes if database is available
        if self.db is not None:
            self._initialize_indexes()
        
        # Load existing metadata (for backward compatibility with file-based storage)
        self.websites_metadata = self._load_metadata()
    
    def _initialize_indexes(self):
        """Create indexes on MongoDB collections for better query performance."""
        try:
            # Indexes for websites collection
            websites_collection = self.db.websites
            websites_collection.create_index("website_id", unique=True)
            websites_collection.create_index("dashboard_user_id")
            websites_collection.create_index("status")
            websites_collection.create_index([("dashboard_user_id", 1), ("status", 1)])
            logger.info("✅ Created indexes on websites collection")
            
            # Indexes for website-chunks collection
            chunks_collection = self.db["website-chunks"]
            chunks_collection.create_index("website_id")
            chunks_collection.create_index("dashboard_user_id")
            chunks_collection.create_index([("dashboard_user_id", 1), ("website_id", 1)])
            chunks_collection.create_index("source")
            chunks_collection.create_index([("website_id", 1), ("source", 1), ("chunk_index", 1)])
            # Text index for full-text search on chunk text
            chunks_collection.create_index([("text", "text")])
            logger.info("✅ Created indexes on website-chunks collection")
        except Exception as e:
            logger.warning(f"⚠️  Could not create indexes: {e}")
    
    def _load_metadata(self) -> Dict:
        """Load website metadata from JSON file."""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading metadata: {e}")
                return {}
        return {}
    
    def _save_metadata(self):
        """Save website metadata to JSON file."""
        try:
            with open(self.metadata_file, "w", encoding="utf-8") as f:
                json.dump(self.websites_metadata, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
    
    def safe_stem(self, filename: str) -> str:
        """Return a clean stem for output filenames."""
        stem = Path(filename).stem
        return re.sub(r'[^A-Za-z0-9._-]', '_', stem)
    
    def extract_content_from_html(self, html_content: str) -> tuple:
        """Extract visible text + metadata from HTML content."""
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove script, style, and noscript tags
        for s in soup(['script', 'style', 'noscript']):
            s.decompose()
        
        title = soup.title.string.strip() if soup.title and soup.title.string else ""
        headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])]
        links = []
        for a in soup.find_all("a", href=True):
            try:
                links.append({
                    "text": a.get_text(strip=True),
                    "href": a["href"]
                })
            except:
                pass
        
        text = soup.get_text(separator='\n')
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n\n".join(lines)
        
        return clean_text, title, headings, links
    
    def chunk_text(self, text: str, chunk_size: Optional[int] = None, overlap: Optional[int] = None) -> List[Dict]:
        """Split text into overlapping word chunks."""
        chunk_size = chunk_size or self.chunk_size
        overlap = overlap or self.overlap
        
        words = re.findall(r"\S+", text)
        chunks = []
        i = 0
        while i < len(words):
            start = i
            end = min(i + chunk_size, len(words))
            chunk_words = words[start:end]
            chunk_text = " ".join(chunk_words)
            chunks.append({
                "id": f"chunk_{start}_{end}",
                "start_word": start,
                "end_word": end - 1,
                "text": chunk_text
            })
            i = i + chunk_size - overlap
        return chunks
    
    def download_website(self, base_url: str, limit: Optional[int] = None) -> Dict[str, str]:
        """Fetch and store HTML pages from a website (basic internal crawler)."""
        limit = limit or self.max_pages
        visited = set()
        to_visit = [base_url]
        html_files = {}
        
        while to_visit and len(visited) < limit:
            url = to_visit.pop(0)
            if url in visited:
                continue
            
            # Only crawl URLs from the same domain
            parsed_base = urlparse(base_url)
            parsed_url = urlparse(url)
            
            if parsed_url.netloc.replace("www.", "") != parsed_base.netloc.replace("www.", ""):
                continue
            
            visited.add(url)
            
            try:
                logger.info(f"Fetching {url}...")
                resp = requests.get(url, timeout=self.request_timeout, allow_redirects=True)
                resp.raise_for_status()
                
                # Only process HTML content
                content_type = resp.headers.get('content-type', '').lower()
                if 'html' not in content_type:
                    continue
                
                html_files[url] = resp.text
                
                # Extract links for further crawling
                soup = BeautifulSoup(resp.text, "html.parser")
                for a in soup.find_all("a", href=True):
                    href = a["href"]
                    full_url = urljoin(base_url, href)
                    parsed_full = urlparse(full_url)
                    
                    # Only add if same domain and not visited
                    if (parsed_full.netloc.replace("www.", "") == parsed_base.netloc.replace("www.", "") 
                        and full_url not in visited
                        and full_url not in to_visit):
                        to_visit.append(full_url)
            
            except Exception as e:
                logger.warning(f"Error fetching {url}: {e}")
                continue
        
        return html_files
    
    def process_website(self, url: str, website_id: Optional[str] = None, dashboard_user_id: Optional[str] = None) -> Dict:
        """Download and process a live website, storing chunks in MongoDB."""
        parsed = urlparse(url)
        domain_name = parsed.netloc.replace("www.", "").replace(".", "_")
        
        # Use provided ID or create new one
        if website_id is None:
            website_id = f"{domain_name}_{int(datetime.now().timestamp())}"
        
        now = datetime.now()
        
        # Get existing metadata from database or create new
        if self.db is not None:
            websites_collection = self.db.websites
            existing = websites_collection.find_one({"website_id": website_id})
            
            if not existing:
                # Create new website entry in database
                website_doc = {
                    "website_id": website_id,
                    "url": url,
                    "title": parsed.netloc.replace("www.", ""),
                    "domain": domain_name,
                    "status": "pending",
                    "pages_extracted": 0,
                    "total_chunks": 0,
                    "dashboard_user_id": dashboard_user_id,
                    "created_at": now,
                    "last_updated": now,
                    "error": None,
                    "config": {
                        "max_pages": self.max_pages,
                        "chunk_size": self.chunk_size,
                        "overlap": self.overlap
                    }
                }
                websites_collection.insert_one(website_doc)
                logger.info(f"✅ Created new website entry in database: {website_id}")
            else:
                # Get dashboard_user_id from existing record if not provided
                if not dashboard_user_id:
                    dashboard_user_id = existing.get("dashboard_user_id")
        else:
            # Fallback to file-based metadata (backward compatibility)
            if website_id not in self.websites_metadata:
                self.websites_metadata[website_id] = {
                    "id": website_id,
                    "url": url,
                    "title": domain_name.replace("_", "."),
                    "status": "pending",
                    "pagesExtracted": 0,
                    "totalChunks": 0,
                    "createdAt": now.isoformat(),
                    "lastUpdated": now.isoformat(),
                    "error": None
                }
        
        # Update status to processing
        if self.db is not None:
            websites_collection.update_one(
                {"website_id": website_id},
                {
                    "$set": {
                        "status": "processing",
                        "last_updated": now
                    }
                }
            )
        else:
            self.websites_metadata[website_id].update({
                "status": "processing",
                "lastUpdated": now.isoformat()
            })
            self._save_metadata()
        
        try:
            # Download pages
            logger.info(f"Starting crawl for {url}...")
            pages = self.download_website(url, self.max_pages)
            
            if not pages:
                raise Exception("No pages could be fetched from the website")
            
            total_chunks = 0
            all_chunks = []  # Collect all chunks for bulk insert
            
            # Process each page
            for page_url, html_content in pages.items():
                logger.info(f"Processing page: {page_url}")
                text, title, headings, links = self.extract_content_from_html(html_content)
                chunks = self.chunk_text(text, self.chunk_size, self.overlap)
                
                # Prepare chunks for database storage
                for i, chunk in enumerate(chunks):
                    chunk_doc = {
                        "website_id": website_id,
                        "dashboard_user_id": dashboard_user_id,
                        "source": page_url,
                        "page_title": title,
                        "chunk_index": i,
                        "chunk_id": chunk["id"],
                        "start_word": chunk["start_word"],
                        "end_word": chunk["end_word"],
                        "text": chunk["text"],
                        "headings": headings,
                        "links": links,
                        "domain": domain_name,
                        "created_at": now
                    }
                    all_chunks.append(chunk_doc)
                
                total_chunks += len(chunks)
                logger.info(f"Prepared {len(chunks)} chunks from page: {page_url}")
            
            # Store chunks in MongoDB (bulk insert for efficiency)
            if self.db is not None and all_chunks:
                chunks_collection = self.db["website-chunks"]
                # Delete existing chunks for this website first (in case of re-processing)
                chunks_collection.delete_many({"website_id": website_id})
                # Bulk insert all chunks
                chunks_collection.insert_many(all_chunks)
                logger.info(f"✅ Stored {len(all_chunks)} chunks in MongoDB for website {website_id}")
            
            # Fallback: Also save to JSONL files for backward compatibility (if no DB)
            if self.db is None:
                out_dir = self.websites_data_dir / domain_name
                out_dir.mkdir(parents=True, exist_ok=True)
                for chunk_doc in all_chunks:
                    safe_name = self.safe_stem(urlparse(chunk_doc["source"]).path or "index")
                    out_file = out_dir / f"{safe_name}_chunks.jsonl"
                    with open(out_file, "a", encoding="utf-8") as f:
                        # Convert to JSONL format
                        jsonl_chunk = {
                            "id": chunk_doc["chunk_id"],
                            "start_word": chunk_doc["start_word"],
                            "end_word": chunk_doc["end_word"],
                            "text": chunk_doc["text"],
                            "source": chunk_doc["source"],
                            "chunk_index": chunk_doc["chunk_index"],
                            "title": chunk_doc["page_title"],
                            "headings": chunk_doc["headings"],
                            "links": chunk_doc["links"],
                            "website_id": chunk_doc["website_id"],
                            "domain": chunk_doc["domain"]
                        }
                        f.write(json.dumps(jsonl_chunk, ensure_ascii=False) + "\n")
            
            # Update metadata with success
            if self.db is not None:
                websites_collection.update_one(
                    {"website_id": website_id},
                    {
                        "$set": {
                            "status": "completed",
                            "pages_extracted": len(pages),
                            "total_chunks": total_chunks,
                            "last_updated": datetime.now()
                        }
                    }
                )
                # Return updated website document
                updated = websites_collection.find_one({"website_id": website_id})
                return {
                    "id": updated["website_id"],
                    "url": updated["url"],
                    "title": updated["title"],
                    "status": updated["status"],
                    "pagesExtracted": updated["pages_extracted"],
                    "totalChunks": updated["total_chunks"],
                    "createdAt": updated["created_at"].isoformat() if isinstance(updated["created_at"], datetime) else updated["created_at"],
                    "lastUpdated": updated["last_updated"].isoformat() if isinstance(updated["last_updated"], datetime) else updated["last_updated"],
                    "error": updated.get("error"),
                    "dashboard_user_id": updated.get("dashboard_user_id")
                }
            else:
                # Fallback to file-based metadata
                self.websites_metadata[website_id].update({
                    "status": "completed",
                    "pagesExtracted": len(pages),
                    "totalChunks": total_chunks,
                    "lastUpdated": datetime.now().isoformat()
                })
                self._save_metadata()
                return self.websites_metadata[website_id]
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error processing website {url}: {error_msg}")
            
            # Update metadata with error
            if self.db is not None:
                websites_collection = self.db.websites
                websites_collection.update_one(
                    {"website_id": website_id},
                    {
                        "$set": {
                            "status": "error",
                            "error": error_msg,
                            "last_updated": datetime.now()
                        }
                    }
                )
            else:
                self.websites_metadata[website_id].update({
                    "status": "error",
                    "error": error_msg,
                    "lastUpdated": datetime.now().isoformat()
                })
                self._save_metadata()
            
            raise
    
    def get_website(self, website_id: str) -> Optional[Dict]:
        """Get website metadata by ID from database or file-based storage."""
        if self.db is not None:
            websites_collection = self.db.websites
            website = websites_collection.find_one({"website_id": website_id})
            if website:
                # Convert MongoDB document to dict format
                return {
                    "id": website["website_id"],
                    "url": website["url"],
                    "title": website.get("title", ""),
                    "status": website["status"],
                    "pagesExtracted": website.get("pages_extracted", 0),
                    "totalChunks": website.get("total_chunks", 0),
                    "createdAt": website["created_at"].isoformat() if isinstance(website["created_at"], datetime) else website["created_at"],
                    "lastUpdated": website["last_updated"].isoformat() if isinstance(website["last_updated"], datetime) else website["last_updated"],
                    "error": website.get("error"),
                    "dashboard_user_id": website.get("dashboard_user_id")
                }
        return self.websites_metadata.get(website_id)
    
    def list_websites(self, dashboard_user_id: Optional[str] = None) -> List[Dict]:
        """List all websites, optionally filtered by dashboard_user_id."""
        if self.db is not None:
            websites_collection = self.db.websites
            query = {}
            if dashboard_user_id:
                query["dashboard_user_id"] = dashboard_user_id
            
            websites = list(websites_collection.find(query).sort("created_at", -1))
            # Convert MongoDB documents to dict format
            result = []
            for website in websites:
                result.append({
                    "id": website["website_id"],
                    "url": website["url"],
                    "title": website.get("title", ""),
                    "status": website["status"],
                    "pagesExtracted": website.get("pages_extracted", 0),
                    "totalChunks": website.get("total_chunks", 0),
                    "createdAt": website["created_at"].isoformat() if isinstance(website["created_at"], datetime) else website["created_at"],
                    "lastUpdated": website["last_updated"].isoformat() if isinstance(website["last_updated"], datetime) else website["last_updated"],
                    "error": website.get("error"),
                    "dashboard_user_id": website.get("dashboard_user_id")
                })
            return result
        return list(self.websites_metadata.values())
    
    def delete_website(self, website_id: str) -> bool:
        """Delete a website and its chunks from database and/or file system."""
        if self.db is not None:
            websites_collection = self.db.websites
            website = websites_collection.find_one({"website_id": website_id})
            if not website:
                return False
            
            # Delete website metadata
            websites_collection.delete_one({"website_id": website_id})
            
            # Delete all chunks for this website
            chunks_collection = self.db["website-chunks"]
            result = chunks_collection.delete_many({"website_id": website_id})
            logger.info(f"✅ Deleted {result.deleted_count} chunks from database for website {website_id}")
            
            # Also delete from file system if it exists (cleanup)
            domain_name = urlparse(website["url"]).netloc.replace("www.", "").replace(".", "_")
            out_dir = self.websites_data_dir / domain_name
            if out_dir.exists():
                import shutil
                shutil.rmtree(out_dir)
            
            return True
        else:
            # Fallback to file-based deletion
            if website_id not in self.websites_metadata:
                return False
            
            website = self.websites_metadata[website_id]
            domain_name = urlparse(website["url"]).netloc.replace("www.", "").replace(".", "_")
            
            # Delete the directory
            out_dir = self.websites_data_dir / domain_name
            if out_dir.exists():
                import shutil
                shutil.rmtree(out_dir)
            
            # Remove from metadata
            del self.websites_metadata[website_id]
            self._save_metadata()
            
            return True
    
    def get_website_chunks(self, website_id: str) -> List[Dict]:
        """Get all chunks for a website from database or file system."""
        if self.db is not None:
            chunks_collection = self.db["website-chunks"]
            chunks = list(chunks_collection.find(
                {"website_id": website_id}
            ).sort("source", 1).sort("chunk_index", 1))
            
            # Convert MongoDB documents to dict format (compatible with existing code)
            result = []
            for chunk in chunks:
                result.append({
                    "id": chunk.get("chunk_id", ""),
                    "start_word": chunk.get("start_word", 0),
                    "end_word": chunk.get("end_word", 0),
                    "text": chunk.get("text", ""),
                    "source": chunk.get("source", ""),
                    "chunk_index": chunk.get("chunk_index", 0),
                    "title": chunk.get("page_title", ""),
                    "headings": chunk.get("headings", []),
                    "links": chunk.get("links", []),
                    "website_id": chunk.get("website_id", ""),
                    "domain": chunk.get("domain", "")
                })
            return result
        
        # Fallback to file-based retrieval
        website = self.get_website(website_id)
        if not website:
            return []
        
        domain_name = urlparse(website["url"]).netloc.replace("www.", "").replace(".", "_")
        out_dir = self.websites_data_dir / domain_name
        
        chunks = []
        if out_dir.exists():
            for jsonl_file in out_dir.rglob("*.jsonl"):
                try:
                    with open(jsonl_file, "r", encoding="utf-8") as f:
                        for line in f:
                            if line.strip():
                                chunks.append(json.loads(line))
                except Exception as e:
                    logger.error(f"Error reading {jsonl_file}: {e}")
        
        return chunks


# Global service instance
_website_crawler_service: Optional[WebsiteCrawlerService] = None


def init_website_crawler_service(settings: Settings, db: Optional[Database] = None) -> WebsiteCrawlerService:
    """Initialize website crawler service with optional database."""
    global _website_crawler_service
    _website_crawler_service = WebsiteCrawlerService(settings, db=db)
    return _website_crawler_service


def get_website_crawler_service() -> WebsiteCrawlerService:
    """Get website crawler service instance."""
    if not _website_crawler_service:
        raise Exception("Website crawler service not initialized. Call init_website_crawler_service() first.")
    return _website_crawler_service
