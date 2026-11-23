#!/usr/bin/env node
/**
 * mutants-stability.mjs: plant faults and watch verify-stability.mjs fail on each.
 *
 * Usage: node scripts/mutants-stability.mjs     (in `npm run verify`, after verify-stability)
 *
 * Three kinds, each changing one thing in memory; nothing is written:
 *   - the page: the Stability and deprecation page as committed, with one edit, against the snapshot;
 *   - the snapshot: contract/stability.json with one more fact, against the page as committed;
 *   - the document: a small API document of this file's own, with one edit, read by the check's own reader.
 * A fourth kind plants on the notice period: the pages that restate it, as committed, with one edit.
 * A page, snapshot or period mutant must fail with the words named beside it. A document mutant must be seen by the
 * reader (the count named beside it moves); that a snapshot holding such a fact fails the page is the second
 * kind's work, so the two together cover a change in the live document. A control of each kind must pass,
 * and one plant must stay unseen on purpose: a date inside an `example`.
 *
 * Exit: 0 every mutant behaved as named and the controls passed, 1 otherwise, 2 BLIND (the page, the snapshot
 * or a mutant's anchor not found: never a pass).
 */
import { readFileSync } from 'node:fs';
import { checkPage, checkPeriod, pageFiles, extract, PAGE, SNAP, NOTHING } from './verify-stability.mjs';

