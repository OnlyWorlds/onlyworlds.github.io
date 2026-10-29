#!/usr/bin/env node
/**
 * verify-cors.mjs: the CORS page's origins, headers, credentials and preflight cache, held to keel's settings.
 *
 * Usage: node scripts/verify-cors.mjs                    check the page against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-cors.mjs --live             a real preflight and GET against the snapshot; exit 1 if they differ
 *        node scripts/verify-cors.mjs --source           compare the snapshot with keel's origin/main; exit 1 if they differ
 *        node scripts/verify-cors.mjs --refresh          first rewrite the snapshot from keel's origin/main, then check the page
 *        add --keel PATH to --source or --refresh for a keel checkout other than ../keel
 *
 * Source: the CORS_ settings in keel's config/settings/local.py (production.py imports it and sets
 * no CORS_ name of its own; this refuses one that does), read from the published branch (git fetch,
 * then git show origin/main:<path>), never the working tree. keel is private, so CI cannot read it:
 * the build and `--live` read only the snapshot, contract/cors.json. It keeps keel's lists in keel's
 * order, the commit that last touched the settings file, and `read_at`, the day the facts last
 * changed (a refresh that finds them equal keeps both).
 *
 * Checks (fail) on src/content/docs/docs/development/api/cors.md:
 *   the Allowed origins table names every origin regex keel allows (written with `*` for one label
 *   or a port) and every exact origin no regex covers, and nothing keel does not allow, each once;
 *   an exact origin a regex already covers may be named or left out; a cell that ends "on any port"
 *   names hosts whose port is the `*`;
 *   the Request headers sentence names exactly CORS_ALLOW_HEADERS, the Response headers sentence
 *   exactly CORS_EXPOSE_HEADERS (case-blind, each once); the Credentials line says allowed or not
 *   as CORS_ALLOW_CREDENTIALS does; the preflight line's cache time is CORS_PREFLIGHT_MAX_AGE;
 *   keel does not allow every origin (the page says any other origin gets no CORS headers).
 * --live sends OPTIONS /api/v2/world from an exact allowed origin, from one a regex allows and from
 *   one nothing allows, and a GET with the public demo key from the first: the allow and expose
 *   lists, the max age and the credentials flag must equal the snapshot, and the disallowed origin
 *   must get no Access-Control-Allow-Origin. The regexes cannot be enumerated over the wire: the
 *   set is held to keel's settings (--source), the live answer only for those samples.
 * Not checked, printed: the Platform column; the 503 line; the caution's advice.
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (keel or the server unreadable, or
 * a page or settings shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'cors.json');
const PAGE = join(ROOT, 'src', 'content', 'docs', 'docs', 'development', 'api', 'cors.md');
const FILE = 'config/settings/local.py';
const PROD = 'config/settings/production.py';
const URL_ = 'https://www.onlyworlds.com/api/v2/world';
const DEMO_KEY = '0000000001';
const argv = process.argv.slice(2);
const args = new Set(argv);
const KEEL = resolve(args.has('--keel') ? argv[argv.indexOf('--keel') + 1] : join(ROOT, '..', 'keel'));
const blind = (why) => { console.log(`verify-cors: BLIND: ${why}`); process.exit(2); };
const NAMES = {
  allow_all_origins: 'CORS_ALLOW_ALL_ORIGINS', origins: 'CORS_ALLOWED_ORIGINS', origin_regexes: 'CORS_ALLOWED_ORIGIN_REGEXES',
  allow_headers: 'CORS_ALLOW_HEADERS', expose_headers: 'CORS_EXPOSE_HEADERS', allow_credentials: 'CORS_ALLOW_CREDENTIALS',
  preflight_max_age: 'CORS_PREFLIGHT_MAX_AGE',
};

// ---- keel's settings -----------------------------------------------------------------------------
// A small reader for the two shapes the settings use: NAME = [ string literals, comments ] and
// NAME = True | False | <integer>. A name assigned twice, added to or set in production.py is refused.
function listOf(src, name) {
  const lines = src.split(/\r?\n/);
  const at = lines.findIndex((l) => new RegExp(`^${name}\\s*=\\s*\\[`).test(l));
  if (at < 0) throw new Error(`no "${name} = [" in ${FILE}`);
  const out = [];
  let rest = lines[at].slice(lines[at].indexOf('[') + 1);
  for (let n = at; ; rest = lines[++n]) {
    if (rest === undefined) throw new Error(`${name}: no closing ]`);
    let i = 0;
    while (i < rest.length) {
      const c = rest[i];
      if (/[\s,]/.test(c)) { i++; continue; }
      if (c === '#') break;
      if (c === ']') return out;
      const raw = c === 'r';
      const q = rest[raw ? i + 1 : i];
      if (q !== '"' && q !== "'") throw new Error(`${name}: an entry this does not read: ${rest.slice(i).trim()}`);
      const end = rest.indexOf(q, i + (raw ? 2 : 1));
      if (end < 0) throw new Error(`${name}: a string that does not close on its line`);
      const s = rest.slice(i + (raw ? 2 : 1), end);
      if (!raw && s.includes('\\')) throw new Error(`${name}: a non-raw string with a backslash: ${s}`);
      out.push(s);
      i = end + 1;
    }
  }
}
function scalarOf(src, name) {
  const m = src.match(new RegExp(`^${name}\\s*=\\s*(True|False|\\d+)\\s*(#.*)?$`, 'm'));
  if (!m) throw new Error(`no "${name} = True|False|<integer>" in ${FILE}`);
  return m[1] === 'True' ? true : m[1] === 'False' ? false : Number(m[1]);
}
function settingsOf(src, prod) {
  for (const name of Object.values(NAMES)) {
    const n = (src.match(new RegExp(`^${name}\\s*=`, 'gm')) ?? []).length;
    if (n !== 1) throw new Error(`${name} is assigned ${n} times in ${FILE}`);
    if (new RegExp(`${name}\\s*\\+=|${name}\\.(append|extend|insert|remove|pop)\\b`).test(src)) throw new Error(`${name} is changed after its assignment in ${FILE}`);
  }
  if (!/^from \.local import \*/m.test(prod)) throw new Error(`${PROD} no longer starts from "from .local import *"`);
  const own = prod.match(/^\s*(CORS_\w+)\s*[+]?=|(CORS_\w+)\.(append|extend|insert|remove)\b/m);
  if (own) throw new Error(`${PROD} sets ${own[1] ?? own[2]} itself`);
  const s = {};
  for (const [k, name] of Object.entries(NAMES)) s[k] = ['origins', 'origin_regexes', 'allow_headers', 'expose_headers'].includes(k) ? listOf(src, name) : scalarOf(src, name);
  for (const k of ['allow_all_origins', 'allow_credentials']) if (typeof s[k] !== 'boolean') throw new Error(`${NAMES[k]} is not True or False`);
  if (typeof s.preflight_max_age !== 'number') throw new Error(`${NAMES.preflight_max_age} is not an integer`);
  for (const r of s.origin_regexes) formOf(r);   // refuse a regex the page cannot write
  return s;
}

