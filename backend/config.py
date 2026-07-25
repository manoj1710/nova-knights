"""
Configuration module for the OmniInspect AI application.
Loads settings from environment variables and provides a single configuration object.
"""

from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Force override=True so that changes in .env take priority over terminal/system environment variables
load_dotenv(override=True)


class Settings(BaseSettings):
    """
    Settings class loading environment variables for OmniInspect AI.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # API Keys
    GEMINI_API_KEY: str = "your_gemini_api_key_here"

    # Folders
    UPLOAD_FOLDER: Path = Path("uploads")
    CROP_FOLDER: Path = Path("crops")
    RESULT_FOLDER: Path = Path("results")
    LOG_FOLDER: Path = Path("logs")

    # Upload and processing parameters
    MAX_IMAGE_SIZE_MB: int = 10
    GEMINI_CONCURRENCY_LIMIT: int = 5

    # OpenCV Detection parameters
    DETECTION_MIN_AREA: int = 1000
    DETECTION_MAX_AREA: int = 100000

    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    def create_directories(self) -> None:
        """
        Creates the configured directories if they do not exist.
        """
        for folder in [self.UPLOAD_FOLDER, self.CROP_FOLDER, self.RESULT_FOLDER, self.LOG_FOLDER]:
            folder.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
