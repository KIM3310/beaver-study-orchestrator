from __future__ import annotations

import math
from datetime import date
from typing import List, Tuple

from app.core.scheduler import summarize_schedule_load
from app.models import RiskAssessment, RiskDriver, StudyPlan, Task


def _sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def _compute_features(tasks: List[Task], plan: StudyPlan, weekly_capacity: float) -> List[Tuple[str, float, float]]:
    today = date.today()
    total_hours = sum(task.estimated_hours for task in tasks)
    weighted_hours = sum(task.estimated_hours * task.impact_weight for task in tasks)
    avg_difficulty = sum(task.difficulty for task in tasks) / max(len(tasks), 1)
    nearest_due_days = min(max((task.due_date - today).days, 0) for task in tasks)
    overdue_count = sum(1 for task in tasks if task.due_date < today)
    coverage_ratio = plan.total_allocated_hours / max(total_hours, 0.01)
    spillover_ratio = sum(item.unscheduled_hours for item in plan.unscheduled) / max(total_hours, 0.01)
    schedule_density = total_hours / max(weekly_capacity, 1.0)

    daily_loads = summarize_schedule_load(plan.items)
    max_daily_load = max(daily_loads.values(), default=0.0)

    # tuple => (feature_name, feature_value, coefficient)
    return [
        ("task_count", float(len(tasks)), 0.09),
        ("total_hours", total_hours, 0.03),
        ("weighted_hours", weighted_hours, 0.02),
        ("avg_difficulty", avg_difficulty, 1.6),
        ("weekly_capacity", weekly_capacity, -0.04),
        ("nearest_due_days", float(nearest_due_days), -0.05),
        ("overdue_count", float(overdue_count), 0.5),
        ("coverage_gap", 1.0 - min(coverage_ratio, 1.0), 2.0),
        ("spillover_ratio", spillover_ratio, 2.2),
        ("schedule_density", schedule_density, 0.4),
        ("max_daily_load", max_daily_load, 0.2),
    ]


def _feature_label(name: str) -> str:
    labels = {
        "task_count": "Concurrent deadlines",
        "total_hours": "Total required workload",
        "weighted_hours": "High-stakes workload weight",
        "avg_difficulty": "Average task difficulty",
        "weekly_capacity": "Available weekly hours",
        "nearest_due_days": "Urgency of nearest due date",
        "overdue_count": "Overdue task count",
        "coverage_gap": "Plan coverage gap",
        "spillover_ratio": "Unscheduled work ratio",
        "schedule_density": "Workload-to-capacity density",
        "max_daily_load": "Peak single-day load",
    }
    return labels.get(name, name)


def _build_recommendations(
    score: float,
    tasks: List[Task],
    plan: StudyPlan,
    availability: List[float],
) -> List[str]:
    recommendations: List[str] = []
    missing_hours = round(max(0.0, plan.total_required_hours - plan.total_allocated_hours), 1)
    nearest_due_days = min(max((task.due_date - date.today()).days, 0) for task in tasks)

    if missing_hours > 0:
        recommendations.append(
            f"Add at least {missing_hours:.1f} more study hours this cycle or reduce scope for lower-impact tasks."
        )

    if nearest_due_days <= 3:
        recommendations.append(
            "Run a 48-hour sprint: reserve two focused blocks and finish one deliverable completely."
        )

    weekend_capacity = availability[5] + availability[6]
    if weekend_capacity < 2:
        recommendations.append(
            "Open at least one weekend study block to absorb schedule spillover."
        )

    if score >= 0.66:
        recommendations.append(
            "Front-load difficult work: complete exam/project preparation before routine assignments."
        )
        recommendations.append(
            "Time-box distractions: use 50-minute focus sessions and track completion daily."
        )
    elif score >= 0.33:
        recommendations.append(
            "Protect consistency: do not skip two planned study days in a row."
        )
    else:
        recommendations.append(
            "Maintain cadence and add a small 1-hour buffer block each week for unexpected changes."
        )

    return recommendations[:4]


def assess_risk(tasks: List[Task], plan: StudyPlan, availability: List[float]) -> RiskAssessment:
    if not tasks:
        return RiskAssessment(
            score=0.0,
            level="low",
            rationale="No dated tasks were extracted. Add due dates to generate a reliable risk estimate.",
            top_drivers=[],
            recommendations=[
                "Add explicit due dates (e.g., 'Project due March 21, 2026') so risk can be estimated."
            ],
        )

    weekly_capacity = sum(availability)
    features = _compute_features(tasks, plan, weekly_capacity)

    baseline = -2.3
    contributions: List[RiskDriver] = []
    linear_sum = baseline

    for name, value, coef in features:
        effect = value * coef
        linear_sum += effect
        contributions.append(RiskDriver(label=_feature_label(name), effect=round(effect, 3)))

    score = round(_sigmoid(linear_sum), 3)
    if score < 0.33:
        level = "low"
        rationale = "Current plan is feasible with room to absorb minor delays."
    elif score < 0.66:
        level = "medium"
        rationale = "Plan is workable but sensitive to missed sessions and scope creep."
    else:
        level = "high"
        rationale = "Schedule pressure is high; reduce scope or increase weekly availability."

    top_drivers = sorted(contributions, key=lambda item: abs(item.effect), reverse=True)[:3]
    recommendations = _build_recommendations(score, tasks, plan, availability)

    return RiskAssessment(
        score=score,
        level=level,
        rationale=rationale,
        top_drivers=top_drivers,
        recommendations=recommendations,
    )
