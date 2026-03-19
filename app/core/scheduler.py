from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from typing import Dict, List

from app.models import DailyPlanItem, StudyPlan, Task, UnscheduledItem


def _build_capacity_map(start: date, end: date, availability: List[float]) -> Dict[date, float]:
    capacity: Dict[date, float] = {}
    current = start
    while current <= end:
        capacity[current] = float(availability[current.weekday()])
        current += timedelta(days=1)
    return capacity


def _allocation_candidates(start: date, due: date) -> List[date]:
    days: List[date] = []
    cursor = start
    while cursor <= due:
        days.append(cursor)
        cursor += timedelta(days=1)

    # Encourage spaced repetition: early days first, then near-deadline reinforcement.
    midpoint = len(days) // 2
    reordered = days[:midpoint] + days[midpoint:][::2] + days[midpoint + 1 :][::2]
    return list(dict.fromkeys(reordered))


def create_study_plan(tasks: List[Task], availability: List[float], start_date: date | None = None) -> StudyPlan:
    if not tasks:
        return StudyPlan(
            items=[],
            utilization=0.0,
            total_required_hours=0.0,
            total_allocated_hours=0.0,
            unscheduled=[],
        )

    start = start_date or date.today()
    end = max(task.due_date for task in tasks)
    if end < start:
        end = start

    capacity = _build_capacity_map(start, end, availability)
    original_capacity = dict(capacity)

    schedule_items: List[DailyPlanItem] = []
    unscheduled: List[UnscheduledItem] = []

    prioritized_tasks = sorted(
        tasks,
        key=lambda t: (t.due_date, -t.impact_weight, -t.difficulty),
    )

    for task in prioritized_tasks:
        remaining = float(task.estimated_hours)
        due_for_allocation = task.due_date
        if due_for_allocation < start:
            # Recover overdue tasks quickly so they are not silently dropped.
            due_for_allocation = start + timedelta(days=2)

        candidates = _allocation_candidates(start, due_for_allocation)

        for day in candidates:
            if remaining <= 0:
                break

            free = capacity.get(day, 0.0)
            if free <= 0:
                continue

            # Small chunks improve habit consistency and avoid single-day cram.
            preferred_chunk = 1.5 + task.difficulty + (0.4 if task.task_type == "exam" else 0.0)
            chunk = min(min(3.0, preferred_chunk), free, remaining)
            capacity[day] = round(free - chunk, 2)
            remaining = round(remaining - chunk, 2)
            schedule_items.append(
                DailyPlanItem(
                    date=day,
                    task_title=task.title,
                    task_type=task.task_type,
                    hours=chunk,
                )
            )

        if remaining > 0:
            unscheduled.append(
                UnscheduledItem(task_title=task.title, unscheduled_hours=round(remaining, 2))
            )

    schedule_items.sort(key=lambda item: (item.date, item.task_title))

    total_required = round(sum(task.estimated_hours for task in tasks), 2)
    total_allocated = round(sum(item.hours for item in schedule_items), 2)
    total_capacity = round(sum(original_capacity.values()), 2)

    utilization = 0.0
    if total_capacity > 0:
        utilization = round(total_allocated / total_capacity, 3)

    return StudyPlan(
        items=schedule_items,
        utilization=utilization,
        total_required_hours=total_required,
        total_allocated_hours=total_allocated,
        unscheduled=unscheduled,
    )


def summarize_schedule_load(items: List[DailyPlanItem]) -> Dict[date, float]:
    daily_load: Dict[date, float] = defaultdict(float)
    for item in items:
        daily_load[item.date] += item.hours
    return dict(daily_load)
