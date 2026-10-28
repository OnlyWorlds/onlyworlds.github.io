// The world folder figure's data and words: Hyperion, the public example world in schema-dist
// (example/hyperion), as the snapshot contract/folder-example.json holds it. scripts/gen_elements.py
// writes that snapshot in the same run, from the same verified checkout, as the element pages'
// field tables, so the figure and the tables are always one serial. Pure: the caller passes the
// snapshot in, so the page (FolderExample.astro) and its Markdown twin (scripts/postbuild.mjs) read
// the same thing. scripts/verify-figures.mjs holds the built figure to the snapshot (and to the
// checkout itself when one is given) with a second implementation of the naming rule, whose two
// numbers it reads from the page's own paragraph, not from here.
//
// Every file name the figure prints is derived here, by the rule, from its element's name and id.
// The build fails if any of the example's real files is not the name the rule gives, if a folder
// is not one of the standard's kinds, or if the folder holds a file the figure has no words for.

// The rule, as the folders page's paragraph states it and Atlas, the folder format's reference
// implementation, writes it (its slugify): the name with its accents removed (NFKD, then the
// combining marks U+0300 to U+036F dropped), lowercased, each run of anything but a-z and 0-9 one
// hyphen, no hyphen at either end, cut to 40 characters, any hyphen left at the end removed; then
// `--`; then the id's last 8 characters. No usable name gives `<id>.json`.
export const SLUG_CUT = 40;
export const TAIL = 8;
export const SEP = '--';
const MARKS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g');
export const slug = (name) =>
  (typeof name === 'string'
    ? name.normalize('NFKD').replace(MARKS, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, SLUG_CUT).replace(/-+$/, '')
    : '');
export function fileParts(name, id) {
  const s = slug(name);
  if (!s) return { slug: '', tail: '', file: `${id}.json` };
  const tail = id.slice(-TAIL);
  return { slug: s, tail, file: `${s}${SEP}${tail}.json` };
}

// Three of the example's elements, by id: a full stop and a space become one hyphen (Mr. Steinway),
// a curly apostrophe, which is not ASCII, becomes one too (The Consul's Steinway), and a name of
// four words. Their names and files come from the snapshot.
export const SHOWN = [
  '068e92dc-10ec-7225-8000-7efd678bd862',
  '068e2e56-d4b9-7c40-8000-173975bfd994',
  '068e92dd-ce97-79b4-8000-90a11218fc88',
];

// What each file at the folder's top is, in the words of the page's own Layout block. A file the
// example adds that is not named here fails the build until it has words.
export const ROOT_WORDS = { 'world.json': 'the world' };

const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const NUMBER = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function folderExample(snap) {
  const fail = (why) => { throw new Error(`folders figure: ${why}`); };
  if (!Array.isArray(snap.kinds) || !snap.kinds.length) fail('the snapshot carries no list of the standard\'s kinds');
  if (!snap.elements?.length) fail('the snapshot holds no elements');
  for (const r of snap.root) if (!(r in ROOT_WORDS)) fail(`${snap.folder}/${r} is in the example, and the figure has no words for it (ROOT_WORDS)`);
  const wrong = [];
  const byKind = new Map();
  for (const e of snap.elements) {
    if (!snap.kinds.includes(e.kind)) fail(`elements/${e.kind}/ is not one of the standard's ${snap.kinds.length} kinds`);
    const p = fileParts(e.name, e.id);
    if (p.file !== e.file) wrong.push(`elements/${e.kind}/${e.file} (the rule gives ${p.file})`);
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind).push({ ...e, ...p });
  }
  if (wrong.length) fail(`${wrong.length} of the example's ${snap.elements.length} files are not named by the rule: ${wrong.join('; ')}`);
  const folders = [...byKind.keys()].sort(byCodePoint).map((kind) => ({
    kind,
    files: byKind.get(kind).sort((a, b) => byCodePoint(a.file, b.file)),
  }));
  const all = folders.flatMap((f) => f.files);
  const shown = SHOWN.map((id) => all.find((e) => e.id === id) ?? fail(`the derivation ${id} is not an element of the example`));
  return {
    folder: snap.folder,
    world: snap.world,
    serial: snap.serial,
    root: [...snap.root].sort(byCodePoint),
    folders,
    total: all.length,
    kinds: snap.kinds.length,
    expand: shown[0].kind,
    shown: shown.map((e) => ({ ...e, idHead: e.id.slice(0, e.id.length - e.tail.length) })),
  };
}

// The figure's sentences, shared by the page and the twin; code() wraps a file or folder name.
export function folderWords(data, code = (s) => `\`${s}\``) {
  return {
    head: 'One file per element.',
    lead: `A world folder is plain JSON: ${code('world.json')} and one file for each element, in a folder for its category.`,
    tree: `The example world, ${data.world.name}`,
    how: 'How a file gets its name',
    rule: `The name with its accents removed, in lowercase ASCII, each run of other characters one hyphen and no hyphen at either end, cut to ${SLUG_CUT} characters with any hyphen left at the end removed; then ${code(SEP)}; then the id's last ${TAIL} characters. The id inside the file is the identity: rename a file and nothing breaks.`,
    caption: `Generated from ${data.world.name}, the public example world in schema-dist (serial ${data.serial}, ${code(`example/${data.folder}`)}), when the docs are built: ${data.total} element files in ${data.folders.length} of the ${data.kinds} category folders, every file named by the rule from its element's name and id. A category with no elements has no folder.`,
    files: (n) => `${n} file${n === 1 ? '' : 's'}`,
    labels: ['name', 'id', 'file'],
    count: NUMBER[data.shown.length] ?? String(data.shown.length),
  };
}

// The tree as lines of text: [depth, text, note]. The page draws the same lines.
export function folderLines(data, w = folderWords(data)) {
  const lines = [[0, `${data.folder}/`, '']];
  for (const r of data.root) lines.push([1, r, ROOT_WORDS[r]]);
  lines.push([1, 'elements/', '']);
  for (const f of data.folders) {
    lines.push([2, `${f.kind}/`, w.files(f.files.length)]);
    if (f.kind === data.expand) for (const e of f.files) lines.push([3, e.file, '']);
  }
  return lines;
}

export function folderExampleMarkdown(snap) {
  const data = folderExample(snap);
  const w = folderWords(data);
  const lines = folderLines(data, w);
  const width = Math.max(...lines.map(([d, t]) => 2 * d + t.length)) + 3;
  return [
    `**${w.head}** ${w.lead}`,
    '',
    `${w.tree}:`,
    '',
    '```text',
    ...lines.map(([d, t, n]) => (n ? `${' '.repeat(2 * d)}${t}`.padEnd(width) + n : `${' '.repeat(2 * d)}${t}`)),
    '```',
    '',
    `${w.how}, ${w.count} of its elements:`,
    '',
    ...data.shown.map((e) => `- **${e.name}**, id \`${e.id}\`: \`${e.file}\``),
    '',
    w.rule,
    '',
    `*${w.caption}*`,
  ].join('\n');
}
