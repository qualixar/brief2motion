# Resources: a reading list for motion work

A checked list of open repositories for motion graphics and animated websites, with what each is for and its licence, so you can explore further. It is a reading list: brief2motion loads only the libraries named in [`references/licences.md`](skills/brief2motion/references/licences.md), and no code from these projects is copied into this repository.

## How to read the licence column

A licence is the owner's rule for what you may do with their code. MIT, Apache-2.0, BSD, ISC, Zlib and the Unlicense are the easy ones: you can use the code in a paid project, as long as you keep their notice where one is required. "No LICENSE file" is not the same as free: with no licence, the author keeps all rights, so you may read the repo and learn from it, but you should not copy its code. A few use a custom licence with a condition, and the row says what the condition is. This is a plain-language guide, not legal advice.

## The rule this repository follows

No code from another project is copied into this repository. Everything in `skills/`, `examples/` and `tests/` was written for it. Libraries that built pages use are loaded from a CDN at pinned versions and never bundled; [NOTICE](NOTICE) lists them with their licences.

## The research for the style system

The 32 styles in `references/styles.md` were checked against published sources (Nielsen Norman Group, Apple's guidelines and newsroom, MDN, W3C, Wikipedia for art-history styles, and the designers who named the styles). Each style page lists its own sources. Some entries are thinner than others, and say so: aurora, maximalism and editorial are documented as trends or traditions, not as defined web styles. Two candidates were dropped as styles and kept as tools (organic shapes, monochrome), and one name was found not to exist as a design style at all (spectromorphism).

---
# The directory: repos for motion graphics and animated websites

Open repositories people use to make motion graphics and animated websites with Claude Code and Codex. brief2motion loads a few of them at run time (the libraries in NOTICE); the rest are here to explore. Stars and licences in this part were checked on 16 Nov 2026.

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
| [lhlGitHub/threejs-architecture-effects](https://github.com/lhlGitHub/threejs-architecture-effects) | Self-assembling 3D shapes in three.js, a relative of the dust that forms a picture. | 736 | MIT | Yes |
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
