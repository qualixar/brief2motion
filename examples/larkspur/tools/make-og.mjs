// make-og.mjs: draws site/assets/og.png (1200 x 630) from tools/og.html in Chrome. Run from the example folder:
//   node tools/make-og.mjs
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright, launchChrome } from '../../../skills/brief2motion/scripts/_common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pw = await loadPlaywright();
const browser = await launchChrome(pw);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(here, 'og.html')).href);
await page.screenshot({ path: path.join(here, '..', 'site', 'assets', 'og.png') });
await browser.close();
console.log('wrote site/assets/og.png');
