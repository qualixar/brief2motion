// Style atlas: nothing here animates on its own account. Each style's motion is CSS, in atlas.css, and answers
// a hover or a press (two styles drift or burst, and stop for reduced motion). This file only reports the state.
import { signal, reducedMotion } from './kit/motion-core.js';
signal(reducedMotion() ? 'reduced' : 'ready');
