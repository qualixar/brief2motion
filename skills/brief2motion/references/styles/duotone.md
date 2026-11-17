# Duotone

Family: Visual treatments.

Every picture mapped to just two colours, a dark and a light, so mixed photography looks like one set.

A printing technique: a halftone made with two inks.

## Signature rules

- Convert the image to greyscale first
- Map shadows to one colour and highlights to another (multiply for the dark, lighten or screen for the light, or an SVG feComponentTransfer)
- Use the same pair across the whole site
- Pick a pair with strong lightness contrast

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#1a1147` |
| `--surface` | `#241a5e` |
| `--fg` | `#ffffff` |
| `--muted` | `#d9d3ff` |
| `--accent` | `#ff5a5f` |
| `--accent-fg` | `#1a1147` |
| `--border` | `0 solid transparent` |
| `--radius` | `8px` |
| `--shadow` | `none` |
| `--font-display` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `800` |
| `--tracking` | `-0.03em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="duotone"] {
  --bg: #1a1147; --surface: #241a5e; --fg: #ffffff; --muted: #d9d3ff; --accent: #ff5a5f; --accent-fg: #1a1147; --border: 0 solid transparent; --radius: 8px; --shadow: none; --font-display: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 800; --tracking: -0.03em;
  .s-card { position: relative; overflow: hidden; isolation: isolate; background: #1a1147; }
  /* the "photo": any image, forced to greyscale, with two colours laid over it by blend modes */
  .s-card::before { content: ""; position: absolute; inset: 0; z-index: -2; background: radial-gradient(circle at 70% 30%, #fff 0 12%, #999 30%, #222 70%); filter: grayscale(1) contrast(1.2); }
  .s-card::after { content: ""; position: absolute; inset: 0; z-index: -1; background: #ff5a5f; mix-blend-mode: multiply; }
  .s-card { background: #1a1147; }
  .s-card > * { text-shadow: 0 1px 8px rgb(26 17 71 / .9); }
  .s-btn { transition: transform .2s; }
  .s-btn:hover { transform: translateY(-2px); }
  .s-btn-2 { background: #ffffff; color: #1a1147; }
  .s-field input { background: #1a1147; color: #fff; border-color: #fff; }
}
```

## Motion that fits

Cross-fade between two colour pairs on hover or scroll; otherwise still.

## Accessibility

- Text over a duotone photo needs a scrim or a solid panel
- Check the pair itself for colour-blind confusion: lightness contrast matters more than hue

## Choose it for

- Sites with mixed or weak photography, music and events, campaigns with one strong brand colour

## Avoid it for

- Products where true colour matters, such as food or fashion detail

## Sources

- <https://en.wikipedia.org/wiki/Duotone>
- <https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode>

Facts checked on 2026-11-17.
