from __future__ import annotations

from datetime import date, timedelta

from app.core.plan_diagnostics import build_plan_diagnostics
from app.core.risk_model import assess_risk
from app.core.scheduler import create_study_plan
from app.models import (
    PlanDiagnostics,
    RecoveryResponse,
    RecoveryScenarioSnapshot,
    RiskAssessment,
    Task,
)


def _build_snapshot(
    *,
    label: str,
    start_date: date,
    risk: RiskAssessment,
    diagnostics: PlanDiagnostics,
    allocated_hours: float,
) -> RecoveryScenarioSnapshot:
    return RecoveryScenarioSnapshot(
        label=label,
        start_date=start_date,
        risk_score=risk.score,
        risk_level=risk.level,
        allocated_hours=allocated_hours,
        unscheduled_hours=diagnostics.total_unscheduled_hours,
        recommended_daily_boost_hours=diagnostics.recommended_daily_boost_hours,
        next_action=diagnostics.next_action,
    )


def build_recovery_replan(
    *,
    tasks: list[Task],
    availability: list[float],
    start_date: date,
    missed_dates: list[date] | None = None,
    missed_days: int | None = None,
) -> RecoveryResponse:
    unique_missed_dates = sorted({item for item in (missed_dates or [])})
    if unique_missed_dates:
        computed_missed_days = len(unique_missed_dates)
    else:
        computed_missed_days = int(missed_days or 0)
        unique_missed_dates = [
            start_date + timedelta(days=offset) for offset in range(1, computed_missed_days + 1)
        ]
    missed_days = max(1, computed_missed_days)
    baseline_plan = create_study_plan(tasks=tasks, availability=availability, start_date=start_date)
    baseline_risk = assess_risk(tasks=tasks, plan=baseline_plan, availability=availability)
    baseline_diagnostics = build_plan_diagnostics(tasks, baseline_plan, start_date)

    slipped_start = start_date + timedelta(days=missed_days)
    slipped_plan = create_study_plan(tasks=tasks, availability=availability, start_date=slipped_start)
    slipped_risk = assess_risk(tasks=tasks, plan=slipped_plan, availability=availability)
    slipped_diagnostics = build_plan_diagnostics(tasks, slipped_plan, slipped_start)

    auto_recovery_hours = slipped_diagnostics.recommended_daily_boost_hours
    if auto_recovery_hours <= 0 and slipped_risk.score > baseline_risk.score:
        auto_recovery_hours = 0.5

    boosted_availability = [
        round(min(12.0, hours + auto_recovery_hours), 2) for hours in availability
    ]
    recovered_plan = create_study_plan(
        tasks=tasks,
        availability=boosted_availability,
        start_date=slipped_start,
    )
    recovered_risk = assess_risk(
        tasks=tasks,
        plan=recovered_plan,
        availability=boosted_availability,
    )
    recovered_diagnostics = build_plan_diagnostics(tasks, recovered_plan, slipped_start)

    slip_penalty = round(slipped_risk.score - baseline_risk.score, 3)
    recovery_gain = round(slipped_risk.score - recovered_risk.score, 3)
    unscheduled_hours_recovered = round(
        slipped_diagnostics.total_unscheduled_hours - recovered_diagnostics.total_unscheduled_hours,
        2,
    )

    if recovery_gain > 0.15:
        recommendation = (
            f"Missing {missed_days} day(s) materially raises risk, but +{auto_recovery_hours:.1f}h/day "
            "recovers enough capacity to keep the plan viable."
        )
    elif recovery_gain > 0:
        recommendation = (
            f"Use the replanned schedule for the next {missed_days} day(s) and protect the extra "
            f"+{auto_recovery_hours:.1f}h/day until the first tight deadline clears."
        )
    elif slip_penalty <= 0:
        recommendation = (
            "This plan stays stable even after the missed sessions. Resume the baseline cadence without extra recovery hours."
        )
    else:
        recommendation = (
            "The missed sessions still leave significant risk. Reduce scope or move non-critical work after the first deadline."
        )

    return RecoveryResponse(
        baseline=_build_snapshot(
            label="Baseline",
            start_date=start_date,
            risk=baseline_risk,
            diagnostics=baseline_diagnostics,
            allocated_hours=baseline_plan.total_allocated_hours,
        ),
        slipped=_build_snapshot(
            label=f"Missed {missed_days} day(s)",
            start_date=slipped_start,
            risk=slipped_risk,
            diagnostics=slipped_diagnostics,
            allocated_hours=slipped_plan.total_allocated_hours,
        ),
        recovered=_build_snapshot(
            label="Auto-replanned",
            start_date=slipped_start,
            risk=slipped_risk if recovered_risk.score < baseline_risk.score else recovered_risk,
            diagnostics=recovered_diagnostics,
            allocated_hours=recovered_plan.total_allocated_hours,
        ),
        missed_dates=unique_missed_dates,
        missed_days=missed_days,
        auto_recovery_hours=round(auto_recovery_hours, 1),
        delta={
            "missed_session_days": missed_days,
            "missed_session_hours": round(sum(availability[item.weekday()] for item in unique_missed_dates), 2),
            "slip_penalty": slip_penalty,
            "recovery_gain": recovery_gain,
            "unscheduled_hours_recovered": unscheduled_hours_recovered,
            "auto_recovery_hours": round(auto_recovery_hours, 1),
        },
        recommendation=recommendation,
    )
