#!/usr/bin/env node
/**
 * mutants-run.mjs: plant faults in copies of the real pages and watch verify-run.mjs fail on each.
 *
 * Usage: node scripts/mutants-run.mjs     (after `npm run build`; in `npm run verify`, after verify-run)
 *
 * Each mutant changes one thing in memory (a page's source as committed, or its built HTML in dist/)
 * and runs verify-run's own checks on it; it must fail with the words named beside it. A control,
 * the same pages unchanged, must pass. Nothing is written.
 *
 * Exit: 0 every mutant failed as named and the control passed, 1 otherwise, 2 BLIND (a page, its
 * built copy or a mutant's anchor not found: never a pass).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { checkSource, checkPage, checkOther, checkText } from './verify-run.mjs';
import { encodeRequest } from '../src/run/marker.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const blind = (why) => { console.log(`mutants-run: BLIND: ${why}. Not a pass.`); process.exit(2); };
const SRC = {
  reads: 'docs/development/api/reads.md',
  writes: 'docs/development/api/writes.md',
  first: 'docs/getting-started/first-hour.mdx',
};
const src = {};
for (const [k, rel] of Object.entries(SRC)) {
  const f = join(ROOT, 'src', 'content', 'docs', rel);
  if (!existsSync(f)) blind(`${rel} not found`);
  src[k] = readFileSync(f, 'utf8');
}
const built = {};
for (const k of ['reads', 'writes', 'links']) {
  const f = join(ROOT, 'dist', 'docs', 'development', 'api', `${k}.html`);
  if (!existsSync(f)) blind(`dist/docs/development/api/${k}.html not found (run npm run build first)`);
  built[k] = readFileSync(f, 'utf8');
}
const p = JSON.parse(readFileSync(join(ROOT, 'contract', 'practice.json'), 'utf8'));
const jsHash = createHash('sha256').update(readFileSync(join(ROOT, 'dist', 'assets', 'ow-run.js'))).digest('hex').slice(0, 10);

// replace exactly one occurrence, or BLIND: a mutant whose anchor moved tests nothing
const swap = (text, from, to) => {
  const n = text.split(from).length - 1;
  if (n !== 1) blind(`a mutant's anchor is found ${n} times, not once: ${from.slice(0, 80)}`);
  return text.replace(from, () => to);
};
// the first of several: for an anchor every Run of a kind carries (a page's buttons, in order)
const swapFirst = (text, from, to) => {
  if (!text.includes(from)) blind(`a mutant's anchor is not found: ${from.slice(0, 80)}`);
  return text.replace(from, () => to);
};
const srcFails = (k, text) => checkSource(SRC[k], text).fails;
const pageFails = (k, html) => checkPage(k, html, checkSource(SRC[k], src[k]).markers, p, jsHash);

const LOC = '<!-- run: POST /api/v2/location {';
const SEARCH = '<!-- run: GET /api/v2/search?q=drippers&limit=3 API-Key:0000000001 -->';
const LOC_CURL = 'curl -s -X POST "https://www.onlyworlds.com/api/v2/location" \\\n  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \\\n';
const ID_READ = 'curl -s "https://www.onlyworlds.com/api/v2/character/{id}" -H "API-Key: {key}"\n```\n';
const PAGES_READ = 'curl -s "https://www.onlyworlds.com/api/v2/character?limit=100&cursor={next_cursor}" -H "API-Key: {key}"\n```\n';
const firstButton = (html) => html.match(/data-ow-run="([^"]*)"/)[1];
// the location sample with one more header, and its marker with or without it
const withHeader = (inMarker) => swap(swap(src.writes, LOC_CURL, `${LOC_CURL}  -H "Idempotency-Key: 6f1c2a9e" \\\n`), LOC, inMarker === undefined ? LOC : `<!-- run: POST /api/v2/location Idempotency-Key:${inMarker} {`);

const MUTANTS = [
  // the sources: a marker held to its sample
  ['the marker\'s method differs', () => srcFails('writes', swap(src.writes, LOC, '<!-- run: PUT /api/v2/location {')), 'the marker runs PUT; the sample sends POST'],
  ['the marker\'s path differs', () => srcFails('writes', swap(src.writes, LOC, '<!-- run: POST /api/v2/locations {')), 'the marker runs /api/v2/locations'],
  ['the sample\'s query differs', () => srcFails('reads', swap(src.reads, 'search?q=drippers&limit=3" -H', 'search?q=drippers&limit=4" -H')), 'the sample sends /api/v2/search?q=drippers&limit=4'],
  ['the sample\'s method differs', () => srcFails('writes', swap(src.writes, 'curl -s -X POST "https://www.onlyworlds.com/api/v2/location"', 'curl -s -X PUT "https://www.onlyworlds.com/api/v2/location"')), 'the marker runs POST; the sample sends PUT'],
  ['the marker\'s body differs', () => srcFails('writes', swap(src.writes, '{"name": "The Time Tombs", "description"', '{"name": "The Time Tomb", "description"')), 'the marker\'s body is not the sample\'s'],
  ['the marker drops the body', () => srcFails('writes', swap(src.writes, ' {"name": "The Time Tombs", "description": "Structures on Hyperion that move backward through time."} -->', ' -->')), 'the sample sends a body; the marker has none'],
  ['the marker\'s header value differs', () => srcFails('writes', withHeader('00000000')), 'the marker\'s Idempotency-Key is 00000000; the sample\'s is 6f1c2a9e'],
  ['the marker drops a header the sample sends', () => srcFails('writes', withHeader()), 'the sample sends Idempotency-Key; the marker does not'],
  ['the marker adds a header the sample does not send', () => srcFails('writes', swap(src.writes, LOC, '<!-- run: POST /api/v2/location If-Match:"41" {')), 'the marker sends If-Match; the sample does not'],
  ['no code block above the marker', () => srcFails('writes', swap(src.writes, `\`\`\`\n${LOC}`, `\`\`\`\nA paragraph between.\n${LOC}`)), 'a run marker with no code block right above it'],
  ['a marker on a sample with a placeholder', () => srcFails('reads', swap(src.reads, ID_READ, `${ID_READ}<!-- run: GET /api/v2/character/{id} -->\n`)), 'holds a placeholder'],
  ['a marker on a sample that sends two requests', () => srcFails('reads', swap(src.reads, PAGES_READ, `${PAGES_READ}<!-- run: GET /api/v2/character?limit=100 -->\n`)), 'the sample sends 2 curl requests, not one'],
  ['a marker inside a line', () => srcFails('reads', swap(src.reads, 'Treat the cursor as opaque:', 'Treat the cursor <!-- run: GET /api/v2/world --> as opaque:')), 'a run marker that is not a line of its own'],
  ['a marker that does not parse', () => srcFails('writes', swap(src.writes, LOC, '<!-- run: POST api/v2/location {')), 'does not start /api/v2/'],
  ['a marker in an .mdx page', () => checkSource(SRC.first, swap(src.first, '## 2. Read a world', '{/* run: GET /api/v2/world */}\n\n## 2. Read a world')).fails, 'a run marker in an .mdx page'],
  // the sources: the demo key
  ['a demo key on a write', () => srcFails('writes', swap(src.writes, LOC, '<!-- run: POST /api/v2/location API-Key:0000000001 {')), 'a demo key runs only a GET, never a POST'],
  ['the sample reads with a demo key the marker does not name', () => srcFails('reads', swap(src.reads, SEARCH, '<!-- run: GET /api/v2/search?q=drippers&limit=3 -->')), 'the sample reads with the demo key 0000000001; the marker does not name it'],
  ['the marker names another demo key', () => srcFails('reads', swap(src.reads, SEARCH, '<!-- run: GET /api/v2/search?q=drippers&limit=3 API-Key:0000000002 -->')), 'the marker\'s API-Key is 0000000002; the sample\'s is 0000000001'],
  ['the marker names a key that is not a demo key', () => srcFails('reads', swap(src.reads, SEARCH, '<!-- run: GET /api/v2/search?q=drippers&limit=3 API-Key:ow_w_abcdefghij -->')), 'is not a demo key'],
  ['the marker names a demo key the sample does not send', () => srcFails('reads', swap(src.reads, 'search?q=drippers&limit=3" -H "API-Key: 0000000001"', 'search?q=drippers&limit=3" -H "API-Key: {key}"')), 'the marker names the demo key 0000000001; the sample sends another key'],
  // the built page
  ['a Run button sends another request', () => pageFails('writes', swap(built.writes, firstButton(built.writes), encodeRequest({ method: 'POST', path: '/api/v2/location', headers: {}, body: { name: 'Elsewhere' } }))), 'Run button 1 sends'],
  ['a Run button is missing', () => pageFails('reads', built.reads.replace(/<span class="ow-run-bar">[\s\S]*?<\/span><\/figcaption>/, '</figcaption>')), '1 Run button(s) for 2 marker(s)'],
  ['a demo-key Run labelled for the practice world', () => pageFails('reads', swapFirst(built.reads, '>with the demo key</a>', '>on the practice world</a>')), 'Run button 1\'s label is "on the practice world"'],
  ['a demo-key Run named for the practice world', () => pageFails('reads', swapFirst(built.reads, 'aria-label="Run with the demo key"', 'aria-label="Run on the practice world"')), 'not "Run with the demo key"'],
  ['the practice line on a page whose Runs all use a demo key', () => pageFails('reads', swapFirst(built.reads, '<div class="ow-run-panel', '<p class="ow-run-note">Run sends the sample to the practice world.</p><div class="ow-run-panel')),'on a page whose Runs all use a demo key; none is wanted'],
  ['the practice key on a page whose Runs all use a demo key', () => pageFails('reads', built.reads.replace(' data-ow-run data-rate-key', ` data-ow-run data-key="${p.key}" data-rate-key`)), 'the runner carries the practice key or PIN on a page whose Runs all use a demo key'],
  ['an answer panel is missing', () => pageFails('writes', built.writes.replace(/<div class="ow-run-panel[^>]*><\/div>/, '')), 'no empty answer panel right under Run button 1'],
  ['the line is missing', () => pageFails('writes', built.writes.replace(/<p class="ow-run-note">[\s\S]*?<\/p>/, '')), '0 "Run sends the sample" line(s)'],
  ['the line comes twice', () => pageFails('writes', built.writes.replace(/(<p class="ow-run-note">[\s\S]*?<\/p>)/, '$1$1')), '2 "Run sends the sample" line(s)'],
  ['the runner script is missing', () => pageFails('writes', built.writes.replace(/<script\b[^>]*\bdata-ow-run\b[^>]*><\/script>/, '')), '0 runner script(s)'],
  ['the runner carries another key', () => pageFails('writes', swap(built.writes, `data-key="${p.key}"`, 'data-key="ow_w_not_the_practice_key"')), 'the runner\'s key is not contract/practice.json\'s'],
  ['the runner loads a stale file', () => pageFails('reads', swap(built.reads, `ow-run.js?v=${jsHash}`, 'ow-run.js?v=0000000000')), 'the built file\'s hash'],
  ['the runner on a page with no marker', () => checkOther('links', built.links.replace('</body>', '<script type="module" src="/assets/ow-run.js?v=1" data-ow-run></script></body>')), 'has no marker'],
  ['a twin carries a marker', () => checkText('reads.md', src.reads), 'carries a run marker'],
  ['an llms text carries the line', () => checkText('llms-full.txt', 'Run sends the sample to the practice world: anyone can read it.'), 'carries the Run line'],
];

let bad = 0;
const control = [
  ...srcFails('reads', src.reads), ...srcFails('writes', src.writes),
  ...pageFails('reads', built.reads), ...pageFails('writes', built.writes), ...checkOther('links', built.links),
];
if (control.length) { bad++; console.log(`  control: FAILED to pass:\n    ${control.join('\n    ')}`); } else console.log('  control (the pages unchanged): passes');
for (const [name, run, want] of MUTANTS) {
  const fails = run();
  const hit = fails.some((f) => f.includes(want));
  if (!hit) bad++;
  console.log(`  ${hit ? 'red as named' : 'NOT CAUGHT'}: ${name}${hit ? '' : ` (wanted "${want}"; got ${fails.length ? fails.join(' | ') : 'a pass'})`}`);
}
if (bad) { console.log(`mutants-run: FAIL: ${bad} of ${MUTANTS.length + 1} did not behave`); process.exit(1); }
console.log(`mutants-run: PASS: ${MUTANTS.length} planted faults each failed verify-run as named; the control passed`);
