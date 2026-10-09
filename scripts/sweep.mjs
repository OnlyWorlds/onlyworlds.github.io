#!/usr/bin/env node
/**
 * sweep.mjs: what has moved under the docs since the last sweep, and what in them is already stale?
 *
 * Run:  node scripts/sweep.mjs [--no-links] [--no-deck] [--since YYYY-MM-DD]
 *
 * The docs state facts owned elsewhere (the API, the SDKs, the schema, the tools). The gates catch
 * what they can name: URLs (verify-urls), error codes (gen_errors), the element tables (the build).
 * This reads the rest. It prints two lists:
 *
 *   CHECKS   things that can be measured, each PASS or STALE: the SDK pin the reference is generated
 *            from against npm; the error-code snapshot against keel's live list; the routes in the
 *            API reference against keel's OpenAPI; every external link; words the docs must not use.
 *   MOVED    what changed in the sources since the last sweep (SWEEP.md's "Last swept"): commit
 *            subjects from keel, schema-dist, the SDK, the Python package, Atlas, the Unity SDK and
 *            the Obsidian plugin. These are for reading against the pages that state them; no script
 *            can judge a sentence.
 *
 * The procedure (what to read, what to stamp) is SWEEP.md. Exit 1 when a CHECK is STALE. A run
 * reports to the Deck's gates badge (docs-sweep, weekly), which goes red by itself when a week and
 * a week more pass without one.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OW = resolve(ROOT, '..');
const CARRIER = 'C:/Users/Titus/Carrier';
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';

const stale = [];
let deckLine = 'crashed before a verdict';
process.on('exit', (code) => {
  if (flag('--no-deck') || deckLine === null) return;
  try {
    execFileSync('python', [`${CARRIER}/Comms/deck/bell.py`, 'gate', 'docs-sweep', '--as', 'Kael', '--exit', String(code),
      '--line', deckLine, '--cadence', '7d', '--for', 'Kael'], { stdio: 'ignore', timeout: 10000 });
  } catch { /* the badge mirrors the gate; never a reason to fail */ }
});
const pass = (m) => console.log(`  PASS   ${m}`);
const bad = (m) => { stale.push(m); console.log(`  STALE  ${m}`); };
const note = (m) => console.log(`  note   ${m}`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const pages = walk(join(ROOT, 'src', 'content')).filter((f) => /\.mdx?$/.test(f));
const rel = (f) => relative(join(ROOT, 'src', 'content', 'docs'), f).replace(/\\/g, '/');
const sh = (cmd, args, cwd) => {
  try { return execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'], shell: cmd === 'npm' }).trim(); }
  catch { return null; }
};

// ---- last swept ---------------------------------------------------------------------------------
const sweepMd = existsSync(join(ROOT, 'SWEEP.md')) ? readFileSync(join(ROOT, 'SWEEP.md'), 'utf8') : '';
const stamp = (sweepMd.match(/\*\*Last swept\*\*:\s*(\d{4}-\d{2}-\d{2})/) ?? [])[1];
const SINCE = arg('--since', stamp ?? '2026-10-01');
console.log(`docs sweep, ${pages.length} pages; last swept ${stamp ?? 'never (using ' + SINCE + ')'}; reading changes since ${SINCE}`);
console.log('');
console.log('CHECKS');

// ---- 1: the SDK the reference is generated from ----------------------------------------------------
{
  const pinned = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).devDependencies?.['@onlyworlds/sdk'];
  const latest = sh('npm', ['view', '@onlyworlds/sdk', 'version'], ROOT);
  if (!latest) note('could not ask npm for the SDK version: the pin was not checked');
  else if (pinned !== latest) bad(`the TypeScript reference is generated from @onlyworlds/sdk ${pinned}; npm's latest is ${latest} (bump the dev dependency, rebuild)`);
  else pass(`the TypeScript reference is generated from the latest SDK (${latest})`);
}

// ---- 2: keel's error list against the vendored snapshot -----------------------------------------------
{
  const out = sh('node', ['scripts/gen_errors.mjs', '--live'], ROOT);
  if (out === null) bad('the error-code snapshot differs from keel\'s live list (node scripts/gen_errors.mjs --refresh)');
  else pass('the error-code snapshot matches keel\'s live list');
}

// ---- 3: the API reference against keel's OpenAPI ---------------------------------------------------------
let openapi = null;
try {
  openapi = await (await fetch(OPENAPI, { signal: AbortSignal.timeout(20000) })).json();
} catch (e) { note(`could not read keel's OpenAPI (${e.message}): the routes were not checked`); }
if (openapi?.paths) {
  const TYPES = 'ability character collective construct creature event family institution language law location map marker narrative object phenomenon pin relation species title trait zone'.split(' ');
  // /api/v2/<type>[/<id>[/links/<field>]] all become {type} routes, ids and params become {}
  const norm = (p) => p.replace(/^\/api\/v2\/\{[^}]+\}/, '/api/v2/{type}').replace(/\{[^}]+\}/g, (m) => (m === '{type}' ? m : '{}')).replace(/\/+$/, '')
    .replace(new RegExp(`^/api/v2/(${TYPES.join('|')})(?=/|$)`), '/api/v2/{type}');
  const apiPaths = new Set(Object.keys(openapi.paths).map(norm));
  const refText = ['docs/development/api-reference.md', 'docs/development/api/reads.md', 'docs/development/api/writes.md']
    .map((f) => join(ROOT, 'src/content/docs', f)).filter(existsSync).map((f) => readFileSync(f, 'utf8')).join('\n')
    + pages.filter((f) => /docs\/development\/api\//.test(f.replace(/\\/g, '/'))).map((f) => readFileSync(f, 'utf8')).join('\n');
  const mentioned = new Set([...refText.matchAll(/\/api\/v2\/([a-z_{}/-]+)/g)].map((m) => norm('/api/v2/' + m[1].replace(/\/(\{[^}]+\}|[0-9a-f-]{8,})(?=\/|$)/g, '/{}'))));
  const allText = pages.map((f) => readFileSync(f, 'utf8')).join('\n');
  const everyMention = new Set([...allText.matchAll(/\/api\/v2\/([A-Za-z0-9_{}/-]+)/g)].map((m) => norm('/api/v2/' + m[1].replace(/\/(\{[^}]+\}|[0-9a-f-]{8,})(?=\/|$)/g, '/{}'))));
  const missing = [...apiPaths].filter((p) => p !== '/api/v2/health/deep' /* internal: Boss's deep check */ && !mentioned.has(p) && !everyMention.has(p) && !allText.includes(p.replace(/\/\{\}/g, '/{id}')));
  if (missing.length) bad(`routes in keel's OpenAPI that the API pages never mention: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ` (+${missing.length - 8})` : ''}`);
  else pass('every top-level route in keel\'s OpenAPI is mentioned in the API pages');
}

