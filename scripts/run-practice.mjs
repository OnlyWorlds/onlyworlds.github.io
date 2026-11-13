#!/usr/bin/env node
/**
 * run-practice.mjs: run the TypeScript and Python pages' Write sections, and Your first hour's read
 * and write in both languages, as written, against the practice world.
 *
 * Usage: node scripts/run-practice.mjs            every page
 *        node scripts/run-practice.mjs typescript  one of them (typescript | python |
 *                                                  first-hour-typescript | first-hour-python)
 *
 * Your first hour runs its read section first, alone (the demo key, no env), then its write section.
 * Its code deletes what it makes, so there the feed must show every id the run printed deleted by the
 * page's client, and anything it named left behind fails the run (and is deleted). Its curl tab is not
 * run.
 *
 * A code block on these pages is a claim that it runs. This takes the Write section of each page from
 * the page source, never a copy: its env lines (the practice world's key and PIN, as the page prints
 * them) and its code blocks in order, joined into one script. Then it runs them the way the page says:
 * TypeScript as `node --env-file=.env write.mjs` beside this repo's installed @onlyworlds/sdk (the
 * version package.json pins, the newest), Python as a script with the variables exported, on the
 * onlyworlds package the environment has (CI installs the newest from PyPI). Each writes a few
 * elements to the practice world, and the run then deletes what it made (found in the feed by its start,
 * its client and the names in the page's code), so the world's count reads the seed; a cleanup that
 * finds or deletes nothing it made fails the run. The world also goes back to its copy at 03:00 UTC.
 * Nightly in .github/workflows/practice.yml, after the reset.
 *
 * Exit: 0 every block ran, 1 a block failed, 2 BLIND (a section, its env lines or its code not found:
 * never a pass).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// `write` is the section run against the practice world; `read`, when named, runs first on its own
// (a demo-key read, no env). A page whose code deletes what it makes (`deletesOwn`) passes cleanup when
// every id it prints reads as a delete by its client in the feed and nothing it named is left.
const FIRST_HOUR = 'src/content/docs/docs/getting-started/first-hour.mdx';
const PAGES = {
  typescript: { file: 'src/content/docs/docs/development/typescript.md', lang: 'typescript', write: '## Write' },
  python: { file: 'src/content/docs/docs/development/python.md', lang: 'python', write: '## Write' },
  'first-hour-typescript': { file: FIRST_HOUR, lang: 'typescript', read: '## 2. Read a world', write: '## 3. Write, read back, delete', deletesOwn: true },
  'first-hour-python': { file: FIRST_HOUR, lang: 'python', read: '## 2. Read a world', write: '## 3. Write, read back, delete', deletesOwn: true },
};
const which = process.argv[2] ? [process.argv[2]] : Object.keys(PAGES);
for (const w of which) if (!PAGES[w]) { console.log(`run-practice: no page "${w}" (${Object.keys(PAGES).join(' | ')})`); process.exit(2); }
const blind = (why) => { console.log(`run-practice: BLIND: ${why}. Not a pass.`); process.exit(2); };

function writeSection(file, heading = '## Write') {
  const lines = readFileSync(join(ROOT, file), 'utf8').split(/\r?\n/);
  const at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) blind(`${file} has no "${heading}" section`);
  let end = lines.findIndex((l, i) => i > at && /^## /.test(l));
  if (end < 0) end = lines.length;
  const blocks = [];
  let open = null;
  for (const l of lines.slice(at + 1, end)) {
    if (open === null) {
      const m = l.match(/^```(\w*)\s*$/);
      if (m) open = { lang: m[1], body: [] };
    } else if (/^```\s*$/.test(l)) { blocks.push({ lang: open.lang, body: open.body.join('\n') }); open = null; }
    else open.body.push(l);
  }
  if (open !== null) blind(`${file}: a code block in "${heading}" never closes`);
  return blocks;
}

function envOf(file, blocks) {
  const env = {};
  for (const b of blocks.filter((x) => x.lang === 'bash')) {
    for (const l of b.body.split('\n')) {
      const m = l.match(/^(?:export )?(OW_API_KEY|OW_API_PIN)=(\S+)$/);
      if (m) env[m[1]] = m[2];
    }
  }
  if (!env.OW_API_KEY || !env.OW_API_PIN) blind(`${file}: the Write section has no OW_API_KEY and OW_API_PIN lines`);
  if (!/^ow_w_[A-Za-z0-9_-]{20,}$/.test(env.OW_API_KEY)) blind(`${file}: the Write section's OW_API_KEY is a placeholder, not a key`);
  return env;
}

// What a run made, deleted again: the elements the feed shows created at or after the run's start,
// written by the page's own client (the packages' defaults: sdk, python), named as the page's own code
// names them. The 03:00 UTC reset would clear them too, but a run leaves the world as it found it, so a
// morning count reads the seed and a stranger's example of the same name is never ours to delete.
const API = 'https://www.onlyworlds.com/api/v2';
const CLIENT = { typescript: 'sdk', python: 'python' };
function namesIn(code) {
  const names = new Set();
  // `name: '…'` in TypeScript, `"name": "…"` in Python
  for (const m of code.matchAll(/(?<![\w.])(["']?)name\1\s*:\s*(["'])([^"']+)\2/g)) names.add(m[3]);
  return names;
}
async function call(path, env, method = 'GET') {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`${API}${path}`, { method, headers: { 'API-Key': env.OW_API_KEY, ...(method === 'GET' ? {} : { 'API-Pin': env.OW_API_PIN }) } });
    if (r.status === 429 || r.status === 503) { await new Promise((ok) => setTimeout(ok, 1000 * Number(r.headers.get('retry-after') || 2))); continue; }
    return r;
  }
  throw new Error(`${method} ${path}: still refused after four tries`);
}
async function cleanUp(lang, code, env, start) {
  const names = namesIn(code);
  if (!names.size) return { error: 'the page code names no element, so nothing can be told apart as its own' };
  const made = [];
  const deleted = new Set(); // ids the feed shows deleted by this client since the start
  let since = '0';
  for (;;) {
    const r = await call(`/changes?since=${encodeURIComponent(since)}&after=${encodeURIComponent(start)}&limit=500`, env);
    if (!r.ok) return { error: `the feed answered ${r.status}` };
    const page = await r.json();
    for (const c of page.changes) {
      const e = c.element;
      // times compared as instants: keel writes microseconds and +00:00, JavaScript milliseconds and Z
      if (c.op === 'upsert' && e && Date.parse(e.created_at) >= Date.parse(start) && e.changed_client === CLIENT[lang] && names.has(e.name)) made.push([c.type, c.id, e.name]);
      if (c.op === 'delete' && c.deleted_client === CLIENT[lang]) deleted.add(c.id);
    }
    if (!page.has_more) break;
    since = page.cursor;
  }
  const failedDeletes = [];
  for (const [type, id, name] of made) {
    const r = await call(`/${type}/${id}`, env, 'DELETE');
    if (r.status !== 204) failedDeletes.push(`${type} ${name} ${r.status}`);
  }
  return { made, failedDeletes, deleted };
}

function runScript(lang, code, name, env) {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  if (lang === 'typescript') {
    writeFileSync(join(WORK, '.env'), env ? `OW_API_KEY=${env.OW_API_KEY}\nOW_API_PIN=${env.OW_API_PIN}\n` : '');
    writeFileSync(join(WORK, `${name}.mjs`), code + '\n');
    return spawnSync(process.execPath, ['--env-file=.env', `${name}.mjs`], { cwd: WORK, encoding: 'utf8', timeout: 120000 });
  }
  writeFileSync(join(WORK, `${name}.py`), code + '\n');
  const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  return spawnSync(py, [`${name}.py`], { cwd: WORK, encoding: 'utf8', timeout: 120000, env: { ...process.env, ...(env || {}) } });
}
const indent = (out) => out.split('\n').map((l) => `         ${l}`).join('\n');

const WORK = join(ROOT, 'node_modules', '.practice-run'); // inside node_modules, so the script resolves the installed SDK
let failed = 0;
for (const w of which) {
  const { file, lang, read, write, deletesOwn } = PAGES[w];
  const pageFailed = failed;
  if (read) {
    const rcode = writeSection(file, read).filter((b) => b.lang === lang).map((b) => b.body).join('\n\n');
    if (!rcode.trim()) blind(`${file}: "${read}" has no ${lang} block`);
    const rr = runScript(lang, rcode, 'read', null);
    const rout = `${rr.stdout ?? ''}${rr.stderr ?? ''}`.trim();
    if (rr.status === 0 && rout) console.log(`  PASS   ${file} (${lang}): "${read}" ran as written\n${indent(rout)}`);
    else { failed++; console.log(`  FAIL   ${file} (${lang}): "${read}" exited ${rr.status ?? rr.error?.code}${rout ? '' : ' and printed nothing'}\n${indent(rout.split('\n').slice(-15).join('\n'))}`); }
  }
  const blocks = writeSection(file, write);
  const env = envOf(file, blocks);
  const code = blocks.filter((b) => b.lang === lang).map((b) => b.body).join('\n\n');
  if (!code.trim()) blind(`${file}: "${write}" has no ${lang} block`);
  const start = new Date(Date.now() - 2000).toISOString(); // two seconds of slack for the clocks
  const r = runScript(lang, code, 'write', env);
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
  if (r.status === 0) console.log(`  PASS   ${file} (${lang}): "${write}" ran as written (${blocks.filter((b) => b.lang === lang).length} ${lang} block(s))${out ? `\n${indent(out)}` : ''}`);
  else { failed++; console.log(`  FAIL   ${file} (${lang}): "${write}" exited ${r.status ?? r.error?.code}\n${indent(out.split('\n').slice(-15).join('\n'))}`); }
  const c = await cleanUp(lang, code, env, start);
  if (c.error) { failed++; console.log(`  FAIL   ${file}: cleanup: ${c.error}`); }
  else if (c.failedDeletes.length) { failed++; console.log(`  FAIL   ${file}: cleanup: ${c.failedDeletes.length} of ${c.made.length} not deleted: ${c.failedDeletes.join('; ')}`); }
  else if (deletesOwn) {
    // the page deletes what it makes: what it left is a fault of the page, and every id it printed
    // must read as deleted by its own client in the feed
    const printed = [...new Set(out.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g) || [])];
    const notDeleted = printed.filter((id) => !c.deleted.has(id));
    if (c.made.length) { failed++; console.log(`  FAIL   ${file}: the page's code left ${c.made.length} element(s) it made (${c.made.map((m) => m[2]).join(', ')}); deleted them`); }
    else if (r.status === 0 && !printed.length) { failed++; console.log(`  FAIL   ${file}: the run printed no id, so its deletes cannot be read in the feed`); }
    else if (notDeleted.length) { failed++; console.log(`  FAIL   ${file}: ${notDeleted.length} printed id(s) not deleted by ${CLIENT[lang]} in the feed: ${notDeleted.join(', ')}`); }
    else if (r.status === 0) console.log(`         its own deletes read in the feed: ${printed.length} printed id(s), nothing left`);
    else console.log(`         cleanup: nothing it named is left in the feed since the start (${printed.length} printed id(s), each deleted)`);
  }
  else if (r.status === 0 && !c.made.length) { failed++; console.log(`  FAIL   ${file}: cleanup found none of the elements the run made in the feed (looked for ${[...namesIn(code)].join(', ')} by ${CLIENT[lang]})`); }
  else console.log(`         cleaned up: ${c.made.length} element(s) the run made deleted (${c.made.map((m) => m[2]).join(', ')})`);
  if (failed > pageFailed) failed = pageFailed + 1; // one count per page
}
rmSync(WORK, { recursive: true, force: true });
if (failed) { console.log(`run-practice: FAIL: ${failed} of ${which.length} page(s)`); process.exit(1); }
console.log(`run-practice: PASS: ${which.length} page(s) ran against the practice world.`);
