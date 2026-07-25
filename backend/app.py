"""
OmniInspect AI Backend Application.
Configures the FastAPI app, registers routes, sets up CORS middleware,
mounts static folders for screw crops, and registers global exception handlers.
"""

from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from routes.inspection import router as inspection_router
from services.utils import logger

# 1. Initialize FastAPI app
app = FastAPI(
    title="OmniInspect AI Backend",
    description="Industrial quality inspection platform powered by Computer Vision and Gemini API",
    version="1.0.0"
)

# 2. Setup CORS Middleware for React frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Create required directories at startup
settings.create_directories()

# 4. Mount crops directory statically so frontend can render screw crop images
# Example: http://localhost:8000/crops/BATCH-123_crop_1.jpg
if settings.CROP_FOLDER.exists():
    app.mount("/crops", StaticFiles(directory=str(settings.CROP_FOLDER)), name="crops")
    logger.info("Mounted static crops directory: %s", settings.CROP_FOLDER)
else:
    logger.warning("Crops directory does not exist yet. Static mounting delayed until creation.")

# 5. Include routes
app.include_router(inspection_router)


# 6. Global Exception Handlers for uniform JSON response formatting
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handles request validation errors (HTTP 422) and returns them in the standardized format.
    """
    logger.warning("Validation error on path %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation failed.",
            "timestamp": datetime.now().isoformat(),
            "data": exc.errors()
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handles standard HTTP exceptions and formats the response.
    """
    logger.info("HTTP exception on path %s (status %d): %s", request.url.path, exc.status_code, exc.detail)
    
    # If detail is already formatted in our custom format, return it directly
    if isinstance(exc.detail, dict) and "success" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
        
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "timestamp": datetime.now().isoformat(),
            "data": None
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all exception handler to prevent any application crash or raw stack trace exposure.
    """
    logger.error("Unhandled server exception on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred on the server.",
            "timestamp": datetime.now().isoformat(),
            "data": {"error_type": exc.__class__.__name__}
        }
    )


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server on %s:%d", settings.HOST, settings.PORT)
    uvicorn.run("app:app", host=settings.HOST, port=settings.PORT, reload=True)
