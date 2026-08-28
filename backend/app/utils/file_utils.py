import os
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit for local development
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

def validate_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename.")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}. Allowed types are PDF, DOCX, and TXT.")
    
    # Check file size by seeking to the end
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)  # Reset pointer to the beginning
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size is {MAX_FILE_SIZE / (1024 * 1024)} MB.")
