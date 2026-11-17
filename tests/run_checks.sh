#!/usr/bin/env bash
# tests/run_checks.sh: fast repo checks that need no browser. CI runs it; run it yourself before a release:
#   bash tests/run_checks.sh
# What it guards: scripts parse, the three manifests agree on one version, the worked example runs the unchanged template
# engine, the CDN integrity hashes are right, the preview server serves modules, and nothing personal is in the tree.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

S=skills/brief2motion; T=$S/templates/site; E=examples/copper-no-7
FAILS=0
ok()   { echo "ok    $1"; }
bad()  { echo "FAIL  $1"; FAILS=$((FAILS + 1)); }
step() { if "${@:2}" >/dev/null 2>&1; then ok "$1"; else bad "$1"; fi; }

# 1. syntax
for f in $S/scripts/*.sh tests/*.sh; do step "bash -n $f" bash -n "$f"; done
for f in $S/scripts/*.mjs $T/*.js $E/config.js; do step "node --check $f" node --check "$f"; done
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

# 4. integrity hashes on the CDN scripts are right (network; skipped when offline)
if curl -fsI --max-time 8 https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js >/dev/null 2>&1; then
  while read -r url sri; do
    got="sha384-$(curl -fsL --max-time 30 "$url" | openssl dgst -sha384 -binary | openssl base64 -A)"
    [[ "$got" == "$sri" ]] && ok "SRI matches $(basename "$url")" || bad "SRI wrong for $url"
  done < <(sed -n 's/.*<script defer src="\([^"]*\)" integrity="\([^"]*\)".*/\1 \2/p' $T/index.html)
else echo "skip  SRI check (cdn.jsdelivr.net not reachable)"; fi

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
else bad "serve.py did not print its address"; fi
kill "$SRV" 2>/dev/null; wait "$SRV" 2>/dev/null; rm -f "$LOG"

echo; [[ $FAILS == 0 ]] && echo "ALL CHECKS PASSED" || echo "$FAILS CHECK(S) FAILED"
exit $((FAILS > 0))
