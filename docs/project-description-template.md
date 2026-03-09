# Project Description Template

## Project Title
Beaver Study Orchestrator

## Tagline
From messy syllabus text to an executable study plan in seconds.

## What it does
Beaver Study Orchestrator converts unstructured course text into:
- extracted deadlines and task types
- an adaptive day-by-day study schedule
- an interpretable deadline risk score with mitigation actions
- a what-if simulator (`+1h/day`) showing risk and spillover reduction
- a downloadable `.ics` calendar plan for immediate execution

## The problem it solves
Students often miss deadlines because course plans are fragmented across syllabi, announcements, and notes. Existing planning workflows are manual and reactive.

## How we built it
- FastAPI backend for analysis APIs
- rule-based parser for due-date and task extraction
- priority-aware scheduling algorithm using daily availability
- explainable risk model with feature contributions and recommendations
- vanilla JS frontend for a fast demo flow

## Challenges we ran into
The most critical bug was a crash when no valid dates were extracted from input text. We fixed this by returning a graceful, informative response and user guidance instead of a server error.

## Accomplishments
- end-to-end working prototype with no paid API dependencies
- interpretable risk outputs suitable for technical review
- direct calendar export bridging analysis to action
- reproducible tests and CI pipeline

## What we learned
- deterministic heuristics can be production-useful with strong guardrails
- explainability significantly improves stakeholder trust in educational tools
- user value increases when outputs are immediately actionable

## What's next
- LMS integrations
- personalized calibration from completion history
- reminder nudges and adaptive re-planning
