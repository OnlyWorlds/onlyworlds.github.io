#!/usr/bin/env node
// verify-first-lines.mjs: the two pages an assistant or a newcomer opens first, the built /llms.txt and
// the site's front page, each hold the lines a builder types: both install commands and the API's base.
// Measured on 2026-11-17: an assistant that had opened only a front page could name no package, and
// took the API's address from stale search results. Reads dist/ (--dist <dir> to read a copy), so it
// runs after a build, in `npm run verify`.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const at = process.argv.indexOf('--dist');
const DIST = at > -1 ? process.argv[at + 1] : join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8'));
const sdk = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).find((d) => d === '@onlyworlds/sdk');
if (!sdk) { console.log('CANNOT SEE: package.json no longer names @onlyworlds/sdk among its dependencies, the name this check reads'); process.exit(2); }
const LINES = [`npm install ${sdk}`, 'pip install onlyworlds', 'https://www.onlyworlds.com/api/v2/'];
const PAGES = ['llms.txt', 'index.html'];

const bad = [];
let held = 0;
for (const page of PAGES) {
  const file = join(DIST, page);
  if (!existsSync(file)) { console.log(`CANNOT SEE: ${page} is missing from the built site (build first)`); process.exit(2); }
  // The front page is HTML: tags are dropped and entities read, so a line split by markup still counts.
  const text = readFileSync(file, 'utf8').replace(/<[^>]+>/g, '').replace(/&#x2F;|&#47;/g, '/').replace(/&#64;|&#x40;/g, '@').replace(/&amp;/g, '&');
  for (const line of LINES) {
    if (text.includes(line)) held++;
    else bad.push(`${page} lacks "${line}"`);
  }
}
if (bad.length) { console.log(`FAIL: first lines: ${bad.join('; ')}`); process.exit(1); }
console.log(`PASS: first lines: ${held} of ${LINES.length * PAGES.length} held (${PAGES.join(' and ')} each name both installs and the API's base)`);
