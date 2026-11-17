# Claymorphism

Family: Surface styles.

Inflated, toy-like shapes: very round corners, two inner shadows that model the form, and one big soft coloured shadow underneath.

Named by designer Michal Malewicz in 2021 as a friendlier successor to neumorphism.

## Signature rules

- Corner radius about 30 px or more
- Two inner shadows (light on top, darker below) plus one large outer shadow tinted with the shape colour
- Strong, cheerful accent colours on a pale ground

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#f1e9ff` |
| `--surface` | `#ffffff` |
| `--fg` | `#32215c` |
| `--muted` | `#5b4a85` |
| `--accent` | `#7c3aed` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `32px` |
| `--shadow` | `0 30px 50px -10px rgb(139 92 246 / .45), inset 0 -8px 16px rgb(139 92 246 / .22), inset 0 8px 14px rgb(255 255 255 / .9)` |
| `--font-display` | `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif` |
| `--font-text` | `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif` |
| `--weight-display` | `800` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="claymorphism"] {
  --bg: #f1e9ff; --surface: #ffffff; --fg: #32215c; --muted: #5b4a85; --accent: #7c3aed; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 32px; --shadow: 0 30px 50px -10px rgb(139 92 246 / .45), inset 0 -8px 16px rgb(139 92 246 / .22), inset 0 8px 14px rgb(255 255 255 / .9); --font-display: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif; --font-text: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif; --weight-display: 800; --tracking: -0.02em;
  .s-card { box-shadow: var(--shadow); }
  .s-btn { border-radius: 999px; box-shadow: 0 14px 24px -6px rgb(109 62 226 / .6), inset 0 -6px 10px rgb(60 20 160 / .45), inset 0 6px 10px rgb(255 255 255 / .45); transition: transform .35s cubic-bezier(.3, 1.6, .4, 1); }
  .s-btn:hover { transform: scale(1.06, .97); }      /* squash */
  .s-btn:active { transform: scale(.95, 1.04); }     /* stretch */
  .s-btn-2 { background: #ffd166; color: #4a3200; box-shadow: 0 14px 24px -6px rgb(240 170 20 / .6), inset 0 -6px 10px rgb(190 120 0 / .4), inset 0 6px 10px rgb(255 255 255 / .6); }
  .s-nav { border-radius: 999px; box-shadow: 0 10px 20px -8px rgb(139 92 246 / .4), inset 0 -4px 8px rgb(139 92 246 / .15); }
}
```

## Motion that fits

Squash and stretch on a spring: a button flattens slightly on hover and bounces on press.

## Accessibility

- Needs strong accents and real contrast to avoid the neumorphism trap
- In dark mode the fill cannot be black or the shadows vanish

## Choose it for

- Children and education products, playful consumer apps, onboarding screens

## Avoid it for

- Finance, legal, anything that should feel sober

## Sources

- <https://hype4.academy/articles/design/claymorphism-in-user-interfaces>
- <https://hype4.academy/articles/coding/how-to-create-claymorphism-using-css>

Facts checked on 2026-11-17.
