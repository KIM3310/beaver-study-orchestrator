from __future__ import annotations

from datetime import UTC, datetime
from datetime import timedelta

from app.models import StudyPlan, Task


def _sanitize_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", " ")


def _dtstamp() -> str:
    return datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")


def _event_uid(date_str: str, index: int) -> str:
    return f"bso-{date_str}-{index}@beaver-study-orchestrator"


def build_ics_calendar(tasks: list[Task], plan: StudyPlan) -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Beaver Study Orchestrator//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    stamp = _dtstamp()
    for idx, item in enumerate(plan.items, start=1):
        day = item.date.strftime("%Y%m%d")
        next_day = (item.date + timedelta(days=1)).strftime("%Y%m%d")
        summary = _sanitize_text(f"Study: {item.task_title}")
        description = _sanitize_text(
            f"Planned workload: {item.hours:.1f}h | Type: {item.task_type}"
        )
        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{_event_uid(day, idx)}",
                f"DTSTAMP:{stamp}",
                f"DTSTART;VALUE=DATE:{day}",
                f"DTEND;VALUE=DATE:{next_day}",
                f"SUMMARY:{summary}",
                f"DESCRIPTION:{description}",
                "END:VEVENT",
            ]
        )

    for idx, task in enumerate(tasks, start=1):
        due = task.due_date.strftime("%Y%m%d")
        due_next = (task.due_date + timedelta(days=1)).strftime("%Y%m%d")
        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:due-{_event_uid(due, idx)}",
                f"DTSTAMP:{stamp}",
                f"DTSTART;VALUE=DATE:{due}",
                f"DTEND;VALUE=DATE:{due_next}",
                f"SUMMARY:{_sanitize_text('Due: ' + task.title)}",
                f"DESCRIPTION:{_sanitize_text(f'Estimated effort: {task.estimated_hours:.1f}h')}",
                "END:VEVENT",
            ]
        )

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"
