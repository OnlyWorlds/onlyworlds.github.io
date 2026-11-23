#!/usr/bin/env node
// verify-definitions.mjs: the Schema page's table of the 22 element types against the type pages.
//
// A type's definition is the opening paragraph of its own page (docs/schema/element_categories/<type>.md).
// The Schema page's table gives one sentence per type, and that sentence is the page's own: its first
// sentence, or for the two types whose page opens by placing them ("A Pin is a special Map element.") its
// second. The table is written by hand, so nothing kept it to the pages: a reworded intro left the table
// saying the old words. This check fails on a row that is not its page's sentence, a page with no row and
// a row with no page.
//
// Usage: node scripts/verify-definitions.mjs [--root <dir>]   (reads the page sources, no build needed)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const at = process.argv.indexOf('--root');
const ROOT = at > -1 ? process.argv[at + 1] : join(dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA = join(ROOT, 'src', 'content', 'docs', 'docs', 'schema');
const PAGES = join(SCHEMA, 'element_categories');
const TABLE = join(SCHEMA, 'index.mdx');
// The types whose table row is their page's second sentence: the first only says where the type belongs.
const SECOND = new Set(['pin', 'marker']);

if (!existsSync(PAGES) || !existsSync(TABLE)) { console.log(`CANNOT SEE: ${existsSync(TABLE) ? PAGES : TABLE} is missing`); process.exit(2); }

const intro = (text) => {
  const body = text.startsWith('---') ? text.split('---').slice(2).join('---') : text;
  for (const block of body.trim().split(/\r?\n\s*\r?\n/)) {
    const b = block.trim();
    if (b && !/^(import |<|#|:::)/.test(b)) return b.replace(/\s+/g, ' ');
  }
  return '';
};
const sentences = (s) => s.split(/(?<=\.)\s+/).filter(Boolean);

const pages = new Map();
for (const f of readdirSync(PAGES).filter((f) => /\.mdx?$/.test(f) && !f.startsWith('index.')).sort()) {
  pages.set(f.replace(/\.mdx?$/, ''), intro(readFileSync(join(PAGES, f), 'utf8')));
}
const rows = new Map();
for (const line of readFileSync(TABLE, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\| \[[A-Za-z]+\]\(\/docs\/schema\/element_categories\/([a-z]+)\) \| (.*) \|$/);
  if (m) rows.set(m[1], m[2].trim());
}
if (pages.size !== 22 || rows.size === 0) {
  console.log(`CANNOT SEE: ${pages.size} type pages (22 expected) and ${rows.size} table rows read`);
  process.exit(2);
}

const bad = [];
for (const [type, full] of pages) {
  const row = rows.get(type);
  if (row === undefined) { bad.push(`${type}: its page has no row in the Schema table`); continue; }
  const want = sentences(full)[SECOND.has(type) ? 1 : 0];
  if (!want) { bad.push(`${type}: its page's opening paragraph has no ${SECOND.has(type) ? 'second ' : ''}sentence to compare`); continue; }
  if (row !== want) bad.push(`${type}: the table says "${row}" and the page's ${SECOND.has(type) ? 'second' : 'first'} sentence is "${want}"`);
}
for (const type of rows.keys()) if (!pages.has(type)) bad.push(`${type}: a row in the Schema table with no type page`);

for (const b of bad) console.log(`  DRIFT  ${b}`);
if (bad.length) { console.log(`FAIL: ${bad.length} of ${pages.size} definitions differ between the Schema table and the type pages`); process.exit(1); }
console.log(`definitions: PASS — the Schema table's ${rows.size} rows are each their type page's own sentence (the first; the second for ${[...SECOND].sort().join(' and ')})`);
