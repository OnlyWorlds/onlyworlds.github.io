#!/usr/bin/env node
/**
 * sweep.mjs: what has moved under the docs since the last sweep, and what in them is already stale?
 *
 * Run:  node scripts/sweep.mjs [--no-links] [--no-deck] [--since YYYY-MM-DD]
 *
 * The docs state facts owned elsewhere (the API, the SDKs, the schema, the tools). The gates catch
 * what they can name: URLs (verify-urls), error codes (gen_errors), the element tables (the build), the MCP page's tables (verify-mcp).
 * This reads the rest. It prints two lists:
 *
 *   CHECKS   things that can be measured, each PASS or STALE: the SDK pin the reference is generated
 *            from against npm; the error-code snapshot against keel's live list; the palettes
 *            snapshot against keel's palette table (on a machine with keel); the credentials
 *            snapshot against the API document's security; the sign-in snapshot against the API
 *            document and keel's code (on a machine with keel); the time snapshot against
 *            schema-dist's newest tag, the API document and the demo world; the public view
 *            snapshot against keel's public reader (on a machine with keel); the write body
 *            snapshot against the API document's write schemas; the draught snapshot against
 *            the API document's context route; the proposals snapshot against the API
 *            document's proposal routes, queue and schemas; the MCP snapshot against the
 *            live MCP server's tools and resources; the routes in the
 *            API reference against keel's OpenAPI; every external link; words the docs must not use;
 *            every release since the last sweep (the packages, the Unity SDK, the plugin, the toolkit,
 *            schema-dist's serials) against the changelog.
 *   MOVED    what changed in the sources since the last sweep (SWEEP.md's "Last swept"): commit
 *            subjects from keel, schema-dist, the SDK, the Python package, Atlas, the Unity SDK and
 *            the Obsidian plugin. These are for reading against the pages that state them; no script
 *            can judge a sentence.
 *
 * The procedure (what to read, what to stamp) is SWEEP.md. Exit 1 when a CHECK is STALE. A run
 * reports its verdict to the command in sweep.local.json, if one is set (--no-deck skips it).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OW = resolve(ROOT, '..');
// Per-machine settings, gitignored: checkouts that are not siblings of this folder, and a command each
// run reports its verdict to. sweep.local.json: {"repos": {"Atlas": "<dir>", "Unity SDK": "<dir>"},
// "report": ["<program>", "<arg>", ...]}; the run appends --exit <code> --line <verdict> to "report".
const LOCAL = (() => { try { return JSON.parse(readFileSync(join(ROOT, 'sweep.local.json'), 'utf8')); } catch { return {}; } })();
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';

const stale = [];
let deckLine = 'crashed before a verdict';
process.on('exit', (code) => {
  if (flag('--no-deck') || deckLine === null || !Array.isArray(LOCAL.report) || !LOCAL.report.length) return;
  try {
    const [cmd, ...rest] = LOCAL.report;
    execFileSync(cmd, [...rest, '--exit', String(code), '--line', deckLine], { stdio: 'ignore', timeout: 10000 });
  } catch { /* the report mirrors the verdict; never a reason to fail */ }
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

// ---- 2b: keel's palette table against the vendored snapshot (keel is private: read from its local
// checkout's origin/main, so only a machine with keel can run this; exit 2 from the reader is BLIND) -------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_palettes.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the palettes snapshot matches keel\'s palette table on origin/main');
  else if (code === 1) bad('the palettes snapshot differs from keel\'s palette table (node scripts/gen_palettes.mjs --refresh)');
  else note('could not read keel\'s palette table (node scripts/gen_palettes.mjs says why): the palettes were not checked');
}

// ---- 2c: the API document's security against the credentials figure's snapshot (exit 2 from the
// reader is BLIND: the document unreadable, never a pass) ---------------------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_callers.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the credentials snapshot matches the live API document');
  else if (code === 1) bad('the credentials snapshot differs from the live API document (node scripts/gen_callers.mjs says which routes; --refresh)');
  else note('could not read the live API document (node scripts/gen_callers.mjs says why): the credentials snapshot was not checked');
}

