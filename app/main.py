from __future__ import annotations

from datetime import date
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles

from app.core.calendar_export import build_ics_calendar
from app.core.risk_model import assess_risk
from app.core.scheduler import create_study_plan
from app.core.syllabus_parser import extract_tasks_from_syllabus
from app.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    ExtractionRequest,
    ExtractionResponse,
    HealthResponse,
    PlanRequest,
    PlanResponse,
    ScenarioSnapshot,
    WhatIfRequest,
    WhatIfResponse,
)

APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static"

app = FastAPI(
    title="Beaver Study Orchestrator",
    description="Syllabus NLP + adaptive study scheduling + deadline risk analytics",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="beaver-study-orchestrator")


@app.post("/api/extract", response_model=ExtractionResponse)
def extract(request: ExtractionRequest) -> ExtractionResponse:
    tasks, discarded = extract_tasks_from_syllabus(
        request.syllabus_text,
        reference_year=request.reference_year,
    )
    return ExtractionResponse(tasks=tasks, discarded_lines=discarded)


@app.post("/api/plan", response_model=PlanResponse)
def plan(request: PlanRequest) -> PlanResponse:
    start = request.start_date or date.today()
    study_plan = create_study_plan(
        tasks=request.tasks,
        availability=request.availability.as_list(),
        start_date=start,
    )
    risk = assess_risk(
        tasks=request.tasks,
        plan=study_plan,
        availability=request.availability.as_list(),
    )
    return PlanResponse(study_plan=study_plan, risk=risk)


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    tasks, discarded = extract_tasks_from_syllabus(
        request.syllabus_text,
        reference_year=request.reference_year,
    )
    extraction = ExtractionResponse(tasks=tasks, discarded_lines=discarded)

    study_plan = create_study_plan(
        tasks=tasks,
        availability=request.availability.as_list(),
        start_date=date.today(),
    )
    risk = assess_risk(tasks=tasks, plan=study_plan, availability=request.availability.as_list())
    plan_response = PlanResponse(study_plan=study_plan, risk=risk)

    return AnalyzeResponse(extraction=extraction, plan=plan_response)


@app.post("/api/export/ics", response_class=PlainTextResponse)
def export_ics(request: PlanRequest) -> PlainTextResponse:
    plan = create_study_plan(
        tasks=request.tasks,
        availability=request.availability.as_list(),
        start_date=request.start_date or date.today(),
    )
    ics = build_ics_calendar(request.tasks, plan)
    headers = {
        "Content-Disposition": 'attachment; filename=\"beaver-study-plan.ics\"'
    }
    return PlainTextResponse(content=ics, headers=headers, media_type="text/calendar")


@app.post("/api/what-if", response_model=WhatIfResponse)
def what_if(request: WhatIfRequest) -> WhatIfResponse:
    today = date.today()
    base_availability = request.availability.as_list()
    boosted_availability = [
        round(min(12.0, value + request.daily_boost), 2) for value in base_availability
    ]

    base_plan = create_study_plan(
        tasks=request.tasks,
        availability=base_availability,
        start_date=today,
    )
    base_risk = assess_risk(
        tasks=request.tasks,
        plan=base_plan,
        availability=base_availability,
    )

    boosted_plan = create_study_plan(
        tasks=request.tasks,
        availability=boosted_availability,
        start_date=today,
    )
    boosted_risk = assess_risk(
        tasks=request.tasks,
        plan=boosted_plan,
        availability=boosted_availability,
    )

    baseline_unscheduled = round(
        sum(item.unscheduled_hours for item in base_plan.unscheduled), 2
    )
    boosted_unscheduled = round(
        sum(item.unscheduled_hours for item in boosted_plan.unscheduled), 2
    )

    risk_reduction = round(base_risk.score - boosted_risk.score, 3)
    if risk_reduction > 0.15:
        recommendation = (
            "Adding this time buffer has a strong effect. Protect it on your calendar."
        )
    elif risk_reduction > 0.05:
        recommendation = (
            "This is a meaningful improvement. Keep the extra time until major deadlines pass."
        )
    elif risk_reduction > 0:
        recommendation = (
            "Risk improves slightly. Consider reducing scope on low-impact tasks as well."
        )
    else:
        recommendation = (
            "Extra daily time alone is not enough. Reprioritize or reduce deliverable scope."
        )

    return WhatIfResponse(
        baseline=ScenarioSnapshot(
            label="Current capacity",
            risk_score=base_risk.score,
            risk_level=base_risk.level,
            allocated_hours=base_plan.total_allocated_hours,
            unscheduled_hours=baseline_unscheduled,
        ),
        boosted=ScenarioSnapshot(
            label=f"+{request.daily_boost:.1f}h/day",
            risk_score=boosted_risk.score,
            risk_level=boosted_risk.level,
            allocated_hours=boosted_plan.total_allocated_hours,
            unscheduled_hours=boosted_unscheduled,
        ),
        risk_reduction=risk_reduction,
        recommendation=recommendation,
    )
