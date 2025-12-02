from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from pathlib import Path

router = APIRouter()

# Setup static dir
BASE_DIR = Path(__file__).resolve().parent.parent.parent
print("--base dir : ", BASE_DIR)
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

@router.get("/serve-files/{filename}")
async def serve_file(filename: str):
    file_path = STATIC_DIR / filename
    print(f"Serving file: {filename}")
    print(f"File path: {file_path}")
    print(f"File exists: {file_path.exists()}")
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    print(f"Successfully serving: {file_path}")
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='image/png',
        headers={"Cache-Control": "no-cache"}
    )