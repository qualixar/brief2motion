#!/usr/bin/env bash
# tests/check_examples.sh: run the site check on every example, one at a time, and keep each report beside its example.
#   bash tests/check_examples.sh               every example, with frame-time budgets (needs a real GPU)
#   bash tests/check_examples.sh --no-perf     skip the frame-time budgets (CI machines)
#   bash tests/check_examples.sh relay mise    only these
# Writes examples/<name>/site-report.json (and motion-report.json for the dust engine example).
# Screenshots go to a temporary folder and are not kept.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
S=skills/brief2motion/scripts
PERF=(); NAMES=()
for a in "$@"; do if [[ "$a" == --no-perf ]]; then PERF=(--no-perf); else NAMES+=("$a"); fi; done
[[ ${#NAMES[@]} -eq 0 ]] && NAMES=(copper-no-7 halden-one tidewater relay halvorsen keeling mise sprout style-atlas)
pages_for() { case "$1" in halvorsen) echo "work/ember.html,work/quay.html,work/moth.html,work/ledger.html";; *) echo "";; esac; }
OUT="$(mktemp -d)"; FAILS=0
for name in "${NAMES[@]}"; do
  dir="examples/$name"; [[ -f "$dir/index.html" ]] || { echo "FAIL  $name: no such example"; FAILS=$((FAILS + 1)); continue; }
  args=("$dir" --out "$OUT/$name"); p="$(pages_for "$name")"; [[ -n "$p" ]] && args+=(--pages "$p")
  if nice -n 15 node $S/check_site.mjs "${args[@]}" ${PERF[@]+"${PERF[@]}"} >"$OUT/$name.log" 2>&1; then
    echo "PASS  $name  $(grep -o '[0-9]*/[0-9]* checks' "$OUT/$name.log" | tail -1)"
  else
    echo "FAIL  $name"; grep -E '^FAIL|crashed' "$OUT/$name.log" | cut -c1-300; FAILS=$((FAILS + 1))
  fi
  [[ -f "$OUT/$name/site-report.json" ]] && cp "$OUT/$name/site-report.json" "$dir/site-report.json"
  if [[ "$name" == copper-no-7 && ${#PERF[@]} -eq 0 ]]; then
    if nice -n 15 node $S/check_motion.mjs "$dir" --out "$OUT/$name-motion" >"$OUT/$name-motion.log" 2>&1; then echo "PASS  $name (dust engine check)"; cp "$OUT/$name-motion/motion-report.json" "$dir/motion-report.json"
    else echo "FAIL  $name (dust engine check)"; grep -E '^FAIL|crashed' "$OUT/$name-motion.log" | cut -c1-300; FAILS=$((FAILS + 1)); fi
  fi
done
rm -rf "$OUT"
echo; [[ $FAILS == 0 ]] && echo "ALL EXAMPLES PASSED" || echo "$FAILS EXAMPLE CHECK(S) FAILED"
exit $((FAILS > 0))