const blind = (why) => { console.log(`mutants-stability: BLIND: ${why}. Not a pass.`); process.exit(2); };
let page, snap;
try { page = readFileSync(PAGE, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { blind(`the page is unreadable (${e.message})`); }
try { snap = JSON.parse(readFileSync(SNAP, 'utf8')); } catch (e) { blind(`contract/stability.json unreadable (${e.message})`); }
if (!snap.announced?.length) blind('the snapshot holds no announcement, and the page mutants plant on the first one\'s row');

// replace exactly one occurrence, or BLIND: a mutant whose anchor moved tests nothing
const swap = (text, from, to) => {
  const n = text.split(from).length - 1;
  if (n !== 1) blind(`a mutant's anchor is found ${n} times, not once: ${from.slice(0, 80)}`);
  return text.replace(from, () => to);
};
const first = snap.announced[0];
const ROW_OPEN = `| ${first.announced} | ${first.from} |`;
const rowOf = (text) => {
  const line = text.split('\n').find((l) => l.startsWith(ROW_OPEN));
  if (!line) blind(`the first announcement's row is not found by its opening: ${ROW_OPEN}`);
  return line;
};
const HEADING = '\n## Changes announced\n';
const onPage = (edit) => checkPage(edit(page), snap).fails;
const onSnap = (more, known) => checkPage(page, { ...snap, ...more }, known).fails;
const later = (date) => `${Number(date.slice(0, 4)) + 3}${date.slice(4)}`;

const PAGE_MUTANTS = [
  ['the policy reworded on the page', () => onPage((p) => swap(p, 'at least six months ahead. The', 'at least three months ahead. The')), 'word for word'],
  ['a second blockquote', () => onPage((p) => swap(p, HEADING, `\n> A second quotation.\n${HEADING}`)), 'blockquotes'],
  ['the row\'s second date moved', () => onPage((p) => swap(p, ROW_OPEN, `| ${first.announced} | ${later(first.from)} |`)), 'matches no announcement'],
  ['the row removed', () => onPage((p) => swap(p, `${rowOf(p)}\n`, '')), 'has no row for'],
  ...(first.parameter ? [['the row no longer names its parameter', () => onPage((p) => swap(p, rowOf(p), rowOf(p).split(`\`${first.parameter}\``).join('it'))), 'not named in a code span']] : []),
  ['a row the document does not announce', () => onPage((p) => swap(p, `${rowOf(p)}\n`, `${rowOf(p)}\n| ${later(first.announced)} | ${later(first.from)} | A route leaves. | Stop calling it. |\n`)), 'matches no announcement'],
  ['a row with no dates', () => onPage((p) => swap(p, `${rowOf(p)}\n`, `${rowOf(p)}\n| soon | later | A route leaves. | Stop calling it. |\n`)), 'does not open with two dates'],
  ['the section\'s heading renamed', () => onPage((p) => swap(p, HEADING, '\n## Announced\n')), 'no "## Changes announced" heading'],
];
const SNAP_MUTANTS = [
  ['the document announces a second change', () => onSnap({ announced: [...snap.announced, { where: 'GET /api/v2/world', announced: later(first.announced), from: later(first.from), sentence: 'Announced: a route leaves.' }] }), 'has no row for'],
  ['a dated sentence that is no announcement', () => onSnap({ dated: [...snap.dated, { where: 'GET /api/v2/world', sentence: `This route leaves on ${later(first.from)}.` }] }), `no announcement this check can read (${later(first.from)})`],
  ['KNOWN names a sentence that is gone', () => onSnap({}, [['A sentence the document dropped.', 'why']]), 'no longer holds'],
];
// the deprecated sentence stands or falls with the document's marks, so its mutants depend on which holds today
if (snap.deprecated.length === 0) {
  PAGE_MUTANTS.push(['the "nothing is marked deprecated" sentence removed', () => onPage((p) => swap(p, ` ${NOTHING}`, '')), 'no longer says']);
  SNAP_MUTANTS.push(['the document marks a parameter deprecated', () => onSnap({ deprecated: [{ where: 'GET /api/v2/world, parameter an_old_parameter', parameter: 'an_old_parameter' }] }), 'still says']);
  SNAP_MUTANTS.push(['a deprecated parameter the page does not name', () => onSnap({ deprecated: [{ where: 'GET /api/v2/world, parameter an_old_parameter', parameter: 'an_old_parameter' }] }), 'does not name `an_old_parameter`']);
} else {
  PAGE_MUTANTS.push(['the "nothing is marked deprecated" sentence put back', () => onPage((p) => swap(p, HEADING, `${HEADING}\n${NOTHING}\n`)), 'still says']);
  SNAP_MUTANTS.push(['the document marks one more parameter deprecated', () => onSnap({ deprecated: [...snap.deprecated, { where: 'GET /api/v2/world, parameter an_old_parameter', parameter: 'an_old_parameter' }] }), 'does not name `an_old_parameter`']);
}

// ---- the notice period, on the pages as committed ------------------------------------------------------------
const files = pageFiles();
const inFile = (rel, from, to) => {
  if (!files.some(([r]) => r === rel)) blind(`${rel} is not among the pages read`);
  return checkPeriod(files.map(([r, t]) => (r === rel ? [r, swap(t, from, to)] : [r, t])), snap).fails;
};
const PERIOD_MUTANTS = [
  ['the Classic API page states another period', () => inFile('docs/development/api/classic.md', 'six months ahead', 'nine months ahead'), 'classic.md says "nine months ahead"'],
  ['the stability page\'s own bullet states another period', () => inFile('docs/development/api/stability.md', 'six months\' notice', '12 months\' notice'), 'stability.md says "12 months\' notice"'],
  ['the policy states two periods', () => checkPeriod(files, { ...snap, policy: `${snap.policy} A route is removed twelve months ahead.` }).fails, 'states 2 notice periods'],
];

// ---- the reader, on a document of this file's own -----------------------------------------------------------
const POLICY = 'The path carries the version. A removal is announced six months ahead.';
const ANNOUNCE = 'Announced 2030-01-02: from 2030-07-02 the default becomes `true`.';
const base = () => ({
  info: { title: 'An API', description: `What it is.\n\n**Versions and deprecation.** The path carries the version.\nA removal is announced six months ahead.\n\n**From a browser**: any origin.` },
  paths: {
    '/api/v2/thing/{id}': {
      get: {
        summary: 'Read a thing',
        description: 'One thing, whole. The default is false until 2030-07-02, announced below.',
        parameters: [{ name: 'compact', in: 'query', schema: { type: 'boolean', default: false }, description: `Leaves empty parts out. ${ANNOUNCE} Anything else is a 422.` }],
        responses: { 200: { description: 'The thing.', content: { 'application/json': { example: { made: 'nothing dated here' } } } } },
      },
    },
  },
  components: { schemas: { Thing: { type: 'object', description: 'A thing.', properties: { name: { type: 'string', description: 'Its name.' } } } } },
});
const read = (edit) => { const d = base(); edit?.(d); return extract(d); };
const op = (d) => d.paths['/api/v2/thing/{id}'].get;
const c0 = read();
const READER = [
  ['control: the policy paragraph, spaces folded', () => c0.policy === POLICY],
  ['control: one announcement, on its route and parameter', () => c0.announced.length === 1 && c0.announced[0].where === 'GET /api/v2/thing/{id}, parameter compact' && c0.announced[0].parameter === 'compact' && c0.announced[0].announced === '2030-01-02' && c0.announced[0].from === '2030-07-02' && c0.announced[0].sentence === ANNOUNCE],
  ['control: two dated sentences, nothing deprecated', () => c0.dated.length === 2 && c0.deprecated.length === 0],
  ['a second announcement on a route is read', () => read((d) => { op(d).description += ' Announced 2031-01-01: from 2031-07-01 this route answers 410.'; }).announced.length === 2],
  ['an announcement in a schema is read, with its place', () => { const r = read((d) => { d.components.schemas.Thing.properties.name.description += ' Announced 2031-01-01: from 2031-07-01 this field leaves.'; }); return r.announced.length === 2 && r.announced[1].where === 'components/schemas/Thing'; }],
  ['a dated sentence that is no announcement is read as dated only', () => { const r = read((d) => { d.components.schemas.Thing.description += ' It leaves on 2031-07-01.'; }); return r.dated.length === 3 && r.announced.length === 1; }],
  ['a deprecated route is read', () => { const r = read((d) => { op(d).deprecated = true; }); return r.deprecated.length === 1 && r.deprecated[0].where === 'GET /api/v2/thing/{id}'; }],
  ['a deprecated parameter is read by name', () => { const r = read((d) => { op(d).parameters[0].deprecated = true; }); return r.deprecated.length === 1 && r.deprecated[0].parameter === 'compact'; }],
  ['a deprecated schema property is read', () => read((d) => { d.components.schemas.Thing.properties.name.deprecated = true; }).deprecated.length === 1],
  ['the policy reworded is read', () => read((d) => { d.info.description = d.info.description.replace('six months', 'three months'); }).policy === POLICY.replace('six months', 'three months')],
  ['the policy paragraph gone reads as none (BLIND in the check)', () => read((d) => { d.info.description = 'What it is.'; }).policy === null],
  ['unseen on purpose: a date inside an example', () => { const r = read((d) => { op(d).responses[200].content['application/json'].example.made = 'Announced 2031-01-01: from 2031-07-01 nothing.'; }); return r.dated.length === 2 && r.announced.length === 1; }],
];

let bad = 0;
const control = checkPage(page, snap).fails;
if (control.length) { bad++; console.log(`  control: FAILED to pass:\n    ${control.join('\n    ')}`); } else console.log('  control (the page and the snapshot unchanged): passes');
// this control holds a count, presence before sameness: the quotation, the page's bullet, the Classic API page
const period = checkPeriod(files, snap);
if (period.fails.length || period.held < 3) { bad++; console.log(`  control: the notice period FAILED to pass, or is stated in ${period.held} place(s), under the 3 known: ${period.fails.join(' | ')}`); } else console.log(`  control (the notice period, stated in ${period.held} places): passes`);
for (const [name, run, want] of [...PAGE_MUTANTS, ...SNAP_MUTANTS, ...PERIOD_MUTANTS]) {
  const fails = run();
  const hit = fails.some((f) => f.includes(want));
  if (!hit) bad++;
  console.log(`  ${hit ? 'red as named' : 'NOT CAUGHT'}: ${name}${hit ? '' : ` (wanted "${want}"; got ${fails.length ? fails.join(' | ') : 'a pass'})`}`);
}
for (const [name, ok] of READER) {
  const hit = ok();
  if (!hit) bad++;
  console.log(`  ${hit ? 'as named' : 'NOT AS NAMED'}: the reader: ${name}`);
}
const n = PAGE_MUTANTS.length + SNAP_MUTANTS.length + PERIOD_MUTANTS.length;
if (bad) { console.log(`mutants-stability: FAIL: ${bad} of ${n + READER.length + 2} did not behave`); process.exit(1); }
console.log(`mutants-stability: PASS: ${n} planted faults each failed verify-stability as named, the two controls passed, and its reader answered ${READER.length} of ${READER.length} documents as named`);
