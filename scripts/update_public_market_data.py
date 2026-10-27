#!/usr/bin/env python3
"""Refresh genuine public market snapshots without secrets.

Data comes from Yahoo Finance public chart responses and may be delayed.
The script never labels data as exchange real-time and preserves prior
research-only/income fields that are not part of the quote response.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

ROOT = Path(__file__).resolve().parents[1]
STOCK_PATH = ROOT / "stock-prices.json"
MARKET_PATH = ROOT / "market-indicators.json"
SOURCE = "Yahoo Finance public chart"
STATUS = "Latest available public snapshot; may be delayed; NOT exchange real-time"
HEADERS = {"User-Agent": "Mozilla/5.0 WAIS-Public-Data/1.0"}

PUBLIC_RESEARCH_SYMBOLS = {
    "GNRC", "TTMI", "MP", "UUUU", "USAR", "NB", "WWR", "FEAM",
    "KTOS", "AVAV", "RCAT", "PLTR", "RKLB", "LUNR", "LMT", "NOC",
    "LEU", "CCJ", "OKLO", "SMR", "CEG", "VRT", "ETN", "GEV", "AMKR",
}

INDICATORS = {
    "SP500": "^GSPC",
    "NASDAQ": "^IXIC",
    "NASDAQ100": "^NDX",
    "DOW": "^DJI",
    "SOX": "^SOX",
    "VIX": "^VIX",
    "US10Y": "^TNX",
    "HSI": "^HSI",
    "HSTECH": "HSTECH.HK",
}

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def fetch_chart(symbol, attempts=3, interval="5m", range_="5d", prepost=True):
    encoded = urllib.parse.quote(symbol, safe="")
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded}"
        f"?range={range_}&interval={interval}&includePrePost={'true' if prepost else 'false'}&events=div%2Csplits"
    )
    last_error = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as response:
                payload = json.load(response)
            result = payload["chart"]["result"][0]
            stamps = result.get("timestamp") or []
            closes = (result.get("indicators", {}).get("quote") or [{}])[0].get("close") or []
            points = [(ts, px) for ts, px in zip(stamps, closes) if px is not None]
            if not points:
                raise ValueError("no usable quote points")
            ts, price = points[-1]
            return result.get("meta", {}), int(ts), float(price)
        except Exception as exc:
            last_error = exc
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{symbol}: {last_error}")

def iso_at(ts, tz_offset=0):
    return datetime.fromtimestamp(ts, timezone.utc).isoformat()

def exchange_date(ts, meta):
    """Return an exchange-local trading date, not the UTC calendar date.

    Yahoo daily candles for Asia/Hong_Kong can begin on the preceding UTC day.
    Comparing UTC dates silently treats the current partial daily bar as
    yesterday's close, causing false 0.00% intraday changes.
    """
    name = meta.get("exchangeTimezoneName") or "UTC"
    try:
        zone = ZoneInfo(name)
    except (ZoneInfoNotFoundError, ValueError):
        zone = timezone.utc
    return datetime.fromtimestamp(ts, timezone.utc).astimezone(zone).date()


def regular_date(meta):
    ts = meta.get("regularMarketTime")
    return exchange_date(ts, meta).isoformat() if ts else None

def daily_closes(symbol):
    encoded = urllib.parse.quote(symbol, safe="")
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded}"
        "?range=1mo&interval=1d&includePrePost=false&events=div%2Csplits"
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as response:
        payload = json.load(response)
    result = payload["chart"]["result"][0]
    stamps = result.get("timestamp") or []
    closes = (result.get("indicators", {}).get("quote") or [{}])[0].get("close") or []
    return [(int(ts), float(px)) for ts, px in zip(stamps, closes) if px is not None]

def completed_daily_closes(rows, meta, observed_at=None):
    """Use exchange-local COMPLETED daily candles, never a partial same-day bar.

    16:20 is deliberately conservative (early closes are delayed, not advanced).
    No timezone -> fail closed; never turn a partial VIX/US10Y candle into a
    regularCloseDate.  Keep current intraday value/asOf separately.
    """
    from datetime import time as dt_time
    name = meta.get("exchangeTimezoneName")
    if not name:
        raise ValueError("missing exchange timezone for daily-close validation")
    zone = ZoneInfo(name)
    current = (observed_at or datetime.now(timezone.utc)).astimezone(zone)
    by_day = {}
    for ts, price in rows:
        day = exchange_date(ts, meta)
        if day > current.date():
            continue
        if day == current.date() and current.time() < dt_time(16, 20):
            continue
        by_day[day] = (ts, price)
    return [by_day[day] for day in sorted(by_day)]


def update_quote(existing, symbol, observed_at=None):
    meta, ts, price = fetch_chart(symbol)
    daily = completed_daily_closes(daily_closes(symbol), meta, observed_at)
    if len(daily) < 2:
        raise ValueError(f"{symbol}: fewer than two verified completed daily closes")
    latest_day = exchange_date(ts, meta)
    last_daily_day = exchange_date(daily[-1][0], meta)
    if latest_day < last_daily_day:
        raise ValueError(f"{symbol}: intraday quote predates completed daily history")
    # The latest value may be premarket/intraday, but regularClose and its
    # date always come from the last COMPLETED daily bar, not provider meta.
    prior = daily[-2][1] if latest_day == last_daily_day else daily[-1][1]
    regular = daily[-1][1]
    regular_ts = daily[-1][0]
    change = price - float(prior) if prior not in (None, 0) else None
    pct = change / float(prior) * 100 if change is not None and prior else None
    updated = dict(existing or {})
    # A recovered quote must not inherit SOURCE GAP from its prior failed run.
    updated.pop("freshness", None)
    updated.update({
        "price": round(price, 6),
        "currency": meta.get("currency") or updated.get("currency"),
        "asOf": iso_at(ts),
        "session": "LATEST PUBLIC SNAPSHOT",
        "source": SOURCE,
        "dataStatus": STATUS,
        "regularClose": round(float(regular), 6) if regular is not None else updated.get("regularClose"),
        "regularCloseDate": (
            exchange_date(regular_ts, meta).isoformat()
            if regular_ts else regular_date(meta) or updated.get("regularCloseDate")
        ),
        "previousClose": round(float(prior), 6) if prior is not None else updated.get("previousClose"),
        "change": round(change, 6) if change is not None else None,
        "changePercent": round(pct, 4) if pct is not None else None,
        "changeBaseline": "verified completed daily close",
    })
    return updated

def main():
    stocks = json.loads(STOCK_PATH.read_text(encoding="utf-8"))
    failures = []
    optional_failures = []
    # Only WAIS System's reconciled required universe can block official
    # quote publication. Experimental/leveraged route gaps stay visible
    # without suppressing otherwise valid market snapshots.
    required = set(stocks.get("canonicalQuoteUniverse", {}).get("required") or [])
    if not required:
        raise RuntimeError("canonical required quote universe missing; fail closed")
    stocks.setdefault("prices", {})
    for symbol in PUBLIC_RESEARCH_SYMBOLS:
        stocks["prices"].setdefault(symbol, {})
    for symbol, old in list(stocks["prices"].items()):
        try:
            stocks["prices"][symbol] = update_quote(old, symbol)
        except Exception as exc:
            error = f"{symbol}: {exc}"
            # Preserve price/asOf, but never represent the failed quote as
            # fresh. An optional route failure must not masquerade as a
            # canonical quote failure (or hide a canonical one).
            old_quote = dict(stocks["prices"].get(symbol) or {})
            old_quote["freshness"] = "SOURCE GAP"
            old_quote["dataStatus"] = (
                "DATA GAP: refresh failed; LAST-KNOWN-GOOD only; "
                "NOT current and NOT exchange real-time"
            )
            stocks["prices"][symbol] = old_quote
            if symbol in required:
                failures.append(error)
            else:
                optional_failures.append(error)
        time.sleep(0.15)
    stocks["lastUpdated"] = now_iso()
    stocks["marketStatus"] = "updated" if not (failures or optional_failures) else "partial"
    stocks["dataStatus"] = STATUS + (
        f"; {len(optional_failures)} optional quote(s) STALE / DATA GAP"
        if optional_failures else ""
    )
    stocks["failedSymbols"] = failures
    stocks["optionalQuoteFailures"] = optional_failures
    STOCK_PATH.write_text(json.dumps(stocks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    market = json.loads(MARKET_PATH.read_text(encoding="utf-8"))
    market_failures = []
    market.setdefault("indicators", {})
    for key, symbol in INDICATORS.items():
        try:
            old = market["indicators"].get(key, {})
            fresh = update_quote(old, symbol)
            market["indicators"][key] = {
                "symbol": symbol,
                "value": fresh["price"],
                "previousClose": fresh.get("previousClose"),
                "regularClose": fresh.get("regularClose"),
                "regularCloseDate": fresh.get("regularCloseDate"),
                "change": fresh.get("change"),
                "changePercent": fresh.get("changePercent"),
                "asOf": fresh.get("asOf"),
                "source": SOURCE,
                "dataStatus": STATUS,
            }
        except Exception as exc:
            market_failures.append(f"{key}: {exc}")
            # Preserve last-known-good values but make the failure visible.
            stale = dict(market["indicators"].get(key) or {})
            stale["freshness"] = "SOURCE GAP"
            stale["dataStatus"] = "DATA GAP: refresh failed; LAST-KNOWN-GOOD only"
            market["indicators"][key] = stale
        time.sleep(0.15)

    # HSI futures is retained only as a dated fallback until a reliable public
    # source adapter succeeds; never keep an old snapshot labelled LIVE.
    if "HSIF" in market["indicators"]:
        market["indicators"]["HSIF"]["freshness"] = "SOURCE GAP"
        market["indicators"]["HSIF"]["marketOpen"] = None
        market["indicators"]["HSIF"]["dataStatus"] = (
            "Last verified public-display snapshot retained; automatic source unavailable; "
            "NOT current and NOT exchange real-time"
        )

    market["lastUpdated"] = now_iso()
    market["marketStatus"] = "updated" if not market_failures else "partial"
    market["dataStatus"] = STATUS
    market["failedSymbols"] = market_failures
    us_dates = [market["indicators"].get(k, {}).get("regularCloseDate") for k in ("SP500", "NASDAQ", "SOX")]
    hk_dates = [market["indicators"].get(k, {}).get("regularCloseDate") for k in ("HSI", "HSTECH")]
    market["marketDates"] = {
        "US": max((x for x in us_dates if x), default=market.get("marketDates", {}).get("US")),
        "HK": max((x for x in hk_dates if x), default=market.get("marketDates", {}).get("HK")),
    }
    MARKET_PATH.write_text(json.dumps(market, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if failures or market_failures:
        print(json.dumps({"stockFailures": failures, "marketFailures": market_failures}, indent=2))

if __name__ == "__main__":
    main()
