# Service Architecture - beaver-study-orchestrator

This document defines the deployment and resource plan for turning this repository into a buyer-reviewable service. It intentionally avoids public financial assumptions, public financial guesses, or contract assumptions.

## Commercial Role

- **Lane:** Education planning and orchestration
- **Primary buyer:** Study coaches, cohorts, or education teams if a narrow niche is selected
- **First motion:** Single cohort workflow validation

## Recommended Architecture

Static proof, optional API/backend for schedules and cohort dashboards, managed Postgres for plans and progress.

~~~text
Visitor or operator
  -> public proof surface
  -> scoped app/API layer when a buyer workflow needs state
  -> managed data, object storage, queue, and observability only after scope is approved
  -> signed report, demo, export, or operating handoff
~~~

## Resource Plan

| Resource | Use | Buy timing |
| --- | --- | --- |
| Static hosting | GitHub Pages or Cloudflare Pages for a public, cacheable proof surface with custom-domain routing later. | Already sufficient for proof surfaces unless a custom domain is needed. |
| App/API runtime | Render, Fly.io, Railway, or Cloudflare Workers for a small API runtime only after a real workflow needs server state. | Buy only when a pilot needs authenticated workflows, integrations, or server-side jobs. |
| Data layer | Supabase or Neon Postgres for relational state; Cloudflare D1 only when the app is Workers-first and relational needs are small. | Buy after the workflow has real state, roles, or audit history. |
| Object storage | Cloudflare R2 or S3-compatible storage for uploads, reports, screenshots, model artifacts, or signed exports. | Buy when reports, uploads, signed exports, or model artifacts must persist. |
| Queue/cache | Upstash Redis/QStash or Cloudflare Queues for async jobs, retries, scheduled checks, and rate-limited workflows. | Buy when jobs, retries, scheduling, rate limits, or async processing appear. |
| Observability | Sentry plus privacy-safe web analytics for errors, performance, and buyer-flow learning without storing private visitor data. | Enable before external users test the service. |

## Repo-Specific Resources

- GitHub Pages
- Render/Fly API
- managed Postgres
- email/calendar integration later

## Information Needed From Account Owner

- DATABASE_URL
- calendar/email token if enabled
- AUTH_SECRET

## Revenue Channel Architecture

- **Primary channel:** B2C app and game distribution
- **Monetization route:** App subscriptions, in-app purchases, ads, publisher route, or community-supported launch path.
- **Acquisition motion:** Playable demo, store listing, creator clips, lightweight community loop, and portfolio proof.
- **Activation path:** Polish onboarding, accessibility, crash reporting, retention loop, and support copy before paid distribution.
- **Margin control:** Use static or serverless hosting first; add paid backend resources only for accounts, payments, multiplayer, or durable state.
- **Public boundary:** Keep revenue, pricing, and contract assumptions in private planning; this repository publishes service structure, resource needs, and technical proof only.

## Cost and Risk Controls

- student privacy
- parent/coach access boundaries
- no outcome guarantees

## Production Readiness Checklist

- Public demo route or README proof link is current.
- Service boundary states what the system does and does not do.
- Data storage, retention, and deletion path are defined before private data is accepted.
- Secrets are stored in platform secret managers, never committed to the repo.
- Spend limits, usage alerts, or manual approval gates are enabled before buyer testing.
- Logs and analytics avoid private payloads.
- Rollback or disable path exists for every external integration.
