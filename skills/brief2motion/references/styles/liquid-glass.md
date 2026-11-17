# Liquid Glass-inspired

Also called: Apple Liquid Glass.
Family: Surface styles.

Glass that behaves like a lens: controls float in a thin clear layer above the content, pick up its colour, and have a bright rim. On the web this is an imitation, not an Apple API.

Apple introduced Liquid Glass in June 2025 for iOS 26 and macOS Tahoe 26. Its guidelines keep it for controls and navigation, never the content layer.

## Signature rules

- Glass only on the floating layer: bars, buttons, sheets
- Clearer than frosted glass: light blur, strong saturation, a bright top rim and an inner glow
- Pill and capsule shapes
- Over bright content, add a dark dimming layer (Apple suggests 35%)

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#0f2a4a` |
| `--surface` | `rgb(255 255 255 / .12)` |
| `--fg` | `#ffffff` |
| `--muted` | `#dfeaf7` |
| `--accent` | `#ffffff` |
| `--accent-fg` | `#0f2a4a` |
| `--border` | `1px solid rgb(255 255 255 / .55)` |
| `--radius` | `28px` |
| `--shadow` | `0 10px 30px rgb(0 10 30 / .35), inset 0 1px 0 rgb(255 255 255 / .7), inset 0 -8px 16px rgb(255 255 255 / .08)` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `600` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="liquid-glass"] {
  --bg: #0f2a4a; --surface: rgb(255 255 255 / .12); --fg: #ffffff; --muted: #dfeaf7; --accent: #ffffff; --accent-fg: #0f2a4a; --border: 1px solid rgb(255 255 255 / .55); --radius: 28px; --shadow: 0 10px 30px rgb(0 10 30 / .35), inset 0 1px 0 rgb(255 255 255 / .7), inset 0 -8px 16px rgb(255 255 255 / .08); --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 600; --tracking: -0.02em;
  background: radial-gradient(circle at 12% 4%, #ffb347 0 10%, transparent 30%), radial-gradient(circle at 85% 6%, #4de1ff 0 12%, transparent 34%), radial-gradient(circle at 30% 100%, #ff5d8f 0 12%, transparent 34%), #0f2a4a;
  .s-nav, .s-btn, .s-btn-2 { -webkit-backdrop-filter: blur(8px) saturate(1.8) brightness(1.08); backdrop-filter: blur(8px) saturate(1.8) brightness(1.08); border-radius: 999px; box-shadow: var(--shadow); }
  /* a dark tint inside the glass, as Apple suggests over bright content, keeps the labels readable */
  .s-nav { background: rgb(15 42 74 / .4); }
  .s-btn { background: rgb(15 42 74 / .45); color: #fff; transition: transform .25s cubic-bezier(.2, 1.4, .4, 1); }
  .s-btn-2 { background: rgb(15 42 74 / .25); }
  .s-btn:hover { transform: scale(1.05); }
  .s-btn:active { transform: scale(.96); }
  /* the content card is NOT glass: Apple's guidance keeps glass out of the content layer */
  .s-card { background: #f4f7fb; color: #0f2a4a; border: 0; box-shadow: 0 10px 30px rgb(0 10 30 / .3); }
  .s-card .s-note, .s-card .s-label { color: #3b5573; }
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) { .s-nav, .s-btn, .s-btn-2 { background: #17395f; -webkit-backdrop-filter: none; backdrop-filter: none; } }
}
```

## Motion that fits

Springy scale on press, and controls that merge or split. Keep it to the control layer.

## Accessibility

- Legibility was the main complaint about the real thing: check text on glass against busy content
- Honour reduced transparency and increased contrast with a solid fill
- Do not call a web imitation "Apple Liquid Glass"

## Choose it for

- Media and photo products, Apple-platform companions, floating toolbars

## Avoid it for

- Text-heavy pages, anything where the glass would sit on the content itself

## Sources

- <https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/>
- <https://developer.apple.com/design/human-interface-guidelines/materials>

Facts checked on 2026-11-17.
