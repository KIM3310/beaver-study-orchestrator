from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = ROOT / "app" / "static" / "index.html"
PREVIEW_CARD = ROOT / "app" / "static" / "preview-card.svg"
DOCS_OFFER = ROOT / "docs" / "service-offer.json"
SITE_OFFER = ROOT / "site" / "service-offer.json"
SITE_INDEX = ROOT / "site" / "index.html"
SEARCH_GROWTH = ROOT / "docs" / "search-growth-implementation.md"
REVENUE_ARCHITECTURE = ROOT / "docs" / "revenue-architecture.md"

PAID_SKU = "Consumer Prototype Customization"
STALE_HISTORY_SKU = "premium study history, cohort dashboard, and exportable progress report"

PRIVATE_INQUIRY_URL = (
    "https://kim3310-doeon-kim-portfolio.pages.dev/"
    "?offer=beaver-study-orchestrator&inquiry=consumer-prototype-customization#private-inquiry"
)


def test_frontend_metadata_contract() -> None:
    html = INDEX_HTML.read_text(encoding="utf-8")
    required_tokens = [
        'name="description"',
        'property="og:title"',
        'property="og:description"',
        'property="og:image"',
        'property="og:image:alt"',
        'name="twitter:title"',
        'name="twitter:description"',
        'name="twitter:image"',
    ]

    for token in required_tokens:
        assert token in html, token


def test_preview_asset_exists() -> None:
    assert PREVIEW_CARD.exists()


def test_service_offer_manifests_use_private_inquiry_lane() -> None:
    for path in (DOCS_OFFER, SITE_OFFER):
        offer = json.loads(path.read_text(encoding="utf-8"))
        assert offer["lead_capture_url"] == PRIVATE_INQUIRY_URL
        assert offer["commerce"]["lane_id"] == "consumer-prototype-customization"
        assert offer["commerce"]["checkout"]["status"] == "not-configured"
        assert offer["commerce"]["checkout"]["fallback_url"] == PRIVATE_INQUIRY_URL
        assert offer["structured_data"]["offers"][1]["url"] == PRIVATE_INQUIRY_URL
        assert offer["first_paid_sku"] == PAID_SKU
        assert offer["monetization_boundary"]["paid"] == PAID_SKU
        assert offer["structured_data"]["offers"][1]["name"] == PAID_SKU
        assert STALE_HISTORY_SKU not in json.dumps(offer)


def test_public_service_surface_uses_private_inquiry_not_public_issue_form() -> None:
    public_text = SITE_INDEX.read_text(encoding="utf-8") + SEARCH_GROWTH.read_text(encoding="utf-8")
    assert PRIVATE_INQUIRY_URL in public_text
    assert "GitHub Issue Form" not in public_text
    assert "issues/new" not in public_text


def test_public_docs_frame_cohort_history_dashboard_as_later_expansion() -> None:
    public_text = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (SITE_INDEX, SEARCH_GROWTH, REVENUE_ARCHITECTURE)
    )

    assert PAID_SKU in public_text
    assert "later expansion" in public_text or "post-customization expansion" in public_text
    assert STALE_HISTORY_SKU not in public_text


def test_cloudflare_adsense_static_surface_is_ready() -> None:
    adsense_client = "ca-pub-4973160293737562"
    ads_txt = "google.com, pub-4973160293737562, DIRECT, f08c47fec0942fa0"
    canonical = "https://beaver-study-orchestrator.pages.dev/"

    assert (ROOT / "site" / "ads.txt").read_text(encoding="utf-8").strip() == ads_txt

    index = SITE_INDEX.read_text(encoding="utf-8")
    assert f'name="google-adsense-account" content="{adsense_client}"' in index
    loader = f"adsbygoogle.js?client={adsense_client}"
    assert loader not in index

    for filename in ("guide.html", "architecture.html", "verification.html"):
        assert loader in (ROOT / "site" / filename).read_text(encoding="utf-8")
    for filename in ("publisher.html", "privacy.html", "terms.html"):
        html = (ROOT / "site" / filename).read_text(encoding="utf-8")
        assert loader not in html

    sitemap = (ROOT / "site" / "sitemap.xml").read_text(encoding="utf-8")
    for route in (
        "guide",
        "architecture",
        "verification",
        "publisher",
        "privacy",
        "terms",
    ):
        assert f"https://beaver-study-orchestrator.pages.dev/{route}" in sitemap

    llms = (ROOT / "site" / "llms.txt").read_text(encoding="utf-8")
    assert f"Canonical URL: {canonical}" in llms

    offer = json.loads((ROOT / "site" / "service-offer.json").read_text(encoding="utf-8"))
    assert offer["canonical_url"] == canonical
    assert offer["structured_data"]["url"] == canonical
    assert offer["structured_data"]["offers"][0]["url"] == canonical

    wrangler = json.loads((ROOT / "wrangler.jsonc").read_text(encoding="utf-8"))
    assert wrangler["name"] == "beaver-study-orchestrator"
    assert wrangler["pages_build_output_dir"] == "site"
