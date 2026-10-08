#!/usr/bin/env node
// postbuild.mjs: put folder pages back at folder paths.
//
// build.format 'file' writes every page as <slug>.html. The old site served its section pages
// (docs/x/index.md, and /api/errors/) as folders: /docs/x 301s to /docs/x/ on the same host.
// This step moves each <dir>.html written for a src/content/docs/<dir>/index.md(x) to
// <dir>/index.html, so the old forms keep answering. It never leaves both forms: if a page
// exists at both paths it stops, since which one GitHub Pages serves is not something we rely on.
import { readdirSync, statSync, existsSync, renameSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const movedDirs = [];
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
  movedDirs.push(dir);
  moved++;
}

// Starlight writes its own links (sidebar, pagination, breadcrumbs) as /<dir>.html under
// build.format 'file'. For the pages just moved, that file no longer exists: point those links
// at /<dir>/ instead (verify-urls.mjs resolves every internal link the way Pages does).
// starlight-page-actions links each page's Markdown twin as <page url>.md, which under 'file'
// gives /x.html.md; the twin is written at /x.md. Its "Open in Claude/ChatGPT" links carry the page
// URL encoded in ?q=, so a moved page's /<dir>.html needs rewriting there too.
let rewrites = 0;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const count = (fn) => (...a) => { rewrites++; return fn(...a); };
const rules = [[/(href=["'][^"']*?)\.html\.md(?=[#?"'])/g, count((_, pre) => `${pre}.md`)]];
if (movedDirs.length) {
  const dirs = movedDirs.map(esc).join('|');
  rules.push([new RegExp(`(href=["'])/(${dirs})\\.html(?=[#?"'])`, 'g'), count((_, pre, d) => `${pre}/${d}/`)]);
  const enc = movedDirs.map((d) => esc(encodeURIComponent('/' + d))).join('|');
  rules.push([new RegExp(`(${enc})\\.html(?=%20|&|"|')`, 'g'), count((_, d) => `${d}${encodeURIComponent('/')}`)]);
  // canonical and og:url carry the absolute form; the sitemap lists section pages without the slash
  rules.push([new RegExp(`(https://onlyworlds\\.github\\.io/)(${dirs})\\.html(?=["'#?])`, 'g'), count((_, h, d) => `${h}${d}/`)]);
  rules.push([new RegExp(`(<loc>https://onlyworlds\\.github\\.io/)(${dirs})(?=</loc>)`, 'g'), count((_, h, d) => `${h}${d}/`)]);
}
for (const file of walk(DIST)) {
  if (!file.endsWith('.html') && !/sitemap.*\.xml$/.test(file)) continue;
  const html = readFileSync(file, 'utf8');
  let next = html;
  for (const [re, fn] of rules) next = next.replace(re, fn);
  if (next !== html) writeFileSync(file, next);
}
console.log(`postbuild: ${moved} folder page(s) moved to <dir>/index.html; ${rewrites} link(s) to them rewritten to <dir>/`);
