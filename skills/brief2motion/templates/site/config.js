// brief2motion: everything a brief changes lives here. The agent edits this file, not the engine.
// This starter runs with no images: the dust forms a word, the chapters show colour swatches.
// Replace EVERY text field below with copy written from the user's brief. Never ship invented reviews,
// ratings, customer names or statistics. A worked example with photos, a sequence and captions: examples/copper-no-7/
//
// assemble.targets   up to 4 shapes the dust forms. { type: 'image', src, style, mask, relief, fill } or { type: 'text', text, font, fill }
//                    style 'halftone' = round dots on a grid (faces); leave it out for stipple (products, logos)
//                    mask 'oval' fades photo edges; fill = share of the frame height the subject takes (default 0.84)
// assemble.sequence  optional. The order the shapes appear, repeats allowed: [0, 1, 0, 2] = shape 1 pours into shape 0, then shape 2
// assemble.captions  optional, one per sequence step: null | 'Title' | { kicker, n, title, body, tint }
// assemble.colour    'photo' = each dot takes the picture's colour; leave it out for one ink colour
// assemble.offsetX   share of the screen width the subject moves right on wide screens (0 = centred); offsetY moves it up.
//                    The subject shrinks if the move would push it off screen.
// assemble.points    dots per screen size. Lower them if the frame-time check fails.
// scroll.length      how long the hero stays pinned, in % of a screen. Set scroll to null for a timed hero (no scroll).
// images in page.*   chapters and collection items take `image`, plus optional `srcset` and `sizes` so phones download a small file.
//                    Sizes that fit the 1.5 MiB budget: chapter 1200 px wide (and 720 px in srcset), collection 600 px wide, shapes 512 px.
export const cfg = {
  colors: {
    paper: '#f4efe6',   // page background (light theme default)
    'paper-2': '#fffaf2',
    ink: '#1d1b18',     // text and particle colour
    accent: '#9a4408',  // one saturated accent (buttons, kickers, the plane); keep 4.5:1 contrast on paper
  },

  assemble: {
    targets: [
      { type: 'text', text: 'Your brand', fill: 0.6 },
    ],
    offsetX: 0.16,        // up to 0.2 for a tall subject, less for a wide word
    offsetY: 0.14,        // share of the screen height the subject moves up on wide screens
    assembleOnLoad: true, // the dust forms on its own at load; scrolling drives the burst and the plane
    points: { desktop: 60000, mobile: 25000 },
    seed: 7,
    seconds: 3.2,         // used when scroll is off or with ?play
  },
  flight: { trigger: 'scroll', at: 0.45, duration: 1.2, section: '#hero',
    path: 'M -60 470 C 220 380, 380 120, 620 200 S 900 420, 1080 90' },   // SVG path in a 1000 x 600 box
  scroll: { length: 250 },   // set to null for a timed hero

  // The page: every word on it comes from here.
  page: {
    brand: 'Your brand',
    title: 'Your brand · what it offers, in one line',   // also write this into index.html
    description: 'One or two plain sentences on what this page is about. Shown in search results and link previews.',
    nav: {
      links: [{ label: 'About', href: '#story' }, { label: 'Details', href: '#details' }, { label: 'How', href: '#process' }],
      cta: { label: 'Get started', href: '#start' },
    },
    hero: {
      kicker: 'A short label',
      headline: 'Your headline goes here.',
      subline: 'One sentence that says what you do and who it is for.',
      ctas: [{ label: 'Get started', href: '#start' }, { label: 'Learn more', href: '#story' }],
      alt: 'Dust forming the words Your brand',
    },
    chaptersId: 'story',
    chapters: [   // add image: 'assets/one.jpg' (and srcset) to show a photo instead of the colour swatch
      { kicker: 'First', title: 'The first thing to say.', body: 'Two short sentences. What it is, and why a visitor should care.', colour: '#5f7a3a' },
      { kicker: 'Second', title: 'The second thing to say.', body: 'Two short sentences. A detail that makes the first one believable.', colour: '#b4532a' },
    ],
    // collection: { id: 'collection', kicker: 'Range', title: 'Three of them.', items: [{ name: 'One', scent: 'A line about it.', colour: '#c9811f', image: 'assets/one.jpg', alt: 'What the picture shows' }] },
    details: {
      id: 'details', kicker: 'The facts', title: 'Details',
      items: [
        { value: 'Fact one', label: 'What it means' },
        { value: 'Fact two', label: 'What it means' },
        { value: 'Fact three', label: 'What it means' },
        { value: 'Fact four', label: 'What it means' },
      ],
    },
    process: {
      id: 'process', kicker: 'How it works', title: 'Three steps',
      steps: [
        { title: 'Step one', body: 'What happens first.' },
        { title: 'Step two', body: 'What happens next.' },
        { title: 'Step three', body: 'What the visitor ends up with.' },
      ],
    },
    cta: { id: 'start', kicker: 'Ready', title: 'One clear next step.', body: 'A sentence that tells the visitor exactly what the button does.', button: { label: 'Get started', href: '#top' } },
    footer: { text: 'A short line for the footer.' },   // credit line defaults to 'Built from one brief with brief2motion'; set credit: '' to hide
  },
};
