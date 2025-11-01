"""
Website crawling and chunking service.
Based on jsonl_x.py from the indexing scripts.
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

from app.core.settings import Settings


logger = logging.getLogger(__name__)


class WebsiteCrawlerService:
    """Service for crawling websites and extracting chunks."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        # Store under app/data/websites to match project data layout
        self.websites_data_dir = Path("app/data/websites")
        self.websites_data_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.websites_data_dir / "metadata.json"
        
        # Configuration
        self.max_pages = int(os.getenv("WEBSITE_MAX_PAGES", "50"))
        self.chunk_size = int(os.getenv("WEBSITE_CHUNK_SIZE", "200"))
        self.overlap = int(os.getenv("WEBSITE_CHUNK_OVERLAP", "50"))
        self.request_timeout = int(os.getenv("WEBSITE_REQUEST_TIMEOUT", "10"))
        
        # Load existing metadata
        self.websites_metadata = self._load_metadata()
    
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
    
    def process_website(self, url: str, website_id: Optional[str] = None) -> Dict:
        """Download and process a live website into chunked JSONL files."""
        parsed = urlparse(url)
        domain_name = parsed.netloc.replace("www.", "").replace(".", "_")
        
        # Use provided ID or create new one
        if website_id is None:
            website_id = f"{domain_name}_{int(datetime.now().timestamp())}"
        
        # Get existing metadata or create new
        if website_id not in self.websites_metadata:
            self.websites_metadata[website_id] = {
                "id": website_id,
                "url": url,
                "title": domain_name.replace("_", "."),
                "status": "pending",
                "pagesExtracted": 0,
                "totalChunks": 0,
                "createdAt": datetime.now().isoformat(),
                "lastUpdated": datetime.now().isoformat(),
                "error": None
            }
        
        # Update status to processing
        self.websites_metadata[website_id].update({
            "status": "processing",
            "lastUpdated": datetime.now().isoformat()
        })
        self._save_metadata()
        
        out_dir = self.websites_data_dir / domain_name
        out_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Download pages
            logger.info(f"Starting crawl for {url}...")
            pages = self.download_website(url, self.max_pages)
            
            if not pages:
                raise Exception("No pages could be fetched from the website")
            
            total_chunks = 0
            
            # Process each page
            for page_url, html_content in pages.items():
                logger.info(f"Processing page: {page_url}")
                text, title, headings, links = self.extract_content_from_html(html_content)
                chunks = self.chunk_text(text, self.chunk_size, self.overlap)
                
                safe_name = self.safe_stem(urlparse(page_url).path or "index")
                out_file = out_dir / f"{safe_name}_chunks.jsonl"
                
                # Write chunks to JSONL file
                with open(out_file, "w", encoding="utf-8") as f:
                    for i, chunk in enumerate(chunks):
                        chunk.update({
                            "source": page_url,
                            "chunk_index": i,
                            "title": title,
                            "headings": headings,
                            "links": links,
                            "website_id": website_id,
                            "domain": domain_name
                        })
                        f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
                
                total_chunks += len(chunks)
                logger.info(f"Saved {len(chunks)} chunks to {out_file}")
            
            # Update metadata with success
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
            self.websites_metadata[website_id].update({
                "status": "error",
                "error": error_msg,
                "lastUpdated": datetime.now().isoformat()
            })
            self._save_metadata()
            
            raise
    
    def get_website(self, website_id: str) -> Optional[Dict]:
        """Get website metadata by ID."""
        return self.websites_metadata.get(website_id)
    
    def list_websites(self) -> List[Dict]:
        """List all websites."""
        return list(self.websites_metadata.values())
    
    def delete_website(self, website_id: str) -> bool:
        """Delete a website and its chunks."""
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
        """Get all chunks for a website."""
        website = self.get_website(website_id)
        if not website:
            return []
        
        domain_name = urlparse(website["url"]).netloc.replace("www.", "").replace(".", "_")
        out_dir = self.websites_data_dir / domain_name
        
        chunks = []
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


def init_website_crawler_service(settings: Settings) -> WebsiteCrawlerService:
    """Initialize website crawler service."""
    global _website_crawler_service
    _website_crawler_service = WebsiteCrawlerService(settings)
    return _website_crawler_service


def get_website_crawler_service() -> WebsiteCrawlerService:
    """Get website crawler service instance."""
    if not _website_crawler_service:
        raise Exception("Website crawler service not initialized. Call init_website_crawler_service() first.")
    return _website_crawler_service
