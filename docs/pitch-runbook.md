# Pitch Runbook

## Demo Flow (2-4 min)
1. Problem in 15 seconds: students miss deadlines because syllabus data is unstructured.
2. Paste messy syllabus text.
3. Click **Generate Plan** and show extracted tasks + estimated effort.
4. Highlight risk score and top drivers.
5. Run **What-if +1h/day** to prove decision-support value.
6. Show mitigation actions and explain one tradeoff.
7. Click **Download .ics** and show calendar-ready execution.

## Reviewer-Facing Talking Points
- **Technical depth:** free-text parsing + allocation algorithm + interpretable risk model + scenario simulation.
- **Reliability:** handles empty/no-date input without server crashes.
- **User value:** turns analysis into action via calendar export.
- **Engineering quality:** tests + CI + reproducible local setup.

## Q&A Prep
- Why rule-based parser?
  - Deterministic, cheap, and reproducible for student use-cases.
- Why not black-box ML for risk?
  - Reviewers can inspect every feature and coefficient; easier trust and debugging.
- Biggest bug fixed?
  - No-date syllabi previously caused 500; now graceful response with guidance.

## Presentation Hygiene
- Keep README first screen concise and outcome-driven.
- Ensure hosted demo or local run instructions are tested right before a review.
