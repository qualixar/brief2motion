# Dark-mode-first

Also called: dark UI.
Family: Visual treatments.

The dark theme is the designed default: near-black surfaces in a few elevation steps, soft white text, one bright accent.

A practice, not a movement. Research from Nielsen Norman Group says light mode reads better for most people, so a dark default needs a reason.

## Signature rules

- Background near black, not pure black; text off-white, not pure white
- Depth from lighter surfaces, not from shadows
- Accent colours less saturated than on white
- Ship a light theme too, switched by prefers-color-scheme

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#0f1115` |
| `--surface` | `#171a21` |
| `--fg` | `#e7e9ee` |
| `--muted` | `#a6adbb` |
| `--accent` | `#7cc4ff` |
| `--accent-fg` | `#0b1a2b` |
| `--border` | `1px solid #262b36` |
| `--radius` | `10px` |
| `--shadow` | `none` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `650` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="dark-first"] {
  --bg: #0f1115; --surface: #171a21; --fg: #e7e9ee; --muted: #a6adbb; --accent: #7cc4ff; --accent-fg: #0b1a2b; --border: 1px solid #262b36; --radius: 10px; --shadow: none; --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 650; --tracking: -0.02em;
  color-scheme: dark;
  .s-card { background: #171a21; }
  .s-btn { transition: background-color .15s; }
  .s-btn:hover { background: #a5d7ff; }
  .s-btn-2 { background: #1f242e; color: #e7e9ee; border: 1px solid #323846; }
  .s-field input { background: #0f1115; color: #e7e9ee; border-color: #49505f; }
  .s-stat { color: #7cc4ff; }
}
```

## Motion that fits

The same as the light theme. Glows and gradients read stronger on dark, so use less.

## Accessibility

- Light mode performs better for most people in most conditions: offer both and respect the system setting
- Pure white text on pure black causes halation for some readers
- Borders need 3:1 against the surface to be seen

## Choose it for

- Developer tools, media and video, games, dashboards used in dim rooms

## Avoid it for

- Long-form reading for a general audience, unless a light theme is one click away

## Sources

- <https://www.nngroup.com/articles/dark-mode/>

Facts checked on 2026-11-17.
