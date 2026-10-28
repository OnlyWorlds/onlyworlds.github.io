#!/usr/bin/env node
/**
 * gen_callers.mjs: the snapshot behind the credentials figure on the API overview, from the API's
 * own document.
 *
 * Usage: node scripts/gen_callers.mjs            compare contract/callers.json with the live document
 *        node scripts/gen_callers.mjs --refresh  rewrite contract/callers.json from the live document
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json, every operation's `security` and the
 * document's securitySchemes, vendored as contract/callers.json so a build never depends on the API
 * being up. The figure (ApiCallers, through callers.mjs) and verify-figures.mjs read the snapshot.
 *
 * The snapshot keeps, per operation, its method, its path and its security alternatives as the
 * document lists them, each alternative as its scheme names sorted ([] is the empty alternative, no
 * credential); `null` when the operation states no security and the document has none at its top.
 * Per operation rather than counts, so the check can recount it with code of its own, and a route
 * keel moves shows in the snapshot's diff as that route. Operations sorted by path, then method;
 * one per line. `read_at` is the day the operations last changed (a refresh that finds them equal
 * keeps it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (the document unreadable, or
 * its shape not one this reads: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'callers.json');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const blind = (why) => { console.log(`gen_callers: BLIND: ${why}`); process.exit(2); };
const cp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function alternatives(sec, where) {
  if (sec == null) return null;
  if (!Array.isArray(sec)) throw new Error(`${where}: security is not a list`);
  return sec.map((req) => {
    if (!req || typeof req !== 'object' || Array.isArray(req)) throw new Error(`${where}: a security entry is not an object`);
    for (const [name, scopes] of Object.entries(req)) {
      if (!Array.isArray(scopes) || scopes.length) throw new Error(`${where}: ${name} carries scopes, which this snapshot does not keep`);
    }
    return Object.keys(req).sort(cp);
  });
}

function snapshotOf(doc) {
  if (!doc?.paths || typeof doc.paths !== 'object') throw new Error('the document has no paths');
  const schemes = doc.components?.securitySchemes;
  if (!schemes || !Object.keys(schemes).length) throw new Error('the document has no securitySchemes');
  const top = alternatives(doc.security, 'the document');
  const operations = [];
  for (const [path, item] of Object.entries(doc.paths)) {
    if (item.security !== undefined) throw new Error(`${path}: security on a path item, which OpenAPI does not have`);
    for (const m of METHODS) {
      if (!item[m]) continue;
      const own = alternatives(item[m].security, `${m.toUpperCase()} ${path}`);
      operations.push([m.toUpperCase(), path, own ?? top]);
    }
  }
  if (operations.length < 50) throw new Error(`only ${operations.length} operations`);
  for (const [m, p, alts] of operations) for (const a of alts ?? []) for (const n of a) {
    if (!schemes[n]) throw new Error(`${m} ${p} names ${n}, which securitySchemes does not define`);
  }
  operations.sort((x, y) => cp(x[1], y[1]) || cp(x[0], y[0]));
  const kept = Object.fromEntries(Object.keys(schemes).sort(cp).map((k) => {
    const { description, ...rest } = schemes[k];
    return [k, Object.fromEntries(Object.keys(rest).sort(cp).map((f) => [f, rest[f]]))];
  }));
  return { schemes: kept, operations };
}

// One operation per line, so a diff names the route that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: each operation's security, and the security schemes`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  `  "schemes": ${JSON.stringify(s.schemes)},`,
  '  "operations": [',
  s.operations.map((o) => `    ${JSON.stringify(o)}`).join(',\n'),
  '  ]',
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify({ schemes: s.schemes, operations: s.operations });

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
  const same = snap && body(snap) === body(live);
  if (process.argv.includes('--refresh')) {
    const read_at = same ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`gen_callers: ${same ? 'contract/callers.json unchanged' : 'wrote contract/callers.json'}: ${live.operations.length} operations, read ${read_at}`);
    process.exit(0);
  }
  if (!snap) { console.log('gen_callers: STALE: contract/callers.json missing or unreadable; run --refresh'); process.exit(1); }
  if (same) { console.log(`gen_callers: contract/callers.json matches the live document: ${live.operations.length} operations (read ${snap.read_at})`); process.exit(0); }
  const key = (o) => `${o[0]} ${o[1]}`;
  const was = new Map(snap.operations.map((o) => [key(o), JSON.stringify(o[2])]));
  const now = new Map(live.operations.map((o) => [key(o), JSON.stringify(o[2])]));
  const lines = [
    ...[...now.keys()].filter((k) => !was.has(k)).map((k) => `added    ${k} ${now.get(k)}`),
    ...[...was.keys()].filter((k) => !now.has(k)).map((k) => `removed  ${k}`),
    ...[...now.keys()].filter((k) => was.has(k) && was.get(k) !== now.get(k)).map((k) => `changed  ${k} ${was.get(k)} -> ${now.get(k)}`),
  ];
  if (JSON.stringify(snap.schemes) !== JSON.stringify(live.schemes)) lines.push('changed  the security schemes');
  console.log(`gen_callers: STALE: the live document differs from contract/callers.json (read ${snap.read_at}); run --refresh`);
  for (const l of lines.slice(0, 20)) console.log(`  ${l}`);
  if (lines.length > 20) console.log(`  … and ${lines.length - 20} more`);
  process.exit(1);
}
