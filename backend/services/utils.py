"""
Utility module for the OmniInspect AI application.
Provides logging setup, file validation, path safety helpers, and general utilities.
"""

import logging
from logging.handlers import RotatingFileHandler
import mimetypes
from pathlib import Path
from config import settings

# Global logger setup flag
_logger_configured = False


def setup_logger() -> logging.Logger:
    """
    Sets up the application logger with console and file handlers.
    
    Returns:
        logging.Logger: The configured application logger.
    """
    global _logger_configured
    logger = logging.getLogger("OmniInspectAI")
    
    if _logger_configured:
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Ensure logs folder exists
    settings.create_directories()
    log_file = settings.LOG_FOLDER / "app.log"
    
    # Create formatters
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s [%(name)s:%(filename)s:%(lineno)d] - %(message)s"
    )
    
    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File Handler with rotation
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    _logger_configured = True
    logger.info("Logging successfully initialized. Log file: %s", log_file)
    return logger


# Initialize logger
logger = setup_logger()


def is_safe_path(base_dir: Path, target_path: Path) -> bool:
    """
    Checks if a target path is safe and stays within the designated base directory.
    Prevents path traversal attacks.
    
    Args:
        base_dir: The base folder which the path should be within.
        target_path: The resolved path to check.
        
    Returns:
        bool: True if safe, False otherwise.
    """
    try:
        resolved_base = base_dir.resolve()
        resolved_target = target_path.resolve()
        return resolved_base in resolved_target.parents or resolved_base == resolved_target
    except Exception as e:
        logger.error("Path safety check failed for %s and %s: %s", base_dir, target_path, str(e))
        return False


def validate_image_file(file_path: Path) -> None:
    """
    Validates that a file is a valid image, has allowed extensions, and does not exceed the size limit.
    Raises ValueError if validation fails.
    
    Args:
        file_path: Path to the image file to validate.
    """
    if not file_path.exists():
        raise ValueError(f"File {file_path.name} does not exist.")
        
    # Check file size
    file_size_mb = file_path.stat().st_size / (1024 * 1024)
    if file_size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise ValueError(
            f"File size {file_size_mb:.2f}MB exceeds the maximum allowed limit of {settings.MAX_IMAGE_SIZE_MB}MB."
        )
        
    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    ext = file_path.suffix.lower()
    if ext not in allowed_extensions:
        raise ValueError(f"Unsupported file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}")
        
    # Validate MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type or not mime_type.startswith("image/"):
        raise ValueError(f"Invalid MIME type '{mime_type}'. Must be an image file.")
