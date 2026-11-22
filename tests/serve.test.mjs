// The checkers' static server (serveDir in _common.mjs) only ever serves files inside the folder it was given.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { tmp } from './_design_helpers.mjs';
import { serveDir } from '../skills/brief2motion/scripts/_common.mjs';

// a raw request, so the path reaches the server exactly as written (fetch would normalise "/../")
const raw = (port, target) => new Promise((ok, fail) => {
  const s = net.connect(port, '127.0.0.1', () => s.write(`GET ${target} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
  let buf = ''; s.on('data', (d) => { buf += d; }); s.on('end', () => ok({ status: Number(buf.split(' ')[1]), body: buf.split('\r\n\r\n').slice(1).join('') })); s.on('error', fail);
});

test('serveDir refuses every path outside its folder, including through a symlink, and answers a bad escape with 400', async () => {
  const outside = tmp('outside'), root = path.join(tmp('root'), 'site');
  fs.mkdirSync(root); fs.writeFileSync(path.join(root, 'index.html'), '<p>inside</p>'); fs.writeFileSync(path.join(outside, 'secret.txt'), 'SECRET');
  fs.writeFileSync(path.join(path.dirname(root), 'routes.json'), 'SECRET');
  fs.symlinkSync(path.join(outside, 'secret.txt'), path.join(root, 'link.txt'));
  fs.symlinkSync(outside, path.join(root, 'linkdir'));
  fs.writeFileSync(path.join(root, 'ok.txt'), 'fine'); fs.symlinkSync(path.join(root, 'ok.txt'), path.join(root, 'inner-link.txt'));
  const srv = await serveDir(root);
  try {
    assert.equal((await raw(srv.port, '/')).status, 200);
    assert.equal((await raw(srv.port, '/inner-link.txt')).body, 'fine', 'a link that stays inside the folder is served');
    for (const p of ['/../routes.json', '/%2e%2e/routes.json', '/..%2froutes.json', '/..%5croutes.json', '/%2e%2e%2f%2e%2e%2fetc/passwd', '/link.txt', '/linkdir/secret.txt']) {
      const r = await raw(srv.port, p);
      assert.ok([403, 404].includes(r.status), `${p} answered ${r.status}`);
      assert.doesNotMatch(r.body, /SECRET/, p);
    }
    const bad = await raw(srv.port, '/%E0%A4%A');
    assert.equal(bad.status, 400); assert.doesNotMatch(bad.body, /URIError/);
  } finally { await srv.close(); }
});
