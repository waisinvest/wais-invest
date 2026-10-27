"""Fail-closed validation of required market feeds; isolate optional HSTECH gap.

An optional feed must be visibly SOURCE GAP / LAST-KNOWN-GOOD, not silently
treated as LIVE. Never permit a missing US/VIX/10Y/HSI feed through this gate.
"""
from __future__ import annotations

import json
from pathlib import Path

REQUIRED = frozenset({"SP500", "NASDAQ", "NASDAQ100", "DOW", "SOX", "VIX", "US10Y", "HSI"})
OPTIONAL = frozenset({"HSTECH"})


def validate_market_gaps(market: dict) -> None:
    indicators = market.get("indicators") or {}
    failures = market.get("failedSymbols") or []
    if not isinstance(failures, list):
        raise AssertionError("failedSymbols must be a list")
    for key in REQUIRED:
        row = indicators.get(key)
        if not isinstance(row, dict) or not row.get("regularCloseDate"):
            raise AssertionError(f"required market indicator missing verified close: {key}")
        if row.get("freshness") == "SOURCE GAP":
            raise AssertionError(f"required market indicator in SOURCE GAP: {key}")
    for item in failures:
        if not isinstance(item, str) or ":" not in item:
            raise AssertionError(f"malformed market failure: {item}")
        key = item.split(":", 1)[0].strip()
        if key not in OPTIONAL:
            raise AssertionError(f"required/unknown market feed failed: {key}")
        row = indicators.get(key) or {}
        if row.get("freshness") != "SOURCE GAP":
            raise AssertionError(f"{key} failure missing SOURCE GAP label")
        if "LAST-KNOWN-GOOD" not in row.get("dataStatus", ""):
            raise AssertionError(f"{key} failure missing LAST-KNOWN-GOOD label")
    if failures and market.get("marketStatus") != "partial":
        raise AssertionError("market must be partial when optional source gaps exist")
    if not failures and market.get("marketStatus") == "partial":
        raise AssertionError("partial market status requires explicit failedSymbols")


if __name__ == "__main__":
    data = json.loads(Path("market-indicators.json").read_text(encoding="utf-8"))
    validate_market_gaps(data)
    print("WAIS public market gap isolation: PASS")
