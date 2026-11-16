#!/usr/bin/env bash
# to_video.sh: record a deterministic scroll-through of a brief2motion site as an MP4.
#   to_video.sh <site-dir> <out.mp4> [--seconds 12] [--size 1920x1080] [--fps 60]
# Frames come from capture_frames.mjs (Playwright, scroll position set per frame). Then:
#   - if brief2mp4's finish.sh / check_delivery.sh are installed, they finish and verify the file;
#   - otherwise ffmpeg encodes H.264 yuv420p directly (and this script says so).
# Search order for brief2mp4: $BRIEF2MP4_SCRIPTS, ~/.claude/skills/brief2mp4, ~/.codex/skills/brief2mp4,
# ~/.claude/plugins/cache/*/brief2mp4*.
set -euo pipefail

SITE="${1:-}"; OUT="${2:-}"
[[ -n "$SITE" && -n "$OUT" && "$SITE" != -* ]] || { sed -n '2,9p' "$0"; exit 2; }
shift 2
SECS=12 SIZE=1920x1080 FPS=60
while [[ $# -gt 0 ]]; do
  case "$1" in
    --seconds) SECS="$2"; shift 2 ;;
    --size) SIZE="$2"; shift 2 ;;
    --fps) FPS="$2"; shift 2 ;;
    *) echo "to_video.sh: unknown option $1" >&2; exit 2 ;;
  esac
done
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SITE/index.html" ]] || { echo "to_video.sh: no index.html in $SITE" >&2; exit 2; }
command -v node >/dev/null || { echo "to_video.sh: node not found (bash doctor.sh)" >&2; exit 2; }
command -v ffmpeg >/dev/null || { echo "to_video.sh: ffmpeg not found. macOS: brew install ffmpeg | Linux: sudo apt install -y ffmpeg | Windows: winget install -e --id Gyan.FFmpeg" >&2; exit 2; }
[[ "$SIZE" =~ ^[0-9]+x[0-9]+$ ]] || { echo "to_video.sh: --size must look like 1920x1080" >&2; exit 2; }
W="${SIZE%x*}" H="${SIZE#*x}"

B2M=""
for d in "${BRIEF2MP4_SCRIPTS:-}" "$HOME/.claude/skills/brief2mp4/scripts" "$HOME/.codex/skills/brief2mp4/scripts"; do
  [[ -n "$d" && -f "$d/finish.sh" && -f "$d/check_delivery.sh" ]] && { B2M="$d"; break; }
done
if [[ -z "$B2M" ]]; then
  for f in "$HOME"/.claude/plugins/cache/*/brief2mp4*/skills/brief2mp4/scripts/finish.sh \
           "$HOME"/.claude/plugins/cache/*/*/*/skills/brief2mp4/scripts/finish.sh; do
    [[ -f "$f" && -f "$(dirname "$f")/check_delivery.sh" ]] && { B2M="$(dirname "$f")"; break; }
  done
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/b2motion-frames.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$(dirname "$OUT")"

echo "to_video: capturing frames (${SECS}s at ${FPS} fps, ${SIZE})..."
node "$HERE/capture_frames.mjs" "$SITE" "$TMP" --seconds "$SECS" --fps "$FPS" --size "$SIZE"

if [[ -n "$B2M" ]]; then
  echo "to_video: finishing with brief2mp4 ($B2M)"
  bash "$B2M/finish.sh" --in "$TMP" --out "$OUT" --seconds "$SECS" --fps "$FPS" --size "$SIZE"
  bash "$B2M/check_delivery.sh" "$OUT" --seconds "$SECS" --size "$SIZE" --fps "$FPS" --silent-ok
else
  echo "to_video: brief2mp4 not found, encoding directly with ffmpeg (H.264, yuv420p, ${FPS} fps, no delivery check)"
  ffmpeg -v error -y -framerate "$FPS" -i "$TMP/%04d.png" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 -profile:v high -movflags +faststart "$OUT" \
    || { echo "to_video: if the frame pattern failed (more than 9999 frames), use fewer seconds or fps" >&2; exit 1; }
  echo "to_video: wrote $OUT"
fi
