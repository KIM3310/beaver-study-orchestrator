"""Tests for analysis history persistence and outcome board generation."""

from __future__ import annotations

import json

from fastapi.testclient import TestClient

from app.main import ANALYSIS_HISTORY_PATH, app

# Clear any leftover history from previous test runs.
if ANALYSIS_HISTORY_PATH.exists():
    ANALYSIS_HISTORY_PATH.unlink()

HISTORY_PATH = ANALYSIS_HISTORY_PATH
client = TestClient(app)

SYLLABUS_PAYLOAD = {
    "syllabus_text": """
    Assignment 1 due March 12, 2026
    Midterm Exam on March 22, 2026
    Final Project due April 5, 2026
    """,
    "availability": {
        "monday": 2, "tuesday": 2, "wednesday": 2,
        "thursday": 2, "friday": 2, "saturday": 3, "sunday": 3,
    },
}


def test_history_persisted_after_analyze():
    """Each /api/analyze call should append a record to the history file."""
    # Run two analyses
    client.post("/api/analyze", json=SYLLABUS_PAYLOAD)
    client.post("/api/analyze", json=SYLLABUS_PAYLOAD)

    assert HISTORY_PATH.exists()
    lines = [line for line in HISTORY_PATH.read_text().splitlines() if line.strip()]
    assert len(lines) >= 2

    # Each line should be valid JSON with required fields
    for line in lines:
        item = json.loads(line)
        assert "analysis_id" in item
        assert "created_at" in item
        assert "risk_level" in item
        assert "task_count" in item


def test_history_recent_returns_latest_first():
    """The /api/history/recent endpoint should return items newest first."""
    resp = client.get("/api/history/recent?limit=10")
    assert resp.status_code == 200
    data = resp.json()
    items = data["items"]
    assert len(items) >= 2
    # Verify descending order by created_at
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_history_risk_level_filter():
    """Filtering by risk_level should return only matching items."""
    resp_all = client.get("/api/history/recent?limit=10")
    all_items = resp_all.json()["items"]
    if not all_items:
        return  # nothing to filter

    target_level = all_items[0]["risk_level"]
    resp_filtered = client.get(f"/api/history/recent?limit=10&risk_level={target_level}")
    assert resp_filtered.status_code == 200
    filtered = resp_filtered.json()["items"]
    for item in filtered:
        assert item["risk_level"] == target_level


def test_history_invalid_risk_level_returns_400():
    """An invalid risk_level filter should return HTTP 400."""
    resp = client.get("/api/history/recent?risk_level=critical")
    assert resp.status_code == 400


def test_outcome_board_structure():
    """The outcome board should have all required summary fields."""
    resp = client.get("/api/outcomes/board?limit=6")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["contract_version"] == "beaver-study-outcome-board-v1"

    summary = data["summary"]
    assert "analyses_reviewed" in summary
    assert "high_risk_runs" in summary
    assert "spillover_runs" in summary
    assert "average_risk_score" in summary
    assert "latest_risk_level" in summary
    assert "next_action" in summary

    assert len(data["review_actions"]) >= 1
    assert "links" in data


def test_outcome_board_counts_match_history():
    """The board's analyses_reviewed should match the number of items returned."""
    resp = client.get("/api/outcomes/board?limit=6")
    data = resp.json()
    assert data["summary"]["analyses_reviewed"] == len(data["items"])
