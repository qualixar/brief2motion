# Motion: Larkspur

| Movement | Intent | Trigger | States (start, end) | Interruption | Reduced-motion form | Pattern page |
|---|---|---|---|---|---|---|
| The inbox drawing plays one arrival | Show the product's whole idea (a message arrives, someone claims it) before the visitor reads the explanation | page load, once, about 1.6 s: the new row fades in and drops 12 px (300 ms, 350 ms transition), then its chip cross-fades from "Unassigned" to "Ari has this" (at 1.3 s, 250 ms) | row hidden and unassigned, then row shown and claimed | nothing to interrupt; it finishes by itself and never repeats. A visitor who scrolls or tabs away loses nothing: the page text does not depend on it | the finished drawing from the first paint: row shown, chip says "Ari has this", no travel, no timer | `references/patterns/hero-load-sequence.md` |
| Button press | Confirm the tap | pointer or key down, 100 ms ease-out | at rest, moved down 2 px | released at once | no transition (the kit sets transition-duration to near zero) | none (CSS) |
| Form feedback | Say what happened to the entry | submit | form shown, then an error summary (focus moves to it) or a thank-you (focus moves to it); no movement | none | identical: the feedback is a change of content, not a movement | none |

Not animated, on purpose: scroll reveals, section transitions, hover lifts, the plan cards, the FAQ (it opens instantly). One orchestrated moment is enough for a page that has one thing to show.

The head script in `index.html` sets `data-stage="pre"` only when the visitor has not asked for reduced motion, so the first frame is already the drawing's start. Without JavaScript, or with reduced motion, nothing hides the finished state.
