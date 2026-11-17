# Neubrutalism

Also called: neobrutalism, neo-brutalism.
Family: Surface styles.

Thick black outlines, hard offset shadows with no blur, and two or three loud flat colours. Raw like brutalism, but tidy and friendly.

An evolution of web brutalism that mixes its rawness with 1990s graphic design; described by Nielsen Norman Group in 2025.

## Signature rules

- Borders 2 to 4 px, solid, usually black
- Shadow is one solid colour, offset about 4 px, blur 0
- Two or three saturated fills on a pale ground
- Headlines about twice the body size, neutral sans for body text
- Padding 24 to 32 px so dense shapes can breathe

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#fff6d6` |
| `--surface` | `#ffffff` |
| `--fg` | `#111111` |
| `--muted` | `#3a3a3a` |
| `--accent` | `#ff5c8a` |
| `--accent-fg` | `#111111` |
| `--border` | `3px solid #111111` |
| `--radius` | `10px` |
| `--shadow` | `5px 5px 0 #111111` |
| `--font-display` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--font-text` | `"Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif` |
| `--weight-display` | `800` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="neubrutalism"] {
  --bg: #fff6d6; --surface: #ffffff; --fg: #111111; --muted: #3a3a3a; --accent: #ff5c8a; --accent-fg: #111111; --border: 3px solid #111111; --radius: 10px; --shadow: 5px 5px 0 #111111; --font-display: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --font-text: "Helvetica Neue", "Arial Nova", Arial, system-ui, sans-serif; --weight-display: 800; --tracking: -0.02em;
  .s-card, .s-btn, .s-field input, .s-nav { box-shadow: var(--shadow); }
  .s-btn { transition: transform .12s ease, box-shadow .12s ease; }
  .s-btn:hover { transform: translate(2px, 2px); box-shadow: 3px 3px 0 #111; }
  .s-btn:active { transform: translate(5px, 5px); box-shadow: 0 0 0 #111; }   /* the button presses into its own shadow */
  .s-btn-2 { background: #7df9c0; }
  .s-stat { background: #ffe14d; padding: 0 .2em; border: var(--border); display: inline-block; transform: rotate(-2deg); }
}
```

## Motion that fits

Fast and physical: a button moves by its shadow offset on hover and lands on press (100 to 200 ms). Marquee strips and stickers tilted a degree or two suit it. No soft fades.

## Accessibility

- Loud colour pairs still have to pass contrast: yellow with cyan does not
- Condensed or decorative faces hurt paragraphs; keep body text plain
- Every control needs its border, or it stops looking pressable

## Choose it for

- Creator tools, indie products, developer tools, events, consumer brands that want a voice

## Avoid it for

- Banking, healthcare, dense enterprise screens

## Sources

- <https://www.nngroup.com/articles/neobrutalism/>
- <https://github.com/ekmas/neobrutalism-components>

Facts checked on 2026-11-17.
