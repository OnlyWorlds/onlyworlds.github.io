#!/usr/bin/env node
/**
 * verify-guide.mjs: the LLM guide's names and codes, and the three key tables, held to the SDK the docs pin and the error-code snapshot.
 *
 * Usage: node scripts/verify-guide.mjs   (offline; in `npm run verify`)
 *
 * public/assets/ow_llm_guide.txt is served as it stands, so no build step reads it and no page gate
 * sees it, while an agent reads it first. This holds what in it has a source the docs already vendor:
 *   (a) ERRORS: every "- <status> <code>:" line names a code in contract/error-codes.json (the live
 *       document's x-ow-error-codes, gen_errors.mjs) with that status;
 *   (b) the SDK names: every name in an `import { … } from '@onlyworlds/sdk'` and every Ow… name is
 *       an export of the installed @onlyworlds/sdk (package.json's exact pin), and every
 *       `client.<method>(` in the guide is a method of OwV2Client;
 *   (c) THE 22 ELEMENT TYPES: the "- <type>:" lines are the SDK's ELEMENT_TYPES, each once, A to Z,
 *       and a backticked name on a type's line is a field of that type in FIELD_SCHEMA;
 *   (d) the key kinds, in the guide's GET A KEY list and the Key tables of getting-started/index.md
 *       and getting-started/keys.md: each copy names every prefix the SDK's detectKeyKind tells
 *       apart (found by asking it, ow_a_ to ow_z_) and the 10-digit legacy key, and no other ow_…_
 *       prefix but the seat secret ow_s_, which is no key (it goes where a PIN goes).
 *   (e) PLAIN HTTP: every "METHOD /api/v2/..." route line is an operation in contract/callers.json
 *       (the API document's operations), `{type}` standing for each of the 22 types; and the list's
 *       filters ("Filters the server accepts: …") and parameters ("… are parameters, not filters")
 *       together name exactly the list route's query parameters, each once, held to the collective
 *       list route in contract/shapes.json (collective takes `characters`); each type the sentence
 *       says takes `characters` is an element type.
 * Not checked: the words of each key's row (what it reads and writes, the PIN), which types' list
 * routes take `characters` (only the collective route's parameters are vendored), its toolkit
 * paragraph and limits (verify-toolkit, verify-limits), its links (the sweep's check 5).
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (a file or a section this reads is missing, or a section parses to
 * nothing: never a pass).
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GUIDE = join(ROOT, 'public', 'assets', 'ow_llm_guide.txt');
const START = join(ROOT, 'src', 'content', 'docs', 'docs', 'getting-started');
const blind = (why) => { console.log(`verify-guide: BLIND: ${why}`); process.exit(2); };
const readText = (f) => { try { return readFileSync(f, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { blind(`${f} unreadable (${e.message})`); } };

const guide = readText(GUIDE);
const lineOf = (text, at) => text.slice(0, at).split('\n').length;
// A section of the guide: from its underlined heading to the next underlined or ===-ruled heading.
const section = (title) => {
  const m = guide.match(new RegExp(`^${title}\\n-+\\n`, 'm'));
  if (!m) blind(`the guide has no "${title}" section`);
  const rest = guide.slice(m.index + m[0].length);
  const end = rest.search(/^(?:[A-Z][^\n]*\n-{3,}\n|={10,}$)/m);
  return { text: end < 0 ? rest : rest.slice(0, end), at: m.index + m[0].length };
};

let sdk;
try { sdk = await import('@onlyworlds/sdk'); } catch (e) { blind(`@onlyworlds/sdk is not installed (${e.message}): npm install`); }
const sdkVersion = JSON.parse(readText(join(ROOT, 'node_modules', '@onlyworlds', 'sdk', 'package.json'))).version;
let codes;
try { codes = JSON.parse(readText(join(ROOT, 'contract', 'error-codes.json'))); } catch (e) { blind(`contract/error-codes.json is not JSON (${e.message})`); }
// The snapshot is the document's x-ow-error-codes as served: an object keyed by code.
const byCode = new Map(Object.entries(codes).filter(([, c]) => c && typeof c === 'object' && 'status' in c));
if (!byCode.size) blind('contract/error-codes.json lists no codes');

const fails = [];
const counts = {};

// ---- (a) ERRORS -------------------------------------------------------------------------------
{
  const { text, at } = section('ERRORS');
  const lines = [...text.matchAll(/^- (\d{3}) ([a-z_]+):/gm)];
  if (!lines.length) blind('the guide\'s ERRORS section lists no "- <status> <code>:" line');
  for (const m of lines) {
    const c = byCode.get(m[2]);
    const where = `ow_llm_guide.txt:${lineOf(guide, at + m.index)}`;
    if (!c) fails.push(`${where}: ${m[2]} is not a code in the API document (a)`);
    else if (String(c.status) !== m[1]) fails.push(`${where}: ${m[2]} is ${c.status} in the API document, and the guide says ${m[1]} (a)`);
  }
  counts.errors = lines.length;
}

// ---- (b) the SDK names ------------------------------------------------------------------------
{
  const names = new Map(); // name -> first line
  for (const m of guide.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@onlyworlds\/sdk['"]/g)) {
    for (const n of m[1].split(',').map((s) => s.trim()).filter(Boolean)) if (!names.has(n)) names.set(n, lineOf(guide, m.index));
  }
  for (const m of guide.matchAll(/\bOw[A-Z][A-Za-z0-9]*/g)) if (!names.has(m[0])) names.set(m[0], lineOf(guide, m.index));
  if (!names.size) blind('the guide names nothing from @onlyworlds/sdk');
  for (const [n, line] of names) if (!(n in sdk)) fails.push(`ow_llm_guide.txt:${line}: ${n} is not an export of @onlyworlds/sdk ${sdkVersion} (b)`);
  const methods = new Map();
  for (const m of guide.matchAll(/\bclient\.([A-Za-z]+)\(/g)) if (!methods.has(m[1])) methods.set(m[1], lineOf(guide, m.index));
  if (!methods.size) blind('the guide calls no client.<method>(');
  const proto = sdk.OwV2Client?.prototype;
  if (!proto) blind(`@onlyworlds/sdk ${sdkVersion} exports no OwV2Client`);
  for (const [m, line] of methods) if (typeof proto[m] !== 'function') fails.push(`ow_llm_guide.txt:${line}: client.${m}() is not a method of OwV2Client in @onlyworlds/sdk ${sdkVersion} (b)`);
  counts.names = names.size;
  counts.methods = methods.size;
}

