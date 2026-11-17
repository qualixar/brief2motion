# Y2K

Family: Retro and themed styles.

The late-1990s vision of the future: chrome, bubbly rounded type, translucent plastic, lime and hot pink, shiny gradients.

The look of roughly 1997 to 2004, revived in the 2020s.

## Signature rules

- Lime, orange and hot pink with white and chrome
- Chunky rounded lettering, often outlined
- Glossy gradients with a hard white highlight
- Translucent plastic and bubbles

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#d8f0ff` |
| `--surface` | `rgb(255 255 255 / .7)` |
| `--fg` | `#141a66` |
| `--muted` | `#273199` |
| `--accent` | `#ff2fa0` |
| `--accent-fg` | `#ffffff` |
| `--border` | `2px solid #141a66` |
| `--radius` | `26px` |
| `--shadow` | `0 6px 0 #141a66` |
| `--font-display` | `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif` |
| `--font-text` | `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif` |
| `--weight-display` | `900` |
| `--tracking` | `-0.01em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="y2k"] {
  --bg: #d8f0ff; --surface: rgb(255 255 255 / .7); --fg: #141a66; --muted: #273199; --accent: #ff2fa0; --accent-fg: #ffffff; --border: 2px solid #141a66; --radius: 26px; --shadow: 0 6px 0 #141a66; --font-display: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif; --font-text: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif; --weight-display: 900; --tracking: -0.01em;
  background: radial-gradient(circle at 80% 10%, #c8ff3d 0 14%, transparent 40%), linear-gradient(160deg, #bfe8ff, #e9d6ff 60%, #ffd3ee);
  .s-title { background: linear-gradient(180deg, #5d6bff, #141a66 55%, #8fa0ff); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-stroke: 1px #141a66; }
  .s-card { box-shadow: var(--shadow); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
  .s-btn { border-radius: 999px; background: linear-gradient(180deg, #ff7cc6, #ff2fa0 55%, #d1127e); box-shadow: 0 4px 0 #141a66, inset 0 3px 0 rgb(255 255 255 / .65); border: 2px solid #141a66; transition: transform .12s; }
  .s-btn:active { transform: translateY(4px); box-shadow: 0 0 0 #141a66, inset 0 3px 0 rgb(255 255 255 / .65); }
  .s-btn-2 { background: linear-gradient(180deg, #f4ffc9, #c8ff3d 55%, #9ad600); color: #141a66; }
  .s-nav { border-radius: 999px; background: linear-gradient(180deg, #ffffff, #cfd8e6 50%, #f4f7fb); }   /* chrome */
}
```

## Motion that fits

Bouncy and toy-like: buttons click down, stars spin, things wobble on hover.

## Accessibility

- Gradient-filled text needs a readable fallback colour and enough contrast at its lightest point
- Sparkle and spin loops need reduced-motion handling

## Choose it for

- Fashion, music, youth brands, nostalgia campaigns

## Avoid it for

- Serious or long-lived product interfaces

## Sources

- <https://en.wikipedia.org/wiki/Y2K_aesthetic>

Facts checked on 2026-11-17.
