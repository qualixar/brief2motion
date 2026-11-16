# Brief words to settings

| If the brief says | Do this |
|---|---|
| "made of dust", "particles", "dots", "sand", "stardust" | assemble, stipple style |
| "portrait", "my face", "a person", "halftone", "newspaper look", "proper circles" | assemble, `style: 'halftone'`, `mask: 'oval'`, crop to the head |
| "my product", "my bottle / shoe / phone" | assemble, stipple, crop to the product on a plain background |
| "my logo", "my brand name", "a word" | assemble, `type: 'text'` (or the logo file) |
| "turns into", "becomes", "morphs into" | two targets: the dust forms the first, bursts, re-forms as the second |
| "dramatic", "drama", "epic" | keep the burst between targets, `scroll.length` 300, a longer hold on each target |
| "calm", "subtle", "minimal" | one target, `scroll: null`, `assemble.seconds` 4.5, no flight |
| "a plane flies", "something flies across" | flight, `trigger: 'scroll'` (or `'time'` if no scroll) |
| "when I scroll", "as you scroll", "scrollytelling" | scroll on; the hero pins while the dust forms |
| "fast", "loads quickly", "works on phones" | lower `points.mobile`, check the phone budget twice |
| "dark", "night", "space" | swap the colours: dark paper, light ink (the engine adapts to either) |
