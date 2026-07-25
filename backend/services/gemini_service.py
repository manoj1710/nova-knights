"""
Gemini service for OmniInspect AI.
Handles calling the Google Gemini API using the official google-genai SDK,
enforcing structured JSON outputs via Pydantic schemas.
"""

import os
from pathlib import Path
from typing import Dict, Any, Literal
from PIL import Image
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError

from config import settings
from services.utils import logger


class ScrewInspectionResult(BaseModel):
    """
    Pydantic schema representing the structured inspection result returned by Gemini.
    """
    defect: Literal["Normal", "Rust", "Scratch", "Crack", "Dent", "Unknown"] = Field(
        ..., description="The main defect category detected on the screw."
    )
    status: Literal["PASS", "FAIL", "REVIEW"] = Field(
        ..., description="Status of the inspection. PASS if acceptable, FAIL if defective, REVIEW if suspicious."
    )
    confidence: float = Field(
        ..., description="AI confidence score for this analysis, between 0.0 and 100.0."
    )
    severity: Literal["None", "Low", "Medium", "High", "Critical"] = Field(
        ..., description="Severity of the defect detected."
    )
    reason: str = Field(
        ..., description="Detailed technical reason justifying the classification and status."
    )
    recommendation: str = Field(
        ..., description="Actionable recommendation: e.g. Approve, Scrap, Rework, Re-inspect."
    )
    summary: str = Field(
        ..., description="A short, readable summary summarizing the overall screw quality."
    )


class GeminiService:
    """
    Service responsible for interacting with the Google Gemini Vision API.
    """

    def __init__(self) -> None:
        """
        Initializes the GenAI client using the API key loaded from configurations.
        """
        # Ensure API key is configured
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_gemini_api_key_here":
            # Check env directly in case it changed
            api_key = os.getenv("GEMINI_API_KEY", "")
            
        # Standard Gemini API keys. We run in simulated mode only if key is placeholder or 'SIMULATE'
        self.api_key_valid = bool(
            api_key 
            and api_key != "your_gemini_api_key_here" 
            and api_key != "SIMULATE"
        )
        if not self.api_key_valid:
            logger.warning(
                "GEMINI_API_KEY is not set or set to 'SIMULATE'. "
                "Gemini service will run in offline simulation mode."
            )
            self.client = None
        else:
            try:
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.error("Failed to initialize GenAI client: %s", str(e))
                self.client = None
                self.api_key_valid = False

    def inspect_crop(self, crop_path: Path) -> Dict[str, Any]:
        """
        Sends a cropped screw image to Gemini Vision API for structured inspection.
        If Gemini is unavailable or errors out, returns a clean fallback dictionary.

        Args:
            crop_path: Path to the cropped screw image file.

        Returns:
            Dict[str, Any]: Inspection report matching the ScrewInspectionResult schema.
        """
        logger.info("Starting Gemini inspection on crop: %s", crop_path.name)

        if not crop_path.exists():
            logger.error("Crop file not found: %s", crop_path)
            return self._get_fallback_result("File not found error.")

        # Offline/Simulation fallback if API key is not configured
        if not self.api_key_valid or self.client is None:
            logger.info("Running offline simulation mode for crop: %s", crop_path.name)
            return self._generate_simulated_result(crop_path)

        try:
            # Load the image using PIL
            with Image.open(crop_path) as img:
                # Prompt to instruct Gemini on its role
                prompt = (
                    "You are an industrial quality control inspector. Analyze this cropped image of a screw. "
                    "Determine if there is any defect (Normal, Rust, Scratch, Crack, Dent, Unknown), "
                    "assign inspection status (PASS, FAIL, REVIEW), confidence (0.0 to 100.0), severity, "
                    "provide a concise technical reason, recommendation, and a summary."
                )

                # Retry logic for 429 Rate Limit / Resource Exhausted
                max_retries = 5
                retry_delay = 5.0  # Start with 5 seconds delay
                
                for attempt in range(max_retries):
                    try:
                        # Send request using new google-genai client
                        response = self.client.models.generate_content(
                            model="gemini-2.5-flash",
                            contents=[img, prompt],
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json",
                                response_schema=ScrewInspectionResult,
                                temperature=0.1,
                            ),
                        )
                        
                        if response.text:
                            import json
                            parsed_response = json.loads(response.text)
                            logger.info("Successfully received Gemini response for %s: %s", crop_path.name, parsed_response.get("status"))
                            return parsed_response
                        else:
                            raise APIError("Empty response text from Gemini API.", None)
                            
                    except APIError as api_err:
                        # If rate limited (429) or server error (503/500), retry with backoff
                        is_retryable = api_err.code in [429, 500, 503]
                        if is_retryable and attempt < max_retries - 1:
                            logger.warning(
                                "Temporary API error (%d) for %s on attempt %d/%d. Retrying in %.1f seconds...",
                                api_err.code, crop_path.name, attempt + 1, max_retries, retry_delay
                            )
                            import time
                            time.sleep(retry_delay)
                            retry_delay *= 2  # Exponential backoff
                            continue
                        # If not retryable or out of retries, raise the error
                        raise

        except Exception as e:
            logger.error("Gemini API call failed for %s after retry attempts: %s", crop_path.name, str(e))
            return self._get_fallback_result(f"Gemini inspection failed: {str(e)}")

    def _get_fallback_result(self, error_message: str) -> Dict[str, Any]:
        """
        Returns a structured fallback report in case of API failure.
        """
        return {
            "defect": "Unknown",
            "status": "REVIEW",
            "confidence": 0.0,
            "severity": "Critical",
            "reason": f"System error during analysis. Details: {error_message}",
            "recommendation": "Submit for manual visual inspection.",
            "summary": "AI inspection failed to evaluate this component."
        }

    def _generate_simulated_result(self, crop_path: Path) -> Dict[str, Any]:
        """
        Generates standard deterministic simulated results for hackathon demonstrations
        when no Gemini API key is provided, based on the file name.
        """
        import random
        # Seed by file name length or similar to have deterministic but varying results per crop
        seed_val = sum(ord(c) for c in crop_path.name)
        random.seed(seed_val)

        defects = ["Normal", "Rust", "Scratch", "Crack", "Dent"]
        weights = [0.70, 0.10, 0.08, 0.07, 0.05]
        
        defect = random.choices(defects, weights=weights)[0]
        
        if defect == "Normal":
            status = "PASS"
            severity = "None"
            confidence = round(random.uniform(92.0, 99.8), 1)
            reason = "No structural defects or surface contamination observed."
            recommendation = "Approve and proceed with assembly."
            summary = "Surface condition is excellent."
        else:
            status = "FAIL" if defect in ["Crack", "Rust"] else "REVIEW"
            severity = "High" if defect == "Crack" else "Medium"
            confidence = round(random.uniform(75.0, 94.5), 1)
            reason = f"Detected surface anomaly matching profile for {defect}."
            recommendation = "Reject crop and separate from batch." if status == "FAIL" else "Flag for secondary visual review."
            summary = f"Defective screw with {defect} markings."

        return {
            "defect": defect,
            "status": status,
            "confidence": confidence,
            "severity": severity,
            "reason": reason,
            "recommendation": recommendation,
            "summary": summary
        }
