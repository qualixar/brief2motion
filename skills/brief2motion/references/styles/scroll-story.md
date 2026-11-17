# Scroll-driven storytelling

Family: Motion-led approaches.

The page is a sequence: sections pin, pictures scrub and charts redraw as the reader scrolls, so the scroll bar becomes the timeline.

## Signature rules

- Pin a scene and drive it with scroll progress
- One change per step
- Text beside the picture, never hidden behind the effect
- Everything still readable as a plain page

## Worked example

`examples/tidewater/` is a complete site built this way, with its brief, its motion plan at the top of its script and a passing `site-report.json`. The stack reference to read is `references/stacks/gsap.md`.

## Motion that fits

Scrubbed, not timed: the reader sets the speed. Smooth scroll is optional and must not fight the trackpad.

## Accessibility

- Parallax and zooms can cause nausea: reduce to cuts for reduced motion
- Pinned sections must not trap keyboard users
- A 2013 Purdue study found parallax did not improve the experience by itself

## Choose it for

- Brand stories, product explainers, journalism, annual reports, data stories

## Avoid it for

- Task pages people visit to get something done

## Sources

- <https://en.wikipedia.org/wiki/Parallax_scrolling>
- <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>

Facts checked on 2026-11-17.
