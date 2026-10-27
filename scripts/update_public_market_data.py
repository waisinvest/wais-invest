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

def verified_daily_metrics(symbol, meta, expected_day, quote_ts):
    """Recompute SMA20/SMA50 from one consistent unadjusted daily-close series.

    A same-day candle is never accepted until 16:20 exchange-local time;
    early-close sessions are conservatively delayed. Missing or mismatched
    history fails closed instead of retaining old indicator values.
    """
    from datetime import time as dt_time
    name = meta.get("exchangeTimezoneName") or "UTC"
    zone = ZoneInfo(name)
    quote_local = datetime.fromtimestamp(quote_ts, timezone.utc).astimezone(zone)
    if quote_local.date() == expected_day and quote_local.time() < dt_time(16, 20):
        raise ValueError("current daily candle not confirmed complete before 16:20 exchange-local")
    encoded = urllib.parse.quote(symbol, safe="")
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded}"
           "?range=3mo&interval=1d&includePrePost=false&events=div%2Csplits")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as response:
        result = json.load(response)["chart"]["result"][0]
    stamps = result.get("timestamp") or []
    closes = (result.get("indicators", {}).get("quote") or [{}])[0].get("close") or []
    by_day = {}
    for ts, px in zip(stamps, closes):
        if px is None or float(px) <= 0:
            continue
        day = exchange_date(int(ts), meta)
        if day <= expected_day:
            by_day[day] = float(px)
    days = sorted(by_day)
    if len(days) < 20 or days[-1] != expected_day:
        raise ValueError(f"history gap: {len(days)} sessions; last={days[-1] if days else None}; expected={expected_day}")
    values = [by_day[d] for d in days]
    return {
        "sma20": round(sum(values[-20:]) / 20, 6),
        "sma50": round(sum(values[-50:]) / 50, 6) if len(values) >= 50 else None,
        "historyLastClose": values[-1],
        "historySessionCount": len(values),
    }

def update_quote(existing, symbol):
    meta, ts, price = fetch_chart(symbol)
    daily = daily_closes(symbol)
    latest_day = exchange_date(ts, meta)
    last_daily_day = exchange_date(daily[-1][0], meta) if daily else None
    if len(daily) >= 2 and last_daily_day == latest_day:
        prior = daily[-2][1]
        regular = daily[-1][1]
        regular_ts = daily[-1][0]
    elif daily and last_daily_day != latest_day:
        prior = daily[-1][1]
        regular = meta.get("regularMarketPrice") or daily[-1][1]
        regular_ts = meta.get("regularMarketTime") or daily[-1][0]
    else:
        prior = meta.get("chartPreviousClose") or meta.get("previousClose")
        regular = meta.get("regularMarketPrice")
        regular_ts = meta.get("regularMarketTime")
    change = price - float(prior) if prior not in (None, 0) else None
    pct = change / float(prior) * 100 if change is not None and prior else None
    updated = dict(existing or {})
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
        "changeBaseline": "provider previous completed close",
    })
    # Never carry historical-series metrics forward with a newer quote.
    # Liquidity and realized volatility require separate validated volume/history.
    stale_fields = ("sma20", "sma50", "priceReturnPeriodPct",
                    "avgVolume20d", "avgDollarVolume20d",
                    "realizedVol60dAnnualizedPct")
    invalidated = [key for key in stale_fields if key in updated]
    for key in invalidated:
        updated.pop(key, None)
    updated["derivedMetricsInvalidated"] = invalidated
    if any(key in invalidated for key in ("avgVolume20d", "avgDollarVolume20d", "realizedVol60dAnnualizedPct")):
        updated["routeStockMetricsStatus"] = "DATA GAP: stale historical liquidity/volatility metrics invalidated; recompute required"
    try:
        day_text = updated.get("regularCloseDate")
        if not day_text:
            raise ValueError("missing regular close date")
        from datetime import date
        day = date.fromisoformat(day_text)
        metrics = verified_daily_metrics(symbol, meta, day, ts)
        if regular is None or abs(metrics["historyLastClose"] - float(regular)) > max(0.02, 0.0005 * float(regular)):
            raise ValueError("regular close mismatch between snapshot and daily history")
        updated["sma20"] = metrics["sma20"]
        updated["sma50"] = metrics["sma50"]
        updated["sma20AsOf"] = day_text
        updated["sma50AsOf"] = day_text if metrics["sma50"] is not None else None
        updated["sma20MethodVersion"] = "WAIS-SMA-v2-unadjusted-completed-daily-closes"
        updated["derivedMetricsStatus"] = ("SMA20/SMA50 VERIFIED; period return DATA GAP"
            if metrics["sma50"] is not None else "SMA20 VERIFIED; SMA50 insufficient history; period return DATA GAP")
        updated.pop("derivedMetricsGapReason", None)
    except Exception as exc:
        updated["sma20"] = None
        updated["sma50"] = None
        updated["sma20AsOf"] = None
        updated["sma50AsOf"] = None
        updated["sma20MethodVersion"] = "WAIS-SMA-v2-unadjusted-completed-daily-closes"
        updated["derivedMetricsStatus"] = "DATA GAP"
        updated["derivedMetricsGapReason"] = str(exc)
    return updated

def main():
    stocks = json.loads(STOCK_PATH.read_text(encoding="utf-8"))
    failures = []
    stocks.setdefault("prices", {})
    for symbol in PUBLIC_RESEARCH_SYMBOLS:
        stocks["prices"].setdefault(symbol, {})
    for symbol, old in list(stocks["prices"].items()):
        try:
            stocks["prices"][symbol] = update_quote(old, symbol)
        except Exception as exc:
            failures.append(str(exc))
        time.sleep(0.15)
    stocks["lastUpdated"] = now_iso()
    stocks["marketStatus"] = "updated" if not failures else "partial"
    stocks["dataStatus"] = STATUS
    stocks["failedSymbols"] = failures
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
            market_failures.append(str(exc))
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
