#!/usr/bin/env node
/**
 * verify-stability.mjs: the Stability and deprecation page, held to what keel's API document says about change.
 *
 * Usage: node scripts/verify-stability.mjs            check the page against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-stability.mjs --live     compare the snapshot with the live document; exit 1 if they differ
 *        node scripts/verify-stability.mjs --refresh  first rewrite the snapshot from the live document, then check
 *
 * Source: https://www.onlyworlds.com/api/v2/openapi.json (public, no key). Four things are read from it and
 * vendored as contract/stability.json, so a build never depends on the API being up:
 *   policy      the paragraph of info.description that opens "**Versions and deprecation.**", spaces folded;
 *   announced   every sentence of a description, summary or title that reads "Announced <date>: from <date> …",
 *               with where it sits (the route, and the parameter when it is one);
 *   dated       every sentence of a description, summary or title that holds a date written YYYY-MM-DD;
 *   deprecated  every place the document sets `deprecated: true`.
 * `read_at` is the day those facts last changed (a refresh that finds them equal keeps it).
 *
 * Checks (fail):
 *   (a) the page's one blockquote is the policy paragraph, word for word;
 *   (b) the table under "Changes announced" has one row per announcement and no other: a row opens with the
 *       announcement's two dates and, when the announcement sits on a parameter, names it in a code span;
 *   (c) the sentence "Nothing in it is marked `deprecated`." stands on the page exactly while the document
 *       marks nothing; when it marks something, the sentence is gone and each place's route or name is on the page;
 *   (d) every date the document holds is a date of an announcement this check read. A dated sentence it cannot
 *       read as an announcement is a change the page may be missing: it fails here until the page has a row
 *       for it or the sentence is named in KNOWN below with why it announces nothing;
 *   (e) wherever a page outside the changelog says "N months ahead" or "N months' notice", N is the policy's.
 * Not checked: the row's own words (what changes, what to do before then); the sentences under "For a client
 * that means" and the page's last two sections, which are this site's reading and not the document's text; an
 * announcement the document words with no date; the site's changelog, which the policy also names.
 * Watched failing: scripts/mutants-stability.mjs (in `npm run verify`, after this check).
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (the document or the snapshot unreadable,
 * the policy paragraph not found, or the page missing: never a pass).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content', 'docs');
const CHANGELOG = 'docs/changelog.md';
export const SNAP = join(ROOT, 'contract', 'stability.json');
export const PAGE = join(ROOT, 'src', 'content', 'docs', 'docs', 'development', 'api', 'stability.md');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
export const NOTHING = 'Nothing in it is marked `deprecated`.';
const blind = (why) => { console.log(`verify-stability: BLIND: ${why}`); process.exit(2); };

// Dated sentences of the document that announce nothing, each with why. Empty on 2026-11-23: the document's
// only dates were the one announcement's.
const KNOWN = [
  // ['the sentence, as the snapshot holds it', 'why it is no announcement'],
];

const DATE = /\b20\d\d-\d\d-\d\d\b/g;
const fold = (s) => s.replace(/\s+/g, ' ').trim();
const sentencesOf = (text) => fold(text).split(/(?<=[.!?])\s+(?=[A-Z`*(\[])/);
const METHODS = new Set(['get', 'put', 'post', 'patch', 'delete', 'head', 'options']);

// ---- what the document says about change --------------------------------------------------------------
// The four facts; `policy` is null when the paragraph is not found.
export function extract(doc) {
  const m = /\*\*Versions and deprecation\.\*\*\s*([\s\S]*?)(?:\n\s*\n|$)/.exec(doc?.info?.description ?? '');
  const out = { policy: m && fold(m[1]) ? fold(m[1]) : null, announced: [], dated: [], deprecated: [] };
  // `where` is the route (METHOD path) under paths, and up to three keys deep elsewhere (components/schemas/Name);
  // a parameter object (it has `name` and `in`) gives its name to everything under it.
  const visit = (node, where, param, deepen) => {
    if (Array.isArray(node)) { for (const v of node) visit(v, where, param, deepen); return; }
    if (!node || typeof node !== 'object') return;
    const name = typeof node.name === 'string' && typeof node.in === 'string' ? node.name : param;
    const here = name ? `${where}, parameter ${name}` : where;
    if (node.deprecated === true) out.deprecated.push({ where: here, ...(name ? { parameter: name } : {}) });
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'description' || k === 'summary' || k === 'title') && typeof v === 'string') {
        for (const s of sentencesOf(v)) {
          if (!s.match(DATE)) continue;
          out.dated.push({ where: here, sentence: s });
          const a = /^Announced (20\d\d-\d\d-\d\d): from (20\d\d-\d\d-\d\d)\b/.exec(s);
          if (a) out.announced.push({ where: here, ...(name ? { parameter: name } : {}), announced: a[1], from: a[2], sentence: s });
        }
      } else if (k !== 'example' && k !== 'examples') visit(v, deepen > 0 ? `${where}/${k}` : where, name, deepen - 1);
    }
  };
  for (const [path, item] of Object.entries(doc?.paths ?? {})) {
    for (const [k, v] of Object.entries(item ?? {})) visit(v, METHODS.has(k) ? `${k.toUpperCase()} ${path}` : path, undefined, 0);
  }
  for (const [k, v] of Object.entries(doc ?? {})) if (k !== 'paths') visit(v, k, undefined, 2);
  return out;
}
const FACTS = ['policy', 'announced', 'dated', 'deprecated'];
export const same = (a, b) => FACTS.every((f) => JSON.stringify(a?.[f]) === JSON.stringify(b?.[f]));
const format = (s) => `${JSON.stringify({ source: `${OPENAPI}: what it says about change, as served`, read_at: s.read_at, ...Object.fromEntries(FACTS.map((f) => [f, s[f]])) }, null, 2)}\n`;

// ---- the page against the snapshot ------------------------------------------------------------------------
export function checkPage(page, snap, known = KNOWN) {
  const fails = [];
  let held = 0;

  // (a) the blockquote is the policy
  const quotes = page.split(/\n{2,}/).filter((b) => b.split('\n').every((l) => l.startsWith('>')));
  if (quotes.length !== 1) fails.push(`the page has ${quotes.length} blockquotes, and the policy is read from its one`);
  else if (fold(quotes[0].replace(/^> ?/gm, '')) !== snap.policy) fails.push('the page\'s blockquote is not the document\'s "Versions and deprecation" paragraph, word for word');
  else held += 1;

  // (b) one table row per announcement
  const at = page.indexOf('\n## Changes announced\n');
  if (at < 0) fails.push('the page has no "## Changes announced" heading, the section the announced changes are read from');
  else {
    const next = page.indexOf('\n## ', at + 4);
    const rows = page.slice(at, next < 0 ? undefined : next).split('\n').filter((l) => l.startsWith('|')).slice(2);
    const left = [...snap.announced];
    for (const row of rows) {
      const m = /^\|\s*(20\d\d-\d\d-\d\d)\s*\|\s*(20\d\d-\d\d-\d\d)\s*\|/.exec(row);
      if (!m) { fails.push(`a row of the table does not open with two dates: ${row.slice(0, 80)}`); continue; }
      const i = left.findIndex((a) => a.announced === m[1] && a.from === m[2] && (!a.parameter || row.includes(`\`${a.parameter}\``)));
      if (i < 0) fails.push(`the row announced ${m[1]}, from ${m[2]}, matches no announcement in the document${left.some((a) => a.announced === m[1] && a.from === m[2]) ? ' (its parameter is not named in a code span)' : ''}`);
      else { left.splice(i, 1); held += 1; }
    }
    for (const a of left) fails.push(`the document announces a change the table has no row for: ${a.where}: ${a.sentence}`);
  }

  // (c) the deprecated marks
  const says = page.includes(NOTHING);
  if (!snap.deprecated.length) {
    if (says) held += 1; else fails.push(`the document marks nothing deprecated, and the page no longer says "${NOTHING}"`);
  } else {
    if (says) fails.push(`the document marks ${snap.deprecated.length} place(s) deprecated, and the page still says "${NOTHING}"`);
    for (const d of snap.deprecated) {
      const name = d.parameter ?? d.where.replace(/^[A-Z]+ /, '');
      if (page.includes(`\`${name}\``)) held += 1; else fails.push(`the document marks ${d.where} deprecated, and the page does not name \`${name}\``);
    }
  }

  // (d) every date in the document belongs to an announcement that was read
  const read = new Set(snap.announced.flatMap((a) => [a.announced, a.from]));
  const named = new Map(known);
  for (const d of snap.dated) {
    if (named.has(d.sentence)) { named.delete(d.sentence); continue; }
    const unread = (d.sentence.match(DATE) ?? []).filter((x) => !read.has(x));
    if (unread.length) fails.push(`a dated sentence of the document is no announcement this check can read (${unread.join(', ')}): ${d.where}: ${d.sentence}`);
    else held += 1;
  }
  for (const [s] of named) fails.push(`KNOWN names a sentence the document no longer holds: ${s}`);
  return { fails, held };
}

// (e) the notice period, wherever a page restates it. `files` is [[path, text], …]; the changelog is left out
// by the caller: its lines record what was true then.
const PERIOD = /\b([A-Za-z]+|\d+) months(?:' notice| ahead)/g;
export function checkPeriod(files, snap) {
  const fails = [];
  let held = 0;
  const said = [...snap.policy.matchAll(PERIOD)].map((m) => m[1].toLowerCase());
  if (said.length !== 1) return { fails: [`the policy paragraph states ${said.length} notice periods ("N months ahead"), and this check reads its one`], held };
  for (const [rel, text] of files) {
    for (const m of text.matchAll(PERIOD)) {
      if (m[1].toLowerCase() === said[0]) held += 1;
      else fails.push(`${rel} says "${m[0]}", and the policy says ${said[0]} months`);
    }
  }
  return { fails, held };
}
function pagesUnder(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) pagesUnder(f, out);
    else if (/\.mdx?$/.test(name)) out.push(f);
  }
  return out;
}
export const pageFiles = () => pagesUnder(CONTENT)
  .map((f) => [relative(CONTENT, f).replace(/\\/g, '/'), readFileSync(f, 'utf8')])
  .filter(([rel]) => rel !== CHANGELOG);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = new Set(process.argv.slice(2));
  if (args.has('--live') || args.has('--refresh')) {
    let doc;
    try {
      const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      doc = await r.json();
    } catch (e) { blind(`${OPENAPI} (${e.message})`); }
    if (!doc?.paths || !Object.keys(doc.paths).length) blind(`${OPENAPI} has no paths`);
    const live = extract(doc);
    if (!live.policy) blind(`${OPENAPI} has no "**Versions and deprecation.**" paragraph in info.description, the paragraph this check reads`);
    let old = null;
    try { old = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable */ }
    const unchanged = old && same(old, live);
    if (args.has('--refresh')) {
      const read_at = unchanged ? old.read_at : new Date().toISOString().slice(0, 10);
      writeFileSync(SNAP, format({ read_at, ...live }));
      console.log(`verify-stability: ${unchanged ? 'contract/stability.json unchanged' : 'wrote contract/stability.json'}: ${live.announced.length} announced, ${live.dated.length} dated sentence(s), ${live.deprecated.length} marked deprecated, read ${read_at}`);
    } else {
      if (!old) { console.log('verify-stability: STALE: contract/stability.json missing or unreadable; run --refresh'); process.exit(1); }
      if (unchanged) { console.log(`verify-stability: contract/stability.json matches the live document: ${live.announced.length} announced, ${live.dated.length} dated sentence(s), ${live.deprecated.length} marked deprecated (read ${old.read_at})`); process.exit(0); }
      console.log(`verify-stability: STALE: what the live document says about change differs from contract/stability.json (read ${old.read_at}); run --refresh, then mend the page`);
      for (const f of FACTS) if (JSON.stringify(old[f]) !== JSON.stringify(live[f])) console.log(`  ${f}: ${f === 'policy' ? 'the paragraph moved' : `${old[f]?.length ?? 'none'} -> ${live[f].length}, or one of them reworded or moved`}`);
      process.exit(1);
    }
  }

  let snap;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { blind(`contract/stability.json unreadable (${e.message}); run --refresh`); }
  for (const f of FACTS) if (f === 'policy' ? typeof snap[f] !== 'string' || !snap[f] : !Array.isArray(snap[f])) blind(`contract/stability.json has no ${f}; run --refresh`);
  let page;
  try { page = readFileSync(PAGE, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { blind(`the page is unreadable (${e.message})`); }
  const a = checkPage(page, snap);
  const b = checkPeriod(pageFiles(), snap);
  const fails = [...a.fails, ...b.fails];
  for (const f of fails) console.log(`FAIL: ${f}`);
  if (fails.length) { console.log(`verify-stability: FAIL: ${fails.length} problem(s) on the Stability and deprecation page or a page that restates its notice period (snapshot read ${snap.read_at})`); process.exit(1); }
  console.log(`verify-stability: PASS: ${a.held + b.held} check(s): the policy word for word, ${snap.announced.length} announced change(s) each with its row, ${snap.deprecated.length} marked deprecated, ${snap.dated.length} dated sentence(s) each read, the notice period the same in the ${b.held} place(s) the pages state it (snapshot read ${snap.read_at}). Not checked: a row's own words, the page's reading of the policy, an announcement with no date.`);
}