// ---- 4: words the docs must not use ----------------------------------------------------------------------------
{
  const rules = [
    [/\bfactions?\b/i, 'a faction is not an OnlyWorlds element (use Family, Collective or Institution)'],
    [/\bopen schema\b/i, 'the term rule: the standard names the thing; "schema" only the files'],
    [/pip install onlyworlds/i, 'the Python package is not on PyPI'],
    [/api\/worldapi/i, null], // legacy v1 path: allowed only on the legacy pages, reported below
  ];
  let found = 0;
  for (const f of pages) {
    // table rows map a game's own words to elements ("Rules of a faction | Law"): the left side is theirs, not ours
    const text = readFileSync(f, 'utf8').split('\n').filter((l) => !l.trimStart().startsWith('|')).join('\n');
    for (const [re, why] of rules) {
      if (!why) continue;
      const m = text.match(re);
      if (m) { found++; bad(`${rel(f)}: "${m[0]}": ${why}`); }
    }
  }
  if (!found) pass('no page uses a word on the do-not-use list');
  // not a failure, a reading list: the definition and the 22 types restated
  const restated = pages.filter((f) => /22 (element )?(categories|types)|typed (and linked )?across 22/i.test(readFileSync(f, 'utf8'))).map(rel);
  note(`${restated.length} pages restate the 22 categories (read for repeats of what OnlyWorlds is): ${restated.slice(0, 12).join(', ')}${restated.length > 12 ? ', ...' : ''}`);
}

