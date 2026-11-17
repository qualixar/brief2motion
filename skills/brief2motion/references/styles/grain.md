# Grain / noise texture

Family: Visual treatments.

A fine speckle over flat colour or gradients, like film grain or cheap print. It removes the plastic look and hides banding.

A print and film artefact, reproduced on the web with an SVG noise filter.

## Signature rules

- SVG feTurbulence, type fractalNoise, baseFrequency about 0.7 to 1
- Overlay at low opacity with multiply or overlay blending
- A small repeating tile (stitchTiles) and never a live full-screen filter
- Works best over gradients and muted, printed-looking palettes

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#e9dcc9` |
| `--surface` | `#f4eadb` |
| `--fg` | `#2a2118` |
| `--muted` | `#5a4a3a` |
| `--accent` | `#b4431f` |
| `--accent-fg` | `#fff5ea` |
| `--border` | `0 solid transparent` |
| `--radius` | `6px` |
| `--shadow` | `none` |
| `--font-display` | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `600` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="grain"] {
  --bg: #e9dcc9; --surface: #f4eadb; --fg: #2a2118; --muted: #5a4a3a; --accent: #b4431f; --accent-fg: #fff5ea; --border: 0 solid transparent; --radius: 6px; --shadow: none; --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 600; --tracking: -0.02em;
  position: relative; isolation: isolate;
  background: linear-gradient(140deg, #e9dcc9, #d9b99a);
  /* one small noise tile, repeated: an SVG feTurbulence filter drawn once, not a full-screen live filter */
  &::after { content: ""; position: absolute; inset: 0; z-index: -1; opacity: .5; mix-blend-mode: multiply; pointer-events: none; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .s-card { background: #f4eadb; }
  .s-btn { transition: background-color .2s; }
  .s-btn:hover { background: #8f3215; }
  .s-btn-2 { background: none; color: #2a2118; border: 1.5px solid #2a2118; }
}
```

## Motion that fits

The grain itself stays still. If it must flicker, step it at a few frames a second on a small layer.

## Accessibility

- Grain lowers text contrast slightly: keep it behind text or very faint
- Animated noise is tiring and costly: default to still

## Choose it for

- Craft, food, fashion, editorial, any brand that wants a printed or analogue feel

## Avoid it for

- Crisp, clinical product interfaces

## Sources

- <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence>

Facts checked on 2026-11-17.
