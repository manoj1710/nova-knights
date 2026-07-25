"""
Report service for OmniInspect AI.
Handles generation, saving, and retrieval of batch inspection reports and dashboard statistics.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from config import settings
from services.utils import logger, is_safe_path


class ReportService:
    """
    Service responsible for managing batch JSON reports.
    """

    def __init__(self) -> None:
        """
        Ensures results directory exists.
        """
        settings.create_directories()

    def generate_batch_report(
        self,
        batch_id: str,
        screws: List[Dict[str, Any]],
        elapsed_seconds: float
    ) -> Dict[str, Any]:
        """
        Aggregates individual screw inspections into a complete batch report.

        Args:
            batch_id: Unique string identifier for the batch.
            screws: List of individual screw inspection dictionaries.
            elapsed_seconds: Total processing time in seconds.

        Returns:
            Dict[str, Any]: The finalized batch report dictionary.
        """
        total = len(screws)
        pass_count = sum(1 for s in screws if s.get("status") == "PASS")
        fail_count = sum(1 for s in screws if s.get("status") == "FAIL")
        review_count = sum(1 for s in screws if s.get("status") == "REVIEW")

        yield_percentage = round((pass_count / total) * 100, 1) if total > 0 else 0.0

        # Construct batch stats
        batch_report = {
            "batch_id": batch_id,
            "total": total,
            "pass": pass_count,
            "fail": fail_count,
            "review": review_count,
            "yield_percentage": yield_percentage,
            "inspection_time": f"{elapsed_seconds:.1f} seconds",
            "created_at": datetime.now().isoformat(),
            "screws": screws
        }

        # Save to results directory
        report_path = settings.RESULT_FOLDER / f"{batch_id}.json"
        try:
            with open(report_path, "w", encoding="utf-8") as f:
                json.dump(batch_report, f, indent=4)
            logger.info("Successfully saved batch report to %s", report_path)
        except Exception as e:
            logger.error("Failed to write batch report to %s: %s", report_path, str(e))

        return batch_report

    def get_report_by_id(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a saved batch report by ID.

        Args:
            batch_id: Unique batch identifier.

        Returns:
            Optional[Dict[str, Any]]: The report dictionary if found, else None.
        """
        report_path = settings.RESULT_FOLDER / f"{batch_id}.json"
        
        # Security path check
        if not is_safe_path(settings.RESULT_FOLDER, report_path):
            logger.warning("Unsafe path traversal attempt blocked for batch ID: %s", batch_id)
            return None

        if not report_path.exists():
            logger.info("Batch report not found: %s", report_path)
            return None

        try:
            with open(report_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error reading batch report file %s: %s", report_path, str(e))
            return None

    def get_dashboard_data(self) -> Dict[str, Any]:
        """
        Aggregates metrics from all saved batch reports to populate the dashboard.

        Returns:
            Dict[str, Any]: Dashboard aggregation data.
        """
        total_batches = 0
        total_screws_inspected = 0
        total_pass = 0
        total_fail = 0
        total_review = 0
        batch_summaries: List[Dict[str, Any]] = []

        try:
            # Read all JSON files in the results folder
            for report_file in settings.RESULT_FOLDER.glob("*.json"):
                try:
                    with open(report_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    total_batches += 1
                    total_screws_inspected += data.get("total", 0)
                    total_pass += data.get("pass", 0)
                    total_fail += data.get("fail", 0)
                    total_review += data.get("review", 0)

                    # Simple summary info for dashboard table
                    batch_summaries.append({
                        "batch_id": data.get("batch_id"),
                        "total": data.get("total", 0),
                        "pass": data.get("pass", 0),
                        "fail": data.get("fail", 0),
                        "review": data.get("review", 0),
                        "yield_percentage": data.get("yield_percentage", 0),
                        "inspection_time": data.get("inspection_time", ""),
                        "created_at": data.get("created_at", "")
                    })
                except Exception as e:
                    logger.warning("Failed to parse report file %s for dashboard: %s", report_file, str(e))
        except Exception as e:
            logger.error("Failed to aggregate dashboard data: %s", str(e))

        # Sort batch summaries by date descending
        batch_summaries.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        overall_yield = (
            round((total_pass / total_screws_inspected) * 100, 1)
            if total_screws_inspected > 0
            else 0.0
        )

        return {
            "total_batches": total_batches,
            "total_screws_inspected": total_screws_inspected,
            "total_pass": total_pass,
            "total_fail": total_fail,
            "total_review": total_review,
            "overall_yield_percentage": overall_yield,
            "recent_batches": batch_summaries[:10]  # Return last 10 batches
        }

    def search_component_by_name(self, component_name: str) -> Optional[Dict[str, Any]]:
        """
        Searches all batch reports to locate a specific screw component by name (e.g. crop_1.jpg).

        Args:
            component_name: The file name or name tag of the screw.

        Returns:
            Optional[Dict[str, Any]]: The screw's inspection details and batch_id if found.
        """
        try:
            for report_file in settings.RESULT_FOLDER.glob("*.json"):
                try:
                    with open(report_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    # Search through screws in batch
                    for screw in data.get("screws", []):
                        if screw.get("name") == component_name or component_name in screw.get("name", ""):
                            # Attach batch info
                            result = dict(screw)
                            result["batch_id"] = data.get("batch_id")
                            result["inspected_at"] = data.get("created_at")
                            return result
                except Exception as e:
                    logger.warning("Error searching report %s for component: %s", report_file, str(e))
        except Exception as e:
            logger.error("Failed to perform component search: %s", str(e))

        return None
