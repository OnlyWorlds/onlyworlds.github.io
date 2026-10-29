#!/usr/bin/env node
/**
 * verify-shapes.mjs: the API pages' JSON examples and field tables, held to the schemas in keel's
 * OpenAPI document.
 *
 * Usage: node scripts/verify-shapes.mjs            check the pages against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-shapes.mjs --live     compare the snapshot with the live document; exit 1 if they differ
 *        node scripts/verify-shapes.mjs --refresh  first rewrite the snapshot from the live document, then check
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json (public, no key), vendored as
 * contract/shapes.json so a build never depends on the API being up. The snapshot keeps only what
 * the check needs: for each target some page names, its keys, which are required, and the schemas
 * under it ($refs kept as named defs, allOf merged, a oneOf's object branches kept with their
 * const keys), plus the document's schema names, so a tag naming none of them fails offline.
 * `read_at` is the day the facts last changed (a refresh that finds them equal keeps it).
 *
 * The pages: docs/development/api/*, api-reference, agents and api/errors. A JSON block is tagged
 * by a comment on the line directly above its ```json fence, a table by one on the line directly
 * above its header row. The comment renders nothing (tested on a build, 2026-10-29: in no llms
 * file; a .mdx page's comment compiles away and postbuild.mjs drops it from the Markdown twin; a
 * .md page's stays in the HTML source as an HTML comment and in the twin, as typescript.md's
 * generated marker does; a tagged table still renders as a table):
 *   .md   <!-- shape: TARGET [PATH] [partial] -->
 *   .mdx  {/* shape: TARGET [PATH] [partial] *\/}
 * TARGET is a schema in components.schemas (`ChangesPage`), a route's JSON body as
 * `METHOD /api/v2/... [STATUS|request]` (the route's one 2xx answer when no status is named), or a
 * route's query parameters as `METHOD /api/v2/... query` (each one a key; for tables). PATH walks
 * into it: `changes[]` is one item of the `changes` array, `front_door.sponsor` a key's object.
 * `partial` says the block or table shows only some keys on purpose: only rule (a) applies.
 * A bare … or ... (as a value, an item, or a key "…") is a block's own elision: it stands for
 * keys left out, so rule (b) skips that one object.
 *
 * A table's keys are in its first column: each row's first cell is one or more backticked names
 * joined by commas, "and" or "or" (`created_at`, `updated_at`); a name ending … or ... (`x_…`)
 * stands for the keys that start with it. A row whose first cell is anything else makes the table
 * BLIND. A table is complete unless marked partial: of the 26 tagged tables, 17 list every key at
 * their place (a ticket's answer, a route's query, a page of the feed), so leaving a key out is
 * the claim a table must make on purpose, as a block's partial is.
 *
 * Checks (fail), on every tagged block and table of those pages:
 *   (a) every key of the example, and every key a table's row names, is a key of the schema at
 *       that place: a block's nested objects and array items are followed where the schema says
 *       what they are; a key matching the schema's patternProperties (the x_ extension keys)
 *       passes, as does a table's `x_…` row whose prefix they match, and so does any key of an
 *       object whose additionalProperties is true or a schema;
 *   (b) a block, unless marked partial or elided: every required key of the schema at each place
 *       is there; a table, unless marked partial: every property of the schema at its place has
 *       a row (patternProperties need none);
 *   (c) a tag naming a schema or route the document does not have, a PATH the schema has no place
 *       for (or a table's PATH ending on an array or a value), or a marker that is not directly
 *       above a ```json fence or a table's header row (or uses the other file type's comment
 *       form) fails. A tagged block that will not parse, and a tagged table with no rows, are BLIND.
 * A oneOf/anyOf place is held to the branch whose const keys the example matches (op, kind), or,
 * among several, the one it fits best (a table: the one with the fewest failures); `element` in a
 * feed row is held to the schema its `type` names, as the document's description of it says.
 * Not checked, printed by name: an object the document gives no keys for; the untagged JSON
 * blocks (error envelopes, which gen_errors.mjs holds, the export file, v1 shapes); each untagged
 * field table (its first header cell Field, Key, Name, Property or Parameter), with why: its first
 * column holds no backticked names (a table of key kinds, of portal labels, of link kinds), or the
 * reason NOT_SHAPED gives (a NOT_SHAPED entry that matches no untagged table fails).
 * Not checked at all: the value of any key (types, formats, enums, limits, readOnly in a request
 * body); `not` clauses; a table's other columns, and keys its prose names (`public_page`'s `on`);
 * untagged tables under any other header (routes, statuses, roles); the prose around an example;
 * JSON inside a curl line.
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (the document unreadable, a
 * tagged block that will not parse, a tagged table with no rows or a row this cannot read, or a
 * schema shape this does not read: never a pass). A run with both a FAIL and a BLIND prints both and exits 1.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'shapes.json');
const CONTENT = join(ROOT, 'src', 'content', 'docs');
const API = join(CONTENT, 'docs', 'development', 'api');
const PAGES = [
  ...readdirSync(API).filter((f) => /\.mdx?$/.test(f)).sort().map((f) => join(API, f)),
  join(CONTENT, 'docs', 'development', 'api-reference.mdx'),
  join(CONTENT, 'docs', 'development', 'agents.md'),
  join(CONTENT, 'api', 'errors', 'index.mdx'),
];
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const ELIDED_KEYS = new Set(['…', '...']);
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-shapes: BLIND: ${why}`); process.exit(2); };

// ---- the pages: each ```json block and each table, and the marker above it ---------------------------
const MARK = { md: /^<!--\s*shape:\s*(.*?)\s*-->$/, mdx: /^\{\/\*\s*shape:\s*(.*?)\s*\*\/\}$/ };
const SEP = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const isRow = (l) => (l ?? '').trim().startsWith('|');
const isHeader = (lines, n) => isRow(lines[n]) && !isRow(lines[n - 1]) && SEP.test((lines[n + 1] ?? '').trim());
// A row's first cell: the text up to the first unescaped | after the opening one.
const firstCell = (row) => {
  const s = row.trim().replace(/^\|/, '');
  let i = 0;
  while (i < s.length && s[i] !== '|') i += s[i] === '\\' ? 2 : 1;
  return s.slice(0, i).trim();
};
function blocksOf(file) {
  const rel = relative(CONTENT, file).replaceAll('\\', '/');
  const kind = file.endsWith('.mdx') ? 'mdx' : 'md';
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const blocks = [], tables = [], wrong = [];
  for (let n = 0; n < lines.length; n++) {
    const own = MARK[kind].exec(lines[n].trim()), other = MARK[kind === 'md' ? 'mdx' : 'md'].exec(lines[n].trim());
    if (other) wrong.push(`${rel}:${n + 1}: a shape marker in the ${kind === 'md' ? '.mdx' : '.md'} form (in a .${kind} page: ${kind === 'md' ? '<!-- shape: … -->' : '{/* shape: … */}'})`);
    if (own && !/^\s*(`{3,}|~{3,})jsonc?(\s.*)?$/.test(lines[n + 1] ?? '') && !isHeader(lines, n + 1)) wrong.push(`${rel}:${n + 1}: a shape marker not directly above a \`\`\`json fence or a table's header row (c)`);
    if (isHeader(lines, n)) {
      let end = n + 2;
      while (end < lines.length && isRow(lines[end])) end++;
      const tag = n > 0 ? MARK[kind].exec(lines[n - 1].trim()) : null;
      tables.push({ rel, line: n + 1, head: firstCell(lines[n]), rows: lines.slice(n + 2, end).map((text, k) => ({ line: n + 3 + k, text })), tag: tag ? tag[1] : null });
      n = end - 1;
      continue;
    }
    const open = /^(\s*)(`{3,}|~{3,})(\S*)/.exec(lines[n]);
    if (!open) continue;
    const fence = open[2];
    let end = n + 1;
    while (end < lines.length && !new RegExp(`^\\s*${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`).test(lines[end])) end++;
    if (/^jsonc?$/.test(open[3])) {
      const tag = n > 0 ? MARK[kind].exec(lines[n - 1].trim()) : null;
      blocks.push({ rel, line: n + 1, first: n + 2, text: lines.slice(n + 1, end).join('\n'), tag: tag ? tag[1] : null });
    }
    n = end;
  }
  return { blocks, tables, wrong };
}

// A marker's words: TARGET [PATH] [partial].
function readTag(raw) {
  const words = raw.split(/\s+/).filter(Boolean);
  let target;
  if (METHODS.includes(words[0])) {
    if (!/^\/\S*$/.test(words[1] ?? '')) return { error: `"${raw}": a route needs a path after ${words[0]}` };
    const sel = /^(\d{3}|request|query)$/.test(words[2] ?? '') ? 1 : 0;
    target = words.slice(0, 2 + sel).join(' ');
    words.splice(0, 2 + sel);
  } else target = words.shift();
  if (!target) return { error: 'an empty shape marker' };
  const partial = words.at(-1) === 'partial';
  if (partial) words.pop();
  const path = words.shift() ?? '';
  if (words.length || (path && !/^(\[\]|[A-Za-z_]\w*(\[\])?)(\.([A-Za-z_]\w*)(\[\])?|\[\])*$/.test(path))) return { error: `"${raw}": a marker this does not read (TARGET [PATH] [partial])` };
  return { target, path, partial };
}

// ---- a JSON reader that knows the pages' elisions ----------------------------------------------------
// Standard JSON, plus a bare … or ... as a value, an array item or an object member, and the member
// "…": … ; each marks its object or array elided. Every key keeps its page line.
function parseLoose(text, firstLine) {
  let i = 0, line = firstLine;
  const err = (m) => { throw new Error(`${m} (line ${line})`); };
  const ws = () => { while (i < text.length && /\s/.test(text[i])) { if (text[i] === '\n') line++; i++; } };
  const elision = () => { if (text[i] === '…') { i++; return true; } if (text.startsWith('...', i)) { i += 3; return true; } return false; };
  const string = () => {
    const at = i++;
    while (i < text.length && text[i] !== '"') { if (text[i] === '\\') i++; if (text[i] === '\n') err('a string that does not close on its line'); i++; }
    if (i >= text.length) err('a string that does not close');
    return JSON.parse(text.slice(at, ++i));
  };
  const value = () => {
    ws();
    const at = line, c = text[i];
    if (elision()) return { kind: 'elided', line: at };
    if (c === '{' || c === '[') {
      const obj = c === '{', close = obj ? '}' : ']';
      const out = obj ? { kind: 'object', members: [], elided: false, line: at } : { kind: 'array', items: [], elided: false, line: at };
      i++; ws();
      if (text[i] === close) { i++; return out; }
      for (;;) {
        ws();
        const kl = line;
        if (obj) {
          if (elision()) out.elided = true;
          else {
            if (text[i] !== '"') err(`expected a key, found ${JSON.stringify(text[i] ?? 'the end')}`);
            const key = string(); ws();
            if (text[i] !== ':') err(`expected ":" after "${key}"`);
            i++;
            const v = value();
            if (ELIDED_KEYS.has(key)) out.elided = true;
            else out.members.push({ key, value: v, line: kl });
          }
        } else {
          const v = value();
          if (v.kind === 'elided') out.elided = true; else out.items.push(v);
        }
        ws();
        if (text[i] === ',') { i++; continue; }
        if (text[i] === close) { i++; return out; }
        err(`expected "," or "${close}", found ${JSON.stringify(text[i] ?? 'the end')}`);
      }
    }
    if (c === '"') return { kind: 'scalar', value: string(), line: at };
    const m = /^(-?\d+(\.\d+)?([eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i, i + 40));
    if (m) { i += m[0].length; return { kind: 'scalar', value: JSON.parse(m[0]), line: at }; }
    err(`unexpected ${JSON.stringify(c ?? 'end of block')}`);
  };
  const v = value();
  ws();
  if (i < text.length) err('text after the value');
  return v;
}

// ---- the document, reduced to what the check needs ------------------------------------------------------
// A node is one of: {$: name} (a def), {props, required, patterns?, open?, title?} (an object),
// {items} (an array), {oneOf: [...]} (object branches), {byType: true} (the element its `type`
// names), {unsaid: true} (an object the document gives no keys for), {const} or {} (a value).
function reduce(doc, tagTargets) {
  const S = doc?.components?.schemas;
  if (!S || typeof S !== 'object') throw new Error('the document has no components.schemas');
  // the element types: each schema with a List and a Write beside it, by its slug
  const elements = Object.fromEntries(Object.keys(S).filter((n) => S[`${n}List`] && S[`${n}Write`]).map((n) => [n.toLowerCase(), n]).sort(([a], [b]) => (a < b ? -1 : 1)));
  const defs = {};
  const def = (name) => {
    if (!S[name]) throw new Error(`a $ref to ${name}, which the document lacks`);
    if (!(name in defs)) { defs[name] = null; defs[name] = node(S[name], name); }
    return { $: name };
  };
  const refName = (ref) => {
    const m = /^#\/components\/schemas\/([^/]+)$/.exec(ref);
    if (!m) throw new Error(`a $ref this does not read: ${ref}`);
    return decodeURIComponent(m[1]);
  };
  const isValue = (n) => !n.$ && !n.props && !n.items && !n.oneOf && !n.byType && !n.unsaid;
  const full = (n) => {
    if (!n.$) return n;
    if (defs[n.$] === null) throw new Error(`${n.$} is merged into itself (an allOf cycle)`);
    return defs[n.$];
  };
  function node(s, ownName) {
    if (!s || typeof s !== 'object') return {};
    if (s.$ref) return def(refName(s.$ref));
    if (s.allOf) {
      const rest = { ...s }; delete rest.allOf;
      const parts = [...s.allOf, ...(rest.properties ? [rest] : [])].map((p) => full(node(p)));
      if (parts.some((p) => !p.props)) throw new Error(`an allOf with a part that is not an object${ownName ? ` (${ownName})` : ''}`);
      const o = { props: Object.assign({}, ...parts.map((p) => p.props)), required: [...new Set(parts.flatMap((p) => p.required))] };
      const patterns = [...new Set(parts.flatMap((p) => p.patterns ?? []))];
      if (patterns.length) o.patterns = patterns;
      if (parts.every((p) => p.open)) o.open = true;
      return o;
    }
    const branches = s.oneOf ?? s.anyOf;
    if (branches) {
      const kept = branches.filter((b) => b.type !== 'null').map((b) => node(b)).filter((n) => !isValue(n));
      if (!kept.length) return valueOf(s);
      return kept.length === 1 ? kept[0] : { oneOf: kept };
    }
    const types = [].concat(s.type ?? []);
    if (types.includes('array') || s.items) return { items: s.items ? node(s.items) : {} };
    if (types.includes('object') || s.properties || s.patternProperties || 'additionalProperties' in s) {
      if (!s.properties && !s.patternProperties && s.additionalProperties === undefined) {
        if (!/the schema named by `type`/.test(s.description ?? '')) return { unsaid: true };
        for (const n of Object.values(elements)) def(n);
        return { byType: true };
      }
      const o = {};
      if (s.title && s.title !== ownName) o.title = s.title;
      o.props = Object.fromEntries(Object.entries(s.properties ?? {}).map(([k, v]) => [k, node(v)]));
      o.required = s.required ?? [];
      if (s.patternProperties) o.patterns = Object.keys(s.patternProperties);
      if (s.additionalProperties && s.additionalProperties !== false) o.open = true;
      return o;
    }
    return valueOf(s);
  }
  const valueOf = (s) => ('const' in s ? { const: s.const } : Array.isArray(s.enum) && s.enum.length === 1 ? { const: s.enum[0] } : {});
  const jsonOf = (c) => c?.content?.['application/json']?.schema;
  const targets = {};
  for (const t of [...tagTargets].sort()) {
    const m = /^(\S+) (\S+)(?: (\S+))?$/.exec(t);
    if (!m || !METHODS.includes(m[1])) { targets[t] = S[t] ? def(t) : { missing: `the document has no schema ${t}` }; continue; }
    const op = doc.paths?.[m[2]]?.[m[1].toLowerCase()];
    if (!op) { targets[t] = { missing: `the document has no ${m[1]} ${m[2]}` }; continue; }
    if (m[3] === 'query') {
      // the route's query parameters (the path's own, then the operation's, which win by name)
      const byName = new Map();
      for (const p of [...(doc.paths[m[2]].parameters ?? []), ...(op.parameters ?? [])]) {
        let q = p;
        if (p.$ref) {
          const r = /^#\/components\/parameters\/([^/]+)$/.exec(p.$ref);
          q = r && doc.components?.parameters?.[decodeURIComponent(r[1])];
          if (!q) throw new Error(`a parameter $ref this does not read: ${p.$ref}`);
        }
        if (typeof q.name !== 'string' || typeof q.in !== 'string') throw new Error(`a parameter of ${m[1]} ${m[2]} without a name or an in`);
        if (q.in === 'query') byName.set(q.name, q);
      }
      targets[t] = byName.size
        ? { props: Object.fromEntries([...byName.keys()].map((k) => [k, {}])), required: [...byName.values()].filter((q) => q.required).map((q) => q.name) }
        : { missing: `${m[1]} ${m[2]} takes no query parameters` };
      continue;
    }
    let schema;
    if (m[3] === 'request') schema = jsonOf(op.requestBody) ?? { missing: `${m[1]} ${m[2]} takes no JSON body` };
    else if (m[3]) schema = jsonOf(op.responses?.[m[3]]) ?? { missing: `${m[1]} ${m[2]} answers no JSON body on ${m[3]}` };
    else {
      const ok = Object.keys(op.responses ?? {}).filter((c) => /^2\d\d$/.test(c) && jsonOf(op.responses[c]));
      schema = ok.length === 1 ? jsonOf(op.responses[ok[0]])
        : { missing: ok.length ? `${m[1]} ${m[2]} answers JSON on ${ok.join(' and ')}: name one` : `${m[1]} ${m[2]} answers no JSON body on a 2xx` };
    }
    targets[t] = schema.missing ? schema : node(schema);
  }
  const sortedDefs = Object.fromEntries(Object.keys(defs).sort().map((k) => [k, defs[k]]));
  return { schemas: Object.keys(S), elements, targets, defs: sortedDefs };
}

// One target and one def per line, so a diff names the one that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: components.schemas, the routes' JSON bodies and their query parameters, reduced to the targets the API pages' shape markers name`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  `  "schemas": ${JSON.stringify(s.schemas)},`,
  `  "elements": ${JSON.stringify(s.elements)},`,
  '  "targets": {',
  Object.entries(s.targets).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n'),
  '  },',
  '  "defs": {',
  Object.entries(s.defs).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n'),
  '  }',
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify({ schemas: s.schemas, elements: s.elements, targets: s.targets, defs: s.defs });

const pages = PAGES.map(blocksOf);
const tags = new Map();   // block or table -> its read tag
for (const b of pages.flatMap((p) => [...p.blocks, ...p.tables])) if (b.tag !== null) tags.set(b, readTag(b.tag));

if (args.has('--live') || args.has('--refresh')) {
  let live;
  try {
    const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    live = reduce(await r.json(), new Set([...tags.values()].filter((t) => !t.error).map((t) => t.target)));
  } catch (e) { blind(`${OPENAPI} (${e.message})`); }
  let snap = null;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable */ }
  const unchanged = snap && body(snap) === body(live);
  const summary = (s) => `${Object.keys(s.targets).length} targets, ${Object.keys(s.defs).length} schemas held`;
  if (args.has('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`verify-shapes: ${unchanged ? 'contract/shapes.json unchanged' : 'wrote contract/shapes.json'}: ${summary(live)}, read ${read_at}`);
  } else {
    if (!snap) { console.log('verify-shapes: STALE: contract/shapes.json missing or unreadable; run --refresh'); process.exit(1); }
    if (unchanged) { console.log(`verify-shapes: contract/shapes.json matches the live document: ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
    console.log(`verify-shapes: STALE: the live document (or the pages' markers) differs from contract/shapes.json (read ${snap.read_at}); run --refresh, then mend the pages`);
    for (const part of ['targets', 'defs']) {
      for (const k of new Set([...Object.keys(live[part]), ...Object.keys(snap[part] ?? {})])) {
        const a = snap[part]?.[k], b = live[part][k];
        if (!a) console.log(`  ${part.slice(0, -1)} ${k}: new (${part === 'targets' ? 'a page names it' : 'a target reaches it'})`);
        else if (!b) console.log(`  ${part.slice(0, -1)} ${k}: gone`);
        else if (JSON.stringify(a) !== JSON.stringify(b)) {
          const ka = Object.keys(a.props ?? {}), kb = Object.keys(b.props ?? {});
          const said = [];
          for (const p of kb) if (!ka.includes(p)) said.push(`+${p}`);
          for (const p of ka) if (!kb.includes(p)) said.push(`-${p}`);
          for (const p of b.required ?? []) if (!(a.required ?? []).includes(p)) said.push(`${p} now required`);
          for (const p of a.required ?? []) if (!(b.required ?? []).includes(p)) said.push(`${p} no longer required`);
          console.log(`  ${part.slice(0, -1)} ${k}: ${said.length ? said.join(', ') : 'changed below its own keys'}`);
        }
      }
    }
    if (JSON.stringify(snap.schemas) !== JSON.stringify(live.schemas)) console.log(`  the document's schema names changed (${live.schemas.length} now, ${snap.schemas?.length ?? 0} held)`);
    if (JSON.stringify(snap.elements) !== JSON.stringify(live.elements)) console.log('  the element types changed');
    process.exit(1);
  }
}

// ---- the examples against the snapshot ----------------------------------------------------------------
let snap;
try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { blind(`contract/shapes.json unreadable (${e.message}); run --refresh`); }
if (!snap?.targets || !snap?.defs || !Array.isArray(snap.schemas)) blind('contract/shapes.json lacks targets, defs or schemas');
const fails = [], blinds = [], unchecked = [], stale = [];
for (const p of pages) fails.push(...p.wrong);
const deref = (n) => {
  for (let k = 0; n?.$ && k < 50; k++) n = snap.defs[n.$];
  if (n === undefined || n?.$) blind('contract/shapes.json holds a $ref to a def it lacks; run --refresh');
  return n;
};
const constsOf = (n) => Object.entries(n.props ?? {}).filter(([, v]) => 'const' in v).map(([k, v]) => [k, v.const]);
const branchName = (n, i) => n.title ?? (constsOf(n).length ? constsOf(n).map(([k, v]) => `${k} ${JSON.stringify(v)}`).join(', ') : `branch ${i + 1}`);

// Walk a PATH from a target's node: `a.b[]`.
function walk(n, path) {
  for (const seg of path.match(/[A-Za-z_]\w*|\[\]/g) ?? []) {
    n = deref(n);
    if (n.oneOf) { const hits = n.oneOf.map(deref).filter((b) => (seg === '[]' ? b.items : b.props && Object.hasOwn(b.props, seg))); if (hits.length !== 1) return null; n = hits[0]; }
    if (seg === '[]') { if (!n.items) return null; n = n.items; } else { if (!n.props || !Object.hasOwn(n.props, seg)) return null; n = n.props[seg]; }
  }
  return n;
}

// Hold one example value to one node; failures go to `out` as {line, at, msg}.
function check(ex, n, at, partial, out) {
  n = deref(n);
  if (ex.kind === 'array') {
    const items = n.items ?? n.oneOf?.map(deref).find((b) => b.items)?.items;
    if (!items) { if (n.props || n.byType) out.push({ line: ex.line, at, msg: 'an array where the schema has an object' }); return; }
    ex.items.forEach((x, k) => check(x, items, `${at}[${k}]`, partial, out));
    return;
  }
  if (ex.kind !== 'object') return;
  if (n.items) { out.push({ line: ex.line, at, msg: 'an object where the schema has an array' }); return; }
  if (n.unsaid) { if (ex.members.length) unchecked.push(`${block.rel}:${ex.line}: ${block.label}${at ? ` at ${at}` : ''}: the document gives no keys for this object`); return; }
  if (n.byType) {
    const t = ex.members.find((m) => m.key === 'type')?.value;
    const name = t?.kind === 'scalar' ? snap.elements?.[t.value] : undefined;
    if (!name) { unchecked.push(`${block.rel}:${ex.line}: ${block.label}${at ? ` at ${at}` : ''}: an element body whose "type" names no element type`); return; }
    return check(ex, { $: name }, `${at} (${name})`, partial, out);
  }
  if (n.oneOf) {
    const branches = n.oneOf.map((b, i) => ({ b: deref(b), name: branchName(deref(b), i) })).filter(({ b }) => b.props);
    const fit = branches.filter(({ b }) => constsOf(b).every(([k, v]) => { const m = ex.members.find((x) => x.key === k); return !m || m.value.kind !== 'scalar' || m.value.value === v; }));
    if (!fit.length) { out.push({ line: ex.line, at, msg: `matches no branch of the schema's oneOf (${branches.map((x) => x.name).join('; ')})` }); return; }
    const tries = fit.map(({ b, name }) => { const o = []; check(ex, b, `${at} (${name})`.trim(), partial, o); return o; });
    const best = tries.reduce((a, b) => (b.length < a.length ? b : a));
    out.push(...best);
    return;
  }
  if (!n.props) return;   // a value where the example has an object: values are not checked
  for (const m of ex.members) {
    const where = at ? `${at}.${m.key}` : m.key;
    if (Object.hasOwn(n.props, m.key)) check(m.value, n.props[m.key], where, partial, out);
    else if ((n.patterns ?? []).some((p) => new RegExp(p).test(m.key)) || n.open) continue;
    else out.push({ line: m.line, at, msg: `"${m.key}" is not a key of the schema here (a)` });
  }
  if (partial || ex.elided) return;
  const have = new Set(ex.members.map((m) => m.key));
  for (const r of n.required ?? []) if (!have.has(r)) out.push({ line: ex.line, at, msg: `lacks the required key "${r}" (b)` });
}

// A tag's place in the snapshot: its target's node, walked down its PATH; null (with the fail or
// the stale note pushed) when there is none.
function placeOf(where, t) {
  let root = snap.targets[t.target];
  if (root === undefined) {
    if (!METHODS.includes(t.target.split(' ')[0]) && !snap.schemas.includes(t.target)) fails.push(`${where}: the tag names ${t.target}, and the document has no such schema (c)`);
    else stale.push(`${where}: the tag names ${t.target}, which contract/shapes.json does not hold yet; run --refresh`);
    return null;
  }
  if (root.missing) { fails.push(`${where}: the tag names ${t.target}: ${root.missing} (c)`); return null; }
  if (t.path && !(root = walk(root, t.path))) { fails.push(`${where}: ${t.target} has no place ${t.path} (c)`); return null; }
  return root;
}

let tagged = 0, keys = 0, block = null;   // block: the one being checked, for check()'s notes
const untagged = [];
const countKeys = (v) => (v.kind === 'object' ? v.members.length + v.members.reduce((s, m) => s + countKeys(m.value), 0) : v.kind === 'array' ? v.items.reduce((s, x) => s + countKeys(x), 0) : 0);
for (const b of pages.flatMap((p) => p.blocks)) {
  const where = `${b.rel}:${b.line}`;
  if (b.tag === null) { untagged.push(where); continue; }
  tagged++;
  const t = tags.get(b);
  if (t.error) { fails.push(`${where}: ${t.error}`); continue; }
  const label = `${t.target}${t.path ? ` ${t.path}` : ''}${t.partial ? ' (partial)' : ''}`;
  block = { rel: b.rel, label };
  const root = placeOf(where, t);
  if (!root) continue;
  let ex;
  try { ex = parseLoose(b.text, b.first); } catch (e) { blinds.push(`${where}: the ${label} example does not parse: ${e.message}`); continue; }
  keys += countKeys(ex);
  const out = [];
  check(ex, root, '', t.partial, out);
  for (const f of out) fails.push(`${b.rel}:${f.line}: ${label}${f.at ? ` at ${f.at}` : ''}: ${f.msg}`);
}

// ---- the tables against the snapshot -------------------------------------------------------------------
// A first cell names keys when it is only backticked names joined by commas, "and" or "or".
const KEYS_CELL = /^`[^`]+`(\s*(,|,?\s+and|,?\s+or)\s*`[^`]+`)*$/;
const ELIDED_END = /(…|\.\.\.)$/;
function keysIn(cell) {
  if (!KEYS_CELL.test(cell)) return null;
  const names = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  return names.every((k) => /^[A-Za-z_]\w*(…|\.\.\.)?$/.test(k)) ? names : null;
}
// A field table is one whose first header cell is FIELD_HEAD. NOT_SHAPED: the untagged ones that
// restate no place in the document, by page and the first key of their first row, each with why.
const FIELD_HEAD = /^(Field|Key|Name|Property|Parameter)$/;
const NOT_SHAPED = {
  'docs/development/api/signin.mdx client_id': 'the query of the browser page /signin/authorize, which the API document does not describe',
};
// Hold one table's rows to one object node; failures go to `out` as {line, msg}.
function checkRows(rows, n, partial, headLine, out) {
  for (const r of rows) {
    for (const k of r.keys) {
      const prefix = ELIDED_END.test(k) ? k.replace(ELIDED_END, '') : null;
      if ((prefix === null && Object.hasOwn(n.props, k)) || n.open || (n.patterns ?? []).some((p) => new RegExp(p).test(prefix ?? k))) continue;
      out.push({ line: r.line, msg: prefix === null ? `"${k}" is not a key of the schema here (a)` : `"${k}" matches no key pattern of the schema here (a)` });
    }
  }
  if (partial) return;
  const named = new Set(rows.flatMap((r) => r.keys));
  for (const p of Object.keys(n.props)) if (!named.has(p)) out.push({ line: headLine, msg: `has no row for "${p}", a key of the schema here (complete)` });
}

let tablesTagged = 0, rowKeys = 0;
const untaggedTables = [], reasonsUsed = new Set();
for (const tb of pages.flatMap((p) => p.tables)) {
  const where = `${tb.rel}:${tb.line}`;
  const rows = tb.rows.map((r) => ({ line: r.line, cell: firstCell(r.text), keys: keysIn(firstCell(r.text)) }));
  if (tb.tag === null) {
    if (!FIELD_HEAD.test(tb.head)) continue;
    const unread = rows.find((r) => !r.keys);
    const reason = unread ? `its first column holds no backticked names ("${unread.cell}")` : NOT_SHAPED[`${tb.rel} ${rows[0]?.keys[0]}`];
    if (!unread && reason) reasonsUsed.add(`${tb.rel} ${rows[0].keys[0]}`);
    untaggedTables.push(`${where}: the "${tb.head}" table: ${reason ?? 'untagged'}`);
    continue;
  }
  tablesTagged++;
  const t = tags.get(tb);
  if (t.error) { fails.push(`${where}: ${t.error}`); continue; }
  let label = `${t.target}${t.path ? ` ${t.path}` : ''}${t.partial ? ' (partial)' : ''}`;
  let n = placeOf(where, t);
  if (!n) continue;
  if (!rows.length) { blinds.push(`${where}: the ${label} table has no rows`); continue; }
  const unread = rows.filter((r) => !r.keys);
  if (unread.length) { blinds.push(...unread.map((r) => `${tb.rel}:${r.line}: the ${label} table's first column holds no backticked names this reads ("${r.cell}")`)); continue; }
  rowKeys += rows.reduce((s, r) => s + r.keys.length, 0);
  n = deref(n);
  let out = [];
  if (n.oneOf) {
    // the branch the rows fit best, as a block's
    const tries = n.oneOf.map(deref).map((b, i) => ({ b, name: branchName(b, i) })).filter(({ b }) => b.props)
      .map(({ b, name }) => { const o = []; checkRows(rows, b, t.partial, tb.line, o); return { o, name }; });
    if (!tries.length) { fails.push(`${where}: ${label}: a oneOf with no object branch here (c)`); continue; }
    const best = tries.reduce((a, b) => (b.o.length < a.o.length ? b : a));
    out = best.o;
    label += ` (${best.name})`;
  } else if (n.unsaid || n.byType) { unchecked.push(`${where}: ${label}: the document gives no keys for this object`); continue; }
  else if (n.items) { fails.push(`${where}: ${label} is an array here, not an object: walk into its items with [] (c)`); continue; }
  else if (!n.props) { fails.push(`${where}: ${label} is a value here, with no keys (c)`); continue; }
  else checkRows(rows, n, t.partial, tb.line, out);
  for (const f of out) fails.push(`${tb.rel}:${f.line}: the ${label} table: ${f.msg}`);
}
for (const k of Object.keys(NOT_SHAPED)) if (!reasonsUsed.has(k)) fails.push(`${k.split(' ')[0]}: NOT_SHAPED gives a reason for a table whose first row names ${k.split(' ')[1]}, and no untagged field table there does`);

for (const u of [...new Set(unchecked)]) console.log(`  not checked  ${u}`);
if (untagged.length) console.log(`  not checked  ${untagged.length} untagged JSON block(s): ${untagged.join(', ')}`);
for (const u of untaggedTables) console.log(`  not checked  ${u}`);
for (const s of stale) console.log(`  STALE  ${s}`);
for (const f of blinds) console.log(`  BLIND  ${f}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
const onPages = pages.filter((p) => [...p.blocks, ...p.tables].some((b) => b.tag !== null)).length;
console.log(`verify-shapes: ${tagged} tagged JSON block(s) and ${tablesTagged} tagged table(s) on ${onPages} page(s), ${keys} example keys and ${rowKeys} table keys, held to contract/shapes.json (read ${snap.read_at})`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) in the API pages' examples and tables${blinds.length ? `, and ${blinds.length} BLIND` : ''}`); process.exit(1); }
if (stale.length) { console.log(`STALE: ${stale.length} tag(s) the snapshot does not hold; run --refresh`); process.exit(1); }
if (blinds.length) { console.log(`BLIND: ${blinds.length} tagged block(s), table(s) or table row(s) this could not read`); process.exit(2); }
console.log('PASS');