// A regex as the page writes it: `*` for one label ([\w-]+) or a port (\d+), anchors dropped.
// Anything else regex-like is refused, so a pattern the page cannot spell never passes as equal.
function formOf(re) {
  if (!re.startsWith('^') || !re.endsWith('$')) throw new Error(`origin regex ${re} is not anchored ^…$`);
  const s = re.slice(1, -1).replaceAll('[\\w-]+', '\u0001').replaceAll('\\d+', '\u0002');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && '.[]'.includes(s[i + 1])) { out += s[++i]; continue; }
    if ('\\.[](){}*+?|^$'.includes(c)) throw new Error(`origin regex ${re}: "${c}" is a form this does not read`);
    out += c === '\u0001' || c === '\u0002' ? '*' : c;
  }
  return out;
}
const regexesOf = (s) => s.origin_regexes.map((r) => new RegExp(r));
const allowed = (s, origin) => s.origins.includes(origin) || regexesOf(s).some((r) => r.test(origin));

function readKeel() {
  const git = (...a) => execFileSync('git', ['-C', KEEL, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try { git('fetch', '-q', 'origin'); } catch (e) {
    blind(`git fetch in ${KEEL} failed (${String(e.stderr || e.message).trim().split('\n')[0]}); origin/main cannot be trusted as published`);
  }
  let src, prod, commit;
  try {
    src = git('show', `origin/main:${FILE}`);
    prod = git('show', `origin/main:${PROD}`);
    commit = git('log', '-1', '--format=%h', 'origin/main', '--', FILE).trim();
  } catch (e) { blind(`cannot read origin/main:${FILE} in ${KEEL} (${String(e.stderr || e.message).trim().split('\n')[0]})`); }
  try { return { commit, ...settingsOf(src, prod) }; } catch (e) { blind(e.message); }
}

// One list per line, so a diff names the one that moved.
const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`keel ${FILE} on origin/main (${PROD} imports it): ${Object.values(NAMES).join(', ')}`)},`,
  `  "commit": ${JSON.stringify(s.commit)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  ...Object.keys(NAMES).map((k, i, a) => `  ${JSON.stringify(k)}: ${JSON.stringify(s[k])}${i < a.length - 1 ? ',' : ''}`),
  '}',
  '',
].join('\n');
const body = (s) => JSON.stringify(Object.keys(NAMES).map((k) => s[k]));
const summary = (s) => `${s.origins.length} origins, ${s.origin_regexes.length} origin regexes, ${s.allow_headers.length} allowed and ${s.expose_headers.length} exposed headers, credentials ${s.allow_credentials ? 'on' : 'off'}, max age ${s.preflight_max_age}`;
const readSnap = () => { try { return JSON.parse(readFileSync(SNAP, 'utf8')); } catch { return null; } };

