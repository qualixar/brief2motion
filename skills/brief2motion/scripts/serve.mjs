#!/usr/bin/env node
// serve.mjs: the same preview server as serve.py, for machines without Python. Node only.
//   node serve.mjs [site-folder] [--port 8421]
// Browsers refuse ES modules from file://, so opening index.html directly shows a blank page. This serves
// the folder at http://localhost:PORT/ on 127.0.0.1 only, and stays up until Ctrl-C.
import fs from 'node:fs';
import { serveDir } from './_common.mjs';

const a = process.argv.slice(2);
const pi = a.indexOf('--port');
let port = 8421;
if (pi >= 0) {
  port = Number(a[pi + 1]);
  if (!Number.isInteger(port) || port < 0) { console.error('serve.mjs: --port needs a number, for example --port 8421'); process.exit(2); }
  a.splice(pi, 2);
}
const root = a[0] || '.';
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) { console.error(`serve.mjs: folder not found: ${root}`); process.exit(2); }
if (!fs.existsSync(`${root}/index.html`)) console.error(`serve.mjs: warning, no index.html in ${root}`);

let server = null;
for (let p = port; p <= port + 20 && !server; p++) {
  try { server = await serveDir(root, p); } catch { if (!port) break; }   // busy: try the next port
  if (!port) break;
}
if (!server) { console.error(`serve.mjs: ports ${port} to ${port + 20} are busy. Try --port 0 for any free port.`); process.exit(2); }
console.log(`Serving ${fs.realpathSync(root)}\nOpen  http://localhost:${server.port}/\nPress Ctrl-C to stop.`);
process.on('SIGINT', () => { console.log('\nstopped.'); process.exit(0); });
