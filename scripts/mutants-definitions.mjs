#!/usr/bin/env node
// mutants-definitions.mjs: verify-definitions watched failing. Each fault is planted in a copy of the
// schema pages, the check is run on the copy (--root), and it must end red with the line named here; the
// untouched copy must pass. A plant that changes nothing in its file stops the run.
//
// Usage: node scripts/mutants-definitions.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src', 'content', 'docs', 'docs', 'schema');
const REL = ['src', 'content', 'docs', 'docs', 'schema'];

const ROW = (type) => new RegExp(`^(\\| \\[[A-Za-z]+\\]\\(/docs/schema/element_categories/${type}\\) \\| )(.*)( \\|)$`, 'm');
const PLANTS = [
  { name: 'a table row reworded', file: 'index.mdx', exit: 1, says: 'DRIFT  character: the table says',
    edit: (t) => t.replace(ROW('character'), (_, a, b, c) => a + b.replace(/\.$/, ' of note.') + c) },
  { name: "a page's opening sentence reworded", file: 'element_categories/trait.md', exit: 1, says: 'DRIFT  trait: the table says',
    edit: (t) => t.replace(/^(Traits? [^\n]*?)\. /m, '$1 indeed. ') },
  { name: 'a row removed', file: 'index.mdx', exit: 1, says: 'DRIFT  zone: its page has no row',
    edit: (t) => t.replace(new RegExp(ROW('zone').source + '\\r?\\n', 'm'), '') },
  { name: 'a row for a type with no page', file: 'index.mdx', exit: 1, says: 'DRIFT  vehicle: a row in the Schema table with no type page',
    edit: (t) => t.replace(ROW('zone'), (line) => `${line}\n| [Vehicle](/docs/schema/element_categories/vehicle) | A Vehicle carries things. |`) },
  { name: "a Pin's row made its first sentence", file: 'index.mdx', exit: 1, says: 'DRIFT  pin: the table says "A Pin is a special Map element."',
    edit: (t) => t.replace(ROW('pin'), (_, a, b, c) => `${a}A Pin is a special Map element.${c}`) },
  { name: 'a type page gone', file: 'element_categories/law.md', exit: 2, says: 'CANNOT SEE: 21 type pages', edit: () => null },
];

const dir = mkdtempSync(join(tmpdir(), 'ow-defs-'));
const run = (root) => {
  const r = spawnSync(process.execPath, [join(HERE, 'verify-definitions.mjs'), '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
};
const fresh = (name) => {
  const root = join(dir, name);
  cpSync(SRC, join(root, ...REL), { recursive: true });
  return root;
};
let bad = 0;
try {
  const control = run(fresh('control'));
  if (control.code !== 0) { console.log(`  FAIL  the control (an untouched copy) ended ${control.code}`); bad++; }
  PLANTS.forEach((p, i) => {
    const root = fresh(`m${i}`);
    const file = join(root, ...REL, ...p.file.split('/'));
    const before = readFileSync(file, 'utf8');
    const after = p.edit(before);
    if (after === null) rmSync(file);
    else if (after === before) { console.log(`  FAIL  ${p.name}: the plant changed nothing in ${p.file}`); bad++; return; }
    else writeFileSync(file, after);
    const r = run(root);
    const ok = r.code === p.exit && r.out.includes(p.says);
    if (!ok) bad++;
    console.log(`  ${ok ? 'red as named' : 'FAIL'}: ${p.name}${ok ? '' : ` (exit ${r.code}, wanted ${p.exit} with "${p.says}")`}`);
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
if (bad) { console.log(`mutants-definitions: FAIL: ${bad} of ${PLANTS.length + 1} runs did not end as named`); process.exit(1); }
console.log(`mutants-definitions: PASS: ${PLANTS.length} planted faults each failed verify-definitions as named; the control passed`);
