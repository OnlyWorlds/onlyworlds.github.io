#!/usr/bin/env node
// postbuild.mjs: put folder pages back at folder paths.
//
// build.format 'file' writes every page as <slug>.html. The old site served its section pages
// (docs/x/index.md, and /api/errors/) as folders: /docs/x 301s to /docs/x/ on the same host.
// This step moves each <dir>.html written for a src/content/docs/<dir>/index.md(x) to
// <dir>/index.html, so the old forms keep answering. It never leaves both forms: if a page
// exists at both paths it stops, since which one GitHub Pages serves is not something we rely on.
import { readdirSync, statSync, existsSync, renameSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content', 'docs');
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) { console.error('postbuild: no dist/ (run astro build first)'); process.exit(2); }

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

let moved = 0;
for (const file of walk(CONTENT)) {
  const rel = relative(CONTENT, file).replace(/\\/g, '/');
  const m = rel.match(/^(.+)\/index\.mdx?$/);
  if (!m) continue;
  const dir = m[1].toLowerCase();
  const from = join(DIST, `${dir}.html`);
  const to = join(DIST, dir, 'index.html');
  if (existsSync(to)) {
    console.error(`postbuild: ${dir}/index.html already exists; refusing to keep two forms of one page`);
    process.exit(1);
  }
  if (!existsSync(from)) {
    console.error(`postbuild: expected ${dir}.html for ${rel}, found none`);
    process.exit(1);
  }
  mkdirSync(join(DIST, dir), { recursive: true });
  renameSync(from, to);
  moved++;
}
console.log(`postbuild: ${moved} folder page(s) moved to <dir>/index.html`);
