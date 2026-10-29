"""P1 offline regression: public completed-close dates must never roll backwards.

No network, credentials, or production writes.
Run: python -m unittest discover -s scripts -p 'test_public_*.py' -v
"""
import importlib.util
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "public_rollback", Path(__file__).with_name("update_public_market_data.py")
)
quotes = importlib.util.module_from_spec(spec)
spec.loader.exec_module(quotes)


def ts(iso):
    return int(datetime.fromisoformat(iso).timestamp())


class CompletedCloseRollbackTests(unittest.TestCase):
    def run_quote(self, old_date):
        meta = {"exchangeTimezoneName": "America/New_York", "currency": "USD"}
        # After 16:20 ET on Oct 28, provider still returns Oct 27 as latest
        # completed daily bar even though old persisted state has Oct 28.
        bars = [
            (ts("2026-10-26T13:30:00+00:00"), 100.0),
            (ts("2026-10-27T13:30:00+00:00"), 105.0),
        ]
        with patch.object(quotes, "fetch_chart", return_value=(
            meta, ts("2026-10-28T23:50:00+00:00"), 110.0
        )), patch.object(quotes, "daily_closes", return_value=bars):
            return quotes.update_quote(
                {"price": 115.0, "regularClose": 115.0,
                 "regularCloseDate": old_date},
                "TEST",
                observed_at=datetime(2026, 10, 29, 0, 0, tzinfo=timezone.utc),
            )

    def test_rollback_from_oct28_to_oct27_rejected(self):
        with self.assertRaisesRegex(ValueError, "REGULAR_CLOSE_ROLLBACK"):
            self.run_quote("2026-10-28")

    def test_same_completed_date_correction_allowed(self):
        quote = self.run_quote("2026-10-27")
        self.assertEqual(quote["regularCloseDate"], "2026-10-27")
        self.assertEqual(quote["regularClose"], 105.0)

    def test_forward_completed_date_allowed(self):
        quote = self.run_quote("2026-10-26")
        self.assertEqual(quote["regularCloseDate"], "2026-10-27")

    def test_required_failure_preserves_lkg_and_invalidates_pass(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            stock = root / "stock-prices.json"
            market = root / "market-indicators.json"
            stock.write_text(json.dumps({
                "lastUpdated": "2026-10-28T21:24:44+00:00",
                "canonicalQuoteUniverse": {
                    "required": ["CORE"], "status": "PASS", "refreshFailures": []
                },
                "prices": {
                    "CORE": {
                        "price": 115, "regularClose": 115,
                        "regularCloseDate": "2026-10-28",
                        "asOf": "2026-10-28T21:00:00+00:00"
                    }
                }
            }), encoding="utf-8")
            market.write_text(json.dumps({
                "indicators": {}, "marketDates": {}
            }), encoding="utf-8")
            with patch.object(quotes, "STOCK_PATH", stock), \\
                 patch.object(quotes, "MARKET_PATH", market), \\
                 patch.object(quotes, "PUBLIC_RESEARCH_SYMBOLS", set()), \\
                 patch.object(quotes, "INDICATORS", {}), \\
                 patch.object(quotes, "update_quote",
                              side_effect=ValueError("REGULAR_CLOSE_ROLLBACK")), \\
                 patch.object(quotes.time, "sleep", return_value=None):
                quotes.main()
            saved = json.loads(stock.read_text(encoding="utf-8"))
            self.assertEqual(saved["prices"]["CORE"]["regularCloseDate"], "2026-10-28")
            self.assertEqual(saved["prices"]["CORE"]["regularClose"], 115)
            self.assertEqual(saved["prices"]["CORE"]["freshness"], "SOURCE GAP")
            self.assertEqual(saved["canonicalQuoteUniverse"]["status"],
                             "RECONCILIATION FAILED")
            self.assertIn("REGULAR_CLOSE_ROLLBACK",
                          saved["canonicalQuoteUniverse"]["refreshFailures"][0])


if __name__ == "__main__":
    unittest.main()
