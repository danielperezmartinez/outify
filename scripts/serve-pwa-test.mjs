import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { createHash } from 'node:crypto';

// Solo pruebas locales: simula dos publicaciones atómicas sobre la build real.
const root = resolve('dist/outify/browser');
let revision = 0;
const index = () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  return revision === 1 ? html.replace('</head>', '<!-- test revision 1 --></head>') : html;
};
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};
createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4300');
  if (request.method === 'POST' && url.pathname === '/__test/publish') {
    revision += 1;
    response.writeHead(204).end();
    return;
  }
  if (request.method === 'POST' && url.pathname === '/__test/restore') {
    revision = 2;
    response.writeHead(204).end();
    return;
  }
  const path = resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!path.startsWith(root + sep) && path !== root) {
    response.writeHead(403).end();
    return;
  }
  let file = path;
  if (!extname(url.pathname)) file = resolve(root, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  let body = readFileSync(file);
  if (revision && url.pathname === '/ngsw.json') {
    const manifest = JSON.parse(body.toString());
    manifest.appData = { version: revision === 1 ? '99.0.0' : '99.0.1' };
    manifest.hashTable['/index.html'] = createHash('sha1').update(index()).digest('hex');
    body = Buffer.from(JSON.stringify(manifest));
  } else if (revision && file === resolve(root, 'index.html')) {
    body = Buffer.from(index());
  }
  response.writeHead(200, {
    'Content-Type': mime[extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  response.end(body);
}).listen(4300, '127.0.0.1');
