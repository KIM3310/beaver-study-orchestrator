from app.core.syllabus_parser import extract_tasks_from_syllabus


def test_extract_tasks_from_syllabus():
    text = """
    Assignment 1 due March 12, 2026
    Quiz 1 due 03/14/2026
    Team Project Milestone due April 2, 2026
    Read chapter 4 before class
    """

    tasks, discarded = extract_tasks_from_syllabus(text, reference_year=2026)

    assert len(tasks) == 3
    assert tasks[0].task_type in {"assignment", "quiz", "project"}
    assert all(task.estimated_hours > 0 for task in tasks)
    assert isinstance(discarded, list)


def test_parser_supports_ordinal_dates_and_deduplicates_lines():
    text = """
    Final Project due March 12th, 2026 (40%)
    Final Project due March 12th, 2026 (40%)
    Midterm on 03-21-2026
    Quiz announced soon
    """

    tasks, _ = extract_tasks_from_syllabus(text, reference_year=2026)
    assert len(tasks) == 2
    final_project = next(task for task in tasks if "final project" in task.title.lower())
    assert final_project.task_type == "project"
    assert final_project.impact_weight >= 1.0
