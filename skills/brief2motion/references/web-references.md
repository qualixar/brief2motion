# Web references: where to look for the right motion, and what you may do with it

A curated library for website motion. When a brief arrives, find the section that matches its words, open one or two links to see the effect done well, then build it yourself from `patterns/` and the kit. Every link below was fetched on 22 Nov 2026 and answered (HTTP 200 after redirects, or a bot challenge for scripts that a real browser passes; those rows say so). Dead or empty pages were dropped. Links change: if one fails, the section's other links still cover it.

**Study, never copy.** Galleries, component libraries and award sites show what is possible. They are somebody's work. Read how an effect behaves (timing, order, what moves and what stays still), then write your own with the kit. Do not copy code, markup, copy, images, logos or layouts. Where a site states its terms, they are noted. Where the terms were not found or not read, the row says "terms not read" and the rule is study only. Never claim a gallery site's work as inspiration for a client without checking the client is happy to be told.

The router (`scripts/route.mjs`) prints the pattern pages that match a brief; this page is where each pattern's "Study" links come from. The last column lists brief words that point to a row.

## 1. Galleries and award sites (study only)

| Site | What to learn | Terms | Brief words |
|---|---|---|---|
| [Awwwards](https://www.awwwards.com/) (collections: [awwwards.com/awwwards/collections](https://www.awwwards.com/awwwards/collections/)) | Current winning sites, how jury-rated sites handle hero, scroll and transitions; filter by technology | Its terms (awwwards.com/terms) say site content is Awwwards' property and may not be used commercially without permission; featured sites stay their authors' work | award, "like awwwards", agency, portfolio |
| [Recent](https://recent.design/) (was godly.website, which redirects here) | Large gallery of sites, launch videos and OG images; good for seeing one effect in many styles | No terms page found (`/terms` is 404): study only | inspiration, gallery, "recent", "godly" |
| [60fps.design](https://60fps.design/) | Frame-by-frame breakdowns of real app interactions, with a glossary; learn timing and easing of micro-interactions | Terms page exists and covers its paid plan and licence key; content is theirs: study only | micro-interaction, timing, easing, iOS feel |
| [Siteinspire](https://www.siteinspire.com/) | Curated sites by style and type; strong for typography-led and minimal layouts | About and privacy pages only found, no reuse terms: study only. (Scripts get HTTP 429; a browser loads it) | minimal, typographic, editorial, Swiss |
| [Httpster](https://httpster.net/) | 3,000+ sites, typographic, minimal and brutalist leaning | Footer: copyright 2012 to 2026 Httpster; no reuse terms found: study only | brutalist, typographic, raw |
| [Land-book](https://land-book.com/) | Landing-page gallery; compare how products lay out a hero and a pricing block | A Terms of Service page exists, not read: study only | landing page, SaaS, pricing |
| [Lapa Ninja](https://www.lapa.ninja/) | Landing pages, with a Motion section; compare section patterns | No reuse terms found: study only | landing page, sections, motion |
| [Minimal Gallery](https://minimal.gallery/) | Hand-picked restrained designs; see how little motion a calm page needs | Terms not read: study only | calm, restrained, minimal |
| [GSAP's gallery of sites](https://gsap.com/showcase/) | Sites built with GSAP, so you can tell which effects are scroll, text or pin | Terms not read; each site is its maker's work: study only | GSAP, scroll story, pinned |
| [Framer gallery](https://www.framer.com/community/gallery/) | Sites built in a no-code tool; see what a non-coder can reach and what looks generic | Terms not read; each site is its maker's work: study only | template, no-code, "made in framer" |
| [Codrops](https://tympanus.net/codrops/) and its [Creative Hub](https://tympanus.net/codrops/hub/) | Tutorials with demos of scroll, type, WebGL and hover effects, written for developers | Articles are Codrops'. Demo repos carry their own licences (the two read for RESOURCES.md are MIT): check each repo before reuse. (Scripts get HTTP 403; a browser loads it) | tutorial, hover effect, WebGL effect, scroll effect |
| [The Pudding: how to implement scrollytelling](https://pudding.cool/process/how-to-implement-scrollytelling/) | Six ways to build scroll stories, compared; the reason `patterns/step-scrollytelling.md` is step-triggered by default | Article: read, do not reproduce | scrollytelling, story, data story, chapters |

## 2. Component libraries (read for the pattern, rebuild with the kit)

These are React and Tailwind collections. A brief2motion site is plain HTML, CSS and the kit unless the brief says React, so use them to see what a pattern does, then rebuild it. Never paste a component's code into a client site without reading its licence; the licence is per library and sometimes per component.

| Site | What to learn | Terms | Brief words |
|---|---|---|---|
| [21st.dev](https://21st.dev/) | A marketplace of community components with live previews; shows how many versions of one pattern exist | Its terms say the marketplace content and previews belong to 21st Labs even where the component code is its author's; each component has its author's licence. Study only | component, marketplace, "21st" |
| [Aceternity UI](https://ui.aceternity.com/) | Animated components and templates (spotlights, beams, cards, marquee) | Its licence page ([ui.aceternity.com/licence](https://ui.aceternity.com/licence)) allows unlimited end products for you or clients, modification and combination; forbids redistribution and resale, including on marketplaces and as templates. Pro items need a purchase | spotlight, beam, glow card, animated background |
| [Magic UI](https://magicui.design/) | Animated components for React (marquee, number ticker, shimmer, bento) | The repo [magicuidesign/magicui](https://github.com/magicuidesign/magicui) is MIT. The site's paid templates: terms not read | marquee, ticker, shimmer, bento |
| [shadcn/ui](https://ui.shadcn.com/) | The copy-the-source model and the design tokens most generated sites now share; learn what makes a page look generic | [Repo](https://github.com/shadcn-ui/ui) is MIT | component, design system, "shadcn" |
| [Motion-Primitives](https://www.motion-primitives.com/) | Small animated primitives (text effects, spotlight, dock) built on Motion | [Repo](https://github.com/ibelick/motion-primitives) is MIT | text effect, dock, magnetic, spotlight |
| [React Bits](https://reactbits.dev/) | Many animated backgrounds and text effects, with live controls | [MIT plus the Commons Clause](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md): use inside your own site, never resell or repackage | animated background, text effect, cursor |
| [Animata](https://animata.design/) | Hand-picked animated components, with how each is built | The repo named on its site ([codse/animata](https://github.com/codse/animata)) is MIT; the site shows ads | card, hover, animated text |
| [Cult UI](https://www.cult-ui.com/) | Components that mix interaction and layout motion | The repo named on its site ([nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui)) is MIT | dock, expandable card, interaction |

## 3. Platform features, with canonical demos

Use these first. A browser feature costs no library and cannot fail to load.

| Link | What to learn | Terms | Brief words |
|---|---|---|---|
| [Scroll-driven animations: demos and tools](https://scroll-driven-animations.style/) | The best collection of working `animation-timeline` demos, a range visualiser, a free video course | Demos are the author's: study; the tool pages are for learning | scroll animation, parallax, progress bar, reveal on scroll |
| [MDN: scroll-driven animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations), [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline), [`animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range), [`view-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline), [`scroll-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-timeline) | The properties and what `view()` and `scroll()` measure | MDN: Creative Commons (text CC BY-SA, examples CC0) | animation-timeline, view(), scroll() |
| [Chrome: scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations) | Support, patterns, and the `@supports` fallback shape | Text CC BY 4.0, code samples Apache 2.0 (stated on the page) | progressive enhancement, no JavaScript |
| [W3C: Scroll-driven Animations spec](https://www.w3.org/TR/scroll-animations-1/) | What the timelines mean exactly | W3C document licence. (Scripts get HTTP 403; a browser loads it) | |
| [Chrome: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions), [same-document](https://developer.chrome.com/docs/web-platform/view-transitions/same-document), [cross-document](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document), [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) | Same-page and page-to-page transitions, shared elements, types, the pseudo-elements | Chrome: text CC BY 4.0, code Apache 2.0. MDN: Creative Commons (text CC BY-SA) | page transition, shared element, morph, theme switch |
| [W3C: View Transitions spec](https://www.w3.org/TR/css-view-transitions-1/) | The exact lifecycle | W3C document licence. (Scripts get HTTP 403; a browser loads it) | |
| [MDN: Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and [`Element.animate`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) | JavaScript animation with no library; what `kit/reveal.js` uses | CC BY-SA | reveal, fade, stagger, no library |
| [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) | The cheap way to know what is on screen or resized | CC BY-SA | when visible, lazy, on enter |
| MDN CSS: [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path), [`mask-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image), [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mix-blend-mode), [`offset-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-path), [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property), [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position), [`scroll-snap-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type), [`grid-template-rows`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows), [`interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size), [`perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective), [`transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style), [`overscroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior) | The building blocks of mask reveals, blend text, motion paths, animated custom properties, sticky scenes, carousels, height-to-auto and tilt | CC BY-SA | mask, reveal, sticky, carousel, accordion, tilt, 3D card |
| [Chrome: animate to `height: auto`](https://developer.chrome.com/docs/css-ui/animate-to-height-auto) | Opening a panel with no JavaScript measuring | Text CC BY 4.0, code Apache 2.0 | accordion, expand, collapse |
| MDN media queries: [`pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer), [`hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover), [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) | Switch cursor effects to fine pointers only; honour reduced motion | CC BY-SA | cursor, hover, magnetic, reduced motion |

## 4. Motion libraries

| Link | What to learn | Terms | Brief words |
|---|---|---|---|
| [GSAP: ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Flip](https://gsap.com/docs/v3/Plugins/Flip/), [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/), [DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/), [MotionPath](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/), [`matchMedia`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [`quickTo`](https://gsap.com/docs/v3/GSAP/gsap.quickTo()/), [`ticker`](https://gsap.com/docs/v3/GSAP/gsap.ticker/) | Choreography, pinning, scrubbing, layout transitions, split text, paths, reduced-motion branches, cursor followers | [GSAP Standard "no charge" licence](https://gsap.com/community/standard-license/): free including commercial use and AI-written code; not for no-code animation builders that compete with Webflow. Not open source. Pinned at 3.15.1 here | pinned, scrub, horizontal scroll, split text, Flip, GSAP |
| [Lenis](https://lenis.dev/) (the old darkroom.engineering address redirects here; [repo](https://github.com/darkroomengineering/lenis)) | Smooth scrolling that stays on GSAP's clock; stands down for reduced motion | MIT | smooth scroll, Lenis, inertia |
| [Motion](https://motion.dev/docs) ([repo](https://github.com/motiondivision/motion)) | Springs, layout animation, gestures, scroll-linked values in vanilla JS and React | MIT (Motion+ is a separate paid product, not used) | spring, layout animation, drag, gesture |
| [three.js](https://threejs.org/) with its [examples](https://threejs.org/examples/), [manual](https://threejs.org/manual/) and [docs](https://threejs.org/docs/) | Real 3D in the browser; the examples are the best catalogue of what is possible | MIT. Pinned at 0.187.0 (r187) | 3D, WebGL, product viewer, turntable, shader |
| [Discover three.js](https://discoverthreejs.com/) | A free online book with live code, for the first week with three.js | Free to read: the page says "completely free"; terms for reuse not read | learn three.js |
| [React Three Fiber](https://r3f.docs.pmnd.rs/) and [drei](https://drei.docs.pmnd.rs/) | three.js as React components, plus ready helpers (controls, environment, contact shadows) | MIT, both | React 3D, R3F, Next.js 3D |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | Merges several effects into one pass; bloom, depth of field | Zlib | bloom, depth of field, glow |
| [OGL](https://github.com/oframe/ogl) | A minimal WebGL library for one full-screen shader | Unlicense (stated in its README and package.json) | shader background, full-screen effect, light WebGL |
| [model-viewer](https://modelviewer.dev/) ([repo](https://github.com/google/model-viewer)) | A one-tag viewer for a glTF with orbit and AR, when the brief only needs "show the model" | Apache-2.0 | show my 3D model, AR, glb |
| [glTF Transform](https://gltf-transform.dev/) and [Khronos glTF](https://www.khronos.org/gltf/) | Compress and inspect `.glb` files; the format everything above loads | Tool and spec pages: read; the tool's own licence is on its repo | compress model, glb size |
| [Poly Haven](https://polyhaven.com/) | Free HDRIs, textures and models for lighting a product scene | All assets CC0 ([licence page](https://polyhaven.com/license)); no credit needed | HDRI, environment map, studio light, texture |
| [Theatre.js](https://www.theatrejs.com/) ([repo](https://github.com/theatre-js/theatre)) | A visual timeline editor for tuning camera and object keyframes by hand | Apache-2.0. Last push Aug 2024: stale, use only when a person will tune by hand | keyframes editor, camera path, timeline |
| [Lottie](https://lottie.airbnb.tech/) ([lottie-web](https://github.com/airbnb/lottie-web)), [dotLottie](https://dotlottie.io/) ([repo](https://github.com/LottieFiles/dotlottie-web)), [LottieFiles](https://lottiefiles.com/), [LottieFiles docs](https://docs.lottiefiles.com/en) | Playing After Effects exports as small vector animations; the dotLottie format and player | Players MIT. Each animation file has its own licence: check before use | Lottie, After Effects, animated icon, JSON animation |
| [Rive](https://rive.app/) with its [docs](https://rive.app/docs/getting-started/introduction), the [marketplace](https://rive.app/marketplace/) and the [runtime](https://github.com/rive-app/rive-wasm) | Interactive vector animation with state machines (a button that reacts, a character that follows) | Runtime MIT. Each `.riv` file has its own licence | Rive, interactive illustration, state machine, mascot |
| [Scrollama](https://github.com/russellsamora/scrollama) | The "step nearest a line is active" model for scroll stories | MIT; the kit re-implements the idea in ten lines | scrollytelling, steps |

## 5. Shaders

| Link | What to learn | Terms | Brief words |
|---|---|---|---|
| [The Book of Shaders](https://thebookofshaders.com/) | A free, patient course on fragment shaders: noise, shapes, patterns | Course text by its authors; read it, write your own | shader, noise, gradient, procedural |
| [Inigo Quilez: articles](https://iquilezles.org/articles/) | The reference for distance functions, palettes, noise and ray marching | Articles are his; read, then write your own | SDF, ray marching, palette, domain warping |
| [Shadertoy](https://www.shadertoy.com/) ([how-to](https://www.shadertoy.com/howto)) | The largest shader playground; browse to see what one screen of maths can do | Every shader has its author's licence and the default is not confirmed here: never copy a shader without reading the one on its page. (Scripts get HTTP 403 from a bot check; a browser loads it, and the Wayback Machine holds both pages) | shadertoy, plasma, liquid, raymarched, glsl |
| [LYGIA](https://lygia.xyz/) ([repo](https://github.com/patriciogonzalezvivo/lygia)) | A shader function library | Prosperity Public License 3.0 (non-commercial) or a Patron licence: never bundled, see `licences.md` | shader library, lygia |
| [cables.gl](https://cables.gl/) | A node-based WebGL tool; see how others build interactive visuals | Terms not read: study only | node-based, visual programming, generative |

## 6. Tuning, easing and judgement

| Link | What to learn | Terms | Brief words |
|---|---|---|---|
| [Tweakpane](https://tweakpane.github.io/docs/) ([repo](https://github.com/cocopon/tweakpane)) | The compact tuning panel behind `kit/tune.js` | MIT. Used only in development with `?tune` | tune, tweak, adjust easing |
| [Easings.net](https://easings.net/) and [cubic-bezier.com](https://cubic-bezier.com/) | The standard curves with their cubic-bezier values; draw and test a custom one | Reference tools | easing, curve, feel |
| [Material 3: motion](https://m3.material.io/styles/motion/overview/how-it-works) | Duration and easing tokens, and what each transition pattern is for | Google's design guidance; read | duration, material motion |
| [Apple: motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Purposeful, optional, brief motion, and that people can turn it off | Apple's guidance; read | iOS feel, purposeful motion |
| [NN/g: the role of animation](https://www.nngroup.com/articles/animation-purpose-ux/) | What animation is for: feedback, orientation, attention; and when it hurts | Article: read | does this need animation, UX motion |
| [Web Interface Guidelines](https://interfaces.rauno.me/) | A list of small details that make an interface feel right | Read; terms not stated | polish, details, hover, focus |
| [Josh Comeau: animation](https://www.joshwcomeau.com/animation/) and [reduced motion in React](https://www.joshwcomeau.com/react/prefers-reduced-motion/) | Clear explanations of CSS animation, springs and honouring the preference | Articles: read | CSS animation, reduced motion |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/): [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | The rules behind the reduced-motion checks | W3C document licence. (Scripts get HTTP 403 from a bot check; a browser loads them, and the Wayback Machine holds them) | accessibility, motion sensitivity, WCAG |

## 7. Performance

| Link | What to learn | Terms | Brief words |
|---|---|---|---|
| [web.dev: animations guide](https://web.dev/articles/animations-guide) and [rendering performance](https://web.dev/articles/rendering-performance) | Which properties are cheap, why `transform` and `opacity` win | Text CC BY 4.0, code Apache 2.0 | slow, janky, fps |
| [web.dev: compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) | Layer count and what promotes a layer | Text CC BY 4.0, code Apache 2.0 | layers, will-change |
| [web.dev: INP](https://web.dev/articles/inp), [CLS](https://web.dev/articles/cls), [LCP](https://web.dev/articles/optimize-lcp) | The three metrics a motion-heavy page can break | Text CC BY 4.0, code Apache 2.0 | Core Web Vitals, layout shift, load speed |
| [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance) and [MDN: `will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change) | Recording a trace with CPU throttling, what `will-change` costs | Chrome docs: text CC BY 4.0, code Apache 2.0. MDN: Creative Commons | profile, throttle |

## How to use this page

1. Read the brief's motion words and find the rows whose last column matches. Open at most two links per pattern.
2. Write down in SPEC.md what the example does (what moves first, how long, what stays still) in your own words. Never its code, copy or images.
3. Build it from the matching page in `patterns/` (index: `patterns/README.md`), with the kit.
4. Credit the library you load, not the gallery you looked at. Libraries and their licences are in `licences.md`.
