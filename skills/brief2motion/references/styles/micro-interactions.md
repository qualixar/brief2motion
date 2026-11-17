# Micro-interactions

Family: Motion-led approaches.

Small animated answers to what a person just did: a toggle that slides, a row that makes room, a number that settles.

## Signature rules

- Each one has a trigger and feedback
- Feedback within about 100 ms; most transitions 200 to 300 ms
- Entering slightly slower than leaving
- Springs for things people drag, so they can be interrupted

## Worked example

`examples/mise/` is a complete site built this way, with its brief, its motion plan at the top of its script and a passing `site-report.json`. The stack reference to read is `references/stacks/motion.md`.

## Motion that fits

Only in response to input. If nothing was pressed, nothing moves.

## Accessibility

- State must also be shown without motion (text, icon, colour)
- Drag needs a keyboard alternative
- Announce results to screen readers with a live region

## Choose it for

- Apps, dashboards, forms, checkouts, any interface used every day

## Avoid it for

- Nothing: every interface benefits, in moderation

## Sources

- <https://www.nngroup.com/articles/microinteractions/>
- <https://www.nngroup.com/articles/animation-duration/>

Facts checked on 2026-11-17.
