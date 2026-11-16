// brief2motion: everything a brief changes lives here. The agent edits this file, not the engine.
export const cfg = {
  colors: {
    paper: '#f4efe6',   // page background (light theme default)
    'paper-2': '#fffaf2',
    ink: '#1d1b18',     // particle and text colour
    accent: '#c2410c',  // one saturated accent (plane, links)
  },
  assemble: {
    // up to 2 targets: the dust forms target 1, then morphs into target 2
    targets: [
      // style: 'halftone' = evenly spaced round dots sized by darkness (faces); omit for stipple (products, logos)
      // mask: 'oval' fades photo edges so the background does not become dots
      { type: 'image', src: 'assets/target.png', depth: null, relief: 0.18 },
      // { type: 'text', text: 'Your Brand' },
    ],
    points: { desktop: 120000, mobile: 25000 },
    seed: 7,
    seconds: 3.2,       // used when scroll is off
  },
  flight: { trigger: 'scroll', at: 0.45, duration: 1.2, section: '#hero',
    path: 'M -60 470 C 220 380, 380 120, 620 200 S 900 420, 1080 90' },
  scroll: { length: 250 },   // set to null for a timed (no-scroll) hero
};
