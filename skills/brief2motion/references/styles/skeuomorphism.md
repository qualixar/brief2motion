# Skeuomorphism

Also called: realism.
Family: Surface styles.

Controls drawn like the physical things they stand for: metal knobs, leather, paper, switches with real lighting.

Common in interfaces since the 1980s; Apple moved away from it with iOS 7 in 2013.

## Signature rules

- Gradients that imitate a light from above
- Bevels: a light top edge and a dark bottom edge
- Material textures and real-world metaphors
- Pressed states that actually move down

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#2a2622` |
| `--surface` | `#3a342e` |
| `--fg` | `#f3ead9` |
| `--muted` | `#cbbfa8` |
| `--accent` | `#e0a23b` |
| `--accent-fg` | `#2a1c05` |
| `--border` | `1px solid #14110e` |
| `--radius` | `10px` |
| `--shadow` | `0 10px 22px rgb(0 0 0 / .55), inset 0 1px 0 rgb(255 255 255 / .12)` |
| `--font-display` | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="skeuomorphism"] {
  --bg: #2a2622; --surface: #3a342e; --fg: #f3ead9; --muted: #cbbfa8; --accent: #e0a23b; --accent-fg: #2a1c05; --border: 1px solid #14110e; --radius: 10px; --shadow: 0 10px 22px rgb(0 0 0 / .55), inset 0 1px 0 rgb(255 255 255 / .12); --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  background: linear-gradient(180deg, #2f2a25, #211d19);
  .s-card { background: linear-gradient(180deg, #45403a, #302b26); box-shadow: var(--shadow); }
  .s-btn { background: linear-gradient(180deg, #f4c05a, #c9871f); border: 1px solid #7a4f0c; box-shadow: 0 3px 0 #7a4f0c, 0 8px 14px rgb(0 0 0 / .5), inset 0 1px 0 rgb(255 255 255 / .6); text-shadow: 0 1px 0 rgb(255 255 255 / .35); transition: transform .08s, box-shadow .08s; }
  .s-btn:active { transform: translateY(3px); box-shadow: 0 0 0 #7a4f0c, 0 3px 6px rgb(0 0 0 / .5), inset 0 2px 4px rgb(0 0 0 / .3); }
  .s-btn-2 { background: linear-gradient(180deg, #5a544c, #3b3630); color: #f3ead9; border-color: #14110e; box-shadow: 0 3px 0 #14110e, 0 8px 14px rgb(0 0 0 / .5), inset 0 1px 0 rgb(255 255 255 / .18); text-shadow: none; }
  .s-field input { background: #1b1815; color: #f3ead9; box-shadow: inset 0 2px 5px rgb(0 0 0 / .7); border-color: #0c0a08; }
  .s-stat { color: #ffcf70; text-shadow: 0 0 12px rgb(255 190 80 / .55); font-family: ui-monospace, Menlo, monospace; }
}
```

## Motion that fits

Mechanical: a key travels 2 to 3 px and returns, a switch slides, a dial turns. Short and with no bounce unless the object has one.

## Accessibility

- The metaphor gives strong affordance, which flat design lost
- Texture behind text lowers contrast: check it
- Ornament must not hide state

## Choose it for

- Audio tools and instruments, games, products where a physical metaphor teaches the use

## Avoid it for

- Content sites, large design systems that must scale

## Sources

- <https://en.wikipedia.org/wiki/Skeuomorph>
- <https://en.wikipedia.org/wiki/Flat_design>

Facts checked on 2026-11-17.
