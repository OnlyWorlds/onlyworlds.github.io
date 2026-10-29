#!/usr/bin/env node
/**
 * verify-sd-counts.mjs: the counts the pages give for what schema-dist ships, held to its newest serial.
 *
 * Usage: node scripts/verify-sd-counts.mjs            check the pages against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-sd-counts.mjs --live     compare the snapshot with schema-dist's newest serial; exit 1 if they differ
 *        node scripts/verify-sd-counts.mjs --refresh  first rewrite the snapshot from the newest serial, then check the pages
 *
 * Source: github.com/OnlyWorlds/schema-dist at its newest v*-dist.* tag (the one the element pages
 * build from, found the same way pages.yml finds it), read as raw files at the tag, never a checkout:
 * VERSION's canonical version, each profiles/<name>.fixture.json's `cases` (the profiles listed in
 * the tag's MANIFEST.json), and fixtures/owworld/verdicts.json's `reasons`. Vendored as
 * contract/sd-counts.json; `read_at` is the day the counts last changed (a refresh that finds them
 * equal keeps it).
 *
 * Checks (fail):
 *   (a) every "<N> fixture cases" on a page names one profile in its sentence, else on its line (a
 *       link to profiles/<name>.md, or "the <name> profile"), and N is that profile's case count; a
 *       count naming no profile or several is INCOMPLETE, never a pass;
 *   (b) every "the twelve causes", "twelve `…Reason` values" or "a cause from twelve" is the number
 *       of refusal reasons in the .owworld set's verdicts;
 *   (c) the `schema_version` in every JSON example whose `format` is "onlyworlds-world-export" is the
 *       newest serial's canonical version.
 * The packages follow each serial the day it lands, so the newest serial's fixture is the one their
 * tests replay. A count the page dates ("at schema-dist serial 60", "from serial 49") is history and
 * is not checked: printed. Not checked either: counts in other words than these.
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND or INCOMPLETE (GitHub unreadable,
 * a count this cannot attribute, or a shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'sd-counts.json');
const DOCS = join(ROOT, 'src', 'content', 'docs');
const REPO = 'OnlyWorlds/schema-dist';
const WORDS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(' ');
const NUM = `(\\d+|${WORDS.join('|')})`;
const toNum = (s) => (/^\d+$/.test(s) ? Number(s) : WORDS.indexOf(s.toLowerCase()));
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-sd-counts: BLIND: ${why}`); process.exit(2); };

// ---- schema-dist's newest serial ---------------------------------------------------------------
async function raw(tag, path) {
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${tag}/${path}`, { headers: { 'User-Agent': 'onlyworlds-docs verify-sd-counts' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${tag}:${path} answered HTTP ${r.status}`);
  return r.text();
}
async function readSource() {
  const tags = execFileSync('git', ['ls-remote', '--tags', '--refs', `https://github.com/${REPO}`, 'v*-dist.*'], { encoding: 'utf8', timeout: 30000 })
    .split('\n').map((l) => l.split('refs/tags/')[1]).filter(Boolean);
  const serial = (t) => Number(t.match(/-dist\.(\d+)$/)?.[1] ?? -1);
  const tag = tags.sort((a, b) => serial(a) - serial(b)).at(-1);
  if (!tag) throw new Error(`${REPO} has no v*-dist.* tag`);
  const version = await raw(tag, 'VERSION');
  const canonical = version.match(/^canonical:\s*(\S+)/m)?.[1];
  if (!canonical) throw new Error(`${tag}:VERSION has no canonical line`);
  const files = Object.keys(JSON.parse(await raw(tag, 'MANIFEST.json')).files ?? {});
  const names = files.map((f) => f.match(/^profiles\/([a-z0-9-]+)\.fixture\.json$/)?.[1]).filter(Boolean).sort();
  if (!names.length) throw new Error(`${tag}:MANIFEST.json lists no profile fixture`);
  const profiles = {};
  for (const n of names) {
    const cases = JSON.parse(await raw(tag, `profiles/${n}.fixture.json`)).cases;
    if (!Array.isArray(cases)) throw new Error(`${tag}:profiles/${n}.fixture.json has no cases list`);
    profiles[n] = cases.length;
  }
  const reasons = JSON.parse(await raw(tag, 'fixtures/owworld/verdicts.json')).reasons;
  if (!reasons || typeof reasons !== 'object') throw new Error(`${tag}:fixtures/owworld/verdicts.json has no reasons`);
  return { tag, canonical, profiles, owworld_reasons: Object.keys(reasons).length };
}
const same = (a, b) => JSON.stringify({ ...a, read_at: 0 }) === JSON.stringify({ ...b, read_at: 0 });
let snap = null;
try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet */ }

