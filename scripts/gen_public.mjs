#!/usr/bin/env node
/**
 * gen_public.mjs: the snapshot behind the public view figure on Public worlds, from the platform's
 * own public reader.
 *
 * Usage: node scripts/gen_public.mjs                     compare contract/public.json with keel's origin/main
 *        node scripts/gen_public.mjs --refresh           rewrite contract/public.json from keel's origin/main
 *        node scripts/gen_public.mjs --keel PATH [...]   a keel checkout other than ../keel
 *
 * Source: keel's code on its published branch (git fetch, then git show origin/main:<file>, never
 * the working tree). keel is private, so the build cannot read it: the figure (PublicView, through
 * public.mjs) and verify-figures.mjs read only the snapshot. It keeps:
 *   - elements/visibility.py: what the public reader leaves out (the PUBLIC branch of `scoped`: the
 *     hidden ids it excludes, and each without_<x> it applies, with the mark its module names), the
 *     docstring's "absent from every list, count, link and search", and reads_tombstones (whether
 *     the public reader meets a 410 for a deleted id);
 *   - core/world_api.py: the keyless world body's owner_character set to None (no roster);
 *   - web/urls.py and web/public_views.py: the /w/ routes of the world page, an element's page and
 *     the graph; the address read as an id first; the worlds that answer (public reading and the
 *     page on); every world miss the one 404 body, and an element miss its own;
 *   - web/public_page.py: the words of those two 404 pages;
 *   - portal/world_graph.py: the types the graph leaves out.
 * The keyless routes the figure draws come from contract/callers.json (gen_callers.mjs), the API's
 * own document; this reads keel only. `read_at` is the commit the facts were last read at (a
 * refresh that finds them equal keeps it).
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (keel unreadable, or a shape
 * this does not read: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'public.json');
const argv = process.argv.slice(2);
const KEEL = resolve(argv.includes('--keel') ? argv[argv.indexOf('--keel') + 1] : join(ROOT, '..', 'keel'));
const say = (s) => console.log(`gen_public: ${s}`);
const blind = (why) => { say(`BLIND: ${why}`); process.exit(2); };
const flat = (s) => s.replace(/\s+/g, ' ');

// The facts keel's code states. Anything not in the shape read here is an error, never a guess.
function facts(show) {
  const vis = show('elements/visibility.py');
  // the PUBLIC branch of scoped(): from its test to the branch's return
  const fn = vis.slice(vis.indexOf('\ndef scoped('));
  const branch = fn.match(/\n {4}if viewer\.kind == PUBLIC:\n([\s\S]*?\n {8}return [^\n]*)/)?.[1];
  if (!branch) throw new Error('elements/visibility.py: scoped() has no "if viewer.kind == PUBLIC:" branch ending in a return');
  const assign = branch.match(/^ {8}qs = (.+)$/m)?.[1];
  if (!assign) throw new Error('elements/visibility.py: the PUBLIC branch of scoped() assigns no qs');
  const removed = [];
  // innermost first: the order the filters apply
  for (const m of [...assign.matchAll(/without_([a-z_]+)\(/g)].reverse()) {
    const fname = `without_${m[1]}`;
    const mod = branch.match(new RegExp(`^ +from ([a-z_.]+) import ${fname}$`, 'm'))?.[1];
    if (!mod) throw new Error(`elements/visibility.py: the PUBLIC branch applies ${fname} and imports it from nowhere this reads`);
    const file = `${mod.replace(/\./g, '/')}.py`;
    const mark = show(file).match(/^MARK = "([a-z_]+)"$/m)?.[1];
    if (!mark) throw new Error(`${file}: no MARK = "x_…" beside ${fname}`);
    removed.push({ key: m[1], by: `${file} ${fname}`, mark });
  }
  if (!/\n {8}return qs\.exclude\(id__in=hidden\) if hidden else qs$/.test(branch)) throw new Error('elements/visibility.py: the PUBLIC branch does not end "return qs.exclude(id__in=hidden) if hidden else qs"');
  removed.push({ key: 'hidden', by: 'elements/visibility.py scoped: qs.exclude(id__in=hidden)', mark: null });
  const absent = flat(vis).match(/treated as the hidden mark is for that rung: absent from every ([a-z, ]+?), their own address the plain 404/)?.[1];
  if (!absent) throw new Error('elements/visibility.py: the docstring no longer says the public rung\'s removals are "absent from every …, their own address the plain 404"');
  const tomb = vis.match(/\ndef reads_tombstones\(viewer\):[\s\S]*?\n {4}return ([^\n]+)/)?.[1];
  if (!tomb) throw new Error('elements/visibility.py: no reads_tombstones(viewer) returning one expression');
  const kinds = [...tomb.matchAll(/viewer\.kind == ([A-Z_]+)/g)].map((k) => k[1]);

  const wapi = show('core/world_api.py');
  const pw = wapi.match(/\ndef _public_world\([\s\S]*?(?=\ndef )/)?.[0] ?? '';
  if (!pw) throw new Error('core/world_api.py: no _public_world');
  const ownerNull = /\n {4}body\["owner_character"\] = None\n/.test(pw);
  const counted = /\n {4}body\["counts"\] = public_counts\(w, viewer\)\n/.test(pw);

  const urls = show('web/urls.py'), views = show('web/public_views.py');
  const pages = [];
  for (const view of ['world_page', 'element_page', 'graph_page']) {
    const p = urls.match(new RegExp(`path\\("(w/[^"]*)",\\s*public_views\\.${view}\\b`))?.[1];
    if (!p) throw new Error(`web/urls.py: no path to public_views.${view}`);
    pages.push({ view, path: `/${p.replace(/<str:([a-z_]+)>/g, '<$1>')}` });
    const body = views.match(new RegExp(`\\ndef ${view}\\(request, addr[^)]*\\):\\n([\\s\\S]*?)(?=\\n\\S|$(?![\\s\\S]))`))?.[1] ?? '';
    if (!/^ {4}world = _world_for\(addr\)\n {4}if world is None:\n {8}return _none\(\)$/m.test(body)) throw new Error(`web/public_views.py: ${view} does not answer _none() for a world _world_for does not find`);
  }
  const wf = views.match(/\ndef _world_for\(addr\):[\s\S]*?(?=\ndef )/)?.[0] ?? '';
  const opens = wf.match(/World\.objects\.filter\(([^)]*)\)/)?.[1];
  if (!opens || !/ident = uuid\.UUID\(addr\)/.test(wf) || !/if ident is not None:\n\s+return pages\.filter\(id=ident\)\.first\(\)\n\s+return pages\.filter\(public_slug=addr\)\.first\(\)/.test(wf)) throw new Error('web/public_views.py: _world_for no longer reads the address as an id first, then as the page\'s address');
  const noneStatus = Number(views.match(/\ndef _none\(\):\n {4}return _answer\([^\n]*status=(\d+)\)/)?.[1]);
  const goneStatus = Number(views.match(/\ndef _gone\(world\):[\s\S]*?status=(\d+)\)/)?.[1]);
  const elemMisses = [...(views.match(/\ndef element_page\([\s\S]*$/)?.[0] ?? '').matchAll(/return _gone\(world\)/g)].length;
  const ppage = show('web/public_page.py');
  const none = ppage.match(/<main class="none"><h1>([^<]+)<\/h1><p>([^<]+)<\/p>/);
  const gone = ppage.match(/^GONE = "([^"]+)"$/m)?.[1];
  if (!none || !gone) throw new Error('web/public_page.py: no none_page heading and paragraph, or no GONE');
  if (!elemMisses) throw new Error('web/public_views.py: element_page never answers _gone(world)');

  const graph = show('portal/world_graph.py');
  const left = graph.match(/^LEFT_OUT = frozenset\(\{([^}]*)\}\)$/m)?.[1];
  if (!left) throw new Error('portal/world_graph.py: no LEFT_OUT = frozenset({…})');
  if (!/return world_graph\.baked\(world, public_viewer\(world\)/.test(views)) throw new Error('web/public_views.py: the graph is not baked through public_viewer(world)');

  return {
    removed,
    absent_from: absent.split(/, | and /),
    tombstones: kinds.includes('PUBLIC'),
    world_body: { owner_character: ownerNull ? null : 'kept', counts: counted ? 'public_counts' : null },
    pages,
    address: { id_first: true, opens: opens.split(',').map((s) => s.trim()) },
    misses: {
      world: { status: noneStatus, head: none[1], text: none[2] },
      element: { status: goneStatus, text: gone },
    },
    graph_left_out: [...left.matchAll(/"([a-z]+)"/g)].map((m) => m[1]).sort(),
  };
}

let live, commit;
try {
  const git = (...a) => execFileSync('git', ['-C', KEEL, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
  git('fetch', '-q', 'origin');
  commit = git('log', '-1', '--format=%h', 'origin/main').trim();
  live = facts((f) => git('show', `origin/main:${f}`));
} catch (e) { blind(`keel's code at ${KEEL} not read (${String(e.stderr || e.message).trim().split('\n')[0]})`); }

const stable = (o) => JSON.stringify(o, null, 2) + '\n';
const body = (o) => stable(Object.fromEntries(Object.keys(live).map((k) => [k, o[k]])));
let old = null;
try { old = JSON.parse(readFileSync(SNAP, 'utf8')); } catch { /* none yet, or unreadable: STALE below */ }
const same = old && body(old) === body(live);
if (argv.includes('--refresh')) {
  writeFileSync(SNAP, stable({
    source: 'keel origin/main: elements/visibility.py (scoped, reads_tombstones), core/world_api.py (_public_world), web/urls.py, web/public_views.py, web/public_page.py, portal/world_graph.py',
    read_at: same ? old.read_at : commit,
    ...live,
  }));
  say(`wrote contract/public.json from keel origin/main at ${commit}${same ? ` (unchanged, read_at ${old.read_at} kept)` : ''}`);
  process.exit(0);
}
if (!old) { say('STALE: contract/public.json missing or unreadable; run --refresh'); process.exit(1); }
if (same) {
  say(`contract/public.json matches keel origin/main at ${commit} (read at ${old.read_at}): the public reader leaves out ${live.removed.map((r) => r.key).join(', ')}, no tombstones, the ${live.pages.length} /w/ routes, the 404s, the graph without ${live.graph_left_out.join(', ')}`);
  process.exit(0);
}
for (const k of Object.keys(live)) if (stable(live[k]) !== stable(old[k])) say(`STALE: ${k} is ${JSON.stringify(live[k])} at ${commit}, ${JSON.stringify(old[k])} in the snapshot`);
say('the snapshot differs from keel\'s code: node scripts/gen_public.mjs --refresh');
process.exit(1);
