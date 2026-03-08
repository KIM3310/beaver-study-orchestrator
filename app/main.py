from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles

from app.core.calendar_export import build_ics_calendar
from app.core.plan_diagnostics import build_plan_diagnostics
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
ANALYSIS_REPORT_SCHEMA = "beaver-study-analysis-report-v1"
RUNTIME_BRIEF_CONTRACT = "beaver-study-runtime-brief-v1"
REVIEW_PACK_CONTRACT = "beaver-study-review-pack-v1"
RUNTIME_ROUTES = [
    "/api/health",
    "/api/meta",
    "/api/runtime/brief",
    "/api/review-pack",
    "/api/schema/analysis-report",
    "/api/analyze",
    "/api/what-if",
    "/api/export/ics",
]

app = FastAPI(
    title="Beaver Study Orchestrator",
    description="Syllabus NLP + adaptive study scheduling + deadline risk analytics",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


def build_analysis_report_schema() -> dict[str, object]:
    return {
        "schema": ANALYSIS_REPORT_SCHEMA,
        "required_sections": [
            "extraction.tasks",
            "extraction.discarded_lines",
            "plan.study_plan",
            "plan.risk",
            "plan.diagnostics",
        ],
        "operator_rules": [
            "Review extracted due dates before trusting the generated plan.",
            "Run what-if analysis only after a baseline plan exists for the same task set.",
            "Export the .ics calendar only after checking unscheduled spillover and risk recommendations.",
        ],
    }


def build_runtime_brief() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "beaver-study-orchestrator",
        "generated_at": datetime.now(timezone.utc),
        "readiness_contract": RUNTIME_BRIEF_CONTRACT,
        "headline": (
            "Rule-based study-planning runtime that turns messy syllabus text into extracted tasks, "
            "an adaptive schedule, interpretable risk, and calendar-ready execution."
        ),
        "report_contract": build_analysis_report_schema(),
        "evidence_counts": {
            "weekly_inputs": 7,
            "max_daily_boost_hours": 4.0,
            "runtime_routes": len(RUNTIME_ROUTES),
            "diagnostic_cards": 8,
        },
        "review_flow": [
            "Open /api/health or /api/meta to confirm parser posture and export readiness.",
            "Run /api/analyze with representative syllabus text and inspect extracted due dates first.",
            "Review risk drivers, recommendations, and unscheduled spillover before trusting the plan.",
            "Use /api/what-if and /api/export/ics only after the baseline plan looks correct.",
        ],
        "two_minute_review": [
            "Open /api/health or /api/meta to confirm parser posture, route coverage, and export readiness.",
            "Open /api/runtime/brief and pin the analysis schema, operator rules, and stage contract.",
            "Run /api/analyze with representative syllabus text and verify due dates before reading risk or schedule output.",
            "Use /api/what-if and /api/export/ics only after spillover and recommendations look reasonable.",
        ],
        "watchouts": [
            "Date extraction is rule-based and only as good as the syllabus formatting it receives.",
            "A clean-looking schedule can still be risky if unscheduled spillover remains.",
            "Calendar export reflects the generated plan; poor extraction propagates downstream.",
        ],
        "stage_contract": [
            {
                "stage": "extract",
                "responsibility": "Parse syllabus lines into due-dated tasks with interpretable heuristics.",
            },
            {
                "stage": "plan",
                "responsibility": "Allocate study hours against weekly availability and surface spillover.",
            },
            {
                "stage": "simulate",
                "responsibility": "Compare baseline and boosted availability before finalizing execution.",
            },
        ],
        "proof_assets": [
            {
                "label": "Health Route",
                "path": "/api/health",
                "why": "Confirms parser posture, export readiness, and next operator action.",
            },
            {
                "label": "Runtime Brief",
                "path": "/api/runtime/brief",
                "why": "Pins schema, stage contract, review flow, and watchouts before analysis.",
            },
            {
                "label": "Review Pack",
                "path": "/api/review-pack",
                "why": "Packages reviewer promises, trust boundary, and export posture in one envelope.",
            },
            {
                "label": "Analysis Schema",
                "path": "/api/schema/analysis-report",
                "why": "Locks the expected extraction, planning, and diagnostics contract.",
            },
        ],
        "routes": RUNTIME_ROUTES,
    }


