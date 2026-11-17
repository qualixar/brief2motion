#!/usr/bin/env python3
"""serve.py: preview a brief2motion site at http://localhost:PORT/ (Python 3 standard library only).

    python3 serve.py [site-folder] [--port 8421]

Why this exists: browsers refuse to load ES modules from file://, so double-clicking index.html shows a
blank page. This serves the folder over http instead. It listens on 127.0.0.1 only, sends no-cache
headers (every reload shows your latest edit) and stays up until you press Ctrl-C.
If the port is busy it tries the next 20.
"""
import functools
import http.server
import mimetypes
import os
import sys

# Windows can map .js to text/plain through the registry, which makes browsers reject module scripts.
for ext, kind in (('.js', 'text/javascript'), ('.mjs', 'text/javascript'), ('.css', 'text/css'),
                  ('.webp', 'image/webp'), ('.svg', 'image/svg+xml'), ('.woff2', 'font/woff2')):
    mimetypes.add_type(kind, ext)


class NoCache(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # a site with no favicon should not log a 404 for the browser's automatic request
        if self.path == '/favicon.ico' and not os.path.exists(os.path.join(self.directory, 'favicon.ico')):
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):  # only print problems, not every image request
        if len(args) > 1 and str(args[1])[:1] in ('4', '5'):
            sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))


def main(argv):
    port, root, rest = 8421, '.', list(argv)
    if '--port' in rest:
        i = rest.index('--port')
        try:
            port = int(rest[i + 1])
        except (IndexError, ValueError):
            sys.exit('serve.py: --port needs a number, for example --port 8421')
        del rest[i:i + 2]
    if rest:
        root = rest[0]
    if not os.path.isdir(root):
        sys.exit('serve.py: folder not found: %s' % root)
    if not os.path.exists(os.path.join(root, 'index.html')):
        sys.stderr.write('serve.py: warning, no index.html in %s\n' % root)
    handler = functools.partial(NoCache, directory=root)
    server = None
    for p in range(port, port + 21) if port else [0]:
        try:
            server = http.server.ThreadingHTTPServer(('127.0.0.1', p), handler)
            break
        except OSError:
            continue
    if server is None:
        sys.exit('serve.py: ports %d to %d are busy. Try --port 0 for any free port.' % (port, port + 20))
    print('Serving %s' % os.path.abspath(root))
    print('Open  http://localhost:%d/' % server.server_address[1])
    print('Press Ctrl-C to stop.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nstopped.')
    finally:
        server.server_close()


if __name__ == '__main__':
    main(sys.argv[1:])
