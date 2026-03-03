from datetime import date, timedelta

from app.core.scheduler import create_study_plan
from app.models import Task


def test_create_study_plan_allocates_hours_when_capacity_sufficient():
    today = date.today()
    tasks = [
        Task(
            title="Assignment 1",
            due_date=today + timedelta(days=5),
            task_type="assignment",
            estimated_hours=4,
            difficulty=0.5,
            impact_weight=0.8,
        ),
        Task(
            title="Lab 2",
            due_date=today + timedelta(days=6),
            task_type="lab",
            estimated_hours=3,
            difficulty=0.6,
            impact_weight=0.8,
        ),
    ]

    plan = create_study_plan(tasks, availability=[2, 2, 2, 2, 2, 2, 2], start_date=today)

    assert plan.total_allocated_hours >= 6.5
    assert len(plan.unscheduled) == 0
    assert len(plan.items) > 0


def test_overdue_task_is_allocated_to_catch_up_window():
    today = date.today()
    tasks = [
        Task(
            title="Overdue Report",
            due_date=today - timedelta(days=2),
            task_type="report",
            estimated_hours=3,
            difficulty=0.7,
            impact_weight=1.1,
        )
    ]

    plan = create_study_plan(tasks, availability=[2, 2, 2, 2, 2, 2, 2], start_date=today)
    assert plan.total_allocated_hours > 0
    assert len(plan.items) > 0