// ---- 5: every external link ---------------------------------------------------------------------------------------
if (!flag('--no-links')) {
  const urls = new Map();
  for (const f of pages) {
    for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/[^\s)<>"'`\]]+/g)) {
      const u = m[0].replace(/[.,;:]+$/, '');
      // API addresses need a key or a method (401, 405 by design): the routes check covers them; so does a wildcard or a placeholder
      if (!/^https?:\/\/(localhost|127\.|example\.|onlyworlds\.github\.io|upload\.onlyworlds\.com)/.test(u)
        && !/^https:\/\/www\.onlyworlds\.com\/(api\/|mcp)/.test(u) && !/[*{[]/.test(u) && !urls.has(u)) urls.set(u, rel(f));
    }
  }
  const list = [...urls.entries()];
  const failures = [];
  const ALLOW = new Set([403, 429, 999]); // hosts that refuse scripts, not dead links
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const [u, f] = list[i++];
      try {
        let r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
        if (r.status >= 400 && r.status !== 404) r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
        if (r.status >= 400 && !ALLOW.has(r.status)) failures.push(`${u} (${r.status}) in ${f}`);
      } catch (e) { failures.push(`${u} (${e.cause?.code ?? e.name}) in ${f}`); }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (failures.length) { for (const x of failures) bad(`link: ${x}`); }
  else pass(`${list.length} external links answer`);
} else note('external links skipped (--no-links)');

// ---- what moved ----------------------------------------------------------------------------------------------------------
console.log('');
console.log(`MOVED since ${SINCE} (read each against the page that states it; SWEEP.md says which)`);
const repos = [
  ['keel (API, MCP, web)', `${OW}/keel`, ['--', 'elements', 'core', 'mcp_server', 'docs/spec', 'accounts']],
  ['schema-dist', `${OW}/schema-dist`, []],
  ['@onlyworlds/sdk', `${OW}/sdk`, []],
  ['python package', `${OW}/onlyworlds-python`, []],
  ['Atlas', `${CARRIER}/Forge/tools/atlas`, ['--', 'src/changelog']],
  ['Unity SDK', `${CARRIER}/Armature/projects/ow-sdk`, ['--', 'Packages']],
  ['Obsidian plugin', `${OW}/obsidian-plugin`, []],
];
for (const [name, dir, extra] of repos) {
  const args = ['log', `--since=${SINCE}`, '--no-merges', '--format=%h %ad %s', '--date=short', ...extra];
  const out = existsSync(dir) ? sh('git', args, dir) : null;
  if (out === null) { console.log(`  ${name}: could not read ${dir}`); continue; }
  const lines = out.split('\n').filter(Boolean);
  console.log(`  ${name}: ${lines.length} commit(s)`);
  for (const l of lines.slice(0, 12)) console.log(`      ${l.slice(0, 150)}`);
  if (lines.length > 12) console.log(`      ... +${lines.length - 12} more (git log in ${dir})`);
}

console.log('');
if (stale.length) { console.log(`STALE — ${stale.length} check(s) failed. Fix them, then read the MOVED list against the pages (SWEEP.md).`); deckLine = `STALE — ${stale.length} check(s) failed`; process.exit(1); }
console.log('PASS — every check holds. The MOVED list is still yours to read (SWEEP.md), then stamp "Last swept".');
deckLine = 'PASS — every check holds';
process.exit(0);
