#!/usr/bin/env node
/**
 * gen_write.mjs: the snapshot behind the write body figure on Fields, from the API's own document.
 *
 * Usage: node scripts/gen_write.mjs            compare contract/write.json with the live document
 *        node scripts/gen_write.mjs --refresh  rewrite contract/write.json from the live document
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json, the 22 element categories' write schemas:
 * <Category>Write (a create or full replace: POST, PUT) and <Category>Patch (a partial update: PATCH).
 * Vendored as contract/write.json so a build never depends on the API being up; the figure
 * (WriteBody, through write.mjs) and verify-figures.mjs read the snapshot.
 *
 * The snapshot keeps, for each of the two, what all 22 schemas say alike: the schema's description
 * with the category's name as {type}, `required`, `additionalProperties`, the extension pattern and
 * its description, and every property all 22 define the same, as the document defines it. A
 * property one category lacks or defines its own way is that category's own; `own` keeps each
 * category's own properties by name, the same in both. A shape this does not read (a schema
 * missing, the 22 describing themselves apart, own properties differing between the two) is BLIND,
 * never a guess. `read_at` is the day the facts last changed (a refresh that finds them equal keeps
 * it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (the document unreadable, or
 * its shape not one this reads: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ELEMENT_TYPES } from '@onlyworlds/sdk';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'write.json');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const VARIANTS = { write: 'Write', patch: 'Patch' };
const blind = (why) => { console.log(`gen_write: BLIND: ${why}`); process.exit(2); };
const cp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// A definition with its keys sorted at every depth, so two the same compare the same.
const sorted = (v) => (Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort(cp).map((k) => [k, sorted(v[k])])) : v);
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

function variantOf(schemas, suffix) {
  const of = ELEMENT_TYPES.map((t) => {
    const name = `${t[0].toUpperCase()}${t.slice(1)}${suffix}`;
    const s = schemas[name];
    if (!s?.properties) throw new Error(`the document has no ${name} with properties`);
    return [t, s];
  });
  const [t0, s0] = of[0];
  const says = (t, s) => (s.description ?? '').split(t).join('{type}');
  const alike = { says: says(t0, s0), required: s0.required ?? [], additional: s0.additionalProperties ?? null, extensions: s0.patternProperties ?? null };
  for (const [t, s] of of) {
    const its = { says: says(t, s), required: s.required ?? [], additional: s.additionalProperties ?? null, extensions: s.patternProperties ?? null };
    for (const k of Object.keys(alike)) if (!same(alike[k], its[k])) throw new Error(`${t}${suffix}'s ${k} differs from ${t0}${suffix}'s`);
  }
  const fields = {};
  for (const f of Object.keys(s0.properties)) if (of.every(([, s]) => s.properties[f] && same(s.properties[f], s0.properties[f]))) fields[f] = sorted(s0.properties[f]);
  const own = Object.fromEntries(of.map(([t, s]) => [t, Object.keys(s.properties).filter((f) => !fields[f])]));
  return { ...alike, extensions: sorted(alike.extensions), fields, own };
}

function snapshotOf(doc) {
  const schemas = doc?.components?.schemas;
  if (!schemas || typeof schemas !== 'object') throw new Error('the document has no components.schemas');
  const v = Object.fromEntries(Object.entries(VARIANTS).map(([k, suffix]) => [k, variantOf(schemas, suffix)]));
  if (!same(v.write.own, v.patch.own)) throw new Error('a category\'s own fields differ between its Write and Patch schemas');
  const own = v.write.own;
  delete v.write.own;
  delete v.patch.own;
  return { write: v.write, patch: v.patch, own };
}

// One category's own fields per line, so a diff names the category that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: the 22 categories' write schemas, <Category>Write (POST, PUT) and <Category>Patch (PATCH)`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  ...Object.keys(VARIANTS).map((k) => `  "${k}": ${JSON.stringify(s[k], null, 2).replace(/\n/g, '\n  ')},`),
  '  "own": {',
  Object.entries(s.own).map(([t, fs]) => `    ${JSON.stringify(t)}: ${JSON.stringify(fs)}`).join(',\n'),
  '  }',
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify(sorted({ write: s.write, patch: s.patch, own: s.own }));

{
  let doc;
  try {
    const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000), headers: { 'Accept-Encoding': 'gzip' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    doc = await r.json();
  } catch (e) { blind(`${OPENAPI} (${e.message})`); }
  let live;
  try { live = snapshotOf(doc); } catch (e) { blind(e.message); }
  let snap = null;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable */ }
  const unchanged = snap && body(snap) === body(live);
  const summary = (s) => `${Object.keys(s.own).length} categories, ${Object.keys(s.write.fields).length} shared fields`;
  if (process.argv.includes('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`gen_write: ${unchanged ? 'contract/write.json unchanged' : 'wrote contract/write.json'}: ${summary(live)}, read ${read_at}`);
    process.exit(0);
  }
  if (!snap) { console.log('gen_write: STALE: contract/write.json missing or unreadable; run --refresh'); process.exit(1); }
  if (unchanged) { console.log(`gen_write: contract/write.json matches the live document: ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
  console.log(`gen_write: STALE: the live document differs from contract/write.json (read ${snap.read_at}); run --refresh`);
  for (const k of Object.keys(VARIANTS)) {
    for (const f of new Set([...Object.keys(live[k].fields), ...Object.keys(snap[k]?.fields ?? {})])) {
      if (!same(live[k].fields[f], snap[k]?.fields?.[f])) console.log(`  ${k} ${f}: ${JSON.stringify(snap[k]?.fields?.[f] ?? null)} -> ${JSON.stringify(live[k].fields[f] ?? null)}`);
    }
    for (const a of ['says', 'required', 'additional', 'extensions']) if (!same(live[k][a], snap[k]?.[a])) console.log(`  ${k} ${a} changed`);
  }
  for (const t of Object.keys(live.own)) if (!same(live.own[t], snap.own?.[t])) console.log(`  ${t}'s own fields changed`);
  process.exit(1);
}
