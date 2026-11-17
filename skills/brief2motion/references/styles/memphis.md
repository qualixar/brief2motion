# Memphis

Family: Retro and themed styles.

Squiggles, triangles, dots and terrazzo in clashing primaries and pastels, scattered at angles. Loud, geometric and cheerful.

The Memphis Group, an Italian design collective led by Ettore Sottsass, 1980 to 1987.

## Signature rules

- Primary colours with pink, mint and yellow, plus black outlines
- Loose geometric shapes: circles, triangles, squiggles
- Patterns: dots, stripes, terrazzo
- Asymmetry and tilt

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#fff7e8` |
| `--surface` | `#ffffff` |
| `--fg` | `#1b1b1b` |
| `--muted` | `#3d3d3d` |
| `--accent` | `#2b5cff` |
| `--accent-fg` | `#ffffff` |
| `--border` | `3px solid #1b1b1b` |
| `--radius` | `0px` |
| `--shadow` | `7px 7px 0 #ffcc00` |
| `--font-display` | `Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `800` |
| `--tracking` | `-0.01em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="memphis"] {
  --bg: #fff7e8; --surface: #ffffff; --fg: #1b1b1b; --muted: #3d3d3d; --accent: #2b5cff; --accent-fg: #ffffff; --border: 3px solid #1b1b1b; --radius: 0px; --shadow: 7px 7px 0 #ffcc00; --font-display: Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 800; --tracking: -0.01em;
  background: radial-gradient(#1b1b1b 1.6px, transparent 2px) 0 0 / 18px 18px, #fff7e8;
  .s-title { background: #fff7e8; display: inline; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .s-text { background: #fff7e8; }
  .s-card { box-shadow: var(--shadow); position: relative; }
  .s-card::after { content: ""; position: absolute; right: -16px; top: -18px; width: 44px; height: 44px; background: #ff5a8a; border: 3px solid #1b1b1b; border-radius: 50%; }
  .s-card::before { content: ""; position: absolute; left: -14px; bottom: -14px; width: 0; height: 0; border: 20px solid transparent; border-bottom-color: #19c39a; transform: rotate(-18deg); }
  .s-btn { box-shadow: 4px 4px 0 #1b1b1b; transition: transform .15s; }
  .s-btn:hover { transform: rotate(-2deg) translateY(-2px); }
  .s-btn-2 { background: #ffcc00; color: #1b1b1b; }
  .s-nav { background: #fff; }
}
```

## Motion that fits

Shapes drift, rotate and bounce at different speeds; hover gives a quick tilt.

## Accessibility

- Keep patterns away from text or put a solid panel behind it
- Decorative shapes should be hidden from assistive technology

## Choose it for

- Events, education, playful consumer brands, posters

## Avoid it for

- Sober or premium products

## Sources

- <https://en.wikipedia.org/wiki/Memphis_Group>

Facts checked on 2026-11-17.
