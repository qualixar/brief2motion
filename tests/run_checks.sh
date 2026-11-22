#!/usr/bin/env bash
# tests/run_checks.sh: fast repo checks that need no browser. CI runs it; run it yourself before a release:
#   bash tests/run_checks.sh
# What it guards: scripts parse, the three manifests agree on one version, the dust example runs the unchanged template
# engine, every example carries the unchanged kit, its brief and a passing report, the generated style pages are current,
# the unit tests pass, the CDN integrity hashes are right, the preview server serves modules, and nothing personal is in the tree.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

S=skills/brief2motion; T=$S/templates/site; E=examples/copper-no-7
FAILS=0
ok()   { echo "ok    $1"; }
bad()  { echo "FAIL  $1"; FAILS=$((FAILS + 1)); }
step() { if "${@:2}" >/dev/null 2>&1; then ok "$1"; else bad "$1"; fi; }

# 1. syntax
for f in $S/scripts/*.sh tests/*.sh; do step "bash -n $f" bash -n "$f"; done
for f in $S/scripts/*.mjs $S/kit/*.js $T/*.js $E/config.js tests/*.mjs tests/browser/*.mjs examples/*/*.js examples/*/site/*.js examples/*/tools/*.mjs; do step "node --check $f" node --check "$f"; done
for f in examples/*/tools/*.py; do step "python3 parses $f" python3 -I -c "import ast,sys; ast.parse(open('$f').read())"; done
for t in check_site capture_site route strip_tune check_links build_tokens build_sitemap check_plan check_meta check_layout check_a11y check_journeys; do step "$t --help exits 0" node $S/scripts/$t.mjs --help; done
step "python3 parses serve.py" python3 -I -c "import ast,sys; ast.parse(open('$S/scripts/serve.py').read())"
step "check_motion --help exits 0" node $S/scripts/check_motion.mjs --help
if [[ "$(uname -s)" == Darwin ]] && command -v swiftc >/dev/null 2>&1; then step "swiftc -parse cutout.swift" swiftc -parse $S/scripts/cutout.swift; fi

# 2. one version everywhere
v1="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' .claude-plugin/plugin.json | head -1)"
v2="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' .claude-plugin/marketplace.json | head -1)"
v3="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' .codex-plugin/plugin.json | head -1)"
for j in .claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .agents/plugins/marketplace.json; do
  step "valid JSON $j" python3 -c "import json,sys; json.load(open('$j'))"
done
if [[ -n "$v1" && "$v1" == "$v2" && "$v1" == "$v3" ]]; then ok "version $v1 in all three manifests"; else bad "versions differ: $v1 $v2 $v3"; fi
grep -q "^# brief2motion $v1\$" $S/SKILL.md && ok "SKILL.md heading says $v1" || bad "SKILL.md heading does not say $v1"
grep -q "^## \[$v1\]" CHANGELOG.md && ok "CHANGELOG has an entry for $v1" || bad "CHANGELOG has no entry for $v1"

# 3. the example runs the template engine, unchanged
for f in main.js assemble.js page.js flight.js validate.js style.css; do
  cmp -s "$T/$f" "$E/$f" && ok "example $f equals the template" || bad "example $f differs from the template"
done

# 3b. every example is complete: the unchanged kit, its brief, a passing report, and a page that reports its motion state
for d in examples/*/; do
  n="$(basename "$d")"
  sd="$d"; [[ -f "$d/routes.json" && -d "$d/site" ]] && sd="$d/site"   # a site-mode project keeps the site in site/
  if [[ -d "$sd/kit" ]]; then diff -rq -x tune.js "$S/kit" "$sd/kit" >/dev/null 2>&1 && ok "example $n carries the unchanged kit" || bad "example $n: kit/ differs from $S/kit"; fi
  [[ -s "$d/BRIEF.md" && -s "$d/README.md" ]] && ok "example $n has BRIEF.md and README.md" || bad "example $n is missing BRIEF.md or README.md"
  python3 -I -c "import json,sys; r=json.load(open('$d/site-report.json')); sys.exit(0 if r['pass'] is True and all(c['pass'] for c in r['checks']) and len(r['checks'])>=27 else 1)" 2>/dev/null && ok "example $n has a passing site-report.json" || bad "example $n: site-report.json is missing or not a pass"
  grep -rqE "signal\(|dataset\.motion" "${sd%/}/"*.js 2>/dev/null && ok "example $n reports its motion state" || bad "example $n never sets <html data-motion>"
done

# 3d. site mode: the template project and the larkspur example pass the checks that need no browser, and their generated files are current
for p in $S/templates/site-mode examples/larkspur; do
  n="$(basename "$p")"
  step "site mode $n: check_plan has no FAIL" node $S/scripts/check_plan.mjs "$p" --out "$(mktemp -d)"
  step "site mode $n: SITEMAP.md is current" node $S/scripts/build_sitemap.mjs "$p" --check --no-xml
  if [[ -f "$p/site/tokens.css" ]]; then step "site mode $n: site/tokens.css is current and every pair meets AA" node $S/scripts/build_tokens.mjs "$p/tokens.json" --check --out "$p/site/tokens.css"
  else step "site mode $n: tokens build and every pair meets AA" node $S/scripts/build_tokens.mjs "$p/tokens.json" --out "$(mktemp -d)/tokens.css"; fi
