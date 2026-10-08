#!/usr/bin/env node
// serve.mjs: serve dist/ the way GitHub Pages resolves URLs, for local review and agent-read passes.
//   /x/      -> x/index.html, else 404
//   /x       -> the file x; else x.html; else 301 to /x/ when x/index.html exists; else 404.html
// Usage: node scripts/serve.mjs [port]   (default 4321)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.xml': 'application/xml',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.pf_meta': 'application/octet-stream', '.pf_fragment': 'application/octet-stream', '.pf_index': 'application/octet-stream',
};
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const send = (res, code, file) => {
  res.writeHead(code, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const disk = join(DIST, path);
  if (path.endsWith('/')) {
    const idx = join(disk, 'index.html');
    return isFile(idx) ? send(res, 200, idx) : send(res, 404, join(DIST, '404.html'));
  }
  if (isFile(disk)) return send(res, 200, disk);
  if (isFile(disk + '.html')) return send(res, 200, disk + '.html');
  if (isFile(join(disk, 'index.html'))) { res.writeHead(301, { location: path + '/' }); return res.end(); }
  send(res, 404, join(DIST, '404.html'));
}).listen(PORT, () => console.log(`serving ${DIST} as GitHub Pages would, on http://localhost:${PORT}/`));
