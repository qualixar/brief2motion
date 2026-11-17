// Worked example: Copper No. 7, a fictional perfume. Every word and picture here is made up for the example.
// The brief it came from, in one line: "A perfume landing page. The bottle forms from dust, then cardamom, rose and
// amber pour in one after another, then it returns to the bottle. A paper plane flies across when I scroll."
// Everything the brief changes is in this file; the engine files next to it are the template, unchanged.
export const cfg = {
  colors: {
    paper: '#f4efe6',
    'paper-2': '#fffaf2',
    ink: '#1d1b18',
    accent: '#9a4408',
  },

  assemble: {
    // four shapes: the bottle, then one picture per ingredient (512 px square sources are plenty)
    targets: [
      { type: 'image', src: 'assets/product.jpg', relief: 0.08, fill: 0.78 },
      { type: 'image', src: 'assets/shape-cardamom.jpg', relief: 0.08, fill: 0.68 },
      { type: 'image', src: 'assets/shape-rose.jpg', relief: 0.08, fill: 0.68 },
      { type: 'image', src: 'assets/shape-amber.jpg', relief: 0.08, fill: 0.68 },
    ],
    // the story the scroll tells: bottle, each ingredient, back into the bottle
    sequence: [0, 1, 0, 2, 0, 3, 0],
    // one caption card per step, and a tint the whole hero grades into
    captions: [
      null,
      { kicker: 'Top note', n: '01', title: 'Cardamom', body: 'Green and bright: the first minute after you spray.', tint: '#dfe6cf' },
      { kicker: 'Into the bottle', title: 'Poured in, drop by drop.', tint: '#efdcc4' },
      { kicker: 'Heart note', n: '02', title: 'Rose and saffron', body: 'Soft rose with a warm thread of saffron underneath.', tint: '#f1d6d3' },
      { kicker: 'Into the bottle', title: 'Layered over the cardamom.', tint: '#efdcc4' },
      { kicker: 'Base note', n: '03', title: 'Amber and cedar', body: 'Resin and wood that stay on your skin by evening.', tint: '#ead7bd' },
      { kicker: 'Eau de parfum · 50 ml', title: 'Copper No. 7', body: 'Three notes, one copper still.', tint: '#f4efe6' },
    ],
    colour: 'photo',      // each dot takes the picture's colour
    offsetX: 0.2,         // the subject sits right of the headline on wide screens
    assembleOnLoad: true, // the dust forms on its own at load; scrolling drives the burst and the plane
    points: { desktop: 60000, mobile: 25000 },
    seed: 7,
    seconds: 3.2,
  },
  flight: { trigger: 'scroll', at: 0.45, duration: 1.2, section: '#hero',
    path: 'M -60 470 C 220 380, 380 120, 620 200 S 900 420, 1080 90' },
  scroll: { length: 600 },

  page: {
    brand: 'Copper No. 7',
    title: 'Copper No. 7 · Eau de parfum',
    description: 'Copper No. 7 is an eau de parfum of cardamom, rose, saffron, amber and cedar, distilled in small batches.',
    nav: {
      links: [{ label: 'Notes', href: '#story' }, { label: 'Details', href: '#details' }, { label: 'Craft', href: '#process' }],
      cta: { label: 'Reserve a bottle', href: '#reserve' },
    },
    hero: {
      kicker: 'Eau de parfum',
      headline: 'Bottled from a single copper still.',
      subline: 'Warm amber, cardamom and cedar, distilled slowly in small batches.',
      ctas: [{ label: 'Reserve a bottle', href: '#reserve' }, { label: 'Explore the notes', href: '#story' }],
      alt: 'A perfume bottle forming out of dust',
    },
    chaptersId: 'story',
    chapters: [
      { kicker: 'Top note', title: 'Cardamom, cracked fresh.', body: 'The first minute is bright and green, the way a pod smells the moment you split it.', colour: '#5f7a3a',
        image: 'assets/notes-1-1200.webp', srcset: 'assets/notes-1-720.webp 720w, assets/notes-1-1200.webp 1200w', alt: 'Green cardamom pods, some split open, with a small copper dish' },
      { kicker: 'Heart note', title: 'Rose and a thread of saffron.', body: 'As it settles, the warmth arrives: soft rose with saffron underneath, never sweet.', colour: '#b4532a',
        image: 'assets/notes-2-1200.webp', srcset: 'assets/notes-2-720.webp 720w, assets/notes-2-1200.webp 1200w', alt: 'Dried rose petals and a rosebud with saffron threads' },
      { kicker: 'Base note', title: 'Amber and cedar, for hours.', body: 'What stays on your skin by evening is resin and wood, quiet and close.', colour: '#7a4a1e',
        image: 'assets/notes-3-1200.webp', srcset: 'assets/notes-3-720.webp 720w, assets/notes-3-1200.webp 1200w', alt: 'Raw amber resin beside a block of cedar and a wood shaving' },
    ],
    collection: {
      id: 'collection', kicker: 'The collection', title: 'Three bottles, one still.',
      items: [
        { name: 'Copper No. 7', scent: 'Warm amber, cardamom and cedar.', colour: '#c9811f', image: 'assets/collection-1.webp', alt: 'Copper No. 7: a rectangular bottle of warm amber perfume with a brushed copper cap' },
        { name: 'Rose No. 3', scent: 'Rose, saffron and pink pepper.', colour: '#e49aa6', image: 'assets/collection-2.webp', alt: 'Rose No. 3: a rectangular bottle of soft rose-pink perfume with a brushed copper cap' },
        { name: 'Vetiver No. 9', scent: 'Vetiver, bergamot and green tea.', colour: '#a9c08a', image: 'assets/collection-3.webp', alt: 'Vetiver No. 9: a rectangular bottle of pale green perfume with a brushed copper cap' },
      ],
    },
    details: {
      id: 'details', kicker: 'In the box', title: 'The bottle',
      items: [
        { value: '50 ml', label: 'Eau de parfum' },
        { value: 'Small batch', label: 'Distilled in copper' },
        { value: 'Refillable', label: 'Weighted copper cap' },
        { value: 'Glass', label: 'Recyclable bottle' },
      ],
    },
    process: {
      id: 'process', kicker: 'The craft', title: 'How it is made',
      steps: [
        { title: 'Distil', body: 'Each batch runs slowly through one copper still.' },
        { title: 'Rest', body: 'The blend rests for weeks so the notes can settle.' },
        { title: 'Bottle', body: 'Poured and capped by hand, a few hundred at a time.' },
      ],
    },
    cta: { id: 'reserve', kicker: 'Small batch', title: 'Your bottle, poured to order.', body: 'Reserve now and we will write to you when your batch is ready.', button: { label: 'Reserve a bottle', href: '#top' } },
    footer: { text: 'A fictional brand, written as a worked example.' },
  },
};
