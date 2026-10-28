#!/usr/bin/env node
/**
 * gen_time.mjs: the snapshot behind the time figure on Worlds, from the standard, the API's own
 * document and a real world.
 *
 * Usage: node scripts/gen_time.mjs                      compare contract/time.json with the sources
 *        node scripts/gen_time.mjs --refresh            rewrite contract/time.json from the sources
 *        node scripts/gen_time.mjs --dist PATH [...]    a schema-dist clone other than OW_SCHEMA_DIST or ../schema-dist
 *
 * Sources, vendored as contract/time.json so a build needs no network:
 *   - the standard: schema-dist at its newest v*-dist.* tag (git fetch --tags, then git show
 *     <tag>:<path>, never the working tree): schema.json's World fields named time_*, Character's
 *     birth_date (the kind a date has), and example/hyperion/world.json's time keys (how a world
 *     folder spells them);
 *   - https://www.onlyworlds.com/api/v2/openapi.json: the World schema's time_* properties and
 *     Character's birth_date;
 *   - the demo world Moppetopia, read with no key (GET /api/v2/world?world=<id>, then the one
 *     element the figure dates, by its type's date field in the SDK's DATE_FIELD).
 * The figure (TimeLadder, through time.mjs) and verify-figures.mjs read the snapshot. `read_at` is
 * the day those last changed (a refresh that finds them equal keeps it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (a source unreadable, or a
 * shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DATE_FIELD } from '@onlyworlds/sdk';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'time.json');
const API = 'https://www.onlyworlds.com';
const OPENAPI = `${API}/api/v2/openapi.json`;
// The demo world the figure draws, and the element it dates on the line (the worked example's own).
const WORLD_ID = '0695db52-5433-7332-8000-db7fe10da375';
const ELEMENT = { type: 'character', id: '0695db83-afd7-76ee-8000-00f4295f8866' };
const FOLDER_WORLD = 'example/hyperion/world.json';
const argv = process.argv.slice(2);
const DIST = resolve(argv.includes('--dist') ? argv[argv.indexOf('--dist') + 1] : process.env.OW_SCHEMA_DIST || join(ROOT, '..', 'schema-dist'));
const say = (s) => console.log(`gen_time: ${s}`);
const blind = (why) => { say(`BLIND: ${why}`); process.exit(2); };
const isTime = (k) => k.startsWith('time_');

// The standard, from the newest v*-dist.* tag.
function standard() {
  if (!existsSync(DIST)) throw new Error(`no schema-dist clone at ${DIST} (--dist PATH)`);
  const git = (...a) => execFileSync('git', ['-C', DIST, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
  git('fetch', '-q', '--tags', 'origin');
  const tag = git('tag', '-l', 'v*-dist.*', '--sort=-v:refname').split('\n')[0].trim();
  if (!tag) throw new Error(`no v*-dist.* tag in ${DIST}`);
  const show = (f) => git('show', `${tag}:${f}`);
  const serial = show('VERSION').match(/^serial: (\S+)/m)?.[1];
  const schema = JSON.parse(show('schema.json'));
  if (!Array.isArray(schema.world)) throw new Error(`${tag}: schema.json has no world field list`);
  const fields = schema.world.filter((f) => isTime(f.name)).map((f) => ({ name: f.name, kind: f.kind, ...(f.items ? { items: f.items } : {}), desc: f.desc }));
  const date = schema.types?.[ELEMENT.type]?.find((f) => f.name === DATE_FIELD[ELEMENT.type]);
  if (!fields.length || !date) throw new Error(`${tag}: schema.json has no time_* World fields or no ${ELEMENT.type}.${DATE_FIELD[ELEMENT.type]}`);
  const folder = Object.keys(JSON.parse(show(FOLDER_WORLD))).filter(isTime);
  return { tag, serial, fields, date: { type: ELEMENT.type, name: date.name, kind: date.kind }, folder: { file: FOLDER_WORLD, keys: folder } };
}

async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

// The API's own document: World's time_* properties, and the date's type.
function api(doc) {
  const world = doc.components?.schemas?.World?.properties;
  const date = doc.components?.schemas?.[ELEMENT.type[0].toUpperCase() + ELEMENT.type.slice(1)]?.properties?.[DATE_FIELD[ELEMENT.type]];
  if (!world || !date) throw new Error('the document has no World schema or no date field on the element\'s schema');
  const fields = Object.entries(world).filter(([k]) => isTime(k)).map(([name, p]) => ({ name, type: p.type, ...(p.items ? { items: p.items.type } : {}), desc: p.description }));
  return { fields, date: { type: ELEMENT.type, name: DATE_FIELD[ELEMENT.type], kind: date.type } };
}

// The world as the public reads it: its time fields, and the one element's date.
async function world(apiFields) {
  const w = await get(`${API}/api/v2/world?world=${WORLD_ID}`);
  const field = DATE_FIELD[ELEMENT.type];
  const e = await get(`${API}/api/v2/${ELEMENT.type}/${ELEMENT.id}?world=${WORLD_ID}&fields=id,name,${field}`);
  const values = {};
  for (const f of apiFields) { if (!(f.name in w)) throw new Error(`the world's read has no ${f.name}`); values[f.name] = w[f.name]; }
  if (!Number.isInteger(e[field])) throw new Error(`${e.name ?? ELEMENT.id}'s ${field} is ${JSON.stringify(e[field])}, not a whole number`);
  return { id: w.id, name: w.name, values, element: { type: ELEMENT.type, id: e.id, name: e.name, field, date: e[field] } };
}

let live;
try {
  const s = standard();
  const doc = await get(OPENAPI);
  const a = api(doc);
  live = { standard: { tag: s.tag, serial: s.serial, fields: s.fields, date: s.date }, folder: s.folder, api: a, world: await world(a.fields) };
} catch (e) { blind(String(e.stderr || e.message).trim().split('\n')[0]); }

const stable = (o) => JSON.stringify(o, null, 2) + '\n';
const facts = (o) => ({ standard: o.standard, folder: o.folder, api: o.api, world: o.world });
let old = null;
try { old = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable: STALE below */ }
const same = old && stable(facts(old)) === stable(live);
if (argv.includes('--refresh')) {
  const readAt = same ? old.read_at : new Date().toISOString().slice(0, 10);
  writeFileSync(SNAP, stable({
    source: `schema-dist ${live.standard.tag} (schema.json, ${FOLDER_WORLD}); ${OPENAPI} (World, ${ELEMENT.type}); ${API}/api/v2/world?world=${WORLD_ID} with no key`,
    read_at: readAt,
    ...live,
  }));
  say(`wrote contract/time.json from ${live.standard.tag}, the live document and ${live.world.name}${same ? ' (unchanged, read_at kept)' : ''}`);
  process.exit(0);
}
if (!old) { say('STALE: contract/time.json missing or unreadable; run --refresh'); process.exit(1); }
if (same) { say(`contract/time.json matches ${live.standard.tag}, the live document and ${live.world.name} (read ${old.read_at})`); process.exit(0); }
for (const half of ['standard', 'folder', 'api', 'world']) for (const k of Object.keys(live[half])) {
  if (stable(live[half][k]) !== stable(old[half]?.[k])) say(`STALE: ${half}.${k} is ${JSON.stringify(live[half][k])} now, ${JSON.stringify(old[half]?.[k])} in the snapshot`);
}
say('the snapshot differs from its sources: node scripts/gen_time.mjs --refresh');
process.exit(1);
