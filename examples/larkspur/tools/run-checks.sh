#!/usr/bin/env bash
# Runs every site-mode check on this example, in the order the stages come, and keeps the two reports beside the example:
#   qa.json           every record from the plan, tokens, layout, accessibility, journey and meta checks
#   site-report.json  the motion, fallback and weight checks (check_site.mjs) on all three pages
#   wireframes/       qa.json and shots at 390 and 1440 px for the wireframes
# Usage: bash tools/run-checks.sh [--no-perf]     (--no-perf skips the frame-time budgets, for a machine with no GPU)
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
S=../../skills/brief2motion/scripts
rm -rf check wireframes/shots wireframes/qa.json; mkdir check
FAILS=0
run() { echo "== $*"; "$@" > "check/last.log" 2>&1 || { FAILS=$((FAILS + 1)); echo "FAILED: $*"; grep -E '^FAIL' check/last.log | head -5; }; tail -1 check/last.log; }
run node $S/build_sitemap.mjs .
run node $S/build_tokens.mjs tokens.json --qa check
run node $S/check_plan.mjs .
run node $S/check_layout.mjs . --wireframes
run node $S/check_layout.mjs . --themes light,dark
run node $S/check_a11y.mjs . --themes light,dark
run node $S/check_journeys.mjs .
run node $S/check_meta.mjs .
run node $S/check_site.mjs site --pages pricing/index.html,start/index.html --out check "$@"
cp check/qa.json qa.json && cp check/site-report.json site-report.json
echo; [[ $FAILS == 0 ]] && echo "ALL LARKSPUR CHECKS PASSED (no FAIL)" || echo "$FAILS check run(s) failed"
exit $((FAILS > 0))
