#!/usr/bin/env node
/**
 * verify-toolkit.mjs: the toolkit's skills and agent, as the Toolkit page and the LLM guide name them, held to its newest release.
 *
 * Usage: node scripts/verify-toolkit.mjs            check the pages against the snapshot (offline; in `npm run verify`)
 *        node scripts/verify-toolkit.mjs --live     compare the snapshot with the toolkit's newest release; exit 1 if its skills differ
 *        node scripts/verify-toolkit.mjs --refresh  first rewrite the snapshot from the newest release, then check the pages
 *
 * Source: github.com/OnlyWorlds/toolkit at its newest published release tag: the `name` in the
 * frontmatter of each skills/<dir>/SKILL.md and each agents/<file>.md, read from the tag's own tree
 * (GitHub's API and raw files at the tag's commit), never a checkout. Vendored as
 * contract/toolkit.json so a build never depends on GitHub; it keeps the tag, its commit, the skill
 * names and the agent names. `read_at` is the day the snapshot last changed (a refresh that finds
 * the same tag and names keeps it). A GitHub token in GH_TOKEN or GITHUB_TOKEN, or gh's own, is
 * used when there is one; the reads are public either way.
 *
 * Checks (fail):
 *   src/content/docs/docs/development/toolkit.md: the intro's count ("eleven skills") is the number
 *   of skills and its "an orchestration agent" the number of agents; the Skills table names each
 *   skill once by its short name (the page says the full name is `onlyworlds-<skill>`) and nothing
 *   else; "The orchestration agent, `<name>`" names the agent; every name in the 5.0 column of
 *   "Coming from 4.8" and every bare skill name in "A world folder or an account world" is a skill;
 *   public/assets/ow_llm_guide.txt: its toolkit paragraph names each skill once and nothing else
 *   (the names inside its parentheses), and each "the toolkit's <name> skill" is a skill;
 *   src/content/docs/docs/development/ai.md: each onlyworlds-<name> it writes is a skill.
 * Not checked, printed: the table's descriptions (the docs' own words, not the SKILL.md ones) and
 * its Stage column; the retired 4.8 names; the knowledge files (the sweep's link check answers them).
 *
 * Exit: 0 PASS (or the snapshot matches), 1 FAIL or STALE, 2 BLIND (GitHub unreadable, or a page or
 * answer shape this does not read: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'toolkit.json');
const DOCS = join(ROOT, 'src', 'content', 'docs', 'docs', 'development');
const PAGE = join(DOCS, 'toolkit.md');
const AI = join(DOCS, 'ai.md');
const GUIDE = join(ROOT, 'public', 'assets', 'ow_llm_guide.txt');
const REPO = 'OnlyWorlds/toolkit';
const PREFIX = 'onlyworlds-';
const NUMBERS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(' ');
const args = new Set(process.argv.slice(2));
const blind = (why) => { console.log(`verify-toolkit: BLIND: ${why}`); process.exit(2); };

// ---- the toolkit's newest release ------------------------------------------------------------------
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || (() => {
  try { return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }).trim(); } catch { return ''; }
})();
async function get(url, json = true) {
  const headers = { 'User-Agent': 'onlyworlds-docs verify-toolkit' };
  if (json) headers.Accept = 'application/vnd.github+json';
  if (token && url.startsWith('https://api.github.com/')) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url} answered HTTP ${r.status}`);
  return json ? r.json() : r.text();
}
const nameOf = (text, path) => {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) throw new Error(`${path} has no frontmatter`);
  const n = m[1].match(/^name:\s*["']?([^"'\n]+?)["']?\s*$/m);
  if (!n) throw new Error(`${path}'s frontmatter has no name`);
  return n[1];
};
async function readRelease() {
  const releases = (await get(`https://api.github.com/repos/${REPO}/releases?per_page=30`))
    .filter((r) => !r.draft && !r.prerelease && r.published_at)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (!releases.length) throw new Error(`${REPO} has no published release`);
  const tag = releases[0].tag_name;
  const commit = (await get(`https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(tag)}`)).sha;
  const tree = await get(`https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`);
  if (tree.truncated) throw new Error(`the tree of ${tag} came back truncated`);
  const paths = tree.tree.map((t) => t.path);
  const read = (re) => Promise.all(paths.filter((p) => re.test(p)).map(async (p) => nameOf(await get(`https://raw.githubusercontent.com/${REPO}/${commit}/${p}`, false), `${tag}:${p}`)));
  const skills = (await read(/^skills\/[^/]+\/SKILL\.md$/)).sort();
  const agents = (await read(/^agents\/[^/]+\.md$/)).sort();
  if (!skills.length) throw new Error(`${tag} has no skills/*/SKILL.md`);
  return { tag, commit, skills, agents };
}

const format = (s) => [
  '{',
  `  "source": ${JSON.stringify(`github.com/${REPO} at its newest release tag: the frontmatter name of each skills/*/SKILL.md and agents/*.md`)},`,
  `  "tag": ${JSON.stringify(s.tag)},`,
  `  "commit": ${JSON.stringify(s.commit)},`,
  `  "read_at": ${JSON.stringify(s.read_at)},`,
  `  "skills": ${JSON.stringify(s.skills)},`,
  `  "agents": ${JSON.stringify(s.agents)}`,
  '}',
  '',
].join('\n');
const names = (s) => JSON.stringify({ skills: s.skills, agents: s.agents });
const summary = (s) => `${s.tag}: ${s.skills.length} skills, ${s.agents.length} agent${s.agents.length === 1 ? '' : 's'}`;
const readSnap = () => { try { return JSON.parse(readFileSync(SNAP, 'utf8')); } catch { return null; } };

if (args.has('--live') || args.has('--refresh')) {
  let live;
  try { live = await readRelease(); } catch (e) { blind(`${REPO} (${e.message})`); }
  const snap = readSnap();
  const same = snap && names(snap) === names(live);
  if (args.has('--refresh')) {
    const unchanged = same && snap.tag === live.tag && snap.commit === live.commit;
    const out = unchanged ? snap : { ...live, read_at: new Date().toISOString().slice(0, 10) };
    if (!unchanged) writeFileSync(SNAP, format(out));
    console.log(`verify-toolkit: ${unchanged ? 'contract/toolkit.json unchanged' : 'wrote contract/toolkit.json'}: ${summary(out)}, read ${out.read_at}`);
  } else {
    if (!snap) { console.log('verify-toolkit: STALE: contract/toolkit.json missing or unreadable; run --refresh'); process.exit(1); }
    if (same && snap.tag === live.tag) { console.log(`verify-toolkit: contract/toolkit.json matches the newest release, ${summary(live)} (read ${snap.read_at})`); process.exit(0); }
    if (same) { console.log(`verify-toolkit: the newest release is ${live.tag}, not the snapshot's ${snap.tag}, with the same ${live.skills.length} skills and agents: nothing on the pages moves (--refresh records the tag)`); process.exit(0); }
    console.log(`verify-toolkit: STALE: ${live.tag} differs from contract/toolkit.json (${snap.tag}, read ${snap.read_at}); run --refresh, then mend the Toolkit page and the LLM guide`);
    for (const k of ['skills', 'agents']) {
      for (const n of live[k]) if (!(snap[k] ?? []).includes(n)) console.log(`  ${k.slice(0, -1)} ${n}: new in ${live.tag}`);
      for (const n of snap[k] ?? []) if (!live[k].includes(n)) console.log(`  ${k.slice(0, -1)} ${n}: gone from ${live.tag}`);
    }
    process.exit(1);
  }
}

