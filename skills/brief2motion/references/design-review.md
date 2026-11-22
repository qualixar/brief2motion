# Design review: the second reader

A checker measures. It cannot see that a layout is dull, that the first screen says nothing, or that a picture is a stock image of nothing in particular. Site mode therefore ends with a second reader: a different agent, or a person, who did not write the page and has not read the brief. This page is their rubric and their evidence format. Nothing here replaces `check/qa.json`; it covers what that file marks REVIEW and what no tool can mark at all.

## Setup

The reader gets only what a visitor gets: the built site at its preview address, the screenshots in `check/shots/`, and nothing else. No brief, no `DESIGN.md`, until the first part is done. They write their notes in `REVIEW.md` in the project, each with the screenshot or the address and the width it was seen at.

## Part 1: three questions, answered cold (about two minutes per page)

Look at the first screen at 390 px wide, then at 1440. Without scrolling, and without reading the brief, write one sentence for each:

1. **Offer.** What does this page offer, and to whom?
2. **Focal point.** What did your eye land on first, and was that the thing that matters?
3. **Next action.** What would you do next, and where would it take you?

Then read `BRIEF.md` and `DESIGN.md`. Where the answers differ from what the brief intends, that is a finding, whatever the checkers say. A page can pass every check and fail this part.

## Part 2: the rubric

Score each line **good**, **review** (looks wrong, cannot tell) or **fix**, with one concrete observation. No bare adjectives: "the second card's text starts 6 px left of the first" is a finding, "feels off" is not.

| Line | Look for |
|---|---|
| Legibility | Text you have to lean toward; low-contrast quiet text; text over a picture or gradient at its worst crop (the contrast checker cannot measure these); lines far wider than a book column; type that changes size with no reason |
| Alignment and rhythm | Edges that almost line up; inconsistent gaps between sections; cards of different heights in one row; things that belong together but sit apart, or the reverse |
| Coherence | One idea carried through (the visual thesis in `DESIGN.md`); a second style appearing halfway down; icons from different families; two competing accent colours |
| Asset authenticity | Pictures that do not show the thing the text claims; generic stock; invented people, logos, reviews or numbers presented as real; the rights record in `ASSETS.json` matching what is on screen; fictional content marked as fictional |
| Motion intent | Each movement says what it is for (`MOTION.md`); one planned entrance, not the same fade on every section; nothing moves while you are trying to read; the page still makes sense with motion off |

## Part 3: the three tests

These take a few minutes each and catch what the rubric misses.

**Motion-off and sound-off test.** Switch the system to reduced motion and mute the tab. Is the page still complete: every claim readable, every state reachable, no empty hole where an animation was supposed to fill? If a section is blank until something plays, it is broken for some visitors.

**Phone test.** Open the page on a real phone, or at 390 px with touch emulation, and use it one-handed. Can you reach the primary action with a thumb? Does anything need two hands or a precise tap? Does the on-screen keyboard cover the field you are typing in? Is the sticky bar eating the screen?

**480 px test.** Shrink the first-screen screenshot until it is 480 px wide (about the size of a thumbnail, a share card or a squinting glance). Repeat Part 1. If you can no longer say what it offers, where the eye lands and what to do, the hierarchy is too weak: too many things the same size, text too small, the action not the loudest thing.

## What automation covers, and what stays with a person

| Covered by a check | Still needs a person |
|---|---|
| axe-core rules on each route and state (names, roles, labels, landmarks, many contrast cases) | whether the alt text says the right thing; whether headings describe their sections; language changes |
| Tab reaches the primary action; focus is not covered by sticky UI | logical order and visibility under real use; cookie banners; dialogs that must return focus |
| Layout overflow, clipped text, overlap, tap targets, line length at four widths | whether the composition is good; text over images; whether truncated text can be read in full |
| Token pairs meet WCAG AA in each theme | contrast of text over pictures, gradients and canvas; state shown by more than colour |
| Journeys complete on a phone and a desktop width | whether a stranger understands the labels; a screen-reader run: what is announced, and in what order |
| Titles, descriptions, canonical, share image, robots, sitemap | what the search result and the share card look like; whether the copy is worth clicking |

Also do by hand, every time: zoom to 200% and use the page; turn on a forced-colours mode and check state is still visible; override text spacing (line height 1.5, paragraph spacing 2x, letter spacing 0.12 em, word spacing 0.16 em) and check nothing is lost or clipped; run the page with a screen reader once, in one browser, on the primary journey.

## Reporting

`REVIEW.md` ends with a table the delivering agent can act on: finding, screen and width, severity (**fix** blocks, **review** gets a decision from the owner), and the evidence file. Fixes are made by the page's author, then the affected checks and journeys are rerun; the reviewer looks again only at what changed. Two rounds are enough: a third means the brief is unclear, and the question goes to the owner.

The reader never edits the page, never loosens a check, and never writes "looks good" without the three Part 1 sentences beside it.
