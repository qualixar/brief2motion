# Glassmorphism

Family: Surface styles.

Frosted panels: a see-through fill, a blur of whatever is behind, a thin light edge and a soft shadow, floating over a colourful background.

Named and popularised around 2020 to 2021; assessed by Nielsen Norman Group in 2024.

## Signature rules

- Fill about 15 to 40% opaque; a dark tint keeps white text readable when a bright shape drifts behind it
- backdrop-filter: blur of about 10 to 25 px (NN/g shows 25 px keeping edges readable; 100 px turns the background to mush)
- A 1 px light border and a soft drop shadow to lift the panel
- Needs something colourful behind it, or there is nothing to frost

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#3b2a8c` |
| `--surface` | `rgb(34 20 110 / .42)` |
| `--fg` | `#ffffff` |
| `--muted` | `#e9e6ff` |
| `--accent` | `#ffffff` |
| `--accent-fg` | `#2a1d6b` |
| `--border` | `1px solid rgb(255 255 255 / .45)` |
| `--radius` | `20px` |
| `--shadow` | `0 12px 40px rgb(10 5 50 / .35)` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="glassmorphism"] {
  --bg: #3b2a8c; --surface: rgb(34 20 110 / .42); --fg: #ffffff; --muted: #e9e6ff; --accent: #ffffff; --accent-fg: #2a1d6b; --border: 1px solid rgb(255 255 255 / .45); --radius: 20px; --shadow: 0 12px 40px rgb(10 5 50 / .35); --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  /* the colour sits behind the glass card, away from the plain text on the left: text over a bright blob is where this style fails */
  background: radial-gradient(circle at 78% 22%, #ff7ac3 0 14%, transparent 36%), radial-gradient(circle at 92% 82%, #33c9ff 0 16%, transparent 40%), radial-gradient(circle at 58% 95%, #8b5cf6 0 10%, transparent 30%), linear-gradient(135deg, #2c1f73, #1b1464);
  .s-card, .s-nav, .s-btn-2 { -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3); }
  .s-card { transition: transform .3s ease; }
  .s-card:hover { transform: translateY(-4px); }
  .s-field input { background: rgb(20 10 70 / .45); color: #fff; border-color: rgb(255 255 255 / .5); }
  .s-field input::placeholder { color: #e9e6ff; }
  /* visitors who ask for less transparency, or a browser without backdrop-filter, get a solid panel */
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) { .s-card, .s-nav, .s-btn-2 { background: #2a1d6b; -webkit-backdrop-filter: none; backdrop-filter: none; } }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .s-card, .s-nav, .s-btn-2 { background: #2a1d6b; } }
}
```

## Motion that fits

Slow drift of the shapes behind the glass, and a small lift on hover. Keep the blur radius fixed: animating blur is expensive.

## Accessibility

- Text over a see-through panel has uneven contrast: test against the lightest and darkest thing that can sit behind it
- Give a solid fallback for prefers-reduced-transparency (experimental) and prefers-contrast: more
- An ancestor with opacity, filter, mask or clip-path limits what the blur can see

## Choose it for

- Navigation bars, overlays and cards over pictures or gradients

## Avoid it for

- Long reading text, data tables, low-end devices

## Sources

- <https://www.nngroup.com/articles/glassmorphism/>
- <https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter>

Facts checked on 2026-11-17.
