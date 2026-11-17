# WebAssembly (Rust): when it helps and when it does not

A note, not a stack. Almost no motion on a website needs WebAssembly, and reaching for it early makes a page heavier and harder to change.

## It does not help with

- Moving DOM elements, SVG or CSS. The cost there is layout and paint inside the browser, which WebAssembly cannot touch.
- Drawing. WebGL and WebGPU already run on the GPU. A particle system that moves its points in a vertex shader (`particles.md`) handles hundreds of thousands of dots with no WebAssembly.
- Ordinary tweens, springs and scroll maths. JavaScript does these in microseconds.

## It can help with

Heavy arithmetic on the CPU, every frame, over large arrays:

- physics with thousands of bodies and real collisions (Rapier, written in Rust, ships as WebAssembly);
- fluid, cloth or soft-body simulation that cannot be expressed as a shader;
- decoding or processing images, video or audio in the page;
- geometry work: mesh simplification, boolean operations, path finding.

Several libraries this skill already points at are WebAssembly inside and need no Rust from you: the Rive runtime, the dotLottie player, Draco and Meshopt decoders for glTF, Rapier.

## If a brief really needs your own

1. Prove the JavaScript version is too slow first. Measure it with the phone run of `check_site.mjs`.
2. Try a typed-array rewrite in JavaScript, then a Web Worker. Both are often enough.
3. Then Rust with `wasm-bindgen` and `wasm-pack build --target web`, which produces an ES module and a `.wasm` file to serve with the site.

Rules if you do:

- Share memory, do not copy: expose a `Float32Array` view over the module's memory and upload it to the GPU directly.
- Cross the JavaScript boundary once per frame, not once per particle.
- Load the module after the first paint and show the still state until it is ready. A `.wasm` file is page weight: the 1.5 MiB budget still applies.
- It needs a build step (the Rust toolchain), so the site is no longer "copy the folder and serve it". Commit the built files and say how to rebuild them in `REPORT.md`.
- Serve `.wasm` with the `application/wasm` type, or streaming compilation falls back to a slower path.

This skill ships no Rust and has not measured a WebAssembly page. Treat this as guidance to reason from, not a tested recipe.
