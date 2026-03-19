from __future__ import annotations

import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app


def render_output(output: dict[str, object], output_path: Path | None = None) -> str:
    rendered = json.dumps(output, ensure_ascii=True, indent=2)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(f"{rendered}\n", encoding="utf-8")
    return rendered


def main() -> None:
    output_path = None
    args = iter(sys.argv[1:])
    for arg in args:
      if arg == "--output":
        candidate = next(args, "")
        output_path = Path(candidate) if candidate else None

    client = TestClient(app)
    sample_syllabus = """
    Assignment 1 due March 12, 2026
    Midterm Exam on March 22, 2026
    Project Demo due April 3, 2026
    """.strip()
    availability = {
        "monday": 2,
        "tuesday": 2,
        "wednesday": 2,
        "thursday": 2,
        "friday": 2,
        "saturday": 3,
        "sunday": 3,
    }

    health = client.get("/api/health")
    brief = client.get("/api/runtime/brief")
    review_pack = client.get("/api/review-pack")
    analysis = client.post(
        "/api/analyze",
        json={
            "syllabus_text": sample_syllabus,
            "availability": availability,
            "start_date": "2026-03-10",
        },
    )
    analysis.raise_for_status()
    tasks = analysis.json()["extraction"]["tasks"]
    what_if = client.post(
        "/api/what-if",
        json={
            "tasks": tasks,
            "availability": availability,
            "daily_boost": 1.0,
            "start_date": "2026-03-10",
        },
    )

    for response in (health, brief, review_pack, what_if):
        response.raise_for_status()

    analysis_payload = analysis.json()
    what_if_payload = what_if.json()
    output = {
        "service": "beaver-study-orchestrator",
        "health": health.json()["diagnostics"],
        "runtime_brief_contract": brief.json()["readiness_contract"],
        "review_pack_contract": review_pack.json()["readiness_contract"],
        "analyze_summary": {
            "task_count": len(tasks),
            "risk_level": analysis_payload["plan"]["risk"]["level"],
            "focus_days": analysis_payload["plan"]["diagnostics"]["focus_days"],
            "next_action": analysis_payload["plan"]["diagnostics"]["next_action"],
        },
        "what_if_summary": {
            "recommendation": what_if_payload["recommendation"],
            "baseline_risk": what_if_payload["baseline"]["risk_score"],
            "boosted_risk": what_if_payload["boosted"]["risk_score"],
        },
    }
    print(render_output(output, output_path))


if __name__ == "__main__":
    main()
