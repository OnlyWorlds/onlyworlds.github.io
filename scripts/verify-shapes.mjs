#!/usr/bin/env node
/**
 * verify-shapes.mjs: the API pages' JSON examples, held to the schemas in keel's OpenAPI document.
 *
 * Usage: node scripts/verify-shapes.mjs            check the examples against the snapshot (offline; in `npm run verify`)
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
 * A block is tagged by a comment on the line directly above its ```json fence, which renders
 * nothing (tested on a build, 2026-10-29: in no llms file; a .mdx page's comment compiles away and
 * postbuild.mjs drops it from the Markdown twin; a .md page's stays in the HTML source as an HTML
 * comment and in the twin, as typescript.md's generated marker does):
 *   .md   <!-- shape: TARGET [PATH] [partial] -->
 *   .mdx  {/* shape: TARGET [PATH] [partial] *\/}
 * TARGET is a schema in components.schemas (`ChangesPage`), or a route's JSON body as
 * `METHOD /api/v2/... [STATUS|request]` (the route's one 2xx answer when no status is named).
 * PATH walks into it: `changes[]` is one item of the `changes` array, `front_door.sponsor` a key's
 * object. `partial` says the example shows only some keys on purpose: only rule (a) applies.
 * A bare … or ... (as a value, an item, or a key "…") is the page's own elision: it stands for
 * keys left out, so rule (b) skips that one object.
 *
 * Checks (fail), on every tagged block of the API pages (docs/development/api/*, api-reference,
 * api/errors):
 *   (a) every key of the example is a key of the schema at that place: nested objects and array
 *       items are followed where the schema says what they are; a key matching the schema's
 *       patternProperties (the x_ extension keys) passes, and so does any key of an object whose
 *       additionalProperties is true or a schema;
 *   (b) unless marked partial or elided, every required key of the schema at each place is there;
 *   (c) a tag naming a schema or route the document does not have, a PATH the schema has no place
 *       for, or a marker that is not directly above a ```json fence (or uses the other file
 *       type's comment form) fails. A tagged block that will not parse is BLIND.
 * A oneOf/anyOf place is held to the branch whose const keys the example matches (op, kind), or,
 * among several, the one it fits best; `element` in a feed row is held to the schema its `type`
 * names, as the document's description of it says.
 * Not checked, printed by name: an object the document gives no keys for; the untagged JSON
 * blocks (error envelopes, which gen_errors.mjs holds, the export file, v1 shapes); the value of
 * any key (types, formats, enums, limits, readOnly in a request body); `not` clauses; the prose
 * and field tables around an example; JSON inside a curl line.
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (the document unreadable, a
 * tagged block that will not parse, or a schema shape this does not read: never a pass).
 * A run with both a FAIL and a BLIND block prints both and exits 1.
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
  join(CONTENT, 'api', 'errors', 'index.mdx'),
];
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const ELIDED_KEYS = new Set(['…', '...']);
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-shapes: BLIND: ${why}`); process.exit(2); };

// ---- the pages: each ```json block, and the marker above it ----------------------------------------
const MARK = { md: /^<!--\s*shape:\s*(.*?)\s*-->$/, mdx: /^\{\/\*\s*shape:\s*(.*?)\s*\*\/\}$/ };
function blocksOf(file) {
  const rel = relative(CONTENT, file).replaceAll('\\', '/');
  const kind = file.endsWith('.mdx') ? 'mdx' : 'md';
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const blocks = [], wrong = [];
  for (let n = 0; n < lines.length; n++) {
    const own = MARK[kind].exec(lines[n].trim()), other = MARK[kind === 'md' ? 'mdx' : 'md'].exec(lines[n].trim());
    if (other) wrong.push(`${rel}:${n + 1}: a shape marker in the ${kind === 'md' ? '.mdx' : '.md'} form (in a .${kind} page: ${kind === 'md' ? '<!-- shape: … -->' : '{/* shape: … */}'})`);
    if (own && !/^\s*(`{3,}|~{3,})jsonc?(\s.*)?$/.test(lines[n + 1] ?? '')) wrong.push(`${rel}:${n + 1}: a shape marker not directly above a \`\`\`json fence`);
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
  return { blocks, wrong };
}

