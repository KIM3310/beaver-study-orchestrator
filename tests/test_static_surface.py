from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = (ROOT / "app" / "static" / "index.html").read_text(encoding="utf-8")
APP_JS = (ROOT / "app" / "static" / "app.js").read_text(encoding="utf-8")
STYLE_CSS = (ROOT / "app" / "static" / "style.css").read_text(encoding="utf-8")


def test_first_pass_route_surface_is_present():
    assert 'First-Pass Route' in INDEX_HTML
    assert 'id="firstPassHeadline"' in INDEX_HTML
    assert 'id="firstPassBoundary"' in INDEX_HTML
    assert 'function renderFirstPassRoute()' in APP_JS
    assert 'renderFirstPassRoute();' in APP_JS
    assert '.first-pass-grid' in STYLE_CSS
