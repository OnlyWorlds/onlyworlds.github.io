/**
 * verify-examples.mjs: every TypeScript example on the pages compiles against the pinned SDK.
 *
 * Usage: node scripts/verify-examples.mjs   (offline; in `npm run verify`)
 *
 * Source: each ```typescript (or ```ts) block under src/content, its own module, type-checked (strict,
 * nodenext) with the repo's TypeScript against the installed @onlyworlds/sdk (package.json's exact pin):
 * its package.json and dist/*.d.ts copied into a scratch node_modules, so the check reads what a reader
 * installs. A block often uses what an earlier block made (`client`) or a value the reader brings (`id`).
 * The first pass compiles each block alone and reads which names it uses without defining them; the second
 * gives it exactly those: a name the SDK exports is imported from it (so the export must exist), any other
 * is declared with its type from CONTEXT. A name in neither fails by name, with its page and line.
 *
 * Fails: a block that does not compile (a method, an export, an option key, an answer's shape the SDK does
 * not have), or a name no table types. Not checked: the blocks are never run, so what they print and what
 * the server answers are not read; a write's element body is `Record<string, unknown>` in the SDK, so a
 * wrong field inside one compiles; JavaScript, Python and shell blocks.
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (the SDK or TypeScript not installed, or no block found: never a pass).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SDK_DIR = join(ROOT, 'node_modules', '@onlyworlds', 'sdk');
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const PAGES = join(ROOT, 'src', 'content');

// What the pages' prose says a name is when a block uses it without making it.
const SDK = "import('@onlyworlds/sdk')";
const CONTEXT = {
  client: `${SDK}.OwV2Client`,
  writer: `${SDK}.OwV2Client`,
  reader: `${SDK}.OwV2Client`,
  account: `${SDK}.OwV2Client`,
  owner: `${SDK}.OwV2Client`,
  member: `${SDK}.OwV2Client`,
  phone: `${SDK}.OwV2Client`, // a player's device, holding no key
  id: 'string',
  aliceId: 'string',
  borinId: 'string',
  chosenId: 'string',
  link: 'string',
  // the trail example's route map and places, by id
  routeMap: 'string',
  stLouis: 'string',
  river: 'string',
  orleans: 'string',
  boat: 'string',
  signal: 'AbortSignal',
  ranger: `${SDK}.OwElement`,
  character: `${SDK}.OwElement`,
  report: `${SDK}.OwElement & { consequences?: string }`, // an Event, its consequences text
  items: '{ created_at: string }[]',
  world: `${SDK}.OwStrandWorld`,
  // layoutOf's three inputs, as served
  map: 'unknown',
  maps: 'unknown[]',
  pins: 'unknown[]',
  index: `${SDK}.OwWorldIndex<${SDK}.OwElement>`,
  hits: `${SDK}.OwLookupHit<${SDK}.OwElement>[]`,
  worldId: 'string',
  characterId: 'string',
  code: 'string',
  email: 'string',
  password: 'string',
  question: 'string',
  file: 'Blob',
  bytes: 'Uint8Array',
  el: `${SDK}.OwElement`,
  element: `${SDK}.OwElement`,
  elements: `${SDK}.OwElement[]`,
  members: `${SDK}.OwMember[]`,
};

function blind(why) { console.log(`BLIND: ${why}`); process.exit(2); }

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (/\.mdx?$/.test(name)) out.push(p);
  }
  return out.sort();
}

function blocks() {
  const found = [];
  for (const page of pages(PAGES)) {
    const lines = readFileSync(page, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const open = /^(\s*)```(typescript|ts)\s*$/.exec(lines[i]);
      if (!open) continue;
      const indent = open[1].length;
      let j = i + 1;
      while (j < lines.length && !/^\s*```\s*$/.test(lines[j])) j++;
      if (j >= lines.length) { found.push({ page, line: i + 1, unclosed: true }); break; }
      const body = lines.slice(i + 1, j).map((l) => l.slice(Math.min(indent, l.length - l.trimStart().length))).join('\n');
      found.push({ page, line: i + 2, body });
      i = j;
    }
  }
  return found;
}

function compile(dir, files) {
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: 'nodenext', moduleResolution: 'nodenext', target: 'es2022', lib: ['es2022', 'dom'],
      // Node's own types (the examples run in Node: `process.env`, `node:fs/promises`), the repo's copy
      strict: true, noEmit: true, typeRoots: [join(ROOT, 'node_modules', '@types')], types: ['node'],
    },
    files: Object.keys(files),
  }));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  const r = spawnSync(process.execPath, [TSC, '-p', dir], { encoding: 'utf8' });
  if (r.status === null) blind(`tsc did not finish: ${r.error ?? r.signal}`);
  const errors = [];
  const other = [];
  for (const line of (r.stdout + r.stderr).split(/\r?\n/)) {
    const m = /(b\d+)\.mts\((\d+),\d+\): error (TS\d+): (.*)$/.exec(line);
    if (m) errors.push({ file: m[1], line: Number(m[2]), code: m[3], text: m[4] });
    else if (/error TS\d+/.test(line)) other.push(line);
  }
  return { status: r.status, errors, other };
}

if (!existsSync(join(SDK_DIR, 'dist', 'index.d.ts'))) blind('@onlyworlds/sdk is not installed (npm ci)');
if (!existsSync(TSC)) blind('typescript is not installed (npm ci)');
const sdkPkg = JSON.parse(readFileSync(join(SDK_DIR, 'package.json'), 'utf8'));
const exported = new Set(Object.keys(await import(pathToFileURL(join(SDK_DIR, 'dist', 'index.js')).href)));
const list = blocks();
const unclosed = list.filter((b) => b.unclosed);
if (unclosed.length) {
  for (const b of unclosed) console.log(`FAIL ${relative(ROOT, b.page).replace(/\\/g, '/')}:${b.line}: a typescript block that never closes`);
  process.exit(1);
}
if (list.length === 0) blind('no typescript block found under src/content');

const dir = mkdtempSync(join(tmpdir(), 'ow-docs-examples-'));
let failed = 0;
try {
  const home = join(dir, 'node_modules', '@onlyworlds', 'sdk');
  mkdirSync(join(home, 'dist'), { recursive: true });
  writeFileSync(join(home, 'package.json'), JSON.stringify(sdkPkg));
  for (const f of readdirSync(join(SDK_DIR, 'dist'))) {
    if (f.endsWith('.d.ts') || f.endsWith('.css')) cpSync(join(SDK_DIR, 'dist', f), join(home, 'dist', f));
  }
  const key = (n) => `b${String(n).padStart(3, '0')}`;
  const where = (n, line) => `${relative(ROOT, list[n].page).replace(/\\/g, '/')}:${list[n].line + line - 1}`;

  // Pass 1: each block alone; read the names it uses without making them.
  const bare = {};
  list.forEach((b, n) => { bare[`${key(n)}.mts`] = `${b.body}\nexport {};\n`; });
  const first = compile(dir, bare);
  const free = new Map();
  for (const e of first.errors) {
    const m = /^(?:Cannot find name|No value exists in scope for the shorthand property) '([^']+)'/.exec(e.text);
    if (!m) continue;
    if (!free.has(e.file)) free.set(e.file, new Set());
    free.get(e.file).add(m[1]);
  }

  // Pass 2: the same blocks, each with exactly its free names imported or declared after its body.
  const full = {};
  list.forEach((b, n) => {
    const names = [...(free.get(key(n)) ?? [])].sort();
    const fromSdk = names.filter((x) => exported.has(x));
    const declared = names.filter((x) => !exported.has(x));
    for (const x of declared) {
      if (!(x in CONTEXT)) { console.log(`FAIL ${where(n, 1)}: \`${x}\` is used, and no earlier line of the block makes it, the SDK does not export it and CONTEXT does not type it`); failed++; }
    }
    const head = fromSdk.length ? `import { ${fromSdk.join(', ')} } from '@onlyworlds/sdk';\n` : '';
    const tail = declared.filter((x) => x in CONTEXT).map((x) => `declare const ${x}: ${CONTEXT[x]};`).join('\n');
    full[`${key(n)}.mts`] = `${b.body}\n${head}${tail}\nexport {};\n`;
  });
  const second = compile(dir, full);
  for (const e of second.errors) {
    const n = Number(e.file.slice(1));
    console.log(`FAIL ${where(n, e.line)}: ${e.code} ${e.text}`);
    failed++;
  }
  for (const line of second.other) { console.log(`FAIL (outside a block) ${line}`); failed++; }
  if (second.status !== 0 && failed === 0) { console.log('FAIL: tsc failed and no error line was read'); failed++; }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const pageCount = new Set(list.map((b) => b.page)).size;
if (failed) {
  console.log(`FAIL: ${failed} finding(s) in ${list.length} TypeScript block(s) on ${pageCount} page(s), against @onlyworlds/sdk ${sdkPkg.version}.`);
  process.exit(1);
}
console.log(`PASS: ${list.length} TypeScript block(s) on ${pageCount} page(s) compile against @onlyworlds/sdk ${sdkPkg.version}. Not checked: the blocks are never run; a write's element body is untyped; JavaScript, Python and shell blocks.`);
