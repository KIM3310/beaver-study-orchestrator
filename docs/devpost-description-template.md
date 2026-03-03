# Devpost Description Template

## Project Title
Beaver Study Orchestrator

## Tagline
From messy syllabus text to an executable study plan in seconds.

## What it does
Beaver Study Orchestrator converts unstructured course text into:
- Extracted deadlines and task types
- An adaptive day-by-day study schedule
- An interpretable deadline risk score with mitigation actions
- A what-if simulator (`+1h/day`) showing risk and spillover reduction
- A downloadable `.ics` calendar plan for immediate execution

## The problem it solves
Students often miss deadlines because course plans are fragmented across syllabi, announcements, and notes. Existing planning workflows are manual and reactive.

## How we built it
- FastAPI backend for analysis APIs
- Rule-based NLP-style parser for due-date and task extraction
- Priority-aware scheduling algorithm using daily availability
- Explainable risk model with feature contributions and recommendations
- Vanilla JS frontend for one-click demo flow

## Challenges we ran into
The most critical bug was a crash when no valid dates were extracted from input text. We fixed this by returning a graceful, informative response and user guidance instead of a server error.

## Accomplishments that we're proud of
- End-to-end working prototype with no paid API dependencies
- Interpretable risk outputs suitable for judge Q&A
- Direct calendar export bridging analysis to action
- Reproducible tests and CI pipeline

## What we learned
- Deterministic heuristics can be production-useful with strong guardrails
- Explainability significantly improves stakeholder trust in educational tools
- User value increases when outputs are immediately actionable

## What's next for Beaver Study Orchestrator
- LMS integrations (Canvas)
- Personalized calibration from completion history
- Smart reminder nudges and adaptive re-planning
