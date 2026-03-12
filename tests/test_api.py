import os
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

HISTORY_PATH = Path(tempfile.gettempdir()) / "beaver_study_history_test.jsonl"
os.environ["BEAVER_STUDY_HISTORY_PATH"] = str(HISTORY_PATH)
if HISTORY_PATH.exists():
    HISTORY_PATH.unlink()

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "beaver-study-orchestrator"
    assert data["ops_contract"]["schema"] == "ops-envelope-v1"
    assert data["readiness_contract"] == "beaver-study-runtime-brief-v1"
    assert data["report_contract"]["schema"] == "beaver-study-analysis-report-v1"
    assert data["links"]["meta"] == "/api/meta"
    assert data["links"]["runtime_brief"] == "/api/runtime/brief"
    assert data["links"]["review_pack"] == "/api/review-pack"
    assert data["links"]["analysis_schema"] == "/api/schema/analysis-report"
    assert data["links"]["analyze"] == "/api/analyze"
    assert data["links"]["recover"] == "/api/recover"
    assert "/api/runtime/brief" in data["routes"]
    assert "/api/review-pack" in data["routes"]
    assert "runtime-brief-surface" in data["capabilities"]
    assert "review-pack-surface" in data["capabilities"]
    assert "next_action" in data["diagnostics"]


def test_meta_runtime_brief_and_schema() -> None:
    meta = client.get("/api/meta")
    assert meta.status_code == 200
    meta_payload = meta.json()
    assert meta_payload["service"] == "beaver-study-orchestrator"
    assert meta_payload["readiness_contract"] == "beaver-study-runtime-brief-v1"
    assert meta_payload["report_contract"]["schema"] == "beaver-study-analysis-report-v1"
    assert "/api/recover" in meta_payload["routes"]

    brief = client.get("/api/runtime/brief")
    assert brief.status_code == 200
    brief_payload = brief.json()
    assert brief_payload["readiness_contract"] == "beaver-study-runtime-brief-v1"
    assert brief_payload["report_contract"]["schema"] == "beaver-study-analysis-report-v1"
    assert brief_payload["evidence_counts"]["weekly_inputs"] == 7
    assert len(brief_payload["stage_contract"]) == 4
    assert len(brief_payload["two_minute_review"]) == 4
    assert brief_payload["proof_assets"][0]["path"] == "/api/health"

    review_pack = client.get("/api/review-pack")
    assert review_pack.status_code == 200
    review_payload = review_pack.json()
    assert review_payload["readiness_contract"] == "beaver-study-review-pack-v1"
    assert "/api/review-pack" in review_payload["proof_bundle"]["review_routes"]
    assert "/api/recover" in review_payload["proof_bundle"]["review_routes"]
    assert review_payload["analysis_contract"]["schema"] == "beaver-study-analysis-report-v1"
    assert len(review_payload["two_minute_review"]) == 4
    assert review_payload["proof_assets"][0]["label"] == "Health Route"

    schema = client.get("/api/schema/analysis-report")
    assert schema.status_code == 200
    schema_payload = schema.json()
    assert schema_payload["schema"] == "beaver-study-analysis-report-v1"
    assert "plan.risk" in schema_payload["required_sections"]

    history_schema = client.get("/api/history/recent/schema")
    assert history_schema.status_code == 200
    history_schema_payload = history_schema.json()
    assert history_schema_payload["schema"] == "beaver-study-analysis-history-v1"


