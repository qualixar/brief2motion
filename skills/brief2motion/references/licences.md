# Licences: what brief2motion bundles, loads and offers

Checked on 16 Nov 2026; the GSAP terms were read again on 17 Nov 2026, and the table of loaded libraries was brought up to version 1.0.0 the same day. Tweakpane and the credits table (section 4) were added on 22 Nov 2026, with the link check of `web-references.md`; axe-core was added the same day with site mode. This is a plain guide, not legal advice.

brief2motion has three kinds of code. Keep them apart.

## 1. Bundled: our own code only (MIT)

Everything inside this repository, the skill text, the templates and the scripts, is our own work under the MIT licence (see `LICENSE`). We copy no third-party library source into the repo. That is why the repo stays MIT and why you can reuse the output in a paid project. The pictures in `examples/copper-no-7/` are images made for that example; how each was made and what you may do with it is in `examples/copper-no-7/CREDITS.md`. The demo images in `assets/` are listed in the README.

## 2. Loaded from a CDN at runtime (never copied into the repo)

A generated page asks a CDN for these files when a visitor opens it. The versions are pinned. Fixed files on script tags carry integrity hashes (SRI), so the browser rejects a file that has changed. The CDN is `cdn.jsdelivr.net`, the only third-party host a page talks to, and both checkers fail a page if any other host shows up.

| Library | Version | Licence | What it means for you |
|---|---|---|---|
| three.js | r187 (npm 0.187.0) | MIT | Free for any use. Keep the copyright notice. |
| GSAP, with ScrollTrigger, SplitText, DrawSVG, MotionPath | 3.15.1 | GSAP Standard "no charge" licence (not open source) | Free for commercial work, including code an AI wrote. Not allowed inside no-code animation builders that compete with Webflow. The licence forbids removing its notices, so load it from the CDN or npm; if you must work offline, save the pinned files next to the site with their copyright headers. We do not ship the files. |
| Lenis | 1.3.27 | MIT | Free for any use. Keep the copyright notice. |
| Motion (`motion`, `motion/react`) | 14.14.0 | MIT | Free for any use. Motion+ is a separate paid product and is not used. |
| React, React DOM | 19.3.1 | MIT | Free for any use. |
| htm | 3.1.1 | Apache-2.0 | Free for any use. Keep the notice. |
| lottie-web (light build) | 5.13.0 | MIT | Free for any use. The animation files you play have their own licences. |
| Rive runtime (`@rive-app/canvas-lite`) | 2.51.0 | MIT | Free for any use. The `.riv` files you play have their own licences. |
| d3-scale, d3-shape | 4.0.2, 3.2.0 | ISC | Free for any use. Keep the notice. |
| React Three Fiber, drei | 9.8.2, 10.7.9 | MIT | Used only in React projects with a bundler, and in this repo's test page. |
| Tweakpane | 4.0.5 | MIT | Development only. `kit/tune.js` fetches it, checked against an integrity hash, when the address has `?tune`. `scripts/strip_tune.mjs` removes the loader and the file before delivery and `check_site.mjs` fails a page that still has either, so it is not in a shipped page. Free for any use; keep the copyright notice. |

Source for GSAP terms: https://gsap.com/community/standard-license/ (the page lists "Prohibited Uses" as tools that let users build visual animations without code and compete with Webflow, and says AI-generated GSAP code is not a prohibited use). If your project is that kind of tool, do not use GSAP: the kit and Motion cover most of the same ground.

jsDelivr's `+esm` addresses are bundles it generates on request. They cannot carry an integrity hash, and they resolve a package's own dependencies at build time. Pin exact versions, and use them for demos and small pages; a real React project should install from npm and bundle.

Code taken from other projects: none is copied into this repository. `NOTICE` at the repo root lists the projects whose published patterns shaped the kit and the examples, with their licences.