if (args.has('--source') || args.has('--refresh')) {
  const keel = readKeel();
  const snap = readSnap();
  const unchanged = snap && body(snap) === body(keel);
  if (args.has('--refresh')) {
    const out = unchanged ? snap : { ...keel, read_at: new Date().toISOString().slice(0, 10) };
    if (!unchanged) writeFileSync(SNAP, format(out));
    console.log(`verify-cors: ${unchanged ? 'contract/cors.json unchanged' : 'wrote contract/cors.json'}: ${summary(out)}, keel ${out.commit}, read ${out.read_at}`);
  } else {
    if (!snap) { console.log('verify-cors: STALE: contract/cors.json missing or unreadable; run --refresh'); process.exit(1); }
    const moved = snap.commit !== keel.commit ? `; ${FILE} has moved since (now ${keel.commit}), its CORS settings unchanged` : '';
    if (unchanged) { console.log(`verify-cors: contract/cors.json matches keel origin/main (read at ${snap.commit}, ${snap.read_at}${moved}): ${summary(keel)}`); process.exit(0); }
    console.log(`verify-cors: STALE: keel origin/main at ${keel.commit} differs from contract/cors.json (read at ${snap.commit}, ${snap.read_at}); run --refresh, then mend the page`);
    for (const k of Object.keys(NAMES)) {
      if (JSON.stringify(snap[k]) === JSON.stringify(keel[k])) continue;
      if (Array.isArray(keel[k]) && Array.isArray(snap[k])) {
        for (const v of keel[k]) if (!snap[k].includes(v)) console.log(`  ${NAMES[k]}: ${v} added`);
        for (const v of snap[k]) if (!keel[k].includes(v)) console.log(`  ${NAMES[k]}: ${v} removed`);
        if (JSON.stringify([...snap[k]].sort()) === JSON.stringify([...keel[k]].sort())) console.log(`  ${NAMES[k]}: its order changed`);
      } else console.log(`  ${NAMES[k]}: ${JSON.stringify(snap[k])} -> ${JSON.stringify(keel[k])}`);
    }
    process.exit(1);
  }
}

let snap = readSnap();
if (!snap) blind('contract/cors.json unreadable; run --refresh');
try { for (const r of snap.origin_regexes) formOf(r); } catch (e) { blind(`contract/cors.json: ${e.message}`); }

