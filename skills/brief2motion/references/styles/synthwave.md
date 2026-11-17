# Synthwave / retrowave

Also called: retrowave, outrun.
Family: Retro and themed styles.

A neon 1980s: a magenta sun, a perspective grid running to the horizon, chrome type, purple night sky.

A music and visual genre from the mid-2000s built on 1980s film and game imagery; also called retrowave or outrun.

## Signature rules

- Magenta, cyan and orange on deep purple
- A grid floor in perspective and a striped sun
- Chrome or gradient display type, italic and uppercase
- Glow on everything that is lit

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#150a33` |
| `--surface` | `rgb(30 12 70 / .85)` |
| `--fg` | `#ffe9ff` |
| `--muted` | `#d7c4ff` |
| `--accent` | `#ff2bd6` |
| `--accent-fg` | `#150a33` |
| `--border` | `1px solid #ff2bd6` |
| `--radius` | `6px` |
| `--shadow` | `0 0 0 1px #ff2bd6, 0 0 22px rgb(255 43 214 / .55)` |
| `--font-display` | `Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `800` |
| `--tracking` | `0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="synthwave"] {
  --bg: #150a33; --surface: rgb(30 12 70 / .85); --fg: #ffe9ff; --muted: #d7c4ff; --accent: #ff2bd6; --accent-fg: #150a33; --border: 1px solid #ff2bd6; --radius: 6px; --shadow: 0 0 0 1px #ff2bd6, 0 0 22px rgb(255 43 214 / .55); --font-display: Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 800; --tracking: 0.02em;
  background: linear-gradient(180deg, #150a33 0 52%, transparent 52%), repeating-linear-gradient(90deg, rgb(0 240 255 / .26) 0 1px, transparent 1px 44px), repeating-linear-gradient(0deg, rgb(0 240 255 / .26) 0 1px, transparent 1px 26px), linear-gradient(180deg, #2a0b52, #3d0f6b);
  .s-title { text-transform: uppercase; font-style: italic; background: linear-gradient(180deg, #fff36b, #ff8a3d 50%, #ff2bd6); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 10px rgb(255 43 214 / .6)); }
  .s-card { box-shadow: var(--shadow); }
  .s-btn { text-transform: uppercase; letter-spacing: .08em; box-shadow: 0 0 18px rgb(255 43 214 / .7); transition: box-shadow .2s, transform .2s; }
  .s-btn:hover { box-shadow: 0 0 30px rgb(255 43 214 / 1); transform: translateY(-2px); }
  .s-btn-2 { background: none; color: #6ff6ff; border: 1px solid #00f0ff; box-shadow: 0 0 14px rgb(0 240 255 / .5); }
  .s-field input { background: #0d0626; color: #ffe9ff; border-color: #00f0ff; }
}
```

## Motion that fits

The grid scrolls towards the viewer, glows pulse slowly, titles slide in with a streak.

## Accessibility

- Glow does not add contrast: the text colour itself has to pass
- A moving grid is a vestibular trigger: stop it for reduced motion
- Thin neon text is hard to read

## Choose it for

- Games, music, events, retro-tech products

## Avoid it for

- Calm or corporate brands

## Sources

- <https://en.wikipedia.org/wiki/Synthwave>

Facts checked on 2026-11-17.
