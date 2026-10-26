"""Offline regression: one optional leveraged route must not block all quotes.

Run: python -m unittest discover -s scripts -p 'test_public_*.py' -v
No network access, no production writes.
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "wais_public_quotes_gap", Path(__file__).with_name("update_public_market_data.py")
)
quotes = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(quotes)


class OptionalQuoteFailureTests(unittest.TestCase):
    def run_snapshot(self, failed):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            stock = root / "stock-prices.json"
            market = root / "market-indicators.json"
            stock.write_text(json.dumps({
                "lastUpdated": "2026-10-26T06:00:00+00:00",
                "canonicalQuoteUniverse": {"required": ["CORE"], "status": "PASS"},
                "prices": {
                    "CORE": {"price": 10, "asOf": "2026-10-26T14:00:00+00:00"},
                    "TSEU": {"price": 13.19, "asOf": "2026-10-19T18:05:00+00:00"},
                }
            }), encoding="utf-8")
            market.write_text(json.dumps({
                "lastUpdated": "2026-10-26T06:00:00+00:00",
                "indicators": {"SP500": {"value": 5000}}
            }), encoding="utf-8")

            def update(old, symbol):
                if symbol == failed:
                    raise ValueError("no usable quote points")
                result = dict(old)
                result.update({"price": 20, "asOf": "2026-10-26T17:00:00+00:00"})
                return result

            with patch.object(quotes, "STOCK_PATH", stock), \
                 patch.object(quotes, "MARKET_PATH", market), \
                 patch.object(quotes, "PUBLIC_RESEARCH_SYMBOLS", set()), \
                 patch.object(quotes, "INDICATORS", {"SP500": "^GSPC"}), \
                 patch.object(quotes, "update_quote", side_effect=update), \
                 patch.object(quotes.time, "sleep", return_value=None):
                quotes.main()
            return json.loads(stock.read_text()), json.loads(market.read_text())

    def test_optional_route_failure_retains_stale_quote_and_refreshes_core(self):
        stocks, market = self.run_snapshot("TSEU")
        self.assertEqual(stocks["prices"]["CORE"]["price"], 20)
        self.assertEqual(stocks["prices"]["TSEU"]["price"], 13.19)
        self.assertEqual(stocks["prices"]["TSEU"]["asOf"], "2026-10-19T18:05:00+00:00")
        self.assertEqual(stocks["prices"]["TSEU"]["freshness"], "SOURCE GAP")
        self.assertIn("DATA GAP", stocks["prices"]["TSEU"]["dataStatus"])
        self.assertEqual(stocks["failedSymbols"], [])
        self.assertEqual(len(stocks["optionalQuoteFailures"]), 1)
        self.assertTrue(stocks["optionalQuoteFailures"][0].startswith("TSEU:"))
        self.assertEqual(stocks["marketStatus"], "partial")
        self.assertIn("DATA GAP", stocks["dataStatus"])
        self.assertEqual(market["indicators"]["SP500"]["value"], 20)

    def test_canonical_failure_remains_blocking(self):
        stocks, _ = self.run_snapshot("CORE")
        self.assertEqual(stocks["prices"]["CORE"]["price"], 10)
        self.assertEqual(stocks["prices"]["CORE"]["freshness"], "SOURCE GAP")
        self.assertEqual(stocks["optionalQuoteFailures"], [])
        self.assertEqual(len(stocks["failedSymbols"]), 1)
        self.assertTrue(stocks["failedSymbols"][0].startswith("CORE:"))
        self.assertEqual(stocks["marketStatus"], "partial")


if __name__ == "__main__":
    unittest.main()
