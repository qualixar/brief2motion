#!/usr/bin/env bash
# doctor.sh: check what brief2motion needs and print the install command for anything missing.
#   bash doctor.sh          # human-readable
#   bash doctor.sh --json   # one JSON object
# Required: Node 22+, npm, Google Chrome or Playwright Chromium.
# Optional (warn only): internet to cdn.jsdelivr.net, ffmpeg (video only), brief2mp4 (video finishing).
# Exit 0 when every REQUIRED item is present, 1 otherwise.
set -uo pipefail

JSON=0; [[ "${1:-}" == "--json" ]] && JSON=1

case "$(uname -s)" in
  Darwin) OS=macos ;;
  Linux) OS=linux; grep -qi microsoft /proc/version 2>/dev/null && OS=wsl ;;
  MINGW*|MSYS*|CYGWIN*) OS=windows ;;
  *) OS=unknown ;;
esac

fix() {  # fix <tool> -> install command for this OS
  case "$OS:$1" in
    macos:node) echo "brew install node" ;;
    macos:chrome) echo "brew install --cask google-chrome   (or: npx playwright install chromium)" ;;
    macos:ffmpeg) echo "brew install ffmpeg" ;;
    windows:node) echo "winget install -e --id OpenJS.NodeJS.LTS" ;;
    windows:chrome) echo "winget install -e --id Google.Chrome   (or: npx playwright install chromium)" ;;
    windows:ffmpeg) echo "winget install -e --id Gyan.FFmpeg" ;;
    linux:node|wsl:node) echo "sudo apt install -y nodejs npm  (need Node 22+: use https://nodejs.org or the nodesource setup_22.x script)" ;;
    linux:chrome|wsl:chrome) echo "sudo apt install -y chromium   (or: npx playwright install chromium)" ;;
    linux:ffmpeg|wsl:ffmpeg) echo "sudo apt install -y ffmpeg" ;;
    *:node) echo "install Node.js 22+ from https://nodejs.org" ;;
    *:chrome) echo "install Google Chrome, or run: npx playwright install chromium" ;;
    *:ffmpeg) echo "install ffmpeg from https://ffmpeg.org/download.html" ;;
  esac
}

ROWS=(); FAIL=0
row() {  # row <name> <required:1|0> <status> <detail>
  ROWS+=("$1|$2|$3|$4")
  [[ "$2" == 1 && "$3" != ok ]] && FAIL=1
}

# node
if command -v node >/dev/null 2>&1; then
  major="$(node -v | sed 's/^v//; s/\..*//')"
  if [[ "$major" -ge 22 ]] 2>/dev/null; then row node 1 ok "$(node -v)"
  else row node 1 old "$(node -v) is older than 22. $(fix node)"; fi
else row node 1 missing "$(fix node)"; fi

# npm
if command -v npm >/dev/null 2>&1; then row npm 1 ok "$(npm -v)"; else row npm 1 missing "ships with Node. $(fix node)"; fi

# Chrome or Playwright Chromium
chrome=""
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Program Files/Google/Chrome/Application/chrome.exe" \
         "/c/Program Files/Google/Chrome/Application/chrome.exe" \
         "$(command -v google-chrome 2>/dev/null)" "$(command -v google-chrome-stable 2>/dev/null)" \
         "$(command -v chrome 2>/dev/null)"; do
  [[ -n "$c" && -e "$c" ]] && { chrome="$c"; break; }
done
if [[ -n "$chrome" ]]; then row chrome 1 ok "Google Chrome: $chrome"
else
  pwc=""
  for d in "$HOME/Library/Caches/ms-playwright" "$HOME/.cache/ms-playwright" "${LOCALAPPDATA:-/nonexistent}/ms-playwright" "${PLAYWRIGHT_BROWSERS_PATH:-/nonexistent}"; do
    [[ -d "$d" ]] && ls "$d" 2>/dev/null | grep -q '^chromium' && { pwc="$d"; break; }
  done
  if [[ -n "$pwc" ]]; then row chrome 1 ok "Playwright Chromium in $pwc (check_motion uses channel 'chrome'; set it to Chromium if Chrome is absent)"
  else row chrome 1 missing "$(fix chrome)"; fi
fi

# internet (warn only): the page loads three.js, GSAP, Lenis from cdn.jsdelivr.net
if command -v curl >/dev/null 2>&1; then
  if curl -fsI --max-time 8 https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js >/dev/null 2>&1; then row cdn 0 ok "cdn.jsdelivr.net reachable"
  else row cdn 0 warn "cdn.jsdelivr.net not reachable. The page loads three.js, GSAP and Lenis from it; offline, vendor them into the site folder"; fi
else row cdn 0 warn "curl not found, could not test cdn.jsdelivr.net"; fi

# ffmpeg (video only)
if command -v ffmpeg >/dev/null 2>&1; then row ffmpeg 0 ok "$(ffmpeg -version 2>/dev/null | head -1 | cut -c1-60)"
else row ffmpeg 0 missing "only needed for to_video.sh. $(fix ffmpeg)"; fi

# brief2mp4 (optional: finishing + delivery checks for video)
b2m=""
for d in "${BRIEF2MP4_SCRIPTS:-}" "$HOME/.claude/skills/brief2mp4/scripts" "$HOME/.codex/skills/brief2mp4/scripts"; do
  [[ -n "$d" && -f "$d/finish.sh" ]] && { b2m="$d"; break; }
done
if [[ -z "$b2m" ]]; then
  for f in "$HOME"/.claude/plugins/cache/*/brief2mp4*/skills/brief2mp4/scripts/finish.sh \
           "$HOME"/.claude/plugins/cache/*/*/*/skills/brief2mp4/scripts/finish.sh; do
    [[ -f "$f" ]] && { b2m="$(dirname "$f")"; break; }
  done
fi
if [[ -n "$b2m" ]]; then row brief2mp4 0 ok "$b2m"
else row brief2mp4 0 missing "optional, used by to_video.sh for finishing. Install the brief2mp4 skill (same repo family); without it to_video.sh encodes directly with ffmpeg"; fi

if [[ "$JSON" == 1 ]]; then
  printf '{"os":"%s","ok":%s,"tools":[' "$OS" "$([[ $FAIL == 0 ]] && echo true || echo false)"
  sep=""
  for r in "${ROWS[@]}"; do
    IFS='|' read -r n req st det <<<"$r"
    det="${det//\\/\\\\}"; det="${det//\"/\\\"}"
    printf '%s{"name":"%s","required":%s,"status":"%s","detail":"%s"}' "$sep" "$n" "$([[ $req == 1 ]] && echo true || echo false)" "$st" "$det"
    sep=","
  done
  printf ']}\n'
else
  echo "brief2motion doctor ($OS)"
  for r in "${ROWS[@]}"; do
    IFS='|' read -r n req st det <<<"$r"
    printf '  %-8s %-9s %s%s\n' "$st" "$n" "$det" "$([[ $req == 0 ]] && echo '  [optional]')"
  done
  [[ $FAIL == 0 ]] && echo "RESULT: ready" || echo "RESULT: missing required tools (see above)"
fi
exit "$FAIL"