// ---- (c) THE 22 ELEMENT TYPES -----------------------------------------------------------------
{
  const { text, at } = section('THE 22 ELEMENT TYPES');
  // A type's entry runs from its "- <type>:" line to the next entry, its wrapped lines indented.
  const entries = [...text.matchAll(/^- ([a-z]+):((?:[^\n]*)(?:\n  [^\n]*)*)/gm)];
  if (!entries.length) blind('the guide\'s type section lists no "- <type>:" line');
  const listed = entries.map((m) => m[1]);
  const want = [...sdk.ELEMENT_TYPES].map(String);
  const missing = want.filter((t) => !listed.includes(t));
  const extra = listed.filter((t) => !want.includes(t));
  const twice = listed.filter((t, i) => listed.indexOf(t) !== i);
  if (missing.length) fails.push(`ow_llm_guide.txt: the type list leaves out ${missing.join(', ')} (c)`);
  if (extra.length) fails.push(`ow_llm_guide.txt: the type list names ${extra.join(', ')}, which @onlyworlds/sdk ${sdkVersion} does not have (c)`);
  if (twice.length) fails.push(`ow_llm_guide.txt: the type list names ${[...new Set(twice)].join(', ')} twice (c)`);
  const sorted = [...listed].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (listed.join() !== sorted.join()) fails.push('ow_llm_guide.txt: the type list says "A to Z" and is not in that order (c)');
  let fields = 0;
  for (const m of entries) {
    for (const f of m[2].matchAll(/`([a-z_]+)`/g)) {
      fields++;
      if (!sdk.FIELD_SCHEMA?.[m[1]]?.[f[1]]) fails.push(`ow_llm_guide.txt:${lineOf(guide, at + m.index)}: \`${f[1]}\` is not a field of ${m[1]} in @onlyworlds/sdk ${sdkVersion} (c)`);
    }
  }
  counts.types = listed.length;
  counts.fields = fields;
}

