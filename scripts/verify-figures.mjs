#!/usr/bin/env node
// verify-figures.mjs: each figure on the built site says what its source says. Reads dist/, so it
// runs after a build, in `npm run verify`. Exit 0 PASS, 1 FAIL, 2 CANNOT SEE.
//
// The link map (/docs/schema, CategoryLinks): its data is built from the SDK's field table; this
// holds it to the 22 element pages' field tables, which are generated from schema-dist (a second
// source). Every link it draws must be a row on that category's page, and every link row on a
// page must be drawn: other categories, the category's own, and the generic link. The page's
// text version must carry the same 22 categories, and each element page must link to the map
// opened on itself.
//
// The four nouns (/docs/schema/conventions): the address it shows is parsed by the SDK's own
// parseOwLink, filled with sample values, and must read back world, type, id, moment and lens;
// the same address with the moment after the lens must be refused, so the check can see an order.
//
// The error families (/api/errors/, ErrorFamilies): built from keel's list of error codes; this
// holds it to the summary table on the same built page (generated from that list by
// gen_errors.mjs): every public code drawn once, under the family and status its row prints, the
// Retry-After mark (ring, ↻ and spoken text) exactly on the rows whose summary names it, and the
// counts in its words to the table and the Upload host errors table. Then a cross-check against
// the API's own document: each marked code's status is one some operation declares Retry-After
// on. That document unreachable is CANNOT SEE for that half only: printed, never the exit code.
//
// The category fields (/docs/schema, CategoryFields): built from the SDK's field table and its
// families; this holds each drawn row (its field count, its link count, its bar) to that
// category's element page, generated from schema-dist: the rows of its Fields tables, a row
// reading "link to" or "links to" a link, and a generic link's two rows (`<x>_type`, then
// `<x>_id`, "id of an element of that type") one link. Each category drawn once, under the family
// the SDK's presentation data gives it, the families in the SDK's order; the lead's numbers, the
// text version under the figure, the caption's generic link and the Markdown twin to the same.
//
// The page palettes (/docs/development/api/public, PagePalettes): built from keel's palette table
// (contract/palettes.json, vendored by gen_palettes.mjs); this holds each card's name, mood and
// painted colours to the table, in its order, and its printed ratios to the painted colours,
// recomputed with a formula of its own; the lead's claim (every text colour on every surface it can
// sit on at least 4.5 to 1, the focus ring 3) over the eleven pairs keel's own test checks, for
// every palette; the text version, the twin and the page's hand-written Palette row to the table.
// It does not measure what a browser paints: the colours are read from the built HTML's styles.
//
// The world folder (/docs/schema/folders, FolderExample): built from Hyperion, schema-dist's example
// world, through the snapshot contract/folder-example.json (gen_elements.py, the run that writes the
// element pages); this holds the tree's folders and counts, the opened folder's files and the
// derivations to the snapshot, and to the schema-dist checkout itself when OW_SCHEMA_DIST names one
// (its MANIFEST hashes, files and serial). Every file name is recomputed by a second implementation
// of the naming rule whose numbers come from the page's own paragraph; each folder must be one of
// the SDK's categories; each derivation a real element; the twin the same. It does not judge the
// rule's words against a writer's code: the page's paragraph is taken as the rule.
//
// The credentials (/docs/development/api-reference, ApiCallers): built from the API document's
// security per operation through the snapshot contract/callers.json (gen_callers.mjs); this
// recounts it with code of its own: every family's cells and total, every route group's dots and
// marks, each drawn route expanded back to its operations (each snapshot operation drawn exactly
// once), the All row, the lead's and the key's counts, the caption's day; the operations that list
// no key beside a key are exactly the public worlds page's keyless reads table; the lens routes
// take an account token and are never keyless; the twin's table and routes the same. Then the
// snapshot against the live document, operation by operation: a difference is printed STALE, never
// failed (the sweep fails on it; refresh the same hour), an unreachable document is CANNOT SEE for that half only. It takes the document's word: it
// does not judge whether keel's code accepts what the document lists (a legacy key's reads need
// its PIN, as the key line says).
//
// The sign-in steps (/docs/development/api/signin, SigninSteps): built from the API document through
// the snapshot contract/signin.json (gen_signin.mjs); this reads each hop of the built figure (its
// two ends, its route, its parameters or fields) and holds it to the snapshot: the authorize page's
// path and parameters with S256 as the method's value, the query a code comes back with, the code's
// lifetime, the token route and its "no credential" to the route's security, the body to the
// document's required fields, the answer's fields and the token's prefix. Then to the page's own
// words, read from its Markdown twin: the parameter and body tables row by row, the address and the
// count of parameters, the grant_type and S256 rows, the exchange example's route, the answer
// example's keys, the code's lifetime, the Cancel's error, the prefix and the refused page's status;
// the twin's text of the figure the same. Then the snapshot against the live document, fact by
// fact, printed STALE, never failed, as the credentials snapshot is. What keel's code does beyond
// the document (the 302, the 400 page, the Cancel's error) gen_signin.mjs holds to keel, locally;
// here signin.mjs's Cancel error and 400 are held to the page's source sentences, and the 302,
// which the page does not name, is held by keel's code only.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOwLink, ELEMENT_TYPES, ELEMENT_FAMILIES, FAMILY_ORDER } from '@onlyworlds/sdk';
import { contrast, pageColours, CONTRAST } from '../src/components/figures/fields.mjs';
import { CANCEL_ERROR, REFUSED_STATUS, REDIRECT_STATUS } from '../src/components/figures/signin.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const fails = [];
const blind = (why) => { console.log(`CANNOT SEE: ${why}`); process.exit(2); };
const read = (rel) => {
  const f = join(DIST, rel);
  if (!existsSync(f)) blind(`${rel} is not in dist/ (build first)`);
  return readFileSync(f, 'utf8');
};
const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// ---- the link map ----
const schema = read('docs/schema/index.html');
const m = schema.match(/<script type="application\/json" class="ow-fig-data\b[^"]*"[^>]*>([\s\S]*?)<\/script>/);
if (!m) blind('the schema page carries no link map data (class="ow-fig-data")');
const fig = JSON.parse(m[1]);
const key = (k, to, field) => `${k} -> ${to} via ${field}`;
const drawn = new Set();
for (const k of fig.order) {
  for (const l of fig.links[k]) for (const f of l.fields) drawn.add(key(k, l.to, f));
  for (const f of fig.self[k]) drawn.add(key(k, k, f));
  for (const f of fig.generic[k]) drawn.add(key(k, 'any', f));
}
if (JSON.stringify([...fig.order].sort()) !== JSON.stringify([...ELEMENT_TYPES].sort())) {
  fails.push(`the map's categories (${fig.order.length}) are not the SDK's ${ELEMENT_TYPES.length}`);
}
const rows = new Set();
for (const k of ELEMENT_TYPES) {
  const page = read(`docs/schema/element_categories/${k}.html`);
  // A row's first two cells: <td><code>field</code> (required)?</td><td>link(s) to X | id of an element of that type</td>
  // Any case: Character's ability scores (STR to CHA) are uppercase, and a link field could be too.
  for (const r of page.matchAll(/<td><code[^>]*>([A-Za-z0-9_]+)<\/code>[^<]*<\/td>\s*<td>([^<]*)<\/td>/g)) {
    const [, field, type] = r;
    const t = type.match(/^links? to ([A-Z][a-z]+)$/);
    if (t) rows.add(key(k, t[1].toLowerCase(), field));
    else if (type === 'id of an element of that type') rows.add(key(k, 'any', field));
  }
  if (!page.includes(`href="/docs/schema/?kind=${k}#what-links-to-what"`)) fails.push(`${k}'s page has no link to the map opened on it`);
}
if (rows.size === 0) blind('no link rows read from the element pages (has the table format moved?)');
for (const d of drawn) if (!rows.has(d)) fails.push(`drawn but on no element page: ${d}`);
for (const r of rows) if (!drawn.has(r)) fails.push(`on its element page but not drawn: ${r}`);
// The back-references (drawn dark) are their own derivation, so they meet the pages too: every
// link to k from another category's page is in incoming[k], and nothing else is.
if (!fig.incoming) fails.push('the link map carries no back-references (incoming)');
else {
  const back = new Set();
  for (const k of fig.order) for (const l of fig.incoming[k] ?? []) for (const f of l.fields) back.add(key(l.from, k, f));
  const want = new Set([...rows].filter((r) => { const [, from, to] = r.match(/^(\w+) -> (\w+) via/); return to !== 'any' && to !== from; }));
  for (const b of back) if (!want.has(b)) fails.push(`drawn as a back-reference but on no element page: ${b}`);
  for (const w of want) if (!back.has(w)) fails.push(`a link the back-references leave out: ${w}`);
}
const tiles = new Set([...schema.matchAll(/<button\b[^>]*\bclass="ow-links-tile\b[^"]*"[^>]*\bdata-k="([a-z]+)"|<button\b[^>]*\bdata-k="([a-z]+)"[^>]*\bclass="ow-links-tile\b/g)].map((t) => t[1] || t[2]));
if (tiles.size !== fig.order.length) fails.push(`the map draws ${tiles.size} tiles for ${fig.order.length} categories`);
// the first text version after the link map (the category fields figure above it has its own)
const text = schema.slice(schema.indexOf('data-ow-figure="category-links"')).match(/<details class="ow-fig-text\b[^"]*"[^>]*>([\s\S]*?)<\/details>/);
if (!text) fails.push('the link map has no text version');
else {
  const items = [...text[1].matchAll(/<li[^>]*><strong[^>]*>([A-Za-z]+)<\/strong> links to/g)].map((i) => i[1].toLowerCase());
  if (JSON.stringify(items) !== JSON.stringify(fig.order)) fails.push(`the text version names ${items.length} categories, not the map's ${fig.order.length} in its order`);
}
if (!/id="what-links-to-what"/.test(schema)) fails.push('the schema page has no #what-links-to-what anchor for the element pages to open');
const pairs = new Set([...drawn].map((d) => d.replace(/ via .*/, ''))).size;
console.log(`link map: ${fig.order.length} categories, ${drawn.size} link fields drawn (${pairs} category pairs, the generic and self links included), ${rows.size} link rows on the element pages`);

// ---- the four nouns ----
const conv = read('docs/schema/conventions.html');
const a = conv.match(/<code\b[^>]*\bdata-ow-address="([^"]+)"[^>]*>([^<]*)<\/code>/);
if (!a) blind('the conventions page carries no four nouns address (data-ow-address)');
const tpl = unescape(a[1]);
if (unescape(a[2]) !== tpl) fails.push('the address the figure shows is not the one it declares');
const world = '019a1e2b-0000-7000-8000-000000000001', id = '019a1e2b-0000-7000-8000-000000000002', lens = '019a1e2b-0000-7000-8000-000000000003';
const ids = [id, lens];
const filled = tpl.replace('<world id>', world).replace('<type>', 'character').replace('<step>', '12').replace(/<id>/g, () => ids.shift());
if (/[<>]/.test(filled) || ids.length) fails.push(`the address has placeholders this check does not know: ${tpl}`);
else {
  let r = null;
  try { r = parseOwLink(filled); } catch (e) { fails.push(`parseOwLink refuses the figure's address (${e.reason || e.message}): ${filled}`); }
  if (r && !(r.world === world && r.type === 'character' && r.id === id && r.moment === 12 && r.lens === lens)) {
    fails.push(`the figure's address reads back as ${JSON.stringify({ world: r.world, type: r.type, id: r.id, moment: r.moment, lens: r.lens })}`);
  }
  const swapped = filled.replace('@12?lens=' + lens, '?lens=' + lens + '@12');
  let refused = false;
  try { parseOwLink(swapped); } catch { refused = true; }
  if (!refused) fails.push('control: parseOwLink accepted the moment after the lens, so this check cannot see an order');
}
console.log(`four nouns: the address ${tpl} parsed by the SDK's parseOwLink`);

