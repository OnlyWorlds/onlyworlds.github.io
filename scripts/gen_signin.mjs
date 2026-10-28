#!/usr/bin/env node
/**
 * gen_signin.mjs: the snapshot behind the sign-in figure on Sign in with OnlyWorlds, from the API's
 * own document, held to keel's code where a checkout can be read.
 *
 * Usage: node scripts/gen_signin.mjs                     compare contract/signin.json with the live document and keel
 *        node scripts/gen_signin.mjs --refresh           rewrite contract/signin.json from the live document
 *        node scripts/gen_signin.mjs --keel PATH [...]   a keel checkout other than ../keel
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json, vendored as contract/signin.json so a build
 * never depends on the API being up. The figure (SigninSteps, through signin.mjs) and
 * verify-figures.mjs read the snapshot. It keeps:
 *   - the authorize page: its address and parameters, and the query the browser comes back with, as
 *     GET /api/v2/auth/clients's description names them (the page is a site page, not an API route,
 *     so the document has it only in words);
 *   - POST /api/v2/auth/token: its security, its request body's fields and grant_type, the code's
 *     lifetime (the `code` field's "valid for N seconds"), and its 200 answer's fields and the token's
 *     prefix (the `token` field's description).
 * `read_at` is the day those last changed (a refresh that finds them equal keeps it).
 *
 * Then keel's code, from its published branch (git fetch, then git show origin/main:<file>, never
 * the working tree): the authorize path and its route, the parameter list, S256 as the only
 * method, the code's lifetime, the query a code and a Cancel come back with, the 302 and the 400
 * page, the token route's fields, its answer's keys and the token prefix. keel is private, so CI
 * never runs this half; a difference there is the document's words against keel's code, and goes
 * to keel's owner.
 *
 * Exit: 0 the snapshot matches both (or was rewritten and keel agrees), 1 STALE (or keel differs),
 * 2 BLIND (the document or keel unreadable, or a shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { CANCEL_ERROR, REDIRECT_STATUS, REFUSED_STATUS } from '../src/components/figures/signin.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'signin.json');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const argv = process.argv.slice(2);
const KEEL = resolve(argv.includes('--keel') ? argv[argv.indexOf('--keel') + 1] : join(ROOT, '..', 'keel'));
const say = (s) => console.log(`gen_signin: ${s}`);
const blindDoc = (why) => { say(`BLIND: ${why}`); process.exit(2); };

// The snapshot's facts from the document. Anything not in the shape read here is an error, never a guess.
function snapshotOf(doc) {
  const clients = doc.paths?.['/api/v2/auth/clients']?.get;
  const tokenPath = '/api/v2/auth/token';
  const token = doc.paths?.[tokenPath]?.post;
  if (!clients?.description) throw new Error('GET /api/v2/auth/clients has no description');
  if (!token) throw new Error(`no POST ${tokenPath}`);
  const words = clients.description.replace(/\s+/g, ' ');
  // "sends the browser to `https://…/signin/authorize` with `a`, `b`, … and `x=S256`; … back to `redirect_uri?code=...&state=...`"
  const to = words.match(/sends the browser to `(https:\/\/[^`]+)` with ((?:`[^`]+`(?:, | and ))+`[^`]+`);/);
  if (!to) throw new Error(`the clients route's description no longer reads "sends the browser to \`URL\` with \`…\`;": "${words}"`);
  const named = [...to[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const params = named.map((p) => p.split('=')[0]);
  const fixed = named.filter((p) => p.includes('='));
  if (fixed.length !== 1 || fixed[0].split('=')[0] !== 'code_challenge_method') throw new Error(`the description fixes ${fixed.join(', ') || 'no parameter'}; this reads only code_challenge_method=<method>`);
  const back = words.match(/comes back to `redirect_uri\?([^`]+)`/);
  if (!back) throw new Error('the clients route\'s description names no `redirect_uri?…` the browser comes back to');
  const body = token.requestBody?.content?.['application/json']?.schema;
  if (!body?.properties) throw new Error(`POST ${tokenPath} has no JSON request body`);
  const seconds = body.properties.code?.description?.match(/valid for (\d+) seconds/)?.[1];
  if (!seconds) throw new Error(`POST ${tokenPath}: the code field's description gives no "valid for N seconds"`);
  const answer = token.responses?.['200']?.content?.['application/json']?.schema;
  if (!answer?.properties) throw new Error(`POST ${tokenPath} has no JSON 200 answer`);
  const prefix = answer.properties.token?.description?.match(/`(ow_[a-z]+_)`/)?.[1];
  if (!prefix) throw new Error(`POST ${tokenPath}: the token field's description names no \`ow_x_\` prefix`);
  const grant = body.properties.grant_type?.const;
  if (!grant) throw new Error(`POST ${tokenPath}: grant_type is not a const`);
  return {
    authorize: {
      url: to[1],
      params,
      method: fixed[0].split('=')[1],
      back: back[1].split('&').map((kv) => kv.split('=')[0]),
    },
    token: {
      method: 'POST',
      path: tokenPath,
      security: token.security ?? doc.security ?? null,
      body: Object.keys(body.properties),
      required: body.required ?? [],
      grant_type: grant,
      code_seconds: Number(seconds),
      answer: Object.keys(answer.properties),
      prefix,
    },
  };
}

// The facts keel's code states, read from origin/main; each compared with the snapshot's.
function keelDiffs(s) {
  const git = (...a) => execFileSync('git', ['-C', KEEL, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('fetch', '-q', 'origin');
  const show = (f) => git('show', `origin/main:${f}`);
  const commit = git('log', '-1', '--format=%h', 'origin/main').trim();
  const portal = show('portal/signin.py'), signin = show('accounts/signin.py'), api = show('accounts/signin_api.py');
  const urls = show('config/urls.py'), models = show('accounts/models.py');
  const tuple = (src, name) => {
    const t = src.match(new RegExp(`^${name}\\s*=\\s*\\(([^)]*)\\)`, 'm'))?.[1];
    return t ? [...t.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : null;
  };
  const path = new URL(s.authorize.url).pathname;
  const diffs = [];
  const want = (what, got, exp) => { if (JSON.stringify(got) !== JSON.stringify(exp)) diffs.push(`${what}: keel's code has ${JSON.stringify(got)}, the figure ${JSON.stringify(exp)}`); };
  want('portal/signin.py AUTHORIZE_PATH', portal.match(/^AUTHORIZE_PATH\s*=\s*"([^"]+)"/m)?.[1], path);
  want('config/urls.py: the authorize page\'s route', /path\("([^"]+)",\s*portal_signin\.authorize\b/.exec(urls)?.[1], path.slice(1));
  want('accounts/signin.py _PARAMS', tuple(signin, '_PARAMS'), s.authorize.params);
  want('accounts/signin.py: the one method validate_authorize takes', signin.match(/if method != "([^"]+)":\s*\n\s*raise Refusal/)?.[1], s.authorize.method);
  want('accounts/signin.py CODE_SECONDS', Number(signin.match(/^CODE_SECONDS\s*=\s*(\d+)/m)?.[1]), s.token.code_seconds);
  // the 302 back with a code and its state, the Cancel's error, the refusal's page status
  const backs = [...portal.matchAll(/HttpResponseRedirect\(signin\.back_to_tool\(\s*p\["redirect_uri"\],\s*([^)]*?)\)\)\)/g)].map((m) => [...m[1].matchAll(/(\w+)=/g)].map((k) => k[1]));
  want('portal/signin.py: the redirect a code goes back in', backs.find((b) => b.includes('code')) ?? null, s.authorize.back);
  want('portal/signin.py: the Cancel\'s error', portal.match(/decision == "cancel"[\s\S]*?error="([a-z_]+)"/)?.[1], CANCEL_ERROR);
  want('portal/signin.py: a redirect is HttpResponseRedirect (302)', /HttpResponseRedirect\(signin\.back_to_tool/.test(portal) ? 302 : null, REDIRECT_STATUS);
  want('portal/signin.py: a refusal\'s page status', Number(portal.match(/except signin\.Refusal as refusal:\s*\n\s*return _page\([^\n]*status=(\d+)\)/)?.[1]), REFUSED_STATUS);
  want('accounts/signin_api.py: the token route', api.match(/@router\.post\("([^"]+)"[^\n]*\n\s*def exchange_signin_code/)?.[1], s.token.path.replace('/api/v2/auth', ''));
  want('accounts/signin_api.py: the fields it reads', ['grant_type', ...(tuple(api, '_FIELDS') ?? [])], s.token.body);
  want('accounts/signin_api.py: the grant_type it takes', api.match(/payload\.get\("grant_type"\) != "([^"]+)"/)?.[1], s.token.grant_type);
  const ok = api.match(/return _no_store\(JsonResponse\(\{([\s\S]*?)\n\s*\}\)\)/)?.[1] ?? '';
  want('accounts/signin_api.py: the answer\'s keys', [...ok.matchAll(/^\s*"([a-z_]+)":/gm)].map((m) => m[1]), s.token.answer);
  want('accounts/models.py AccountToken.PREFIX', models.match(/class AccountToken\b[\s\S]*?PREFIX\s*=\s*"([^"]+)"/)?.[1], s.token.prefix);
  return { commit, diffs };
}

let doc;
try {
  const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  doc = await r.json();
} catch (e) { blindDoc(`${OPENAPI} unreadable (${e.message})`); }
let live;
try { live = snapshotOf(doc); } catch (e) { blindDoc(e.message); }

const stable = (o) => JSON.stringify(o, null, 2) + '\n';
let old = null;
try { old = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable: STALE below */ }
const same = old && stable({ authorize: old.authorize, token: old.token }) === stable(live);
let code = 0;
if (argv.includes('--refresh')) {
  const readAt = same ? old.read_at : new Date().toISOString().slice(0, 10);
  writeFileSync(SNAP, stable({ source: `${OPENAPI}: GET /api/v2/auth/clients's description (the authorize page) and POST /api/v2/auth/token`, read_at: readAt, ...live }));
  say(`wrote contract/signin.json from the live document${same ? ' (unchanged, read_at kept)' : ''}`);
} else if (!old) {
  say('STALE: contract/signin.json missing or unreadable; run --refresh');
  code = 1;
} else if (!same) {
  for (const half of ['authorize', 'token']) for (const k of Object.keys(live[half])) {
    if (JSON.stringify(live[half][k]) !== JSON.stringify(old[half]?.[k])) say(`STALE: ${half}.${k} is ${JSON.stringify(live[half][k])} live, ${JSON.stringify(old[half]?.[k])} in the snapshot`);
  }
  say('the snapshot differs from the live document: node scripts/gen_signin.mjs --refresh');
  code = 1;
} else {
  say(`contract/signin.json matches the live document (read ${old.read_at})`);
}
let k;
try { k = keelDiffs(live); } catch (e) {
  say(`BLIND: keel's code at ${KEEL} not read (${String(e.stderr || e.message).trim().split('\n')[0]}); the document's words were not held to it`);
  process.exit(code || 2);
}
for (const d of k.diffs) say(`KEEL DIFFERS: ${d}`);
if (k.diffs.length) {
  // the figure's facts are the document's (the snapshot) and signin.mjs's three words: a document
  // behind keel's code goes to keel's owner; a word of signin.mjs behind it is corrected here
  say(`keel's code at ${k.commit} disagrees with the figure: a fact from the document goes to keel's owner, a word of signin.mjs is corrected here`);
  process.exit(1);
}
say(`keel's code at ${k.commit} says the same: the authorize path and its ${live.authorize.params.length} parameters, ${live.authorize.method} only, a ${live.token.code_seconds}-second code, the ${REDIRECT_STATUS} with ${live.authorize.back.join(' and ')} or ${CANCEL_ERROR}, the ${REFUSED_STATUS} page, the token route's fields, its answer and the ${live.token.prefix} prefix`);
process.exit(code);
