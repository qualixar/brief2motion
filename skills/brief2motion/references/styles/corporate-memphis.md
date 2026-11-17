# Corporate Memphis

Also called: Alegria, flat illustration.
Family: Retro and themed styles.

The flat tech-company illustration style: friendly figures with long limbs and small heads in bright, flat colours.

Named by Mike Merrill; the best-known version, Alegria, was made for Facebook by the agency Buck in 2017.

## Signature rules

- Flat bright fills, no outlines
- Blobs and simple figures as decoration
- Rounded cards with soft shadows
- A friendly geometric sans

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#f6f8ff` |
| `--surface` | `#ffffff` |
| `--fg` | `#1f2552` |
| `--muted` | `#4a5082` |
| `--accent` | `#4353e8` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `16px` |
| `--shadow` | `0 12px 30px rgb(60 70 160 / .14)` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="corporate-memphis"] {
  --bg: #f6f8ff; --surface: #ffffff; --fg: #1f2552; --muted: #4a5082; --accent: #4353e8; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 16px; --shadow: 0 12px 30px rgb(60 70 160 / .14); --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  .s-card { box-shadow: var(--shadow); position: relative; overflow: hidden; }
  .s-card::after { content: ""; position: absolute; right: -30px; bottom: -40px; width: 130px; height: 130px; border-radius: 46% 54% 60% 40% / 50% 44% 56% 50%; background: #ffb86b; }   /* the blob */
  .s-card > * { position: relative; z-index: 1; }
  .s-btn { border-radius: 999px; transition: transform .2s ease, box-shadow .2s ease; }
  .s-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgb(91 108 255 / .35); }
  .s-btn-2 { background: #e7eaff; color: #1f2552; }
}
```

## Motion that fits

Gentle floating of illustrations, soft slide-ups of 300 to 400 ms.

## Accessibility

- Illustrations of people need alt text that says what they show, or should be marked decorative
- By 2023 the style was widely seen as generic: use it knowingly

## Choose it for

- Internal tools, onboarding, explainers where friendliness matters more than distinction

## Avoid it for

- Brands that need to stand apart

## Sources

- <https://en.wikipedia.org/wiki/Corporate_Memphis>

Facts checked on 2026-11-17.
