"""Offline deterministic tests for SMA history consistency; no market requests.

Run: python -m unittest discover -s scripts -p 'test_public_sma_history.py'
"""
import importlib.util
import io
import json
import unittest
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("wais_public_sma", Path(__file__).with_name("update_public_market_data.py"))
quotes = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(quotes)
META = {"exchangeTimezoneName": "America/New_York", "currency": "USD"}


def unix(d, hour=16):
    return int(datetime(d.year, d.month, d.day, hour, tzinfo=timezone.utc).timestamp())


def sessions(n):
    days = []
    day = date(2026, 7, 1)
    while len(days) < n:
        if day.weekday() < 5:
            days.append(day)
        day += timedelta(days=1)
    return days


def mock_history(days, values):
    payload = {"chart": {"result": [{"timestamp": [unix(d) for d in days],
        "indicators": {"quote": [{"close": values}]}}]}}
    return patch.object(quotes.urllib.request, "urlopen",
        return_value=io.BytesIO(json.dumps(payload).encode("utf-8")))


class PublicSmaTests(unittest.TestCase):
    def test_exact_20_and_50_sessions(self):
        days = sessions(60)
        values = [float(x) for x in range(1, 61)]
        with mock_history(days, values):
            m = quotes.verified_daily_metrics("TEST", META, days[-1], unix(days[-1], 21))
        self.assertEqual(m["sma20"], 50.5)
        self.assertEqual(m["sma50"], 35.5)
        self.assertEqual(m["historySessionCount"], 60)

    def test_20_available_50_missing(self):
        days = sessions(25)
        with mock_history(days, [100.0] * len(days)):
            m = quotes.verified_daily_metrics("TEST", META, days[-1], unix(days[-1], 21))
        self.assertEqual(m["sma20"], 100.0)
        self.assertIsNone(m["sma50"])

    def test_less_than_20_fails_closed(self):
        days = sessions(19)
        with mock_history(days, [100.0] * len(days)):
            with self.assertRaisesRegex(ValueError, "history gap"):
                quotes.verified_daily_metrics("TEST", META, days[-1], unix(days[-1], 21))

    def test_stale_last_session_fails_closed(self):
        days = sessions(25)
        expected = days[-1] + timedelta(days=1)
        with mock_history(days, [100.0] * len(days)):
            with self.assertRaisesRegex(ValueError, "history gap"):
                quotes.verified_daily_metrics("TEST", META, expected, unix(expected, 21))

    def test_partial_same_day_fails_before_history_fetch(self):
        days = sessions(60)
        with patch.object(quotes.urllib.request, "urlopen") as network:
            with self.assertRaisesRegex(ValueError, "not confirmed complete"):
                quotes.verified_daily_metrics("TEST", META, days[-1], unix(days[-1], 17))
            network.assert_not_called()

    def test_update_replaces_stale_indicators(self):
        days = sessions(60)
        latest = days[-1]
        candles = [(unix(days[-2]), 100.0), (unix(latest), 110.0)]
        old = {"sma20": 999.0, "sma50": 888.0, "priceReturnPeriodPct": 400.0}
        with patch.object(quotes, "fetch_chart", return_value=(META, unix(latest, 21), 111.0)), \
             patch.object(quotes, "daily_closes", return_value=candles), \
             patch.object(quotes, "verified_daily_metrics", return_value={
                 "sma20": 105.0, "sma50": 104.0, "historyLastClose": 110.0, "historySessionCount": 60}):
            result = quotes.update_quote(old, "TEST")
        self.assertEqual(result["sma20"], 105.0)
        self.assertEqual(result["sma50"], 104.0)
        self.assertNotIn("priceReturnPeriodPct", result)
        self.assertEqual(result["sma20AsOf"], latest.isoformat())

    def test_history_close_mismatch_fails_closed(self):
        days = sessions(60)
        latest = days[-1]
        candles = [(unix(days[-2]), 100.0), (unix(latest), 110.0)]
        with patch.object(quotes, "fetch_chart", return_value=(META, unix(latest, 21), 111.0)), \
             patch.object(quotes, "daily_closes", return_value=candles), \
             patch.object(quotes, "verified_daily_metrics", return_value={
                 "sma20": 105.0, "sma50": 104.0, "historyLastClose": 130.0, "historySessionCount": 60}):
            result = quotes.update_quote({"sma20": 999}, "TEST")
        self.assertIsNone(result["sma20"])
        self.assertIsNone(result["sma50"])
        self.assertEqual(result["derivedMetricsStatus"], "DATA GAP")
        self.assertIn("mismatch", result["derivedMetricsGapReason"])


if __name__ == "__main__":
    unittest.main()
