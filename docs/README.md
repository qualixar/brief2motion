# brief2motion documentation

The [README](../README.md) is the overview. These pages hold the detail, for people. The agent reads the skill itself, [SKILL.md](../skills/brief2motion/SKILL.md), and the references beside it.

## Guides

| Page | What it covers |
|---|---|
| [The learning guide (PDF)](guide/brief2motion-guide.pdf) | 63 A4 pages: writing a brief, how the stack and the style are chosen, every stack, the style system, accessibility, performance, the checks, site mode, motion patterns and the examples. Its editable source and build steps are in [guide/](guide/README.md) |
| [Site mode](site-mode.md) | building a whole site or a page that must convert: the nine stages and their files, the five checkers and the token builder, what PASS, FAIL, REVIEW, PENDING and INCOMPLETE mean, `--strict`, and a walkthrough of the Larkspur example |
| [Motion patterns](motion-patterns.md) | the 27 pattern recipes (hero sequence, pinned scene, horizontal scroll, marquee, page transition, 3D product scroll and more): when to use each, when not, and its reduced-motion form. Generated from the recipes |
| [Troubleshooting](troubleshooting.md) | blank pages, busy ports, a browser that will not start, failing frame-time, reduced-motion and weight checks, an INCOMPLETE site-mode run |

## References the agent reads

All in [`skills/brief2motion/references/`](../skills/brief2motion/references/). They are written for the agent, and they are plain Markdown a person can read too.

| Reference | What it is |
|---|---|
| [stacks/](../skills/brief2motion/references/stacks/) | one page per motion stack: plain CSS and JavaScript, GSAP with ScrollTrigger and Lenis, Motion, three.js and React Three Fiber, the dust engine, SVG with Lottie and Rive, the View Transitions API, kinetic type, scroll storytelling, and a note on WebAssembly |
| [styles.md](../skills/brief2motion/references/styles.md) and [styles/](../skills/brief2motion/references/styles/) | the 32 visual styles, one page each, generated from `styles.json` |
| [patterns/](../skills/brief2motion/references/patterns/) | the 27 motion pattern recipes, with sketches and budgets |
| [motion-doctrine.md](../skills/brief2motion/references/motion-doctrine.md) | timing, easing, blur, transitions and pacing rules every page follows |
| [design-fundamentals.md](../skills/brief2motion/references/design-fundamentals.md) | hierarchy, type, spacing, colour roles, images, breakpoints and form states, in numbers |
| [page-blueprints.md](../skills/brief2motion/references/page-blueprints.md) | the section order for a product launch, SaaS, portfolio, agency, event, documentation and e-commerce page |
| [design-review.md](../skills/brief2motion/references/design-review.md) | the rubric for a second reader who did not build the page |
| [accessibility.md](../skills/brief2motion/references/accessibility.md) and [performance.md](../skills/brief2motion/references/performance.md) | reduced motion per library, focus, contrast; frame budgets and Core Web Vitals |
| [brief-words.md](../skills/brief2motion/references/brief-words.md) | common brief phrases and the stack and settings they map to |
| [web-references.md](../skills/brief2motion/references/web-references.md) | sites, component libraries and technique demos to study, each with its stated terms |
| [licences.md](../skills/brief2motion/references/licences.md) | every library a built site loads or a checker downloads, with its licence and what it means for you |

## Project files

[CHANGELOG.md](../CHANGELOG.md) lists what changed in each release. [NOTICE](../NOTICE) lists the software built sites load and the data, images and fonts that ship here. The diagram sources for the banner and the architecture picture are in [diagrams/](diagrams/).
