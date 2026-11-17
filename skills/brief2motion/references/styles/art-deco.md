# Art Deco

Family: Retro and themed styles.

Symmetry, stepped forms, sunbursts and fine gold lines on black or navy, with tall elegant capitals.

France, 1910s; named after the 1925 Paris exhibition of decorative arts.

## Signature rules

- Black or navy with gold, sometimes emerald or burgundy
- Strict symmetry and centred layouts
- Stepped shapes, chevrons, fans and sunbursts
- Tall, widely spaced capitals

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#0d1420` |
| `--surface` | `#111b2b` |
| `--fg` | `#f1e3c0` |
| `--muted` | `#c9b98e` |
| `--accent` | `#d4af37` |
| `--accent-fg` | `#0d1420` |
| `--border` | `1px solid #d4af37` |
| `--radius` | `0px` |
| `--shadow` | `none` |
| `--font-display` | `Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif` |
| `--font-text` | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` |
| `--weight-display` | `400` |
| `--tracking` | `0.14em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="art-deco"] {
  --bg: #0d1420; --surface: #111b2b; --fg: #f1e3c0; --muted: #c9b98e; --accent: #d4af37; --accent-fg: #0d1420; --border: 1px solid #d4af37; --radius: 0px; --shadow: none; --font-display: Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif; --font-text: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; --weight-display: 400; --tracking: 0.14em;
  text-align: center;
  .s-nav { border-width: 1px 0; border-radius: 0; text-transform: uppercase; letter-spacing: .2em; font-size: .72em; }
  .s-title { text-transform: uppercase; font-size: 1.7em; }
  .s-title::after { content: ""; display: block; width: 120px; height: 9px; margin: 14px auto 0; background: linear-gradient(90deg, transparent 0 20%, #d4af37 20% 80%, transparent 80%) center / 100% 1px no-repeat, linear-gradient(90deg, transparent 0 40%, #d4af37 40% 60%, transparent 60%) bottom / 100% 1px no-repeat; }
  .s-text { margin-inline: auto; }
  .s-actions { justify-content: center; }
  .s-card { outline: 1px solid #d4af37; outline-offset: 5px; text-align: left; }
  .s-btn { text-transform: uppercase; letter-spacing: .16em; font-size: .8em; clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%); transition: filter .25s; }
  .s-btn:hover { filter: brightness(1.15); }
  .s-btn-2 { background: none; color: #f1e3c0; clip-path: none; border: 1px solid #d4af37; }
  .s-field input { background: #0d1420; color: #f1e3c0; border-color: #d4af37; }
}
```

## Motion that fits

Stately: lines that draw outward from the centre, fans that open, slow fades of 400 to 600 ms.

## Accessibility

- Gold on black passes easily, gold on white does not
- Wide-spaced capitals are for headings only

## Choose it for

- Hotels, bars, jewellery, events, heritage brands

## Avoid it for

- Casual, technical or youthful products

## Sources

- <https://en.wikipedia.org/wiki/Art_Deco>

Facts checked on 2026-11-17.
