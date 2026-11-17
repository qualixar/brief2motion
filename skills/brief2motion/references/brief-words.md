# Brief words to settings

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
