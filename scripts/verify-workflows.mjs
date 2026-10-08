#!/usr/bin/env node
// verify-workflows.mjs: every file in .github/workflows parses as YAML and has jobs.
// A workflow that does not parse never runs, so GitHub cannot report it as a failed check: the
// deploy simply never happens. (bbe7952: a `run:` value with ': ' in it broke both workflows for
// five pushes, and the PR showed "no checks" rather than a red one.) Runs before every push, in
// `npm run verify`.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '.github', 'workflows');
const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));
if (!files.length) { console.error('verify-workflows: no workflow files found'); process.exit(2); }
let bad = 0;
for (const f of files) {
  try {
    const doc = parse(readFileSync(join(DIR, f), 'utf8'), { strict: true, uniqueKeys: true });
    if (!doc?.jobs || !Object.keys(doc.jobs).length) throw new Error('no jobs');
    if (!doc.on && !doc[true]) throw new Error('no triggers (on:)');
    console.log(`  ok     ${f}: ${Object.keys(doc.jobs).join(', ')}`);
  } catch (e) {
    bad++;
    console.log(`  BROKEN ${f}: ${String(e.message).split('\n')[0]}`);
  }
}
if (bad) { console.log(`FAIL: ${bad} workflow file(s) would not run`); process.exit(1); }
console.log(`PASS: ${files.length} workflow file(s) parse`);
