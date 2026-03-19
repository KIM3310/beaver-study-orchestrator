"""Tests for date parsing year-boundary logic in syllabus_parser.

The parser was recently fixed to handle cases where a date like "Jan 15"
is parsed in December -- it should roll forward to the next year when
the parsed month is more than 2 months behind the current month.
"""

from __future__ import annotations

from datetime import date
from unittest.mock import patch

from app.core.syllabus_parser import _extract_due_date


def test_explicit_year_never_shifts():
    """When a year is explicitly given, the parser must not shift it."""
    result = _extract_due_date("Assignment due Jan 15, 2025", reference_year=2026)
    assert result == date(2025, 1, 15)


def test_two_digit_year_expansion():
    """Two-digit years should expand correctly (e.g. 26 -> 2026)."""
    result = _extract_due_date("Quiz on 03/14/26", reference_year=2026)
    assert result == date(2026, 3, 14)


def test_numeric_date_without_year_uses_reference():
    """Numeric MM/DD without year should use the reference year."""
    result = _extract_due_date("Exam on 04/20", reference_year=2026)
    assert result is not None
    assert result.month == 4
    assert result.day == 20


def test_future_month_no_shift():
    """A date whose month is in the future should not be shifted forward."""
    # If today is 2026-03-19 and we parse "Nov 10" with reference_year=2026,
    # November is ahead of March, so no shift should occur.
    with patch("app.core.syllabus_parser.date") as mock_date:
        mock_date.today.return_value = date(2026, 3, 19)
        mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
        result = _extract_due_date("Report due Nov 10", reference_year=2026)
    assert result == date(2026, 11, 10)


def test_year_boundary_shift_jan_parsed_in_december():
    """Parsing 'Jan 15' when today is December should shift to next year."""
    with patch("app.core.syllabus_parser.date") as mock_date:
        mock_date.today.return_value = date(2026, 12, 1)
        mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
        result = _extract_due_date("Lab due Jan 15", reference_year=2026)
    # Jan is 11 months behind December, so it should shift to 2027
    assert result == date(2027, 1, 15)


def test_year_boundary_no_shift_for_recent_past():
    """A date only 1 month behind should NOT shift forward."""
    with patch("app.core.syllabus_parser.date") as mock_date:
        mock_date.today.return_value = date(2026, 4, 5)
        mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
        result = _extract_due_date("Quiz due Mar 20", reference_year=2026)
    # March is only 1 month behind April -- within the 2-month tolerance
    assert result == date(2026, 3, 20)


def test_invalid_date_returns_none():
    """A line with no parseable date returns None."""
    result = _extract_due_date("Read chapter 5 before class", reference_year=2026)
    assert result is None


def test_ordinal_dates_parsed_correctly():
    """Ordinal suffixes (1st, 2nd, 3rd, 12th) should be handled."""
    result = _extract_due_date("Project due March 22nd, 2026", reference_year=2026)
    assert result == date(2026, 3, 22)

    result2 = _extract_due_date("Assignment due April 1st, 2026", reference_year=2026)
    assert result2 == date(2026, 4, 1)