// ---- the error families ----
const errs = read('api/errors/index.html');
const ef = errs.match(/<figure\b[^>]*\bdata-ow-figure="error-families"[^>]*>([\s\S]*?)<\/figure>/);
if (!ef) blind('the errors page carries no error families figure (data-ow-figure="error-families")');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const strip = (s) => unescape(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
// The figure, as drawn: family blocks, status groups inside them, a chip per code inside those.
const shown = new Map();
const famTypes = [];
for (const fb of ef[1].split(/(?=<div\b[^>]*\bclass="ow-err-fam\b)/).slice(1)) {
  const type = attr(fb.match(/^<div\b[^>]*>/)[0], 'data-family');
  famTypes.push(type);
  const name = fb.match(/<p\b[^>]*class="ow-err-name\b[^>]*>\s*<code\b[^>]*>([a-z_]+)<\/code>/);
  if (name?.[1] !== type) fails.push(`errors figure: the ${type} family is named ${name?.[1] ?? 'nothing'}`);
  for (const gb of fb.split(/(?=<div\b[^>]*\bclass="ow-err-grp\b)/).slice(1)) {
    const status = Number(attr(gb.match(/^<div\b[^>]*>/)[0], 'data-status'));
    const label = gb.match(/<span\b[^>]*class="ow-err-st\b[^>]*>(\d{3})<\/span>/);
    if (Number(label?.[1]) !== status) fails.push(`errors figure: a ${type} group holds ${status} and shows ${label?.[1] ?? 'no status'}`);
    for (const li of gb.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) {
      const code = attr(li[1], 'data-code'), body = li[2];
      if (shown.has(code)) fails.push(`errors figure: ${code} is drawn twice`);
      shown.set(code, {
        type, status,
        ring: /\bretry\b/.test(attr(li[1], 'class') ?? ''),
        mark: /class="ow-err-mark\b[^"]*"[^>]*>↻</.test(body),
        said: /class="sr-only\b[^"]*"[^>]*>[^<]*Retry-After/.test(body),
      });
      if (!new RegExp(`<a\\b[^>]*href="#${code}"`).test(body)) fails.push(`errors figure: ${code}'s chip does not link to #${code}`);
    }
  }
}
// The summary table on the same page, generated from the same list by gen_errors.mjs.
const head = errs.indexOf('>What happened</th>');
const tbl = head < 0 ? '' : errs.slice(head, errs.indexOf('</table>', head));
const table = new Map();
for (const r of tbl.matchAll(/<tr>\s*<td[^>]*><a href="#([a-z_]+)"><code[^>]*>([a-z_]+)<\/code><\/a><\/td>\s*<td[^>]*><code[^>]*>([a-z_]+)<\/code><\/td>\s*<td[^>]*><code[^>]*>(\d{3})<\/code><\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g)) {
  const [, anchor, code, type, status, what] = r;
  if (anchor !== code) fails.push(`errors table: the ${code} row links to #${anchor}`);
  table.set(code, { type, status: Number(status), retry: /Retry-After/.test(strip(what)) });
}
// Presence before sameness: the figure draws every public code in the list, and the table has rows.
const list = JSON.parse(readFileSync(join(DIST, '..', 'contract', 'error-codes.json'), 'utf8'));
const publicCodes = Object.keys(list).filter((c) => !list[c].internal && !list[c].host);
if (!table.size) blind('no rows read from the errors page\'s summary table (has its format moved?)');
if (shown.size !== publicCodes.length) fails.push(`errors figure: draws ${shown.size} codes; the list has ${publicCodes.length} public codes`);
if (table.size !== publicCodes.length) fails.push(`errors table: ${table.size} rows; the list has ${publicCodes.length} public codes`);
for (const [c, t] of table) {
  const s = shown.get(c);
  if (!s) { fails.push(`errors figure: ${c} (${t.type} ${t.status}) is in the table and not drawn`); continue; }
  if (s.type !== t.type || s.status !== t.status) fails.push(`errors figure: ${c} is drawn under ${s.type} ${s.status}; the table says ${t.type} ${t.status}`);
  if (t.retry && !(s.ring && s.mark && s.said)) fails.push(`errors figure: ${c}'s row names Retry-After, and its chip lacks the ${[!s.ring && 'ring', !s.mark && '↻ mark', !s.said && 'spoken text'].filter(Boolean).join(', ')}`);
  if (!t.retry && (s.ring || s.mark || s.said)) fails.push(`errors figure: ${c} is marked Retry-After; its row does not name it`);
}
for (const c of shown.keys()) if (!table.has(c)) fails.push(`errors figure: draws ${c}, which is not in the table`);
const tableTypes = [...new Set([...table.values()].map((t) => t.type))];
if (JSON.stringify([...famTypes].sort()) !== JSON.stringify([...tableTypes].sort())) fails.push(`errors figure: families ${famTypes.join(', ')}; the table's types are ${tableTypes.join(', ')}`);
// The generated words: the counts in the lead and the key, the example family, the host line.
const lead = strip(ef[1].match(/<p\b[^>]*class="ow-err-lead\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
const lm = lead.match(/^(\d+) error codes? in (\d+) famil(?:y|ies)\. .*the ([a-z_]+) family alone answers with (\d+) statuses \(([\d, ]+)\)\.$/);
const statusesOf = (type) => [...new Set([...table.values()].filter((t) => t.type === type).map((t) => t.status))].sort((a, b) => a - b);
if (!lm) fails.push(`errors figure: the lead does not read as counts and an example: "${lead}"`);
else {
  const [, nCodes, nFams, ex, nSt, sts] = lm;
  if (Number(nCodes) !== table.size || Number(nFams) !== tableTypes.length) fails.push(`errors figure: the lead says ${nCodes} codes in ${nFams} families; the table has ${table.size} in ${tableTypes.length}`);
  const most = Math.max(...tableTypes.map((t) => statusesOf(t).length));
  if (Number(nSt) !== statusesOf(ex).length || sts !== statusesOf(ex).join(', ')) fails.push(`errors figure: the lead says ${ex} answers with ${nSt} statuses (${sts}); the table gives it ${statusesOf(ex).join(', ')}`);
  if (statusesOf(ex).length !== most) fails.push(`errors figure: the lead's example ${ex} is not the family with the most statuses (${most})`);
}
const marked = [...shown].filter(([, s]) => s.ring);
const legend = strip(ef[1].match(/<p\b[^>]*class="ow-err-key\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
if (!legend.includes(`then retry (${marked.length} code${marked.length === 1 ? '' : 's'})`)) fails.push(`errors figure: the key does not count the ${marked.length} marked codes: "${legend}"`);
const hostRows = (errs.split('id="upload-host-errors"')[1] ?? '').split('</table>')[0];
const hostCodes = [...hostRows.matchAll(/<tr>\s*<td[^>]*><code[^>]*>(\d{3})<\/code><\/td>\s*<td[^>]*><code[^>]*>([a-z_]+)<\/code><\/td>/g)];
const hostLine = strip(ef[1].match(/<p\b[^>]*class="ow-err-host\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
const hostSt = [...new Set(hostCodes.map((h) => Number(h[1])))].sort((a, b) => a - b).join(', ');
if (!hostCodes.length) fails.push('errors page: no rows read from the Upload host errors table');
else if (!hostLine.includes(`its own ${hostCodes.length} codes (statuses ${hostSt})`)) fails.push(`errors figure: the host line does not say its own ${hostCodes.length} codes (statuses ${hostSt}): "${hostLine}"`);
console.log(`error families: ${shown.size} codes in ${famTypes.length} families drawn, ${table.size} table rows, ${marked.length} marked Retry-After, the upload host's ${hostCodes.length}`);

// The marks against the API's own document: each marked code's status is one that some operation
// declares a Retry-After header on. A cross-check, so a document that can't be fetched is named
// and does not block the build.
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
let doc = null;
try {
  const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  doc = await r.json();
} catch (e) {
  console.log(`CANNOT SEE: ${OPENAPI} (${e.message}); the Retry-After cross-check did not run`);
}
if (doc) {
  const deref = (o) => { for (let i = 0; o?.$ref && i < 10; i++) o = o.$ref.replace(/^#\//, '').split('/').reduce((a, k) => a?.[k], doc); return o; };
  const hasRetry = (resp) => Object.keys(deref(resp)?.headers ?? {}).some((h) => h.toLowerCase() === 'retry-after');
  const declared = new Set(), keyed = [];
  for (const ops of Object.values(doc.paths ?? {})) for (const [m, op] of Object.entries(ops)) {
    if (!op?.responses) continue;
    for (const [st, resp] of Object.entries(op.responses)) if (hasRetry(resp)) declared.add(Number(st));
    const params = [...(ops.parameters ?? []), ...(op.parameters ?? [])].map(deref);
    if (params.some((p) => p?.in === 'header' && p.name?.toLowerCase() === 'idempotency-key')) keyed.push(op);
  }
  if (!declared.size) fails.push(`the API document declares no Retry-After header at all (has its shape moved?)`);
  for (const [c, s] of marked) if (!declared.has(s.status)) fails.push(`errors figure: ${c} is marked Retry-After, and no operation in the API document declares Retry-After on a ${s.status}`);
  // idempotency_in_flight answers on any write that takes an Idempotency-Key: every such operation
  // declares Retry-After on that status (keel PR 308 closed the gap this printed until 2026-10-28).
  const inflight = shown.get('idempotency_in_flight');
  if (inflight?.ring) {
    if (!keyed.length) fails.push('the API document has no operation taking an Idempotency-Key (has its shape moved?)');
    for (const op of keyed) {
      if (!(op.responses[inflight.status] && hasRetry(op.responses[inflight.status]))) {
        fails.push(`errors figure: idempotency_in_flight is marked Retry-After, and ${op.operationId ?? 'an operation'} takes an Idempotency-Key without declaring Retry-After on its ${inflight.status}`);
      }
    }
  }
  console.log(`error families: the API document declares Retry-After on ${[...declared].sort((a, b) => a - b).join(', ')}; the ${marked.length} marked codes' statuses held to it`);
}

// ---- the category fields ----
const cf = schema.match(/<figure\b[^>]*\bdata-ow-figure="category-fields"[^>]*>([\s\S]*?)<\/figure>/);
if (!cf) blind('the schema page carries no category fields figure (data-ow-figure="category-fields")');
const cap = (k) => k[0].toUpperCase() + k.slice(1);
// The second source: each category's element page, its Fields tables row by row.
const onPage = {};
for (const k of ELEMENT_TYPES) {
  const page = read(`docs/schema/element_categories/${k}.html`);
  const at = page.indexOf('id="fields"');
  const end = page.indexOf('</main>', at);
  if (at < 0 || end < 0) { fails.push(`category fields: ${k}'s element page has no Fields section`); continue; }
  let rows = 0, trs = 0, links = 0;
  const generic = [];
  for (const tb of page.slice(at, end).matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)) {
    trs += (tb[1].match(/<tr>/g) ?? []).length;
    for (const tr of tb[1].matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>/g)) {
      rows++;
      const t = strip(tr[2]);
      if (/^links? to /.test(t)) links++;
      else if (t === 'id of an element of that type') generic.push(strip(tr[1]).replace(/_id$/, ''));
    }
  }
  if (rows !== trs) fails.push(`category fields: read ${rows} of the ${trs} rows on ${k}'s element page (has the table format moved?)`);
  onPage[k] = { fields: rows - generic.length, links: links + generic.length, generic };
}
if (!Object.values(onPage).some((p) => p.fields)) blind('no field rows read from the element pages (has the table format moved?)');
const want = Object.values(onPage);
const maxWant = Math.max(...want.map((p) => p.fields));
// The figure, as drawn: a section per family, a row per category inside it.
const kf = new Map();
const kfFams = [];
const pct = (style) => Number(style?.match(/width:\s*([\d.]+)%/)?.[1]);
for (const sb of cf[1].split(/(?=<section\b[^>]*\bclass="ow-kf-fam\b)/).slice(1)) {
  const fam = attr(sb.match(/^<section\b[^>]*>/)[0], 'data-family');
  kfFams.push(fam);
  const here = [];
  for (const li of sb.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) {
    const k = attr(li[1], 'data-k'), n = Number(attr(li[1], 'data-fields')), l = Number(attr(li[1], 'data-links')), body = li[2];
    if (kf.has(k)) fails.push(`category fields: ${k} is drawn twice`);
    kf.set(k, { fam, n, l });
    here.push({ k, n });
    const said = strip(body.match(/<span\b[^>]*class="ow-kf-n\b[^>]*>([\s\S]*?)<\/span>\s*$/)?.[1] ?? '');
    if (said !== `${n} fields, ${l} of them links`) fails.push(`category fields: ${k}'s row says "${said}" for ${n} fields, ${l} of them links`);
    if (!new RegExp(`<a\\b[^>]*href="/docs/schema/element_categories/${k}"[^>]*>${cap(k)}</a>`).test(body)) fails.push(`category fields: ${k}'s row does not name it with a link to its page`);
    const bl = pct(body.match(/<i\b[^>]*class="l\b[^>]*style="([^"]*)"/)?.[1] ?? body.match(/<i\b[^>]*style="([^"]*)"[^>]*class="l\b/)?.[1]);
    const bv = pct(body.match(/<i\b[^>]*class="v\b[^>]*style="([^"]*)"/)?.[1] ?? body.match(/<i\b[^>]*style="([^"]*)"[^>]*class="v\b/)?.[1]);
    if (!(Math.abs(bl - (100 * l) / maxWant) < 0.01 && Math.abs(bv - (100 * (n - l)) / maxWant) < 0.01)) {
      fails.push(`category fields: ${k}'s bar is ${bl}% links and ${bv}% values; ${l} links and ${n - l} values of the longest ${maxWant} are ${((100 * l) / maxWant).toFixed(2)}% and ${((100 * (n - l)) / maxWant).toFixed(2)}%`);
    }
  }
  const head = strip(sb.match(/<p\b[^>]*class="ow-kf-name\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
  if (!head.startsWith(cap(fam ?? '?')) || !head.endsWith(` ${here.length}`)) fails.push(`category fields: the ${fam} family's heading "${head}" does not name it and its ${here.length} categories`);
  const sorted = [...here].sort((a, b) => b.n - a.n || (a.k < b.k ? -1 : 1)).map((r) => r.k);
  if (here.map((r) => r.k).join() !== sorted.join()) fails.push(`category fields: ${fam} is not drawn most fields first: ${here.map((r) => r.k).join(', ')}`);
}
if (kf.size !== ELEMENT_TYPES.length) fails.push(`category fields: draws ${kf.size} categories; the SDK has ${ELEMENT_TYPES.length}`);
for (const k of ELEMENT_TYPES) {
  const d = kf.get(k), p = onPage[k];
  if (!d) { fails.push(`category fields: ${k} is not drawn`); continue; }
  if (d.fam !== ELEMENT_FAMILIES[k]) fails.push(`category fields: ${k} is drawn under ${d.fam}; the SDK's presentation data puts it in ${ELEMENT_FAMILIES[k]}`);
  if (p && (d.n !== p.fields || d.l !== p.links)) fails.push(`category fields: ${k} is drawn with ${d.n} fields, ${d.l} links; its element page has ${p.fields} fields, ${p.links} links`);
}
for (const k of kf.keys()) if (!ELEMENT_TYPES.includes(k)) fails.push(`category fields: draws ${k}, which is not a category`);
const famWant = FAMILY_ORDER.filter((f) => ELEMENT_TYPES.some((k) => ELEMENT_FAMILIES[k] === f));
if (kfFams.join() !== famWant.join()) fails.push(`category fields: families drawn ${kfFams.join(', ')}; the SDK's order is ${famWant.join(', ')}`);
if (Number(attr(cf[0].match(/^<figure\b[^>]*>/)[0], 'data-max')) !== maxWant) fails.push(`category fields: the bars are scaled to ${attr(cf[0], 'data-max')} fields; the longest element page has ${maxWant}`);
// The lead's numbers, from the element pages (a tie goes to the first A to Z).
const az = [...ELEMENT_TYPES].sort().filter((k) => onPage[k]);
const best = (better) => az.reduce((w, k) => (better(onPage[k], onPage[w]) ? k : w));
const fewest = best((c, w) => c.fields < w.fields), most = best((c, w) => c.fields > w.fields);
const linked = best((c, w) => c.links * w.fields > w.links * c.fields);
const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const kfLead = strip(cf[1].match(/<p\b[^>]*class="ow-kf-lead\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
const leadWant = `${az.length} categories in ${WORD[famWant.length] ?? famWant.length} families. From ${cap(fewest)}'s ${onPage[fewest].fields} fields to ${cap(most)}'s ${onPage[most].fields}. ${cap(linked)} is the most linked: ${onPage[linked].links} of its ${onPage[linked].fields} fields are links to other elements.`;
if (kfLead !== leadWant) fails.push(`category fields: the lead reads "${kfLead}"; the element pages give "${leadWant}"`);
// The caption names each generic link the element pages show as two rows.
const kfCap = strip(cf[1].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? '');
for (const k of az) for (const g of onPage[k].generic) {
  if (!kfCap.includes(`A ${cap(k)}'s ${g} link counts as one field; on the wire it is two, ${g}_type and ${g}_id.`)) fails.push(`category fields: the caption does not say ${k}'s ${g} link counts once: "${kfCap}"`);
}
// The text version under the figure, and the Markdown twin, say the same counts.
const kfText = schema.slice(schema.indexOf('data-ow-figure="category-fields"')).match(/<details class="ow-fig-text\b[^"]*"[^>]*>([\s\S]*?)<\/details>/);
const twin = read('docs/schema.md');
const listed = (s) => [...s.matchAll(/([A-Z][a-z]+) (\d+) fields \((\d+) links?\)/g)].map((m) => `${m[1].toLowerCase()} ${m[2]} fields ${m[3]} links`);
const drawnList = [...kf].map(([k, d]) => `${k} ${d.n} fields ${d.l} links`);
// what one list says that the figure does not, and the other way; the same entries in another order
const differ = (where, got) => {
  const a = got.filter((x) => !drawnList.includes(x)), b = drawnList.filter((x) => !got.includes(x));
  if (a.length || b.length) return `category fields: ${where} says ${a.join(', ') || 'nothing more'}; the figure draws ${b.join(', ') || 'nothing more'}`;
  if (got.join() !== drawnList.join()) return `category fields: ${where} lists the categories in another order than the figure`;
};
if (!kfText) fails.push('category fields: no text version under the figure');
else { const d = differ('the text version', listed(strip(kfText[1]))); if (d) fails.push(d); }
if (/^<CategoryFields \/>$/m.test(twin)) fails.push('category fields: the Markdown twin carries the bare tag, not the text');
else if (differ('the Markdown twin', listed(twin))) fails.push(differ('the Markdown twin', listed(twin)));
else if (!twin.includes(leadWant.replace(/^(.*? families\.)/, '**$1**'))) fails.push('category fields: the Markdown twin does not carry the lead');
// The bars' colours as painted (the figure's own style attribute), against the page's background in
// each theme as ow.css sets it: every family's link half clears CONTRAST.link and its value half
// CONTRAST.value, in both themes.
const page = pageColours(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles', 'ow.css'), 'utf8'));
if (!page.dark || !page.light) blind('no --sl-color-black for both themes in src/styles/ow.css');
const painted = Object.fromEntries([...attr(cf[0].match(/^<figure\b[^>]*>/)[0], 'style').matchAll(/--ow-kf-([a-z]+)-(lv|dv|l|d):\s*(#[0-9a-f]{6})/gi)].map((m) => [`${m[1]}-${m[2]}`, m[3]]));
let painted4 = 0;
for (const f of famWant) {
  for (const [theme, t] of [['light', 'l'], ['dark', 'd']]) {
    for (const [half, key, min] of [['link', t, CONTRAST.link], ['value', `${t}v`, CONTRAST.value]]) {
      const c = painted[`${f}-${key}`];
      if (!c) { fails.push(`category fields: no ${theme} ${half} colour painted for ${f}`); continue; }
      painted4++;
      const r = contrast(c, page[theme]);
      if (r < min) fails.push(`category fields: ${f}'s ${half} half in ${theme} is ${c}, ${r.toFixed(2)}:1 against the page's ${page[theme]}; it needs ${min}:1`);
    }
  }
}
console.log(`category fields: ${painted4} bar colours painted, each clearing ${CONTRAST.link}:1 (links) or ${CONTRAST.value}:1 (values) against the page in its theme`);
console.log(`category fields: ${kf.size} categories in ${kfFams.length} families drawn, ${[...kf.values()].reduce((a, d) => a + d.n, 0)} own fields and ${[...kf.values()].reduce((a, d) => a + d.l, 0)} links, held to ${az.length} element pages' Fields tables`);

// ---- the page palettes ----
// The figure on /docs/development/api/public, against keel's palette table as vendored
// (contract/palettes.json, written by gen_palettes.mjs from keel's published branch). Its ratios
// are recomputed here from the colours the built cards paint, with a formula and a pair list of
// this file's own (not palettes.mjs, which printed them). keel's floors are this file's too: the
// lead must state them, and every pair must clear them.
const pubPage = read('docs/development/api/public.html');
const pubTwin = read('docs/development/api/public.md');
const palSnap = JSON.parse(readFileSync(join(DIST, '..', 'contract', 'palettes.json'), 'utf8'));
const pf = pubPage.match(/<figure\b[^>]*\bdata-ow-figure="palettes"[^>]*>([\s\S]*?)<\/figure>/);
if (!pf) blind('the public worlds page carries no palettes figure (data-ow-figure="palettes")');
if (!palSnap.palettes?.length) blind('contract/palettes.json holds no palettes');
// A second luminance: the sRGB curve's own 0.04045 knee, rgb parsed from either form the HTML holds.
const chan = (h) => (h.startsWith('#') ? [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)].map((x) => Number.parseInt(x, 16)) : h.match(/\d+/g).slice(0, 3).map(Number));
const relLum = (h) => chan(h).map((v) => v / 255).map((s) => (s > 0.04045 ? Math.pow((s + 0.055) / 1.055, 2.4) : s / 12.92)).reduce((sum, s, i) => sum + s * [0.2126, 0.7152, 0.0722][i], 0);
const cr = (a, b) => { const x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const over = (bg, rgba) => { const m = rgba.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/); const base = chan(bg); return '#' + [1, 2, 3].map((i) => Math.round(Number(m[4]) * Number(m[i]) + (1 - Number(m[4])) * base[i - 1]).toString(16).padStart(2, '0')).join(''); };
// keel's contrast check (tests/test_public_page_settings.py _vet): ten text pairs at 4.5, the focus
// ring (the accent outline, page.css :focus-visible) at 3 on the page.
const KEEL_TEXT = 4.5, KEEL_RING = 3;
const keelPairs = (p) => {
  const w = over(p.bg, p.wash);
  return [
    ...[['text', p.text], ['muted', p.muted], ['accent', p.accent]].flatMap(([n, fg]) => [[`${n} on page`, fg, p.bg], [`${n} on card`, fg, p.surf], [`${n} on the pin wash`, fg, w]]),
    ['on-fill on fill', p.onfill, p.fill],
  ].map(([what, fg, bg]) => ({ what, r: cr(fg, bg), need: KEEL_TEXT })).concat([{ what: 'focus ring on page', r: cr(p.accent, p.bg), need: KEEL_RING }]);
};
const style = (tag, prop) => tag.match(new RegExp(`\\bstyle="(?:[^"]*?;)?\\s*${prop}:\\s*([^;"]+)`))?.[1]?.trim().toLowerCase();
const roleTag = (body, role) => body.match(new RegExp(`<[a-z]+\\b[^>]*\\bdata-role="${role}"[^>]*>`))?.[0] ?? '';
const roleText = (body, role) => strip(body.match(new RegExp(`<([a-z]+)\\b[^>]*\\bdata-role="${role}"[^>]*>([\\s\\S]*?)</\\1>`))?.[2] ?? '');
const cards = [];
for (const cb of pf[1].split(/(?=<li\b[^>]*\bclass="ow-pal-card\b)/).slice(1)) {
  const key = attr(cb.match(/^<li\b[^>]*>/)[0], 'data-palette');
  const pg = roleTag(cb, 'page'), surf = roleTag(cb, 'surface'), btn = roleTag(cb, 'button');
  const card = {
    key, name: roleText(cb, 'title'), mood: roleText(cb, 'muted'),
    bg: style(pg, 'background'), surf: style(surf, 'background'), line: style(surf, 'border-color'),
    text: style(roleTag(cb, 'title'), 'color'), boxText: style(roleTag(cb, 'text'), 'color'), muted: style(roleTag(cb, 'muted'), 'color'),
    accent: style(roleTag(cb, 'link'), 'color'), fill: style(btn, 'background'), onfill: style(btn, 'color'),
    printed: Object.fromEntries([...cb.matchAll(/<dd\b[^>]*\bdata-pair="([a-z]+)"[^>]*>([^<]*)<\/dd>/g)].map((d) => [d[1], d[2].trim()])),
  };
  cards.push(card);
}
const keysWant = palSnap.palettes.map((p) => p.key);
if (cards.map((c) => c.key).join() !== keysWant.join()) fails.push(`palettes: the figure draws ${cards.map((c) => c.key).join(', ')}; keel's table (contract/palettes.json) has ${keysWant.join(', ')}, in that order`);
let palRatios = 0;
for (const c of cards) {
  const p = palSnap.palettes.find((x) => x.key === c.key);
  if (!p) { fails.push(`palettes: draws ${c.key}, which keel's table does not have`); continue; }
  if (c.name !== p.name || c.mood !== p.mood) fails.push(`palettes: the ${c.key} card is named "${c.name}" (${c.mood}); the table says "${p.name}" (${p.mood})`);
  for (const f of ['bg', 'surf', 'line', 'text', 'muted', 'accent', 'fill', 'onfill']) {
    if (c[f] !== p[f]) fails.push(`palettes: the ${c.key} card paints ${f} ${c[f] ?? 'nothing'}; the table says ${p[f]}`);
  }
  if (c.boxText !== p.text) fails.push(`palettes: the ${c.key} card's text on its surface is ${c.boxText}; the table's text is ${p.text}`);
  // the printed numbers, recomputed from what the card paints
  const want = { text: [c.text, c.bg], muted: [c.muted, c.bg], link: [c.accent, c.bg], button: [c.onfill, c.fill] };
  if (Object.keys(c.printed).join() !== Object.keys(want).join()) fails.push(`palettes: the ${c.key} card prints ${Object.keys(c.printed).join(', ') || 'nothing'}; it should print ${Object.keys(want).join(', ')}`);
  for (const [label, [fg, bg]] of Object.entries(want)) {
    if (!fg || !bg || c.printed[label] === undefined) continue;
    palRatios++;
    const r = cr(fg, bg);
    if (!/^\d+\.\d\d$/.test(c.printed[label]) || Math.abs(Number(c.printed[label]) - r) > 0.0051) fails.push(`palettes: the ${c.key} card prints ${label} ${c.printed[label]}; its painted ${fg} on ${bg} is ${r.toFixed(3)} to 1`);
  }
}
// The lead's claim, over every pair keel's own check holds, for every palette in the table.
const palLead = strip(pf[1].match(/<p\b[^>]*class="ow-pal-lead\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
const pl = palLead.match(/^([A-Z][a-z]+) palettes, each checked\. Every text colour on every surface it can sit on is at least ([\d.]+) to 1, and the focus ring ([\d.]+) to 1\. The default is ([A-Z][a-z]+)\.$/);
const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const palDefault = palSnap.palettes.find((p) => p.key === palSnap.default);
if (!palDefault) fails.push(`palettes: the table's default ${palSnap.default} is not one of its palettes`);
if (!pl) fails.push(`palettes: the lead does not read as a count, two floors and the default: "${palLead}"`);
else {
  const [, n, textFloor, ringFloor, def] = pl;
  if (COUNT.indexOf(n) !== palSnap.palettes.length) fails.push(`palettes: the lead says ${n} palettes; the table has ${palSnap.palettes.length}`);
  if (Number(textFloor) !== KEEL_TEXT || Number(ringFloor) !== KEEL_RING) fails.push(`palettes: the lead claims ${textFloor} and ${ringFloor} to 1; keel's check holds ${KEEL_TEXT} and ${KEEL_RING}`);
  if (def !== palDefault?.name) fails.push(`palettes: the lead names ${def} the default; the table's default is ${palDefault?.name}`);
}
let palPairs = 0;
for (const p of palSnap.palettes) for (const x of keelPairs(p)) {
  palPairs++;
  if (x.r < x.need) fails.push(`palettes: ${p.name}'s ${x.what} is ${x.r.toFixed(2)} to 1, under ${x.need}, and the lead claims every one clears it`);
}
if (attr(pf[0].match(/^<figure\b[^>]*>/)[0], 'data-default') !== palSnap.default) fails.push(`palettes: the figure's default is ${attr(pf[0], 'data-default')}; the table's is ${palSnap.default}`);
const wire = strip(pf[1].match(/<p\b[^>]*class="ow-pal-key\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
if (!wire.includes(`public_page.palette is one of ${keysWant.join(', ')}, or null for ${palDefault?.name}.`)) fails.push(`palettes: the key line does not list the keys ${keysWant.join(', ')} and null for the default: "${wire}"`);
// The text version under the figure and the twin: each palette's line, its colours and numbers.
const palLine = (p, c) => `${p.name} (${p.key}, ${p.mood}${p.key === palSnap.default ? ', the default' : ''}): page ${p.bg}, card ${p.surf}, text ${p.text}, muted ${p.muted}, link and focus ring ${p.accent}, button label ${p.onfill} on ${p.fill}. Contrast: text ${c.text}, muted ${c.muted}, link ${c.link}, button ${c.button} to 1.`;
const recomputed = (p) => Object.fromEntries([['text', p.text, p.bg], ['muted', p.muted, p.bg], ['link', p.accent, p.bg], ['button', p.onfill, p.fill]].map(([l, a, b]) => [l, cr(a, b).toFixed(2)]));
const palText = pubPage.slice(pubPage.indexOf('data-ow-figure="palettes"')).match(/<details class="ow-fig-text\b[^"]*"[^>]*>([\s\S]*?)<\/details>/);
const textItems = palText ? [...palText[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((li) => strip(li[1])) : [];
const twinItems = [...pubTwin.matchAll(/^- \*\*([A-Z][a-z]+)\*\* (\(.*)$/gm)].map((m) => `${m[1]} ${m[2]}`.replace(/`/g, ''));
for (const [where, items] of [['the text version', textItems], ['the Markdown twin', twinItems]]) {
  const wantLines = palSnap.palettes.map((p) => palLine(p, recomputed(p)));
  if (items.length !== wantLines.length) { fails.push(`palettes: ${where} lists ${items.length} palettes; the table has ${wantLines.length}`); continue; }
  items.forEach((got, i) => { if (got !== wantLines[i]) fails.push(`palettes: ${where} reads "${got}"; the table gives "${wantLines[i]}"`); });
}
if (/^<PagePalettes \/>$/m.test(pubTwin)) fails.push('palettes: the Markdown twin carries the bare tag, not the text');
// The page's own Palette row, hand-written: the count, the names in the table's order, the default's mood.
const rowWant = `One of ${COUNT[palSnap.palettes.length]?.toLowerCase()}: ${palSnap.palettes.map((p) => (p.key === palSnap.default ? `${p.name} (${p.mood}, the default)` : p.name)).reduce((s, n, i, all) => (i === 0 ? n : `${s}${i === all.length - 1 ? ' or ' : ', '}${n}`), '')}`;
const rowHtml = strip(pubPage.match(/<td\b[^>]*><strong>Palette<\/strong><\/td>\s*<td\b[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? '');
const rowMd = pubTwin.match(/^\| \*\*Palette\*\* \| (.*?) \|$/m)?.[1] ?? '';
if (rowHtml !== rowWant) fails.push(`palettes: the page's Palette row reads "${rowHtml}"; the table gives "${rowWant}"`);
if (rowMd !== rowWant) fails.push(`palettes: the twin's Palette row reads "${rowMd}"; the table gives "${rowWant}"`);
console.log(`page palettes: ${cards.length} cards drawn in keel's order (read at ${palSnap.read_at}), ${palRatios} printed ratios recomputed from their painted colours, ${palPairs} pairs held to keel's floors (${KEEL_TEXT}, the ring ${KEEL_RING}), the Palette row held to the table`);

// ---- the world folder ----
// The figure on /docs/schema/folders, against Hyperion, the example world in schema-dist, as the
// snapshot contract/folder-example.json holds it (written by gen_elements.py in the run that writes
// the element pages), and against the schema-dist checkout itself when OW_SCHEMA_DIST names one
// (the deploy's clone): its MANIFEST.json hashes, its files and its serial. The naming rule is
// implemented a second time here, character by character, with its two numbers and its separator
// read from the built page's own paragraph, never from folders.mjs.
const foldPage = read('docs/schema/folders.html');
const foldTwin = read('docs/schema/folders.md');
const ff = foldPage.match(/<figure\b[^>]*\bdata-ow-figure="folder-example"[^>]*>([\s\S]*?)<\/figure>/);
if (!ff) blind('the folders page carries no world folder figure (data-ow-figure="folder-example")');
const foldSnap = JSON.parse(readFileSync(join(DIST, '..', 'contract', 'folder-example.json'), 'utf8'));
if (!foldSnap.elements?.length) blind('contract/folder-example.json holds no elements');
// The rule's numbers, from the page's paragraph (the figure's own rule line is not read for them).
const foldOutside = foldPage.replace(ff[0], '');
const ruleP = strip(foldOutside.match(/<p>((?:(?!<\/p>)[\s\S])*?The recommended name is[\s\S]*?)<\/p>/)?.[1] ?? '');
const cutN = Number(ruleP.match(/cut to (\d+) characters/)?.[1]);
const tailN = Number(ruleP.match(/id(?:'|’)s last (\d+) characters/)?.[1]);
const sep = ruleP.match(/The recommended name is <slug>(\S+?)<tail>\.json\./)?.[1];
if (!(cutN > 0 && tailN > 0 && sep)) blind(`the folders page's paragraph does not state the rule as this check reads it (cut ${cutN}, tail ${tailN}, separator ${sep}): "${ruleP}"`);
// The second implementation: decompose the name (NFKD) and drop its combining marks (U+0300 to
// U+036F) code point by code point, lowercase it, then walk it: letters and digits kept, a run of
// anything else one hyphen, but only between kept characters (none at either end); cut; then every
// hyphen left at the end off; then the separator and the id's tail.
const foldAccents = (s) => [...s.normalize('NFKD')].filter((ch) => { const cp = ch.codePointAt(0); return cp < 0x300 || cp > 0x36f; }).join('');
const ruleSlug = (name) => {
  if (typeof name !== 'string') return '';
  let out = '', gap = false;
  for (const ch of foldAccents(name).toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) { if (gap && out) out += '-'; gap = false; out += ch; } else gap = true;
  }
  out = out.substring(0, cutN);
  while (out.endsWith('-')) out = out.substring(0, out.length - 1);
  return out;
};
const ruleTail = (id) => id.substring(id.length - tailN);
const ruleFile = (name, id) => (ruleSlug(name) ? `${ruleSlug(name)}${sep}${ruleTail(id)}.json` : `${id}.json`);
// The source: the snapshot, or the checkout when one is given (then the snapshot is held to it too).
const exKey = (e) => `${e.kind}/${e.file} ${e.id} ${JSON.stringify(e.name)}`;
let exSource = { serial: foldSnap.serial, root: foldSnap.root, elements: foldSnap.elements, from: `contract/folder-example.json (serial ${foldSnap.serial})` };
const distDir = process.env.OW_SCHEMA_DIST;
if (distDir) {
  const { createHash } = await import('node:crypto');
  const { readdirSync, statSync } = await import('node:fs');
  if (!existsSync(join(distDir, 'MANIFEST.json'))) blind(`OW_SCHEMA_DIST=${distDir} holds no MANIFEST.json`);
  const man = JSON.parse(readFileSync(join(distDir, 'MANIFEST.json'), 'utf8'));
  const hashes = man.files ?? man;
  const prefix = `example/${foldSnap.folder}/`;
  const listedEx = Object.keys(hashes).filter((r) => r.startsWith(prefix)).sort();
  const walkDir = (d) => readdirSync(join(distDir, d)).flatMap((f) => (statSync(join(distDir, d, f)).isDirectory() ? walkDir(`${d}/${f}`) : [`${d}/${f}`]));
  const onDisk = walkDir(prefix.slice(0, -1)).sort();
  if (listedEx.join() !== onDisk.join()) fails.push(`folders: the checkout's ${prefix} holds ${onDisk.length} files and its MANIFEST.json lists ${listedEx.length}`);
  for (const r of listedEx) {
    const got = createHash('sha256').update(readFileSync(join(distDir, r))).digest('hex');
    if (got !== String(hashes[r]).replace(/^sha256:/, '')) fails.push(`folders: the checkout's ${r} does not match its MANIFEST.json hash`);
  }
  const serial = readFileSync(join(distDir, 'VERSION'), 'utf8').match(/^serial: (\S+)/m)?.[1];
  const elements = listedEx.filter((r) => /^[^/]+\/[^/]+\/elements\/[^/]+\/[^/]+\.json$/.test(r)).map((r) => {
    const [, , , kind, file] = r.split('/');
    const d = JSON.parse(readFileSync(join(distDir, r), 'utf8'));
    return { kind, file, id: d.id, name: d.name };
  });
  const root = listedEx.map((r) => r.slice(prefix.length)).filter((r) => !r.includes('/'));
  exSource = { serial, root, elements, from: `the checkout at ${distDir} (serial ${serial})` };
  if (serial !== foldSnap.serial) fails.push(`folders: contract/folder-example.json is serial ${foldSnap.serial}; the checkout is serial ${serial} (run scripts/gen_elements.py --dist on it)`);
  const a = new Set(elements.map(exKey)), b = new Set(foldSnap.elements.map(exKey));
  const onlyA = [...a].filter((x) => !b.has(x)), onlyB = [...b].filter((x) => !a.has(x));
  if (onlyA.length || onlyB.length) fails.push(`folders: the snapshot and the checkout differ: in the checkout only ${onlyA.join('; ') || 'nothing'}; in the snapshot only ${onlyB.join('; ') || 'nothing'}`);
  if ([...root].sort().join() !== [...foldSnap.root].sort().join()) fails.push(`folders: the checkout's ${prefix} holds ${root.join(', ')} at its top; the snapshot ${foldSnap.root.join(', ')}`);
} else {
  console.log('  note  folders: no schema-dist checkout given (OW_SCHEMA_DIST), so the figure is held to the snapshot only');
}
// Every one of the example's real files is the name the rule gives.
const exCount = {};
for (const e of exSource.elements) {
  exCount[e.kind] = (exCount[e.kind] ?? 0) + 1;
  if (ruleFile(e.name, e.id) !== e.file) fails.push(`folders: the example's elements/${e.kind}/${e.file} is not the name the rule gives (${ruleFile(e.name, e.id)})`);
}
// The tree as drawn: the root entries, the category folders with their counts, the opened folder.
const treeKinds = [...ff[1].matchAll(/<div\b[^>]*\bdata-kind="([^"]*)"[^>]*\bdata-count="(\d+)"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => ({ kind: m[1], count: Number(m[2]), text: strip(m[3]) }));
if (!treeKinds.length) fails.push('folders: the figure draws no category folders (data-kind)');
for (const t of treeKinds) {
  if (!ELEMENT_TYPES.includes(t.kind)) fails.push(`folders: the figure draws a ${t.kind}/ folder, and ${t.kind} is not one of the SDK's ${ELEMENT_TYPES.length} categories`);
  if (t.count !== (exCount[t.kind] ?? 0)) fails.push(`folders: the figure draws ${t.kind}/ with ${t.count} files; ${exSource.from} has ${exCount[t.kind] ?? 0}`);
  if (t.text !== `${t.kind}/ ${t.count} file${t.count === 1 ? '' : 's'}`) fails.push(`folders: the ${t.kind}/ line reads "${t.text}" for ${t.count} files`);
}
const drawnKinds = treeKinds.map((t) => t.kind);
for (const k of Object.keys(exCount)) if (!drawnKinds.includes(k)) fails.push(`folders: the example has elements/${k}/ (${exCount[k]} files), and the figure does not draw it`);
const cpSorted = [...drawnKinds].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
if (drawnKinds.join() !== cpSorted.join()) fails.push(`folders: the category folders are not drawn in code point order: ${drawnKinds.join(', ')}`);
const rootDrawn = [...ff[1].matchAll(/<div\b[^>]*\bdata-line="root"[^>]*\bdata-name="([^"]*)"/g)].map((m) => unescape(m[1]));
if ([...rootDrawn].sort().join() !== [...exSource.root].sort().join()) fails.push(`folders: the figure draws ${rootDrawn.join(', ') || 'nothing'} at the folder's top; ${exSource.from} holds ${exSource.root.join(', ')}`);
if (!/data-line="elements"[^>]*>elements\/<\/div>/.test(ff[1])) fails.push('folders: the figure draws no elements/ folder');
// The opened folder lists exactly that category's files, each its rule-given name.
const opened = [...ff[1].matchAll(/<div\b[^>]*\bdata-file="([^"]*)"[^>]*\bdata-id="([^"]*)"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => ({ file: unescape(m[1]), id: m[2], text: strip(m[3]) }));
const openedKind = exSource.elements.find((e) => e.id === opened[0]?.id)?.kind;
if (!opened.length || !openedKind) fails.push('folders: the figure opens no folder of the example\'s files');
else {
  const want = exSource.elements.filter((e) => e.kind === openedKind).map((e) => e.file).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  if (opened.map((o) => o.file).join() !== want.join()) fails.push(`folders: the opened ${openedKind}/ folder lists ${opened.map((o) => o.file).join(', ')}; the example's are ${want.join(', ')}`);
  for (const o of opened) {
    const e = exSource.elements.find((x) => x.id === o.id && x.file === o.file);
    if (o.text !== o.file) fails.push(`folders: a file line reads "${o.text}" for ${o.file}`);
    if (!e) fails.push(`folders: the opened folder lists ${o.file} (${o.id}), which is not an element file of the example`);
    else if (ruleFile(e.name, e.id) !== o.file) fails.push(`folders: the opened folder lists ${o.file}; the rule gives ${ruleFile(e.name, e.id)} for ${e.name}`);
  }
}
// The derivations: each shown name and id gives the shown file by the rule, its colours mark the
// slug and the tail the rule gives, and the three together are a real element of the example.
const derivations = [...ff[1].matchAll(/<dl\b[^>]*\bdata-derivation[^>]*>([\s\S]*?)<\/dl>/g)].map((m) => {
  const dd = (part) => m[1].match(new RegExp(`<dd\\b[^>]*\\bdata-part="${part}"[^>]*>([\\s\\S]*?)</dd>`))?.[1] ?? '';
  const span = (html, cls) => strip(html.match(new RegExp(`<span\\b[^>]*class="${cls}\\b[^"]*"[^>]*>([^<]*)</span>`))?.[1] ?? '');
  return { name: strip(dd('name')), id: strip(dd('id')), file: strip(dd('file')), idTail: span(dd('id'), 'ow-fold-tail'), fileSlug: span(dd('file'), 'ow-fold-slug'), fileTail: span(dd('file'), 'ow-fold-tail') };
});
if (!derivations.length) fails.push('folders: the figure shows no derivation (data-derivation)');
for (const d of derivations) {
  if (ruleFile(d.name, d.id) !== d.file) fails.push(`folders: the derivation of "${d.name}" (${d.id}) shows ${d.file}; the rule gives ${ruleFile(d.name, d.id)}`);
  if (d.fileSlug !== ruleSlug(d.name)) fails.push(`folders: the derivation of "${d.name}" marks the slug ${d.fileSlug}; the rule gives ${ruleSlug(d.name)}`);
  if (d.idTail !== ruleTail(d.id) || d.fileTail !== ruleTail(d.id)) fails.push(`folders: the derivation of "${d.name}" marks the tail ${d.idTail} in the id and ${d.fileTail} in the file; the id's last ${tailN} are ${ruleTail(d.id)}`);
  if (!exSource.elements.some((e) => e.id === d.id && e.name === d.name && e.file === d.file)) fails.push(`folders: the derivation of "${d.name}" (${d.id}, ${d.file}) is not an element of the example in ${exSource.from}`);
}
// The figure's own words: its rule line states the paragraph's numbers; its caption counts the source.
const foldRule = strip(ff[1].match(/<p\b[^>]*class="ow-fold-rule\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
if (!foldRule.includes(`cut to ${cutN} characters`) || !foldRule.includes(`then ${sep}; then the id's last ${tailN} characters`)) fails.push(`folders: the figure's rule line does not state the paragraph's cut ${cutN}, separator ${sep} and tail ${tailN}: "${foldRule}"`);
const foldCap = strip(ff[1].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? '');
const capWant = `(serial ${exSource.serial}, example/${foldSnap.folder}), when the docs are built: ${exSource.elements.length} element files in ${Object.keys(exCount).length} of the ${ELEMENT_TYPES.length} category folders`;
if (!foldCap.includes(capWant)) fails.push(`folders: the caption does not say "${capWant}": "${foldCap}"`);
// Nothing the figure shows contradicts the page's Layout block: its top entries are named there,
// and the block's category folders are one per category present, lowercase singular.
const layoutAt = foldPage.indexOf('id="layout"');
const layoutPre = layoutAt < 0 ? '' : foldPage.slice(layoutAt).match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)?.[1] ?? '';
const layoutLines = layoutPre.split(/<div class="ec-line">/).map((l) => unescape(l.replace(/<[^>]+>/g, '')).replace(/\n/g, '')).filter(Boolean);
if (!layoutLines.length) fails.push('folders: no Layout block read on the page');
for (const r of [...rootDrawn, 'elements/']) if (!layoutLines.some((l) => l.startsWith(`  ${r}`) && !l.startsWith('   '))) fails.push(`folders: the figure draws ${r} at the folder's top, and the Layout block does not`);
if (!layoutLines.some((l) => /one folder per category present, lowercase singular/.test(l))) fails.push('folders: the Layout block no longer says one folder per category present, lowercase singular; recheck the figure against it');
for (const k of drawnKinds) if (!/^[a-z]+$/.test(k)) fails.push(`folders: the figure draws a ${k}/ folder, not a lowercase singular category name`);
// The Markdown twin: the same tree counts and derivations, by the same rule.
if (/^<FolderExample \/>$/m.test(foldTwin)) fails.push('folders: the Markdown twin carries the bare tag, not the text');
else {
  const twinTree = foldTwin.slice(foldTwin.indexOf(`\n${foldSnap.folder}/\n`));
  const twinKinds = [...twinTree.split('```')[0].matchAll(/^ {4}([a-z]+)\/ +(\d+) files?$/gm)].map((m) => `${m[1]} ${m[2]}`);
  const wantKinds = Object.keys(exCount).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).map((k) => `${k} ${exCount[k]}`);
  if (twinKinds.join() !== wantKinds.join()) fails.push(`folders: the twin's tree reads ${twinKinds.join(', ') || 'nothing'}; ${exSource.from} has ${wantKinds.join(', ')}`);
  const twinDer = [...foldTwin.matchAll(/^- \*\*(.+?)\*\*, id `([^`]+)`: `([^`]+)`$/gm)].map((m) => ({ name: m[1], id: m[2], file: m[3] }));
  if (twinDer.map((d) => d.id).join() !== derivations.map((d) => d.id).join()) fails.push(`folders: the twin shows ${twinDer.length} derivations, not the figure's ${derivations.length}`);
  for (const d of twinDer) {
    if (ruleFile(d.name, d.id) !== d.file) fails.push(`folders: the twin derives ${d.file} from "${d.name}"; the rule gives ${ruleFile(d.name, d.id)}`);
    if (!exSource.elements.some((e) => e.id === d.id && e.name === d.name && e.file === d.file)) fails.push(`folders: the twin's derivation of "${d.name}" is not an element of the example`);
  }
}
console.log(`world folder: ${exSource.elements.length} example files in ${Object.keys(exCount).length} folders from ${exSource.from}, each named by the page's rule (cut ${cutN}, separator ${sep}, tail ${tailN}) reimplemented here; ${treeKinds.length} folders drawn, ${opened.length} files in the opened one, ${derivations.length} derivations, the twin held to the same`);

// ---- the credentials ----
// Recounted here from the snapshot with code of its own (not callers.mjs): each alternative's
// schemes to a column, each path to its family, each drawn route expanded back to operations.
// In a block of its own: its names stay its own.
{
const apiPage =read('docs/development/api-reference.html');
const apiTwin = read('docs/development/api-reference.md');
const af = apiPage.match(/<figure\b[^>]*\bdata-ow-figure="callers"[^>]*>([\s\S]*?)<\/figure>/);
if (!af) blind('the API overview carries no credentials figure (data-ow-figure="callers")');
const callSnap = JSON.parse(readFileSync(join(DIST, '..', 'contract', 'callers.json'), 'utf8'));
if (!callSnap.operations?.length) blind('contract/callers.json holds no operations');
const COLS = ['none', 'key', 'keypin', 'account'];
const SCHEME_COL = { '': 'none', ApiKey: 'key', 'ApiKey+ApiPin': 'keypin', AccountToken: 'account' };
const opKey = (m, p) => `${m} ${p}`;
const want = new Map();   // "GET /api/v2/x" -> { fam, cols, mark, session }
for (const [m, p, sec] of callSnap.operations) {
  const seg = p.split('/')[3];
  const fam = ELEMENT_TYPES.includes(seg) ? '{type}' : seg;
  let cols = new Set(), mark = 'list', session = false;
  if (sec === null) { cols.add('none'); mark = 'absent'; }
  else if (sec.length === 0) { cols.add('none'); mark = 'empty'; }
  else for (const alt of sec) {
    const s = [...alt].sort().join('+');
    if (s === 'SessionToken') session = true;
    else if (SCHEME_COL[s]) cols.add(SCHEME_COL[s]);
    else fails.push(`credentials: ${m} ${p} lists ${s}, which no column of the figure is`);
  }
  if (session && !cols.has('account')) fails.push(`credentials: ${m} ${p} takes a session token and no account token, so the account token column does not hold it`);
  want.set(opKey(m, p), { fam, cols: COLS.filter((c) => cols.has(c)), mark, session });
}
const wantFams = new Map();
for (const w of want.values()) {
  if (!wantFams.has(w.fam)) wantFams.set(w.fam, { total: 0, cells: Object.fromEntries(COLS.map((c) => [c, 0])) });
  const f = wantFams.get(w.fam);
  f.total++;
  for (const c of w.cols) f.cells[c]++;
}
const famOrder = [...wantFams].sort((x, y) => y[1].total - x[1].total || (`/${x[0]}` < `/${y[0]}` ? -1 : 1)).map(([k]) => k);
// the column words as the figure's header draws them, to read the twin by
const colLabel = Object.fromEntries([...af[1].matchAll(/<span\b[^>]*role="columnheader"[^>]*data-cred="([a-z]+)"[^>]*>([\s\S]*?)<\/span>/g)].map((h) => [h[1], strip(h[2])]));
if (Object.keys(colLabel).join() !== COLS.join()) fails.push(`credentials: the header's columns are ${Object.keys(colLabel).join(', ')}; the check knows ${COLS.join(', ')}`);
// a drawn route back to its operations: {type} is each of the SDK's categories
const expand = (route, n, where) => {
  const [m, p] = route.split(' ');
  const ops = p.startsWith('/api/v2/{type}') ? ELEMENT_TYPES.map((t) => opKey(m, p.replace('/api/v2/{type}', `/api/v2/${t}`))) : [opKey(m, p)];
  if (ops.length !== n) fails.push(`credentials: ${where} draws ${route} as ${n} operation(s); it stands for ${ops.length}`);
  return ops;
};
const seen = new Map();
const drawnFams = [];
for (const fb of af[1].split(/(?=<div\b[^>]*\bclass="ow-call-fam\b)/).slice(1)) {
  const fam = attr(fb.match(/^<div\b[^>]*>/)[0], 'data-family');
  drawnFams.push(fam);
  const wf = wantFams.get(fam);
  if (!wf) { fails.push(`credentials: the figure draws a family ${fam}, which no operation in the snapshot is in`); continue; }
  const famRow = fb.match(/<div\b[^>]*class="ow-call-row ow-call-famrow\b[\s\S]*?(?=<div\b[^>]*class="ow-call-row ow-call-grp\b|$)/)?.[0] ?? '';
  if (Number(attr(fb.match(/^<div\b[^>]*>/)[0], 'data-total')) !== wf.total) fails.push(`credentials: ${fam} is marked ${attr(fb, 'data-total')} operations; the snapshot has ${wf.total}`);
  for (const c of COLS) {
    const cell = famRow.match(new RegExp(`<span\\b[^>]*data-cred="${c}"[^>]*>([\\s\\S]*?)</span>\\s*(?=<span\\b[^>]*class="ow-call-(?:cell|all)\\b)`));
    const shownN = cell ? Number(strip(cell[1])) : NaN;
    if (shownN !== wf.cells[c]) fails.push(`credentials: ${fam} shows ${cell ? strip(cell[1]) : 'nothing'} under ${colLabel[c] ?? c}; the snapshot gives ${wf.cells[c]}`);
  }
  const famAll = strip(famRow.match(/<span\b[^>]*class="ow-call-all\b[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
  if (Number(famAll) !== wf.total) fails.push(`credentials: ${fam}'s All reads ${famAll}; the snapshot gives ${wf.total}`);
  for (const gb of fb.split(/(?=<div\b[^>]*\bclass="ow-call-row ow-call-grp\b)/).slice(1)) {
    const tag = gb.match(/^<div\b[^>]*>/)[0];
    const routes = [...gb.matchAll(/<li\b[^>]*data-route="([^"]+)"[^>]*data-ops="(\d+)"[^>]*>([\s\S]*?)<\/li>/g)];
    const dots = COLS.filter((c) => /ow-call-dot/.test(gb.match(new RegExp(`<span\\b[^>]*data-cred="${c}"[^>]*>([\\s\\S]*?)</span>\\s*(?=<span\\b[^>]*class="ow-call-(?:cell|all)\\b)`))?.[1] ?? ''));
    const takes = COLS.filter((c) => new RegExp(`data-cred="${c}"[^>]*data-takes="yes"`).test(gb));
    if (dots.join() !== takes.join()) fails.push(`credentials: a ${fam} group paints dots under ${dots.join(', ')} and says it takes ${takes.join(', ')}`);
    const marks = { absent: /data-mark="absent"/.test(gb), session: /data-mark="session"/.test(gb) };
    let n = 0;
    for (const [, route, ops, inner] of routes) {
      const shown = strip(inner);
      const short = unescape(route).replace(' /api/v2/', ' /');
      if (shown.replace(/\s/g, '') !== `${short}${Number(ops) > 1 ? `×${ops}` : ''}`.replace(/\s/g, '')) fails.push(`credentials: the route ${route} reads "${shown}"`);
      for (const k of expand(unescape(route), Number(ops), `the ${fam} group`)) {
        n++;
        seen.set(k, (seen.get(k) ?? 0) + 1);
        const w = want.get(k);
        if (!w) { fails.push(`credentials: draws ${k}, which is not in the snapshot`); continue; }
        if (w.fam !== fam) fails.push(`credentials: draws ${k} under ${fam}; its family is ${w.fam}`);
        if (w.cols.join() !== dots.join()) fails.push(`credentials: draws ${k} as taking ${dots.join(', ') || 'nothing'}; the document lists ${w.cols.join(', ')}`);
        if ((w.mark === 'absent') !== marks.absent) fails.push(`credentials: ${k} ${w.mark === 'absent' ? 'states no security, unmarked' : 'is marked as stating no security, and does'}`);
        if (w.session !== marks.session) fails.push(`credentials: ${k} ${w.session ? 'takes a session token, unmarked' : 'is marked as taking a session token, and does not'}`);
      }
    }
    if (Number(attr(tag, 'data-ops')) !== n || Number(strip(gb.match(/<span\b[^>]*class="ow-call-all\b[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '')) !== n) fails.push(`credentials: a ${fam} group counts ${attr(tag, 'data-ops')} operations and lists ${n}`);
  }
}
for (const [k, c] of seen) if (c > 1) fails.push(`credentials: draws ${k} ${c} times`);
for (const k of want.keys()) if (!seen.has(k)) fails.push(`credentials: ${k} is in the snapshot and not drawn`);
if (drawnFams.join() !== famOrder.join()) fails.push(`credentials: families drawn ${drawnFams.join(', ')}; by count they are ${famOrder.join(', ')}`);
const colTotal = Object.fromEntries(COLS.map((c) => [c, [...want.values()].filter((w) => w.cols.includes(c)).length]));
const sumRow = af[1].match(/<div\b[^>]*class="ow-call-row ow-call-sum\b[\s\S]*$/)?.[0] ?? '';
for (const c of COLS) {
  const got = Number(strip(sumRow.match(new RegExp(`<span\\b[^>]*data-cred="${c}"[^>]*>([\\s\\S]*?)</span>\\s*(?=<span\\b)`))?.[1] ?? ''));
  if (got !== colTotal[c]) fails.push(`credentials: the All row shows ${got} under ${colLabel[c] ?? c}; the snapshot gives ${colTotal[c]}`);
}
if (Number(strip(sumRow.match(/<span\b[^>]*class="ow-call-all\b[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '')) !== want.size) fails.push(`credentials: the All row does not total ${want.size} operations`);
// the words
const keylessOps = [...want].filter(([, w]) => w.cols.includes('none') && w.cols.length > 1).map(([k]) => k);
const callLead = strip(af[1].match(/<p\b[^>]*class="ow-call-lead\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
const cl = callLead.match(/^(\d+) operations in (\d+) route families\. Each counts under every credential the API document lists for it\. (\d+) take no key as well as a key or an account token: the keyless reads of a world open to anyone\.$/);
if (!cl) fails.push(`credentials: the lead does not read as its counts: "${callLead}"`);
else if (Number(cl[1]) !== want.size || Number(cl[2]) !== wantFams.size || Number(cl[3]) !== keylessOps.length) fails.push(`credentials: the lead says ${cl[1]} operations, ${cl[2]} families, ${cl[3]} keyless; the snapshot gives ${want.size}, ${wantFams.size}, ${keylessOps.length}`);
// "the keyless reads": the same operations as the public worlds page's table of them
const kAt = pubPage.indexOf('id="the-keyless-reads"');
const kTable = kAt < 0 ? '' : pubPage.slice(kAt, pubPage.indexOf('</table>', kAt));
const kRoutes = [...kTable.matchAll(/<code[^>]*>(\/api\/v2\/[^<]*)<\/code>/g)].map((x) => unescape(x[1]));
if (!kRoutes.length) fails.push('credentials: no /api/v2/ route read from the public worlds page\'s keyless reads table');
const kPage = kRoutes.flatMap((p) => (p.startsWith('/api/v2/{type}') ? ELEMENT_TYPES.map((t) => opKey('GET', p.replace('{type}', t))) : [opKey('GET', p)])).sort();
if (kPage.join() !== [...keylessOps].sort().join()) fails.push(`credentials: the operations listing no key beside a key (${keylessOps.length}) are not the public worlds page's keyless reads (${kPage.length}): ${[...kPage.filter((k) => !keylessOps.includes(k)), ...keylessOps.filter((k) => !kPage.includes(k))].slice(0, 4).join(', ')}`);
const absentN = [...want.values()].filter((w) => w.mark === 'absent').length;
const sessionN = [...want.values()].filter((w) => w.session).length;
const callKey = strip(af[1].match(/<p\b[^>]*class="ow-call-key\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
if (absentN && !callKey.includes(`${absentN} operation${absentN === 1 ? '' : 's'}, marked, state${absentN === 1 ? 's' : ''} no security at all`)) fails.push(`credentials: the key does not count the ${absentN} operations that state no security: "${callKey}"`);
if (!callKey.includes(`Account token: ${sessionN} of these also take`)) fails.push(`credentials: the key does not count the ${sessionN} operations that take a session token: "${callKey}"`);
const callCap = strip(af[1].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? '');
if (!callCap.includes(`as read on ${callSnap.read_at}.`) || !callCap.includes(`any of the ${ELEMENT_TYPES.length} categories`)) fails.push(`credentials: the caption does not give the snapshot's day ${callSnap.read_at} and the ${ELEMENT_TYPES.length} categories: "${callCap}"`);
// the lens routes take an account token and are never keyless (keel's rule, stated on the changelog)
const lensOps = [...want].filter(([k]) => k.endsWith('/lenses'));
if (!lensOps.length) fails.push('credentials: no lens route in the snapshot');
for (const [k, w] of lensOps) if (!w.cols.includes('account') || w.cols.includes('none')) fails.push(`credentials: ${k} lists ${w.cols.join(', ')}; a lens route takes an account token and is never keyless`);
// the Markdown twin: the same table and the same routes under the same credentials
if (/^<ApiCallers \/>$/m.test(apiTwin)) fails.push('credentials: the Markdown twin carries the bare tag, not the text');
else {
  const twinRows = [...apiTwin.matchAll(/^\| `\/([^`]+)` \|((?: [0-9]* \|){5})$/gm)].map((r) => [r[1], r[2].split('|').slice(0, 5).map((x) => Number(x.trim() || 0))]);
  const rowsWant = famOrder.map((f) => [f, [...COLS.map((c) => wantFams.get(f).cells[c]), wantFams.get(f).total]]);
  if (JSON.stringify(twinRows) !== JSON.stringify(rowsWant)) fails.push(`credentials: the twin's table reads ${twinRows.map(([f, v]) => `${f} ${v.join('/')}`).join('; ') || 'nothing'}`);
  const byLabel = Object.fromEntries(Object.entries(colLabel).map(([c, l]) => [l, c]));
  const twinSeen = new Map();
  for (const [, fam, labels, rest] of apiTwin.matchAll(/^- \*\*`\/([^`]+)`\*\*, ([A-Za-z ,]+?)(?: \([^)]*\))?: (.*)$/gm)) {
    const cols = labels.split(', ').map((l) => byLabel[l] ?? `?${l}`);
    for (const [, route, , times] of rest.matchAll(/`([A-Z]+ \/[^`]*)`( \(×(\d+)\))?/g)) {
      const full = route.replace(' /', ' /api/v2/');
      for (const k of expand(full, Number(times ?? 1), 'the twin')) {
        twinSeen.set(k, (twinSeen.get(k) ?? 0) + 1);
        if (want.get(k)?.cols.join() !== cols.join() || want.get(k)?.fam !== fam) fails.push(`credentials: the twin lists ${k} under ${fam} as ${cols.join(', ')}; the snapshot gives ${want.get(k)?.fam} ${want.get(k)?.cols.join(', ')}`);
      }
    }
  }
  if (twinSeen.size !== want.size || [...twinSeen.values()].some((c) => c !== 1)) fails.push(`credentials: the twin lists ${twinSeen.size} operations (each once?); the snapshot has ${want.size}`);
}
console.log(`credentials: ${seen.size} operations drawn in ${drawnFams.length} families from contract/callers.json (read ${callSnap.read_at}), recounted here; ${keylessOps.length} keyless reads held to the public worlds page's table, the lens routes to keel's rule, the twin the same`);
// the snapshot against the live document (fetched above for the Retry-After check)
if (doc) {
  const cpo = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
  const live = [];
  for (const [p, item] of Object.entries(doc.paths ?? {})) for (const m of ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']) {
    if (!item[m]) continue;
    const sec = item[m].security ?? doc.security ?? null;
    live.push([m.toUpperCase(), p, sec === null ? null : sec.map((r) => Object.keys(r).sort(cpo))]);
  }
  const liveMap = new Map(live.map(([m, p, s]) => [opKey(m, p), JSON.stringify(s)]));
  const snapMap = new Map(callSnap.operations.map(([m, p, s]) => [opKey(m, p), JSON.stringify(s)]));
  const drift = [
    ...[...liveMap.keys()].filter((k) => !snapMap.has(k)).map((k) => `${k} is in the live document, not the snapshot`),
    ...[...snapMap.keys()].filter((k) => !liveMap.has(k)).map((k) => `${k} is in the snapshot, not the live document`),
    ...[...liveMap].filter(([k, s]) => snapMap.has(k) && snapMap.get(k) !== s).map(([k, s]) => `${k} lists ${s} live, ${snapMap.get(k)} in the snapshot`),
  ];
  const liveSchemes = Object.keys(doc.components?.securitySchemes ?? {}).sort(cpo).join();
  if (liveSchemes !== Object.keys(callSnap.schemes).join()) drift.push(`the live document's schemes are ${liveSchemes}; the snapshot's ${Object.keys(callSnap.schemes).join()}`);
  // Printed, never failed: a keel route change must not block an unrelated docs deploy (the errors
  // snapshot is the same: CI warns). The weekly sweep's check 2c fails on it, and SWEEP.md rule 1
  // says to refresh the same hour.
  for (const d of drift.slice(0, 5)) console.log(`  STALE  credentials snapshot (node scripts/gen_callers.mjs --refresh): ${d}`);
  if (drift.length > 5) console.log(`  STALE  credentials: … and ${drift.length - 5} more differences from the live document`);
  console.log(`credentials: the snapshot held to the live API document, ${live.length} operations`);
} else {
  console.log('CANNOT SEE: the live API document (see above); the credentials snapshot was not compared with it');
}
}

// ---- the sign-in steps ----
// Read here with code of its own (not signin.mjs): each hop's ends, route, parameters and fields
// from the built figure, against the snapshot and against the page's own words around it. In a
// block of its own: its names stay its own.
{
const sPage = read('docs/development/api/signin.html');
const sTwin = read('docs/development/api/signin.md');
const sf = sPage.match(/<figure\b[^>]*\bdata-ow-figure="signin"[^>]*>([\s\S]*?)<\/figure>/);
if (!sf) blind('the sign-in page carries no sign-in figure (data-ow-figure="signin")');
const sSnap = JSON.parse(readFileSync(join(DIST, '..', 'contract', 'signin.json'), 'utf8'));
const sa = sSnap.authorize, st = sSnap.token;
if (!sa?.params?.length || !st?.body?.length || !st?.answer?.length) blind('contract/signin.json holds no authorize parameters, token fields or answer');
const bad = (m) => fails.push(`sign-in: ${m}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const authPath = new URL(sa.url).pathname;
// a hop: its own tag, and its body up to the next hop, box or step (a field is an <li> too)
const hop = (name) => {
  const at = sf[1].search(new RegExp(`<div\\b[^>]*\\bdata-hop="${name}"`));
  if (at < 0) { bad(`the figure draws no ${name} hop`); return { tag: '', body: '', codes: [] }; }
  const rest = sf[1].slice(at);
  const end = rest.slice(1).search(/<div\b[^>]*\bclass="ow-sig-(?:hop|box)\b|<li\b[^>]*\bclass="ow-sig-step\b|<\/ol>/);
  const body = end < 0 ? rest : rest.slice(0, end + 1);
  const codes = [...body.matchAll(/<code\b([^>]*)>([\s\S]*?)<\/code>/g)].map((c) => ({ at: c[1], text: strip(c[2]) }));
  return { tag: body.match(/^<div\b[^>]*>/)[0], body, codes };
};
const ends = (h, name, from, to) => { if (attr(h.tag, 'data-from') !== from || attr(h.tag, 'data-to') !== to) bad(`the ${name} hop runs ${attr(h.tag, 'data-from')} → ${attr(h.tag, 'data-to')}, not ${from} → ${to}`); };
const routeOf = (h, name, want) => {
  const declared = unescape(attr(h.tag, 'data-route') ?? '');
  const shown = h.codes.find((c) => /\bclass="ow-sig-route\b/.test(c.at))?.text;
  if (declared !== want) bad(`the ${name} hop declares ${declared || 'no route'}; ${want} is the snapshot's`);
  if (shown !== declared) bad(`the ${name} hop shows ${shown} and declares ${declared}`);
};
const ticks = (s) => [...(s ?? '').matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const listed = (h, key) => h.codes.filter((c) => attr(c.at, key) !== undefined).map((c) => ({ name: attr(c.at, key), value: attr(c.at, 'data-value'), prefix: attr(c.at, 'data-prefix'), text: c.text }));

ends(hop('send'), 'send', 'tool', 'browser');
const auth = hop('authorize');
ends(auth, 'authorize', 'browser', 'site');
routeOf(auth, 'authorize', `GET ${authPath}`);
const params = listed(auth, 'data-param');
if (!same(params.map((p) => p.name), sa.params)) bad(`the authorize hop names ${params.map((p) => p.name).join(', ')}; the snapshot's parameters are ${sa.params.join(', ')}`);
for (const p of params) {
  const value = p.name === 'code_challenge_method' ? sa.method : undefined;
  if (p.value !== value) bad(`the authorize hop gives ${p.name} the value ${p.value}; the snapshot gives ${value}`);
  if (p.text !== (value ? `${p.name}=${value}` : p.name)) bad(`the authorize hop shows "${p.text}" for ${p.name}`);
}
const redirect = hop('redirect');
ends(redirect, 'redirect', 'site', 'browser');
if (redirect.codes.find((c) => attr(c.at, 'data-status'))?.text !== '302') bad('the redirect hop does not show its 302');
const back = hop('return');
ends(back, 'return', 'browser', 'tool');
const backCode = back.codes.find((c) => attr(c.at, 'data-back') !== undefined);
if (!backCode || attr(backCode.at, 'data-back') !== sa.back.join(' ') || backCode.text !== `redirect_uri?${sa.back.map((k) => `${k}=…`).join('&')}`) bad(`the return hop shows ${backCode?.text}; the snapshot's query is ${sa.back.join(', ')}`);
const cancel = back.codes.find((c) => attr(c.at, 'data-error') !== undefined);
const cancelErr = cancel && attr(cancel.at, 'data-error');
if (!cancel || cancel.text !== `redirect_uri?error=${cancelErr}&state=…`) bad(`the Cancel address reads "${cancel?.text}" for the error ${cancelErr}`);
const lifeTag = back.body.match(/<p\b[^>]*\bdata-seconds="(\d+)"[^>]*>([\s\S]*?)<\/p>/);
if (!lifeTag || Number(lifeTag[1]) !== st.code_seconds || !strip(lifeTag[2]).includes(`${st.code_seconds} seconds`)) bad(`the code's lifetime reads "${lifeTag ? strip(lifeTag[2]) : 'nothing'}" (${lifeTag?.[1]}); the snapshot gives ${st.code_seconds} seconds`);
if (Number(attr(sf[0].match(/^<figure\b[^>]*>/)[0], 'data-seconds')) !== st.code_seconds) bad(`the figure is marked ${attr(sf[0], 'data-seconds')} seconds; the snapshot gives ${st.code_seconds}`);
const tok = hop('token');
ends(tok, 'token', 'tool', 'site');
routeOf(tok, 'token', `${st.method} ${st.path}`);
// "no credential": the operation lists no security, or only the empty alternative
const takesNone = Array.isArray(st.security) && st.security.every((alt) => !Object.keys(alt ?? {}).length);
if ((attr(tok.tag, 'data-credential') === 'none') !== takesNone || /data-mark="no-credential"/.test(tok.body) !== takesNone) bad(`the token hop ${takesNone ? 'does not say it takes no credential' : 'says it takes no credential'}; the snapshot's security is ${JSON.stringify(st.security)}`);
const body = listed(tok, 'data-field');
if (!same(body.map((f) => f.name), st.body) || body.some((f) => f.text !== f.name)) bad(`the token hop posts ${body.map((f) => f.text).join(', ')}; the snapshot's body is ${st.body.join(', ')}`);
if (!same([...st.required].sort(), [...st.body].sort())) bad(`the figure draws every body field as sent; the document requires only ${st.required.join(', ')}`);
const ans = hop('answer');
ends(ans, 'answer', 'site', 'tool');
if (ans.codes.find((c) => attr(c.at, 'data-status'))?.text !== '200') bad('the answer hop does not show its 200');
const answer = listed(ans, 'data-field');
if (!same(answer.map((f) => f.name), st.answer) || answer.some((f) => f.text !== f.name)) bad(`the answer hop shows ${answer.map((f) => f.text).join(', ')}; the snapshot's answer is ${st.answer.join(', ')}`);
const tokenField = answer.find((f) => f.name === 'token');
if (tokenField?.prefix !== st.prefix || !ans.codes.some((c) => c.text === `${st.prefix}…`)) bad(`the token shows the prefix ${tokenField?.prefix}; the snapshot gives ${st.prefix}`);
const refused = sf[1].match(/<p\b[^>]*\bclass="ow-sig-refused\b[^>]*\bdata-status="(\d+)"[^>]*>([\s\S]*?)<\/p>/);
if (!refused || !strip(refused[2]).includes(`a ${refused[1]} page`)) bad(`the refused note reads "${refused ? strip(refused[2]) : 'nothing'}"`);

// The page's own words, from its Markdown twin (the same source, unrendered).
const section = (head, next) => { const at = sTwin.indexOf(`\n## ${head}\n`); return at < 0 ? '' : sTwin.slice(at, next ? sTwin.indexOf(`\n## ${next}\n`, at) : undefined); };
const sending = section('Sending the person to sign in', 'Trading the code');
const trading = section('Trading the code', 'Errors');
if (!sending || !trading) bad('the twin has no "Sending the person to sign in" or "Trading the code" section');
const firstCells = (s, head) => {
  const at = s.indexOf(head);
  if (at < 0) return [];
  return s.slice(at).split('\n').slice(2).filter((l) => l.startsWith('|')).map((l) => l.split('|')[1].trim());
};
const pageParams = firstCells(sending, '| Parameter | Meaning |');
if (!same(pageParams, sa.params.map((p) => `\`${p}\``))) bad(`the page's parameter table lists ${pageParams.join(', ') || 'nothing'}; the figure and the snapshot name ${sa.params.join(', ')}`);
const intro = sending.match(/sends the browser to `([^`]+)` with (\w+) query parameters/);
if (!intro || intro[1] !== sa.url || intro[2] !== (WORD[sa.params.length] ?? String(sa.params.length))) bad(`the page sends the browser to ${intro?.[1]} with ${intro?.[2]} parameters; the snapshot gives ${sa.url} with ${sa.params.length}`);
if (!new RegExp(`^\\| \`code_challenge_method\` \\| \`${sa.method}\`\\.`, 'm').test(sending)) bad(`the page's code_challenge_method row does not give \`${sa.method}\` first`);
const pageFields = firstCells(trading, '| Field | Meaning |').flatMap((c) => c.split(', '));
if (!same(pageFields, st.body.map((f) => `\`${f}\``))) bad(`the page's body table lists ${pageFields.join(', ') || 'nothing'}; the figure and the snapshot post ${st.body.join(', ')}`);
if (!new RegExp(`^\\| \`grant_type\` \\| \`${st.grant_type}\` \\|$`, 'm').test(trading)) bad(`the page's grant_type row does not read \`${st.grant_type}\``);
const curl = trading.match(/curl -s -X (\w+) "https:\/\/www\.onlyworlds\.com([^"]+)"/);
if (!curl || `${curl[1]} ${curl[2]}` !== `${st.method} ${st.path}`) bad(`the page's exchange example sends ${curl ? `${curl[1]} ${curl[2]}` : 'nothing'}; the snapshot's route is ${st.method} ${st.path}`);
if (trading.includes(`\`${st.method} ${st.path}\`, as JSON, with no credential`) !== takesNone) bad(`the page ${takesNone ? 'does not say' : 'says'} the exchange takes no credential; the snapshot's security is ${JSON.stringify(st.security)}`);
let example = null;
try { example = JSON.parse(trading.match(/```json\n(\{ "token"[\s\S]*?)\n```/)?.[1] ?? 'null'); } catch { /* reported below */ }
if (!example || !same(Object.keys(example), st.answer) || !String(example.token).startsWith(st.prefix)) bad(`the page's answer example has ${example ? Object.keys(example).join(', ') : 'no JSON'}; the snapshot's answer is ${st.answer.join(', ')}, the token ${st.prefix}…`);
const life = sTwin.match(/\*\*A code lives (\d+) seconds and is spent by its first exchange,\*\*/);
if (!life || Number(life[1]) !== st.code_seconds) bad(`the page says a code lives ${life?.[1]} seconds; the snapshot gives ${st.code_seconds}`);
const pageCancel = sTwin.match(/Cancel sends `redirect_uri\?error=([a-z_]+)&state=…`/)?.[1];
if (pageCancel !== cancelErr) bad(`the page's Cancel goes back with ${pageCancel}; the figure's with ${cancelErr}`);
const pagePrefix = sTwin.match(/trades the code once for an `(ow_[a-z]+_)` \[account token\]/)?.[1];
if (pagePrefix !== st.prefix) bad(`the page's opening names the token ${pagePrefix}; the snapshot ${st.prefix}`);
if (refused && !sending.includes(`answers a \`${refused[1]}\` page on onlyworlds.com`)) bad(`the figure's refused request gets a ${refused[1]} page; the page does not say so`);
// The twin carries the figure as text: the same route, parameters and fields.
if (/^<SigninSteps \/>$/m.test(sTwin)) bad('the Markdown twin carries the bare tag, not the text');
else {
  const t1 = sTwin.match(/^1\. \*\*Send\.\*\* .*? to `GET ([^`]+)` on \S+ with (.*)\.$/m);
  const t4 = sTwin.match(/^4\. \*\*Trade\.\*\* The tool posts (.*?) to `(\w+ [^`]+)`, no credential\. The answer, `200`: (.*)\.$/m);
  if (!t1 || t1[1] !== authPath || !same(ticks(t1[2]).map((p) => p.split('=')[0]), sa.params)) bad(`the twin's step 1 reads ${t1?.[0] ?? 'nothing'}`);
  if (!t4 || t4[2] !== `${st.method} ${st.path}` || !same(ticks(t4[1]), st.body) || !same(ticks(t4[3]).filter((f) => !f.endsWith('…')), st.answer)) bad(`the twin's step 4 reads ${t4?.[0] ?? 'nothing'}`);
}
// The three words signin.mjs types, which no document holds (keel's code does, and keel is private:
// gen_signin.mjs reads it, CI never does). Read from the module itself, not the build, so a changed
// word goes red before it is built; each held to the page's own sentence in its source and to the
// built figure. The page names no status for the redirect, so the 302 is held by keel's code only.
const mdx = readFileSync(join(DIST, '..', 'src', 'content', 'docs', 'docs', 'development', 'api', 'signin.mdx'), 'utf8');
if (!mdx.includes(`Cancel sends \`redirect_uri?error=${CANCEL_ERROR}&state=…\``)) bad(`signin.mjs's Cancel error is ${CANCEL_ERROR}; the page's source sends Cancel back with ${mdx.match(/Cancel sends `redirect_uri\?error=([a-z_]+)/)?.[1]}`);
if (cancelErr !== CANCEL_ERROR) bad(`the built figure's Cancel error is ${cancelErr}; signin.mjs's is ${CANCEL_ERROR} (rebuild)`);
if (!mdx.includes(`answers a \`${REFUSED_STATUS}\` page on onlyworlds.com`)) bad(`signin.mjs's refused status is ${REFUSED_STATUS}; the page's source answers a ${mdx.match(/answers a `(\d+)` page on onlyworlds\.com/)?.[1]} page`);
if (Number(refused?.[1]) !== REFUSED_STATUS) bad(`the built figure's refused page is ${refused?.[1]}; signin.mjs's is ${REFUSED_STATUS} (rebuild)`);
const redirectShown = Number(redirect.codes.find((c) => attr(c.at, 'data-status'))?.text);
if (redirectShown !== REDIRECT_STATUS) bad(`the built figure's redirect is ${redirectShown}; signin.mjs's is ${REDIRECT_STATUS} (rebuild)`);
const pageRedirect = [...mdx.matchAll(/`(30\d)`/g)].map((m) => Number(m[1])).find((s) => s !== REDIRECT_STATUS);
if (pageRedirect) bad(`the page's source names a ${pageRedirect}; signin.mjs's redirect is ${REDIRECT_STATUS}`);
console.log(`sign-in: signin.mjs's Cancel error ${CANCEL_ERROR} and refused ${REFUSED_STATUS} held to the page's source; its ${REDIRECT_STATUS} is in no page sentence, held by keel's code only (gen_signin.mjs, local)`);
console.log(`sign-in: ${params.length} authorize parameters, ${body.length} body fields and ${answer.length} answer fields drawn from contract/signin.json (read ${sSnap.read_at}), a ${st.code_seconds}-second code; held to the page's tables, its answer example and its words, the twin the same`);
// the snapshot against the live document (fetched above for the Retry-After check)
if (doc) {
  const drift = [];
  const lt = doc.paths?.[st.path]?.[st.method.toLowerCase()];
  const lb = lt?.requestBody?.content?.['application/json']?.schema;
  const la = lt?.responses?.['200']?.content?.['application/json']?.schema;
  const lw = (doc.paths?.['/api/v2/auth/clients']?.get?.description ?? '').replace(/\s+/g, ' ');
  const lu = lw.match(/sends the browser to `([^`]+)` with (.*?);/);
  const live = {
    url: lu?.[1],
    params: ticks(lu?.[2]).map((p) => p.split('=')[0]),
    method: ticks(lu?.[2]).find((p) => p.startsWith('code_challenge_method='))?.split('=')[1],
    back: (lw.match(/back to `redirect_uri\?([^`]+)`/)?.[1] ?? '').split('&').map((kv) => kv.split('=')[0]),
    security: lt?.security ?? doc.security ?? null,
    body: Object.keys(lb?.properties ?? {}),
    required: lb?.required ?? [],
    grant_type: lb?.properties?.grant_type?.const,
    code_seconds: Number(lb?.properties?.code?.description?.match(/valid for (\d+) seconds/)?.[1]),
    answer: Object.keys(la?.properties ?? {}),
    prefix: la?.properties?.token?.description?.match(/`(ow_[a-z]+_)`/)?.[1],
  };
  const held = { url: sa.url, params: sa.params, method: sa.method, back: sa.back, security: st.security, body: st.body, required: st.required, grant_type: st.grant_type, code_seconds: st.code_seconds, answer: st.answer, prefix: st.prefix };
  if (!lt) drift.push(`${st.method} ${st.path} is not in the live document`);
  else for (const k of Object.keys(held)) if (!same(live[k], held[k])) drift.push(`${k} is ${JSON.stringify(live[k])} live, ${JSON.stringify(held[k])} in the snapshot`);
  // Printed, never failed, as the credentials snapshot's: the sweep's check 2d fails on it.
  for (const d of drift) console.log(`  STALE  sign-in snapshot (node scripts/gen_signin.mjs --refresh): ${d}`);
  console.log(`sign-in: the snapshot held to the live API document, ${Object.keys(held).length - drift.length} of ${Object.keys(held).length} facts the same`);
} else {
  console.log('CANNOT SEE: the live API document (see above); the sign-in snapshot was not compared with it');
}
}

if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  console.log(`\nFAIL — ${fails.length} figure claim(s) differ from their source.`);
  process.exit(1);
}
console.log('\nPASS — the link map draws exactly the element pages\' link rows, the four nouns\' address parses as it reads, the error families draw exactly the errors table\'s codes and marks, the category fields draw each element page\'s field and link counts under the SDK\'s families, the page palettes paint keel\'s colours with the ratios they print, the world folder draws the example\'s folders and files, each named by the page\'s rule, the credentials figure draws every operation under the credentials the API document lists for it, and the sign-in steps draw the API document\'s route, parameters and fields as the page\'s own tables give them.');
