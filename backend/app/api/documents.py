from fastapi import APIRouter, UploadFile, File
from app.utils.file_utils import validate_file
from app.services.document_service import process_document
from app.db.repositories import DocumentRepository

router = APIRouter()

@router.get("")
async def get_documents():
    """Fetch all uploaded documents."""
    try:
        docs = DocumentRepository.get_all_documents()
        return [
            {
                "id": doc["id"],
                "filename": doc["filename"],
                "file_type": doc.get("file_type", ""),
                "created_at": doc["created_at"]
            }
            for doc in docs
        ]
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to retrieve documents")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Validate the uploaded file for type, size, and emptiness
    validate_file(file)
    
    # Process the document: save, extract text, write to processed folder
    result = await process_document(file)
    
    return result
