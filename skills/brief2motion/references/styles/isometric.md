# Isometric

Family: Visual treatments.

Objects drawn as if seen from above at an angle with no perspective, so parallel lines never meet. Reads as a tidy little model world.

A technical drawing projection; familiar from games, which usually use a 2:1 pixel ratio.

## Signature rules

- Three visible faces per object: top lightest, one side mid, one side darkest
- True isometric uses 30° to the horizontal; pixel-friendly art uses a 2:1 slope
- One light direction for every object
- Flat colours; depth comes from the three tones

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#eef2ff` |
| `--surface` | `#ffffff` |
| `--fg` | `#1b2559` |
| `--muted` | `#4a5596` |
| `--accent` | `#4f5bd5` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `12px` |
| `--shadow` | `0 14px 30px rgb(40 50 130 / .18)` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="isometric"] {
  --bg: #eef2ff; --surface: #ffffff; --fg: #1b2559; --muted: #4a5596; --accent: #4f5bd5; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 12px; --shadow: 0 14px 30px rgb(40 50 130 / .18); --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  .s-card { box-shadow: var(--shadow); position: relative; }
  /* a small isometric cube made of three skewed faces: top, left, right */
  .s-stat { position: relative; padding-left: 86px; min-height: 78px; display: grid; align-content: center; }
  .s-stat::before, .s-stat::after { content: ""; position: absolute; left: 6px; top: 26px; width: 32px; height: 36px; }
  .s-stat::before { background: #4f5bd5; transform: skewY(30deg); }
  .s-stat::after { left: 38px; background: #2f3aa8; transform: skewY(-30deg); }
  .s-label { position: relative; }
  .s-label::before { content: ""; position: absolute; left: 6px; top: 26px; width: 64px; height: 37px; background: #9aa5ff; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); transform: translateY(-9px); transition: transform .3s cubic-bezier(.3, 1.5, .5, 1); }
  .s-card:hover .s-label::before { transform: translateY(-17px); }   /* the lid lifts */
  .s-btn { transition: transform .2s, box-shadow .2s; box-shadow: 0 6px 0 #2f3aa8; }
  .s-btn:hover { transform: translateY(2px); box-shadow: 0 4px 0 #2f3aa8; }
  .s-btn-2 { background: #fff; color: #1b2559; box-shadow: 0 6px 0 #c7cdf5; }
}
```

## Motion that fits

Parts lift, stack and slide along the three axes. Layers separating vertically explain how a product is built.

## Accessibility

- Isometric scenes are illustrations: describe what they show in text
- Small isometric labels get hard to read at an angle; keep text flat

## Choose it for

- Explaining systems, infrastructure, logistics, fintech flows, feature diagrams

## Avoid it for

- Emotional or lifestyle brands

## Sources

- <https://en.wikipedia.org/wiki/Isometric_video_game_graphics>

Facts checked on 2026-11-17.
