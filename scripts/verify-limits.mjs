#!/usr/bin/env node
/**
 * verify-limits.mjs: the numbers the pages give for the API's limits, held to the limits keel's API document lists.
 *
 * Usage: node scripts/verify-limits.mjs            check the pages against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-limits.mjs --live     compare the snapshot with the live document; exit 1 if they differ
 *        node scripts/verify-limits.mjs --refresh  first rewrite the snapshot from the live document, then check
 *
 * Source: info.x-ow-limits in https://www.onlyworlds.com/api/v2/openapi.json (public, no key): one
 * entry per limit, {value, unit, per, applies_to, where}, each value read from the code that enforces
 * it. Vendored as contract/limits.json, entries as served, one per line, so a build never depends on
 * the API being up. `read_at` is the day the facts last changed (a refresh that finds them equal keeps it).
 *
 * A sentence is tied to a limit by a marker on its own source line (a paragraph, a list item or a
 * table row is one line on these pages), which renders nothing; postbuild.mjs drops it from the
 * Markdown twin:
 *   .md   <!-- limit: NAME [NAME …] -->
 *   .mdx  {/* limit: NAME [NAME …] *\/}
 * Markers sit inline, beside the words they guard: a comment on a line of its own would end a list
 * or a table, and most limits are stated in lists and tables.
 *
 * How a number counts as the entry's value: the line, markers taken out, holds the value
 *   - as a bare number (300, 1000 or 1,000, 2.5), or a number word up to twelve, twenty, thirty,
 *     fifty or hundred ("six requests", "fifty per world"); a list value ([1, 7, 30]) needs each;
 *   - or with a unit of the entry's own kind, converted: bytes as bytes, KB, MB or GB on a 1024 base
 *     (KiB, MiB, GiB read the same: 2.5 MB is 2,621,440 bytes); seconds, hours and days as s, seconds,
 *     min, minutes, h, hours or days, "a" or "an" for one ("a minute" is 60 seconds, "24 hours" is
 *     86,400). A number carrying a unit of another kind ("24 hours" for a byte limit) does not count.
 * A marker proves the value is stated on its line, not which of the line's numbers states it, so a
 * second rule holds the line's other copies: every number with a unit of a marked entry's kind
 * ("25 MB", "24 hours"), or followed by a marked count entry's unit word ("300 requests",
 * "1000 items"), must be one of the marked entries' values. That rule reads digits only ("one
 * request", "a second time" are words of the sentence) and leaves out quoted text ("…" or `…`, a
 * server's message or a literal). A bare copy ("shares that key's 300") is not held.
 *
 * Checks (fail):
 *   (a) every NAME a marker gives is an entry of the snapshot;
 *   (b) each marked line states each named entry's value, in a form above, and restates none with
 *       another value;
 *   (c) a marker in the other file type's form, an empty one, or one inside generated text (a region
 *       a generator rewrites: the errors table, the SDK reference, the field tables) fails;
 *   (d) the LLM guide (public/assets/ow_llm_guide.txt, plain text, which a marker would show in):
 *       each sentence in GUIDE below is found exactly once, and its number is the entry's value;
 *   (e) an ELSEWHERE line given the SDK's values (the archive floor) states both.
 * Not checked, printed by name: on lines with no marker, every byte size (KB, MB, GB) and every
 * "N a minute" rate, so a size or rate nothing holds is seen (outside code blocks, generated text
 * and the changelog, whose lines record what was true then). Other numbers on unmarked lines (counts,
 * characters, days) are not found at all. A size another program enforces is named in ELSEWHERE
 * with where it lives, and prints as held there; an ELSEWHERE entry no line matches fails. Never compared: an entry's `per`, `applies_to` and `where`
 * (who a limit counts against, and what happens past it, stay the page's own words); the limits of
 * other programs a page states (the MCP server's, the SDKs' own checks, the upload host's paths); the
 * generated errors table, which is keel's own text (gen_errors.mjs holds it).
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (the document unreadable, or no
 * x-ow-limits in it, or the snapshot unreadable: never a pass).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_FILE_MAX_BYTES, WORLD_FILE_MAX_ENTRIES } from '@onlyworlds/sdk';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'limits.json');
const CONTENT = join(ROOT, 'src', 'content', 'docs');
const GUIDE_FILE = join(ROOT, 'public', 'assets', 'ow_llm_guide.txt');
const CHANGELOG = 'docs/changelog.md';
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-limits: BLIND: ${why}`); process.exit(2); };

// The LLM guide's limit sentences, each with its one number captured. A sentence that moves or is
// reworded fails until this list follows it.
const GUIDE = [
  ['bulk_items', /POST\s+\/api\/v2\/bulk\s+up to (\S+) items/],
  ['list_ids_max', /ids \(comma-separated, up to (\S+?)\)/],
  ['bulk_items', /^Up to (\S+) items\. Only 2xx answers/m],
  ['requests_per_minute', /over (\S+) requests a minute for this key/],
  ['requests_per_minute_keyless', /\((\S+) per\s+address without one\)/],
  ['image_tickets_per_day', /upload tickets for the last\s+24 hours \((\S+) of each\)/],
  ['file_tickets_per_day', /upload tickets for the last\s+24 hours \((\S+) of each\)/],
];

// ---- the snapshot ---------------------------------------------------------------------------------------
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: info.x-ow-limits, as served`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  '  "limits": {',
  Object.entries(s.limits).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n'),
  '  }',
  '}',
  '',
].join('\n');
const showValue = (v) => (Array.isArray(v) ? `[${v.join(', ')}]` : String(v));

if (args.has('--live') || args.has('--refresh')) {
  let live;
  try {
    const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    live = (await r.json())?.info?.['x-ow-limits'];
  } catch (e) { blind(`${OPENAPI} (${e.message})`); }
  if (!live || typeof live !== 'object' || Array.isArray(live) || !Object.keys(live).length) blind(`${OPENAPI} has no info.x-ow-limits`);
  let snap = null;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable */ }
  const unchanged = snap && JSON.stringify(snap.limits) === JSON.stringify(live);
  if (args.has('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, limits: live }));
    console.log(`verify-limits: ${unchanged ? 'contract/limits.json unchanged' : 'wrote contract/limits.json'}: ${Object.keys(live).length} limits, read ${read_at}`);
  } else {
    if (!snap) { console.log('verify-limits: STALE: contract/limits.json missing or unreadable; run --refresh'); process.exit(1); }
    if (unchanged) { console.log(`verify-limits: contract/limits.json matches the live document: ${Object.keys(live).length} limits (read ${snap.read_at})`); process.exit(0); }
    console.log(`verify-limits: STALE: the live document's limits differ from contract/limits.json (read ${snap.read_at}); run --refresh, then mend the pages`);
    for (const k of new Set([...Object.keys(live), ...Object.keys(snap.limits ?? {})])) {
      const a = snap.limits?.[k], b = live[k];
      if (!a) console.log(`  ${k}: new (${showValue(b.value)} ${b.unit})`);
      else if (!b) console.log(`  ${k}: gone`);
      else if (JSON.stringify(a.value) !== JSON.stringify(b.value) || a.unit !== b.unit) console.log(`  ${k}: ${showValue(a.value)} ${a.unit} -> ${showValue(b.value)} ${b.unit}`);
      else if (JSON.stringify(a) !== JSON.stringify(b)) console.log(`  ${k}: ${Object.keys(b).filter((f) => JSON.stringify(a[f]) !== JSON.stringify(b[f])).join(', ')} changed`);
    }
    process.exit(1);
  }
}

