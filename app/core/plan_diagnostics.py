from __future__ import annotations

from datetime import date

from app.core.scheduler import summarize_schedule_load
from app.models import PeakLoadDay, PlanDiagnostics, StudyPlan, Task


def build_plan_diagnostics(
    tasks: list[Task],
    plan: StudyPlan,
    start_date: date,
) -> PlanDiagnostics:
    if not tasks:
        return PlanDiagnostics(
            start_date=start_date,
            focus_days=0,
            total_unscheduled_hours=0.0,
            overdue_tasks=0,
            buffer_days_before_first_deadline=0,
            recommended_daily_boost_hours=0.0,
            busiest_day=None,
            next_action="Add at least one dated syllabus line to generate execution diagnostics.",
        )

    first_due_date = min(task.due_date for task in tasks)
    overdue_tasks = sum(1 for task in tasks if task.due_date < start_date)
    total_unscheduled_hours = round(
        sum(item.unscheduled_hours for item in plan.unscheduled),
        2,
    )
    daily_loads = summarize_schedule_load(plan.items)
    busiest_day = None
    if daily_loads:
        peak_date, peak_hours = max(daily_loads.items(), key=lambda item: item[1])
        busiest_day = PeakLoadDay(date=peak_date, allocated_hours=round(peak_hours, 2))

    focus_days = len(daily_loads)
    buffer_days = max((first_due_date - start_date).days, 0)
    horizon_days = max(1, buffer_days + 1)
    recommended_daily_boost = round(
        min(4.0, total_unscheduled_hours / horizon_days),
        1,
    )

    if total_unscheduled_hours > 0 and recommended_daily_boost >= 0.5:
        next_action = (
            f"Add about {recommended_daily_boost:.1f}h/day or trim low-impact work before "
            f"{first_due_date.isoformat()}."
        )
    elif overdue_tasks > 0:
        next_action = "Clear overdue work in the next 48 hours before taking on new deadlines."
    elif busiest_day and busiest_day.allocated_hours >= 4.0:
        next_action = (
            f"Protect {busiest_day.date.isoformat()} as a deep-work day and avoid extra commitments."
        )
    else:
        next_action = "Export the plan to calendar and keep the current cadence protected."

    return PlanDiagnostics(
        start_date=start_date,
        first_due_date=first_due_date,
        focus_days=focus_days,
        total_unscheduled_hours=total_unscheduled_hours,
        overdue_tasks=overdue_tasks,
        buffer_days_before_first_deadline=buffer_days,
        recommended_daily_boost_hours=recommended_daily_boost,
        busiest_day=busiest_day,
        next_action=next_action,
    )
