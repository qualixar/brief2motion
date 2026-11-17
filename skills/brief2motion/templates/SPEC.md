# SPEC

## Brief (verbatim)


## Stack and style
- Stack: (from `route.mjs`, confirmed or overruled) because
- Style: (a page in `references/styles/`, or the brand's own) because
- References read:

## Design plan
- Colours (4 to 6, named, with the contrast of each text pair):
- Type (families and roles; system stacks unless the brief supplies a font):
- Layout idea, in one line:
- The one memorable thing on the page:

## Motion plan
Each line: what moves, and why.
- On load:
- On scroll:
- On input:
- With reduced motion, the visitor sees:
- With no WebGL or a blocked CDN, the visitor sees:

## For the dust engine only
| User's words | Block (assemble / flight / scroll) | Settings |
|---|---|---|

Targets in order (up to 4 shapes; `sequence` may repeat them):

## Copy (exact)
- Headline:
- Subline:
- Sections:
- Drafted by the agent (not in the brief):

## Done when
- [ ] Desktop p95 frame time <= 20 ms; emulated phone p95 <= 40 ms (check/site-report.json)
- [ ] No sideways scroll at 1440, 390 and 320 px; tap targets >= 24 px
- [ ] Reduced motion: the finished state, nothing moving, every heading and paragraph visible
- [ ] WebGL off and JavaScript off: the page still reads
- [ ] Text contrast AA; every keyboard stop has a visible focus ring
- [ ] Project page weight <= 1.5 MiB; requests only to cdn.jsdelivr.net; 0 console errors
- [ ] index.html has the real title and description
- [ ] The user has the http://localhost link to the page
- [ ] (one line per requirement in the brief, each with the screenshot or number that proves it)

## Decisions
-
