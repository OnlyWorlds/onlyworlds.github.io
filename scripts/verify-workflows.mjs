#!/usr/bin/env node
// verify-workflows.mjs: every file in .github/workflows parses as YAML and has jobs, and the Pages
// upload keeps the site's dot-named paths (the second check, below).
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

// The Pages upload and dot-named paths. Since its v4, actions/upload-pages-artifact leaves every file and
// folder whose name starts with a dot out of the site unless the step sets `include-hidden-files: true`.
// The site serves such paths (public/.well-known/security.txt), and the URL gate reads dist/ before the
// upload, so nothing else sees them dropped. While public/ holds a dot-named path, every upload step at
// v4 or later, or at a ref this cannot read a major from, must carry the input.
const PUBLIC = join(DIR, '..', '..', 'public');
const dotted = [];
(function walk(dir, rel) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const at = rel ? `${rel}/${e.name}` : e.name;
    if (e.name.startsWith('.')) dotted.push(at);
    else if (e.isDirectory()) walk(join(dir, e.name), at);
  }
})(PUBLIC, '');
let uploads = 0;
const dropped = [];
for (const f of files) {
  const doc = parse(readFileSync(join(DIR, f), 'utf8'));
  for (const [job, def] of Object.entries(doc.jobs)) {
    for (const step of def.steps ?? []) {
      const m = /^actions\/upload-pages-artifact@(.+)$/.exec(String(step.uses ?? ''));
      if (!m) continue;
      uploads++;
      const major = /^v(\d+)/.exec(m[1])?.[1];
      const keeps = step.with?.['include-hidden-files'] === true || step.with?.['include-hidden-files'] === 'true';
      if (dotted.length && !(major && Number(major) < 4) && !keeps) dropped.push(`${f}: job ${job} uploads the site with upload-pages-artifact@${m[1]} and no include-hidden-files: true`);
    }
  }
}
if (dropped.length) {
  for (const d of dropped) console.log(`  DROPS  ${d}`);
  console.log(`FAIL: the deploy would leave ${dotted.length} dot-named path(s) out of the site (${dotted.slice(0, 3).join(', ')})`);
  process.exit(1);
}
console.log(`PASS: ${files.length} workflow file(s) parse; ${uploads} Pages upload step(s) keep the site's ${dotted.length} dot-named path(s)`);
