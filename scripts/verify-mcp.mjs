#!/usr/bin/env node
/**
 * verify-mcp.mjs: the MCP page's Tools and Resources tables, held to the server's own lists.
 *
 * Usage: node scripts/verify-mcp.mjs            check the page against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-mcp.mjs --live     compare the snapshot with the live server; exit 1 if they differ
 *        node scripts/verify-mcp.mjs --refresh  first rewrite the snapshot from the live server, then check the page
 *
 * Source: https://www.onlyworlds.com/mcp, the JSON-RPC methods tools/list, resources/list and
 * resources/templates/list, asked with the public demo key (read-only; no tool is ever called).
 * Vendored as contract/mcp.json so a build never depends on the server being up. The snapshot keeps
 * what the page claims: each tool's parameters (required, default, limits, enum values), its three
 * hints, and the credential its description says it needs; each resource's URI or URI template.
 * `read_at` is the day the facts last changed (a refresh that finds them equal keeps it).
 *
 * Checks (fail) on src/content/docs/docs/development/mcp.md:
 *   the three Tools tables name exactly the server's tools, each once;
 *   each table's tools need what its heading says (no key, a key, a write key and PIN), as each
 *   tool's description states it ("Unauthenticated", "Requires a READ or WRITE API-Key", "Requires a
 *   WRITE API-Key [and its PIN]"), and the write table holds exactly the tools not marked read-only;
 *   each row names every parameter the schema has and none it lacks, in bold exactly when required;
 *   each default or limit the row prints equals the schema's, and every default the schema gives
 *   (other than null) is printed; each enum value is named;
 *   the hints sentence: each tool it names has the hints it claims, "the N reads" counts the first
 *   two tables, and every tool marked destructive or not idempotent is said to be;
 *   the Resources table lists exactly the server's resource URIs and URI templates.
 * Not checked, printed by name: a limit the row prints that the schema does not carry (keel enforces
 * it in code, and its description says so in prose); the PIN half of the write heading for a tool
 * whose description names no PIN; the Resources table's Key column; the rest of each row's prose.
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (the server unreadable, or a page
 * or answer shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'mcp.json');
const PAGE = join(ROOT, 'src', 'content', 'docs', 'docs', 'development', 'mcp.md');
const SERVER = 'https://www.onlyworlds.com/mcp';
const DEMO_KEY = '0000000001';
const LIMITS = ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems'];
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-mcp: BLIND: ${why}`); process.exit(2); };

// ---- the server ----------------------------------------------------------------------------------
// The server answers a POST as an event stream (or plain JSON): the JSON-RPC answer is the data lines.
let rpcId = 0;
async function rpc(method, params = {}) {
  const r = await fetch(SERVER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'API-Key': DEMO_KEY },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`${method} answered HTTP ${r.status}`);
  const text = await r.text();
  const json = (r.headers.get('content-type') ?? '').includes('text/event-stream')
    ? text.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5)).join('')
    : text;
  const msg = JSON.parse(json);
  if (msg.error) throw new Error(`${method} answered the JSON-RPC error ${msg.error.code} (${msg.error.message})`);
  return msg.result;
}
async function list(method, key) {
  const out = [];
  let cursor;
  for (let i = 0; i < 20; i++) {
    const res = await rpc(method, cursor ? { cursor } : {});
    if (!Array.isArray(res?.[key])) throw new Error(`${method} answered no ${key} list`);
    out.push(...res[key]);
    if (!(cursor = res.nextCursor)) return out;
  }
  throw new Error(`${method} kept paging past 20 pages`);
}

// What a description says a tool needs. Null when it says none of these: that tool's grouping by
// credential is then not checked (its read-only hint still is).
const needsOf = (raw) => { const d = raw.replace(/\s+/g, ' '); return /\bUnauthenticated\b/.test(d) ? 'none'
  : /Requires a WRITE API-Key and its PIN/.test(d) ? 'write key and PIN'
  : /Requires a WRITE API-Key/.test(d) ? 'write key'
  : /Requires a READ or WRITE API-Key/.test(d) ? 'key' : null; };

function snapshotOf(tools, resources, templates) {
  if (!tools.length) throw new Error('tools/list answered no tools');
  const t = {};
  for (const tool of tools) {
    const s = tool.inputSchema;
    if (!s || s.type !== 'object') throw new Error(`${tool.name} has no object inputSchema`);
    const required = new Set(s.required ?? []);
    const params = {};
    for (const [p, def] of Object.entries(s.properties ?? {})) {
      const row = { required: required.has(p) };
      if ('default' in def) row.default = def.default;
      // a limit or an enum may sit on the property or on one branch of its anyOf (the non-null one)
      const branches = [def, ...(def.anyOf ?? [])];
      for (const k of LIMITS) { const b = branches.find((x) => k in x); if (b) row[k] = b[k]; }
      const e = branches.find((x) => Array.isArray(x.enum));
      if (e) row.enum = e.enum;
      params[p] = row;
    }
    const a = tool.annotations ?? {};
    t[tool.name] = {
      needs: needsOf(tool.description ?? ''),
      hints: { readOnly: a.readOnlyHint ?? null, destructive: a.destructiveHint ?? null, idempotent: a.idempotentHint ?? null },
      params,
    };
  }
  return { tools: t, resources: resources.map((r) => r.uri), templates: templates.map((r) => r.uriTemplate) };
}

// One tool per line, so a diff names the one that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${SERVER}: tools/list, resources/list and resources/templates/list, asked with the public demo key ${DEMO_KEY}`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  '  "tools": {',
  Object.entries(s.tools).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n'),
  '  },',
  `  "resources": ${JSON.stringify(s.resources)},`,
  `  "templates": ${JSON.stringify(s.templates)}`,
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify({ tools: s.tools, resources: s.resources, templates: s.templates });

if (args.has('--live') || args.has('--refresh')) {
  let live;
  try {
    live = snapshotOf(await list('tools/list', 'tools'), await list('resources/list', 'resources'), await list('resources/templates/list', 'resourceTemplates'));
  } catch (e) { blind(`${SERVER} (${e.message})`); }
  let snap = null;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable */ }
  const unchanged = snap && body(snap) === body(live);
  const summary = (s) => `${Object.keys(s.tools).length} tools, ${s.resources.length} resources, ${s.templates.length} templates`;
  if (args.has('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`verify-mcp: ${unchanged ? 'contract/mcp.json unchanged' : 'wrote contract/mcp.json'}: ${summary(live)}, read ${read_at}`);
  } else {
    if (!snap) { console.log('verify-mcp: STALE: contract/mcp.json missing or unreadable; run --refresh'); process.exit(1); }
    if (unchanged) { console.log(`verify-mcp: contract/mcp.json matches the live server: ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
    console.log(`verify-mcp: STALE: the live server differs from contract/mcp.json (read ${snap.read_at}); run --refresh, then mend the page`);
    for (const k of new Set([...Object.keys(live.tools), ...Object.keys(snap.tools ?? {})])) {
      const a = snap.tools?.[k], b = live.tools[k];
      if (!a) console.log(`  tool ${k}: new on the server`);
      else if (!b) console.log(`  tool ${k}: gone from the server`);
      else if (JSON.stringify(a) !== JSON.stringify(b)) {
        for (const p of new Set([...Object.keys(a.params), ...Object.keys(b.params)])) {
          if (JSON.stringify(a.params[p]) !== JSON.stringify(b.params[p])) console.log(`  tool ${k}, parameter ${p}: ${JSON.stringify(a.params[p] ?? null)} -> ${JSON.stringify(b.params[p] ?? null)}`);
        }
        if (JSON.stringify(Object.keys(a.params)) !== JSON.stringify(Object.keys(b.params)) && JSON.stringify(Object.keys(a.params).sort()) === JSON.stringify(Object.keys(b.params).sort())) console.log(`  tool ${k}: its parameters' order changed`);
        if (a.needs !== b.needs) console.log(`  tool ${k}: needs ${a.needs} -> ${b.needs}`);
        if (JSON.stringify(a.hints) !== JSON.stringify(b.hints)) console.log(`  tool ${k}: hints ${JSON.stringify(a.hints)} -> ${JSON.stringify(b.hints)}`);
      }
    }
    if (JSON.stringify(Object.keys(live.tools)) !== JSON.stringify(Object.keys(snap.tools ?? {})) && JSON.stringify(Object.keys(live.tools).sort()) === JSON.stringify(Object.keys(snap.tools ?? {}).sort())) console.log('  the tools\' order changed');
    for (const k of ['resources', 'templates']) if (JSON.stringify(live[k]) !== JSON.stringify(snap[k])) console.log(`  ${k}: ${JSON.stringify(snap[k])} -> ${JSON.stringify(live[k])}`);
    process.exit(1);
  }
}

