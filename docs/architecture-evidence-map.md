# Architecture Guide - Beaver Study Orchestrator

Updated: 2026-05-30

Use this guide to review the study-orchestration product proof surface without adding unsupported customer, production, or outcome claims.

## Summary

| Field | Notes |
|---|---|
| Repository | `beaver-study-orchestrator` |
| Status | Product proof surface |
| Lane | B2C/B2B education productivity |
| Primary reader | Students, advisors, bootcamps, and education platforms. |
| Product proof | Parser, scheduler, risk analytics, what-if simulation, history, and export surfaces. |
| Private inquiry lane | consumer-prototype-customization |

## Open First

1. Start with the README fast path and public demo.
2. Check `docs/service-offer.json` before presenting paid or research next steps.
3. Run the local verification command before making quality claims.
4. Keep data, payment, and production claims behind explicit scoping.

## Evidence

- make test passes
- Risk drivers are interpretable
- ICS export path works

## Architecture Notes

| Possible offer | Working scope assumption | Scope |
|---|---|---|
| Freemium planner | Scope after product intake | Scoped after review. |
| Advisor dashboard pilot | Scope after product intake | Scoped after review. |
| Bootcamp cohort-risk analytics | Scope after product intake | Scoped after review. |

## Boundaries

- Advisory guidance only
- Student data retention needs controls
- Avoid outcome guarantees
- No outcome guarantees.
- Private workspace, cohort, and reporting work require explicit scope through the inquiry lane.

## Useful Metrics

- Schedule completion
- Risk reduction
- Advisor review time saved
