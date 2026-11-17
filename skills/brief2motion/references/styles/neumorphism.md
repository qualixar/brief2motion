# Neumorphism (soft UI)

Also called: soft UI, neomorphism.
Family: Surface styles.

Shapes pushed out of, or pressed into, a surface of the same colour, drawn only with one light shadow and one dark shadow.

The name was coined in 2019 ("neo" plus "skeuomorphism") after a Dribbble banking concept by Alexander Plyuto; it faded by 2021 over accessibility.

## Signature rules

- Element and background share one colour
- Two shadows: light towards the top left, dark towards the bottom right, about 8 px offset and 16 px blur
- Pressed state swaps to inset shadows
- Pastel, low-contrast palette

## Tokens

| Token | Value |
|---|---|
| `--bg` | `#e3e7ee` |
| `--surface` | `#e3e7ee` |
| `--fg` | `#2b3445` |
| `--muted` | `#4d5a70` |
| `--accent` | `#3d5afe` |
| `--accent-fg` | `#ffffff` |
| `--border` | `1px solid transparent` |
| `--radius` | `18px` |
| `--shadow` | `8px 8px 18px #b9c0cd, -8px -8px 18px #ffffff` |
| `--font-display` | `ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif` |
| `--font-text` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--weight-display` | `700` |
| `--tracking` | `-0.02em` |

## Tested CSS

The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup's class names. Take the tokens and the signature rules into your own page; do not copy the specimen.

```css
.stage[data-style="neumorphism"] {
  --bg: #e3e7ee; --surface: #e3e7ee; --fg: #2b3445; --muted: #4d5a70; --accent: #3d5afe; --accent-fg: #ffffff; --border: 1px solid transparent; --radius: 18px; --shadow: 8px 8px 18px #b9c0cd, -8px -8px 18px #ffffff; --font-display: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif; --font-text: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --weight-display: 700; --tracking: -0.02em;
  .s-card, .s-nav, .s-btn-2 { box-shadow: var(--shadow); }
  .s-btn-2 { background: var(--bg); color: var(--fg); border-color: #8f9bb0; }   /* the outline is the accessible part: shadows alone do not reach 3:1 */
  .s-btn-2:active, .s-field input { box-shadow: inset 5px 5px 10px #b9c0cd, inset -5px -5px 10px #ffffff; }
  .s-btn { box-shadow: 6px 6px 14px #b9c0cd, -6px -6px 14px #ffffff; transition: box-shadow .18s ease, transform .18s ease; }
  .s-btn:active { transform: scale(.98); box-shadow: 2px 2px 5px #b9c0cd, -2px -2px 5px #ffffff; }
  .s-field input { background: var(--bg); border-color: #8f9bb0; }
}
```

## Motion that fits

A press swaps the raised shadow for an inset one in about 150 to 250 ms.

## Accessibility

- Its defining trait is low contrast: control edges fail WCAG 1.4.11 (3:1) unless you add a border or a strong icon
- Raised and pressed states look alike to many people
- Keep text itself at 4.5:1

## Choose it for

- A few decorative controls: a music player, a smart-home dial

## Avoid it for

- Forms, data-heavy apps, anything that must be scanned quickly

## Sources

- <https://en.wikipedia.org/wiki/Neumorphism>
- <https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html>

Facts checked on 2026-11-17.
