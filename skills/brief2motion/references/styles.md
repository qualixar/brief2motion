# The style system

32 visual styles and approaches for the web, each checked against a published source on 2026-11-17. This is the index. When a brief names or implies a style, open that style's own page for its tokens, tested CSS, motion and accessibility notes. `route.mjs` picks one from a brief and says why.

A style is a starting point for the look, never a reason to ignore the brief. If the brief gives colours, type or a reference site, those win. If it gives none, pick the style whose "choose it for" matches the product and audience, and say in SPEC.md why.

## Surface styles

| Style | What it is | Choose it for | Avoid it for |
|---|---|---|---|
| [Neubrutalism](styles/neubrutalism.md) | Thick black outlines, hard offset shadows with no blur, and two or three loud flat colours. | Creator tools, indie products, developer tools, events, consumer brands that want a voice | Banking, healthcare, dense enterprise screens |
| [Web brutalism](styles/brutalism.md) | The unstyled look on purpose: default fonts, visible structure, blue links, no decoration. | Art, architecture and design studios, manifestos, personal sites | Anything that has to sell or convert |
| [Glassmorphism](styles/glassmorphism.md) | Frosted panels: a see-through fill, a blur of whatever is behind, a thin light edge and a soft shadow, floating over a colourful background. | Navigation bars, overlays and cards over pictures or gradients | Long reading text, data tables, low-end devices |
| [Liquid Glass-inspired](styles/liquid-glass.md) | Glass that behaves like a lens: controls float in a thin clear layer above the content, pick up its colour, and have a bright rim. | Media and photo products, Apple-platform companions, floating toolbars | Text-heavy pages, anything where the glass would sit on the content itself |
| [Neumorphism (soft UI)](styles/neumorphism.md) | Shapes pushed out of, or pressed into, a surface of the same colour, drawn only with one light shadow and one dark shadow. | A few decorative controls: a music player, a smart-home dial | Forms, data-heavy apps, anything that must be scanned quickly |
| [Claymorphism](styles/claymorphism.md) | Inflated, toy-like shapes: very round corners, two inner shadows that model the form, and one big soft coloured shadow underneath. | Children and education products, playful consumer apps, onboarding screens | Finance, legal, anything that should feel sober |
| [Skeuomorphism](styles/skeuomorphism.md) | Controls drawn like the physical things they stand for: metal knobs, leather, paper, switches with real lighting. | Audio tools and instruments, games, products where a physical metaphor teaches the use | Content sites, large design systems that must scale |
| [Flat design](styles/flat.md) | No depth at all: solid fills, clear type, simple icons, strong colour. | Marketing sites, dashboards, documentation, anything that must load fast | Products that rely on a physical metaphor |
| [Material Design 3](styles/material.md) | Google's system: tonal colour roles from one seed colour, surfaces at a few elevation levels, generous rounding and a defined motion scale. | Android and Google-ecosystem products, utility apps, teams that want a ready system | Brands that must not look like an Android app |

## Layout and type styles

| Style | What it is | Choose it for | Avoid it for |
|---|---|---|---|
| [Swiss / International Typographic Style](styles/swiss.md) | A strict grid, one grotesque typeface, flush-left text and lots of white space. | Editorial sites, portfolios, B2B, culture, anything led by text | Brands that want warmth or playfulness |
| [Minimalism](styles/minimalism.md) | As few elements as the job allows: one idea per screen, wide margins, one accent, and nothing ornamental. | Premium products, portfolios, focused tools, any brief that says calm | Products that must show a lot at once |
| [Maximalism](styles/maximalism.md) | More is more: clashing colour, layered pattern, several typefaces, everything large and overlapping, held together by repetition. | Fashion, music, festivals, youth brands, campaigns | Tools, checkouts, anything people use while stressed |
| [Bento grid](styles/bento.md) | A grid of rounded tiles of different sizes, like a lunch box. | Feature overviews, product pages, dashboards, portfolios | Arguments that have to be read in order |
| [Editorial / magazine](styles/editorial.md) | A printed page on screen: a serif headline, a standfirst, columns, pull quotes, captions and rules. | Publications, long-form stories, luxury and culture brands, case studies | Dense apps and tools |

## Retro and themed styles

