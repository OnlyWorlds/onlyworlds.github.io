#!/usr/bin/env node
// verify-public-words.mjs: the built site carries none of the crew's own words. From 2026-10-24
// (the founder's ruling: avoid it from now on, no scrub of what was out) public text names no room
// pointer (h58 #11968), no item pointer (keel #571, OW Infra #666: the server's repository is
// private, a stranger cannot follow them), no Captain, Deck or Carrier, no bay, no crew email: a
// ruling says what it rules and when. A pointer is replaced by what it was there to say, usually
// the date the thing shipped. "Captain" followed by a capitalised name is a character (Moppetopia's Captain
// Snoot) and passes. Reads dist/, so it runs after a build, in `npm run verify`.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const WORDS = [
  [/\bh\d{1,3} #\d+/g, 'a room pointer'],
  [/\b(?:the )?Captain\b(?! [A-Z][a-z])/g, 'Captain'],
  [/\b(?:the Deck|Carrier)\b/g, 'the crew\'s ship'],
  [/\b(?:Armature|Orrery|Hangar|Hatchery|Assembly bay|Forge bay)\b/g, 'a bay name'],
  [/allthecarriercrew/g, 'the crew email'],
];

// An item pointer: a tracker's name and a number. Checked everywhere except where listed below.
const ITEM_POINTER = [/\b(?:[Kk]eel|OW [A-Z][a-z]+) #\d+/g, 'an item pointer'];

// Built paths (relative to dist/, forward slashes) that may still carry item pointers, and why.
// `from` null: the whole file is exempt; a string: exempt from the first occurrence of that
// marker to the end of the file (the text above it is still checked). A marker that is missing
// is a CANNOT SEE, never a silent pass. Nothing else is exempt: add a path here only with a reason.
const ITEM_EXEMPT = [
  { why: 'the changelog is the dated record and is kept as it was written. It is exempted whole: an entry of 2026-10-24 (before the ruling reached it) still carries one, and a date cut-off would refuse that line',
    files: [['docs/changelog.html', null], ['docs/changelog.md', null]] },
  { why: 'the TypeScript page\'s Reference is generated from the SDK\'s doc comments (scripts/gen_sdk_ref.mjs); clean at the release after 4.72.1. The page\'s prose above the Reference is checked',
    files: [['docs/development/typescript.html', 'id="reference"'], ['docs/development/typescript.md', '\n## Reference\n']] },
];
// The aggregate text files repeat every page, with their own line breaks and link syntax; a pointer
// in one is exempt only when the same pointer, with up to 24 letters and digits before it on its line, sits in an
// exempt region of a page above (compared with punctuation, spacing and link targets taken out).
const AGGREGATE = /^(?:llms[^/]*\.txt|_llms-txt\/[^/]+\.txt)$/;
if (!existsSync(DIST)) { console.log('CANNOT SEE: dist/ is missing (build first)'); process.exit(2); }
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|md|txt|xml)$/.test(n)) files.push(p);
  }
})(DIST);
const rel = (f) => relative(DIST, f).split('\\').join('/');
const exemptStart = new Map(); // built path -> index where its exempt region starts
let exemptHay = '';
const squash = (s) => s.replace(/\]\([^)]*\)/g, '').replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
for (const { files: list } of ITEM_EXEMPT) {
  for (const [path, from] of list) {
    const f = join(DIST, path);
    if (!existsSync(f)) { console.log(`CANNOT SEE: exempt path ${path} is not in dist/`); process.exit(2); }
    const text = readFileSync(f, 'utf8');
    const at = from === null ? 0 : text.indexOf(from);
    if (at < 0) { console.log(`CANNOT SEE: marker ${JSON.stringify(from)} is not in ${path}`); process.exit(2); }
    exemptStart.set(path, at);
    exemptHay += squash(text.slice(at)) + '|';
  }
}
let bad = 0;
let exempted = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  const path = rel(f);
  for (const [re, what] of [...WORDS, ITEM_POINTER]) {
    for (const m of text.matchAll(re)) {
      if (re === ITEM_POINTER[0]) {
        const at = exemptStart.get(path);
        const needle = squash(text.slice(text.lastIndexOf(String.fromCharCode(10), m.index) + 1, m.index)).slice(-24) + squash(m[0]);
        if ((at !== undefined && m.index >= at) || (AGGREGATE.test(path) && exemptHay.includes(needle))) { exempted++; continue; }
      }
      bad++;
      if (bad <= 20) console.log(`  FOUND  ${relative(DIST, f)}: ${what}: "${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/\s+/g, ' ')}"`);
    }
  }
}
if (bad) { console.log(`FAIL: ${bad} crew word(s) or item pointer(s) in the built site`); process.exit(1); }
console.log(`PASS: ${files.length} built file(s) carry no room pointer, item pointer, crew word or crew email (${exempted} item pointer(s) in the exempt regions)`);
