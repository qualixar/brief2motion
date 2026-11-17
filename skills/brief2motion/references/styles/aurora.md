# Aurora / mesh gradient

Also called: gradient mesh.
Family: Visual treatments.

Large, soft, blurred fields of colour that blend into each other like northern lights, usually behind plain text.

A descriptive label from the 2020s, not a movement. CSS has no true mesh gradient, so it is built from blurred blobs.

A trend label, not a documented movement.

## Signature rules

- Two to four large radial gradients, heavily blurred
- A dark or very pale base so the colours glow
- Plain type and few elements on top
- A little grain on top hides banding

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#0b1026` |
| `--surface` | `rgb(255 255 255 / .08)` |
| `--fg` | `#ffffff` |
| `--muted` | `#d9defa` |
| `--accent` | `#ffffff` |
| `--accent-fg` | `#0b1026` |
| `--border` | `1px solid rgb(255 255 255 / .2)` |
| `--radius` | `18px` |
| `--shadow` | `none` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `650` |
| `--tracking` | `-0.03em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="aurora"] {
  --bg: #0b1026; --surface: rgb(255 255 255 / .08); --fg: #ffffff; --muted: #d9defa; --accent: #ffffff; --accent-fg: #0b1026; --border: 1px solid rgb(255 255 255 / .2); --radius: 18px; --shadow: none; --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 650; --tracking: -0.03em;
  position: relative; isolation: isolate; overflow: hidden;
  &::before { content: ""; position: absolute; inset: -30%; z-index: -1; background: radial-gradient(40% 40% at 25% 30%, #7c3aed 0, transparent 70%), radial-gradient(35% 45% at 75% 25%, #06b6d4 0, transparent 70%), radial-gradient(45% 40% at 60% 80%, #ec4899 0, transparent 70%); filter: blur(40px); }
  @media (prefers-reduced-motion: no-preference) { &::before { animation: b2m-aurora 18s ease-in-out infinite alternate; } }

  .s-card { -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
  .s-btn-2 { background: rgb(255 255 255 / .12); color: #fff; border: 1px solid rgb(255 255 255 / .35); }
  .s-field input { background: rgb(11 16 38 / .6); color: #fff; border-color: rgb(255 255 255 / .4); }
  .s-field input::placeholder { color: #d9defa; }
}
@keyframes b2m-aurora { to { transform: translate3d(6%, -4%, 0) rotate(8deg) scale(1.1); } }
```

## Motion that fits

Very slow drift: 15 to 30 seconds per cycle, transform only. It should be barely noticeable.

## Accessibility

- Contrast changes as the colours move: test text against the brightest blob
- Stop the drift for reduced motion
- Animate transform, never the blur radius or gradient stops, on large areas

## Choose it for

- AI and developer products, landing page heroes, anything abstract with no photo to show

## Avoid it for

- Pages where a product picture would say more

## Sources

- <https://developer.mozilla.org/en-US/docs/Web/CSS/@property>
- <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix>

Facts checked on 2026-11-17.
