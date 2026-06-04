BOOTSTRAP_PYTHON ?= python3
VENV ?= .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_STAMP := $(VENV)/.installed-dev

.PHONY: setup install run lint test verify

$(VENV_PYTHON):
	@if [ ! -x "$(VENV_PYTHON)" ] || ! $(VENV_PYTHON) -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >/dev/null 2>&1; then \
		rm -rf $(VENV); \
		$(BOOTSTRAP_PYTHON) -m venv $(VENV); \
	fi

$(VENV_STAMP): pyproject.toml $(VENV_PYTHON)
	$(VENV_PYTHON) -m pip install --upgrade pip
	$(VENV_PYTHON) -m pip install -e ".[dev]"
	touch $(VENV_STAMP)

install setup: $(VENV_STAMP)

run: install
	$(VENV_PYTHON) -m uvicorn app.main:app --reload --port 8000

lint: install
	$(VENV_PYTHON) -m ruff check app tests

test: install
	$(VENV_PYTHON) -m pytest

verify: lint test
