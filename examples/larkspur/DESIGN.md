# Design: Larkspur

## The visual idea
A shared inbox is a paper tray: messages are loose sheets with a name on them. So the page is warm paper, the product is drawn as a tray of rows with a name tag each, and the only strong colour is the violet of the tag that says someone has the message.

## Type
- Roles: caption, body, section heading, page heading, display (all in `tokens.json`). Georgia for headlines (display, page, section), the system UI sans for text.
- Scale: body `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`; section 1.44 to 1.8 rem; page 2 to 3.2 rem; display 2.6 to 5 rem; about a 1.25 step at the narrow end. Line heights 1.5 body, 1.2 headings, 1.05 display.
- Measure: `50ch`, which the checker measures as 67 real characters a line for the hero paragraph in the system font (within 45 to 75); card text in columns is shorter by design.

## Grid and spacing
- Mobile: one column, 16 px gutters. From 800 px: three columns for the steps, two for notes and plans; from 840 px the hero is two columns (text, then the drawing). Width capped at 70 rem.
- Spacing from the token scale (4, 8, 12, 16, 24, 32, 48, 64, 96). Sections breathe with `clamp(48px, 9vw, 96px)`; things that belong together (a heading and its first line) sit 8 px apart.

## Colour roles
Canvas (warm paper), surface (a darker paper for the tray and plan cards), text, quiet text, action (violet), on-action, tint (the owner chip), border (3:1 against canvas, for inputs and chips), rule (decorative separators), focus. Two full maps, light and dark, in `tokens.json`; every declared pair measured in both.

## Imagery and crops
No photographs. The drawing is HTML and CSS (rows, chips), so it scales with the text and has no crop. The share image (1200 x 630, `tools/og.html`) is the same paper and violet with the headline set large; the title stays inside the middle 80%.

## The one memorable thing
The inbox tray with its owner chips. The arrival (a message, then "Ari has this") is the product's argument in a second and a half; nothing else on the page competes with it.

## Reference observations
None are copied. The structure follows `references/page-blueprints.md` (SaaS): audience and outcome, the workflow shown, what else is inside, plans, objections, the action again.