// ---- (d) the key kinds ------------------------------------------------------------------------
{
  if (typeof sdk.detectKeyKind !== 'function') blind(`@onlyworlds/sdk ${sdkVersion} exports no detectKeyKind`);
  const prefixes = 'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => `ow_${c}_`)
    .filter((p) => !['unknown', 'none', 'legacy'].includes(sdk.detectKeyKind(p + 'x'.repeat(32))));
  if (!prefixes.length) blind('detectKeyKind tells no ow_…_ prefix apart');
  if (sdk.detectKeyKind('1234567890') !== 'legacy') blind('detectKeyKind does not read a 10-digit key as legacy');
  const SECRET = 'ow_s_'; // the seat secret, sent as API-Pin: named beside the keys, never a key kind
  const copies = [];
  {
    const { text, at } = section('GET A KEY');
    const rows = [...text.matchAll(/^ +- (ow_[a-z]_|Legacy 10-digit)[^\n]*/gm)];
    copies.push({ where: 'ow_llm_guide.txt (GET A KEY)', line: rows.length ? lineOf(guide, at + rows[0].index) : 0, firsts: rows.map((m) => m[0]) });
  }
  for (const page of ['index.md', 'keys.md']) {
    const text = readText(join(START, page));
    const head = text.match(/^\| Key \|[^\n]*\n\|[ :|-]+\n((?:\|[^\n]*\n)+)/m);
    if (!head) { copies.push({ where: `getting-started/${page}`, line: 0, firsts: [] }); continue; }
    const firsts = head[1].trimEnd().split('\n').map((r) => r.split('|')[1] ?? '');
    copies.push({ where: `getting-started/${page}`, line: lineOf(text, head.index), firsts });
  }
  for (const c of copies) {
    if (!c.firsts.length) blind(`${c.where}: no key list or Key table found`);
    const named = new Set(c.firsts.flatMap((f) => [...f.matchAll(/ow_[a-z]_/g)].map((m) => m[0])));
    for (const p of prefixes) if (!named.has(p)) fails.push(`${c.where}:${c.line}: the key kinds leave out ${p}, which the SDK's detectKeyKind reads as '${sdk.detectKeyKind(p + 'x'.repeat(32))}' (d)`);
    for (const p of named) if (!prefixes.includes(p) && p !== SECRET) fails.push(`${c.where}:${c.line}: the key kinds name ${p}, which the SDK does not read as a key (d)`);
    if (!c.firsts.some((f) => /10-digit/i.test(f))) fails.push(`${c.where}:${c.line}: the key kinds leave out the 10-digit legacy key (d)`);
  }
  counts.keyCopies = copies.length;
  counts.prefixes = prefixes.length;
}

