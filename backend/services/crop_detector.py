"""
Crop detector service for OmniInspect AI.
Contains base classes for object detection and concrete implementation using OpenCV.
Designed to be easily replaceable with modern DL models (e.g., YOLOv8).
"""

from abc import ABC, abstractmethod
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
from config import settings
from services.utils import logger


class BaseDetector(ABC):
    """
    Abstract base class for all component detectors.
    Ensures easy switching between OpenCV and Deep Learning models (like YOLO).
    """

    @abstractmethod
    def detect_and_crop(
        self, image_path: Path, output_dir: Path, batch_id: str
    ) -> List[Dict[str, Any]]:
        """
        Detects components within the image, crops them, and saves the crops.

        Args:
            image_path: Path to the original full-size image.
            output_dir: Directory where crops should be saved.
            batch_id: The ID of the current batch inspection.

        Returns:
            List[Dict[str, Any]]: List of metadata dictionaries for each crop.
        """
        pass


class OpenCVScrewDetector(BaseDetector):
    """
    OpenCV-based screw detector using traditional computer vision methods:
    Grayscale -> Gaussian Blur -> Otsu Thresholding -> Morphological Closing -> Contour Filtering.
    """

    def detect_and_crop(
        self, image_path: Path, output_dir: Path, batch_id: str
    ) -> List[Dict[str, Any]]:
        """
        Processes image to detect, crop, and save screws.

        Args:
            image_path: Path to the original image.
            output_dir: Path to directory to save cropped screws.
            batch_id: Current batch identifier.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries representing detected screws.
        """
        logger.info("Starting OpenCV detection on %s", image_path)
        
        # Read image
        # cv2.imread doesn't support Path objects directly on all versions, convert to string
        img = cv2.imread(str(image_path))
        if img is None:
            logger.error("Failed to load image via OpenCV from: %s", image_path)
            raise ValueError(f"Failed to read image at {image_path}. File might be corrupted.")

        h_img, w_img, _ = img.shape
        logger.info("Loaded image size: %dx%d", w_img, h_img)

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Gaussian Blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # 3. Thresholding (Otsu + Binary Inv)
        # Assuming light background and darker screws. If background varies, we can use adaptive.
        # Let's combine Otsu and Adaptive to be extremely robust.
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )

        # 4. Morphological Closing to fill small holes inside detected screws
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # 5. Find contours
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        logger.info("Found %d raw contours in image", len(contours))

        crops_metadata: List[Dict[str, Any]] = []
        crop_count = 0

        # Create output directory if it doesn't exist
        output_dir.mkdir(parents=True, exist_ok=True)

        for idx, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            
            # Filter by area limits configured in env
            if area < settings.DETECTION_MIN_AREA or area > settings.DETECTION_MAX_AREA:
                continue

            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)

            # Filter out extreme aspect ratio anomalies (e.g. very thin lines or dots)
            aspect_ratio = float(w) / h if h > 0 else 0
            if aspect_ratio < 0.1 or aspect_ratio > 10.0:
                continue

            crop_count += 1
            
            # Add padding to crop for better Gemini vision context
            padding = 15
            x_pad = max(0, x - padding)
            y_pad = max(0, y - padding)
            w_pad = min(w_img - x_pad, w + 2 * padding)
            h_pad = min(h_img - y_pad, h + 2 * padding)

            # Perform the crop
            crop = img[y_pad : y_pad + h_pad, x_pad : x_pad + w_pad]

            # Save the cropped image
            crop_filename = f"{batch_id}_crop_{crop_count}.jpg"
            crop_path = output_dir / crop_filename
            
            # Save using OpenCV
            success = cv2.imwrite(str(crop_path), crop)
            if not success:
                logger.warning("Failed to save crop image to %s", crop_path)
                continue

            # Append metadata
            crops_metadata.append({
                "id": crop_count,
                "name": crop_filename,
                "crop_path": str(crop_path),
                "bbox": (int(x), int(y), int(w), int(h)),
                "area": float(area),
                "aspect_ratio": float(aspect_ratio)
            })

        logger.info("OpenCV detection finished. Cropped %d valid components.", len(crops_metadata))
        return crops_metadata
