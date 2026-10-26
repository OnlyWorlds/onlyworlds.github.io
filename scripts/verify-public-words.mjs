#!/usr/bin/env node
// verify-public-words.mjs: the built site carries none of the crew's own words. From 2026-10-24
// (the founder's ruling: avoid it from now on, no scrub of what was out) public text names no room
// pointer, no item pointer (the server's repository is private, a stranger cannot follow
// them), no founder's title, no name of the team's console or ship, no bay, no crew email: a
// ruling says what it rules and when. A pointer is replaced by what it was there to say, usually
// the date the thing shipped. The founder's title followed by a capitalised name is a character
// and passes. Reads dist/, so it runs after a build, in `npm run verify`.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// The list itself lives in public-words.mjs, shared with other public pages' checks. The item
// pointer is checked everywhere except where listed below.
import { WORDS, ITEM_POINTER, teamWords } from './public-words.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// Built paths (relative to dist/, forward slashes) that may still carry item pointers, and why.
// `from` null: the whole file is exempt; a string: exempt from the first occurrence of that
// marker to the end of the file (the text above it is still checked). A marker that is missing
// is a CANNOT SEE, never a silent pass. Nothing else is exempt: add a path here only with a reason.
// None since 2026-10-26: the changelog's item pointers were taken out with the rest (Titus's word that
// public pages point into no private tracker), so it is checked like every page.
const ITEM_EXEMPT = [];
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
  for (const { index, length, what } of teamWords(text)) {
    bad++;
    if (bad <= 20) console.log(`  FOUND  ${relative(DIST, f)}: ${what}: "${text.slice(Math.max(0, index - 30), index + length + 20).replace(/\s+/g, ' ')}"`);
  }
}
if (bad) { console.log(`FAIL: ${bad} crew word(s) or item pointer(s) in the built site`); process.exit(1); }
console.log(`PASS: ${files.length} built file(s) carry no room pointer, item pointer, crew word or crew email (${exempted} item pointer(s) in the exempt regions)`);
