#!/usr/bin/env bash
# doctor.sh: check what brief2motion needs and print the install command for anything missing.
#   bash doctor.sh          # human-readable
#   bash doctor.sh --json   # one JSON object
# Required: Node 22+, npm, and a Chrome or Chromium that check_motion can start (same search order as the script).
# Optional (warn only): the pinned playwright-core, Python 3 (preview server; node serve.mjs works without it),
# internet to cdn.jsdelivr.net, ffmpeg (video only), brief2mp4 (video finishing), Swift on macOS 14+ (background removal).
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
    macos:chrome) echo "brew install --cask google-chrome   (or: npx playwright@1.65.1 install chromium)" ;;
    macos:ffmpeg) echo "brew install ffmpeg" ;;
    windows:node) echo "winget install -e --id OpenJS.NodeJS.LTS" ;;
    windows:chrome) echo "winget install -e --id Google.Chrome   (or: npx playwright@1.65.1 install chromium)" ;;
    windows:ffmpeg) echo "winget install -e --id Gyan.FFmpeg" ;;
    linux:node|wsl:node) echo "sudo apt install -y nodejs npm  (need Node 22+: use https://nodejs.org or the nodesource setup_22.x script)" ;;
    linux:chrome|wsl:chrome) echo "sudo apt install -y chromium   (or: npx playwright@1.65.1 install chromium)" ;;
    linux:ffmpeg|wsl:ffmpeg) echo "sudo apt install -y ffmpeg" ;;
    *:node) echo "install Node.js 22+ from https://nodejs.org" ;;
    *:chrome) echo "install Google Chrome, or run: npx playwright@1.65.1 install chromium" ;;
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

# A browser check_motion can start. Same order as launchChrome() in _common.mjs:
# BRIEF2MOTION_CHROME, Google Chrome, chromium / google-chrome on PATH, Playwright's own Chromium.
chrome=""; how=""; settled=0
if [[ -n "${BRIEF2MOTION_CHROME:-}" ]]; then
  settled=1
  if [[ -x "$BRIEF2MOTION_CHROME" ]]; then chrome="$BRIEF2MOTION_CHROME"; how="BRIEF2MOTION_CHROME"
  else row chrome 1 missing "BRIEF2MOTION_CHROME is set to $BRIEF2MOTION_CHROME, which is not an executable file"; fi
fi
if [[ $settled == 0 ]]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Program Files/Google/Chrome/Application/chrome.exe" \
           "/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
           "/c/Program Files/Google/Chrome/Application/chrome.exe" \
           "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
           "$(command -v google-chrome 2>/dev/null)" "$(command -v google-chrome-stable 2>/dev/null)" \
           "$(command -v chromium 2>/dev/null)" "$(command -v chromium-browser 2>/dev/null)" \
           "$(command -v chrome 2>/dev/null)"; do
    [[ -n "$c" && -e "$c" ]] && { chrome="$c"; how="found"; break; }
  done
  if [[ -z "$chrome" ]]; then
    pwc=""
    for d in "$HOME/Library/Caches/ms-playwright" "$HOME/.cache/ms-playwright" "${LOCALAPPDATA:-/nonexistent}/ms-playwright" "${PLAYWRIGHT_BROWSERS_PATH:-/nonexistent}"; do
      [[ -d "$d" ]] && ls "$d" 2>/dev/null | grep -q '^chromium' && { pwc="$d"; break; }
    done
    if [[ -n "$pwc" ]]; then row chrome 1 ok "Playwright Chromium in $pwc (used when no Chrome is found)"
    else row chrome 1 missing "$(fix chrome)"; fi
  fi
fi
[[ -n "$chrome" ]] && row chrome 1 ok "$chrome ($how)"

# playwright-core 1.65.1 (the checker's driver). Downloaded once into a cache folder on the first check.
PWV="1.65.1"; DEPS="${BRIEF2MOTION_DEPS:-$HOME/.cache/brief2motion/deps}"
have="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$DEPS/node_modules/playwright-core/package.json" 2>/dev/null | head -1)"
if [[ "$have" == "$PWV" ]]; then row playwright-core 0 ok "$PWV in $DEPS"
else row playwright-core 0 todo "not installed yet. The first check downloads it (about 14 MB on disk, install scripts off) into $DEPS. Or now: npm i --no-save --ignore-scripts --prefix \"$DEPS\" playwright-core@$PWV"; fi

# preview server: python3 or python (serve.py), else node serve.mjs
py=""; for c in python3 python; do command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(sys.version_info[0] < 3)' 2>/dev/null && { py="$c"; break; }; done
if [[ -n "$py" ]]; then row python 0 ok "$py $("$py" -V 2>&1 | cut -d' ' -f2): serve.py works"
else row python 0 todo "Python 3 not found. Use  node serve.mjs <site-folder>  to preview instead"; fi

# swift (only for background removal of photos, macOS 14+)
if [[ "$OS" == macos ]]; then
  macver="$(sw_vers -productVersion 2>/dev/null | cut -d. -f1)"
  if command -v swift >/dev/null 2>&1 && [[ "${macver:-0}" -ge 14 ]]; then row swift 0 ok "macOS $macver with Swift: cutout.swift works"
  else row swift 0 todo "cutout.swift needs macOS 14+ and the Xcode command line tools (xcode-select --install). Otherwise ask for a photo on a plain background"; fi
fi

# internet (warn only): the page loads three.js, GSAP, Lenis from cdn.jsdelivr.net
if command -v curl >/dev/null 2>&1; then
  if curl -fsI --max-time 8 https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js >/dev/null 2>&1; then row cdn 0 ok "cdn.jsdelivr.net reachable"
  else row cdn 0 warn "cdn.jsdelivr.net not reachable. The page loads three.js, GSAP and Lenis from it. Offline, save the pinned files next to the site and point the script tags at them (see references/licences.md)"; fi
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
  if [[ $FAIL == 0 ]]; then
    echo "RESULT: ready"
    HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [[ -n "$py" ]]; then echo "Preview a page (open the address it prints, not the file): $py \"$HERE/serve.py\" site   ->  http://localhost:8421/"
    else echo "Preview a page (open the address it prints, not the file): node \"$HERE/serve.mjs\" site   ->  http://localhost:8421/"; fi
  else echo "RESULT: missing required tools (see above)"; fi
fi
exit "$FAIL"
