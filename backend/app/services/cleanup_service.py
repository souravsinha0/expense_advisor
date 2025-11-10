import os
import time
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def cleanup_old_files():
    """Clean up files older than retention period"""
    try:
        retention_seconds = settings.FILE_RETENTION_DAYS * 24 * 60 * 60
        current_time = time.time()
        
        # Clean /tmp directory
        tmp_dir = Path("/tmp")
        if tmp_dir.exists():
            for file_path in tmp_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > retention_seconds:
                        file_path.unlink()
                        logger.info(f"Deleted old file: {file_path}")
        
        # Clean static directory
        static_dir = Path(__file__).resolve().parent.parent / "static"
        if static_dir.exists():
            for file_path in static_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > retention_seconds:
                        file_path.unlink()
                        logger.info(f"Deleted old static file: {file_path}")
                        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")