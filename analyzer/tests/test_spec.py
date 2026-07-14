"""Tests for the spec loader / analysis glue (analyzer.spec).

Focus: the optional user-supplied ``[failure_rates]`` override and its
precedence. Runs with pytest or as a bare script.
"""

from __future__ import annotations

import math

from analyzer.spec import analyze, failure_rate_for


def _close(a, b):
    return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12)


def test_failure_rate_precedence():
    spec = {"failure_rates": {"db": 0.0002, "default": 0.001}}
    assert failure_rate_for(spec, "db", 0.05) == 0.0002    # explicit entry wins
    assert failure_rate_for(spec, "svc", 0.05) == 0.001    # then the default
    assert failure_rate_for({}, "svc", 0.05) == 0.05       # else measured value


def test_analyze_applies_failure_rate_override():
    spec = {
        "name": "t", "services": ["svc"], "infrastructure": ["db"],
        "operations": {"op": ["svc", "db"]},
        "failure_rates": {"svc": 0.001, "db": 0.0002},
    }
    meas = {
        "services": {"svc": {"replicas": 1, "failure_rate": 0.05,
                             "repair_rate": 100.0, "arrival_rate": 1.0,
                             "service_rate": 10.0}},
        "infrastructure": {"db": {"failure_rate": 0.05, "repair_rate": 100.0}},
    }
    result = analyze(spec, meas)
    # availability = repair / (failure + repair), using the OVERRIDES not 0.05
    assert _close(result["services"]["svc"].per_replica_availability,
                  100.0 / (0.001 + 100.0))
    assert _close(result["infrastructure"]["db"].availability,
                  100.0 / (0.0002 + 100.0))


def test_analyze_without_override_uses_measured():
    spec = {"name": "t", "services": ["svc"], "infrastructure": [],
            "operations": {}}
    meas = {"services": {"svc": {"replicas": 1, "failure_rate": 0.02,
                                 "repair_rate": 10.0, "arrival_rate": 1.0,
                                 "service_rate": 10.0}},
            "infrastructure": {}}
    result = analyze(spec, meas)
    assert _close(result["services"]["svc"].per_replica_availability,
                  10.0 / (0.02 + 10.0))


def _run_all() -> int:
    tests = [v for k, v in sorted(globals().items())
             if k.startswith("test_") and callable(v)]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS  {t.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"  FAIL  {t.__name__}: {e}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"  ERROR {t.__name__}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed"
          + (" -- ALL GREEN" if failed == 0 else f" -- {failed} FAILED"))
    return 1 if failed else 0


if __name__ == "__main__":
    import sys
    sys.exit(_run_all())