let snap;
try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { blind(`contract/limits.json unreadable (${e.message}); run --refresh`); }
if (!snap?.limits || typeof snap.limits !== 'object' || !Object.keys(snap.limits).length) blind('contract/limits.json lacks limits');

// ---- reading a line's numbers ---------------------------------------------------------------------------
// Each unit kind: its words and their size in the kind's base (bytes, or seconds).
const KINDS = {
  bytes: [[/^(bytes?)$/i, 1], [/^(KB|KiB)$/, 1024], [/^(MB|MiB)$/, 1024 ** 2], [/^(GB|GiB)$/, 1024 ** 3]],
  time: [[/^(s|secs?|seconds?)$/i, 1], [/^(min|minutes?)$/i, 60], [/^(h|hours?)$/i, 3600], [/^(days?)$/i, 86400]],
};
const KIND_OF = { bytes: ['bytes', 1], seconds: ['time', 1], hours: ['time', 3600], days: ['time', 86400] };
const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, fifty: 50, hundred: 100 };
const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|${Object.keys(WORDS).join('|')}|an?`;
const TOKEN = new RegExp(String.raw`(?<![\w.,\-])(${NUM})(?![\w]|[.,]\d)(?:[  -]?([A-Za-z]+)\b)?`, 'gi');

// Every number on a line: {n, kind, size} (kind null: a bare number, or one with a word of no kind).
function numbersOf(text) {
  const out = [];
  for (const m of text.matchAll(TOKEN)) {
    const word = m[1].toLowerCase();
    const n = word in WORDS ? WORDS[word] : /^an?$/.test(word) ? 1 : Number(word.replaceAll(',', ''));
    let kind = null, size = 1;
    for (const [k, units] of Object.entries(KINDS)) for (const [re, s] of units) if (m[2] && re.test(m[2])) { kind = k; size = s; }
    if (/^an?$/.test(word) && !kind) continue;   // "a" or "an" is a number only before a unit
    out.push({ n, kind, size, word: m[2] ?? '', at: m.index, text: m[0] });
  }
  return out;
}

// Quoted text ("…" or `…`): a server message or a literal, never the page's own claim.
const quoted = (text) => [...text.matchAll(/"[^"]*"|`[^`]*`/g)].map((m) => [m.index, m.index + m[0].length]);

