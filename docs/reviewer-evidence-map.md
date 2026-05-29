# Review Guide - Beaver Study Orchestrator

Updated: 2026-05-30

Use this page as the short path through the repository. It keeps the review grounded in the code, docs, commands, and boundaries that are already present.

## Summary

| Field | Notes |
|---|---|
| Lane | B2C/B2B education productivity |
| Core idea | Syllabus-to-schedule planner with interpretable risk and what-if simulation. |
| Primary reader | Students, advisors, bootcamps, and education platforms. |
| Stack | Python |

## Open First

1. Start with the README fast path and architecture section.
2. Open `docs/monetization-playbook.md` only when reviewing the product or service angle.
3. Check the commands below before making claims about quality.
4. Skim the CI workflows and fixture data before deeper implementation review.
5. Read the boundaries section before presenting the project externally.

## Checks

| Purpose | Command |
|---|---|
| Test suite | `make test` |

## CI

- .github/workflows/architecture-blueprint.yml
- .github/workflows/ci.yml
- .github/workflows/dependency-review.yml
- .github/workflows/repository-health.yml
- .github/workflows/repository-surface.yml
- .github/workflows/secret-scan.yml

## Evidence

- pytest/ruff-style local verification path
- make test passes
- Risk drivers are interpretable
- ICS export path works

## Commercial Notes

| Possible offer | Working price assumption |
|---|---|
| Freemium planner | Free + $5/month student |
| Advisor dashboard pilot | $199-$999/month cohort |
| Bootcamp cohort-risk analytics | $3k-$12k platform pilot |

## Boundaries

- Advisory guidance only
- Student data retention needs controls
- Avoid outcome guarantees

## Useful Metrics

- Schedule completion
- Risk reduction
- Advisor review time saved