// ---- the live server against the snapshot -------------------------------------------------------
if (args.has('--live')) {
  const exact = 'https://onlyworlds.github.io';   // the docs' own origin
  if (!snap.origins.includes(exact)) blind(`${exact} is no longer an exact origin in contract/cors.json; pick another sample`);
  const viaRegex = snap.origin_regexes.map(formOf).find((f) => f.startsWith('https://*.') && f.split('*').length === 2)?.replace('*', 'docs-check');
  if (!viaRegex) blind('contract/cors.json has no https://*.<host> regex to sample');
  const none = 'https://docs-check.example';
  if (allowed(snap, none)) blind(`${none} is allowed by contract/cors.json; pick another refused sample`);
  const ask = async (method, origin) => {
    const headers = { Origin: origin };
    if (method === 'OPTIONS') Object.assign(headers, { 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'api-key,api-pin,if-match' });
    else headers['API-Key'] = DEMO_KEY;
    const r = await fetch(URL_, { method, headers, signal: AbortSignal.timeout(20000) });
    await r.arrayBuffer();
    return r;
  };
  let answers;
  try {
    answers = { exact: await ask('OPTIONS', exact), viaRegex: await ask('OPTIONS', viaRegex), none: await ask('OPTIONS', none), get: await ask('GET', exact) };
  } catch (e) { blind(`${URL_} (${e.message})`); }
  const fails = [];
  const list = (r, h) => (r.headers.get(h) ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const sameSet = (got, want, what) => {
    const w = want.map((x) => x.toLowerCase());
    for (const x of w) if (!got.includes(x)) fails.push(`${what}: ${x} is in contract/cors.json, not in the answer`);
    for (const x of got) if (!w.includes(x)) fails.push(`${what}: ${x} is in the answer, not in contract/cors.json`);
  };
  for (const [name, origin] of [['exact', exact], ['viaRegex', viaRegex]]) {
    const r = answers[name];
    const what = `the preflight from ${origin}`;
    if (r.headers.get('access-control-allow-origin') !== origin) { fails.push(`${what}: Access-Control-Allow-Origin is ${JSON.stringify(r.headers.get('access-control-allow-origin'))}, not the origin (HTTP ${r.status})`); continue; }
    sameSet(list(r, 'access-control-allow-headers'), snap.allow_headers, `${what}, Access-Control-Allow-Headers`);
    const age = r.headers.get('access-control-max-age');
    if (Number(age) !== snap.preflight_max_age) fails.push(`${what}: Access-Control-Max-Age is ${JSON.stringify(age)}; contract/cors.json says ${snap.preflight_max_age}`);
    const cred = r.headers.get('access-control-allow-credentials') === 'true';
    if (cred !== snap.allow_credentials) fails.push(`${what}: credentials ${cred ? 'allowed' : 'not allowed'}; contract/cors.json says ${snap.allow_credentials ? 'allowed' : 'not allowed'}`);
  }
  const g = answers.get;
  if (g.headers.get('access-control-allow-origin') !== exact) fails.push(`the GET from ${exact}: Access-Control-Allow-Origin is ${JSON.stringify(g.headers.get('access-control-allow-origin'))} (HTTP ${g.status})`);
  else sameSet(list(g, 'access-control-expose-headers'), snap.expose_headers, `the GET from ${exact}, Access-Control-Expose-Headers`);
  const leak = answers.none.headers.get('access-control-allow-origin');
  if (leak !== null) fails.push(`the preflight from ${none}, which no pattern allows: Access-Control-Allow-Origin is ${JSON.stringify(leak)}`);
  console.log(`  not checked  the other ${snap.origin_regexes.length - 1} origin regexes and ${snap.origins.length - 1} exact origins over the wire: a regex cannot be enumerated live, so the set is held to keel's settings (--source), the answer only for ${exact}, ${viaRegex} and ${none}`);
  for (const f of fails) console.log(`  FAIL  ${f}`);
  if (fails.length) { console.log(`verify-cors: STALE: the live server differs from contract/cors.json (read at ${snap.commit}, ${snap.read_at}): ${fails.length} difference(s); read keel's settings (--source), then mend the page`); process.exit(1); }
  console.log(`verify-cors: the live server matches contract/cors.json (read at ${snap.commit}, ${snap.read_at}) for the samples: ${summary(snap)}`);
  process.exit(0);
}

// ---- the page against the snapshot ----------------------------------------------------------------
const page = readFileSync(PAGE, 'utf8').replace(/\r\n/g, '\n');
const fails = [];
const fail = (m) => fails.push(m);
const section = (head) => {
  const i = page.indexOf(`\n## ${head}\n`);
  if (i < 0) blind(`the CORS page has no "## ${head}" section`);
  const rest = page.slice(i + head.length + 5);
  const j = rest.search(/\n## /);
  return j < 0 ? rest : rest.slice(0, j);
};
const ticks = (s) => [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

// ---- the origins table ----
const forms = new Map(snap.origin_regexes.map((r) => [formOf(r), r]));
const named = new Map();   // origin as the page writes it -> its platform
for (const line of section('Allowed origins').split('\n')) {
  const c = line.split('|').slice(1, -1).map((x) => x.trim());
  if (c.length !== 2 || /^:?-+/.test(c[0]) || c[0] === 'Platform') continue;
  const anyPort = /\bon any port\s*$/.test(c[1]);
  for (let o of ticks(c[1])) {
    if (!/^https?:\/\//.test(o)) { fail(`${c[0]}: \`${o}\` has no scheme (an origin is scheme://host[:port])`); continue; }
    if (anyPort) o += ':*';
    if (named.has(o)) fail(`${o} is named twice (${named.get(o)}, ${c[0]})`);
    named.set(o, c[0]);
  }
}
if (!named.size) blind('no origin rows found under "## Allowed origins"');
for (const [f, r] of forms) if (!named.has(f)) fail(`${f}: keel allows it (${r}), the table does not name it`);
for (const o of snap.origins) {
  if (!named.has(o) && !regexesOf(snap).some((r) => r.test(o))) fail(`${o}: keel allows it (CORS_ALLOWED_ORIGINS), no regex covers it, and the table does not name it`);
}
for (const [o, p] of named) if (!forms.has(o) && !snap.origins.includes(o)) fail(`${o} (${p}): named on the page, but keel allows no such origin or pattern`);
const covered = snap.origins.filter((o) => !named.has(o) && regexesOf(snap).some((r) => r.test(o)));
if (snap.allow_all_origins) fail('keel allows every origin (CORS_ALLOW_ALL_ORIGINS), and the page says any other origin gets no CORS headers');

// ---- the headers, credentials and cache ----
const heads = section('Headers');
const bullet = (lead) => {
  const l = heads.split('\n').find((x) => x.startsWith(`- ${lead}`));
  if (!l) blind(`no "- ${lead}" line under "## Headers"`);
  return l;
};
const firstSentence = (l) => { const m = l.match(/^(.*?\.)(\s|$)/); return m ? m[1] : l; };
const sameHeaders = (line, want, what, name) => {
  const got = ticks(firstSentence(line));
  const g = got.map((x) => x.toLowerCase());
  const w = want.map((x) => x.toLowerCase());
  for (let i = 0; i < want.length; i++) if (!g.includes(w[i])) fail(`${what}: keel's ${name} has ${want[i]}, the page does not name it`);
  g.forEach((x, i) => { if (!w.includes(x)) fail(`${what}: the page names ${got[i]}, which keel's ${name} does not have`); if (g.indexOf(x) !== i) fail(`${what}: ${got[i]} is named twice`); });
  return got.length;
};
const nReq = sameHeaders(bullet('**Request headers**'), snap.allow_headers, 'Request headers', NAMES.allow_headers);
const nRes = sameHeaders(bullet('**Response headers**'), snap.expose_headers, 'Response headers', NAMES.expose_headers);
const cred = bullet('**Credentials**');
const says = /\bnot allowed\b/.test(cred) ? false : /\ballowed\b/.test(cred) ? true : null;
if (says === null) blind(`the Credentials line says neither "allowed" nor "not allowed": ${cred}`);
if (says !== snap.allow_credentials) fail(`the page says credentials are ${says ? '' : 'not '}allowed; keel's ${NAMES.allow_credentials} is ${snap.allow_credentials ? 'True' : 'False'}`);
const cache = bullet('Preflight answers may be cached for ');
const UNITS = { second: 1, minute: 60, hour: 3600, day: 86400 };
const dm = cache.match(/cached for (an?|\d+) (second|minute|hour|day)s?\b/);
if (!dm) blind(`the preflight line's time is not "<n> seconds|minutes|hours|days" or "a day": ${cache}`);
const seconds = (/^\d+$/.test(dm[1]) ? Number(dm[1]) : 1) * UNITS[dm[2]];
if (seconds !== snap.preflight_max_age) fail(`the page says preflight answers may be cached for ${dm[1]} ${dm[2]} (${seconds} s); keel's ${NAMES.preflight_max_age} is ${snap.preflight_max_age}`);

if (covered.length) console.log(`  not named    ${covered.join(', ')}: exact origins a regex already allows`);
console.log('  not checked  the Platform column; the 503 line (the admission gate sends the CORS headers itself); the caution\'s advice');
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(`verify-cors: ${named.size} origins and patterns, ${nReq} request and ${nRes} response headers, credentials and max age held to contract/cors.json (keel ${snap.commit}, read ${snap.read_at})`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) on the CORS page`); process.exit(1); }
console.log('PASS');
