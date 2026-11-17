# Frutiger Aero

Family: Retro and themed styles.

Glossy optimism from the Windows Vista era: sky blues and grass greens, water drops, bokeh, glassy rounded buttons.

Roughly 2004 to 2013. Named in 2018 after the Frutiger typeface and Windows Aero.

## Signature rules

- Bright blue, green and white
- Gloss: a hard highlight across the top half of buttons
- Nature imagery, water and bokeh circles
- Translucent rounded panels

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#bfe9ff` |
| `--surface` | `rgb(255 255 255 / .75)` |
| `--fg` | `#07304f` |
| `--muted` | `#1b4d73` |
| `--accent` | `#1e8fe0` |
| `--accent-fg` | `#ffffff` |
| `--border` | `1px solid rgb(255 255 255 / .9)` |
| `--radius` | `14px` |
| `--shadow` | `0 8px 20px rgb(10 80 140 / .3)` |
| `--font-display` | `"Frutiger", "Segoe UI", "Myriad Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `"Segoe UI", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `600` |
| `--tracking` | `0` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="frutiger-aero"] {
  --bg: #bfe9ff; --surface: rgb(255 255 255 / .75); --fg: #07304f; --muted: #1b4d73; --accent: #1e8fe0; --accent-fg: #ffffff; --border: 1px solid rgb(255 255 255 / .9); --radius: 14px; --shadow: 0 8px 20px rgb(10 80 140 / .3); --font-display: "Frutiger", "Segoe UI", "Myriad Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: "Segoe UI", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 600; --tracking: 0;
  background: radial-gradient(circle at 20% 110%, #9be15d 0 30%, transparent 55%), radial-gradient(circle at 75% 15%, rgb(255 255 255 / .9) 0 8%, transparent 26%), linear-gradient(180deg, #4fb7ff, #bfe9ff 60%, #e8fbff);
  .s-card, .s-nav { box-shadow: var(--shadow); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
  .s-btn { border-radius: 999px; border: 1px solid #0d5fa3; background: linear-gradient(180deg, #7fd0ff 0%, #2f9be8 48%, #1178cf 52%, #3aa7f0 100%); box-shadow: inset 0 1px 0 rgb(255 255 255 / .8), 0 3px 8px rgb(10 80 140 / .4); text-shadow: 0 1px 1px rgb(0 40 90 / .6); transition: filter .2s; }
  .s-btn:hover { filter: brightness(1.1); }
  .s-btn-2 { background: linear-gradient(180deg, #d9ffa8 0%, #8fdc3f 48%, #63bf16 52%, #9be15d 100%); color: #12380a; border-color: #3f8a0c; text-shadow: 0 1px 0 rgb(255 255 255 / .6); }
}
```

## Motion that fits

Smooth and glossy: gentle glows, bubbles rising, soft fades of 200 to 400 ms.

## Accessibility

- Text over sky gradients and bokeh needs a panel behind it
- Gloss highlights can cut contrast across button labels

## Choose it for

- Nostalgia projects, climate and wellness brands that want an optimistic tone

## Avoid it for

- Anything that must look current and neutral

## Sources

- <https://en.wikipedia.org/wiki/Frutiger_Aero>

Facts checked on 2026-11-17.
