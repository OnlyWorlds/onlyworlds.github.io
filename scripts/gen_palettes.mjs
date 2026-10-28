#!/usr/bin/env node
/**
 * gen_palettes.mjs: the public page palettes snapshot, from keel's own palette table.
 *
 * Usage: node scripts/gen_palettes.mjs                       compare contract/palettes.json with keel's origin/main
 *        node scripts/gen_palettes.mjs --refresh             rewrite contract/palettes.json from keel's origin/main
 *        node scripts/gen_palettes.mjs --keel PATH [...]     a keel checkout other than ../keel
 *
 * Source: the PALETTES dict and HOUSE_PALETTE in keel's worlds/public_page.py, read from the
 * published branch (git fetch, then git show origin/main:worlds/public_page.py), never the working
 * tree. keel is private, so the build cannot read it: the figure on /docs/development/api/public
 * (PagePalettes) and verify-figures.mjs read only the snapshot. The snapshot keeps keel's order
 * (the order the page's palette card offers them) and records the commit it was read at.
 *
 * Exit: 0 the snapshot matches (or was rewritten), 1 STALE, 2 BLIND (keel not readable: never a pass).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'palettes.json');
const FILE = 'worlds/public_page.py';
const argv = process.argv.slice(2);
const KEEL = resolve(argv.includes('--keel') ? argv[argv.indexOf('--keel') + 1] : join(ROOT, '..', 'keel'));
// The fields each palette must carry, in the snapshot's order; a field keel adds goes after them.
const FIELDS = ['name', 'mood', 'bg', 'surf', 'line', 'text', 'muted', 'accent', 'fill', 'onfill', 'wash', 'head'];

const blind = (why) => { console.log(`gen_palettes: BLIND: ${why}`); process.exit(2); };
const git = (...a) => execFileSync('git', ['-C', KEEL, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// A small reader for the one shape the table has: { "key": dict(field="value", ...), ... } with
// string literals only (adjacent literals joined, comments skipped). Anything else is refused.
function parsePalettes(src) {
  const at = src.search(/^PALETTES\s*=\s*\{/m);
  if (at < 0) throw new Error(`no "PALETTES = {" in ${FILE}`);
  let i = src.indexOf('{', at) + 1;
  const skip = () => {
    for (;;) {
      while (/\s/.test(src[i] ?? '')) i++;
      if (src[i] === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
      return;
    }
  };
  const fail = (what) => { throw new Error(`${FILE}: expected ${what} at "${src.slice(i, i + 30).replace(/\n/g, '\\n')}"`); };
  const str = () => {
    let out = '';
    skip();
    if (src[i] !== '"' && src[i] !== "'") fail('a string literal');
    while (src[i] === '"' || src[i] === "'") {
      const q = src[i++];
      while (src[i] !== q) {
        if (i >= src.length || src[i] === '\n') fail('the end of a string');
        if (src[i] === '\\') i++;
        out += src[i++];
      }
      i++;
      skip();
    }
    return out;
  };
  const expect = (c) => { skip(); if (src[i] !== c) fail(`"${c}"`); i++; };
  const out = [];
  for (;;) {
    skip();
    if (src[i] === '}') break;
    const key = str();
    expect(':');
    skip();
    if (!src.startsWith('dict(', i)) fail('dict(');
    i += 5;
    const p = {};
    for (;;) {
      skip();
      if (src[i] === ')') { i++; break; }
      const m = src.slice(i).match(/^([A-Za-z_]\w*)\s*=/);
      if (!m) fail('a keyword argument');
      i += m[0].length;
      p[m[1]] = str();
      skip();
      if (src[i] === ',') i++;
    }
    out.push({ key, ...p });
    skip();
    if (src[i] === ',') i++;
  }
  const house = src.match(/^HOUSE_PALETTE\s*=\s*(["'])([a-z_]+)\1/m)?.[2];
  if (!house) throw new Error(`no HOUSE_PALETTE in ${FILE}`);
  return { house, palettes: out };
}

// The snapshot's shape: fixed field order, keel's palette order, validated colours.
function snapshot({ house, palettes }, commit) {
  if (palettes.length < 1) throw new Error('PALETTES is empty');
  if (!palettes.some((p) => p.key === house)) throw new Error(`HOUSE_PALETTE ${house} is not in PALETTES`);
  const rows = palettes.map((p) => {
    for (const f of FIELDS) if (typeof p[f] !== 'string') throw new Error(`palette ${p.key} has no ${f}`);
    for (const f of ['bg', 'surf', 'line', 'text', 'muted', 'accent', 'fill', 'onfill']) {
      if (!/^#[0-9a-f]{6}$/.test(p[f])) throw new Error(`palette ${p.key}: ${f} is ${p[f]}, not #rrggbb`);
    }
    if (!/^rgba\(\d+,\d+,\d+,[\d.]+\)$/.test(p.wash)) throw new Error(`palette ${p.key}: wash is ${p.wash}, not rgba(r,g,b,a)`);
    const extra = Object.keys(p).filter((k) => k !== 'key' && !FIELDS.includes(k)).sort();
    return Object.fromEntries([['key', p.key], ...[...FIELDS, ...extra].map((f) => [f, p[f]])]);
  });
  return { source: `keel ${FILE}: PALETTES and HOUSE_PALETTE, on origin/main`, read_at: commit, default: house, palettes: rows };
}

const stable = (o) => JSON.stringify(o, null, 2) + '\n';
const body = (s) => stable({ default: s.default, palettes: s.palettes });

{
  let src, commit;
  try {
    git('fetch', '-q', 'origin');
  } catch (e) {
    blind(`git fetch in ${KEEL} failed (${String(e.stderr || e.message).trim().split('\n')[0]}); origin/main cannot be trusted as published`);
  }
  try {
    src = git('show', `origin/main:${FILE}`);
    commit = git('log', '-1', '--format=%h', 'origin/main', '--', FILE).trim();
  } catch (e) {
    blind(`cannot read origin/main:${FILE} in ${KEEL} (${String(e.stderr || e.message).trim().split('\n')[0]})`);
  }
  let live;
  try { live = snapshot(parsePalettes(src), commit); } catch (e) { blind(e.message); }
  const names = live.palettes.map((p) => p.key).join(', ');
  if (argv.includes('--refresh')) {
    writeFileSync(SNAP, stable(live));
    console.log(`gen_palettes: wrote contract/palettes.json from keel origin/main at ${commit}: ${names} (default ${live.default})`);
    process.exit(0);
  }
  let snap;
  try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { console.log(`gen_palettes: STALE: contract/palettes.json unreadable (${e.message}); run --refresh`); process.exit(1); }
  if (body(snap) !== body(live)) {
    console.log(`gen_palettes: STALE: keel origin/main at ${commit} (${names}, default ${live.default}) differs from contract/palettes.json (read at ${snap.read_at}); run --refresh`);
    process.exit(1);
  }
  const moved = snap.read_at !== commit ? `; ${FILE} has moved since (now ${commit}), its palettes unchanged` : '';
  console.log(`gen_palettes: contract/palettes.json matches keel origin/main (read at ${snap.read_at}${moved}): ${names}, default ${live.default}`);
}
