#!/usr/bin/env node
/**
 * gen_errors.mjs: the errors page and the URL contract's floor, from keel's own list of error codes.
 *
 * Usage: node scripts/gen_errors.mjs            write the table and the floor rows from the snapshot; check the page
 *        node scripts/gen_errors.mjs --check    write nothing; exit 1 if anything would change or a check fails
 *        node scripts/gen_errors.mjs --refresh  first replace the snapshot with the live OpenAPI's list
 *        node scripts/gen_errors.mjs --live     compare the snapshot with the live list; exit 1 if they differ
 *
 * Source: components.schemas.Error.x-ow-error-codes in https://www.onlyworlds.com/api/v2/openapi.json
 * (Keel #82), vendored as contract/error-codes.json so a build never depends on the API being up.
 * Rows marked internal are skipped; rows with a host are the upload host's (no doc_url, no anchors).
 *
 * Writes: the summary table between the markers on /api/errors/, and the 'floor' rows of
 * contract/urls.tsv (one per public code: each must be an anchor on /api/errors/).
 * Checks (fail): every public code has a '### <code>' section and every section is a public code;
 * the Upload Host Errors table lists exactly the host rows, with the same statuses.
 * The prose of each section stays hand-written; only its presence is checked.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = join(ROOT, 'contract', 'error-codes.json');
const PAGE = join(ROOT, 'src', 'content', 'docs', 'api', 'errors', 'index.md');
const CONTRACT = join(ROOT, 'contract', 'urls.tsv');
const OPENAPI = 'https://www.onlyworlds.com/api/v2/openapi.json';
const BEGIN = '<!-- generated:error-codes (scripts/gen_errors.mjs, from contract/error-codes.json) -->';
const END = '<!-- /generated:error-codes -->';
const args = new Set(process.argv.slice(2));
const problems = [];

const fetchLive = async () => {
  const r = await fetch(OPENAPI, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) { console.error(`gen_errors: ${OPENAPI} answered ${r.status}`); process.exit(2); }
  const codes = (await r.json())?.components?.schemas?.Error?.['x-ow-error-codes'];
  if (!codes || typeof codes !== 'object') { console.error('gen_errors: the live OpenAPI has no Error.x-ow-error-codes'); process.exit(2); }
  return codes;
};
const stable = (o) => JSON.stringify(o, null, 2) + '\n';

if (args.has('--live')) {
  const live = stable(await fetchLive()), snap = readFileSync(SNAP, 'utf8');
  console.log(live === snap ? 'gen_errors: snapshot matches the live OpenAPI' : 'gen_errors: STALE: the live OpenAPI list differs from contract/error-codes.json (run --refresh)');
  process.exit(live === snap ? 0 : 1);
}
if (args.has('--refresh')) writeFileSync(SNAP, stable(await fetchLive()));

const codes = JSON.parse(readFileSync(SNAP, 'utf8'));
const pub = Object.entries(codes).filter(([, r]) => !r.internal && !r.host);
const host = Object.entries(codes).filter(([, r]) => r.host);
if (pub.length < 10) { console.error(`gen_errors: only ${pub.length} public codes in the snapshot; refusing to write`); process.exit(2); }

// ---- the summary table -------------------------------------------------------------------------
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const table = [
  BEGIN,
  '| Code | Type | Status | What happened |',
  '|:--|:--|:--|:--|',
  ...pub.map(([c, r]) => `| [\`${c}\`](#${c}) | \`${r.type}\` | \`${r.status}\` | ${cell(r.summary)} |`),
  END,
].join('\n');

let page = readFileSync(PAGE, 'utf8');
const original = page;
if (page.includes(BEGIN)) {
  page = page.slice(0, page.indexOf(BEGIN)) + table + page.slice(page.indexOf(END) + END.length);
} else {
  // first run: replace the hand-kept table under '## Error Codes'
  const m = page.match(/## Error Codes\n\n(\| Code \| Type \| Status \|\n(?:\|.*\n)+)/);
  if (!m) { console.error('gen_errors: no marker and no "## Error Codes" table to replace'); process.exit(2); }
  page = page.replace(m[1], table + '\n');
}

// ---- checks: sections and the upload host table ---------------------------------------------------
const sections = [...page.matchAll(/^### ([a-z_]+)\s*$/gm)].map((m) => m[1]);
for (const [c] of pub) if (!sections.includes(c)) problems.push(`public code ${c} has no "### ${c}" section on the errors page`);
for (const s of sections) if (!codes[s] || codes[s].internal || codes[s].host) problems.push(`the errors page has a section "### ${s}", which is not a public code`);
const hostTable = page.split('## Upload Host Errors')[1] ?? '';
const hostRows = new Map([...hostTable.matchAll(/^\| `(\d{3})` \| `([a-z_]+)` \|/gm)].map((m) => [m[2], Number(m[1])]));
if (!hostRows.size) problems.push('no Upload Host Errors table found to check');
for (const [c, r] of host) {
  if (!hostRows.has(c)) problems.push(`upload host code ${c} (${r.status}) is missing from the Upload Host Errors table`);
  else if (hostRows.get(c) !== r.status) problems.push(`upload host code ${c}: the table says ${hostRows.get(c)}, keel's list says ${r.status}`);
}
for (const c of hostRows.keys()) if (!codes[c]?.host) problems.push(`the Upload Host Errors table lists ${c}, which keel's list does not have as a host code`);

// ---- the contract's floor rows -----------------------------------------------------------------
const tsv = readFileSync(CONTRACT, 'utf8');
// Drop only the rows this script writes (status column exactly 'floor'); a row found in a repo that
// links an anchor keeps its own row and sources, marked 'floor; <its status>' in place.
const kept = tsv.split('\n').filter((l) => l !== '' && l.split('\t')[2] !== 'floor');
const floor = pub.map(([c]) => `/api/errors#${c}\tload-bearing\tfloor\tkeel's error-code list (contract/error-codes.json; Keel #82)`);
const linked = new Set(kept.map((l) => l.split('\t')[0]));
const marked = kept.map((l) => {
  const [url, cls, today, ...rest] = l.split('\t');
  const code = url.startsWith('/api/errors#') ? url.slice('/api/errors#'.length) : null;
  if (code && pub.some(([c]) => c === code) && !(today ?? '').startsWith('floor')) return [url, cls, `floor; ${today}`, ...rest].join('\t');
  return l;
});
const newTsv = [...marked, ...floor.filter((r) => !linked.has(r.split('\t')[0]))].join('\n') + '\n';

const changed = [page !== original && 'the errors table', newTsv !== tsv && 'the contract floor'].filter(Boolean);
for (const p of problems) console.log(`  PROBLEM  ${p}`);
if (args.has('--check')) {
  console.log(`gen_errors: ${pub.length} public codes, ${host.length} host codes; ${changed.length ? 'STALE: ' + changed.join(', ') : 'current'}`);
  process.exit(changed.length || problems.length ? 1 : 0);
}
if (page !== original) writeFileSync(PAGE, page);
if (newTsv !== tsv) writeFileSync(CONTRACT, newTsv);
console.log(`gen_errors: ${pub.length} public codes, ${host.length} host codes${changed.length ? '; rewrote ' + changed.join(' and ') : ''}`);
if (problems.length) { console.log(`FAIL: ${problems.length} problem(s) on the errors page`); process.exit(1); }