// ---- the pages against the snapshot ---------------------------------------------------------------
const snap = readSnap();
if (!snap?.skills?.length || !Array.isArray(snap.agents)) blind('contract/toolkit.json unreadable or holds no skills; run --refresh');
const shorts = snap.skills.map((s) => {
  if (!s.startsWith(PREFIX)) blind(`contract/toolkit.json: the skill ${s} does not start ${PREFIX}, so its short name cannot be read`);
  return s.slice(PREFIX.length);
});
const fails = [];
const fail = (m) => fails.push(m);
const isSkill = (n) => shorts.includes(n);
const sameSet = (got, what) => {
  got.forEach((n, i) => { if (got.indexOf(n) !== i) fail(`${what}: names ${n} twice`); });
  for (const n of shorts) if (!got.includes(n)) fail(`${what}: ${PREFIX}${n} is a skill in ${snap.tag}, not named`);
  for (const n of new Set(got)) if (!isSkill(n)) fail(`${what}: names ${n}, which ${snap.tag} has no skill for`);
};
const read = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
// A table row's cells: split on unescaped pipes outside code spans.
const cells = (line) => {
  const out = [];
  let cur = '', code = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '`') code = !code;
    if (c === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue; }
    if (c === '|' && !code) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out.slice(1, -1);
};

