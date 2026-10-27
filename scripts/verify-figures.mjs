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
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOwLink, ELEMENT_TYPES } from '@onlyworlds/sdk';

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
const text = schema.match(/<details class="ow-fig-text\b[^"]*"[^>]*>([\s\S]*?)<\/details>/);
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
  // Known gap: idempotency_in_flight answers on any write that takes an Idempotency-Key, and none
  // of those operations' 409s declares the header (the list's summary says it is sent). Printed.
  const inflight = shown.get('idempotency_in_flight');
  if (inflight?.ring) {
    const covered = keyed.filter((op) => op.responses[inflight.status] && hasRetry(op.responses[inflight.status])).length;
    console.log(covered
      ? `  note  idempotency_in_flight: ${covered} of ${keyed.length} operations taking an Idempotency-Key now declare Retry-After on their ${inflight.status}`
      : `  KNOWN GAP  idempotency_in_flight (${inflight.status}) is marked by the error list; none of the ${keyed.length} operations taking an Idempotency-Key declares Retry-After on its ${inflight.status} (printed, not failed)`);
  }
  console.log(`error families: the API document declares Retry-After on ${[...declared].sort((a, b) => a - b).join(', ')}; the ${marked.length} marked codes' statuses held to it`);
}

if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  console.log(`\nFAIL — ${fails.length} figure claim(s) differ from their source.`);
  process.exit(1);
}
console.log('\nPASS — the link map draws exactly the element pages\' link rows, the four nouns\' address parses as it reads, and the error families draw exactly the errors table\'s codes and marks.');
