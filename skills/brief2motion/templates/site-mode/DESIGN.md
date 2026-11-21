# Design: Tidepool Open Day

## The visual idea
A tide pool seen from above: shallow, bright, with small things living in it, so the page is a shallow bowl of colour with one creature in focus. (One sentence, taken from the subject.)

## Type
- Roles: caption, body, section heading, page heading, display. One family: the system UI stack for text, Georgia for the display line.
- Scale: about 1.2 from body to section heading, larger steps above. Fluid with `clamp()`, every size from `tokens.json`.
- Body 1 to 1.125 rem, line height 1.5; headings 1.2; display 1.05. Measure 45 to 75 characters: with this font about 50ch (the checker counts real characters).

## Grid and spacing
- 4 columns on a phone, 8 on a tablet, 12 on a wide screen. Gutters 16 px, then 32 px.
- Spacing scale in `tokens.json`: 4, 8, 12, 16, 24, 32, 48, 64, 96. Groups sit closer than separate things.

## Colour roles
Canvas, surface, text, quiet text, action, text on action, focus: each defined for light and dark in `tokens.json`, every text pair above 4.5:1.

## Imagery and crops
One drawing (ASSETS.json). Phone: square crop, the starfish centred. Wide: 4:3, creature right of centre so the headline has the left.

## The one memorable thing
The tide line: a wavy edge between hero and programme that is the page's only decoration, and the shape the hero drawing sits in.
