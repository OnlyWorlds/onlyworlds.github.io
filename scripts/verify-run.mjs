#!/usr/bin/env node
/**
 * verify-run.mjs: each Run button's request held to the sample it sits on, and the runner only where one is.
 *
 * Usage: node scripts/verify-run.mjs     the sources, then the built site (offline; in `npm run verify`)
 *
 * A run marker (src/run/marker.mjs) declares, on the line right under a code sample, the request the
 * sample's Run button sends: <!-- run: METHOD PATH [API-Key:<demo key>] [Header:value ...] [JSON body] -->.
 * A read that names a demo key runs with it on the world it names; any other runs on the practice
 * world. The request is declared, never parsed out of the sample, so this reads the sample on its
 * own and holds the two together.
 *
 * Checks (fail), on the sources (src/content/docs):
 *   (a) every run marker is a whole line of a .md page and parses (marker.mjs's rules); one in an
 *       .mdx page, or inside a line, fails (it would never become a button);
 *   (b) the line above the marker closes a code block, and that block sends exactly one curl request;
 *   (c) the method the block sends (its -X, else POST with -d, else GET) is the marker's;
 *   (d) the URL it sends is https://www.onlyworlds.com plus the marker's path, query included;
 *   (e) its -d body, parsed as JSON, equals the marker's body (or neither has one);
 *   (f) every header it sends but API-Key, API-Pin and Content-Type is in the marker with the same
 *       value, and the marker carries no other;
 *   (g) it runs as written: no placeholder ({id}, <id>, …, ..., $VAR) in its URL, body or those
 *       headers;
 *   (h) the key: when the sample sends a demo key (0000000000 to 0000000009), the marker names that
 *       same key, and a marker that names one runs a GET (marker.mjs refuses a demo key on any other
 *       method); a marker names no key the sample does not send. Any other key in the sample, and its
 *       API-Pin, are the runner's (the practice world's), whatever the sample shows.
 * And on the built site (dist/, after `npm run build`):
 *   (i) each page with markers carries one Run button per marker, in order, each in a code block's
 *       header bar, before that block's copy button, with the marker's request, its accessible name
 *       and its label link saying where it runs ("on the practice world" or "with the demo key");
 *       one answer panel right under each block; one runner script, with the hash of
 *       dist/assets/ow-run.js in its URL;
 *   (j) a page with a practice-world Run also carries one line, right above its first practice-world
 *       sample, in the words and link the integration writes, and its runner carries
 *       contract/practice.json's key, PIN and reset hour; a page whose Runs all use a demo key carries
 *       neither the line nor the practice key and PIN;
 *   (k) no other page carries a Run button, a panel, the line or the runner;
 *   (l) no Markdown twin and no llms text carries a marker, the line or a button.
 * Not checked here: what the server answers (the browser walk), the look (the design sheets).
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (no marker found, no dist/, or contract/practice.json unreadable:
 * never a pass). scripts/mutants-run.mjs plants faults in copies of the real pages and watches each fail.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { API_ORIGIN, RUNNER_HEADERS, DEMO_KEY, BOX, MARKER_LINE, MARKER_ANY, parseMarker, decodeRequest, where as whereOf } from '../src/run/marker.mjs';
import { noteText } from '../src/run/integration.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content', 'docs');
const DIST = join(ROOT, 'dist');
const PLACEHOLDER = /\{[A-Za-z_][\w-]*\}|<[A-Za-z][\w-]*>|…|\.\.\.|\$/;

// ---- the sample -----------------------------------------------------------------------------------
// The shell words of one command line, quotes resolved. Returns null on an unclosed quote.
function words(line) {
  const out = [];
  let w = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'") {
      const end = line.indexOf("'", i + 1);
      if (end < 0) return null;
      w = (w ?? '') + line.slice(i + 1, end);
      i = end;
    } else if (c === '"') {
      let s = '';
      for (i++; i < line.length && line[i] !== '"'; i++) {
        if (line[i] === '\\' && '"\\$`'.includes(line[i + 1])) i++;
        s += line[i];
      }
      if (i >= line.length) return null;
      w = (w ?? '') + s;
    } else if (/\s/.test(c)) {
      if (w !== null) out.push(w);
      w = null;
    } else {
      w = (w ?? '') + c;
    }
  }
  if (w !== null) out.push(w);
  return out;
}

const FLAGS = new Set(['-s', '-S', '-sS', '-i', '-v', '-L', '-f', '--silent', '--show-error', '--include', '--fail', '--location']);
// The one request a code block sends: { method, url, headers: [[name, value]], data } or { error }.
export function readSample(code) {
  const lines = code.replace(/\\\r?\n/g, ' ').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const curls = lines.filter((l) => /^curl\s/.test(l));
  if (curls.length !== 1) return { error: `the sample sends ${curls.length} curl requests, not one` };
  if (lines.length !== 1) return { error: 'the sample holds more than its one curl command' };
  const w = words(curls[0]);
  if (!w) return { error: 'the sample\'s curl command has an unclosed quote' };
  let method, url, data;
  const headers = [];
  for (let i = 1; i < w.length; i++) {
    const a = w[i];
    if (FLAGS.has(a)) continue;
    if (a === '-X' || a === '--request') method = w[++i];
    else if (a === '-H' || a === '--header') {
      const h = w[++i] ?? '';
      const at = h.indexOf(':');
      if (at < 1) return { error: `a header the sample sends does not read as Name: value ("${h}")` };
      headers.push([h.slice(0, at).trim(), h.slice(at + 1).trim()]);
    } else if (['-d', '--data', '--data-raw', '--data-binary'].includes(a)) data = w[++i];
    else if (a.startsWith('-')) return { error: `verify-run does not read the curl option ${a}` };
    else if (url === undefined) url = a;
    else return { error: `the sample's curl command has a second URL (${a})` };
  }
  if (!url) return { error: 'the sample\'s curl command has no URL' };
  return { method: method ?? (data !== undefined ? 'POST' : 'GET'), url, headers, data };
}

const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x));

// The code block whose closing fence is lines[at - 1], or null: the page's fences read from the top.
function blockAbove(lines, at) {
  let open = null;
  for (let i = 0; i < at; i++) {
    const f = lines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!f) continue;
    if (!open) open = { i, fence: f[1], lang: f[2].trim().split(/\s/)[0] };
    else if (f[1][0] === open.fence[0] && f[1].length >= open.fence.length && !f[2].trim()) {
      if (i === at - 1) return { lang: open.lang, code: lines.slice(open.i + 1, i).join('\n') };
      open = null;
    }
  }
  return null;
}

// Every marker of one page, each held to its sample. rel: the page's path under src/content/docs.
export function checkSource(rel, text) {
  const fails = [];
  const markers = [];
  const lines = text.split(/\r?\n/);
  const mdx = rel.endsWith('.mdx');
  for (const m of text.matchAll(MARKER_ANY)) {
    const line = text.slice(0, m.index).split('\n').length;
    const where = `${rel}:${line}`;
    if (mdx) { fails.push(`${where}: a run marker in an .mdx page, which the runner does not read`); continue; }
    const own = lines[line - 1].trim().match(MARKER_LINE);
    if (!own || m[0].startsWith('{')) { fails.push(`${where}: a run marker that is not a line of its own`); continue; }
    let req;
    try { req = parseMarker(own[1]); } catch (e) { fails.push(`${where}: ${e.message}`); continue; }
    markers.push({ line, req });
    const block = blockAbove(lines, line - 1);
    if (!block) { fails.push(`${where}: a run marker with no code block right above it`); continue; }
    const s = readSample(block.code);
    if (s.error) { fails.push(`${where}: ${s.error}`); continue; }
    if (s.method !== req.method) fails.push(`${where}: the marker runs ${req.method}; the sample sends ${s.method}`);
    if (!s.url.startsWith(API_ORIGIN + '/')) fails.push(`${where}: the sample's URL (${s.url}) is not on ${API_ORIGIN}`);
    else if (s.url.slice(API_ORIGIN.length) !== req.path) fails.push(`${where}: the marker runs ${req.path}; the sample sends ${s.url.slice(API_ORIGIN.length)}`);
    if (PLACEHOLDER.test(s.url)) fails.push(`${where}: the sample's URL holds a placeholder (${s.url}), so it does not run as written`);
    if (s.data !== undefined) {
      if (PLACEHOLDER.test(s.data)) fails.push(`${where}: the sample's body holds a placeholder, so it does not run as written`);
      let body;
      try { body = JSON.parse(s.data); } catch { fails.push(`${where}: the sample's -d body is not JSON`); }
      if (body !== undefined && req.body === undefined) fails.push(`${where}: the sample sends a body; the marker has none`);
      else if (body !== undefined && canon(body) !== canon(req.body)) fails.push(`${where}: the marker's body is not the sample's (${canon(req.body)} against ${canon(body)})`);
    } else if (req.body !== undefined) fails.push(`${where}: the marker has a body; the sample sends none`);
    const own2 = s.headers.filter(([n]) => !RUNNER_HEADERS.includes(n.toLowerCase()));
    for (const [n, v] of own2) {
      if (PLACEHOLDER.test(v)) fails.push(`${where}: the sample's ${n} header holds a placeholder, so it does not run as written`);
      const k = Object.keys(req.headers).find((x) => x.toLowerCase() === n.toLowerCase());
      if (!k) fails.push(`${where}: the sample sends ${n}; the marker does not`);
      else if (req.headers[k] !== v) fails.push(`${where}: the marker's ${n} is ${req.headers[k]}; the sample's is ${v}`);
    }
    for (const k of Object.keys(req.headers)) {
      if (!own2.some(([n]) => n.toLowerCase() === k.toLowerCase())) fails.push(`${where}: the marker sends ${k}; the sample does not`);
    }
    const key = s.headers.find(([n]) => n.toLowerCase() === 'api-key')?.[1];
    if (key !== undefined && DEMO_KEY.test(key)) {
      if (!req.demoKey) fails.push(`${where}: the sample reads with the demo key ${key}; the marker does not name it, so Run would read the practice world instead`);
      else if (req.demoKey !== key) fails.push(`${where}: the marker's API-Key is ${req.demoKey}; the sample's is ${key}`);
    } else if (req.demoKey) fails.push(`${where}: the marker names the demo key ${req.demoKey}; the sample sends ${key === undefined ? 'no key' : 'another key'}`);
  }
  return { markers, fails };
}

// ---- the built page -------------------------------------------------------------------------------
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

// One page that has markers: its buttons, panels, line and script. p: { key, pin, reset_utc }.
export function checkPage(page, html, markers, p, jsHash) {
  const fails = [];
  const buttons = [...html.matchAll(/<button\b[^>]*\bdata-ow-run="([^"]*)"[^>]*>/g)];
  if (buttons.length !== markers.length) fails.push(`${page}: ${buttons.length} Run button(s) for ${markers.length} marker(s)`);
  buttons.forEach((b, i) => {
    const m = markers[i];
    if (!m) return;
    let req;
    try { req = decodeRequest(b[1]); } catch { fails.push(`${page}: Run button ${i + 1} carries no request it can read`); return; }
    if (canon(req) !== canon(m.req)) fails.push(`${page}: Run button ${i + 1} sends ${canon(req)}; its marker (line ${m.line}) says ${canon(m.req)}`);
    const w = whereOf(m.req);
    if (attr(b[0], 'aria-label') !== `Run ${w.label}`) fails.push(`${page}: Run button ${i + 1}'s name is "${attr(b[0], 'aria-label')}", not "Run ${w.label}"`);
    const label = html.slice(b.index).match(/^[\s\S]*?<\/button>\s*<a class="ow-run-where" href="([^"]*)">([^<]*)<\/a>/);
    if (!label || label[2] !== w.label || label[1] !== w.href) fails.push(`${page}: Run button ${i + 1}'s label is ${label ? `"${label[2]}" to ${label[1]}` : 'missing'}; it runs ${w.label} (${w.href})`);
    const before = html.slice(0, b.index);
    const cap = before.lastIndexOf('<figcaption class="header"');
    if (cap < 0 || before.lastIndexOf('</figcaption>') > cap) fails.push(`${page}: Run button ${i + 1} is not in a code block's header bar`);
    const figEnd = html.indexOf('</figure>', b.index);
    const copy = html.indexOf('<div class="copy">', b.index);
    if (copy < 0 || copy > figEnd) fails.push(`${page}: Run button ${i + 1}'s block has no copy button after it (Run comes first in the tab order)`);
    const panel = html.slice(figEnd).match(/^<\/figure><\/div>\s*<div class="ow-run-panel[^"]*" data-ow-run-panel="(\d+)"[^>]*><\/div>/);
    if (!panel) fails.push(`${page}: no empty answer panel right under Run button ${i + 1}'s block`);
    else if (Number(panel[1]) !== i) fails.push(`${page}: the panel under Run button ${i + 1} is numbered ${panel[1]}`);
    else if (!/aria-live="polite"/.test(panel[0])) fails.push(`${page}: the panel under Run button ${i + 1} is not a polite live region`);
  });
  const panels = (html.match(/data-ow-run-panel="/g) ?? []).length;
  if (panels !== markers.length) fails.push(`${page}: ${panels} answer panel(s) for ${markers.length} marker(s)`);
  const notes = [...html.matchAll(/<p class="ow-run-note">([\s\S]*?)<\/p>/g)];
  const practiceAt = markers.findIndex((m) => !m.req.demoKey);
  const firstPractice = buttons[practiceAt];
  if (practiceAt < 0) {
    if (notes.length) fails.push(`${page}: ${notes.length} "Run sends the sample" line(s) on a page whose Runs all use a demo key; none is wanted`);
  } else if (notes.length !== 1) fails.push(`${page}: ${notes.length} "Run sends the sample" line(s); one is wanted`);
  else {
    const said = unesc(notes[0][1].replace(/<[^>]+>/g, ''));
    if (said !== noteText(p.reset_utc)) fails.push(`${page}: the line says "${said}"`);
    if (attr(notes[0][1].match(/<a\b[^>]*>/)?.[0] ?? '', 'href') !== BOX) fails.push(`${page}: the line does not link ${BOX}`);
    if (firstPractice && notes[0].index > firstPractice.index) fails.push(`${page}: the line comes after the first practice-world Run button`);
    const nextBlock = html.indexOf('<div class="expressive-code"', notes[0].index);
    if (firstPractice && html.lastIndexOf('<div class="expressive-code"', firstPractice.index) !== nextBlock) fails.push(`${page}: the line is not right above the first practice-world sample`);
  }
  const scripts = [...html.matchAll(/<script\b[^>]*\bdata-ow-run\b[^>]*>/g)].map((m) => m[0]);
  if (scripts.length !== 1) fails.push(`${page}: ${scripts.length} runner script(s); one is wanted`);
  else {
    const s = scripts[0];
    if (practiceAt >= 0) {
      if (unesc(attr(s, 'data-key') ?? '') !== p.key) fails.push(`${page}: the runner's key is not contract/practice.json's`);
      if (unesc(attr(s, 'data-pin') ?? '') !== p.pin) fails.push(`${page}: the runner's PIN is not contract/practice.json's`);
      if (attr(s, 'data-reset') !== p.reset_utc) fails.push(`${page}: the runner's reset hour is not contract/practice.json's`);
    } else if (attr(s, 'data-key') !== undefined || attr(s, 'data-pin') !== undefined) fails.push(`${page}: the runner carries the practice key or PIN on a page whose Runs all use a demo key`);
    if (attr(s, 'src') !== `/assets/ow-run.js?v=${jsHash}`) fails.push(`${page}: the runner's src (${attr(s, 'src')}) is not /assets/ow-run.js?v=${jsHash}, the built file's hash`);
  }
  return fails;
}

const RUNNER_TRACE = /data-ow-run|ow-run-note|ow-run-panel|\/assets\/ow-run\.js/;
export const checkOther = (page, html) => (RUNNER_TRACE.test(html) ? [`${page}: carries a Run button, panel, line or runner, and has no marker`] : []);
export function checkText(file, text) {
  const fails = [];
  if (/<!--\s*run:|\{\/\*\s*run:/.test(text)) fails.push(`${file}: carries a run marker`);
  if (text.includes('Run sends the sample') || /data-ow-run|ow-run-/.test(text)) fails.push(`${file}: carries the Run line or a Run button`);
  return fails;
}

// ---- the run ----------------------------------------------------------------------------------------
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const builtPath = (rel) => {
  const slug = rel.replace(/\.mdx?$/, '').toLowerCase();
  return slug.endsWith('/index') ? join(DIST, slug.slice(0, -'/index'.length), 'index.html') : join(DIST, `${slug}.html`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const blind = (why) => { console.log(`verify-run: BLIND: ${why}. Not a pass.`); process.exit(2); };
  let p;
  try { p = JSON.parse(readFileSync(join(ROOT, 'contract', 'practice.json'), 'utf8')); } catch (e) { blind(`contract/practice.json unreadable (${e.message})`); }
  const fails = [];
  const withMarkers = new Map();
  let count = 0;
  for (const file of walk(CONTENT).filter((f) => /\.mdx?$/.test(f))) {
    const rel = relative(CONTENT, file).replaceAll('\\', '/');
    const r = checkSource(rel, readFileSync(file, 'utf8'));
    fails.push(...r.fails);
    if (r.markers.length) withMarkers.set(builtPath(rel), { rel, markers: r.markers });
    count += r.markers.length;
  }
  if (!count) blind('no run marker on any page');
  if (!existsSync(DIST)) blind('no dist/ (run npm run build first)');
  const js = join(DIST, 'assets', 'ow-run.js');
  if (!existsSync(js)) blind('dist/assets/ow-run.js missing');
  const jsHash = createHash('sha256').update(readFileSync(js)).digest('hex').slice(0, 10);
  let pages = 0, texts = 0;
  for (const file of walk(DIST)) {
    const rel = relative(DIST, file).replaceAll('\\', '/');
    if (file.endsWith('.html')) {
      const html = readFileSync(file, 'utf8');
      const own = withMarkers.get(file);
      if (own) { fails.push(...checkPage(rel, html, own.markers, p, jsHash)); own.seen = true; pages++; } else fails.push(...checkOther(rel, html));
    } else if (/\.(md|txt)$/.test(file)) {
      fails.push(...checkText(rel, readFileSync(file, 'utf8')));
      texts++;
    }
  }
  for (const [file, { rel, seen }] of withMarkers) if (!seen) fails.push(`${rel}: no built page at ${relative(ROOT, file).replaceAll('\\', '/')}`);
  if (fails.length) {
    console.log(`verify-run: FAIL (${fails.length})`);
    for (const f of fails) console.log(`  ${f}`);
    process.exit(1);
  }
  console.log(`verify-run: PASS: ${count} run marker(s) on ${withMarkers.size} page(s), each held to its sample; ${pages} built page(s) carry their buttons, panels, line and runner, no other page does, and ${texts} Markdown and text file(s) carry none`);
}
