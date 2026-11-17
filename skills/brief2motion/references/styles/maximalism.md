# Maximalism

Family: Layout and type styles.

More is more: clashing colour, layered pattern, several typefaces, everything large and overlapping, held together by repetition.

A long-standing reaction to minimalism across art, music and interiors; on the web it shows up as dense, collaged pages.

Documented as an aesthetic in art and design; no single source defines it for the web.

## Signature rules

- Several saturated colours at once, plus pattern
- Mixed typefaces and sizes on purpose
- Overlap, rotation and collage
- One repeated device (a border, a colour) to keep it from falling apart

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#ff4f1a` |
| `--surface` | `#ffe94a` |
| `--fg` | `#1a0f3c` |
| `--muted` | `#1a0f3c` |
| `--accent` | `#1a0f3c` |
| `--accent-fg` | `#ffe94a` |
| `--border` | `3px solid #1a0f3c` |
| `--radius` | `0px` |
| `--shadow` | `8px 8px 0 #0e7a4d` |
| `--font-display` | `Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif` |
| `--font-text` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.03em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="maximalism"] {
  --bg: #ff4f1a; --surface: #ffe94a; --fg: #1a0f3c; --muted: #1a0f3c; --accent: #1a0f3c; --accent-fg: #ffe94a; --border: 3px solid #1a0f3c; --radius: 0px; --shadow: 8px 8px 0 #0e7a4d; --font-display: Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif; --font-text: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --weight-display: 700; --tracking: -0.03em;
  background: repeating-linear-gradient(45deg, #ff4f1a 0 22px, #ff6b3d 22px 44px);
  .s-title { font-style: italic; font-size: 2.6em; background: #ffe94a; display: inline; box-decoration-break: clone; -webkit-box-decoration-break: clone; padding: 0 .15em; }
  .s-text { background: #fff; padding: 10px 12px; border: var(--border); }
  .s-card { transform: rotate(2deg); box-shadow: var(--shadow); }
  .s-nav { background: #ff9ad5; box-shadow: 5px 5px 0 #1a0f3c; }
  .s-btn { box-shadow: 4px 4px 0 #0e7a4d; transition: transform .15s; }
  .s-btn:hover { transform: rotate(-3deg) scale(1.05); }
  .s-btn-2 { background: #ff9ad5; color: #1a0f3c; }
}
```

## Motion that fits

Busy but ordered: things tilt, bounce and trade places; marquees run. Pick one thing to move most.

## Accessibility

- Text needs its own solid backing when the page behind is patterned
- Order in the markup still has to make sense to a screen reader
- Loops need a pause control or reduced-motion handling

## Choose it for

- Fashion, music, festivals, youth brands, campaigns

## Avoid it for

- Tools, checkouts, anything people use while stressed

## Sources

- <https://en.wikipedia.org/wiki/Maximalism>

Facts checked on 2026-11-17.
