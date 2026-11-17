# Resources: what brief2motion was learned from

Two lists. The first is the 43 repositories studied for version 1.0, each with its licence, what was read, what was learned and what was taken. The second, further down, is the wider directory of repositories for motion work from version 0.1.

## How to read the licence column

A licence is the owner's rule for what you may do with their code. MIT, Apache-2.0, BSD, ISC, Zlib and the Unlicense are the easy ones: you can use the code in a paid project, as long as you keep their notice where one is required. "No LICENSE file" is not the same as free: with no licence, the author keeps all rights, so you may read the repo and learn from it, but you should not copy its code. A few use a custom licence with a condition, and the row says what the condition is. This is a plain-language guide, not legal advice.

## The rule this repository follows

No code from another project is copied into this repository. Everything in `skills/`, `examples/` and `tests/` was written for it. Where a published pattern shaped something, the row says so and [NOTICE](NOTICE) carries the attribution. Libraries that built pages use are loaded from a CDN at pinned versions and never bundled.

## Studied for version 1.0

Each repository was shallow-cloned outside this repo and its LICENSE file was read before anything else. "Read" says honestly how far the study went: for many it was the licence, the README and the public API; for the ones that mattered most it was the source. Stars and last-push dates are from GitHub on 17 Nov 2026.

### Motion stacks

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [greensock/GSAP](https://github.com/greensock/GSAP) at `5e6c35f` | 30,826 | 2026-11-04 | GSAP Standard "no charge" licence (no LICENSE file; stated in README and package.json). Not open source | README, package.json | All of GSAP is free since 2025, SplitText, DrawSVG and MorphSVG included. `gsap.matchMedia()` is the one place to branch on reduced motion and screen width. CDN files live under `dist/` | Patterns only. Loaded from the CDN at 3.15.1 with integrity hashes; no file copied |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) at `bd89165` | 17,322 | 2026-11-13 | MIT | README (every option) | `anchors`, `autoRaf`, `data-lenis-prevent`, running on GSAP's ticker with `lagSmoothing(0)`, and that it honours reduced motion by default (`respectReducedMotion`) | Patterns only: the ticker wiring in `stacks/gsap.md` follows its README |
| [motiondivision/motion](https://github.com/motiondivision/motion) at `4e5be4d` | 35,305 | 2026-11-17 | MIT | `packages/motion/src`, `framer-motion/src/dom.ts`, `motion-dom/src/index.ts`, `components/Reorder/Item.tsx`, `gestures/drag/use-drag-controls.ts` | The vanilla exports (`animate`, `scroll`, `inView`, `stagger`, `spring`, `hover`, `press`), the `motion/react` import path, and that `Reorder.Item` is a keyboard stop with a built-in grab. Found by reading the source after a drag test failed | Patterns only. Loaded from the CDN at 14.14.0 |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) at `01b81be` | 74,843 | 2026-11-02 | MIT | README, licence | A lightweight timeline alternative with a v4 module API; listed as an option, not used | Nothing |
| [Popmotion/popmotion](https://github.com/Popmotion/popmotion) at `adf681e` | 20,159 | 2024-03-12 | No LICENSE file at the repo root; npm says MIT. Last push 2024 | README | The origin of the functional tween and spring ideas now inside Motion. Dormant, so not recommended for new work | Nothing (learn only) |
| [pmndrs/react-spring](https://github.com/pmndrs/react-spring) at `83e4760` | 29,312 | 2026-11-01 | MIT | README, licence | Spring-first animation for React; an alternative to Motion that the references name but do not use | Nothing |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) at `6ea82b9` | 13,034 | 2024-08-14 | Apache-2.0. Last push Aug 2024 | README, licence | A visual keyframe editor for three.js scenes. Useful when a human will tune a camera path by hand; stale, so mentioned with that warning | Nothing |
| [flackr/scroll-timeline](https://github.com/flackr/scroll-timeline) at `5da0828` | 1,167 | 2024-08-26 | Apache-2.0 | README, licence | The polyfill for CSS scroll-driven animations. We chose progressive enhancement instead: `@supports (animation-timeline: view())` with the finished state as the default | Nothing |
| [russellsamora/scrollama](https://github.com/russellsamora/scrollama) at `afab8ab` | 6,013 | 2025-11-13 | MIT | README | The step-trigger model for scrollytelling: the step nearest a line on screen is active. `examples/keeling` reimplements the idea in ten lines on the kit's scroll listener | The idea, in our own code |

### 3D

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) at `fad374c` | 118,755 | 2026-11-17 | MIT | LICENSE, README, the `examples/jsm` layout | Addon paths for an import map (`three/addons/`), `RoomEnvironment` with `PMREMGenerator` for light without files, `EffectComposer` with `OutputPass` last, `THREE.Timer` replacing the deprecated `Clock` | Patterns only. Loaded from the CDN at 0.187.0 |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) at `d74622e` | 33,788 | 2026-10-21 | MIT | README, licence, and a failing test | The renderer inside 9.8.2 is built against React 19.3.0 and refuses to run with another React version. A CDN import map cannot guarantee that, so React Three Fiber needs a bundler. The test page pins it | Patterns only |
| [pmndrs/drei](https://github.com/pmndrs/drei) at `bf6f4ad` | 10,171 | 2026-10-21 | MIT | README, licence | `PresentationControls`, `ContactShadows`, `RoundedBox`, `useGLTF`, `Environment`, `ScrollControls`, `Html`: the helpers the reference recommends. `Environment` presets fetch from another host, so the test page lights by hand | Patterns only |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) at `a1f1035` | 2,981 | 2026-11-01 | Zlib | README, licence | Merges several effects into one full-screen pass. Recommended in `stacks/three.md` when more than two effects are needed; three's own passes are used in the test page | Nothing |
| [pmndrs/maath](https://github.com/pmndrs/maath) at `dee0cae` | 1,345 | 2026-11-16 | MIT | README | Frame-rate independent damping (`1 - exp(-lambda * dt)`), the standard formula the kit's `damp()` uses | The formula, which is textbook maths, in our own code |
| [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) at `02b170c` | 1,224 | 2026-11-15 | MIT | README | Tiering devices by GPU benchmark. We chose simpler rules that need no lookup table: cap the pixel ratio, drop post-processing on narrow screens | Nothing |
| [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx) at `f4fbfa2` | 5,905 | 2024-11-04 | MIT | README | Turns a `.glb` into a React component; named in the React Three Fiber section | Nothing |
| [google/model-viewer](https://github.com/google/model-viewer) at `d1124d7` | 8,342 | 2026-11-16 | Apache-2.0 | README, licence | A one-tag viewer for a glTF model with orbit controls and AR. The reference points to it when a brief only needs "show my model" | Nothing |
| [oframe/ogl](https://github.com/oframe/ogl) at `385ce65` | 4,759 | 2025-04-13 | Unlicense (stated in README and package.json; no LICENSE file) | README | A minimal WebGL library, about a fifth of three.js. Worth it for one full-screen shader; not used because the examples need lighting and materials | Nothing |
| [fand/vfx-js](https://github.com/fand/vfx-js) at `1c4c7d7` | 1,194 | 2026-11-14 | MIT | README, licence | WebGL effects applied to ordinary DOM elements (images, text). An option for glitch and distortion on a real `<img>`; not used | Nothing |

### Type, pages and scroll

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [shshaw/Splitting](https://github.com/shshaw/Splitting) at `d5a8fd0` | 1,757 | 2024-06-19 | MIT. Last push 2024 | README | CSS variables per word and character (`--word-index`, `--char-index`) so CSS can stagger. The kit's splitter sets `--i` and `--line` the same way | The idea, in our own code |
| [lukePeavey/SplitType](https://github.com/lukePeavey/SplitType) at `36af092` | 736 | 2023-12-03 | ISC in package.json; no LICENSE file. Last push 2023 | README | Line detection by measuring word positions after layout, and re-splitting on resize. `groupLines()` in the kit does this | The idea, in our own code (learn only) |
| [swup/swup](https://github.com/swup/swup) at `7b1d4c5` | 5,252 | 2026-11-03 | MIT | README, licence | What a page-transition library has to take over from the browser: swapping containers, focus, title, scroll, script lifecycle. Listed in `stacks/view-transitions.md` for cases the native API cannot cover | Nothing |
| [barbajs/barba](https://github.com/barbajs/barba) at `a7c99a5` | 13,000 | 2024-12-02 | MIT. Last push Dec 2024 | README, licence | The same job with `leave` and `enter` hooks shaped for GSAP timelines | Nothing |
| [codrops/ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations) at `729029a` | 340 | 2026-10-31 | MIT | README, licence | A set of demos where image layouts switch as you scroll. Only the README was read, not the demo code; it pointed us to cover layout changes (Flip) in `stacks/gsap.md` | Nothing |
| [codrops/OnScrollTypographyAnimations](https://github.com/codrops/OnScrollTypographyAnimations) at `af28d61` | 352 | 2023-12-05 | MIT. Last push 2023 | README, licence | A collection of on-scroll typography ideas. Only the README was read; it confirmed that scroll-driven type deserved its own reference | Nothing |
| [marioecg/codrops-kinetic-typo](https://github.com/marioecg/codrops-kinetic-typo) at `f381fb2` | 182 | 2022-12-12 | MIT. Last push 2022 | README, licence, file list | Kinetic type rendered in three.js, with bitmap font files in its assets. Out of scope for the examples; noted as the route when type has to live inside a WebGL scene | Nothing |

### Players

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) at `bede03d` | 32,486 | 2025-09-01 | MIT. Last push Sep 2025 | README, licence, `build/player/esm` | The ES module builds, the light (SVG-only) build, `goToAndStop` for a still frame, `DOMLoaded`. `kit/players.js` uses them | Patterns only. Loaded from the CDN at 5.13.0 |
| [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) at `9aa07ff` | 950 | 2026-11-16 | MIT | README | The WebAssembly canvas player for `.lottie` files, with state machines and theming. Named as the choice for `.lottie` or large files | Nothing |
| [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) at `77ed837` | 1,027 | 2026-11-17 | MIT | README, licence, the examples tree | `new Rive({ src, canvas, stateMachines, onLoad })`, `resizeDrawingSurfaceToCanvas()`, `cleanup()`, and the lite runtime. The smoke test downloads one of its test files at run time; none is shipped | Patterns only. Loaded from the CDN at 2.51.0 |

### Design systems and styles

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) at `e4bb5d9` | 196,553 | 2026-11-16 | Apache-2.0 for `skills/frontend-design` (its own LICENSE.txt); the repo root has no licence file | `skills/frontend-design/SKILL.md` | Ground the design in the subject. One orchestrated moment, not a fade on every block. The list of looks that mark a generated page. Plan, review against the brief, then build. Words are design material | Ideas, restated in our own words in `SKILL.md` and `design-fundamentals.md`, with credit |
| [ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components) at `f3c4d42` | 5,655 | 2026-11-15 | MIT | `src/components/ui/button.tsx` | The neubrutalist button: a 2 px border, a hard shadow, and a hover that translates by the shadow offset so the button presses into it | The pattern, rewritten as plain CSS in `styles/neubrutalism.css` |
| [material-components/material-web](https://github.com/material-components/material-web) at `cde7082` | 11,451 | 2026-11-17 | Apache-2.0 | `tokens/versions/v0_192/_md-sys-motion.scss`, `_md-sys-shape.scss` | Material 3 motion durations (50 to 1000 ms), easing curves and corner tokens, read from source because the documentation site renders with script | Token values, cited as facts |
| [material-foundation/material-color-utilities](https://github.com/material-foundation/material-color-utilities) at `f242efc` | 2,304 | 2026-11-16 | Apache-2.0 | README | Tonal palettes from a seed colour (HCT). Named in the Material style page as the way to generate real colour roles | Nothing |
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) at `5e9d8c9` | 98,739 | 2026-11-17 | MIT | `packages/tailwindcss/theme.css` | The default type scale, the 4 px spacing unit, breakpoints and easing tokens, used as reference values in `design-fundamentals.md` | Values, cited as facts |
| [radix-ui/themes](https://github.com/radix-ui/themes) at `1faff10` | 8,858 | 2026-04-11 | MIT | `src/styles/tokens` | Twelve-step colour scales with light and dark pairs; how a token set names radius and space | Nothing |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) at `eb3a2b7` | 19,516 | 2026-10-14 | MIT | README | Reference behaviour for keyboard and focus in tabs, dialogs and menus | Nothing |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) at `968d8cb` | 128,410 | 2026-11-17 | MIT | README, licence | Components you copy and own, on CSS variables. The style system follows the same idea: tokens first, components second | Nothing |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) at `b0b2e49` | 23,340 | 2026-11-17 | MIT | README, licence | Animated components that you copy into your own project, in the shadcn manner. Not studied beyond the README | Nothing |
| [miketromba/css.glass](https://github.com/miketromba/css.glass) at `9b94547` | 458 | 2025-09-15 | No LICENSE file: all rights reserved | file list only | Which controls a glassmorphism generator exposes: blur, transparency, saturation, outline | Nothing (learn only) |
| [alexpate/awesome-design-systems](https://github.com/alexpate/awesome-design-systems) at `5f21c29` | 26,389 | 2026-11-13 | Unlicense | README | An index of public design systems, for cross-checking tokens | Nothing |

### Data

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [d3/d3](https://github.com/d3/d3) at `db118c9` | 113,950 | 2026-11-03 | ISC | README, licence | D3 is modular: `d3-scale` and `d3-shape` are enough for a hand-written SVG chart. `examples/keeling` loads only those two | Patterns only. Loaded from the CDN |

### Lists

| Repo | Stars | Last push | Licence, as written in the repo | Read | What we learned | What was taken |
|---|---|---|---|---|---|---|
| [terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding) at `9643124` | 15,617 | 2026-07-21 | CC0 (stated in README; no LICENSE file) | README | A map of the creative-coding field: used to check that no major library was missed | Nothing |
| [sergey-pimenov/awesome-web-animation](https://github.com/sergey-pimenov/awesome-web-animation) at `c9522f9` | 1,609 | 2026-09-20 | CC0-1.0 | README | A map of web animation libraries and tools: the same use | Nothing |

### What the study changed

- **A stack per job, not one stack.** GSAP is the right tool for scroll choreography and the wrong one for interface motion in React; Motion is the reverse. The router exists because of that.
- **The default got lighter.** Reading Lenis, Splitting, scrollama and the scroll-timeline polyfill showed how much is a few dozen lines on top of the browser. Those lines became the kit, and plain CSS and JavaScript became the default stack.
- **React stacks need a bundler.** The React Three Fiber test failed until React was pinned to the version its renderer was built against. That finding is in the router's cautions and in two references.
- **Accessibility lives in the libraries too.** Lenis, Motion and GSAP each have their own switch for reduced motion. `accessibility.md` has the table.
- **Design guidance came from one place.** Anthropic's frontend-design skill is short and specific about what makes a page look generated. The spec template's design plan and motion plan follow it.

## The research for the style system

The 32 styles in `references/styles.md` were checked against published sources (Nielsen Norman Group, Apple's guidelines and newsroom, MDN, W3C, Wikipedia for art-history styles, and the designers who named the styles). Each style page lists its own sources. Some entries are thinner than others, and say so: aurora, maximalism and editorial are documented as trends or traditions, not as defined web styles. Two candidates were dropped as styles and kept as tools (organic shapes, monochrome), and one name was found not to exist as a design style at all (spectromorphism).

---
# The wider directory: repos for motion graphics and animated websites

A short, checked list of open repositories people use to make motion graphics and animated websites with Claude Code and Codex. brief2motion uses a few of them; the rest are here so you can explore. Stars and licences in this part were checked on 16 Nov 2026.

## The 3D engine

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | The base library for 3D in the browser. Particles, cameras, lights, shaders. | 118,636 | MIT | Yes |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | Lets you write three.js scenes as React components. | 33,767 | MIT | Yes |
| [pmndrs/drei](https://github.com/pmndrs/drei) | Ready-made helpers for react-three-fiber: controls, loaders, point clouds. | 10,167 | MIT | Yes |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | Glow, bloom and depth-of-field effects for three.js scenes. | 2,980 | Zlib | Yes |
| [FarazzShaikh/THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) | Adds your own shader code to three.js materials without rewriting them. | 1,370 | MIT | Yes |
| [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) | Checks how strong the visitor's graphics chip is, so you can switch to a lighter effect. | 1,224 | MIT | Yes |

## Particles and dust

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) | 2D particles, confetti and fireworks for any web page. Good fallback when 3D is too heavy. | 9,099 | MIT | Yes |
| [mustache-dev/Three-VFX](https://github.com/mustache-dev/Three-VFX) | GPU particle system for three.js with WebGPU, plus a CPU fallback. | 154 | MIT | Yes |
| [creativelifeform/three-nebula](https://github.com/creativelifeform/three-nebula) | A mature particle engine for three.js. Emitters, forces, colours over time. | 1,251 | MIT | Yes |
| [dgreenheck/threejs-particle-fluids](https://github.com/dgreenheck/threejs-particle-fluids) | Particles that behave like liquid, for three.js. | 356 | MIT | Yes |
| [pmndrs/maath](https://github.com/pmndrs/maath) | Small maths helpers: easing, random points inside shapes, noise. Handy for particle layouts. | 1,344 | MIT | Yes |
| [stegu/webgl-noise](https://github.com/stegu/webgl-noise) | Plain noise functions in shader code. Gives dust its drifting, organic movement. | 600 | MIT | Yes |
| [patriciogonzalezvivo/lygia](https://github.com/patriciogonzalezvivo/lygia) | A very large shader library. Strong, but the licence has a catch. | 3,494 | Prosperity 3.0 or Patron (NOASSERTION on GitHub) | Yes, with condition: free for non-commercial use only, unless you sponsor or contribute to the project (Patron License) or buy a commercial licence. Treat it as an optional add-on. |
| [cullenwebber/three-ml-sharp](https://github.com/cullenwebber/three-ml-sharp) | Photo to point cloud to particles. The closest public example of a face made of dust. | 123 | None stated | Reference only: no licence means all rights reserved. Read it, do not copy it. |
| [cortiz2894/hologram-particles](https://github.com/cortiz2894/hologram-particles) | A hologram particle effect in WebGPU. Nice to study. | 110 | None stated | Reference only: no licence means all rights reserved. |

## Scroll and page motion

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [greensock/GSAP](https://github.com/greensock/GSAP) | Timelines and ScrollTrigger. The standard tool for scroll-driven scenes. | 30,763 | GSAP Standard 'no charge' licence (not open source) | Yes, with condition: free for commercial work, including code an AI wrote. Not allowed inside no-code animation builders that compete with Webflow. Load it from npm or a CDN, do not copy the files into your own repo. |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | Smooth scrolling. Sits under many award-winning sites. | 17,300 | MIT | Yes |
| [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | Scroll effects and parallax. | 8,899 | MIT | Yes |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) | A small, fast animation engine for plain JavaScript. | 74,805 | MIT | Yes |
| [motiondivision/motion](https://github.com/motiondivision/motion) | Motion (formerly Framer Motion). Animation for React and plain JavaScript. | 35,255 | MIT | Yes |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | A visual editor for keyframes on the web, with three.js support. No updates since Aug 2024. | 13,025 | Apache-2.0 | Yes |

## Ready-made animated components

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | A large library of animated React components, including particle and shader backgrounds. | 52,106 | MIT + Commons Clause (NOASSERTION on GitHub) | Yes, with condition: use them inside your own site or app, paid or not. You may not resell or redistribute the components themselves. |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | Animated components you copy into your app. | 23,309 | MIT | Yes |
| [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | Small animated building blocks for interfaces. | 6,973 | MIT | Yes |
| [hiunicornstudio/unicornstudio.js](https://github.com/hiunicornstudio/unicornstudio.js) | SDK to embed Unicorn Studio WebGL scenes. | 264 | None stated | Reference only: GitHub reports no licence, and the hosted service has its own terms. |

## Faces and depth

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [google-ai-edge/mediapipe](https://github.com/google-ai-edge/mediapipe) | Face landmarks (478 points) in the browser. How you turn a face into points. | 37,716 | Apache-2.0 | Yes, with condition: the code is Apache-2.0. Each model file has its own terms, so read the model card before shipping one. |
| [vladmandic/human](https://github.com/vladmandic/human) | Face detection, mesh and emotion in the browser. | 3,386 | MIT | Yes |
| [tensorflow/tfjs-models](https://github.com/tensorflow/tfjs-models) | Pretrained face and depth models for TensorFlow.js. | 14,814 | Apache-2.0 | Yes |
| [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) | Turns a flat photo into a depth map, so dust can sit in front of or behind a face. | 9,161 | Apache-2.0 (code and Small model); CC-BY-NC-4.0 (Base, Large) | Yes, with condition: only the Small model is Apache-2.0. Base and Large are non-commercial, so do not use them in paid work. |

## After Effects-style files (Lottie, Rive)

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | Plays After Effects animations exported as JSON. No updates since Sep 2025. | 32,476 | MIT | Yes |
| [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | A faster Lottie and dotLottie player. | 947 | MIT | Yes |
| [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) | The web player for Rive files, with state machines for interactive motion. | 1,027 | MIT | Yes |
| [rive-app/rive-react](https://github.com/rive-app/rive-react) | The React wrapper for the Rive player. | 1,190 | MIT | Yes |

## Agent skills you can add

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Official GSAP skills. They teach the agent to use GSAP correctly. | 18,537 | MIT | Yes |
| [Moh4696/open-3d-skills](https://github.com/Moh4696/open-3d-skills) | Eight skills for 3D sites: three.js scenes, scroll films, cursor effects. New (Nov 2026). | 403 | MIT | Yes |
| [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) | 56 motion and video skills in packs, including web animation and WebGL. | 1,654 | MIT | Yes |
| [bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion) | Browser motion graphics: openers, promos, kinetic type. | 2,265 | MIT | Yes |
| [scottstts/Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | A pack of three.js graphics skills. | 997 | MIT | Yes |
| [lhlGitHub/threejs-architecture-effects](https://github.com/lhlGitHub/threejs-architecture-effects) | Self-assembling 3D shapes in three.js. Close to the dust-forms-an-image idea. | 736 | MIT | Yes |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Official Remotion skills for agents. | 7,329 | None stated | Reference only: no licence means all rights reserved. |

## MCP servers

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) | Lets the agent drive a live Blender. Used for models and renders. | 34,630 | MIT | Yes |
| [DmitriyGolub/threejs-devtools-mcp](https://github.com/DmitriyGolub/threejs-devtools-mcp) | Lets the agent inspect and edit a running three.js scene. | 130 | MIT | Yes |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Lets the agent open your page in a real browser, click, scroll and take screenshots. Useful for checking motion. | 39,735 | Apache-2.0 | Yes |
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Gives the agent Chrome DevTools: console, network, performance traces. | 57,517 | Apache-2.0 | Yes |

## Video from code

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Write HTML, render an MP4. The engine behind brief2mp4. | 85,073 | Apache-2.0 | Yes |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | Make videos with React. | 73,621 | Remotion licence (NOASSERTION on GitHub) | Yes, with condition: free for individuals and for-profit companies with up to 3 employees. Larger companies need a paid company licence. |

## Lists to explore further

| Repo | What it is for, in plain words | Stars | Licence | Can I use it in a paid project? |
|---|---|---|---|---|
| [AxiomeCG/awesome-threejs](https://github.com/AxiomeCG/awesome-threejs) | A list of three.js resources. | 1,029 | CC0-1.0 | Yes (it is only a list; each linked project has its own licence) |
| [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | An index of video skills for Claude Code and Codex. | 2,209 | CC0 (list only; GitHub shows NOASSERTION) | Yes (it is only a list; each linked project has its own licence) |
| [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) | Curated skills for GSAP, Motion, Remotion, Lottie and Rive. | 113 | CC0-1.0 | Yes (it is only a list; each linked project has its own licence) |
