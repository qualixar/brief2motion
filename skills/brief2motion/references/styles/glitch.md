# Glitch

Family: Retro and themed styles.

Deliberate digital damage: colour channels that split apart, slices that jump sideways, torn scan lines.

From glitch art and 1990s net.art, where broken data became the image.

## Signature rules

- Red and cyan copies of the text offset by a pixel or two
- Horizontal slices displaced with clip-path
- Stepped timing, not smooth easing
- Used on one element, not the whole page

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#0b0b0f` |
| `--surface` | `#15151c` |
| `--fg` | `#f5f5f7` |
| `--muted` | `#b9b9c6` |
| `--accent` | `#ff2d55` |
| `--accent-fg` | `#0b0b0f` |
| `--border` | `1px solid #f5f5f7` |
| `--radius` | `0px` |
| `--shadow` | `none` |
| `--font-display` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--font-text` | `ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace` |
| `--weight-display` | `900` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="glitch"] {
  --bg: #0b0b0f; --surface: #15151c; --fg: #f5f5f7; --muted: #b9b9c6; --accent: #ff2d55; --accent-fg: #0b0b0f; --border: 1px solid #f5f5f7; --radius: 0px; --shadow: none; --font-display: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --font-text: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace; --weight-display: 900; --tracking: -0.02em;
  .s-title { position: relative; text-transform: uppercase; text-shadow: 2px 0 #00fff0, -2px 0 #ff003c; }
  .s-btn { transition: transform .1s; }
  .s-btn-2 { background: none; color: #f5f5f7; border: 1px solid #f5f5f7; }
  .s-field input { background: #0b0b0f; color: #f5f5f7; }
  .s-nav { border-width: 0 0 1px; border-radius: 0; padding-inline: 0; }
  /* the glitch is a short burst when you point at it, never a loop, and never for reduced motion */
  @media (prefers-reduced-motion: no-preference) {
    .s-title:hover, .s-btn:hover { animation: b2m-glitch .35s steps(2, jump-none) 1; }
  
  }
}
@keyframes b2m-glitch { 0% { transform: translateX(0); clip-path: inset(0); } 25% { transform: translateX(-5px); clip-path: inset(12% 0 55% 0); } 50% { transform: translateX(4px); clip-path: inset(60% 0 8% 0); } 75% { transform: translateX(-2px); clip-path: inset(30% 0 30% 0); } 100% { transform: translateX(0); clip-path: inset(0); } }
```

## Motion that fits

Short bursts of 200 to 400 ms with stepped easing, then stillness. Triggered by hover, entry or an error state.

## Accessibility

- Keep bursts rare and under three flashes a second (WCAG 2.3.1)
- Never glitch body text or controls people are trying to use
- Turn it off for reduced motion

## Choose it for

- Music, games, art, error pages, launch teasers

## Avoid it for

- Reading-heavy pages, anxious contexts such as payments

## Sources

- <https://en.wikipedia.org/wiki/Glitch_art>

Facts checked on 2026-11-17.
