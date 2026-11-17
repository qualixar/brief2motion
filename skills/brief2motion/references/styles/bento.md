# Bento grid

Family: Layout and type styles.

A grid of rounded tiles of different sizes, like a lunch box. Each tile holds one feature, and bigger tiles matter more.

Named after the Japanese lunch box; popular since Apple product pages around 2023, with Windows Metro tiles as an earlier relative.

## Signature rules

- CSS Grid with tiles spanning different numbers of columns and rows
- One consistent gap and one corner radius
- One idea per tile; size shows importance
- Collapses to a single column on phones

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#f2f3f5` |
| `--surface` | `#ffffff` |
| `--fg` | `#15171a` |
| `--muted` | `#565c66` |
| `--accent` | `#15171a` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `22px` |
| `--shadow` | `0 1px 2px rgb(0 0 0 / .06)` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `650` |
| `--tracking` | `-0.03em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="bento"] {
  --bg: #f2f3f5; --surface: #ffffff; --fg: #15171a; --muted: #565c66; --accent: #15171a; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 22px; --shadow: 0 1px 2px rgb(0 0 0 / .06); --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 650; --tracking: -0.03em;
  .s-card { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: none; padding: 0; box-shadow: none; }
  .s-card > * { background: #fff; border-radius: 18px; padding: 14px; box-shadow: var(--shadow); margin: 0; transition: transform .25s ease; }
  .s-card > *:hover { transform: scale(1.02); }
  .s-card .s-stat { grid-row: span 2; display: grid; align-content: end; font-size: 3.2em; background: #15171a; color: #fff; }
  .s-card .s-field { grid-column: span 2; }
  .s-card .s-label { background: #dff3e4; color: #0d4a22; }
  .s-card .s-note { background: #e6ecff; color: #1b2f7a; }
  .s-btn { border-radius: 999px; }
  .s-btn-2 { background: #fff; color: #15171a; }
}
```

## Motion that fits

Tiles scale a little on hover or play one small loop each. Stagger their entrance once, at most.

## Accessibility

- Visual order and DOM order drift apart easily: check the reading and tab order
- Do not hide the main message in a small tile

## Choose it for

- Feature overviews, product pages, dashboards, portfolios

## Avoid it for

- Arguments that have to be read in order

## Sources

- <https://webdesignerdepot.com/what-is-the-bento-ui-trend-and-how-can-you-get-started>
- <https://www.freecodecamp.org/news/bento-grids-in-web-design/>

Facts checked on 2026-11-17.
