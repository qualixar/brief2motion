# Minimalism

Family: Layout and type styles.

As few elements as the job allows: one idea per screen, wide margins, one accent, and nothing ornamental.

From the 1960s art movement; "less is more" (Mies van der Rohe) and "less but better" (Dieter Rams).

## Signature rules

- One accent colour or none
- Large margins; white space does the grouping
- One or two type sizes above body
- Remove an element before adding one

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#fafaf8` |
| `--surface` | `#fafaf8` |
| `--fg` | `#161616` |
| `--muted` | `#5c5c5c` |
| `--accent` | `#161616` |
| `--accent-fg` | `#fafaf8` |
| `--border` | `0 solid transparent` |
| `--radius` | `2px` |
| `--shadow` | `none` |
| `--font-display` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `500` |
| `--tracking` | `-0.03em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="minimalism"] {
  --bg: #fafaf8; --surface: #fafaf8; --fg: #161616; --muted: #5c5c5c; --accent: #161616; --accent-fg: #fafaf8; --border: 0 solid transparent; --radius: 2px; --shadow: none; --font-display: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 500; --tracking: -0.03em;
  .s-title { font-weight: 500; }
  .s-nav { padding-inline: 0; }
  .s-card { border-top: 1px solid #d9d9d4; border-radius: 0; padding-inline: 0; }
  .s-btn { transition: opacity .2s; }
  .s-btn:hover { opacity: .8; }
  .s-btn-2 { background: none; color: #161616; text-decoration: underline; text-underline-offset: 5px; padding-inline: 4px; }
  .s-field input { border-width: 0 0 1px; border-radius: 0; background: none; padding-inline: 0; }
}
```

## Motion that fits

Almost none: opacity and position changes of 150 to 300 ms that explain a change of state.

## Accessibility

- Do not remove affordances along with decoration: links and fields still need to look like links and fields
- Thin grey text on white fails contrast quickly

## Choose it for

- Premium products, portfolios, focused tools, any brief that says calm

## Avoid it for

- Products that must show a lot at once

## Sources

- <https://en.wikipedia.org/wiki/Minimalism>
- <https://www.nngroup.com/articles/homepage-design-principles/>

Facts checked on 2026-11-17.
