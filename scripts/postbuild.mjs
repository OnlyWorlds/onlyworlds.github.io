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
// A page's canonical and og:url take the sitemap's bare form (/x, not /x.html), so every page has
// one address across the sitemap, llms.txt and its own head. Runs after the
// moved-page rule above, which has already turned those into /<dir>/.
// (index.html first: the home page's canonical is /, not /index)
rules.push([/((?:<link rel="canonical" href|<meta property="og:url" content)="https:\/\/onlyworlds\.github\.io\/(?:[^"]*\/)?)index\.html"/g, count((_, a) => `${a}"`)]);
rules.push([/(<link rel="canonical" href="https:\/\/onlyworlds\.github\.io\/[^"]*?)\.html"/g, count((_, a) => `${a}"`)]);
rules.push([/(<meta property="og:url" content="https:\/\/onlyworlds\.github\.io\/[^"]*?)\.html"/g, count((_, a) => `${a}"`)]);
for (const file of walk(DIST)) {
  if (!file.endsWith('.html') && !/sitemap.*\.xml$/.test(file)) continue;
  const html = readFileSync(file, 'utf8');
  let next = html;
  for (const [re, fn] of rules) next = next.replace(re, fn);
  if (next !== html) writeFileSync(file, next);
}
// Each page names its Markdown twin in <head>, so an agent that fetched the HTML can find the lean
// copy without guessing the path (the AI-agent reader, round 1). Twins are written by page-actions:
// /x.html -> /x.md, /dir/index.html -> /dir.md, /index.html -> /index.md.
let alternates = 0;
for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  const rel = relative(DIST, file).replace(/\\/g, '/');
  const twin = rel === 'index.html' ? 'index.md' : rel.endsWith('/index.html') ? rel.slice(0, -'/index.html'.length) + '.md' : rel.slice(0, -5) + '.md';
  if (!existsSync(join(DIST, twin))) continue;
  const html = readFileSync(file, 'utf8');
  if (html.includes('type="text/markdown"')) continue;
  const next = html.replace('</head>', `<link rel="alternate" type="text/markdown" href="/${twin}"></head>`);
  if (next !== html) { writeFileSync(file, next); alternates++; }
}
// A code block's lines are block <div class="ec-line"> with no newline between them, so a reader
// that takes the page's text (an agent's fetch, a tag-stripper) gets each block as one line.
// A hidden newline between lines costs the browser nothing and keeps the breaks in the text.
let codeBreaks = 0;
const lineGap = '</div></div><div class="ec-line">';
for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  const html = readFileSync(file, 'utf8');
  if (!html.includes(lineGap)) continue;
  const next = html.split(lineGap).join(`</div></div><span hidden>\n</span><div class="ec-line">`);
  codeBreaks += html.split(lineGap).length - 1;
  writeFileSync(file, next);
}
console.log(`postbuild: ${moved} folder page(s) moved to <dir>/index.html; ${rewrites} link(s) to them rewritten to <dir>/; ${alternates} page(s) name their Markdown twin; ${codeBreaks} code line break(s) kept in the text`);
