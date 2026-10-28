"""Offline regression for public canonical reconciliation clock provenance.

Run: python -m unittest discover -s scripts -p 'test_public_*.py' -v
No network, credentials, or production writes.
"""
import importlib.util
import json
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "public_reconciliation_clock",
    Path(__file__).with_name("reconcile_public_quote_universe.py"),
)
recon = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recon)


class ReconciliationClockTests(unittest.TestCase):
    def run_reconciliation(self, quote_update):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            canonical = root / "canonical-universe.json"
            stocks = root / "stock-prices.json"
            canonical.write_text(json.dumps({
                "version": "test-v1",
                "stages": {"RESEARCH": ["TEST"]},
                "policyRadar": [],
            }), encoding="utf-8")
            stocks.write_text(json.dumps({
                "lastUpdated": "2026-10-28T19:54:24+00:00",
                "prices": {
                    "TEST": {"price": 10, "asOf": "2026-10-28T19:00:00+00:00"},
                    "OPTIONAL": {"price": 20, "asOf": "2026-10-27T19:00:00+00:00"},
                },
            }), encoding="utf-8")
            with patch.object(recon, "CANONICAL", canonical), \\
                 patch.object(recon, "STOCKS", stocks), \\
                 patch.object(recon.pub, "update_quote", side_effect=quote_update):
                try:
                    recon.main()
                except SystemExit:
                    pass
            return json.loads(stocks.read_text(encoding="utf-8"))

    def test_reconciliation_advances_envelope_but_preserves_full_refresh(self):
        def update(old, ticker):
            self.assertEqual(ticker, "TEST")
            return {**old, "price": 11, "asOf": "2026-10-28T21:03:12+00:00"}

        result = self.run_reconciliation(update)
        self.assertEqual(result["lastFullRefreshAt"], "2026-10-28T19:54:24+00:00")
        self.assertEqual(result["lastUpdated"], result["lastReconciledAt"])
        self.assertEqual(result["canonicalQuoteUniverse"]["asOf"], result["lastReconciledAt"])
        self.assertGreaterEqual(
            datetime.fromisoformat(result["lastUpdated"]),
            datetime.fromisoformat(result["prices"]["TEST"]["asOf"]),
        )
        self.assertEqual(result["prices"]["OPTIONAL"]["asOf"], "2026-10-27T19:00:00+00:00")
        self.assertEqual(result["canonicalQuoteUniverse"]["status"], "PASS")

    def test_failed_quote_does_not_claim_reconciliation_pass(self):
        def fail(old, ticker):
            raise RuntimeError("provider gap")

        result = self.run_reconciliation(fail)
        self.assertEqual(result["canonicalQuoteUniverse"]["status"], "RECONCILIATION FAILED")
        self.assertTrue(result["canonicalQuoteUniverse"]["refreshFailures"])
        self.assertEqual(result["lastFullRefreshAt"], "2026-10-28T19:54:24+00:00")


if __name__ == "__main__":
    unittest.main()
