# Material Design 3

Also called: Material You, Material 3 Expressive.
Family: Surface styles.

Google's system: tonal colour roles from one seed colour, surfaces at a few elevation levels, generous rounding and a defined motion scale.

Announced in 2014; Material You (Material 3) in 2021; Material 3 Expressive in 2025.

## Signature rules

- Colour roles (primary, on-primary, surface, on-surface) generated from a seed colour
- Corner tokens: 4, 12, 16, 28 px and full
- Motion tokens: durations from 50 to 1000 ms in steps, standard easing cubic-bezier(.2, 0, 0, 1)
- State layers: a tint of the content colour at 8% on hover and 12% on press

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#fef7ff` |
| `--surface` | `#f3edf7` |
| `--fg` | `#1d1b20` |
| `--muted` | `#49454f` |
| `--accent` | `#6750a4` |
| `--accent-fg` | `#ffffff` |
| `--border` | `1px solid #cac4d0` |
| `--radius` | `12px` |
| `--shadow` | `0 1px 2px rgb(0 0 0 / .3), 0 1px 3px 1px rgb(0 0 0 / .15)` |
| `--font-display` | `Roboto, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `Roboto, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `500` |
| `--tracking` | `0` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="material"] {
  --bg: #fef7ff; --surface: #f3edf7; --fg: #1d1b20; --muted: #49454f; --accent: #6750a4; --accent-fg: #ffffff; --border: 1px solid #cac4d0; --radius: 12px; --shadow: 0 1px 2px rgb(0 0 0 / .3), 0 1px 3px 1px rgb(0 0 0 / .15); --font-display: Roboto, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: Roboto, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 500; --tracking: 0;
  .s-card { border: 0; border-radius: 12px; box-shadow: var(--shadow); }
  .s-btn { border-radius: 9999px; position: relative; overflow: hidden; transition: box-shadow .2s cubic-bezier(.2, 0, 0, 1); }
  .s-btn::after { content: ""; position: absolute; inset: 0; background: currentColor; opacity: 0; transition: opacity .15s cubic-bezier(.2, 0, 0, 1); }   /* the state layer */
  .s-btn:hover::after { opacity: .08; }
  .s-btn:active::after { opacity: .12; }
  .s-btn:hover { box-shadow: var(--shadow); }
  .s-btn-2 { background: #e8def8; color: #1d192b; }
  .s-field input { border-radius: 4px; border: 1px solid #79747e; }
  .s-nav { border: 0; background: #f3edf7; border-radius: 28px; }
}
```

## Motion that fits

Use the scale: 100 to 200 ms for small changes, 300 to 500 ms for larger ones, with the standard easing. Expressive adds springs.

## Accessibility

- Colour roles are designed in contrast pairs: use on-colours with their own background
- Google's own research found Expressive designs were found faster, but dropping familiar patterns hurt usability

## Choose it for

- Android and Google-ecosystem products, utility apps, teams that want a ready system

## Avoid it for

- Brands that must not look like an Android app

## Sources

- <https://en.wikipedia.org/wiki/Material_Design>
- <https://github.com/material-components/material-web>
- <https://design.google/library/expressive-material-design-google-research>

Facts checked on 2026-11-17.
