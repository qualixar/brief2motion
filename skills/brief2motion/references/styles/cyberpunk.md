# Cyberpunk / neon

Family: Retro and themed styles.

A dark city at night: black panels, acid yellow and cyan neon, clipped corners, warning labels and terminal type.

From 1980s science fiction; Blade Runner (1982) set the visual template.

## Signature rules

- Near-black background with one or two neon colours
- Cut corners, thin lines, hazard stripes, small technical labels
- Monospace or condensed type
- Glow made from stacked shadows

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#07080c` |
| `--surface` | `#0e1119` |
| `--fg` | `#e8f6ff` |
| `--muted` | `#9fb6c8` |
| `--accent` | `#f9f002` |
| `--accent-fg` | `#07080c` |
| `--border` | `1px solid #00e5ff` |
| `--radius` | `0px` |
| `--shadow` | `0 0 0 1px rgb(0 229 255 / .4), 0 0 24px rgb(0 229 255 / .25)` |
| `--font-display` | `ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace` |
| `--font-text` | `ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace` |
| `--weight-display` | `700` |
| `--tracking` | `0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="cyberpunk"] {
  --bg: #07080c; --surface: #0e1119; --fg: #e8f6ff; --muted: #9fb6c8; --accent: #f9f002; --accent-fg: #07080c; --border: 1px solid #00e5ff; --radius: 0px; --shadow: 0 0 0 1px rgb(0 229 255 / .4), 0 0 24px rgb(0 229 255 / .25); --font-display: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace; --font-text: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace; --weight-display: 700; --tracking: 0.02em;
  .s-title { text-transform: uppercase; text-shadow: 0 0 12px rgb(0 229 255 / .7); }
  .s-card { clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px)); background: linear-gradient(135deg, #0e1119, #131a26); border: 0; box-shadow: none; outline: 0; }
  .s-stat { color: #f9f002; text-shadow: 0 0 14px rgb(249 240 2 / .6); }
  .s-btn { text-transform: uppercase; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); transition: background-color .12s, color .12s; }
  .s-btn:hover { background: #00e5ff; }
  .s-btn-2 { background: none; color: #00e5ff; clip-path: none; border: 1px solid #00e5ff; box-shadow: var(--shadow); }
  .s-field input { background: #07080c; color: #e8f6ff; border-color: #00e5ff; }
  .s-nav { border-width: 0 0 1px; border-radius: 0; padding-inline: 0; }
}
```

## Motion that fits

Sharp and electric: flicker on entry (once), scan lines, quick clipped wipes of 100 to 200 ms.

## Accessibility

- Flashing must stay under three times a second (WCAG 2.3.1) and loops need a stop
- Glow is not contrast; thin neon text fails
- Default dark is a choice: say why in the brief

## Choose it for

- Games, security and developer tools, music, hardware

## Avoid it for

- General audiences reading at length

## Sources

- <https://en.wikipedia.org/wiki/Cyberpunk>
- <https://www.nngroup.com/articles/dark-mode/>

Facts checked on 2026-11-17.