// A marker's words: TARGET [PATH] [partial].
function readTag(raw) {
  const words = raw.split(/\s+/).filter(Boolean);
  let target;
  if (METHODS.includes(words[0])) {
    if (!/^\/\S*$/.test(words[1] ?? '')) return { error: `"${raw}": a route needs a path after ${words[0]}` };
    const sel = /^(\d{3}|request)$/.test(words[2] ?? '') ? 1 : 0;
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
  `  "source": ${JSON.stringify(`${OPENAPI}: components.schemas and the routes' JSON bodies, reduced to the targets the API pages' shape markers name`)},`,
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
const tags = new Map();   // block -> its read tag
for (const b of pages.flatMap((p) => p.blocks)) if (b.tag !== null) tags.set(b, readTag(b.tag));

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
    if (n.oneOf) { const hits = n.oneOf.map(deref).filter((b) => (seg === '[]' ? b.items : b.props?.[seg])); if (hits.length !== 1) return null; n = hits[0]; }
    if (seg === '[]') { if (!n.items) return null; n = n.items; } else { if (!n.props?.[seg]) return null; n = n.props[seg]; }
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
    if (n.props[m.key]) check(m.value, n.props[m.key], where, partial, out);
    else if ((n.patterns ?? []).some((p) => new RegExp(p).test(m.key)) || n.open) continue;
    else out.push({ line: m.line, at, msg: `"${m.key}" is not a key of the schema here (a)` });
  }
  if (partial || ex.elided) return;
  const have = new Set(ex.members.map((m) => m.key));
  for (const r of n.required ?? []) if (!have.has(r)) out.push({ line: ex.line, at, msg: `lacks the required key "${r}" (b)` });
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
  let root = snap.targets[t.target];
  if (root === undefined) {
    if (!METHODS.includes(t.target.split(' ')[0]) && !snap.schemas.includes(t.target)) fails.push(`${where}: the tag names ${t.target}, and the document has no such schema (c)`);
    else stale.push(`${where}: the tag names ${t.target}, which contract/shapes.json does not hold yet; run --refresh`);
    continue;
  }
  if (root.missing) { fails.push(`${where}: the tag names ${t.target}: ${root.missing} (c)`); continue; }
  if (t.path && !(root = walk(root, t.path))) { fails.push(`${where}: ${t.target} has no place ${t.path} (c)`); continue; }
  let ex;
  try { ex = parseLoose(b.text, b.first); } catch (e) { blinds.push(`${where}: the ${label} example does not parse: ${e.message}`); continue; }
  keys += countKeys(ex);
  const out = [];
  check(ex, root, '', t.partial, out);
  for (const f of out) fails.push(`${b.rel}:${f.line}: ${label}${f.at ? ` at ${f.at}` : ''}: ${f.msg}`);
}

for (const u of [...new Set(unchecked)]) console.log(`  not checked  ${u}`);
if (untagged.length) console.log(`  not checked  ${untagged.length} untagged JSON block(s): ${untagged.join(', ')}`);
for (const s of stale) console.log(`  STALE  ${s}`);
for (const f of blinds) console.log(`  BLIND  ${f}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(`verify-shapes: ${tagged} tagged JSON block(s) on ${pages.filter((p) => p.blocks.some((b) => b.tag !== null)).length} page(s), ${keys} keys, held to contract/shapes.json (read ${snap.read_at})`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) in the API pages' examples${blinds.length ? `, and ${blinds.length} block(s) BLIND` : ''}`); process.exit(1); }
if (stale.length) { console.log(`STALE: ${stale.length} tag(s) the snapshot does not hold; run --refresh`); process.exit(1); }
if (blinds.length) { console.log(`BLIND: ${blinds.length} tagged block(s) this could not read`); process.exit(2); }
console.log('PASS');
