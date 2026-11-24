#!/usr/bin/env node
/**
 * verify-groups.mjs: the API document's description of each element type, held to the type's own page.
 *
 * Usage: node scripts/verify-groups.mjs                       read the live document
 *        node scripts/verify-groups.mjs --document <file>     read a saved document instead (no network)
 *        node scripts/verify-groups.mjs --root <dir>          read the type pages under another root
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json (public, no key). Its `tags` describe each group of
 * routes, and 22 of the groups are the element types. A type's definition is the opening paragraph of its own
 * page here (scripts/type-pages.mjs), and the document's description of the type is a copy of that paragraph's
 * opening: the whole paragraph, or its first sentences. The copy is kept by hand on the server's side, so a
 * reworded page leaves the document saying the old words, and a reworded description says what no page does.
 *
 * Checks (fail), one per type page:
 *   (a) the document has a group named as the type (compared without case), with a description;
 *   (b) the description, spaces folded, is the page's opening paragraph from its start: one or more whole
 *       sentences of it, none skipped, none cut.
 * Not checked: the document's other groups (World, Changes and the rest are routes, not definitions); a group
 * the document names for a type that has no page here (a group is told from a type only by its page); which
 * of the page's sentences the document should stop at.
 * This runs against the live document only: in the weekly sweep, and report-only in CI. It is no part of
 * `npm run verify`, so a page reworded here never waits on the server. Watched failing:
 * scripts/mutants-groups.mjs (in `npm run verify`).
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (the document unreadable or without groups, or fewer than 22 type pages:
 * never a pass).
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTypePages, sentences } from './type-pages.mjs';

const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const ROOT = arg('--root') ?? join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = arg('--document');
const blind = (why) => { console.log(`verify-groups: BLIND: ${why}`); process.exit(2); };
const fold = (s) => s.replace(/\s+/g, ' ').trim();

const pages = readTypePages(ROOT);
if (pages === null || pages.size !== 22) blind(`${pages === null ? 'no' : pages.size} type pages read under ${ROOT} (22 expected)`);

let doc;
if (FILE) {
  try { doc = JSON.parse(readFileSync(FILE, 'utf8')); } catch (e) { blind(`${FILE} could not be read as JSON (${e.message})`); }
} else {
  try {
    const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) blind(`${OPENAPI} answered ${r.status}`);
    doc = await r.json();
  } catch (e) { blind(`${OPENAPI} could not be read (${e.message})`); }
}
const tags = Array.isArray(doc?.tags) ? doc.tags.filter((t) => t && typeof t.name === 'string') : [];
if (tags.length === 0) blind('the document names no groups (`tags` is missing or empty)');
const groups = new Map(tags.map((t) => [t.name.toLowerCase(), t]));

const bad = [];
let whole = 0;
for (const [type, paragraph] of pages) {
  const group = groups.get(type);
  if (!group) { bad.push(`${type}: the document has no group named as the type`); continue; }
  const said = typeof group.description === 'string' ? fold(group.description) : '';
  if (!said) { bad.push(`${type}: the document's group has no description`); continue; }
  const parts = sentences(paragraph);
  let k = 0;
  for (let i = 1; i <= parts.length; i++) if (parts.slice(0, i).join(' ') === said) k = i;
  if (k === 0) bad.push(`${type}: the document says "${said}" and the page opens "${paragraph}"`);
  else if (k === parts.length) whole++;
}

for (const b of bad) console.log(`  DRIFT  ${b}`);
if (bad.length) { console.log(`verify-groups: FAIL: ${bad.length} of ${pages.size} type descriptions in the API document are not their page's opening`); process.exit(1); }
console.log(`verify-groups: PASS: the API document describes each of the ${pages.size} element types in its page's own opening sentences (${whole} with the whole paragraph); read from ${FILE ?? 'the live document'}`);