// ---- 2d: the sign-in figure's snapshot against the API document, and the document's words against
// keel's code on origin/main (exit 2 from the reader is BLIND: either unreadable, never a pass) -------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_signin.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the sign-in snapshot matches the live API document, and keel\'s code says the same');
  else if (code === 1) bad('the sign-in snapshot differs from the live API document, or the document from keel\'s code (node scripts/gen_signin.mjs says which)');
  else note('could not read the live API document or keel\'s code (node scripts/gen_signin.mjs says why): the sign-in snapshot was not checked');
}

// ---- 2e: the time figure's snapshot against schema-dist's newest tag, the API document and the demo
// world (exit 2 from the reader is BLIND: a source unreadable, never a pass) ------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_time.mjs'], { cwd: ROOT, timeout: 90000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the time snapshot matches schema-dist\'s newest tag, the API document and Moppetopia');
  else if (code === 1) bad('the time snapshot differs from schema-dist\'s newest tag, the API document or Moppetopia (node scripts/gen_time.mjs says which)');
  else note('could not read schema-dist, the API document or Moppetopia (node scripts/gen_time.mjs says why): the time snapshot was not checked');
}

// ---- 2f: the public view figure's snapshot against keel's public reader on origin/main (exit 2 from
// the reader is BLIND: keel unreadable, never a pass) ---------------------------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_public.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the public view snapshot matches keel\'s public reader on origin/main');
  else if (code === 1) bad('the public view snapshot differs from keel\'s public reader (node scripts/gen_public.mjs says which; --refresh)');
  else note('could not read keel\'s code (node scripts/gen_public.mjs says why): the public view snapshot was not checked');
}

// ---- 2g: the write body figure's snapshot against the API document's write schemas (exit 2 from the
// reader is BLIND: the document unreadable, never a pass) ---------------------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_write.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the write body snapshot matches the live API document');
  else if (code === 1) bad('the write body snapshot differs from the live API document (node scripts/gen_write.mjs says which fields; --refresh)');
  else note('could not read the live API document (node scripts/gen_write.mjs says why): the write body snapshot was not checked');
}

// ---- 2h: the draught figure's snapshot against the API document's context route (exit 2 from the
// reader is BLIND: the document unreadable, never a pass) ---------------------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_draught.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the draught snapshot matches the live API document');
  else if (code === 1) bad('the draught snapshot differs from the live API document (node scripts/gen_draught.mjs says which parameters or keys; --refresh)');
  else note('could not read the live API document (node scripts/gen_draught.mjs says why): the draught snapshot was not checked');
}

// ---- 2i: the proposals figure's snapshot against the API document's proposal routes, queue and schemas
// (exit 2 from the reader is BLIND: the document unreadable, never a pass) --------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/gen_proposals.mjs'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the proposals snapshot matches the live API document');
  else if (code === 1) bad('the proposals snapshot differs from the live API document (node scripts/gen_proposals.mjs says which routes or schemas; --refresh)');
  else note('could not read the live API document (node scripts/gen_proposals.mjs says why): the proposals snapshot was not checked');
}