done
step "site mode larkspur: sitemap.xml is current" node $S/scripts/build_sitemap.mjs examples/larkspur --check
step "site mode larkspur: check_meta has no FAIL" node $S/scripts/check_meta.mjs examples/larkspur --out "$(mktemp -d)"
python3 -I -c "import json,sys; q=json.load(open('examples/larkspur/qa.json')); n=q['summary']; sys.exit(0 if q['pass'] is True and n['FAIL']==0 and n['PASS']>100 else 1)" 2>/dev/null && ok "example larkspur has a passing qa.json" || bad "example larkspur: qa.json is missing or has a FAIL"

# 3c. generated files are current, and the unit tests pass
step "style pages and atlas are current (build_styles.mjs --check)" node $S/scripts/build_styles.mjs --check
# the unit tests: a failure prints the failing tests and their errors; in CI a skipped test is a failure (tests/run_unit.sh)
if [[ "${B2M_UNIT_TESTS_RAN:-0}" == 1 ]]; then echo "skip  unit tests (B2M_UNIT_TESTS_RAN=1: CI ran tests/run_unit.sh in the step before)"
elif out="$(bash tests/run_unit.sh --quiet)"; then ok "$(echo "$out" | tail -1)"
else bad "$(echo "$out" | tail -1)"; echo "$out" | head -170; fi
for f in $S/references/stacks/*.md $S/references/*.md; do [[ -s "$f" ]] || bad "$f is empty"; done

# 4. integrity hashes on the CDN scripts are right (network; skipped when offline)
if curl -fsI --max-time 8 https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js >/dev/null 2>&1; then
  while read -r url sri; do
    got="sha384-$(curl -fsL --max-time 30 "$url" | openssl dgst -sha384 -binary | openssl base64 -A)"
    [[ "$got" == "$sri" ]] && ok "SRI matches $(basename "$url")" || bad "SRI wrong for $url"
  done < <(sed -n 's/.*<script defer src="\([^"]*\)" integrity="\([^"]*\)".*/\1 \2/p' $T/index.html examples/tidewater/index.html | sort -u)
  # the dev-only tuning panel is pinned with a hash too (kit/tune.js fetches it with integrity checking)
  tp_url="$(sed -n "s/.*url: '\([^']*\)'.*/\1/p" $S/kit/tune.js | head -1)"; tp_sri="$(sed -n "s/.*integrity: '\([^']*\)'.*/\1/p" $S/kit/tune.js | head -1)"
  got="sha384-$(curl -fsL --max-time 30 "$tp_url" | openssl dgst -sha384 -binary | openssl base64 -A)"
  [[ -n "$tp_url" && "$got" == "$tp_sri" ]] && ok "SRI matches Tweakpane in kit/tune.js" || bad "SRI wrong for the Tweakpane file in kit/tune.js"
else echo "skip  SRI check (cdn.jsdelivr.net not reachable)"; fi

# 4c. every link in the curated reference page answers (network; bot checks that stop scripts but not people are allowed).
# Opt-in (B2M_CHECK_LINKS=1), run before every release: 130+ outside sites must not turn CI red on unrelated changes.
if [[ "${B2M_CHECK_LINKS:-0}" != 1 ]]; then echo "skip  link check (set B2M_CHECK_LINKS=1; run before a release)"
elif curl -fsI --max-time 8 https://developer.mozilla.org/ >/dev/null 2>&1; then
  step "web-references.md: no dead links (check_links.mjs)" node $S/scripts/check_links.mjs $S/references/web-references.md
else echo "skip  link check (network not reachable)"; fi

# 5. nothing personal or secret ships (the pattern is split in pieces so this file does not match itself)
PRIV="varunpra""tap|/Use""rs/|claude-50""1|@gm""ail|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,}"
if hits="$(grep -rIn -E "$PRIV" . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null)"; [[ -n "$hits" ]]; then
  bad "privacy scan found something:"; echo "$hits" | cut -c1-160
else ok "privacy scan clean"; fi
grep -q $'\xe2\x80\x94' README.md && bad "README.md contains an em dash" || ok "README.md has no em dash"

# 6. the preview server serves modules with a JavaScript type, and a missing file is a 404
LOG="$(mktemp)"; python3 -u $S/scripts/serve.py $E --port 0 >"$LOG" 2>&1 & SRV=$!
for _ in $(seq 1 50); do grep -q "Open " "$LOG" && break; sleep 0.3; done
URL="$(sed -n 's/^Open  *//p' "$LOG" | head -1)"
if [[ -n "$URL" ]]; then
  [[ "$(curl -s -o /dev/null -w '%{http_code}' "$URL")" == 200 ]] && ok "serve.py serves index.html at $URL" || bad "serve.py index.html"
  curl -sI "${URL}main.js" | grep -qi 'content-type: text/javascript' && ok "serve.py sends main.js as JavaScript" || bad "serve.py main.js content type"
  [[ "$(curl -s -o /dev/null -w '%{http_code}' "${URL}nope.txt")" == 404 ]] && ok "serve.py returns 404 for a missing file" || bad "serve.py 404"
else bad "serve.py did not print its address"; echo "--- serve.py log:"; cat "$LOG"; echo "--- ps:"; ps -p "$SRV" -o pid,stat,command || true; fi
kill "$SRV" 2>/dev/null; wait "$SRV" 2>/dev/null; rm -f "$LOG"

echo; [[ $FAILS == 0 ]] && echo "ALL CHECKS PASSED" || echo "$FAILS CHECK(S) FAILED"
exit $((FAILS > 0))
