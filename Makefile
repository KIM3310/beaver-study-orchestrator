.PHONY: setup run test

setup:
	python3 -m venv .venv && . .venv/bin/activate && pip install -e ".[dev]"

run:
	. .venv/bin/activate && uvicorn app.main:app --reload --port 8000

test:
	. .venv/bin/activate && python -m pytest
