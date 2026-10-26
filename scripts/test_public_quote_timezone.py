"""Deterministic regression tests for exchange-local daily-close baseline.

Run: python -m unittest discover -s scripts -p 'test_public_quote_timezone.py'
No network, no production writes, no trading signals.
"""
import importlib.util
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

MODULE_PATH = Path(__file__).with_name("update_public_market_data.py")
SPEC = importlib.util.spec_from_file_location("wais_public_quotes", MODULE_PATH)
quotes = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(quotes)


def stamp(iso):
    return int(datetime.fromisoformat(iso).timestamp())


class ExchangeCloseBaselineTests(unittest.TestCase):
    def test_hk_current_daily_bar_uses_previous_completed_session(self):
        meta = {"exchangeTimezoneName": "Asia/Hong_Kong", "currency": "HKD"}
        intraday = stamp("2026-10-26T04:05:00+00:00")
        # Oct 26 HK daily candle is timestamped Oct 25 in UTC.
        daily = [
            (stamp("2026-10-22T16:00:00+00:00"), 3871.6599),
            (stamp("2026-10-25T16:00:00+00:00"), 3857.45),
        ]
        with patch.object(quotes, "fetch_chart", return_value=(meta, intraday, 3857.45)), \
             patch.object(quotes, "daily_closes", return_value=daily):
            result = quotes.update_quote({}, "HSTECH.HK")
        self.assertEqual(result["regularCloseDate"], "2026-10-26")
        self.assertAlmostEqual(result["previousClose"], 3871.6599, places=3)
        self.assertAlmostEqual(result["changePercent"], -0.367, places=3)
        self.assertNotEqual(result["previousClose"], result["price"])

    def test_us_current_daily_bar_uses_previous_close(self):
        meta = {"exchangeTimezoneName": "America/New_York", "currency": "USD"}
        daily = [
            (stamp("2026-10-22T04:00:00+00:00"), 100.0),
            (stamp("2026-10-23T04:00:00+00:00"), 105.0),
        ]
        with patch.object(quotes, "fetch_chart", return_value=(meta, stamp("2026-10-23T20:00:00+00:00"), 105.0)), \
             patch.object(quotes, "daily_closes", return_value=daily):
            result = quotes.update_quote({}, "TEST")
        self.assertEqual(result["regularCloseDate"], "2026-10-23")
        self.assertEqual(result["previousClose"], 100.0)
        self.assertEqual(result["changePercent"], 5.0)

    def test_single_partial_daily_bar_uses_provider_baseline(self):
        meta = {
            "exchangeTimezoneName": "Asia/Hong_Kong",
            "chartPreviousClose": 3871.6599,
            "regularMarketPrice": 3857.45,
            "regularMarketTime": stamp("2026-10-26T04:05:00+00:00"),
        }
        daily = [(stamp("2026-10-25T16:00:00+00:00"), 3857.45)]
        with patch.object(quotes, "fetch_chart", return_value=(meta, stamp("2026-10-26T04:05:00+00:00"), 3857.45)), \
             patch.object(quotes, "daily_closes", return_value=daily):
            result = quotes.update_quote({}, "HSTECH.HK")
        self.assertAlmostEqual(result["previousClose"], 3871.6599, places=3)
        self.assertAlmostEqual(result["changePercent"], -0.367, places=3)


if __name__ == "__main__":
    unittest.main()