// The numbers on a marked line that restate one of its limits: a number with a unit of a marked
// entry's kind (bytes, time), or one followed by a marked count entry's unit word ("301 requests").
// Each must be one of those entries' values, so a second, wrong copy on the line fails.
function strays(nums, entries, text) {
  const q = quoted(text);
  const out = [];
  for (const x of nums) {
    if (!/^\d/.test(x.text) || q.some(([a, b]) => x.at >= a && x.at < b)) continue;
    const peers = entries.filter((e) => {
      const kind = KIND_OF[e.unit]?.[0];
      if (kind) return x.kind === kind;
      return x.kind === null && new RegExp(`^${e.unit.replace(/s$/, '')}s?$`, 'i').test(x.word);
    });
    if (peers.length && !peers.some((e) => [].concat(e.value).some((v) => states([x], v, e.unit)))) out.push(x.text);
  }
  return out;
}

// Does a line state one value of an entry?
function states(nums, value, unit) {
  const [kind, base] = KIND_OF[unit] ?? [null, 1];
  return nums.some((x) => (x.kind === null ? x.n === value : x.kind === kind && Math.abs(x.n * x.size - value * base) < 0.5));
}

// ---- the pages ------------------------------------------------------------------------------------------
const MARK = { md: /<!--\s*limit:\s*(.*?)\s*-->/g, mdx: /\{\/\*\s*limit:\s*(.*?)\s*\*\/\}/g };
const GEN_OPEN = /^(<!--|\{\/\*)\s*generated:(\S+)/, GEN_CLOSE = /^(<!--|\{\/\*)\s*\/generated:(\S+)/;
const pagesUnder = (dir) => readdirSync(dir).sort().flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? pagesUnder(p) : /\.mdx?$/.test(f) ? [p] : [];
});

