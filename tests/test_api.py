from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "beaver-study-orchestrator"
    assert data["ops_contract"]["schema"] == "ops-envelope-v1"
    assert data["links"]["analyze"] == "/api/analyze"
    assert "next_action" in data["diagnostics"]


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