| Style | What it is | Choose it for | Avoid it for |
|---|---|---|---|
| [Y2K](styles/y2k.md) | The late-1990s vision of the future: chrome, bubbly rounded type, translucent plastic, lime and hot pink, shiny gradients. | Fashion, music, youth brands, nostalgia campaigns | Serious or long-lived product interfaces |
| [Frutiger Aero](styles/frutiger-aero.md) | Glossy optimism from the Windows Vista era: sky blues and grass greens, water drops, bokeh, glassy rounded buttons. | Nostalgia projects, climate and wellness brands that want an optimistic tone | Anything that must look current and neutral |
| [Vaporwave](styles/vaporwave.md) | An ironic remix of 1990s computing and mall culture: pastel pink and cyan, marble busts, old window chrome, wide-spaced text. | Music, art and culture projects, merch, ironic campaigns | Mainstream commerce and tools |
| [Synthwave / retrowave](styles/synthwave.md) | A neon 1980s: a magenta sun, a perspective grid running to the horizon, chrome type, purple night sky. | Games, music, events, retro-tech products | Calm or corporate brands |
| [Memphis](styles/memphis.md) | Squiggles, triangles, dots and terrazzo in clashing primaries and pastels, scattered at angles. | Events, education, playful consumer brands, posters | Sober or premium products |
| [Corporate Memphis](styles/corporate-memphis.md) | The flat tech-company illustration style: friendly figures with long limbs and small heads in bright, flat colours. | Internal tools, onboarding, explainers where friendliness matters more than distinction | Brands that need to stand apart |
| [Art Deco](styles/art-deco.md) | Symmetry, stepped forms, sunbursts and fine gold lines on black or navy, with tall elegant capitals. | Hotels, bars, jewellery, events, heritage brands | Casual, technical or youthful products |
| [Cyberpunk / neon](styles/cyberpunk.md) | A dark city at night: black panels, acid yellow and cyan neon, clipped corners, warning labels and terminal type. | Games, security and developer tools, music, hardware | General audiences reading at length |
| [Glitch](styles/glitch.md) | Deliberate digital damage: colour channels that split apart, slices that jump sideways, torn scan lines. | Music, games, art, error pages, launch teasers | Reading-heavy pages, anxious contexts such as payments |

## Visual treatments

| Style | What it is | Choose it for | Avoid it for |
|---|---|---|---|
| [Aurora / mesh gradient](styles/aurora.md) | Large, soft, blurred fields of colour that blend into each other like northern lights, usually behind plain text. | AI and developer products, landing page heroes, anything abstract with no photo to show | Pages where a product picture would say more |
| [Grain / noise texture](styles/grain.md) | A fine speckle over flat colour or gradients, like film grain or cheap print. | Craft, food, fashion, editorial, any brand that wants a printed or analogue feel | Crisp, clinical product interfaces |
| [Duotone](styles/duotone.md) | Every picture mapped to just two colours, a dark and a light, so mixed photography looks like one set. | Sites with mixed or weak photography, music and events, campaigns with one strong brand colour | Products where true colour matters, such as food or fashion detail |
| [Dark-mode-first](styles/dark-first.md) | The dark theme is the designed default: near-black surfaces in a few elevation steps, soft white text, one bright accent. | Developer tools, media and video, games, dashboards used in dim rooms | Long-form reading for a general audience, unless a light theme is one click away |
| [Isometric](styles/isometric.md) | Objects drawn as if seen from above at an angle with no perspective, so parallel lines never meet. | Explaining systems, infrastructure, logistics, fintech flows, feature diagrams | Emotional or lifestyle brands |

## Motion-led approaches

| Approach | What it is | Choose it for | Avoid it for |
|---|---|---|---|
| [Kinetic typography](styles/kinetic-type.md) | The words are the animation: letters, words and lines move, stretch and take turns, so reading and watching become one thing. | SaaS and product launches with a strong line and no picture, agencies, manifestos | Pages where the message is in a picture or a demo |
| [Scroll-driven storytelling](styles/scroll-story.md) | The page is a sequence: sections pin, pictures scrub and charts redraw as the reader scrolls, so the scroll bar becomes the timeline. | Brand stories, product explainers, journalism, annual reports, data stories | Task pages people visit to get something done |
| [3D / immersive WebGL](styles/immersive-3d.md) | A real-time 3D scene is the page: a product you can turn, a world the camera moves through, particles that form a shape. | Product launches, hardware, automotive, games, portfolios of 3D work | Content pages, slow devices, anything that must load in a second |
| [Micro-interactions](styles/micro-interactions.md) | Small animated answers to what a person just did: a toggle that slides, a row that makes room, a number that settles. | Apps, dashboards, forms, checkouts, any interface used every day | Nothing: every interface benefits, in moderation |

## Tools, not styles

- **Organic / blob shapes.** Soft, irregular shapes made with an eight-value border-radius, an SVG path or clip-path. A tool used inside other styles (claymorphism, Corporate Memphis), not a documented style of its own.
- **Monochrome.** One hue in several tints and shades. A palette decision used inside Swiss, minimal or dark-first work, not a style of its own.

## Names that are not styles

- **Spectromorphism.** Not a design style. No design source uses it; the nearest real word, spectromorphology, is a term from electroacoustic music. If a brief asks for it, ask whether neumorphism, skeuomorphism or glassmorphism was meant.

## How the pages are made

Every page in `references/styles/` and the atlas in `examples/style-atlas/` are generated from `references/styles.json` and the CSS files beside it by `scripts/build_styles.mjs`. Edit the JSON or the CSS, run the script, then run `check_site.mjs` on the atlas.
