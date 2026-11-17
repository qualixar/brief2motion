# Swiss / International Typographic Style

Also called: International Style.
Family: Layout and type styles.

A strict grid, one grotesque typeface, flush-left text and lots of white space. The layout is the decoration.

Switzerland, 1950s and 60s: Josef Müller-Brockmann, Armin Hofmann, Emil Ruder. Helvetica dates from 1957.

## Signature rules

- A modular or 12-column grid, visibly obeyed
- One sans-serif family in two or three sizes
- Flush left, ragged right; asymmetric balance
- Black and white plus one accent

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#ffffff` |
| `--surface` | `#ffffff` |
| `--fg` | `#0a0a0a` |
| `--muted` | `#3d3d3d` |
| `--accent` | `#e30613` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `0px` |
| `--shadow` | `none` |
| `--font-display` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--font-text` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.035em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="swiss"] {
  --bg: #ffffff; --surface: #ffffff; --fg: #0a0a0a; --muted: #3d3d3d; --accent: #e30613; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 0px; --shadow: none; --font-display: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --font-text: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --weight-display: 700; --tracking: -0.035em;
  .s-nav { border-top: 4px solid #0a0a0a; border-radius: 0; padding: 12px 0; }
  .s-title { text-wrap: balance; }
  .s-card { border-top: 1px solid #0a0a0a; border-radius: 0; padding-inline: 0; }
  .s-stat { color: #e30613; font-size: 4.2em; letter-spacing: -.05em; }
  .s-btn { border-radius: 0; transition: background-color .15s; }
  .s-btn:hover { background: #0a0a0a; }
  .s-btn-2 { background: none; color: #0a0a0a; border-bottom: 2px solid #0a0a0a; border-radius: 0; padding-inline: 0; }
}
```

## Motion that fits

Sparse and exact: text wipes along the grid, a rule that draws, one clean page-load sequence.

## Accessibility

- A naturally accessible style: high contrast, clear hierarchy
- Keep line length to roughly 45 to 90 characters

## Choose it for

- Editorial sites, portfolios, B2B, culture, anything led by text

## Avoid it for

- Brands that want warmth or playfulness

## Sources

- <https://en.wikipedia.org/wiki/Swiss_Style_(design)>
- <https://practicaltypography.com/line-length.html>

Facts checked on 2026-11-17.
