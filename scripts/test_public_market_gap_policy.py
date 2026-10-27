"""Offline regression: optional market-source gap must not stop all US updates."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "public_market_gap_policy", Path(__file__).with_name("validate_public_market_gaps.py"))
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)


def fixture():
    indicators = {k: {"regularCloseDate": "2026-10-26", "freshness": "LIVE",
                      "dataStatus": "Latest delayed"} for k in policy.REQUIRED}
    indicators["HSTECH"] = {"regularCloseDate": "2026-10-27", "freshness": "SOURCE GAP",
                            "dataStatus": "DATA GAP: refresh failed; LAST-KNOWN-GOOD only"}
    return {"marketStatus": "partial", "failedSymbols": [
        "HSTECH: HSTECH.HK: fewer than two verified completed daily closes"],
        "indicators": indicators}


class MarketGapPolicyTests(unittest.TestCase):
    def test_optional_hstech_failure_is_explicit_and_isolated(self):
        policy.validate_market_gaps(fixture())

    def test_required_vix_failure_is_not_optional(self):
        obj = fixture()
        obj["failedSymbols"] = ["VIX: failed"]
        with self.assertRaisesRegex(AssertionError, "required/unknown"):
            policy.validate_market_gaps(obj)

    def test_optional_failure_without_source_gap_is_rejected(self):
        obj = fixture()
        obj["indicators"]["HSTECH"]["freshness"] = "LIVE"
        with self.assertRaisesRegex(AssertionError, "missing SOURCE GAP"):
            policy.validate_market_gaps(obj)

    def test_optional_failure_without_lkg_is_rejected(self):
        obj = fixture()
        obj["indicators"]["HSTECH"]["dataStatus"] = "updated"
        with self.assertRaisesRegex(AssertionError, "missing LAST-KNOWN-GOOD"):
            policy.validate_market_gaps(obj)

    def test_missing_required_close_rejected(self):
        obj = fixture()
        del obj["indicators"]["SP500"]
        with self.assertRaisesRegex(AssertionError, "required market"):
            policy.validate_market_gaps(obj)

    def test_no_failure_with_updated_status_passes(self):
        obj = fixture()
        obj["failedSymbols"] = []
        obj["marketStatus"] = "updated"
        obj["indicators"]["HSTECH"]["freshness"] = "LIVE"
        policy.validate_market_gaps(obj)

    def test_partial_status_requires_failure_record(self):
        obj = fixture()
        obj["failedSymbols"] = []
        with self.assertRaisesRegex(AssertionError, "partial market"):
            policy.validate_market_gaps(obj)


if __name__ == "__main__":
    unittest.main()
