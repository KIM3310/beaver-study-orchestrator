from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = ROOT / "app" / "static" / "index.html"
APP_JS = ROOT / "app" / "static" / "app.js"
STYLE_CSS = ROOT / "app" / "static" / "style.css"


def test_first_fold_starter_summary_contract() -> None:
    html = INDEX_HTML.read_text(encoding="utf-8")
    js = APP_JS.read_text(encoding="utf-8")
    css = STYLE_CSS.read_text(encoding="utf-8")

    assert 'id="starterSummary"' in html
    assert 'starterSummaryText' in js
    assert 'Loaded scenario' in js
    assert '.starter-summary {' in css
    assert '.starter-card.is-active {' in css
    assert 'id="actionUnlockSummary"' in html
    assert 'unlockPlanChip' in html
    assert 'renderActionUnlockGuide' in js
    assert 'resetDerivedPlanArtifacts' in js
    assert '.action-unlock-guide {' in css
    assert '.action-chip.is-active {' in css
