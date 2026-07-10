VENV ?= .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_STAMP := $(VENV)/.installed-dev
PYTHON_MIN_VERSION := 3.11
PYTHON_CANDIDATES := $(VENV_PYTHON) python3.13 python3.12 python3.11 python3
BOOTSTRAP_PYTHON ?= $(shell for py in $(PYTHON_CANDIDATES); do \
	if command -v $$py >/dev/null 2>&1 && $$py -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' >/dev/null 2>&1; then \
		command -v $$py; \
		break; \
	fi; \
done)

.PHONY: check-bootstrap-python setup install run lint test verify

check-bootstrap-python:
	@if [ -z "$(BOOTSTRAP_PYTHON)" ]; then \
		echo "Python $(PYTHON_MIN_VERSION)+ is required to create $(VENV)."; \
		echo "Set BOOTSTRAP_PYTHON=/path/to/python$(PYTHON_MIN_VERSION), for example: make BOOTSTRAP_PYTHON=/opt/homebrew/bin/python$(PYTHON_MIN_VERSION) verify"; \
		exit 1; \
	fi
	@$(BOOTSTRAP_PYTHON) -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >/dev/null 2>&1 || { \
		echo "BOOTSTRAP_PYTHON=$(BOOTSTRAP_PYTHON) is not Python $(PYTHON_MIN_VERSION)+."; \
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
