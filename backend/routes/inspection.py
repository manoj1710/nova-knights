"""
Inspection routes module for OmniInspect AI.
Implements the HTTP endpoints for batch inspections, reports, dashboard, component query, and health check.
Adheres to the architectural guideline of containing no OpenCV, Gemini, or business logic.
"""

from datetime import datetime
import time
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from config import settings
from services.inspection_service import InspectionService
from services.report import ReportService
from services.utils import logger, validate_image_file, is_safe_path

router = APIRouter()


# Dependency injection providers
def get_inspection_service() -> InspectionService:
    return InspectionService()


def get_report_service() -> ReportService:
    return ReportService()


def make_response(success: bool, message: str, data: Any = None) -> Dict[str, Any]:
    """
    Helper function to wrap all API responses in the standard format.
    """
    return {
        "success": success,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }


@router.post("/batch-inspection", status_code=status.HTTP_201_CREATED)
async def batch_inspection(
    file: UploadFile = File(...),
    inspection_service: InspectionService = Depends(get_inspection_service)
) -> Dict[str, Any]:
    """
    Receives an uploaded industrial image, detects screws, crops them, runs AI inspection, and reports results.
    """
    logger.info("Received request for POST /batch-inspection. Filename: %s", file.filename)

    # 1. Generate unique Batch ID
    batch_id = f"BATCH-{int(time.time())}"
    
    # Ensure upload directory exists
    settings.create_directories()
    
    # Save the file temporarily to validate it
    temp_filename = f"{batch_id}_{file.filename}"
    upload_path = settings.UPLOAD_FOLDER / temp_filename

    # Prevent path traversal
    if not is_safe_path(settings.UPLOAD_FOLDER, upload_path):
        logger.warning("Path traversal attempt in upload filename: %s", file.filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=make_response(
                success=False,
                message="Invalid and unsafe filename.",
                data={"filename": file.filename}
            )
        )

    try:
        # Write file contents
        content = await file.read()
        
        # Check size before writing to disk
        file_size_mb = len(content) / (1024 * 1024)
        if file_size_mb > settings.MAX_IMAGE_SIZE_MB:
            logger.warning("Upload rejected: file size %.2fMB exceeds limit.", file_size_mb)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=make_response(
                    success=False,
                    message=f"File exceeds size limit of {settings.MAX_IMAGE_SIZE_MB}MB.",
                    data={"size_mb": round(file_size_mb, 2)}
                )
            )

        with open(upload_path, "wb") as f:
            f.write(content)

        # 2. Validate using service validator (extension and MIME check)
        validate_image_file(upload_path)

    except ValueError as val_err:
        logger.warning("Validation failed for uploaded file: %s", str(val_err))
        # Clean up file if written
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=make_response(
                success=False,
                message=f"Image validation failed: {str(val_err)}"
            )
        )
    except HTTPException:
        # Re-raise FastAPIs HTTPExceptions directly
        if upload_path.exists():
            upload_path.unlink()
        raise
    except Exception as e:
        logger.error("Failed to save/process uploaded file: %s", str(e))
        if upload_path.exists():
            upload_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=make_response(
                success=False,
                message="Internal server error saving uploaded image."
            )
        )

    # 3. Trigger inspection service workflow
    try:
        report = await inspection_service.run_batch_inspection(upload_path, batch_id)
        return make_response(
            success=True,
            message="Batch inspection completed successfully.",
            data=report
        )
    except Exception as e:
        logger.error("Error running batch inspection %s: %s", batch_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=make_response(
                success=False,
                message=f"Inspection failed: {str(e)}"
            )
        )


@router.get("/dashboard")
async def get_dashboard(
    report_service: ReportService = Depends(get_report_service)
) -> Dict[str, Any]:
    """
    Returns aggregated metrics and summaries across all batch inspections.
    """
    logger.info("Received request for GET /dashboard")
    try:
        dashboard_data = report_service.get_dashboard_data()
        return make_response(
            success=True,
            message="Dashboard statistics retrieved.",
            data=dashboard_data
        )
    except Exception as e:
        logger.error("Error retrieving dashboard: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=make_response(
                success=False,
                message="Failed to load dashboard data."
            )
        )


@router.get("/report/{batch_id}")
async def get_report(
    batch_id: str,
    report_service: ReportService = Depends(get_report_service)
) -> Dict[str, Any]:
    """
    Retrieves a specific inspection report by its batch ID.
    """
    logger.info("Received request for GET /report/%s", batch_id)
    try:
        report = report_service.get_report_by_id(batch_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=make_response(
                    success=False,
                    message=f"Report with batch ID '{batch_id}' not found."
                )
            )
        return make_response(
            success=True,
            message="Report retrieved successfully.",
            data=report
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching report %s: %s", batch_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=make_response(
                success=False,
                message=f"Failed to fetch report: {str(e)}"
            )
        )


@router.get("/component/{component_id}")
async def get_component(
    component_id: str,
    report_service: ReportService = Depends(get_report_service)
) -> Dict[str, Any]:
    """
    Searches for a specific component (e.g. crop_1.jpg) across all batch reports.
    """
    logger.info("Received request for GET /component/%s", component_id)
    try:
        component = report_service.search_component_by_name(component_id)
        if not component:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=make_response(
                    success=False,
                    message=f"Component '{component_id}' not found in any batch."
                )
            )
        return make_response(
            success=True,
            message="Component inspection details retrieved.",
            data=component
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving component %s: %s", component_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=make_response(
                success=False,
                message=f"Failed to query component: {str(e)}"
            )
        )


@router.get("/health")
async def get_health() -> Dict[str, Any]:
    """
    Endpoint for health/readiness checks.
    """
    return make_response(
        success=True,
        message="OmniInspect AI backend is healthy and running.",
        data={
            "status": "UP",
            "time": datetime.now().isoformat(),
            "environment": "Production/Hackathon"
        }
    )
