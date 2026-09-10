#!/usr/bin/env python3
"""Fail-closed acceptance audit for the WAIS INVEST public system."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message):
    raise SystemExit("WAIS ACCEPTANCE AUDIT FAILED — " + message)


def main():
    canonical = json.loads((ROOT / "canonical-universe.json").read_text(encoding="utf-8"))
    prices = json.loads((ROOT / "stock-prices.json").read_text(encoding="utf-8"))
    policy = json.loads((ROOT / "wais-execution-policy.json").read_text(encoding="utf-8"))
    loader = (ROOT / "market-data.js").read_text(encoding="utf-8")
    generated = (ROOT / "wais-canonical-generated.js").read_text(encoding="utf-8")
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    workbench = json.loads((ROOT / "research-workbench.json").read_text(encoding="utf-8"))

    active = canonical.get("contract", {}).get("activeStages", [])
    seen = {}
    for stage, tickers in canonical.get("stages", {}).items():
        for ticker in tickers or []:
            ticker = str(ticker).upper()
            if ticker in seen:
                fail(f"{ticker} appears in both {seen[ticker]} and {stage}")
            seen[ticker] = stage
    core_count = sum(len(canonical["stages"].get(s, [])) for s in ("READY 1", "CANDIDATE+", "CANDIDATE"))
    if core_count > canonical["contract"]["listLimits"]["coreActionMaximum"]:
        fail("core action list exceeds its canonical limit")
    if len(canonical["stages"].get("RESEARCH", [])) > canonical["contract"]["listLimits"]["researchQueueMaximum"]:
        fail("research queue exceeds its canonical limit")
    required = {t for s in active for t in canonical["stages"].get(s, [])}
    missing = sorted(required - set(prices.get("prices", {})))
    if missing:
        fail("missing canonical quotes: " + ", ".join(missing))
    if prices.get("failedSymbols") or prices.get("canonicalQuoteUniverse", {}).get("status") != "PASS":
        fail("quote refresh/reconciliation is not PASS")
    if policy.get("automationContract", {}).get("promotionGuard") is None:
        fail("automatic-promotion guard missing")
    dated = re.findall(r"wais-(?:canonical-state|cross-section-sync|live-session|postclose-state|column-reconciliation|reconciliation)-\d+\.js", loader)
    if dated:
        fail("dated authority overlays still loaded: " + ", ".join(dated))
    if "wais-canonical-generated.js" not in loader:
        fail("generated canonical runtime is not loaded")
    if canonical.get("version") not in generated:
        fail("generated runtime is stale")
    gems = canonical.get("displayViews", {}).get("hiddenGems", {})
    gem_names = gems.get("tickers", [])
    if len(gem_names) > gems.get("maximum", 6):
        fail("Hidden Gems exceeds its compact-view limit")
    research = set(canonical.get("stages", {}).get("RESEARCH", []))
    invalid_gems = sorted(set(gem_names) - research)
    if invalid_gems:
        fail("Hidden Gems outside canonical RESEARCH: " + ", ".join(invalid_gems))
    for asset in ("wais-command-center-v3.css", "wais-command-center-v3.js"):
        if asset not in index or not (ROOT / asset).is_file():
            fail(f"Command Center asset missing: {asset}")
    discovery = [x.get("ticker") for x in workbench.get("discovery", [])]
    invalid_discovery = sorted(set(discovery) - research)
    if invalid_discovery:
        fail("Discovery Workbench priorities outside canonical RESEARCH: " + ", ".join(invalid_discovery))
    print(f"WAIS ACCEPTANCE AUDIT: PASS · {len(required)} active symbols · canonical {canonical['version']}")


if __name__ == "__main__":
    main()