**Fonts.** The page uses system font stacks (Georgia for headings, the operating system's UI font for text), so no font file is downloaded and no request goes to a font service. If you add a web font, host the file yourself, keep its licence notice (Fraunces and Inter, for example, are under the SIL Open Font Licence 1.1), and add it to the notice below. Loading fonts from a third-party font service sends every visitor's IP address to that service, which in some regions needs consent.

## 3. Optional add-ons (only if you choose them)

| Add-on | Licence | Rule |
|---|---|---|
| LYGIA (shader library) | Prosperity Public License 3.0 (non-commercial, plus a 30-day commercial trial) or the Patron License for GitHub sponsors and contributors | Never bundled. The skill fetches it into your project only if you ask, and says so in your report. Free for non-commercial use. For commercial use, sponsor or contribute to the project, or buy a commercial licence from the author. |
| Depth Anything V2 Small, via `onnx-community/depth-anything-v2-small` | Apache-2.0 (checked on Hugging Face, 16 Nov 2026) | Fine for paid work. Used to turn a photo into a depth map in the browser. |
| Depth Anything V2 Base and Large | CC-BY-NC-4.0 | Non-commercial. The skill never uses them. Do not swap them in for paid work. |

Two more things to know. react-bits is MIT plus the Commons Clause: use its components inside your own site, never resell or repackage them. Repos with no licence file (for example three-ml-sharp and hologram-particles) are reference only: read them, do not copy their code. The full list is in `RESOURCES.md`.

## 4. Credits: every tool this skill uses or loads

Name, who makes it, where to find it, its licence, and where the skill uses it. Nothing here is copied into this repository. The licence column is what the project's own repository or package states (GSAP: the page quoted above).

| Tool | By | Link | Licence | Where it is used |
|---|---|---|---|---|
| three.js | mrdoob and the three.js authors | <https://threejs.org/> | MIT | 3D stacks, `kit/three-stage.js`, pinned at 0.187.0 |
| React Three Fiber, drei | Poimandres (pmndrs) | <https://github.com/pmndrs/react-three-fiber>, <https://github.com/pmndrs/drei> | MIT | 3D inside React projects |
| GSAP with ScrollTrigger, SplitText, DrawSVG, MotionPath | GreenSock | <https://gsap.com/> | GSAP Standard "no charge" licence | scroll, text and path choreography, pinned at 3.15.1 |
| Lenis | darkroom.engineering | <https://lenis.dev/> | MIT | smooth scrolling |
| Motion | Motion | <https://motion.dev/> | MIT | springs and layout animation, vanilla and React |
| React, React DOM | Meta | <https://react.dev/> | MIT | React stack examples |
| htm | developit | <https://github.com/developit/htm> | Apache-2.0 | JSX-free React examples |
| lottie-web | Airbnb | <https://github.com/airbnb/lottie-web> | MIT | Lottie playback in `kit/players.js` |
| Rive runtime | Rive | <https://github.com/rive-app/rive-wasm> | MIT | Rive playback in `kit/players.js` |
| d3-scale, d3-shape | the D3 authors | <https://d3js.org/> | ISC | chart maths in the data-story example |
| Tweakpane | cocopon | <https://tweakpane.github.io/docs/> | MIT | dev-only tuning panel, `kit/tune.js` |
| playwright-core | Microsoft | <https://playwright.dev/> | Apache-2.0 | drives Chrome for the checks; downloaded on first use, not shipped |
| axe-core | Deque Systems | <https://github.com/dequelabs/axe-core> | MPL-2.0 | `check_a11y.mjs` (site mode): fetched at check time from cdn.jsdelivr.net at 4.14.1, verified against a SHA-384 hash, injected into the checker's page; never in a built site or this repository |
| LYGIA | Patricio Gonzalez Vivo | <https://lygia.xyz/> | Prosperity Public License 3.0 or Patron License | optional shader library, never bundled |
| Depth Anything V2 Small | the Depth Anything authors, via onnx-community | <https://huggingface.co/onnx-community/depth-anything-v2-small> | Apache-2.0 | optional photo-to-depth model |

**axe-core and the Mozilla Public License.** axe-core is a development-time checker, like playwright-core. `check_a11y.mjs` downloads one pinned, hash-verified file into the checker's cache folder (`~/.cache/brief2motion/deps/axe-core/`) and evaluates it in a page the checker opened itself. We do not modify it, copy any of it into this repository, or put it in a site, so the MPL's file-level obligations (publish changes to MPL files) are not triggered and the project stays MIT. Offline with nothing cached, the axe results are PENDING and the check says so. If you ship axe-core with a product of your own, keep its licence header and read the MPL-2.0 text: <https://www.mozilla.org/MPL/2.0/>.

**Sites linked for study.** `web-references.md` links award galleries, component libraries, platform documentation and canonical demos. They are there to be looked at. The skill copies nothing from them, and the page records each site's stated terms or says that none were found.

## Template: LICENCES-NOTICE.md (the skill writes this into each user project)

````markdown
# Licences used in this project

Written by brief2motion on {{DATE}}. Plain guide, not legal advice.

## Loaded from a CDN when the page opens
List only what this page really loads, with the pinned version. Lines to choose from:
- three.js {{VERSION}} (MIT), copyright the three.js authors.
- GSAP {{VERSION}} (GSAP Standard "no charge" licence), https://gsap.com/community/standard-license/
  Free for commercial use. Not allowed in no-code animation builders that compete with Webflow.
- Lenis {{VERSION}} (MIT), copyright darkroom.engineering.
- Motion {{VERSION}} (MIT), copyright Motion.
- React and React DOM {{VERSION}} (MIT), copyright Meta Platforms. htm {{VERSION}} (Apache-2.0).
- lottie-web {{VERSION}} (MIT), copyright Bodymovin. Rive runtime {{VERSION}} (MIT), copyright Rive.
- d3-scale and d3-shape {{VERSION}} (ISC), copyright Mike Bostock.

## Fonts
- System fonts only. {{WEB_FONTS_OR_NONE}}

## Code written for this project
- The page, scripts and shaders generated by brief2motion are MIT (copyright 2026 Varun Pratap Bhardwaj and the project owner).

## Optional add-ons used in this project
{{ADDONS_OR_NONE}}
<!-- If LYGIA was used: "LYGIA shader library, Prosperity Public License 3.0 or Patron License. Free for non-commercial use. For commercial use, sponsor or contribute to the project, or get a commercial licence: https://lygia.xyz/license" -->
<!-- If Depth Anything was used: "Depth Anything V2 Small (Apache-2.0), model onnx-community/depth-anything-v2-small. Base and Large models are CC-BY-NC-4.0 and are not used." -->

## Your own images and text
- Any photo, logo or face you gave us stays yours. You are responsible for having the right to use it. Do not use someone's face or brand without their permission.
````
