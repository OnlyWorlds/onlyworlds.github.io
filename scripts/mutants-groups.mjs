#!/usr/bin/env node
// mutants-groups.mjs: verify-groups watched failing, with no network. A document is made from the type pages
// themselves (each type's group described by its page's first sentence, every second type by its whole
// opening paragraph, beside two groups that are no type), so the untouched copy must pass. Each fault is
// then planted in a copy of the pages or of that document, the check is run on the copy (--root,
// --document), and it must end as named here. A plant that changes nothing stops the run.
//
// Usage: node scripts/mutants-groups.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTypePages, sentences, typePagesDir } from './type-pages.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const pages = readTypePages(SITE);
if (pages === null || pages.size !== 22) { console.log(`mutants-groups: BLIND: ${pages === null ? 'no' : pages.size} type pages read (22 expected)`); process.exit(2); }

const title = (type) => type[0].toUpperCase() + type.slice(1);
const made = () => ({
  tags: [
    { name: 'World', description: 'The world your key names.' },
    ...[...pages].map(([type, paragraph], i) => ({ name: title(type), description: i % 2 ? paragraph : sentences(paragraph)[0] })),
    { name: 'Files', description: 'Not called by clients.' },
  ],
});
const group = (doc, type) => doc.tags.find((t) => t.name === title(type));
// A type whose page opens with two sentences or more, described by the first alone (an even place in the list).
const two = [...pages].find(([, p], i) => i % 2 === 0 && sentences(p).length >= 2)?.[0];
const three = [...pages].find(([, p]) => sentences(p).length >= 3)?.[0];
if (!two || !three) { console.log('mutants-groups: BLIND: no type page at an even place opens with two sentences, or none with three'); process.exit(2); }

// `doc`: change the made document in place; `page`: [type, edit of the page's text, or null to remove it];
// `raw`: the document file's text as written.
const PLANTS = [
  { name: 'a description reworded', exit: 1, says: 'DRIFT  character: the document says',
    doc: (d) => { group(d, 'character').description += ' Usually.'; } },
  { name: "a page's opening reworded", exit: 1, says: 'DRIFT  trait: the document says',
    page: ['trait', (t) => t.replace(/^(Traits? [^\n]*?)\. /m, '$1 indeed. ')] },
  { name: 'a description cut inside a sentence', exit: 1, says: `DRIFT  ${two}: the document says`,
    doc: (d) => { const g = group(d, two); g.description = g.description.slice(0, -9); } },
  { name: "a description that is the page's second sentence alone", exit: 1, says: `DRIFT  ${two}: the document says`,
    doc: (d) => { group(d, two).description = sentences(pages.get(two))[1]; } },
  { name: 'a description that skips a sentence', exit: 1, says: `DRIFT  ${three}: the document says`,
    doc: (d) => { const s = sentences(pages.get(three)); group(d, three).description = `${s[0]} ${s[2]}`; } },
  { name: 'a type with no group', exit: 1, says: 'DRIFT  zone: the document has no group named as the type',
    doc: (d) => { d.tags = d.tags.filter((t) => t.name !== 'Zone'); } },
  { name: 'a group with no description', exit: 1, says: "DRIFT  law: the document's group has no description",
    doc: (d) => { delete group(d, 'law').description; } },
  { name: 'a type page gone', exit: 2, says: 'BLIND: 21 type pages', page: ['law', null] },
  { name: 'a document with no groups', exit: 2, says: 'BLIND: the document names no groups', doc: (d) => { d.tags = []; } },
  { name: 'a document cut short', exit: 2, says: 'could not be read as JSON', raw: (t) => t.slice(0, t.length / 2) },
];

const dir = mkdtempSync(join(tmpdir(), 'ow-groups-'));
const run = (root, file) => {
  const r = spawnSync(process.execPath, [join(HERE, 'verify-groups.mjs'), '--root', root, '--document', file], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
};
const fresh = (name) => {
  const root = join(dir, name);
  cpSync(typePagesDir(SITE), typePagesDir(root), { recursive: true });
  const file = join(root, 'document.json');
  writeFileSync(file, JSON.stringify(made(), null, 2));
  return [root, file];
};
let bad = 0;
try {
  const control = run(...fresh('control'));
  if (control.code !== 0 || !control.out.includes('PASS: the API document describes each of the 22')) { console.log(`  FAIL  the control (the made document on untouched pages) ended ${control.code}: ${control.out.trim().split('\n').pop()}`); bad++; }
  PLANTS.forEach((p, i) => {
    const [root, file] = fresh(`m${i}`);
    const target = p.page ? join(typePagesDir(root), `${p.page[0]}.md`) : file;
    const before = readFileSync(target, 'utf8');
    let after;
    if (p.page) after = p.page[1] === null ? null : p.page[1](before);
    else if (p.raw) after = p.raw(before);
    else { const d = JSON.parse(before); p.doc(d); after = JSON.stringify(d, null, 2); }
    if (after === null) rmSync(target);
    else if (after === before) { console.log(`  FAIL  ${p.name}: the plant changed nothing`); bad++; return; }
    else writeFileSync(target, after);
    const r = run(root, file);
    const ok = r.code === p.exit && r.out.includes(p.says);
    if (!ok) bad++;
    console.log(`  ${ok ? 'red as named' : 'FAIL'}: ${p.name}${ok ? '' : ` (exit ${r.code}, wanted ${p.exit} with "${p.says}": ${r.out.trim().split('\n').pop().slice(0, 160)})`}`);
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
if (bad) { console.log(`mutants-groups: FAIL: ${bad} of ${PLANTS.length + 1} runs did not end as named`); process.exit(1); }
console.log(`mutants-groups: PASS: ${PLANTS.length} planted faults each failed verify-groups as named; the control passed`);