// ---- the page against the snapshot ----------------------------------------------------------------
let snap;
try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { blind(`contract/mcp.json unreadable (${e.message}); run --refresh`); }
if (!snap?.tools || !Object.keys(snap.tools).length) blind('contract/mcp.json holds no tools');
const page = readFileSync(PAGE, 'utf8').replace(/\r\n/g, '\n');
const fails = [];
const unchecked = [];
const fail = (m) => fails.push(m);

const section = (head) => {
  const i = page.indexOf(`\n## ${head}\n`);
  if (i < 0) blind(`the MCP page has no "## ${head}" section`);
  const rest = page.slice(i + head.length + 5);
  const j = rest.search(/\n## /);
  return j < 0 ? rest : rest.slice(0, j);
};
// A table row's cells: split on unescaped pipes outside code spans.
const cells = (line) => {
  const out = [];
  let cur = '', code = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '`') code = !code;
    if (c === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue; }
    if (c === '|' && !code) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out.slice(1, -1);
};
// Split at top-level separators, keeping code spans, (…) and […] whole.
const splitTop = (s, seps) => {
  const out = [];
  let cur = '', depth = 0, code = false;
  for (const c of s) {
    if (c === '`') code = !code;
    else if (!code && (c === '(' || c === '[')) depth++;
    else if (!code && (c === ')' || c === ']')) depth--;
    if (!code && depth === 0 && seps.includes(c)) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
};

// ---- the three tool tables ----
const tools = section('Tools');
const GROUPS = { 'no key': 'none', 'a key': 'key', 'a write key and PIN': 'write' };
const rows = new Map();   // tool -> {group, args}
for (const part of tools.split(/\n(?=### )/).slice(1)) {
  const m = [null, part.slice(4, part.indexOf('\n')), part.slice(part.indexOf('\n') + 1)];
  const want = GROUPS[m[1].split(': ').slice(1).join(': ').trim()];
  if (!want) blind(`a Tools heading this does not read: "### ${m[1]}" (one of: ${Object.keys(GROUPS).map((g) => `"<name>: ${g}"`).join(', ')})`);
  for (const line of m[2].split('\n')) {
    const c = cells(line);
    if (c.length !== 3 || /^:?-+/.test(c[0]) || c[0] === 'Tool') continue;
    const name = (c[0].match(/^`([a-z_]+)`$/) ?? [])[1];
    if (!name) { fail(`a row in "### ${m[1]}" names no tool in its first cell: ${c[0]}`); continue; }
    if (rows.has(name)) fail(`${name} has a row in two tables ("${rows.get(name).heading}" and "${m[1]}")`);
    rows.set(name, { group: want, heading: m[1], args: c[1] });
  }
}
if (!rows.size) blind('no tool rows found under "## Tools"');
for (const t of Object.keys(snap.tools)) if (!rows.has(t)) fail(`${t}: on the server, missing from the Tools tables`);
for (const t of rows.keys()) if (!snap.tools[t]) fail(`${t}: has a row, but the server has no such tool`);

// grouping: the read-only hint (every table), and the credential each description states
const pinUnsaid = [];
for (const [t, r] of rows) {
  const s = snap.tools[t];
  if (!s) continue;
  if (s.hints.readOnly === null) unchecked.push(`${t}: no readOnlyHint, so its read/write table was not held to one`);
  else if ((r.group === 'write') === s.hints.readOnly) fail(`${t}: in "${r.heading}", but its readOnlyHint is ${s.hints.readOnly}`);
  const needs = s.needs;
  if (needs === null) unchecked.push(`${t}: its description states no credential, so "${r.heading}" was not held to one`);
  else if (r.group === 'write') {
    if (!needs.startsWith('write key')) fail(`${t}: in "${r.heading}", but its description says it needs ${needs === 'none' ? 'no key' : 'a read or write key'}`);
    else if (needs === 'write key') pinUnsaid.push(t);
  } else if (needs !== r.group) fail(`${t}: in "${r.heading}", but its description says it needs ${needs === 'none' ? 'no key' : needs === 'key' ? 'a read or write key' : `a ${needs}`}`);
}
if (pinUnsaid.length) unchecked.push(`the PIN half of the write heading for ${pinUnsaid.join(', ')}: each description says "Requires a WRITE API-Key" and names no PIN`);

// each row's parameters
const literal = (s) => (/^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s === 'true' ? true : s === 'false' ? false : s === 'null' ? null : undefined);
const limitsIn = (text) => {
  const out = [];
  for (const m of text.matchAll(/\b(\d+) to (\d+)( characters)?\b/g)) out.push(['min', Number(m[1]), m[0]], ['max', Number(m[2]), m[0]]);
  for (const m of text.matchAll(/\b(?:up to|at most) (\d+)\b/g)) out.push(['max', Number(m[1]), m[0]]);
  return out;
};
let paramCount = 0;
for (const [t, r] of rows) {
  const s = snap.tools[t];
  if (!s) continue;
  const named = new Map();   // param -> {bold, spec, text}
  if (r.args !== 'none') {
    for (const seg of splitTop(r.args, [',', ';'])) {
      const m = seg.match(/^(\*\*)?`([a-z_][a-z0-9_]*)`(\*\*)?(?=\s*(?:\(|:|$))/);
      if (!m) continue;   // prose inside a parameter's description (`name` plus any fields …)
      if (named.has(m[2])) fail(`${t}: names ${m[2]} twice`);
      const rest = seg.slice(m[0].length).trimStart();
      let spec = null;
      if (rest.startsWith('(')) {
        let d = 0, k = 0;
        for (; k < rest.length; k++) { if (rest[k] === '(') d++; else if (rest[k] === ')' && --d === 0) break; }
        spec = rest.slice(1, k);
      }
      named.set(m[2], { bold: Boolean(m[1] && m[3]), spec, text: rest.slice(spec === null ? 0 : spec.length + 2) });
    }
  }
  const want = s.params;
  for (const p of Object.keys(want)) if (!named.has(p)) fail(`${t}: the schema has ${p}, the row does not name it`);
  for (const [p, n] of named) {
    const w = want[p];
    if (!w) { fail(`${t}: the row names ${p}, which the schema does not have`); continue; }
    paramCount++;
    if (n.bold !== w.required) fail(`${t}: ${p} is ${w.required ? 'required, but not in bold' : 'optional, but in bold'}`);
    const parts = n.spec === null ? [] : splitTop(n.spec, [',']);
    const defaults = parts.map(literal).filter((v) => v !== undefined);
    const hasDefault = 'default' in w && w.default !== null;
    if (defaults.length > 1) fail(`${t}: ${p} prints more than one default (${n.spec})`);
    else if (defaults.length === 1 && (!hasDefault || defaults[0] !== w.default)) fail(`${t}: ${p} prints the default ${defaults[0]}; the schema's is ${hasDefault ? JSON.stringify(w.default) : 'none'}`);
    else if (!defaults.length && hasDefault) fail(`${t}: ${p} has the default ${JSON.stringify(w.default)} in the schema, and the row prints none`);
    for (const [kind, v, phrase] of [...limitsIn(n.spec ?? ''), ...limitsIn(n.text)]) {
      const keys = kind === 'max' ? ['maximum', 'maxLength', 'maxItems'] : ['minimum', 'minLength', 'minItems'];
      const k = keys.find((x) => x in w);
      const why = `${t}: ${p} "${phrase}" (the schema carries no such limit)`;
      if (!k) { if (!unchecked.includes(why)) unchecked.push(why); }
      else if (w[k] !== v) fail(`${t}: ${p} prints "${phrase}"; the schema's ${k} is ${w[k]}`);
    }
    for (const k of LIMITS) {
      if (!(k in w)) continue;
      const kind = k.startsWith('max') ? 'max' : 'min';
      if (![...limitsIn(n.spec ?? ''), ...limitsIn(n.text)].some(([x]) => x === kind)) fail(`${t}: ${p} has ${k} ${w[k]} in the schema, and the row prints no limit`);
    }
    for (const e of w.enum ?? []) if (!(n.spec ?? '').concat(n.text).includes(`\`${e}\``)) fail(`${t}: ${p} may be ${JSON.stringify(e)}, and the row does not name it`);
  }
}

// the hints sentence: clauses split on ';', each naming tools (or "the N reads") and the hints it claims
const hintsLine = tools.split('\n').find((l) => l.includes('readOnlyHint'));
const NUMBERS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen'.split(' ');
if (!hintsLine) unchecked.push('the hints sentence: no line under "## Tools" names readOnlyHint');
else {
  const tail = hintsLine.slice(hintsLine.indexOf(': ', hintsLine.indexOf('idempotentHint')) + 2);
  const claimed = new Map();   // tool -> {readOnly, destructive, idempotent} as the sentence says
  for (const clause of tail.split(';')) {
    const c = clause.replace(/\s*\(read live [^)]*\)/, '');
    const claim = {};
    if (/\bread-only\b/.test(c)) claim.readOnly = true;
    if (/\bwrites?\b/.test(c)) claim.readOnly = false;
    if (/\bnot idempotent\b/.test(c)) claim.idempotent = false;
    else if (/\bidempotent\b/.test(c)) claim.idempotent = true;
    if (/\bdestructive\b/.test(c)) claim.destructive = true;
    let names = [...c.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
    const reads = c.match(/\bthe (\w+) reads\b/);
    if (reads) {
      const readRows = [...rows].filter(([, r]) => r.group !== 'write').map(([t]) => t);
      const n = NUMBERS.indexOf(reads[1]);
      if (n !== readRows.length) fail(`the hints sentence says "the ${reads[1]} reads"; the first two tables hold ${readRows.length}`);
      names = [...names, ...readRows];
    }
    for (const t of names) {
      if (!snap.tools[t]) { fail(`the hints sentence names ${t}, which the server does not have`); continue; }
      claimed.set(t, { ...claimed.get(t), ...claim });
      for (const [k, v] of Object.entries(claim)) {
        if (snap.tools[t].hints[k] !== v) fail(`the hints sentence says ${t} is ${k === 'readOnly' ? (v ? 'read-only' : 'a write') : (v ? '' : 'not ') + k}; its ${k}Hint is ${snap.tools[t].hints[k]}`);
      }
    }
  }
  for (const [t, s] of Object.entries(snap.tools)) {
    if (!claimed.has(t)) fail(`the hints sentence does not name ${t}`);
    if (s.hints.destructive === true && claimed.get(t)?.destructive !== true) fail(`${t} is marked destructive, and the hints sentence does not say so`);
    if (s.hints.idempotent === false && claimed.get(t)?.idempotent !== false) fail(`${t} is marked not idempotent, and the hints sentence does not say so`);
  }
}

// ---- the resources table ----
const resRows = section('Resources').split('\n').map(cells).filter((c) => c.length === 3 && /^`[^`]+`$/.test(c[0])).map((c) => c[0].slice(1, -1));
if (!resRows.length) blind('no resource rows found under "## Resources"');
const resWant = [...snap.resources, ...snap.templates];
for (const u of resWant) if (!resRows.includes(u)) fail(`resource ${u}: on the server, missing from the Resources table`);
for (const u of resRows) if (!resWant.includes(u)) fail(`resource ${u}: has a row, but the server lists no such resource or template`);
unchecked.push('the Resources table\'s Key column (no list answer says which resource needs a key)');

for (const u of unchecked) console.log(`  not checked  ${u}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(`verify-mcp: ${rows.size} tool rows, ${paramCount} parameters, ${resRows.length} resource rows, held to contract/mcp.json (read ${snap.read_at})`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) on the MCP page`); process.exit(1); }
console.log('PASS');
