"""
Inspection service for OmniInspect AI.
Orchestrates the entire inspection pipeline:
Image upload validation -> OpenCV detection & cropping -> Concurrent Gemini Vision API calls -> Report Compilation.
"""

import asyncio
import time
from pathlib import Path
from typing import Dict, List, Any
from config import settings
from services.crop_detector import OpenCVScrewDetector
from services.gemini_service import GeminiService
from services.report import ReportService
from services.utils import logger


class InspectionService:
    """
    Coordinator class executing the full quality inspection pipeline.
    """

    def __init__(self) -> None:
        """
        Initializes detector, Gemini service, and report compiler.
        """
        self.detector = OpenCVScrewDetector()
        self.gemini_service = GeminiService()
        self.report_service = ReportService()

    async def run_batch_inspection(self, image_path: Path, batch_id: str) -> Dict[str, Any]:
        """
        Main pipeline execution.
        1. Reads image and detects contours using OpenCV.
        2. Crops screws and saves them.
        3. Concurrently inspects crops using Gemini Vision API.
        4. Calculates metrics and compiles final JSON report.

        Args:
            image_path: Path to the uploaded inspection image.
            batch_id: Generated batch identifier.

        Returns:
            Dict[str, Any]: Compiled inspection report.
        """
        start_time = time.time()
        logger.info("Initializing batch inspection %s for image %s", batch_id, image_path)

        # 1. Detection and cropping
        # Wraps OpenCV execution. (Can be swapped with a deep learning detector).
        crops_metadata = self.detector.detect_and_crop(
            image_path=image_path,
            output_dir=settings.CROP_FOLDER,
            batch_id=batch_id
        )

        if not crops_metadata:
            logger.warning("Zero components detected in image: %s", image_path)
            elapsed_seconds = time.time() - start_time
            return self.report_service.generate_batch_report(batch_id, [], elapsed_seconds)

        logger.info("OpenCV detected %d components. Starting concurrent AI analysis.", len(crops_metadata))

        # 2. Concurrently inspect each crop
        # Use asyncio Semaphore to throttle requests to the Gemini API (respecting rate limits)
        semaphore = asyncio.Semaphore(settings.GEMINI_CONCURRENCY_LIMIT)

        async def inspect_crop_worker(crop_info: Dict[str, Any]) -> Dict[str, Any]:
            async with semaphore:
                crop_path = Path(crop_info["crop_path"])
                
                # Gemini service is synchronous. We run it in a thread pool executor
                # to prevent blocking the FastAPI asyncio event loop.
                loop = asyncio.get_running_loop()
                result = await loop.run_in_executor(
                    None, 
                    self.gemini_service.inspect_crop, 
                    crop_path
                )

                # Merge original metadata (bounding box, ID, filename) with the AI analysis
                return {
                    "id": crop_info["id"],
                    "name": crop_info["name"],
                    "bbox": crop_info["bbox"],
                    "status": result.get("status", "REVIEW"),
                    "confidence": result.get("confidence", 0.0),
                    "defect": result.get("defect", "Unknown"),
                    "severity": result.get("severity", "None"),
                    "reason": result.get("reason", "No details available."),
                    "recommendation": result.get("recommendation", "Manual visual check."),
                    "summary": result.get("summary", "Analysis incomplete.")
                }

        # Schedule all workers in parallel
        tasks = [inspect_crop_worker(crop) for crop in crops_metadata]
        inspected_screws = await asyncio.gather(*tasks)

        # 3. Compile report and calculate batch statistics
        elapsed_seconds = time.time() - start_time
        logger.info("Finished batch inspection %s. Total time: %.2f seconds.", batch_id, elapsed_seconds)
        
        batch_report = self.report_service.generate_batch_report(
            batch_id=batch_id,
            screws=inspected_screws,
            elapsed_seconds=elapsed_seconds
        )

        return batch_report
