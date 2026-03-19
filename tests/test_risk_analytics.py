"""Tests for risk analytics: score ranges, drivers, and recommendations."""

from __future__ import annotations

from datetime import date, timedelta

from app.core.risk_model import assess_risk
from app.core.scheduler import create_study_plan
from app.models import Task


def _make_task(title: str, days_until_due: int, hours: float, difficulty: float, impact: float, task_type: str = "assignment") -> Task:
    return Task(
        title=title,
        due_date=date(2026, 3, 10) + timedelta(days=days_until_due),
        task_type=task_type,
        estimated_hours=hours,
        difficulty=difficulty,
        impact_weight=impact,
    )


def test_empty_tasks_yield_zero_risk():
    plan = create_study_plan([], [2] * 7)
    risk = assess_risk([], plan, [2] * 7)
    assert risk.score == 0.0
    assert risk.level == "low"
    assert len(risk.recommendations) == 1


def test_light_workload_yields_low_risk():
    tasks = [_make_task("Easy Quiz", 20, 2.0, 0.3, 0.5, "quiz")]
    avail = [4.0] * 7
    plan = create_study_plan(tasks, avail, start_date=date(2026, 3, 10))
    risk = assess_risk(tasks, plan, avail, reference_date=date(2026, 3, 10))
    assert risk.score < 0.33
    assert risk.level == "low"


def test_heavy_workload_yields_high_risk():
    tasks = [
        _make_task("Final Exam", 3, 12.0, 0.95, 1.3, "exam"),
        _make_task("Capstone Project", 4, 15.0, 0.95, 1.5, "project"),
        _make_task("Lab Report", 2, 8.0, 0.8, 1.0, "report"),
    ]
    avail = [1.0] * 7
    plan = create_study_plan(tasks, avail, start_date=date(2026, 3, 10))
    risk = assess_risk(tasks, plan, avail, reference_date=date(2026, 3, 10))
    assert risk.score >= 0.66
    assert risk.level == "high"
    assert len(risk.top_drivers) == 3


def test_recommendations_mention_sprint_when_deadline_imminent():
    tasks = [_make_task("Urgent Exam", 2, 8.0, 0.9, 1.2, "exam")]
    avail = [2.0] * 7
    plan = create_study_plan(tasks, avail, start_date=date(2026, 3, 10))
    risk = assess_risk(tasks, plan, avail, reference_date=date(2026, 3, 10))
    sprint_recs = [r for r in risk.recommendations if "sprint" in r.lower() or "48-hour" in r.lower()]
    assert len(sprint_recs) >= 1


def test_recommendations_suggest_weekend_when_weekend_low():
    tasks = [_make_task("Assignment", 10, 6.0, 0.6, 0.8)]
    avail = [2.0, 2.0, 2.0, 2.0, 2.0, 0.0, 0.0]  # no weekend time
    plan = create_study_plan(tasks, avail, start_date=date(2026, 3, 10))
    risk = assess_risk(tasks, plan, avail, reference_date=date(2026, 3, 10))
    weekend_recs = [r for r in risk.recommendations if "weekend" in r.lower()]
    assert len(weekend_recs) >= 1


def test_risk_score_bounded_zero_to_one():
    """Risk score should always be between 0 and 1, regardless of inputs."""
    for hours in [1.0, 50.0]:
        for diff in [0.1, 1.0]:
            tasks = [_make_task("Task", 5, hours, diff, 1.0)]
            avail = [2.0] * 7
            plan = create_study_plan(tasks, avail, start_date=date(2026, 3, 10))
            risk = assess_risk(tasks, plan, avail, reference_date=date(2026, 3, 10))
            assert 0.0 <= risk.score <= 1.0
