# Beaver Study Orchestrator

## Live Demo

- [Open the public GitHub Pages demo](https://kim3310.github.io/beaver-study-orchestrator/)
- Scope: credential-free, synthetic-data demo for architecture inspection paths and evaluators.

> **Curated supporting repo**
> This repository is kept as optional proof, but it no longer leads the portfolio.
> Current front door: **aix-pilot, Nexus-Hive, and districtpilot-ai**.
> Reason: Useful education-planning experiment, but weaker than the current B2B AI, data, and operations lanes.

A study-planning tool that extracts deadlines from syllabus text, generates adaptive schedules, and provides interpretable risk scoring with what-if simulation.

## Product and System Surface

A study planner that turns syllabus data into schedules, risk signals, and what-if decisions students can act on.

| Lens | Definition |
|---|---|
| Audience | Students, advisors, bootcamps, education platforms, and productivity-tool architecture inspection paths. |
| Architecture path | Validate the demo, README, architecture notes, and quality gate before deeper workflow architecture. |
| System signal | Syllabus extraction, adaptive scheduling, risk scoring, what-if simulation, FastAPI/NLP planning surface. |
| Safety boundary | Study guidance is advisory; personal education data needs explicit retention and sharing controls. |
| Fast path | Run the planner tests and inspect sample schedules, risk outputs, and scenario simulations. |

## System Fast Path

- **First minute:** Run one syllabus through analyze, then compare the risk drivers with the what-if result.
- **Local demo:** Run `make setup && make run`, then open `http://127.0.0.1:8000`.
- **Verification:** Run `make test`; CI also enforces lint and coverage on supported Python versions.

## Service Launch Playbook

- [Service launch playbook](docs/service-launch-playbook.md) maps the repository to architecture audiences, operating gates, operating boundaries, and risk controls.

## Architecture Notes

- [Architecture guide](docs/architecture-evidence-map.md) summarizes the project angle, first files to inspect, runtime commands, and known boundaries.
- [Quality notes](docs/quality-gate.md) lists the local checks, CI surface, and release expectations for this repository.
- [Enterprise readiness notes](docs/enterprise-readiness.md) outlines security, data, operations, integration, and handoff expectations.
- [Repository positioning](docs/repository-positioning.md) explains why this repository is archived/supporting and where the current technical entry points live.

## What it does

1. **Syllabus extraction** - Parses due dates from free-form text, detects task types (assignment, exam, project, etc.), estimates effort with rule-based heuristics
2. **Schedule generation** - Builds date-by-date study allocations based on weekday availability, avoids single-day cramming
3. **Risk analytics** - Risk score (0.0-1.0) with top drivers (coverage gap, urgency, workload), mitigation recommendations
4. **What-if simulation** - See how risk changes when you add extra study hours per day
5. **Calendar export** - Exports study sessions as `.ics` for Google Calendar / Apple Calendar
6. **Diagnostics** - Busiest day, deadline buffer, total focus days, recovery hours needed

## Quickstart

```bash
make setup
make run
```

Open `http://127.0.0.1:8000`

## How it works

```text
[Browser UI]
   |  POST /api/analyze, POST /api/what-if
   v
[FastAPI app.main]
   |-- syllabus_parser.py   (text -> tasks)
   |-- scheduler.py         (tasks + availability -> daily plan)
   |-- risk_model.py        (tasks + plan -> risk + mitigation)
   +-- calendar_export.py   (plan -> .ics)
```

## API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Parser status and export readiness |
| `POST /api/analyze` | Analyze syllabus text |
| `POST /api/what-if` | Simulate schedule with different availability |
| `GET /api/export/ics` | Export study plan as .ics calendar |
| `GET /api/outcomes/board` | Risk and what-if summary dashboard |
| `GET /api/schema/analysis-report` | Analysis payload schema |

## Tech Stack

- **Backend:** FastAPI, Pydantic
- **Frontend:** Vanilla JS + HTML/CSS
- **Testing:** Pytest, FastAPI TestClient
- **Runtime:** Python 3.11+

## Tests

| Metric | Value |
|---|---|
| Test count | 40 |
| Line coverage | 96% |
| CI threshold | 80% |
| CI matrix | Python 3.11, 3.12 |
| Lint | ruff (zero warnings) |

Covers: date parsing (including year-boundary edges), what-if simulation, history persistence, outcome board, risk analytics, scheduler allocation, API contracts, and frontend metadata.

All request bodies are validated with Pydantic v2 (`Field` constraints + `field_validator`). Invalid payloads get 422 responses with structured error details.

```bash
make test
```

## Design Decisions

- **Rule-based extraction over LLM calls** - deterministic, offline-friendly, no token cost
- **Interpretable risk model** - clear feature effects, easy to explain in architecture walkthroughs
- **Single-page app** - fast demo flow, no auth friction

## Known Limitations

- Date parser handles common English month formats and `MM/DD` / `MM-DD`
- Effort estimation is heuristic, not personalized
- No calendar/LMS sync yet

## CI

GitHub Actions runs `ruff` lint and `pytest --cov-fail-under=80` on every push/PR across Python 3.11 and 3.12.

## License

MIT

## Cloud + AI Architecture

This repository includes a neutral cloud and AI engineering blueprint that maps the current proof surface to runtime boundaries, data contracts, model-risk controls, deployment posture, and validation hooks.

- [Cloud + AI architecture blueprint](docs/cloud-ai-architecture.md)
- [Machine-readable architecture manifest](docs/architecture/blueprint.json)
- Validation command: `python3 scripts/validate_architecture_blueprint.py`

## Enterprise Productization

- [Product operating model](docs/product-operating-model.md) defines the architecture inspection, trust boundary, trust boundary, operating checks, and service path for this repository.

## System Architecture

- [System architecture](docs/system-architecture.md) maps the runtime boundary, data/control flow, cloud or local deployment surface, and operating assumptions for this repository.

## Service Architecture

- [Service architecture](docs/service-architecture.md) defines the cloud resources, account information, cost controls, and production guardrails needed to turn this repo into a scoped service without publishing public financial assumptions.

<!-- search-growth-readme:start -->

## Search And Service Surface

- Public entry: free local study planner and public demo
- Paid boundary: premium study history, cohort dashboard, and exportable progress report
- Canonical URL: https://kim3310.github.io/beaver-study-orchestrator/
- Lead capture: https://github.com/KIM3310/beaver-study-orchestrator/issues/new?template=service-inquiry.yml&title=Private+workspace+inquiry%3A+Beaver+Study+Orchestrator
- Machine-readable offer: [docs/service-offer.json](docs/service-offer.json)
- Search growth implementation: [docs/search-growth-implementation.md](docs/search-growth-implementation.md)
- Revenue architecture: [docs/revenue-architecture.md](docs/revenue-architecture.md)

<!-- search-growth-readme:end -->
