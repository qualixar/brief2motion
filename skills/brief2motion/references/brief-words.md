# Brief words to settings

Two tables. The first maps what a brief says to a stack and a reference, for any site. The second maps phrases to `config.js` settings for the dust engine. `scripts/route.mjs` applies the first table for you; `references/routing.json` is its full list.

## Any site: phrase to stack

| If the brief says | Stack | Read |
|---|---|---|
| "fade in", "subtle", "on hover", "no libraries", "lightweight" | plain CSS and JavaScript with the kit | `stacks/vanilla.md` |
| "made of dust", "particles form", "halftone portrait" | the dust engine | `stacks/particles.md` |
| "as you scroll", "pinned", "scrub", "horizontal scroll", "image sequence", "parallax" | GSAP with ScrollTrigger and Lenis | `stacks/gsap.md`, `stacks/scroll-story.md` |
| "kinetic type", "word by word", "headline animates", "springy" | Motion (vanilla) | `stacks/motion.md`, `stacks/kinetic-type.md` |
| "React" or "Next.js" with "drag", "reorder", "tabs", "layout animation", "dashboard" | Motion for React | `stacks/motion.md` |
| "3D", "turntable", "rotate the product", "exploded view", "shader" | three.js; React Three Fiber if the project is React | `stacks/three.md` |
| "page transitions", "between pages", "thumbnail grows into the page", "filter the grid" | View Transitions API | `stacks/view-transitions.md` |
| "draws itself", "line animation", "chart", "data story", "count up" | SVG with the kit, D3 for scales | `stacks/svg-players.md`, `stacks/scroll-story.md` |
| "Lottie", "After Effects", "Rive", "animated icons", "mascot" | the players in the kit | `stacks/svg-players.md` |
| "fluid simulation", "millions of", "physics" | read the note before choosing | `stacks/wasm.md` |

| If the brief says | It also means |
|---|---|
| "calm", "premium", "elegant" | few movements, 300 to 500 ms, ease-out, no bounce; minimalism or editorial |
| "playful", "fun", "friendly" | springs with a little overshoot, squash on press; claymorphism, Memphis or neubrutalism |
| "bold", "loud" | fast, physical moves of 100 to 200 ms, hard edges; neubrutalism or maximalism |
| "fast", "works on phones", "accessible" | the default stack, fewer effects, check the phone run twice |
| "like Apple", "like Stripe", "like Linear" | ask what about it: the glass, the gradient, the scroll scenes, the restraint. Build that quality, never a copy |
| "make it pop", "feel alive", "modern" | too vague to route: propose one planned entrance in SPEC.md and build that |

## The dust engine: phrase to setting

| If the brief says | Do this |
|---|---|
| "made of dust", "particles", "dots", "sand", "stardust" | assemble, stipple style |
| "portrait", "my face", "a person", "halftone", "newspaper look", "proper circles" | assemble, `style: 'halftone'`, `mask: 'oval'`, crop to the head |
| "my product", "my bottle / shoe / phone" | assemble, stipple, crop to the product on a plain background |
| "my logo", "my brand name", "a word" | assemble, `type: 'text'` (or the logo file) |
| "turns into", "becomes", "morphs into" | two targets: the dust forms the first, bursts, re-forms as the second |
| "pours into", "ingredients", "then back to the product", "story of three things" | up to four targets and a `sequence` such as `[0, 1, 0, 2, 0]`, plus `captions` (one card per step) |
| "caption", "label each step", "name each one as it appears" | `assemble.captions`: `{ kicker, title, body, tint }` per sequence step |
| "next to the headline", "product on the right" | `assemble.offsetX` 0.2 (share of the screen width), `fill` 0.7 to 0.85 |
| "the page should load fast", "show something immediately" | `assembleOnLoad: true`, fewer `points`, chapter images at 1200 px with a 720 px `srcset` |
| "headline", "tagline", "button", "sections", "about / details / steps" | the `page` block: `hero`, `chapters`, `details`, `process`, `cta`, `footer` |
| "dramatic", "drama", "epic" | keep the burst between targets, `scroll.length` 300, a longer hold on each target |
| "calm", "subtle", "minimal" | one target, `scroll: null`, `assemble.seconds` 4.5, no flight |
| "a plane flies", "something flies across" | flight, `trigger: 'scroll'` (or `'time'` if no scroll) |
| "when I scroll", "as you scroll", "scrollytelling" | scroll on; the hero pins while the dust forms |
| "fast", "loads quickly", "works on phones" | lower `points.mobile`, check the phone budget twice |
| "dark", "night", "space" | swap the colours: dark paper, light ink (the engine adapts to either) |
