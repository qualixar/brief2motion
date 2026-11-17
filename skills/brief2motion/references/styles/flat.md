# Flat design

Family: Surface styles.

No depth at all: solid fills, clear type, simple icons, strong colour. Nothing pretends to be an object.

Rooted in Swiss style; reached interfaces with Zune (2006), Windows Phone 7 (2010) and iOS 7 (2013).

## Signature rules

- Solid colour, no gradients, no shadows
- Simple geometric icons and plenty of space
- Hierarchy from size, weight and colour only

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#f4f7fa` |
| `--surface` | `#ffffff` |
| `--fg` | `#1c2733` |
| `--muted` | `#4a5868` |
| `--accent` | `#0b6bcb` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `4px` |
| `--shadow` | `none` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="flat"] {
  --bg: #f4f7fa; --surface: #ffffff; --fg: #1c2733; --muted: #4a5868; --accent: #0b6bcb; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 4px; --shadow: none; --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  .s-card { background: #ffffff; border-bottom: 4px solid #0b6bcb; }
  .s-btn { transition: background-color .15s ease; }
  .s-btn:hover { background: #0958a8; }
  .s-btn-2 { background: transparent; color: #0b6bcb; text-decoration: underline; text-underline-offset: 4px; }   /* an underline keeps the link recognisable with no shadow to help */
  .s-nav { border-bottom: 2px solid #d5dde6; border-radius: 0; padding-inline: 0; }
}
```

## Motion that fits

Colour and opacity changes of 100 to 200 ms. Movement is rare and short.

## Accessibility

- With no depth cues, clickable things can look like labels: keep underlines, borders or fills on every control
- A Nielsen Norman Group study is often cited for flat interfaces being slower to use for that reason

## Choose it for

- Marketing sites, dashboards, documentation, anything that must load fast

## Avoid it for

- Products that rely on a physical metaphor

## Sources

- <https://en.wikipedia.org/wiki/Flat_design>

Facts checked on 2026-11-17.
