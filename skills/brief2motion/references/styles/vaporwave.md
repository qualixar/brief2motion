# Vaporwave

Family: Retro and themed styles.

An ironic remix of 1990s computing and mall culture: pastel pink and cyan, marble busts, old window chrome, wide-spaced text.

Grew out of an internet music scene in 2011 and 2012.

## Signature rules

- Pastel pink, lilac and cyan gradients
- Serif or system type with wide letter-spacing, often uppercase
- Old operating-system window frames, grids, statues, palm trees
- A little VHS damage

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#ffd1f2` |
| `--surface` | `#fdf2ff` |
| `--fg` | `#3a1d6e` |
| `--muted` | `#4f3290` |
| `--accent` | `#3a1d6e` |
| `--accent-fg` | `#fdf2ff` |
| `--border` | `2px solid #3a1d6e` |
| `--radius` | `0px` |
| `--shadow` | `6px 6px 0 rgb(58 29 110 / .35)` |
| `--font-display` | `"Times New Roman", Times, serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `400` |
| `--tracking` | `0.12em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="vaporwave"] {
  --bg: #ffd1f2; --surface: #fdf2ff; --fg: #3a1d6e; --muted: #4f3290; --accent: #3a1d6e; --accent-fg: #fdf2ff; --border: 2px solid #3a1d6e; --radius: 0px; --shadow: 6px 6px 0 rgb(58 29 110 / .35); --font-display: "Times New Roman", Times, serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 400; --tracking: 0.12em;
  background: linear-gradient(180deg, #ffb3ec 0%, #c8b6ff 50%, #9be7ff 100%);
  .s-title { text-transform: uppercase; font-style: italic; text-shadow: 3px 3px 0 #9be7ff; }
  .s-card { box-shadow: var(--shadow); border-top-width: 22px; position: relative; }                 /* an old window: a thick title bar */
  .s-card::before { content: "×"; position: absolute; top: -22px; right: 6px; color: #fdf2ff; font: 700 16px/22px system-ui, sans-serif; }
  .s-btn { border: 2px solid #3a1d6e; box-shadow: inset -2px -2px 0 rgb(0 0 0 / .25), inset 2px 2px 0 rgb(255 255 255 / .6); transition: filter .2s; }
  .s-btn:hover { filter: hue-rotate(40deg); }
  .s-btn-2 { background: #fdf2ff; color: #3a1d6e; }
  .s-nav { letter-spacing: .16em; text-transform: uppercase; font-size: .78em; }
}
```

## Motion that fits

Slow and dreamy: drifting gradients, a hue shift on hover, a scan line that passes now and then.

## Accessibility

- Pastel on pastel fails contrast: keep text dark
- Wide-spaced uppercase text is tiring in paragraphs; use it for labels only

## Choose it for

- Music, art and culture projects, merch, ironic campaigns

## Avoid it for

- Mainstream commerce and tools

## Sources

- <https://en.wikipedia.org/wiki/Vaporwave>

Facts checked on 2026-11-17.
