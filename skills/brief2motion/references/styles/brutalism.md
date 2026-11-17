# Web brutalism

Also called: brutalist web design.
Family: Surface styles.

The unstyled look on purpose: default fonts, visible structure, blue links, no decoration. A statement against polish.

A mid-2010s reaction to the light, optimistic mainstream web, collected at brutalistwebsites.com.

## Signature rules

- Browser defaults kept: serif text, underlined blue links
- No rounded corners, no shadows, no gradients
- Structure shown, not hidden: borders, tables, raw lists

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#ffffff` |
| `--surface` | `#ffffff` |
| `--fg` | `#000000` |
| `--muted` | `#000000` |
| `--accent` | `#0000ee` |
| `--accent-fg` | `#ffffff` |
| `--border` | `1px solid #000000` |
| `--radius` | `0px` |
| `--shadow` | `none` |
| `--font-display` | `Times, "Times New Roman", serif` |
| `--font-text` | `Times, "Times New Roman", serif` |
| `--weight-display` | `700` |
| `--tracking` | `0` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="brutalism"] {
  --bg: #ffffff; --surface: #ffffff; --fg: #000000; --muted: #000000; --accent: #0000ee; --accent-fg: #ffffff; --border: 1px solid #000000; --radius: 0px; --shadow: none; --font-display: Times, "Times New Roman", serif; --font-text: Times, "Times New Roman", serif; --weight-display: 700; --tracking: 0;
  .s-title { text-transform: none; }
  .s-nav { border-width: 0 0 1px; padding-inline: 0; }
  .s-links a { color: #0000ee; text-decoration: underline; }
  .s-btn { font-family: Courier, monospace; border-radius: 0; }
  .s-btn:hover { background: #000; color: #fff; }
  .s-card { border-style: dashed; }
}
```

## Motion that fits

None, or an instant state change. Motion would contradict the point.

## Accessibility

- It is naturally readable when the defaults are kept
- Do not remove focus outlines to look raw

## Choose it for

- Art, architecture and design studios, manifestos, personal sites

## Avoid it for

- Anything that has to sell or convert

## Sources

- <https://brutalistwebsites.com/>
- <https://www.nngroup.com/articles/neobrutalism/>

Facts checked on 2026-11-17.