def test_analyze_endpoint_returns_plan_and_risk():
    payload = {
        "syllabus_text": """
        Assignment 1 due March 12, 2026
        Midterm Exam on March 22, 2026
        Project Demo due April 3, 2026
        """,
        "availability": {
            "monday": 2,
            "tuesday": 2,
            "wednesday": 2,
            "thursday": 2,
            "friday": 2,
            "saturday": 3,
            "sunday": 3,
        },
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "extraction" in data
    assert "plan" in data
    assert len(data["extraction"]["tasks"]) >= 2
    assert 0 <= data["plan"]["risk"]["score"] <= 1
    assert len(data["plan"]["risk"]["recommendations"]) >= 1
    assert data["plan"]["diagnostics"]["focus_days"] >= 1
    assert "next_action" in data["plan"]["diagnostics"]

    history = client.get("/api/history/recent?limit=3")
    assert history.status_code == 200
    history_payload = history.json()
    assert history_payload["schema"] == "beaver-study-analysis-history-v1"
    assert history_payload["items"][0]["task_count"] >= 2
    assert history_payload["items"][0]["risk_level"] in {"low", "medium", "high"}


def test_analyze_endpoint_respects_custom_start_date():
    payload = {
        "syllabus_text": """
        Assignment 1 due March 12, 2026
        Midterm Exam on March 22, 2026
        """,
        "availability": {
            "monday": 2,
            "tuesday": 2,
            "wednesday": 2,
            "thursday": 2,
            "friday": 2,
            "saturday": 3,
            "sunday": 3,
        },
        "start_date": "2026-03-10",
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    first_item = data["plan"]["study_plan"]["items"][0]
    assert first_item["date"] == "2026-03-10"
    assert data["plan"]["diagnostics"]["start_date"] == "2026-03-10"


def test_analyze_endpoint_handles_no_extractable_dates():
    payload = {
        "syllabus_text": "Read chapter 4 and prepare office hour questions before next week.",
        "availability": {
            "monday": 2,
            "tuesday": 2,
            "wednesday": 2,
            "thursday": 2,
            "friday": 2,
            "saturday": 2,
            "sunday": 2,
        },
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["extraction"]["tasks"] == []
    assert data["plan"]["risk"]["score"] == 0
    assert data["plan"]["risk"]["level"] == "low"
    assert len(data["plan"]["risk"]["recommendations"]) == 1
    assert data["plan"]["diagnostics"]["focus_days"] == 0
    assert "dated syllabus line" in data["plan"]["diagnostics"]["next_action"].lower()


def test_export_ics_returns_calendar_content():
    payload = {
        "tasks": [
            {
                "title": "Assignment 1",
                "due_date": "2026-03-12",
                "task_type": "assignment",
                "estimated_hours": 4,
                "difficulty": 0.6,
                "impact_weight": 0.8,
            }
        ],
        "availability": {
            "monday": 2,
            "tuesday": 2,
            "wednesday": 2,
            "thursday": 2,
            "friday": 2,
            "saturday": 2,
            "sunday": 2,
        },
    }

    response = client.post("/api/export/ics", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/calendar")
    assert "BEGIN:VCALENDAR" in response.text
    assert "DTSTART;VALUE=DATE:20260312" in response.text
    assert "DTEND;VALUE=DATE:20260313" in response.text


def test_what_if_endpoint_compares_capacity_scenarios():
    payload = {
        "tasks": [
            {
                "title": "Final Project",
                "due_date": "2026-03-12",
                "task_type": "project",
                "estimated_hours": 10,
                "difficulty": 0.9,
                "impact_weight": 1.3,
            },
            {
                "title": "Midterm",
                "due_date": "2026-03-15",
                "task_type": "exam",
                "estimated_hours": 8,
                "difficulty": 0.9,
                "impact_weight": 1.2,
            },
        ],
        "availability": {
            "monday": 1,
            "tuesday": 1,
            "wednesday": 1,
            "thursday": 1,
            "friday": 1,
            "saturday": 1,
            "sunday": 1,
        },
        "daily_boost": 1.0,
        "start_date": "2026-03-08",
    }

    response = client.post("/api/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "boosted" in data
    assert data["boosted"]["risk_score"] <= data["baseline"]["risk_score"]
    assert data["boosted"]["allocated_hours"] >= data["baseline"]["allocated_hours"]
    assert isinstance(data["recommendation"], str)
    assert data["start_date_used"] == "2026-03-08"
    assert data["daily_boost"] == 1.0


def test_recover_endpoint_replans_after_missed_sessions():
    payload = {
        "tasks": [
            {
                "title": "Final Project",
                "due_date": "2026-03-18",
                "task_type": "project",
                "estimated_hours": 12,
                "difficulty": 0.9,
                "impact_weight": 1.4,
            },
            {
                "title": "Midterm",
                "due_date": "2026-03-20",
                "task_type": "exam",
                "estimated_hours": 8,
                "difficulty": 0.8,
                "impact_weight": 1.2,
            },
        ],
        "availability": {
            "monday": 2,
            "tuesday": 2,
            "wednesday": 2,
            "thursday": 2,
            "friday": 2,
            "saturday": 2,
            "sunday": 2,
        },
        "start_date": "2026-03-10",
        "missed_dates": ["2026-03-11", "2026-03-12"],
    }

    response = client.post("/api/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["missed_dates"] == ["2026-03-11", "2026-03-12"]
    assert data["missed_days"] == 2
    assert data["auto_recovery_hours"] >= 0
    assert data["delta"]["missed_session_days"] == 2
    assert data["recovered"]["start_date"] == "2026-03-12"
    assert data["slipped"]["risk_score"] >= data["baseline"]["risk_score"]
