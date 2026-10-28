#!/usr/bin/env node
/**
 * gen_draught.mjs: the snapshot behind the draught figure, from the API's own document.
 *
 * Usage: node scripts/gen_draught.mjs            compare contract/draught.json with the live document
 *        node scripts/gen_draught.mjs --refresh  rewrite contract/draught.json from the live document
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json, the route GET /api/v2/character/{id}/context:
 * its query parameters and its answer, the Draught schema. Vendored as contract/draught.json so a
 * build never depends on the API being up; the figure (DraughtRead, through draught.mjs) and
 * verify-figures.mjs read the snapshot.
 *
 * The snapshot keeps each query parameter as the document defines it (its schema and description,
 * in the document's order) and, of the packet, its required keys, each key's description and the
 * key whose body carries `self: true` (her own element). A shape this does not read (the route
 * missing, a parameter with no schema, no key carrying `self: true`) is BLIND, never a guess.
 * `read_at` is the day the facts last changed (a refresh that finds them equal keeps it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (the document unreadable, or
 * its shape not one this reads: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'draught.json');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const ROUTE = '/api/v2/character/{id}/context';
const blind = (why) => { console.log(`gen_draught: BLIND: ${why}`); process.exit(2); };
const cp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// A definition with its keys sorted at every depth, so two the same compare the same.
const sorted = (v) => (Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort(cp).map((k) => [k, sorted(v[k])])) : v);

function snapshotOf(doc) {
  const op = doc?.paths?.[ROUTE]?.get;
  if (!op) throw new Error(`the document has no GET ${ROUTE}`);
  const deref = (s) => { for (let i = 0; s?.$ref && i < 10; i++) s = s.$ref.replace(/^#\//, '').split('/').reduce((a, k) => a?.[k], doc); return s; };
  const parameters = {};
  for (const p of op.parameters ?? []) {
    if (p.in !== 'query') continue;
    if (!p.schema) throw new Error(`the parameter ${p.name} has no schema`);
    parameters[p.name] = { schema: sorted(deref(p.schema)), description: p.description ?? null };
  }
  if (!parameters.components?.schema?.items?.enum) throw new Error('the components parameter lists no sections (items.enum)');
  const packet = deref(op.responses?.['200']?.content?.['application/json']?.schema);
  if (!packet?.properties) throw new Error('the 200 answer has no properties');
  const bodyOf = (s) => [s, ...(s.oneOf ?? [])].find((x) => x?.properties?.self);
  const selfKeys = Object.keys(packet.properties).filter((k) => bodyOf(packet.properties[k])?.properties.self.const === true);
  if (selfKeys.length !== 1) throw new Error(`the packet has ${selfKeys.length} keys whose body carries self: true, not one`);
  const keys = Object.fromEntries(Object.entries(packet.properties).map(([k, s]) => [k, s.description ?? null]));
  return { route: ROUTE, summary: op.summary ?? null, parameters, packet: { required: packet.required ?? [], self: selfKeys[0], keys } };
}

// One parameter and one packet key per line, so a diff names the one that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: GET ${ROUTE}, its query parameters and its answer (the Draught schema)`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  `  "route": ${JSON.stringify(s.route)},`,
  `  "summary": ${JSON.stringify(s.summary)},`,
  '  "parameters": {',
  Object.entries(s.parameters).map(([k, p]) => `    ${JSON.stringify(k)}: ${JSON.stringify(p)}`).join(',\n'),
  '  },',
  '  "packet": {',
  `    "required": ${JSON.stringify(s.packet.required)},`,
  `    "self": ${JSON.stringify(s.packet.self)},`,
  '    "keys": {',
  Object.entries(s.packet.keys).map(([k, d]) => `      ${JSON.stringify(k)}: ${JSON.stringify(d)}`).join(',\n'),
  '    }',
  '  }',
  '}',
  '',
].join('\n');
// Parameter and key order are facts too (the figure draws them in the document's order).
const body = (s) => JSON.stringify({ route: s.route, summary: s.summary, order: Object.keys(s.parameters), keyOrder: Object.keys(s.packet.keys), parameters: sorted(s.parameters), packet: sorted(s.packet) });

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
  const summary = (s) => `${Object.keys(s.parameters).length} query parameters, ${s.parameters.components.schema.items.enum.length} sections, ${Object.keys(s.packet.keys).length} packet keys`;
  if (process.argv.includes('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`gen_draught: ${unchanged ? 'contract/draught.json unchanged' : 'wrote contract/draught.json'}: ${summary(live)}, read ${read_at}`);
    process.exit(0);
  }
  if (!snap) { console.log('gen_draught: STALE: contract/draught.json missing or unreadable; run --refresh'); process.exit(1); }
  if (unchanged) { console.log(`gen_draught: contract/draught.json matches the live document: ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
  console.log(`gen_draught: STALE: the live document differs from contract/draught.json (read ${snap.read_at}); run --refresh`);
  for (const k of new Set([...Object.keys(live.parameters), ...Object.keys(snap.parameters ?? {})])) {
    if (JSON.stringify(sorted(live.parameters[k] ?? null)) !== JSON.stringify(sorted(snap.parameters?.[k] ?? null))) console.log(`  parameter ${k} changed`);
  }
  if (JSON.stringify(Object.keys(live.parameters)) !== JSON.stringify(Object.keys(snap.parameters ?? {}))) console.log('  the parameters\' order changed');
  for (const k of new Set([...Object.keys(live.packet.keys), ...Object.keys(snap.packet?.keys ?? {})])) {
    if (live.packet.keys[k] !== snap.packet?.keys?.[k]) console.log(`  packet key ${k} changed`);
  }
  if (JSON.stringify(live.packet.required) !== JSON.stringify(snap.packet?.required) || live.packet.self !== snap.packet?.self) console.log('  the packet\'s required keys or its self key changed');
  process.exit(1);
}