if (args.has('--live') || args.has('--refresh')) {
  let src;
  try { src = await readSource(); } catch (e) { blind(`could not read schema-dist (${e.message})`); }
  const fresh = { source: `schema-dist ${src.tag}: VERSION, profiles/*.fixture.json cases, fixtures/owworld/verdicts.json reasons`, read_at: new Date().toISOString().slice(0, 10), ...src };
  if (args.has('--live')) {
    if (snap && same({ ...snap, source: 0, tag: 0 }, { ...fresh, source: 0, tag: 0 })) { console.log(`verify-sd-counts: the snapshot matches ${src.tag}${snap.tag === src.tag ? '' : ` (read at ${snap.tag}, same counts)`}`); process.exit(0); }
    console.log(`verify-sd-counts: STALE: contract/sd-counts.json differs from ${src.tag}; run --refresh and mend the pages`);
    for (const k of ['canonical', 'owworld_reasons']) if (snap?.[k] !== src[k]) console.log(`  ${k}: ${snap?.[k]} in the snapshot, ${src[k]} at ${src.tag}`);
    for (const n of new Set([...Object.keys(snap?.profiles ?? {}), ...Object.keys(src.profiles)])) if (snap?.profiles?.[n] !== src.profiles[n]) console.log(`  ${n}: ${snap?.profiles?.[n]} cases in the snapshot, ${src.profiles[n]} at ${src.tag}`);
    process.exit(1);
  }
  if (snap && same({ ...snap, source: 0, tag: 0 }, { ...fresh, source: 0, tag: 0 })) console.log(`verify-sd-counts: the snapshot already holds ${src.tag}'s counts (kept as read at ${snap.tag})`);
  else { writeFileSync(SNAP, JSON.stringify(fresh, null, 2) + '\n'); snap = fresh; console.log(`verify-sd-counts: wrote contract/sd-counts.json from ${src.tag}`); }
}
if (!snap) blind('contract/sd-counts.json is missing: run --refresh');
if (!snap.profiles || !Object.keys(snap.profiles).length || !snap.canonical || !snap.owworld_reasons) blind('contract/sd-counts.json lacks profiles, canonical or owworld_reasons');

// ---- the pages ---------------------------------------------------------------------------------
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(DOCS).filter((f) => /\.mdx?$/.test(f) && !/[\\/]changelog\.md$/.test(f)); // the changelog is a dated record
const rel = (f) => relative(DOCS, f).replace(/\\/g, '/');
const fails = [];
const dated = [];
let incomplete = 0;
const counts = { a: 0, b: 0, c: 0 };
const DATED = /\b(at|from|since) (schema-dist )?serial \d+/i;
for (const f of pages) {
  const text = readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const where = `${rel(f)}:${i + 1}`;
    // (a) fixture cases, attributed to the one profile its line names
    for (const m of line.matchAll(new RegExp(`\\b${NUM} fixture cases\\b`, 'gi'))) {
      const sentence = line.slice(Math.max(0, line.lastIndexOf('. ', m.index) + 1), line.indexOf('. ', m.index) < 0 ? undefined : line.indexOf('. ', m.index));
      if (DATED.test(sentence)) { dated.push(`${where}: "${m[0]}" (${sentence.match(DATED)[0]})`); continue; }
      // the profile its sentence names, else the one its line names
      const profilesIn = (s) => new Set([...s.matchAll(/profiles\/([a-z0-9-]+)\.md/g), ...s.matchAll(/\bthe ([a-z0-9-]+) profile\b/gi)].map((x) => x[1].toLowerCase()).filter((n) => n in snap.profiles));
      const inSentence = profilesIn(sentence);
      const named = inSentence.size === 1 ? inSentence : profilesIn(line);
      if (named.size !== 1) { console.log(`  INCOMPLETE  ${where}: "${m[0]}" on a line naming ${named.size ? [...named].join(', ') : 'no profile'}: say which profile, or this cannot check it`); incomplete++; continue; }
      const [n] = named;
      counts.a++;
      if (toNum(m[1]) !== snap.profiles[n]) fails.push(`${where}: "${m[0]}" for the ${n} profile, which has ${snap.profiles[n]} at ${snap.tag} (a)`);
    }
    // (b) the archive's refusal causes
    for (const m of line.matchAll(new RegExp(`\\b(?:the|of) ${NUM} (?:causes|\`[A-Za-z]*Reason\` values)\\b|\\bcause from ${NUM}\\b`, 'gi'))) {
      counts.b++;
      const n = toNum(m[1] ?? m[2]);
      if (n !== snap.owworld_reasons) fails.push(`${where}: "${m[0]}", and the .owworld set has ${snap.owworld_reasons} refusal reasons at ${snap.tag} (b)`);
    }
  });
  // (c) the export example's schema_version
  for (const m of text.matchAll(/```json\n([\s\S]*?)```/g)) {
    if (!/"format":\s*"onlyworlds-world-export"/.test(m[1])) continue;
    const v = m[1].match(/"schema_version":\s*"([^"]+)"/);
    const where = `${rel(f)}:${text.slice(0, m.index).split('\n').length}`;
    if (!v) { console.log(`  INCOMPLETE  ${where}: an export example with no schema_version this can read`); incomplete++; continue; }
    counts.c++;
    if (v[1] !== snap.canonical) fails.push(`${where}: the export example's schema_version is ${v[1]}, and the standard is ${snap.canonical} at ${snap.tag} (c)`);
  }
}
for (const d of dated) console.log(`  dated  ${d}: history, not checked`);
for (const f of fails) console.log(`  FAIL   ${f}`);
const summary = `${counts.a} fixture counts, ${counts.b} refusal-cause counts, ${counts.c} export examples against ${snap.tag} (contract/sd-counts.json, read ${snap.read_at})`;
if (fails.length) { console.log(`verify-sd-counts: FAIL — ${fails.length} problem(s) in ${summary}`); process.exit(1); }
if (incomplete) { console.log(`verify-sd-counts: INCOMPLETE — ${incomplete} count(s) this cannot attribute; ${summary}`); process.exit(2); }
if (!counts.a && !counts.b && !counts.c) blind('the pages carry none of the counts this reads: the patterns or the pages moved');
console.log(`verify-sd-counts: PASS — ${summary}; ${dated.length} dated, not checked.`);
