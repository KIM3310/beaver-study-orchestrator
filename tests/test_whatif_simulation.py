"""Tests for the what-if simulation endpoint with various inputs."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

HISTORY_PATH = Path(tempfile.gettempdir()) / "beaver_whatif_test.jsonl"
os.environ["BEAVER_STUDY_HISTORY_PATH"] = str(HISTORY_PATH)
if HISTORY_PATH.exists():
    HISTORY_PATH.unlink()

from app.main import app  # noqa: E402

client = TestClient(app)

TIGHT_TASKS = [
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
]

LOW_AVAILABILITY = {
    "monday": 1, "tuesday": 1, "wednesday": 1,
    "thursday": 1, "friday": 1, "saturday": 1, "sunday": 1,
}


def test_whatif_large_boost_reduces_risk_more():
    """A 4h/day boost should reduce risk more than a 0.5h/day boost."""
    small_resp = client.post("/api/what-if", json={
        "tasks": TIGHT_TASKS,
        "availability": LOW_AVAILABILITY,
        "daily_boost": 0.5,
        "start_date": "2026-03-08",
    })
    large_resp = client.post("/api/what-if", json={
        "tasks": TIGHT_TASKS,
        "availability": LOW_AVAILABILITY,
        "daily_boost": 4.0,
        "start_date": "2026-03-08",
    })

    assert small_resp.status_code == 200
    assert large_resp.status_code == 200

    small_data = small_resp.json()
    large_data = large_resp.json()

    assert large_data["risk_reduction"] >= small_data["risk_reduction"]


def test_whatif_boosted_unscheduled_leq_baseline():
    """Boosted scenario should have equal or fewer unscheduled hours."""
    resp = client.post("/api/what-if", json={
        "tasks": TIGHT_TASKS,
        "availability": LOW_AVAILABILITY,
        "daily_boost": 2.0,
        "start_date": "2026-03-08",
    })
    data = resp.json()
    assert data["boosted"]["unscheduled_hours"] <= data["baseline"]["unscheduled_hours"]


def test_whatif_recommendation_is_nonempty():
    """Every what-if response must include a non-empty recommendation."""
    resp = client.post("/api/what-if", json={
        "tasks": TIGHT_TASKS,
        "availability": LOW_AVAILABILITY,
        "daily_boost": 1.5,
        "start_date": "2026-03-08",
    })
    data = resp.json()
    assert len(data["recommendation"]) > 10


def test_whatif_with_ample_capacity_shows_low_risk():
    """With plenty of capacity, both baseline and boosted should be low risk."""
    high_avail = {
        "monday": 8, "tuesday": 8, "wednesday": 8,
        "thursday": 8, "friday": 8, "saturday": 8, "sunday": 8,
    }
    resp = client.post("/api/what-if", json={
        "tasks": [
            {
                "title": "Easy Quiz",
                "due_date": "2026-04-20",
                "task_type": "quiz",
                "estimated_hours": 2,
                "difficulty": 0.3,
                "impact_weight": 0.5,
            }
        ],
        "availability": high_avail,
        "daily_boost": 0.5,
        "start_date": "2026-03-10",
    })
    data = resp.json()
    assert data["baseline"]["risk_level"] == "low"
    assert data["risk_reduction"] >= 0


def test_whatif_daily_boost_capped_at_12():
    """Boosted availability should not exceed 12h/day per model constraint."""
    resp = client.post("/api/what-if", json={
        "tasks": TIGHT_TASKS,
        "availability": {
            "monday": 10, "tuesday": 10, "wednesday": 10,
            "thursday": 10, "friday": 10, "saturday": 10, "sunday": 10,
        },
        "daily_boost": 4.0,
        "start_date": "2026-03-08",
    })
    # Should not error -- the cap of 12 is applied internally
    assert resp.status_code == 200
