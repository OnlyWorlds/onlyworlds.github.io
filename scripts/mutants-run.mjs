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
  links: 'docs/development/api/links.md',
  first: 'docs/getting-started/first-hour.mdx',
};
const src = {};
for (const [k, rel] of Object.entries(SRC)) {
  const f = join(ROOT, 'src', 'content', 'docs', rel);
  if (!existsSync(f)) blind(`${rel} not found`);
  src[k] = readFileSync(f, 'utf8');
}
const built = {};
for (const k of ['reads', 'writes', 'links', 'hidden']) {
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
// the Links page's chain: a Location, a Character there, the Character added to its founders
const KEATS = '<!-- run: POST /api/v2/location {"name": "Keats", "description": "The capital city of Hyperion."} -->\n';
const BILLY = '<!-- run: POST /api/v2/character {"name": "Sad King Billy", "location": "{made:location}"} -->';
const BILLY_BODY = `-d '{ "name": "Sad King Billy", "location": "<location-id>" }'`;
const FOUNDERS = '<!-- run: POST /api/v2/location/{made:location}/links/founders {"add": ["{made:character}"]} -->';
const FOUNDERS_URL = '"https://www.onlyworlds.com/api/v2/location/<location-id>/links/founders"';
const AN_ID = '0698c1d2-0000-7000-8000-000000000001';
// a built page's Run buttons, in order
const BUTTON = '<button type="button" class="ow-run" data-ow-run="';
const nth = (html, from, n) => { let at = -1; for (let i = 0; i < n; i++) { at = html.indexOf(from, at + 1); if (at < 0) blind(`a mutant's anchor is not found ${n} times: ${from.slice(0, 80)}`); } return at; };
// change the nth button tag on the page (1 = the first)
const button = (html, n, edit) => {
  const at = nth(html, BUTTON, n);
  const end = html.indexOf('>', at) + 1;
  const tag = html.slice(at, end);
  const changed = edit(tag);
  if (changed === tag) blind(`a mutant changed nothing in Run button ${n}`);
  return html.slice(0, at) + changed + html.slice(end);
};
const swapNth = (text, from, n, to) => { const at = nth(text, from, n); return text.slice(0, at) + to + text.slice(at + from.length); };
const WAIT_TEXT = '<span class="ow-run-label">Run after the Location above</span>';

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
  // the sources: a made id
  ['a made id with no create on the page', () => srcFails('links', swap(src.links, KEATS, '')), '{made:location} names a location that no earlier Run on this page creates'],
  ['a made id of the type its own Run creates',() => srcFails('links', swap(src.links, BILLY, BILLY.replace('{made:location}', '{made:character}'))), '{made:character} names a character that no earlier Run on this page creates'],
  ['a made id of a type no Run creates, in marker and sample alike', () => srcFails('links', swap(swap(src.links, BILLY, BILLY.replace('{made:location}', '{made:species}')), BILLY_BODY, BILLY_BODY.replace('<location-id>', '<species-id>'))), '{made:species} names a species that no earlier Run on this page creates'],
  ['the sample\'s placeholder with a plain id in the marker, in the body', () => srcFails('links', swap(src.links, BILLY, BILLY.replace('{made:location}', AN_ID))), 'the sample\'s <location-id> has no {made:location} at its place in the marker\'s body'],
  ['the marker\'s made id with a plain id in the sample, in the body', () => srcFails('links', swap(src.links, BILLY_BODY, BILLY_BODY.replace('<location-id>', AN_ID))), 'the marker\'s {made:location} has no <location-id> at its place in the sample\'s body'],
  ['the sample\'s placeholder with a plain id in the marker, in the URL', () => srcFails('links', swap(src.links, FOUNDERS, FOUNDERS.replace('/location/{made:location}/', `/location/${AN_ID}/`))), 'the sample\'s <location-id> has no {made:location} at its place in the marker\'s URL'],
  ['the marker\'s made id with a plain id in the sample, in the URL', () => srcFails('links', swap(src.links, FOUNDERS_URL, FOUNDERS_URL.replace('<location-id>', AN_ID))), 'the marker\'s {made:location} has no <location-id> at its place in the sample\'s URL'],
  ['the sample names another type at a made id\'s place', () => srcFails('links', swap(src.links, `"add": ["<character-id>"]`, `"add": ["<location-id>"]`)), 'the marker\'s {made:character} has no <character-id> at its place in the sample\'s body'],
  ['a made id inside a longer string', () => srcFails('links', swap(src.links, BILLY, BILLY.replace('"{made:location}"', '"near {made:location}"'))), 'that is not a whole string {made:<type>}'],
  ['a made id not in its form', () => srcFails('links', swap(src.links, FOUNDERS, FOUNDERS.replace('/{made:location}/', '/{made:Location}/'))), 'that is not {made:<type>}'],
  ['a made id on a demo-key Run', () => srcFails('reads', swap(src.reads, SEARCH, '<!-- run: GET /api/v2/search?q={made:location}&limit=3 API-Key:0000000001 -->')), 'a demo-key Run names no {made:'],
  // the built page: a Run that waits for a made id
  ['a waiting Run built enabled', () => pageFails('links', button(built.links, 2, (t) => t.replace(' disabled', ''))), 'Run button 2 is enabled; it waits for a location'],
  ['a waiting Run that reads "Run"', () => pageFails('links', swapNth(built.links, WAIT_TEXT, 1, '<span class="ow-run-label">Run</span>')), 'Run button 2 reads "Run", not "Run after the Location above"'],
  ['a waiting Run named as a plain Run', () => pageFails('links', button(built.links, 2, (t) => t.replace('aria-label="Run after the Location above"', 'aria-label="Run on the practice world"'))), 'Run button 2\'s name is "Run on the practice world", not "Run after the Location above"'],
  ['a waiting Run that waits for the wrong create', () => pageFails('links', swapNth(button(built.links, 3, (t) => t.replace('Run after the Location above', 'Run after the Character above')), WAIT_TEXT, 2, '<span class="ow-run-label">Run after the Character above</span>')), 'Run button 3\'s name is "Run after the Character above", not "Run after the Location above"'],
  ['a plain Run built disabled', () => pageFails('links', button(built.links, 1, (t) => t.replace('aria-label="Run on the practice world"', 'aria-label="Run on the practice world" disabled'))), 'Run button 1 is disabled; it sends as written'],
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
  ['the runner on a page with no marker', () => checkOther('hidden', built.hidden.replace('</body>', '<script type="module" src="/assets/ow-run.js?v=1" data-ow-run></script></body>')), 'has no marker'],
  ['a twin carries a marker', () => checkText('reads.md', src.reads), 'carries a run marker'],
  ['an llms text carries the line', () => checkText('llms-full.txt', 'Run sends the sample to the practice world: anyone can read it.'), 'carries the Run line'],
];

let bad = 0;
const control = [
  ...srcFails('reads', src.reads), ...srcFails('writes', src.writes), ...srcFails('links', src.links),
  ...pageFails('reads', built.reads), ...pageFails('writes', built.writes), ...pageFails('links', built.links), ...checkOther('hidden', built.hidden),
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