// ---- the Toolkit page ----
const page = read(PAGE);
const section = (head, level = '##') => {
  const i = page.indexOf(`\n${level} ${head}\n`);
  if (i < 0) blind(`the Toolkit page has no "${level} ${head}" section`);
  const rest = page.slice(i + head.length + level.length + 3);
  const j = rest.search(level === '##' ? /\n## / : /\n##+ /);
  return j < 0 ? rest : rest.slice(0, j);
};
if (!page.includes(`full name is \`${PREFIX}<skill>\``)) blind(`the Toolkit page no longer says each skill's full name is \`${PREFIX}<skill>\`, so its short names cannot be read`);
const intro = page.split('\n---\n')[1]?.trim().split('\n\n')[0] ?? '';
const count = intro.match(/\b([a-z]+) skills\b/);
if (!count || NUMBERS.indexOf(count[1]) < 0) blind(`the Toolkit page's first paragraph gives no "<number> skills": ${intro.slice(0, 120)}`);
if (NUMBERS.indexOf(count[1]) !== snap.skills.length) fail(`the intro says "${count[1]} skills"; ${snap.tag} has ${snap.skills.length}`);
if (/\ban orchestration agent\b/.test(intro) && snap.agents.length !== 1) fail(`the intro says "an orchestration agent"; ${snap.tag} has ${snap.agents.length} agents`);
const agentNames = [...page.matchAll(/\borchestration agent, `([^`]+)`/g)].map((m) => m[1]);
if (!agentNames.length) fail('the page names no agent ("The orchestration agent, `<name>`")');
for (const a of snap.agents) if (!agentNames.includes(a)) fail(`the agent ${a} is in ${snap.tag}, and the page does not name it`);
for (const a of new Set(agentNames)) if (!snap.agents.includes(a)) fail(`the page names the agent ${a}, which ${snap.tag} does not have`);

const table = [];
for (const line of section('Skills').split('\n### ')[0].split('\n')) {
  const c = cells(line);
  if (c.length !== 3 || /^:?-+/.test(c[1]) || c[1] === 'Skill') continue;
  const m = c[1].match(/^`([a-z0-9-]+)`$/);
  if (!m) { fail(`a Skills row names no skill in its Skill cell: ${c[1]}`); continue; }
  table.push(m[1]);
}
if (!table.length) blind('no rows found in the Skills table');
sameSet(table, 'the Skills table');

let renamed = 0;
for (const line of section('Coming from 4.8', '###').split('\n')) {
  const c = cells(line);
  if (c.length !== 2 || /^:?-+/.test(c[0]) || c[0] === '4.8') continue;
  for (const m of c[1].matchAll(/`([^`]+)`/g)) { renamed++; if (!isSkill(m[1])) fail(`"Coming from 4.8" sends readers to ${m[1]}, which ${snap.tag} has no skill for`); }
}
let bare = 0;
for (const m of section('A world folder or an account world').matchAll(/`([a-z]+)`/g)) { bare++; if (!isSkill(m[1])) fail(`"A world folder or an account world" names \`${m[1]}\`, which ${snap.tag} has no skill for`); }

// ---- the LLM guide ----
const guide = read(GUIDE);
const g0 = guide.indexOf('IF THE USER HAS CLAUDE CODE');
const g1 = guide.indexOf(`full name is ${PREFIX}<skill>`, g0);
if (g0 < 0 || g1 < 0) blind(`the LLM guide has no toolkit paragraph from "IF THE USER HAS CLAUDE CODE" to "full name is ${PREFIX}<skill>"`);
const guideNames = [...guide.slice(g0, g1).matchAll(/\(([^)]*)\)/g)]
  .flatMap((m) => m[1].split(/[,;]/)).map((p) => p.trim().replace(/^and /, '')).filter((p) => /^[a-z][a-z-]*$/.test(p));
if (!guideNames.length) blind('the LLM guide\'s toolkit paragraph names no skill inside its parentheses');
sameSet(guideNames, 'the LLM guide\'s toolkit paragraph');
const guideMentions = [...guide.matchAll(/\bthe toolkit's ([a-z][a-z-]*) skill\b/gi)].map((m) => m[1]);
for (const n of guideMentions) if (!isSkill(n)) fail(`the LLM guide names "the toolkit's ${n} skill", which ${snap.tag} has no skill for`);

// ---- the AI page ----
const aiNames = [...read(AI).matchAll(new RegExp(`\\b${PREFIX}([a-z][a-z-]*)\\b`, 'g'))].map((m) => m[1]);
for (const n of aiNames) if (!isSkill(n)) fail(`the AI page names ${PREFIX}${n}, which ${snap.tag} has no skill for`);

console.log(`  not checked  the Skills table's ${table.length} descriptions (the docs' own words, not the SKILL.md descriptions) and its Stage column`);
console.log('  not checked  the 4.8 column of "Coming from 4.8" (retired names); the knowledge files (the sweep\'s link check answers them)');
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(`verify-toolkit: the Toolkit page's count, ${table.length} skill rows, its agent, ${renamed} 5.0 names and ${bare} skill mentions; the LLM guide's ${guideNames.length} skills and ${guideMentions.length} mentions; the AI page's ${aiNames.length} names: held to contract/toolkit.json (${summary(snap)}, read ${snap.read_at})`);
if (fails.length) { console.log(`FAIL: ${fails.length} problem(s) on the toolkit's pages`); process.exit(1); }
console.log('PASS');
