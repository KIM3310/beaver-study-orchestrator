from __future__ import annotations

import re
from datetime import date
from typing import List, Optional, Tuple

from app.models import Task

DATE_PATTERNS = [
    re.compile(
        r"\b(?P<month>jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(?P<day>\d{1,2})(?:st|nd|rd|th)?(?:,\s*(?P<year>\d{4}))?\b",
        flags=re.IGNORECASE,
    ),
    re.compile(r"\b(?P<month>\d{1,2})[/-](?P<day>\d{1,2})(?:[/-](?P<year>\d{2,4}))?\b"),
]

TASK_RULES: List[Tuple[str, Tuple[str, float, float, float]]] = [
    ("capstone", ("project", 12.0, 0.95, 1.3)),
    ("project", ("project", 10.0, 0.9, 1.2)),
    ("midterm", ("exam", 9.0, 0.9, 1.2)),
    ("final", ("exam", 12.0, 0.95, 1.3)),
    ("exam", ("exam", 8.0, 0.85, 1.1)),
    ("assignment", ("assignment", 4.0, 0.6, 0.8)),
    ("homework", ("assignment", 3.5, 0.55, 0.75)),
    ("lab", ("lab", 4.5, 0.65, 0.85)),
    ("quiz", ("quiz", 2.5, 0.45, 0.6)),
    ("report", ("report", 5.5, 0.7, 0.9)),
    ("presentation", ("report", 6.0, 0.7, 0.95)),
]

MONTH_LOOKUP = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


def _clean_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip(" -\t")


def _extract_due_date(raw_line: str, reference_year: int) -> Optional[date]:
    for pattern in DATE_PATTERNS:
        for match in pattern.finditer(raw_line):
            month_token = match.group("month")
            day_token = match.group("day")
            year_token = match.group("year")

            if month_token.isdigit():
                month = int(month_token)
            else:
                month = MONTH_LOOKUP[month_token[:3].lower()]

            day = int(day_token)
            year = reference_year

            if year_token:
                if len(year_token) == 2:
                    year = 2000 + int(year_token)
                else:
                    year = int(year_token)

            try:
                parsed = date(year, month, day)
            except ValueError:
                continue

            # If year is omitted and the date is in the past, decide whether to
            # shift forward one year.  A simple 120-day cutoff broke across
            # year boundaries (e.g. parsing "Jan 15" in December would not
            # shift).  Instead, compare the parsed month to the current month:
            # if the date is behind us *and* its month is earlier in the
            # calendar year than the current month, it almost certainly refers
            # to the next calendar year.
            if not year_token and parsed < date.today():
                today = date.today()
                months_behind = (today.month - parsed.month) % 12
                # If more than ~2 months behind, assume next year.
                if months_behind > 2:
                    parsed = date(year + 1, month, day)

            return parsed

    return None


def _classify_task(line: str) -> Tuple[str, float, float, float]:
    lowered = line.lower()
    for keyword, params in TASK_RULES:
        if keyword in lowered:
            return params
    return ("milestone", 3.0, 0.5, 0.7)


def _derive_title(line: str, fallback: str) -> str:
    stripped = re.sub(r"\b(due|on|by)\b.*$", "", line, flags=re.IGNORECASE).strip(" -:")
    if len(stripped) >= 3:
        return stripped[:120]
    return fallback


def _extract_grade_weight(line: str) -> Optional[float]:
    match = re.search(r"\b(?P<pct>\d{1,3})\s*%", line)
    if not match:
        return None

    pct = int(match.group("pct"))
    if pct <= 0 or pct > 100:
        return None

    # Map 1-100% to a stable 0.5-2.0 impact range.
    return round(min(2.0, max(0.5, 0.5 + (pct / 100.0) * 1.5)), 2)


def extract_tasks_from_syllabus(text: str, reference_year: Optional[int] = None) -> Tuple[List[Task], List[str]]:
    year = reference_year or date.today().year
    tasks: List[Task] = []
    discarded_lines: List[str] = []
    seen: set[tuple[str, str, str]] = set()

    lines = [
        _clean_line(raw_line)
        for raw_line in text.splitlines()
        if _clean_line(raw_line)
    ]

    for index, line in enumerate(lines, start=1):
        due = _extract_due_date(line, year)
        if not due:
            if re.search(r"\b(due|deadline|submit|exam|quiz|project|assignment|lab|report)\b", line, re.IGNORECASE):
                discarded_lines.append(line)
            continue

        task_type, base_hours, difficulty, impact_weight = _classify_task(line)

        size_boost = 1.0
        if re.search(r"\b(final|capstone|group|comprehensive)\b", line, re.IGNORECASE):
            size_boost += 0.35
        if re.search(r"\b(phase\s*2|part\s*2|iteration\s*2)\b", line, re.IGNORECASE):
            size_boost += 0.15

        explicit_weight = _extract_grade_weight(line)
        if explicit_weight is not None:
            impact_weight = explicit_weight
            size_boost += min(0.4, explicit_weight * 0.12)

        hours = round(base_hours * size_boost, 1)
        title = _derive_title(line, f"Task {index}")
        dedupe_key = (title.lower(), due.isoformat(), task_type)
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)

        task = Task(
            title=title,
            due_date=due,
            task_type=task_type,  # type: ignore[arg-type]
            estimated_hours=hours,
            difficulty=difficulty,
            impact_weight=impact_weight,
            source_line=line,
        )
        tasks.append(task)

    tasks.sort(key=lambda item: item.due_date)
    return tasks, discarded_lines
