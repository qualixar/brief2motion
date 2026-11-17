#!/usr/bin/env bash
# tests/capture_examples.sh: make the README film of every example, one at a time.
#   bash tests/capture_examples.sh <work-folder>        writes assets/examples/<name>.webp
# Each film is the load animation (where there is one) followed by a scroll from top to bottom. Needs Chrome and ffmpeg.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
WORK="${1:?usage: bash tests/capture_examples.sh <work-folder>}"
mkdir -p "$WORK" assets/examples
# name, seconds of load animation, scroll frames
for spec in "halden-one 0 44" "tidewater 2 40" "relay 3 30" "keeling 0 40" "sprout 3 26" "copper-no-7 4 30" "mise 1 16" "style-atlas 0 44" "halvorsen 1 20"; do
  set -- $spec
  nice -n 15 node skills/brief2motion/scripts/capture_site.mjs "examples/$1" --out "$WORK/$1" --size 1280x800 --frames "$3" --intro "$2" --film | tail -1
  cp "$WORK/$1/film.webp" "assets/examples/$1.webp"
done
ls -la assets/examples | awk '{print $5, $9}'
