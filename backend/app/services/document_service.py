import os
import json
from app.core.config import settings
from app.rag.chunker import TextChunker
from app.rag.embeddings import EmbeddingService
from app.db.repositories import DocumentRepository
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

import fitz  # PyMuPDF
import docx

# Setup paths relative to the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def extract_pdf_text(filepath: Path) -> str:
    text_content = ""
    try:
        doc = fitz.open(filepath)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text("text")
            text_content += f"--- Page {page_num + 1} ---\n{page_text}\n"
        doc.close()
    except Exception as e:
        raise Exception(f"Failed to extract PDF text: {str(e)}")
    return text_content

def extract_docx_text(filepath: Path) -> str:
    text_content = []
    try:
        doc = docx.Document(filepath)
        for para in doc.paragraphs:
            if para.text.strip():
                text_content.append(para.text.strip())
    except Exception as e:
        raise Exception(f"Failed to extract DOCX text: {str(e)}")
    return "\n".join(text_content)

def extract_txt_text(filepath: Path) -> str:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise Exception(f"Failed to read TXT file: {str(e)}")

async def process_document(file: UploadFile) -> dict:
    ext = os.path.splitext(file.filename)[1].lower()
    unique_id = str(uuid.uuid4())
    save_filename = f"{unique_id}_{file.filename}"
    upload_path = UPLOAD_DIR / save_filename
    processed_path = PROCESSED_DIR / f"{unique_id}.txt"

    # Save uploaded file
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # Create document record in database
    try:
        document_data = {
            "filename": file.filename,
            "file_type": ext[1:],
            "original_file_path": str(upload_path)
        }
        db_document = DocumentRepository.create_document(document_data)
        document_id = db_document.get("id")
        if not document_id:
            raise Exception("Database returned no document ID.")
    except Exception as e:
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to create document in database: {str(e)}")

    # Extract text
    text_content = ""
    try:
        if ext == ".pdf":
            text_content = extract_pdf_text(upload_path)
        elif ext == ".docx":
            text_content = extract_docx_text(upload_path)
        elif ext == ".txt":
            text_content = extract_txt_text(upload_path)
        else:
            raise ValueError("Unsupported extension")
    except Exception as e:
        # Cleanup uploaded file on failure
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))

    if not text_content.strip():
        # Cleanup uploaded file if no text
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(status_code=400, detail="No text could be extracted from the file.")

    # Save extracted text
    try:
        with open(processed_path, "w", encoding="utf-8") as f:
            f.write(text_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save processed text: {str(e)}")

    # Chunk the text
    try:
        chunker = TextChunker(chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap)
        raw_chunks = chunker.split_text(text_content)
        
        # Filter empty chunks and reassign indices
        chunks = []
        for c in raw_chunks:
            if c.text and c.text.strip():
                c.chunk_index = len(chunks)
                chunks.append(c)
                
        # Generate embeddings
        try:
            embedding_service = EmbeddingService()
            texts_to_embed = [chunk.text for chunk in chunks]
            
            if texts_to_embed:
                embeddings = embedding_service.embed_batch(texts_to_embed)
                
                if len(texts_to_embed) != len(embeddings):
                    raise ValueError(f"Batch embedding returned {len(embeddings)} embeddings for {len(texts_to_embed)} input chunks.")
                    
                for chunk, emb in zip(chunks, embeddings):
                    chunk.embedding = emb
        except ValueError as ve:
            raise HTTPException(status_code=500, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Validate dimensions and prepare chunks for DB
        db_chunks = []
        for chunk in chunks:
            if not chunk.embedding or len(chunk.embedding) != settings.embedding_dimension:
                raise ValueError(f"Invalid embedding dimension. Expected {settings.embedding_dimension}, got {len(chunk.embedding) if chunk.embedding else 0}")
                
            db_chunks.append({
                "document_id": document_id,
                "chunk_index": chunk.chunk_index,
                "content": chunk.text,
                "start_char": chunk.start_char,
                "end_char": chunk.end_char,
                "embedding": chunk.embedding
            })
            
        # Insert chunks into DB
        DocumentRepository.insert_document_chunks(db_chunks)
        
        # Save chunks to json
        chunks_filename = f"{unique_id}_{file.filename}_chunks.json"
        chunks_path = PROCESSED_DIR / chunks_filename
        
        chunks_dict = [chunk.model_dump() for chunk in chunks]
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(chunks_dict, f, indent=2, ensure_ascii=False)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to chunk text: {str(e)}")

    return {
        "filename": file.filename,
        "file_type": ext[1:],
        "status": "processed",
        "text_length": len(text_content),
        "chunk_count": len(chunks),
        "document_id": document_id,
        "database_saved": True,
        "message": "Document uploaded, processed and stored successfully."
    }
