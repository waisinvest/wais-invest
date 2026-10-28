"""Offline point-in-time regression: public completed-close date and baseline.

No live data, no production writes. Execute:
python -m unittest discover -s scripts -p 'test_public_quote_timezone.py' -v
"""
import importlib.util
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("wais_public_quotes", Path(__file__).with_name("update_public_market_data.py"))
quotes = importlib.util.module_from_spec(spec)
spec.loader.exec_module(quotes)


def stamp(value):
    return int(datetime.fromisoformat(value).timestamp())


def row(date, price):
    return stamp(date), price


class CompletedCloseTests(unittest.TestCase):
    def run_quote(self, meta, quote_time, price, daily, observed):
        with patch.object(quotes, "fetch_chart", return_value=(meta, stamp(quote_time), price)), \
             patch.object(quotes, "daily_closes", return_value=daily):
            return quotes.update_quote({}, "TEST", observed_at=datetime.fromisoformat(observed))

    def test_vix_partial_premarket_daily_does_not_advance_regular_close(self):
        meta = {"exchangeTimezoneName": "America/New_York",
                "regularMarketTime": stamp("2026-10-27T12:58:31+00:00"),
                "regularMarketPrice": 17.75}
        result = self.run_quote(meta, "2026-10-27T14:20:00+00:00", 17.90,
            [row("2026-10-23T13:30:00+00:00", 18.10),
             row("2026-10-26T13:30:00+00:00", 17.50),
             row("2026-10-27T13:30:00+00:00", 17.75)],
            "2026-10-27T14:33:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-26")
        self.assertEqual(result["regularClose"], 17.5)
        self.assertEqual(result["previousClose"], 17.5)
        self.assertAlmostEqual(result["changePercent"], 2.2857, places=3)

    def test_us10y_partial_daily_cannot_be_marked_as_completed(self):
        meta = {"exchangeTimezoneName": "America/New_York",
                "regularMarketTime": stamp("2026-10-27T13:00:00+00:00"),
                "regularMarketPrice": 4.99}
        result = self.run_quote(meta, "2026-10-27T14:20:00+00:00", 4.99,
            [row("2026-10-23T13:30:00+00:00", 4.95),
             row("2026-10-26T13:30:00+00:00", 4.986),
             row("2026-10-27T13:30:00+00:00", 4.99)],
            "2026-10-27T14:33:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-26")
        self.assertAlmostEqual(result["regularClose"], 4.986)

    def test_completed_us_session_accepted_after_1620(self):
        meta = {"exchangeTimezoneName": "America/New_York"}
        result = self.run_quote(meta, "2026-10-27T20:25:00+00:00", 112,
            [row("2026-10-23T13:30:00+00:00", 95),
             row("2026-10-26T13:30:00+00:00", 100),
             row("2026-10-27T13:30:00+00:00", 112)],
            "2026-10-27T20:30:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-27")
        self.assertEqual(result["previousClose"], 100)
        self.assertEqual(result["regularClose"], 112)

    def test_hk_current_day_at_1500_not_complete(self):
        meta = {"exchangeTimezoneName": "Asia/Hong_Kong"}
        result = self.run_quote(meta, "2026-10-27T07:00:00+00:00", 3857,
            [row("2026-10-22T16:00:00+00:00", 3800),
             row("2026-10-25T16:00:00+00:00", 3840),
             row("2026-10-26T16:00:00+00:00", 3857)],
            "2026-10-27T07:01:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-26")
        self.assertEqual(result["previousClose"], 3840)

    def test_hk_completed_session_after_1620(self):
        meta = {"exchangeTimezoneName": "Asia/Hong_Kong"}
        result = self.run_quote(meta, "2026-10-27T08:25:00+00:00", 3857,
            [row("2026-10-25T16:00:00+00:00", 3840),
             row("2026-10-26T16:00:00+00:00", 3857)],
            "2026-10-27T08:30:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-27")
        self.assertEqual(result["previousClose"], 3840)

    def test_partial_only_history_fails_closed(self):
        meta = {"exchangeTimezoneName": "America/New_York"}
        with self.assertRaisesRegex(ValueError, "fewer than two"):
            self.run_quote(meta, "2026-10-27T14:20:00+00:00", 17.9,
                [row("2026-10-27T13:30:00+00:00", 17.9)],
                "2026-10-27T14:33:00+00:00")

    def test_future_provider_quote_fails_closed(self):
        meta = {"exchangeTimezoneName": "America/New_York"}
        with self.assertRaisesRegex(ValueError, "future quote timestamp"):
            self.run_quote(meta, "2026-10-27T16:01:00+00:00", 110,
                [row("2026-10-23T13:30:00+00:00", 99),
                 row("2026-10-26T13:30:00+00:00", 100)],
                "2026-10-27T14:31:00+00:00")

    def test_small_clock_skew_does_not_block_quote(self):
        meta = {"exchangeTimezoneName": "America/New_York"}
        result = self.run_quote(meta, "2026-10-27T14:32:00+00:00", 110,
            [row("2026-10-23T13:30:00+00:00", 99),
             row("2026-10-26T13:30:00+00:00", 100)],
            "2026-10-27T14:31:00+00:00")
        self.assertEqual(result["regularCloseDate"], "2026-10-26")
        self.assertEqual(result["price"], 110)

    def test_missing_exchange_timezone_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "missing exchange timezone"):
            self.run_quote({}, "2026-10-27T14:20:00+00:00", 100,
                [row("2026-10-23T13:30:00+00:00", 99),
                 row("2026-10-26T13:30:00+00:00", 100)],
                "2026-10-27T14:33:00+00:00")

    def test_hk_daily_timestamp_previous_utc_day_maps_to_correct_local_date(self):
        meta = {"exchangeTimezoneName": "Asia/Hong_Kong"}
        self.assertEqual(quotes.exchange_date(stamp("2026-10-26T16:00:00+00:00"), meta).isoformat(), "2026-10-27")


if __name__ == "__main__":
    unittest.main()
