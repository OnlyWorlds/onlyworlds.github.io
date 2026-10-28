#!/usr/bin/env node
/**
 * gen_proposals.mjs: the snapshot behind the proposals figure, from the API's own document.
 *
 * Usage: node scripts/gen_proposals.mjs            compare contract/proposals.json with the live document
 *        node scripts/gen_proposals.mjs --refresh  rewrite contract/proposals.json from the live document
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json: the proposal routes on every category
 * (propose, accept, decline, withdraw, and the review of a marked new element), the world's queue
 * GET /api/v2/world/proposals, the Proposal schema's kind and state, the queue's new_element row, the
 * propose body's expires, the World's agent_writes_proposed and every operation that answers 202.
 * Vendored as contract/proposals.json so a build never depends on the API being up; the figure
 * (ProposalLife, through proposals.mjs) and verify-figures.mjs read the snapshot.
 *
 * A route on the categories is kept once, as {type}: its description, security and each status's
 * description read on Character, and the categories held to it (the same methods, statuses, security
 * and body on every one, or BLIND). A shape this does not read (a route missing on a category, a
 * schema without its enum) is BLIND, never a guess. `read_at` is the day the facts last changed (a
 * refresh that finds them equal keeps it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (the document unreadable, or
 * its shape not one this reads: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'proposals.json');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const SAMPLE = 'character';
// The routes the figure draws, each as {type} and its method.
const ROUTES = {
  propose: ['post', '/api/v2/{type}/{id}/proposals'],
  accept: ['post', '/api/v2/{type}/{id}/proposals/{pid}/accept'],
  decline: ['post', '/api/v2/{type}/{id}/proposals/{pid}/decline'],
  withdraw: ['delete', '/api/v2/{type}/{id}/proposals/{pid}'],
  review: ['post', '/api/v2/{type}/{id}/review'],
  queue: ['get', '/api/v2/world/proposals'],
};
const blind = (why) => { console.log(`gen_proposals: BLIND: ${why}`); process.exit(2); };
const cp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// A definition with its keys sorted at every depth, so two the same compare the same.
const sorted = (v) => (Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort(cp).map((k) => [k, sorted(v[k])])) : v);

function snapshotOf(doc) {
  const deref = (s) => { for (let i = 0; s?.$ref && i < 10; i++) s = s.$ref.replace(/^#\//, '').split('/').reduce((a, k) => a?.[k], doc); return s; };
  // the categories: every type with a proposals route
  const types = Object.keys(doc.paths ?? {}).map((p) => p.match(/^\/api\/v2\/([a-z]+)\/\{id\}\/proposals$/)?.[1]).filter(Boolean).sort(cp);
  if (!types.includes(SAMPLE)) throw new Error(`no proposals route on ${SAMPLE}`);
  const shape = (op) => JSON.stringify(sorted({ responses: Object.keys(op.responses ?? {}), security: op.security ?? null, body: deref(op.requestBody?.content?.['application/json']?.schema) ?? null }));
  const routes = {};
  for (const [name, [method, path]] of Object.entries(ROUTES)) {
    const on = (t) => doc.paths?.[path.replace('{type}', t)]?.[method];
    const op = on(SAMPLE);
    if (!op) throw new Error(`the document has no ${method.toUpperCase()} ${path.replace('{type}', SAMPLE)}`);
    if (path.includes('{type}')) for (const t of types) if (!on(t) || shape(on(t)) !== shape(op)) throw new Error(`${method.toUpperCase()} ${path} on ${t} is missing or differs from ${SAMPLE}'s`);
    const r = {
      method,
      path,
      description: op.description ?? null,
      security: (op.security ?? []).map((alt) => Object.keys(alt).sort(cp)),
      responses: Object.fromEntries(Object.entries(op.responses ?? {}).map(([s, x]) => [s, deref(x)?.description ?? null])),
    };
    if (name === 'review') {
      r.decisions = deref(op.requestBody?.content?.['application/json']?.schema)?.properties?.decision?.enum;
      if (!r.decisions?.length) throw new Error('the review body lists no decisions');
    }
    if (name === 'queue') {
      const st = (op.parameters ?? []).map(deref).find((p) => p?.in === 'query' && p.name === 'state');
      if (!st?.schema?.enum) throw new Error('the queue has no state parameter with values');
      r.state = { schema: sorted(st.schema), description: st.description ?? null };
    }
    routes[name] = r;
  }
  const expires = deref(doc.paths[ROUTES.propose[1].replace('{type}', SAMPLE)].post.requestBody?.content?.['application/json']?.schema)?.properties?.expires;
  if (!expires?.description) throw new Error('the propose body has no expires with a description');
  const P = doc.components?.schemas?.Proposal?.properties;
  if (!P?.state?.enum || !P?.kind?.enum) throw new Error('the Proposal schema has no state or kind enum');
  const rows = doc.components?.schemas?.ProposalList?.properties?.data?.items?.oneOf?.map(deref) ?? [];
  const ne = rows.find((x) => x?.properties?.kind?.enum?.includes('new_element'));
  if (!ne?.properties?.state?.enum) throw new Error('the queue has no new_element row with states');
  const sw = doc.components?.schemas?.World?.properties?.agent_writes_proposed;
  if (!sw?.description) throw new Error('the World has no agent_writes_proposed');
  // every operation that answers 202, as {type} when it is on every category
  const accepted = new Map();
  for (const [p, ops] of Object.entries(doc.paths)) for (const [m, op] of Object.entries(ops)) {
    if (!op?.responses?.['202']) continue;
    const t = p.match(/^\/api\/v2\/([a-z]+)\//)?.[1];
    const key = `${m} ${types.includes(t) ? p.replace(`/api/v2/${t}/`, '/api/v2/{type}/') : p}`;
    accepted.set(key, (accepted.get(key) ?? 0) + 1);
  }
  for (const [k, n] of accepted) if (k.includes('{type}') && n !== types.length) throw new Error(`${k} answers 202 on ${n} of ${types.length} categories`);
  return {
    types: types.length,
    routes,
    expires: { format: expires.format ?? null, description: expires.description },
    proposal: { kind: P.kind.enum, state: { enum: P.state.enum, description: P.state.description ?? null } },
    new_element: { kind: ne.properties.kind.enum, description: ne.description ?? null, state: { enum: ne.properties.state.enum, description: ne.properties.state.description ?? null } },
    switch: { field: 'agent_writes_proposed', readOnly: sw.readOnly === true, description: sw.description, proposed: [...accepted.keys()].sort(cp) },
  };
}

// One route per line, so a diff names the one that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`${OPENAPI}: the proposal routes on every category (read on ${SAMPLE}), the world's queue, the Proposal schema, the queue's new_element row, the propose body's expires, the World's agent_writes_proposed and every operation answering 202`)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  `  "types": ${s.types},`,
  '  "routes": {',
  Object.entries(s.routes).map(([k, r]) => `    ${JSON.stringify(k)}: ${JSON.stringify(r)}`).join(',\n'),
  '  },',
  `  "expires": ${JSON.stringify(s.expires)},`,
  `  "proposal": ${JSON.stringify(s.proposal)},`,
  `  "new_element": ${JSON.stringify(s.new_element)},`,
  `  "switch": ${JSON.stringify(s.switch)}`,
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify(sorted({ types: s.types, routes: s.routes, expires: s.expires, proposal: s.proposal, new_element: s.new_element, switch: s.switch }));

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
  const summary = (s) => `${Object.keys(s.routes).length} routes (on ${s.types} categories), states ${s.proposal.state.enum.join(', ')}, ${s.switch.proposed.length} operations answering 202`;
  if (process.argv.includes('--refresh')) {
    const read_at = unchanged ? snap.read_at : new Date().toISOString().slice(0, 10);
    writeFileSync(SNAP, format({ read_at, ...live }));
    console.log(`gen_proposals: ${unchanged ? 'contract/proposals.json unchanged' : 'wrote contract/proposals.json'}: ${summary(live)}, read ${read_at}`);
    process.exit(0);
  }
  if (!snap) { console.log('gen_proposals: STALE: contract/proposals.json missing or unreadable; run --refresh'); process.exit(1); }
  if (unchanged) { console.log(`gen_proposals: contract/proposals.json matches the live document: ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
  console.log(`gen_proposals: STALE: the live document differs from contract/proposals.json (read ${snap.read_at}); run --refresh`);
  for (const k of new Set([...Object.keys(live.routes), ...Object.keys(snap.routes ?? {})])) {
    if (JSON.stringify(sorted(live.routes[k] ?? null)) !== JSON.stringify(sorted(snap.routes?.[k] ?? null))) console.log(`  route ${k} changed`);
  }
  for (const k of ['types', 'expires', 'proposal', 'new_element', 'switch']) if (JSON.stringify(sorted(live[k])) !== JSON.stringify(sorted(snap[k] ?? null))) console.log(`  ${k} changed`);
  process.exit(1);
}
