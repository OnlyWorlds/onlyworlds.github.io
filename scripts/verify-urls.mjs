#!/usr/bin/env node
/**
 * verify-urls.mjs: does the built site still answer every URL the world links to?
 *
 * Run:  node scripts/verify-urls.mjs [--dist dist] [--contract contract/urls.tsv]
 *
 * The contract (contract/urls.tsv) lists every page of the old site and every onlyworlds.github.io
 * URL found in the OnlyWorlds repos. Boss's /fleet check reads the same file against the live site;
 * this gate reads it against dist/ before anything is pushed.
 *
 * It resolves each URL the way GitHub Pages does (a file; else <path>.html; else a folder with
 * index.html, reached by a same-host 301 to <path>/) and then checks:
 *   load-bearing  the final answer is 200 with real content (never a meta-refresh stub), and its
 *                 #anchor, if any, is an id in that page
 *   floor         as load-bearing; these are the error codes keel links to on /api/errors/
 *   page          200, or a stub whose target answers 200
 * A row the old site already answered 404 is reported, not failed. A 'template' row is a pattern
 * (keel builds #{code}); it is reported as a pattern and checked through the floor rows.
 * Structural: no page may exist both as <path>.html and <path>/index.html.
 *
 * Exit: 0 pass · 1 drift · 2 the gate could not see (no dist, no contract, an unreadable row).
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = resolvePath(ROOT, arg('--dist', 'dist'));
const CONTRACT = resolvePath(ROOT, arg('--contract', join('contract', 'urls.tsv')));

const fail = [], gaps = [], notes = [];

// Paths served by another repo's GitHub Pages site under the same host (a project site). This
// build cannot answer for them; Boss's live check does. The build must never write into them.
// From `gh api orgs/OnlyWorlds/repos` (has_pages), 2026-10-08: onlyworlds.github.io and write-tool.
const PROJECT_SITES = ['/write-tool'];
const elsewhere = (path) => PROJECT_SITES.some((p) => path === p || path.startsWith(p + '/'));
const harness = (m) => { console.error(`CANNOT SEE: ${m}`); process.exit(2); };

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) harness(`no built site at ${DIST}`);
if (!existsSync(CONTRACT)) harness(`no contract at ${CONTRACT}`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const htmlCount = walk(DIST).filter((f) => f.endsWith('.html')).length;
if (htmlCount < 30) harness(`dist/ holds only ${htmlCount} html files; this is not a full build`);
// A built folder older than its sources answers for a site that no longer exists: refuse it.
const CONTENT = join(ROOT, 'src');
if (existsSync(CONTENT) && existsSync(join(DIST, 'index.html'))) {
  const built = statSync(join(DIST, 'index.html')).mtimeMs;
  const newer = walk(CONTENT).filter((f) => statSync(f).mtimeMs > built);
  if (newer.length) harness(`dist/ is older than ${newer.length} source file(s) (e.g. ${newer[0].slice(ROOT.length + 1)}): rebuild first`);
}

const isFile = (p) => existsSync(p) && statSync(p).isFile();
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

// GitHub Pages resolution, same host only. Returns { status, file, location }.
function resolve(path) {
  const clean = decodeURIComponent(path).replace(/^\/+/, '');
  const disk = join(DIST, clean);
  if (path.endsWith('/')) {
    const idx = join(disk, 'index.html');
    return isFile(idx) ? { status: 200, file: idx } : { status: 404 };
  }
  if (clean === '') return isFile(join(DIST, 'index.html')) ? { status: 200, file: join(DIST, 'index.html') } : { status: 404 };
  if (isFile(disk)) return { status: 200, file: disk };
  if (isFile(disk + '.html')) return { status: 200, file: disk + '.html' };
  if (isDir(disk) && isFile(join(disk, 'index.html'))) return { status: 301, location: path + '/' };
  return { status: 404 };
}

function follow(path) {
  let hops = 0, r = resolve(path), at = path;
  while (r.status === 301 && hops++ < 3) { at = r.location; r = resolve(at); }
  return { ...r, at };
}

const stubTarget = (html) => {
  const m = html.match(/<meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=([^"']+)["']/i);
  return m ? m[1] : null;
};
const ids = (html) => new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));

// ---- structural: nothing of ours at a project site's path ----------------------------------------
for (const p of PROJECT_SITES) {
  const d = join(DIST, p.slice(1));
  if (existsSync(d) || existsSync(d + '.html')) fail.push(`the build writes ${p}, which another repo's Pages site serves`);
}

// ---- structural: never two forms of one page --------------------------------------------------
for (const f of walk(DIST)) {
  if (!f.endsWith('.html') || f.endsWith('index.html')) continue;
  const asDir = join(f.slice(0, -5), 'index.html');
  if (isFile(asDir)) fail.push(`two forms of one page: ${f.slice(DIST.length)} and ${asDir.slice(DIST.length)}`);
}

// ---- every internal link in the built pages, resolved the way Pages resolves it ------------------
// starlight-links-validator resolves links the way Astro does (/x/ finds x.md), not the way Pages
// serves them (/x/ needs x/index.html), so it passed 51 links that 404 on Pages (Skeld, h37 #1023).
const pageUrl = (file) => {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  if (rel.endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  return rel.endsWith('.html') ? rel.slice(0, -5) : rel;
};
const idCache = new Map();
const idsOf = (file) => { if (!idCache.has(file)) idCache.set(file, ids(readFileSync(file, 'utf8'))); return idCache.get(file); };
let hrefs = 0;
const brokenLinks = new Map(); // target -> first page linking it
for (const f of walk(DIST)) {
  if (!f.endsWith('.html')) continue;
  const html = readFileSync(f, 'utf8');
  if (stubTarget(html)) continue; // a redirect stub's target is checked as its own row
  const base = new URL(pageUrl(f), 'https://onlyworlds.github.io');
  for (const m of html.matchAll(/<a\s[^>]*?href=["']([^"']+)["']/gi)) {
    const raw = m[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    let u;
    try { u = new URL(raw, base); } catch { gaps.push(`unparseable href "${raw}" on ${pageUrl(f)}`); continue; }
    if (u.host !== 'onlyworlds.github.io') {
      // "Open in Claude/ChatGPT" links carry our page's URL inside ?q=: the AI fetches it, so it must answer.
      const q = u.searchParams.get('q') || '';
      for (const inner of q.matchAll(/https:\/\/onlyworlds\.github\.io(\/[^\s"'<>]*)/g)) {
        const p = inner[1].replace(/[.,;:)]+$/, '');
        hrefs++;
        if (follow(p).status !== 200 && !brokenLinks.has(p)) brokenLinks.set(p, `${pageUrl(f)} (inside a ${u.host} link)`);
      }
      continue;
    }
    if (elsewhere(u.pathname)) continue;
    hrefs++;
    const r = follow(u.pathname);
    const at = pageUrl(f);
    if (r.status !== 200) {
      const key = u.pathname;
      if (!brokenLinks.has(key)) brokenLinks.set(key, at);
      continue;
    }
    const frag = decodeURIComponent(u.hash.slice(1));
    if (frag && frag !== '_top' && r.file.endsWith('.html') && !idsOf(r.file).has(frag)) {
      const key = `${u.pathname}#${frag}`;
      if (!brokenLinks.has(key)) brokenLinks.set(key, at);
    }
  }
}
// ---- the URLs a page names for itself, and the sitemap: final URLs, 200 with no redirect -----------
// Search engines and agents take these as the page's address, so a 301 or 404 here misdirects them.
const direct = (abs, where) => {
  const u = new URL(abs);
  if (u.host !== 'onlyworlds.github.io') { fail.push(`${where} names another host: ${abs}`); return; }
  const r = resolve(u.pathname);
  if (r.status !== 200) fail.push(`${where} is ${abs}, which answers ${r.status}${r.location ? ` (to ${r.location})` : ''}, not 200`);
};
let selfUrls = 0;
for (const f of walk(DIST)) {
  if (!f.endsWith('.html')) continue;
  const html = readFileSync(f, 'utf8');
  if (stubTarget(html)) continue;
  for (const m of html.matchAll(/<link rel="canonical" href="([^"]+)"|<meta property="og:url" content="([^"]+)"/g)) {
    selfUrls++; direct(m[1] || m[2], `${pageUrl(f)}: ${m[1] ? 'canonical' : 'og:url'}`);
  }
}
for (const sm of walk(DIST).filter((f) => /sitemap-\d+\.xml$/.test(f))) {
  for (const m of readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) { selfUrls++; direct(m[1], 'sitemap entry'); }
}
if (!selfUrls) gaps.push('no canonical, og:url or sitemap URL found in dist: the self-URL check saw nothing');

for (const [target, from] of brokenLinks) fail.push(`internal link ${target} does not answer on Pages (linked from ${from})`);

// ---- the contract -----------------------------------------------------------------------------
const rows = readFileSync(CONTRACT, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#'));
let checked = 0, templates = 0, already = 0;
for (const line of rows) {
  const [url, cls, today = ''] = line.split('\t');
  if (!url || !cls) { gaps.push(`unreadable row: ${line.slice(0, 80)}`); continue; }
  if (today.startsWith('template')) { templates++; continue; }
  const [path, frag] = url.split('#');
  if (elsewhere(path)) { notes.push(`${url}: served by another repo's Pages site; not checked here`); continue; }
  const r = follow(path || '/');
  const wasBroken = /^404/.test(today.replace(/^floor;\s*/, ''));
  const strict = cls === 'load-bearing';

  if (r.status !== 200) {
    if (wasBroken) { already++; notes.push(`${url}: 404, as on the old site`); continue; }
    fail.push(`${url}: ${r.status} on the built site (${cls})`);
    continue;
  }
  checked++;
  const html = r.file.endsWith('.html') ? readFileSync(r.file, 'utf8') : '';
  const stub = html && stubTarget(html);
  if (stub) {
    if (strict) { fail.push(`${url}: a redirect stub (to ${stub}) where the contract wants the real page; agents read the stub`); continue; }
    const t = follow(stub.split('#')[0]);
    if (t.status !== 200) fail.push(`${url}: stub to ${stub}, which answers ${t.status}`);
    continue;
  }
  if (frag !== undefined && frag !== '') {
    if (!ids(html).has(frag)) fail.push(`${url}: the page answers, but has no id "${frag}"`);
  }
  if (path.endsWith('.txt') && !r.file.endsWith('.txt')) fail.push(`${url}: served from ${r.file}, not as a text file`);
}

console.log(`verify-urls: ${hrefs} internal links resolved on Pages rules · ${rows.length} contract rows · ${checked} answered · ${templates} pattern rows (checked through the floor) · ${already} already 404 on the old site`);
for (const n of notes) console.log(`  note   ${n}`);
for (const g of gaps) console.log(`  GAP    ${g}`);
for (const f of fail) console.log(`  DRIFT  ${f}`);
if (gaps.length) { console.log(`INCOMPLETE: ${gaps.length} row(s) the gate could not read`); process.exit(2); }
if (fail.length) { console.log(`FAIL: ${fail.length} URL(s) the built site no longer answers as the contract says`); process.exit(1); }
console.log('PASS: every contract URL answers on the built site as the contract says.');
