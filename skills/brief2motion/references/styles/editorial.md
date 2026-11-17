# Editorial / magazine

Family: Layout and type styles.

A printed page on screen: a serif headline, a standfirst, columns, pull quotes, captions and rules. Typography carries the page.

Carried over from print magazines and newspapers; on the web it sits close to Swiss style.

A print tradition; no single source defines it as a web style.

## Signature rules

- A display serif for headlines with a readable text serif or sans
- Columns, rules, drop caps, pull quotes and captions
- A clear type scale with big jumps
- Images cropped with intent, text allowed to overlap them

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#f7f4ee` |
| `--surface` | `#f7f4ee` |
| `--fg` | `#1b1a17` |
| `--muted` | `#4f4b43` |
| `--accent` | `#9b1c1c` |
| `--accent-fg` | `#ffffff` |
| `--border` | `0 solid transparent` |
| `--radius` | `0px` |
| `--shadow` | `none` |
| `--font-display` | `Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif` |
| `--font-text` | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` |
| `--weight-display` | `400` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="editorial"] {
  --bg: #f7f4ee; --surface: #f7f4ee; --fg: #1b1a17; --muted: #4f4b43; --accent: #9b1c1c; --accent-fg: #ffffff; --border: 0 solid transparent; --radius: 0px; --shadow: none; --font-display: Didot, "Bodoni 72", "Bodoni MT", "Playfair Display", Georgia, serif; --font-text: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; --weight-display: 400; --tracking: -0.02em;
  .s-nav { border-block: 1px solid #1b1a17; border-radius: 0; padding: 8px 0; font-family: system-ui, sans-serif; }
  .s-title { font-size: 2.5em; line-height: 1.02; }
  .s-text::first-letter { float: left; font: 400 3.1em/.82 Didot, "Bodoni 72", Georgia, serif; padding: .08em .1em 0 0; color: #9b1c1c; }
  .s-card { border-left: 1px solid #1b1a17; border-radius: 0; }
  .s-stat { font-family: Didot, "Bodoni 72", Georgia, serif; font-weight: 400; font-style: italic; }
  .s-btn { border-radius: 0; font-family: system-ui, sans-serif; transition: background-color .2s; }
  .s-btn:hover { background: #1b1a17; }
  .s-btn-2 { background: none; color: #1b1a17; text-decoration: underline; text-underline-offset: 4px; padding-inline: 2px; }
}
```

## Motion that fits

Quiet: a headline that sets line by line, images that reveal with a mask, captions that fade. Scroll-driven chapters suit long pieces.

## Accessibility

- Keep measure near 45 to 90 characters and line height near 1.5
- High-contrast display serifs get too thin at small sizes

## Choose it for

- Publications, long-form stories, luxury and culture brands, case studies

## Avoid it for

- Dense apps and tools

## Sources

- <https://en.wikipedia.org/wiki/Swiss_Style_(design)>
- <https://practicaltypography.com/line-length.html>

Facts checked on 2026-11-17.
