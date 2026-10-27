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
  for (const r of page.matchAll(/<td><code[^>]*>([a-z0-9_]+)<\/code>[^<]*<\/td>\s*<td>([^<]*)<\/td>/g)) {
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

if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  console.log(`\nFAIL — ${fails.length} figure claim(s) differ from their source.`);
  process.exit(1);
}
console.log('\nPASS — the link map draws exactly the element pages\' link rows, and the four nouns\' address parses as it reads.');
