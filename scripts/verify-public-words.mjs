#!/usr/bin/env node
// verify-public-words.mjs: the built site carries none of the crew's own words. From 2026-10-24
// (the founder's ruling: avoid it from now on, no scrub of what was out) public text names no room
// pointer (h58 #11968), no Captain, Deck or Carrier, no bay, no crew email: a ruling says what it
// rules and when. "Captain" followed by a capitalised name is a character (Moppetopia's Captain
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
if (!existsSync(DIST)) { console.log('CANNOT SEE: dist/ is missing (build first)'); process.exit(2); }
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|md|txt|xml)$/.test(n)) files.push(p);
  }
})(DIST);
let bad = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const [re, what] of WORDS) {
    for (const m of text.matchAll(re)) {
      bad++;
      if (bad <= 20) console.log(`  FOUND  ${relative(DIST, f)}: ${what}: "${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/\s+/g, ' ')}"`);
    }
  }
}
if (bad) { console.log(`FAIL: ${bad} crew word(s) in the built site`); process.exit(1); }
console.log(`PASS: ${files.length} built file(s) carry no room pointer, crew word or crew email`);
