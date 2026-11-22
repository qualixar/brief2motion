#!/usr/bin/env bash
# tests/run_unit.sh: run the unit tests and say how many passed and were skipped.
#   bash tests/run_unit.sh            the full test output, then a summary line
#   bash tests/run_unit.sh --quiet    only the failing tests with their errors, and the summary (run_checks.sh uses this)
# Exit 1 when a test fails, and also when one is skipped while CI is set: the CI runners have Chrome, so a skip there means
# a browser test did not run. On a machine without a browser a skip is only reported.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
UT="$(mktemp)"; trap 'rm -f "$UT"' EXIT
if [[ "${1:-}" == --quiet ]]; then node --test tests/*.test.mjs >"$UT" 2>&1; else node --test tests/*.test.mjs 2>&1 | tee "$UT"; fi
code=${PIPESTATUS[0]}
passed="$(sed -n 's/^# pass \([0-9]*\)$/\1/p' "$UT" | tail -1)"; failed="$(sed -n 's/^# fail \([0-9]*\)$/\1/p' "$UT" | tail -1)"; skipped="$(sed -n 's/^# skipped \([0-9]*\)$/\1/p' "$UT" | tail -1)"
if [[ "$code" != 0 && "${1:-}" == --quiet ]]; then echo "the failing tests:"; grep -E -A40 '^not ok' "$UT" | grep -vE '^\s+(at |stack:|\.\.\.|---)' | head -150; fi
if [[ "${skipped:-0}" != 0 ]]; then echo "skipped:"; grep -E '# SKIP' "$UT" | head -20; fi
echo "unit tests: ${passed:-0} passed, ${failed:-?} failed, ${skipped:-0} skipped"
[[ "$code" != 0 ]] && exit 1
if [[ "${skipped:-0}" != 0 && -n "${CI:-}" ]]; then echo "a test was skipped in CI, where a browser is available"; exit 1; fi
exit 0