// ---- 2j: the MCP page's snapshot against the live MCP server's tool and resource lists (exit 2 from the
// reader is BLIND: the server unreadable, never a pass) ---------------------------------------------------
{
  let code = 0;
  try { execFileSync('node', ['scripts/verify-mcp.mjs', '--live'], { cwd: ROOT, timeout: 60000, stdio: 'ignore' }); }
  catch (e) { code = e.status ?? 2; }
  if (code === 0) pass('the MCP snapshot matches the live server\'s tools and resources');
  else if (code === 1) bad('the MCP snapshot differs from the live server (node scripts/verify-mcp.mjs --live says which tools or parameters; --refresh, then mend the page)');
  else note('could not read the live MCP server (node scripts/verify-mcp.mjs --live says why): the MCP snapshot was not checked');
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
  const refText = ['docs/development/api-reference.mdx','docs/development/api/reads.md', 'docs/development/api/writes.md']
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
    [/git\+https:\/\/github\.com\/OnlyWorlds\/python-sdk/i, 'the Python package is on PyPI since 2026-10-11: pip install onlyworlds'],
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
      // API addresses need a key or a method (401, 405 by design): the routes check covers them; so does a wildcard or a placeholder.
      // The image edge's bare root is a prefix in the text (a key follows it), and the edge serves no root page: 404 by design.
      // A join link, the sign-in handoff's pages and the account's pages answer 400 or 404 without their code, parameters or session (by design;
      // the text shows their shape with a placeholder the URL scan stops at, `<world_id>`): Boss's signin-host gate and the live walks cover them.
      if (u === 'https://media.onlyworlds.com/') continue;
      if (!/^https?:\/\/(localhost|127\.|example\.|onlyworlds\.github\.io|upload\.onlyworlds\.com)/.test(u)
        && !/^https:\/\/www\.onlyworlds\.com\/(api\/|mcp|join\/|signin\/|account\/)/.test(u) && !/^https:\/\/atlas\.onlyworlds\.com\/signin\//.test(u) && !/[*{[]/.test(u) && !urls.has(u)) urls.set(u, rel(f));
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

// ---- 6: every release since the last sweep has its changelog line ---------------------------------------
// A tag ships without a commit the MOVED list makes stand out (Unity 0.21.0 and 0.23.0 were missed that way,
// 2026-10-27). Read from each repository's published releases, never a checkout. A release is followed when a
// changelog line links its page and names its version, or a marker says it moved no claim:
// <!-- <repo> <tag>: no docs change -->. Schema-dist serials are named by number ("serial 78").
{
  const changelog = readFileSync(join(ROOT, 'src', 'content', 'docs', 'docs', 'changelog.md'), 'utf8');
  const lines = changelog.split(/\r?\n/);
  const released = [
    ['sdk', '/docs/development/typescript'],
    ['python-sdk', '/docs/development/python'],
    ['unity-sdk', '/docs/development/unity'],
    ['obsidian-plugin', '/docs/tools/obsidian-plugin'],
    ['toolkit', '/docs/development/toolkit'],
    ['schema-dist', null],
  ];
  let read = 0;
  for (const [repo, page] of released) {
    const out = sh('gh', ['release', 'list', '-R', `OnlyWorlds/${repo}`, '--limit', '40', '--json', 'tagName,publishedAt']);
    if (out === null) { bad(`releases: could not read OnlyWorlds/${repo}'s releases (gh): not checked`); continue; }
    for (const { tagName, publishedAt } of JSON.parse(out)) {
      if (!publishedAt || publishedAt.slice(0, 10) < SINCE) continue;
      read++;
      const version = tagName.replace(/^v/, '');
      const serial = repo === 'schema-dist' ? tagName.match(/dist\.(\d+)$/)?.[1] : undefined;
      const lined = serial
        ? lines.some((l) => l.includes(`serial ${serial}`))
        : lines.some((l) => l.includes(page) && l.includes(version));
      if (!lined && !changelog.includes(`<!-- ${repo} ${tagName}: no docs change -->`)) {
        bad(`releases: ${repo} ${tagName} (${publishedAt.slice(0, 16)}Z) has no changelog line ${serial ? `naming serial ${serial}` : `linking ${page} with ${version}`}, and no marker`);
      }
    }
  }
  if (!stale.some((m) => m.startsWith('releases:'))) pass(`releases: ${read} since ${SINCE}, each with its changelog line or marker`);
}

// ---- what moved ----------------------------------------------------------------------------------------------------------
console.log('');
console.log(`MOVED since ${SINCE} (read each against the page that states it; SWEEP.md says which)`);
const repos = [
  ['keel (API, MCP, web)', `${OW}/keel`, ['--', 'elements', 'core', 'mcp_server', 'docs/spec', 'accounts']],
  ['schema-dist', `${OW}/schema-dist`, []],
  ['@onlyworlds/sdk', `${OW}/sdk`, []],
  ['python package', `${OW}/onlyworlds-python`, []],
  ['Atlas', LOCAL.repos?.['Atlas'] ?? `${OW}/atlas`, ['--', 'src/changelog']],
  ['Unity SDK', LOCAL.repos?.['Unity SDK'] ?? `${OW}/unity-sdk`, ['--', 'Packages']],
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