// Sizes a page states that another program enforces, so the API document never lists them (its rule:
// each value read from the code that enforces it). Each names its page, the size as the page writes
// it, a word on the same line, and where the number lives; its line prints as held there, never as
// "not checked", and an entry that matches no line fails, since it names a sentence that moved.
// An entry with `bytes` (and `count`) is also checked: the line must state those values, read from the
// published SDK docs-next pins, whose archive floor is the folder spec's §4.7 (the SDK's copy of the spec
// is not itself checked against the spec here).
const ARCHIVE_FLOOR = { size: '2 GiB', where: "the folder spec's archive floor (§4.7), held to the pinned SDK's WORLD_FILE_MAX_BYTES and WORLD_FILE_MAX_ENTRIES", bytes: WORLD_FILE_MAX_BYTES, count: WORLD_FILE_MAX_ENTRIES };
const ELSEWHERE = [
  { page: 'docs/development/api/files.md', size: '250 MB', near: 'unpacked', where: "the upload host's own check on a world bundle (its unpacked cap), not in the API document" },
  { page: 'docs/development/api/files.md', size: '8 KB', near: 'NUL byte', where: "the upload host's text check (keel's files/service.py says the edge reads the first 8 KB), not in the API document" },
  { page: 'docs/development/python.md', size: '30 MB', near: 'Claude Projects', where: "Claude Projects' own cap on a file, a third party's" },
  { ...ARCHIVE_FLOOR, page: 'docs/development/typescript.md', near: 'unsafe_path' },
  { ...ARCHIVE_FLOOR, page: 'docs/development/unity.md', near: "spec's floor" },
  { ...ARCHIVE_FLOOR, page: 'docs/schema/folders.mdx', near: 'every reader accepts' },
];
const fails = [], unchecked = [], elsewhere = [], usedElsewhere = new Set();
let markers = 0, held = 0;
const used = new Set(), pagesMarked = new Set();
for (const file of pagesUnder(CONTENT)) {
  const rel = relative(CONTENT, file).replaceAll('\\', '/');
  const kind = file.endsWith('.mdx') ? 'mdx' : 'md', other = kind === 'md' ? 'mdx' : 'md';
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  let fence = null, generated = null;
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n], where = `${rel}:${n + 1}`;
    const f = /^\s*(`{3,}|~{3,})/.exec(line);
    if (f && (!fence || (f[1][0] === fence[0] && f[1].length >= fence.length && /^\s*[`~]+\s*$/.test(line)))) { fence = fence ? null : f[1]; continue; }
    if (fence) continue;
    const g = GEN_OPEN.exec(line.trim()), gc = GEN_CLOSE.exec(line.trim());
    if (gc) { generated = null; continue; }
    if (g) { generated = g[2]; continue; }
    if ([...line.matchAll(MARK[other])].length) fails.push(`${where}: a limit marker in the .${other} form (in a .${kind} page: ${kind === 'md' ? '<!-- limit: … -->' : '{/* limit: … */}'}) (c)`);
    const marks = [...line.matchAll(MARK[kind])];
    if (marks.length && generated) { fails.push(`${where}: a limit marker inside generated text (${generated}), which its generator rewrites (c)`); continue; }
    const text = line.replace(MARK[kind], '');
    if (!marks.length) {
      if (generated || rel === CHANGELOG) continue;
      let sizes = numbersOf(text).filter((x) => x.kind === 'bytes' && x.size > 1).map((x) => x.text);
      for (const e of ELSEWHERE) {
        if (e.page !== rel || !text.includes(e.near) || !sizes.includes(e.size)) continue;
        sizes = sizes.filter((s) => s !== e.size);
        usedElsewhere.add(e);
        elsewhere.push(`${where}: "${e.size}" is ${e.where}`);
        if (e.bytes === undefined) continue;
        const nums = numbersOf(text);
        if (!states(nums, e.bytes, 'bytes')) fails.push(`${where}: the line says ${e.size}, and the SDK's floor is ${e.bytes} bytes (e)`);
        if (e.count !== undefined && !states(nums, e.count, 'entries')) fails.push(`${where}: the line does not say the SDK's ${e.count.toLocaleString('en-US')} entries (e)`);
      }
      const rates = [...text.matchAll(/(?<![\w.,])\d[\d,]* (?:\w+ )?a minute\b/g)].map((m) => m[0]);
      if (sizes.length || rates.length) unchecked.push(`${where}: ${[...sizes, ...rates].map((s) => `"${s}"`).join(', ')}`);
      continue;
    }
    const nums = numbersOf(text), entries = [];
    for (const m of marks) {
      markers++;
      pagesMarked.add(rel);
      const names = m[1].split(/\s+/).filter(Boolean);
      if (!names.length) { fails.push(`${where}: an empty limit marker (c)`); continue; }
      for (const name of names) {
        const e = snap.limits[name];
        if (!e) { fails.push(`${where}: the marker names ${name}, which the API document's limits do not have (a)`); continue; }
        used.add(name);
        entries.push(e);
        held++;
        const missing = [].concat(e.value).filter((v) => !states(nums, v, e.unit));
        if (missing.length) fails.push(`${where}: ${name} is ${showValue(e.value)} ${e.unit}, and the line does not say ${missing.length < [].concat(e.value).length ? missing.join(', ') : 'so'} (b)`);
      }
    }
    const off = strays(nums, entries, text);
    if (off.length) fails.push(`${where}: ${off.map((s) => `"${s}"`).join(', ')} restates a marked limit with another value (b)`);
  }
}

// ---- the LLM guide ------------------------------------------------------------------------------------------
let guide;
try { guide = readFileSync(GUIDE_FILE, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { blind(`public/assets/ow_llm_guide.txt unreadable (${e.message})`); }
for (const [name, re] of GUIDE) {
  const e = snap.limits[name];
  if (!e) { fails.push(`ow_llm_guide.txt: GUIDE names ${name}, which the API document's limits do not have (a)`); continue; }
  const hits = [...guide.matchAll(new RegExp(re.source, `${re.flags}g`))];
  if (hits.length !== 1) { fails.push(`ow_llm_guide.txt: the ${name} sentence (${re.source}) is found ${hits.length} times, not once: follow it in GUIDE (d)`); continue; }
  used.add(name);
  held++;
  const nums = numbersOf(hits[0][1]);
  if (!states(nums, e.value, e.unit)) fails.push(`ow_llm_guide.txt:${guide.slice(0, hits[0].index).split('\n').length}: ${name} is ${showValue(e.value)} ${e.unit}, and the guide says ${hits[0][1]} (d)`);
}

for (const e of ELSEWHERE) if (!usedElsewhere.has(e)) fails.push(`ELSEWHERE names "${e.size}" beside "${e.near}" on ${e.page}, and no line there says it (c)`);
for (const u of elsewhere) console.log(`  held elsewhere  ${u}`);
for (const u of unchecked) console.log(`  not checked  ${u}`);
const unused = Object.keys(snap.limits).filter((k) => !used.has(k));
if (unused.length) console.log(`  no page states ${unused.length} limit(s): ${unused.join(', ')}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(`verify-limits: ${markers} marker(s) on ${pagesMarked.size} page(s) and ${GUIDE.length} sentence(s) of the LLM guide, ${held} value(s) held to contract/limits.json (${Object.keys(snap.limits).length} limits, read ${snap.read_at}); ${unchecked.length} unmarked line(s) with a size or rate`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) in the pages' limits`); process.exit(1); }
console.log('PASS');
