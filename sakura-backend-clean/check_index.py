"""
Script to check if team_chunks.jsonl content is indexed in FAISS.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.settings import get_settings
from app.services.embeddings_service import init_embeddings_service
from app.services.vector_store_service import init_vector_store_service
import json


def check_team_chunks_in_index():
    """Check if team chunks are in the FAISS index."""
    print("🔍 Checking if team_chunks.jsonl is indexed in FAISS...\n")
    
    settings = get_settings()
    
    # Initialize services
    print("📚 Initializing services...")
    embeddings_service = init_embeddings_service(settings)
    vector_store_service = init_vector_store_service(settings, embeddings_service)
    
    if not vector_store_service.is_initialized():
        print("❌ Vector store not initialized")
        return
    
    vector_store = vector_store_service.get_vector_store()
    if not vector_store:
        print("❌ Vector store instance not available")
        return
    
    print(f"✅ FAISS index loaded with {vector_store.index.ntotal} total vectors\n")
    
    # Read the team_chunks.jsonl to see what should be indexed
    team_chunks_path = Path("websites/sakurasupport_live/team_chunks.jsonl")
    if not team_chunks_path.exists():
        team_chunks_path = Path("app/data/websites/sakurasupport_live/team_chunks.jsonl")
    
    if not team_chunks_path.exists():
        print(f"⚠️  Could not find team_chunks.jsonl at {team_chunks_path}")
        return
    
    print(f"📄 Reading {team_chunks_path}...")
    with open(team_chunks_path, 'r', encoding='utf-8') as f:
        team_chunks = [json.loads(line) for line in f if line.strip()]
    
    print(f"📊 Found {len(team_chunks)} chunks in team_chunks.jsonl\n")
    
    # Check each chunk
    found_count = 0
    not_found_count = 0
    
    for i, chunk in enumerate(team_chunks):
        chunk_text = chunk.get("text", "")
        chunk_source = chunk.get("source", "")
        
        # Search for this chunk in FAISS
        print(f"Checking chunk {i+1}/{len(team_chunks)}:")
        print(f"  Source: {chunk_source}")
        print(f"  Text preview: {chunk_text[:100]}...")
        
        # Search using the chunk text
        results = vector_store_service.similarity_search_with_score(chunk_text[:200], k=5)
        
        found = False
        for doc, score in results:
            # Check if this document matches our chunk
            doc_source = doc.metadata.get("source", "")
            doc_text = doc.page_content[:100] if len(doc.page_content) > 100 else doc.page_content
            
            # Check if source matches or if text is very similar
            if doc_source == chunk_source or doc_text.lower()[:50] == chunk_text.lower()[:50]:
                print(f"  ✅ FOUND in index (similarity score: {score:.4f})")
                print(f"     Metadata: {doc.metadata}")
                found = True
                found_count += 1
                break
        
        if not found:
            print(f"  ❌ NOT FOUND in index")
            print(f"     Closest match score: {results[0][1] if results else 'N/A'}")
            if results:
                print(f"     Closest match source: {results[0][0].metadata.get('source', 'unknown')}")
            not_found_count += 1
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total chunks checked: {len(team_chunks)}")
    print(f"✅ Found in index: {found_count}")
    print(f"❌ Not found in index: {not_found_count}")
    
    if not_found_count > 0:
        print(f"\n⚠️  {not_found_count} chunks from team_chunks.jsonl are NOT indexed!")
        print("   You may need to re-index the website chunks.")
    
    # Also search for "Founders" specifically
    print("\n" + "=" * 80)
    print("Searching for 'Founders' content...")
    print("=" * 80)
    
    founders_results = vector_store_service.similarity_search_with_score("Founders", k=10)
    
    if founders_results:
        print(f"Found {len(founders_results)} results containing 'Founders':\n")
        for i, (doc, score) in enumerate(founders_results[:5], 1):
            source = doc.metadata.get("source", "unknown")
            text_preview = doc.page_content[:200]
            print(f"{i}. Source: {source}")
            print(f"   Score: {score:.4f}")
            print(f"   Preview: {text_preview}...")
            print(f"   Metadata: {doc.metadata}")
            print()
    else:
        print("❌ No results found for 'Founders'")
    
    # Check all documents in index
    print("\n" + "=" * 80)
    print("Checking all indexed documents...")
    print("=" * 80)
    
    # Get sample documents by searching for common terms
    all_results = vector_store_service.similarity_search("sakura", k=20)
    
    sources = {}
    for doc in all_results:
        source = doc.metadata.get("source", "unknown")
        if source not in sources:
            sources[source] = 0
        sources[source] += 1
    
    print(f"\nSources found in index ({len(sources)} unique):")
    for source, count in sorted(sources.items()):
        print(f"  - {source}: {count} documents")
        if "team" in source.lower():
            print(f"    ✅ Team page is indexed!")


if __name__ == "__main__":
    check_team_chunks_in_index()