// ---- (e) PLAIN HTTP's routes, and the list's filters and parameters -----------------------------
{
  let callers, shapes;
  try { callers = JSON.parse(readText(join(ROOT, 'contract', 'callers.json'))); shapes = JSON.parse(readText(join(ROOT, 'contract', 'shapes.json'))); }
  catch (e) { blind(`contract/callers.json or contract/shapes.json is not JSON (${e.message})`); }
  const norm = (p) => p.replace(/\/+$/, '').replace(/\{[^}]+\}/g, '{}');
  const ops = new Set((callers.operations ?? []).map(([m, p]) => `${m} ${norm(p)}`));
  if (!ops.size) blind('contract/callers.json lists no operations');
  const { text, at } = section('PLAIN HTTP');
  const routes = [...text.matchAll(/^\s+(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/v2\/\S+)/gm)];
  if (!routes.length) blind('the guide\'s PLAIN HTTP section lists no "METHOD /api/v2/..." route');
  for (const m of routes) {
    const where = `ow_llm_guide.txt:${lineOf(guide, at + m.index)}`;
    const paths = m[2].includes('{type}') ? [...sdk.ELEMENT_TYPES].map((t) => m[2].replace('{type}', t)) : [m[2]];
    const missing = paths.filter((p) => !ops.has(`${m[1]} ${norm(p)}`));
    if (missing.length) fails.push(`${where}: ${m[1]} ${m[2]} is not an operation of the API document${m[2].includes('{type}') ? ` for ${missing.length} of the 22 types (${missing.slice(0, 3).join(', ')})` : ''} (e)`);
  }
  counts.routes = routes.length;
  // The list's query: the filters sentence and the parameters sentence together name the list route's
  // parameters, each once. Held to the collective list route (collective takes `characters`, one of the
  // six the sentence names); which six take it is not checked.
  const filt = guide.match(/Filters the server accepts: ([\s\S]*?) on ([a-z ,\n]+?)\./);
  // The parameters sentence opens the line after the filter example's closing fence.
  const parm = guide.match(/```\n([a-z_][^`]*?) are parameters, not filters/);
  const q = shapes.targets?.['GET /api/v2/collective query']?.props;
  if (!filt || !parm) blind('the guide\'s "Filters the server accepts: …" or "… are parameters, not filters" sentence is not there as this reads it');
  if (!q) blind('contract/shapes.json holds no "GET /api/v2/collective query" target (the reads page tags it)');
  const names = (s) => s.replace(/\([^)]*\)/g, '').split(/,|\band\b/).map((x) => x.trim()).filter(Boolean);
  const said = [...names(filt[1]), ...names(parm[1])];
  const bad = said.filter((n) => !/^[a-z_]+$/.test(n));
  if (bad.length) blind(`the guide's filter or parameter list holds what this does not read as a name: ${bad.join(', ')}`);
  const want = Object.keys(q);
  const twice = said.filter((n, i) => said.indexOf(n) !== i);
  for (const n of said) if (!want.includes(n)) fails.push(`ow_llm_guide.txt: "${n}" is named as a list filter or parameter, and the API document's list route does not take it (e)`);
  for (const n of want) if (!said.includes(n)) fails.push(`ow_llm_guide.txt: the list route takes "${n}", and the guide's filters and parameters, which it says are every one, leave it out (e)`);
  if (twice.length) fails.push(`ow_llm_guide.txt: the filters and parameters name ${[...new Set(twice)].join(', ')} twice (e)`);
  for (const t of names(filt[2].replace(/\n/g, ' '))) if (!sdk.ELEMENT_TYPES.includes(t)) fails.push(`ow_llm_guide.txt: "characters" is said to filter ${t}, which is no element type (e)`);
  counts.params = said.length;
}

for (const f of fails) console.log(`  FAIL   ${f}`);
const summary = `${counts.errors} error lines, ${counts.names} SDK names and ${counts.methods} client methods, ${counts.types} types and ${counts.fields} field names, ${counts.prefixes} key prefixes in ${counts.keyCopies} copies, ${counts.routes} routes and ${counts.params} list filters and parameters; against @onlyworlds/sdk ${sdkVersion}, the error-code, credentials and shapes snapshots`;
if (fails.length) { console.log(`verify-guide: FAIL — ${fails.length} problem(s) in ${summary}`); process.exit(1); }
console.log(`verify-guide: PASS — ${summary}. Not checked: each key row's words, which types take the characters filter (see the header).`);
