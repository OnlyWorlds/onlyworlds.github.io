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
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOwLink, ELEMENT_TYPES, ELEMENT_FAMILIES, FAMILY_ORDER } from '@onlyworlds/sdk';
import { contrast, pageColours, CONTRAST } from '../src/components/figures/fields.mjs';

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

if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  console.log(`\nFAIL — ${fails.length} figure claim(s) differ from their source.`);
  process.exit(1);
}
console.log('\nPASS — the link map draws exactly the element pages\' link rows, the four nouns\' address parses as it reads, the error families draw exactly the errors table\'s codes and marks, the category fields draw each element page\'s field and link counts under the SDK\'s families, the page palettes paint keel\'s colours with the ratios they print, and the world folder draws the example\'s folders and files, each named by the page\'s rule.');
