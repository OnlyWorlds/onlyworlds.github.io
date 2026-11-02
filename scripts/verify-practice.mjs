#!/usr/bin/env node
/**
 * verify-practice.mjs: the practice world's key, PIN and reset hour on the pages, held to one file.
 *
 * Usage: node scripts/verify-practice.mjs                    check the pages against contract/practice.json (offline; in `npm run verify`)
 *        node scripts/verify-practice.mjs --live             also ask production who the key is: GET /api/v2/me with the key and PIN
 *        node scripts/verify-practice.mjs --source <keel>    also compare the file byte for byte with keel's contract/practice.json on origin/main
 *
 * The practice world is a world anyone may write to: its key and PIN are published on purpose, on the
 * Keys and PINs page and in the TypeScript and Python Write sections. contract/practice.json is keel's
 * own file of those literals, copied here, so a rotation is one file and a red build, never a hunt.
 *
 * Checks (fail):
 *   (a) every full world key (`ow_w_` and 20 or more key characters) on any page is the file's key: a
 *       page holds no other real key;
 *   (b) each page that must carry the literals does: Keys and PINs (the key, `PIN \`<pin>\``, the reset
 *       hour as `<hh:mm> UTC`), and both Write sections (`OW_API_KEY=<key>`, `OW_API_PIN=<pin>`, a link
 *       to the box at /docs/getting-started/keys#the-practice-world);
 *   (c) on a page that carries the key, every `OW_API_PIN=<digits>` is the file's PIN (a placeholder such
 *       as `OW_API_PIN=...` is not a literal and is left alone); in the box's section,
 *       every `PIN \`…\`` is the PIN and every `<hh:mm> UTC` the reset hour.
 * --live (fail): /me answers 200 for the key and PIN, with the file's world id and write scope.
 * Not checked here: that the Write examples run (scripts/run-practice.mjs, nightly), what the guards
 * refuse (keel's tests).
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (the file or a page unreadable, production or keel unreadable: never a pass).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'contract', 'practice.json');
const DOCS = join(ROOT, 'src', 'content', 'docs');
const BOX = '/docs/getting-started/keys#the-practice-world';
const argv = process.argv.slice(2);
const blind = (why) => { console.log(`verify-practice: BLIND: ${why}. Not a pass.`); process.exit(2); };

let lit;
try { lit = JSON.parse(readFileSync(FILE, 'utf8')); } catch (e) { blind(`contract/practice.json unreadable (${e.message})`); }
for (const k of ['world_id', 'key', 'pin', 'reset_utc']) {
  if (typeof lit[k] !== 'string' || !lit[k]) blind(`contract/practice.json has no ${k}`);
}
if (!/^ow_w_[A-Za-z0-9_-]{20,}$/.test(lit.key)) blind('contract/practice.json\'s key is not an ow_w_ key');
if (!/^\d{4}$/.test(lit.pin)) blind('contract/practice.json\'s PIN is not four digits');
if (!/^\d{2}:\d{2}$/.test(lit.reset_utc)) blind('contract/practice.json\'s reset_utc is not hh:mm');

const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.mdx?$/.test(f)) pages.push(p);
  }
})(DOCS);
if (!pages.length) blind('no pages under src/content/docs');
const rel = (p) => relative(ROOT, p).replaceAll('\\', '/');
const text = new Map(pages.map((p) => [rel(p), readFileSync(p, 'utf8')]));

const fails = [];
let checks = 0;
const check = (ok, why) => { checks++; if (!ok) fails.push(why); };

// (a) no other real key on any page
for (const [page, t] of text) {
  for (const m of t.matchAll(/ow_w_[A-Za-z0-9_-]{20,}/g)) check(m[0] === lit.key, `${page}: a full world key that is not the practice world's (${m[0].slice(0, 9)}…)`);
}

// a page's section from its heading to the next heading of the same level or higher
function section(t, heading) {
  const lines = t.split(/\r?\n/);
  const at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) return null;
  const level = heading.match(/^#+/)[0].length;
  let end = lines.length;
  for (let i = at + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#+) /);
    if (h && h[1].length <= level) { end = i; break; }
  }
  return lines.slice(at, end).join('\n');
}

// (b) and (c)
const KEYS = 'src/content/docs/docs/getting-started/keys.md';
const WRITES = ['src/content/docs/docs/development/typescript.md', 'src/content/docs/docs/development/python.md'];
for (const page of [KEYS, ...WRITES]) if (!text.has(page)) blind(`${page} not found`);

const box = section(text.get(KEYS), '## The practice world');
check(box !== null, `${KEYS}: no "## The practice world" section`);
if (box !== null) {
  check(box.includes(`\`${lit.key}\``), `${KEYS}: the box does not show the key`);
  const pins = [...box.matchAll(/PIN `([^`]*)`/g)].map((m) => m[1]);
  check(pins.length > 0, `${KEYS}: the box does not show the PIN as PIN \`…\``);
  for (const p of pins) check(p === lit.pin, `${KEYS}: the box's PIN \`${p}\` is not the file's`);
  const hours = [...box.matchAll(/\b(\d{1,2}:\d{2}) UTC\b/g)].map((m) => m[1]);
  check(hours.length > 0, `${KEYS}: the box does not say the reset hour as <hh:mm> UTC`);
  for (const h of hours) check(h === lit.reset_utc, `${KEYS}: the box's reset hour ${h} UTC is not the file's ${lit.reset_utc}`);
}
for (const page of WRITES) {
  const w = section(text.get(page), '## Write');
  check(w !== null, `${page}: no "## Write" section`);
  if (w === null) continue;
  check(new RegExp(`^(export )?OW_API_KEY=${lit.key}$`, 'm').test(w), `${page}: the Write section's OW_API_KEY line is not the practice key`);
  check(new RegExp(`^(export )?OW_API_PIN=${lit.pin}$`, 'm').test(w), `${page}: the Write section's OW_API_PIN line is not the practice PIN`);
  check(w.includes(`](${BOX})`), `${page}: the Write section does not link to the box (${BOX})`);
}
for (const [page, t] of text) {
  if (!t.includes(lit.key)) continue;
  for (const m of t.matchAll(/OW_API_PIN=(\d+)/g)) check(m[1] === lit.pin, `${page}: OW_API_PIN=${m[1]} beside the practice key is not its PIN`);
}

// --live: production says who the key is
if (argv.includes('--live')) {
  let r, body;
  try {
    r = await fetch('https://www.onlyworlds.com/api/v2/me', { headers: { 'API-Key': lit.key, 'API-Pin': lit.pin, 'User-Agent': 'onlyworlds-docs verify-practice' }, signal: AbortSignal.timeout(20000) });
    body = await r.json();
  } catch (e) { blind(`production unreadable (${e.message})`); }
  if (r.status === 429 || r.status >= 500) blind(`production answered ${r.status}`);
  check(r.status === 200, `live: /me answered ${r.status} for the practice key and PIN (${body?.error?.code ?? body?.code ?? '?'})`);
  if (r.status === 200) {
    check(body?.world?.id === lit.world_id, `live: the key's world is ${body?.world?.id}, not the file's ${lit.world_id}`);
    check(body?.scope === 'write', `live: the key's scope is ${body?.scope}, not write`);
  }
}

// --source <keel checkout>: the file is keel's, byte for byte
const si = argv.indexOf('--source');
if (si >= 0) {
  const dir = argv[si + 1];
  if (!dir) blind('--source needs keel\'s checkout');
  let theirs;
  try { theirs = execFileSync('git', ['-C', dir, 'show', 'origin/main:contract/practice.json'], { timeout: 20000 }); } catch (e) { blind(`keel's contract/practice.json unreadable on origin/main (${String(e.message).split('\n')[0]})`); }
  check(Buffer.compare(theirs, readFileSync(FILE)) === 0, 'source: contract/practice.json differs from keel\'s on origin/main');
}

for (const f of fails) console.log(`  FAIL   ${f}`);
if (fails.length) { console.log(`verify-practice: FAIL: ${fails.length} of ${checks} check(s)`); process.exit(1); }
console.log(`verify-practice: PASS: ${checks} check(s); the practice world's literals on ${[KEYS, ...WRITES].length} pages match contract/practice.json${argv.includes('--live') ? ', and production answers the key' : ''}.`);
