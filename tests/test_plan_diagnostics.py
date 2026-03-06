from datetime import date, timedelta

from app.core.plan_diagnostics import build_plan_diagnostics
from app.core.scheduler import create_study_plan
from app.models import Task


def test_plan_diagnostics_reports_unscheduled_recovery_guidance():
    start = date(2026, 3, 10)
    tasks = [
        Task(
            title="Final Project",
            due_date=start + timedelta(days=2),
            task_type="project",
            estimated_hours=18,
            difficulty=0.95,
            impact_weight=1.3,
        ),
        Task(
            title="Midterm Review",
            due_date=start + timedelta(days=3),
            task_type="exam",
            estimated_hours=10,
            difficulty=0.9,
            impact_weight=1.2,
        ),
    ]

    plan = create_study_plan(tasks, availability=[1, 1, 1, 1, 1, 1, 1], start_date=start)
    diagnostics = build_plan_diagnostics(tasks, plan, start)

    assert diagnostics.total_unscheduled_hours > 0
    assert diagnostics.recommended_daily_boost_hours >= 0.5
    assert "add about" in diagnostics.next_action.lower()


def test_plan_diagnostics_reports_empty_task_guidance():
    diagnostics = build_plan_diagnostics([], create_study_plan([], [2, 2, 2, 2, 2, 2, 2]), date(2026, 3, 10))

    assert diagnostics.focus_days == 0
    assert diagnostics.total_unscheduled_hours == 0
    assert "dated syllabus line" in diagnostics.next_action.lower()
