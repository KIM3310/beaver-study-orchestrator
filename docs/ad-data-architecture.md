# Ad-Supported Resource and Aggregate Data Architecture

Repository: `beaver-study-orchestrator`

## Public Resource Model

Free study-orchestration template for planning learning sessions and review loops.

- Audience: students and education-tool builders
- Central resource: https://kim3310-doeon-kim-portfolio.pages.dev/resources/beaver-study-orchestrator/
- Live system: https://kim3310.github.io/beaver-study-orchestrator/
- Advertising boundary: ads allowed only on public study-template pages; personal schedules, notes, progress, and result flows are ad-free
- Current ad state: code-ready on the central resource; serving depends on Google AdSense site approval and consent policy.

## Readiness Utility

The central resource turns the repository architecture into a practical review checklist:

- **Architecture Summary:** Repository-local proof surface for applied model pipelines and evidence-backed inference, backed by Python service or lab runtime, GitHub Actions validation.
- **Runtime And Data Flow:** Primary domain: applied model pipelines and evidence-backed inference.
- **Cloud Or Local Deployment Boundary:** Operating model: artifact registries, batch and online inference paths, edge/managed serving options, and model monitoring hooks
- **Deployment patterns:** Model serving envelope with artifact traceability, inference monitoring, and quality drift hooks
- **Control boundaries:** identity boundary and least-privilege service access environment separation for local, staging, and managed runtime paths secret storage outside source and deterministic fallback for missing credentials observability hooks for logs, metrics, traces, and audit events rollback path...

The checklist state remains in the visitor's browser and is not transmitted.

## Aggregate Data Boundary

- Data asset: anonymous aggregate study-template demand and resource CTA counts
- Sensitivity class: consumer-guarded
- Allowed events: `resource_view`, `resource_cta_click`, `architecture_doc_open`, `privacy_support_open`
- Prohibited fields: `raw_input`, `url`, `referrer`, `title`, `user_id`, `session_id`, `ip_address`, `precise_location`, `payment_detail`
- Consent defaults to off.
- DNT and Global Privacy Control fail closed.
- Events are reduced to repository, allowlisted event, public surface, and consent-policy version.
- Personal, sensitive, raw, event-level, or re-identifiable data is never offered for sale.

## Storage Path

```text
Public resource
  -> consent and privacy-signal gate
  -> Cloudflare Pages event API
  -> rate-limited daily aggregate counter
  -> public benchmark response
  -> Firebase public aggregate data mart
```

Cloudflare D1 holds operational counters. Firestore project `kim3310-free-tools` is the deny-by-default public aggregate data mart. Private inquiries remain isolated from telemetry.
