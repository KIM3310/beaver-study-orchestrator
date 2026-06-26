BOOTSTRAP_PYTHON ?= python3
VENV ?= .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_STAMP := $(VENV)/.installed-dev

.PHONY: check-bootstrap-python setup install run lint test verify

check-bootstrap-python:
	@$(BOOTSTRAP_PYTHON) -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >/dev/null 2>&1 || { \
		echo "Python 3.11+ is required to create $(VENV)."; \
		echo "Set BOOTSTRAP_PYTHON=/path/to/python3.11, for example: make BOOTSTRAP_PYTHON=/opt/homebrew/bin/python3.11 verify"; \
		exit 1; \
	}

$(VENV_PYTHON): check-bootstrap-python
	@if [ ! -x "$(VENV_PYTHON)" ] || ! $(VENV_PYTHON) -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >/dev/null 2>&1; then \
		rm -rf $(VENV); \
		$(BOOTSTRAP_PYTHON) -m venv $(VENV); \
	fi

$(VENV_STAMP): pyproject.toml | check-bootstrap-python $(VENV_PYTHON)
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
