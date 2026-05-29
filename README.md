# Beaver Study Orchestrator

A study-planning tool that extracts deadlines from syllabus text, generates adaptive schedules, and provides interpretable risk scoring with what-if simulation.

## Product and Review Surface

A study planner that turns syllabus data into schedules, risk signals, and what-if decisions students can act on.

| Lens | Definition |
|---|---|
| Buyer or user | Students, advisors, bootcamps, education platforms, and productivity-tool reviewers. |
| Commercial route | Freemium planner with paid what-if simulations, advisor dashboards, or cohort-risk analytics. |
| Review signal | Syllabus extraction, adaptive scheduling, risk scoring, what-if simulation, FastAPI/NLP planning surface. |
| Safety boundary | Study guidance is advisory; personal education data needs explicit retention and sharing controls. |
| Fast proof | Run the planner tests and inspect sample schedules, risk outputs, and scenario simulations. |

## Reviewer Fast Path

- **First minute:** Run one syllabus through analyze, then compare the risk drivers with the what-if result.
- **Local demo:** Run `make setup && make run`, then open `http://127.0.0.1:8000`.
- **Verification:** Run `make test`; CI also enforces lint and coverage on supported Python versions.
- **Commercial read:** Use the advisory/cohort-risk angle for schools, bootcamps, and productivity products.

## Commercialization Playbook

- [Monetization and GTM playbook](docs/monetization-playbook.md) maps the repository to buyer segments, offer ladder, pricing hypotheses, proof gates, and risk boundaries.

## Review Notes

- [Review guide](docs/reviewer-evidence-map.md) summarizes the project angle, first files to inspect, verification commands, and known boundaries.
- [Quality notes](docs/quality-gate.md) lists the local checks, CI surface, and release expectations for this repository.
- [Revenue growth model](docs/revenue-growth-model.md) maps the project to an ethical revenue path, activation loop, pricing logic, and growth experiments.
- [Enterprise readiness notes](docs/enterprise-readiness.md) outlines security, data, operations, integration, and handoff expectations.

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
- **Interpretable risk model** - clear feature effects, easy to explain in interviews
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