def build_review_pack() -> dict[str, object]:
    brief = build_runtime_brief()
    return {
        "status": "ok",
        "service": "beaver-study-orchestrator",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "readiness_contract": REVIEW_PACK_CONTRACT,
        "headline": "Reviewer pack for syllabus extraction, adaptive study planning, what-if simulation, and calendar export.",
        "proof_bundle": {
            "parser_mode": "rule-based",
            "calendar_export_ready": True,
            "what_if_supported": True,
            "review_routes": [
                "/api/health",
                "/api/meta",
                "/api/runtime/brief",
                "/api/review-pack",
                "/api/schema/analysis-report",
            ],
        },
        "executive_promises": [
            "Extraction, plan generation, risk scoring, and calendar export stay reviewable through explicit contracts.",
            "What-if simulation is available before operators commit to a final study schedule.",
            "Calendar export is downstream of the reviewed plan rather than a side effect of raw extraction.",
        ],
        "trust_boundary": [
            "Rule-based extraction keeps due-date heuristics inspectable rather than opaque.",
            "Generated plans and what-if simulations are local computations over the extracted task set.",
            "Calendar export mirrors the approved plan, so extraction mistakes must be caught before export.",
        ],
        "review_sequence": [
            "Open /api/health or /api/meta to confirm parser posture and export readiness.",
            "Run /api/analyze with representative syllabus text and review due dates, spillover, and risk drivers.",
            "Use /api/what-if before exporting the final .ics calendar.",
        ],
        "two_minute_review": [
            "Open /api/health, /api/runtime/brief, and /api/review-pack to confirm parser posture and reviewer routes.",
            "Run /api/analyze and verify extracted due dates before trusting schedule quality or risk level.",
            "Use /api/what-if to compare the baseline and boosted plan before selecting a final path.",
            "Export .ics only after the reviewer checks spillover, diagnostics, and recommendations together.",
        ],
        "analysis_contract": {
            "schema": ANALYSIS_REPORT_SCHEMA,
            "report_routes": brief["routes"],
        },
        "watchouts": [
            "Rule-based parsing is only as good as the syllabus date formatting it receives.",
            "A lower risk score does not guarantee that the extracted deadlines were correct.",
            "Calendar export propagates the plan exactly as reviewed.",
        ],
        "proof_assets": [
            {
                "label": "Health Route",
                "path": "/api/health",
                "why": "Shows parser posture, export readiness, and next action before analysis.",
            },
            {
                "label": "Review Pack",
                "path": "/api/review-pack",
                "why": "Packages reviewer sequence, boundary, and promises into one contract.",
            },
            {
                "label": "What-If Route",
                "path": "/api/what-if",
                "why": "Compares baseline versus boosted capacity before execution commitment.",
            },
            {
                "label": "Calendar Export",
                "path": "/api/export/ics",
                "why": "Represents the downstream execution artifact after sign-off.",
            },
        ],
        "links": {
            "health": "/api/health",
            "meta": "/api/meta",
            "runtime_brief": "/api/runtime/brief",
            "review_pack": "/api/review-pack",
            "analysis_schema": "/api/schema/analysis-report",
            "what_if": "/api/what-if",
            "export_ics": "/api/export/ics",
        },
    }


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="beaver-study-orchestrator",
        generated_at=datetime.now(timezone.utc),
        readiness_contract=RUNTIME_BRIEF_CONTRACT,
        report_contract=build_analysis_report_schema(),
        diagnostics={
            "parser_mode": "rule-based",
            "calendar_export_ready": True,
            "what_if_supports_custom_start_date": True,
            "next_action": "Review /api/review-pack, then POST /api/analyze with syllabus text to generate an execution-ready plan.",
        },
        links={
            "meta": "/api/meta",
            "runtime_brief": "/api/runtime/brief",
            "review_pack": "/api/review-pack",
            "analysis_schema": "/api/schema/analysis-report",
            "analyze": "/api/analyze",
            "what_if": "/api/what-if",
            "export_ics": "/api/export/ics",
        },
        ops_contract={
            "schema": "ops-envelope-v1",
            "version": 1,
            "required_fields": ["service", "status", "diagnostics.next_action"],
        },
        capabilities=[
            "rule-based-syllabus-extraction",
            "adaptive-study-planning",
            "risk-simulation",
            "ics-export",
            "runtime-brief-surface",
            "analysis-schema-surface",
            "review-pack-surface",
        ],
        routes=RUNTIME_ROUTES,
    )


@app.get("/api/meta")
def meta() -> dict[str, object]:
    health_payload = health().model_dump(mode="json")
    return {
        **health_payload,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/runtime/brief")
def runtime_brief() -> dict[str, object]:
    return build_runtime_brief()


@app.get("/api/review-pack")
def review_pack() -> dict[str, object]:
    return build_review_pack()


@app.get("/api/schema/analysis-report")
def analysis_schema() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "beaver-study-orchestrator",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        **build_analysis_report_schema(),
    }


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
    diagnostics = build_plan_diagnostics(request.tasks, study_plan, start)
    return PlanResponse(study_plan=study_plan, risk=risk, diagnostics=diagnostics)


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    tasks, discarded = extract_tasks_from_syllabus(
        request.syllabus_text,
        reference_year=request.reference_year,
    )
    extraction = ExtractionResponse(tasks=tasks, discarded_lines=discarded)
    start = request.start_date or date.today()

    study_plan = create_study_plan(
        tasks=tasks,
        availability=request.availability.as_list(),
        start_date=start,
    )
    risk = assess_risk(tasks=tasks, plan=study_plan, availability=request.availability.as_list())
    diagnostics = build_plan_diagnostics(tasks, study_plan, start)
    plan_response = PlanResponse(study_plan=study_plan, risk=risk, diagnostics=diagnostics)

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
    start = request.start_date or date.today()
    base_availability = request.availability.as_list()
    boosted_availability = [
        round(min(12.0, value + request.daily_boost), 2) for value in base_availability
    ]

    base_plan = create_study_plan(
        tasks=request.tasks,
        availability=base_availability,
        start_date=start,
    )
    base_risk = assess_risk(
        tasks=request.tasks,
        plan=base_plan,
        availability=base_availability,
    )

    boosted_plan = create_study_plan(
        tasks=request.tasks,
        availability=boosted_availability,
        start_date=start,
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
        start_date_used=start,
        daily_boost=request.daily_boost,
        risk_reduction=risk_reduction,
        recommendation=recommendation,
    )
