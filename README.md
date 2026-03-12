# Beaver Study Orchestrator

A full-stack study planning project built around extraction, scheduling, and interpretable risk modeling.

## Portfolio posture
- Treat this repo as a planning tool with a clear execution surface, not as a syllabus-themed chatbot.
- The real product story is parse → plan → risk → recovery → calendar handoff.


## Role signals
- **AI engineer:** syllabus parsing, planning heuristics, and interpretable risk modeling are all exposed instead of hidden.
- **Solution / cloud architect:** extraction, scheduling, and review surfaces are separated enough to discuss trade-offs cleanly.
- **Field / solutions engineer:** the demo path is immediate: raw syllabus in, study plan and risk drivers out.

## 4-Line Problem Frame
- **User:** Busy students juggling multiple deadlines across classes.
- **Problem:** Syllabi are unstructured; students underestimate workload and cram late.
- **Constraint:** Planning must be fast, interpretable, and usable without paid APIs.
- **Success Test:** From raw syllabus text, generate an actionable study plan + risk score fast enough for a real student workflow (target: under 10 seconds in local demo conditions).

## Why This Is Competitive
- Solves a concrete student pain with clear measurable output.
- Combines NLP-style extraction, planning optimization, and interpretable risk modeling.
- Live demo is straightforward: paste syllabus -> click -> show plan + risk drivers.
- Highly discussable in interviews (data modeling, tradeoffs, explainability, product decisions).

## Core Features
1. **Syllabus extraction**
- Parses due dates from free-form text lines.
- Detects task types (assignment, exam, project, lab, report, quiz).
- Estimates effort using interpretable rule-based heuristics.

2. **Adaptive schedule generation**
- Builds date-by-date study allocations based on weekday availability.
- Avoids single-day cram by chunking workload.
- Reports unscheduled spillover when capacity is insufficient.
- Supports missed-session recovery replanning via `/api/recover` when the student slips for a few days.

3. **Deadline risk analytics**
- Produces risk score (`0.0-1.0`) and level (`low/medium/high`).
- Shows top risk drivers (coverage gap, urgency, workload, capacity).
- Generates mitigation recommendations based on spillover and urgency.
- Supports “what-if” simulation by changing availability inputs.

4. **Calendar export for execution**
- Exports generated study sessions as `.ics`.
- Imports directly into Google Calendar / Apple Calendar.
- Keeps demo focused on real habit formation, not just analysis.

5. **What-if scenario simulator**
- Simulates how risk changes if the student adds a configurable `+0.5h ~ +4.0h/day` capacity.
- Compares baseline vs boosted risk and unscheduled-hour reduction.
- Respects the same planning start date used in the main analysis flow.
- Generates a direct recommendation for action.

6. **Execution diagnostics cockpit**
- Highlights the busiest study day, first deadline buffer, and total focus days.
- Estimates additional daily hours needed to recover unscheduled spillover.
- Produces a concrete `next_action` instead of only showing a risk score.
7. **Demo-safe failure handling**
- If no due dates are found, API returns a valid response (no 500 crash).
- UI shows corrective guidance with a concrete date-format example.

## Tech Stack
- **Backend:** FastAPI, Pydantic
- **Frontend:** Vanilla JS + HTML/CSS
- **Testing:** Pytest, FastAPI TestClient
- **Runtime:** Python 3.11+

## Architecture
```text
[Browser UI]
   |  POST /api/analyze, POST /api/what-if
   v
[FastAPI app.main]
   ├─ syllabus_parser.py   (text -> tasks)
   ├─ scheduler.py         (tasks + availability -> daily plan)
   ├─ risk_model.py        (tasks + plan -> interpretable risk + mitigation)
   └─ calendar_export.py   (plan -> .ics)
```

## Quickstart
```bash
make setup
make run
```
Open `http://127.0.0.1:8000`

## Runtime Surfaces
- `GET /api/health`: exposes parser posture, export readiness, review links, and runtime contract.
- `GET /api/meta`: returns the same health contract in a reviewer-friendly metadata envelope.
- `GET /api/runtime/brief`: summarizes the extract -> plan -> simulate workflow, review flow, and watchouts.
- `POST /api/recover`: compares baseline vs missed-session recovery plan with before/after risk deltas.
- `GET /api/review-pack`: packages reviewer promises, trust boundary, and export posture before `.ics` handoff.
- `GET /api/schema/analysis-report`: pins the expected analysis payload for extraction, study plan, risk, and diagnostics.
- Landing-page runtime brief: the top of the UI now shows schema, parser mode, export readiness, route count, operator rules, and watchouts before analysis runs.

## Review Flow
- Open `/api/health` or `/api/meta` to confirm parser posture, route coverage, and export readiness.
- Open `/api/runtime/brief` and pin the analysis schema, operator rules, and stage contract.
- Run `/api/analyze` with representative syllabus text and verify due dates before reading risk or schedule quality.
- Use `/api/what-if` and `/api/export/ics` only after spillover and recommendations look reasonable.

## Proof Assets
- `Health Route` -> `/api/health`
- `Runtime Brief` -> `/api/runtime/brief`
- `Review Pack` -> `/api/review-pack`
- `Analysis Schema` -> `/api/schema/analysis-report`
- `What-If Route` -> `/api/what-if`
- `Calendar Export` -> `/api/export/ics`

## Run Tests
```bash
make test
```

## CI
- GitHub Actions runs `pytest` on every push/PR.
- Workflow file: `.github/workflows/ci.yml`

## Demo Assets Mapping
- **Working Prototype:** This web app (`uvicorn app.main:app`)
- **Video (2-4 min):** Script suggestion below
- **GitHub Repo:** Includes commit-ready structure, tests, docs
- **Final Checklist:** `docs/demo-package-checklist.md`
- **Live Pitch Playbook:** `docs/pitch-runbook.md`
- **Project Description Draft:** `docs/project-description-template.md`
- **Timed Demo Script:** `docs/demo-script-2to4min.md`

## 2-4 Minute Demo Script (Suggested)
1. Show raw syllabus text with mixed formatting.
2. Click **Generate Plan**.
3. Walk through extracted tasks and estimated hours.
4. Show adaptive daily schedule and unscheduled spillover logic.
5. Explain risk score, top drivers, and execution signals.
6. Change the what-if boost value and the missed-session recovery flow to show dynamic replanning.

## Decision Log
- **Rule-based extraction over LLM calls:** deterministic, offline-friendly, no token cost.
- **Interpretable risk model over black-box model:** judge-friendly reasoning and clear feature effects.
- **Single-page app:** fast demo flow with no auth friction.

## Known Limitations
- Date parser supports common English month formats and `MM/DD` / `MM-DD`.
- Task effort estimation is heuristic, not personalized by historical performance.
- No calendar/LMS sync yet.

## Next Steps
1. Add Google Calendar and Canvas integration.
2. Add user profile calibration from past completion data.
3. Add per-course configuration and personalized weight calibration.

## License
MIT

## Local Verification
```bash
/Library/Developer/CommandLineTools/usr/bin/python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install -e ".[dev]"
python -m pytest
python scripts/exercise_runtime_scorecard.py
```

## Repository Hygiene
- Keep runtime artifacts out of commits (`.codex_runs/`, cache folders, temporary venvs).
- Prefer running verification commands above before opening a PR.
