#!/usr/bin/env node
/**
 * verify-identifiers.mjs: every TypeScript name the pages give in backticks is one the pinned SDK declares.
 *
 * Usage: node scripts/verify-identifiers.mjs   (offline; in `npm run verify`)
 *
 * Source: the installed @onlyworlds/sdk (package.json's exact pin), its dist/index.d.ts: every name it
 * declares (an interface, type, class, function, const or enum, an export's public name) and every member
 * (a property, a method, a getter). A backticked token on a page counts as a TypeScript name when it is
 * shaped like one: camelCase (`listAll`, `isNotFound`, `ifMatch`) or an Ow type (`OwApiError`), with a
 * trailing call `()` and a leading `client.`, `err.` or `sdk.` taken off; on the TypeScript page also an
 * ALL_CAPS constant (`ELEMENT_GROUPS`), there being the SDK's page. The generated reference below the
 * TypeScript page's marker is the SDK's own text and is not read.
 *
 * Fails: a TypeScript-shaped name the SDK does not declare, unless OTHERS names it with whose it is.
 * Not checked: that a member belongs to the type the sentence says (a member is found on any type), the
 * Python, Unity and C# names (snake_case and PascalCase), and names outside backticks.
 *
 * Exit: 0 PASS, 1 FAIL, 2 BLIND (the SDK not installed, or the pages yield no name: never a pass).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src', 'content', 'docs');
const DTS = join(ROOT, 'node_modules', '@onlyworlds', 'sdk', 'dist', 'index.d.ts');
const MARKER = '<!-- generated:sdk-reference';
const TS_PAGE = 'docs/development/typescript.md';
// Names shaped like the SDK's that are someone else's, each with whose. A new one is added here with its reason.
const OTHERS = {
  sessionStorage: "the browser's storage (the sign-in page keeps the verifier there)",
  readOnlyHint: "the MCP specification's tool annotation", destructiveHint: "the MCP specification's tool annotation",
  idempotentHint: "the MCP specification's tool annotation",
};
// ALL_CAPS on the TypeScript page that are no SDK constant: environment variable names an example reads.
const ENV = /^OW_[A-Z_]+$/;
const blind = (why) => { console.log(`verify-identifiers: BLIND: ${why}`); process.exit(2); };

if (!existsSync(DTS)) blind('@onlyworlds/sdk is not installed (node_modules/@onlyworlds/sdk/dist/index.d.ts): npm install');
const dts = readFileSync(DTS, 'utf8');
const version = JSON.parse(readFileSync(join(ROOT, 'node_modules', '@onlyworlds', 'sdk', 'package.json'), 'utf8')).version;
const declared = new Set([...dts.matchAll(/\b(?:interface|type|class|function|const|enum|let|var)\s+([A-Za-z_]\w*)/g)].map((m) => m[1]));
for (const m of dts.matchAll(/export\s*\{([^}]*)\}/g)) {
  for (const n of m[1].split(',')) { const name = n.trim().split(/\s+as\s+/).at(-1).replace(/^type\s+/, ''); if (name) declared.add(name); }
}
for (const m of dts.matchAll(/^\s+(?:(?:readonly|static|get|set|private|protected|public|abstract)\s+)*([A-Za-z_]\w*)\??\s*[:(<]/gm)) declared.add(m[1]);
if (declared.size < 100) blind(`index.d.ts of @onlyworlds/sdk ${version} yields only ${declared.size} names: the declaration reader no longer reads it`);

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(DOCS).filter((f) => /\.mdx?$/.test(f) && !/[\\/]changelog\.md$/.test(f)); // the changelog is a dated record
const fails = [];
let names = 0;
const others = new Set();
for (const f of pages) {
  const path = relative(DOCS, f).replace(/\\/g, '/');
  let text = readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  if (path === TS_PAGE) {
    const at = text.indexOf(MARKER);
    if (at < 0) blind(`${TS_PAGE} has no "${MARKER}" marker: the generated reference cannot be told from the page`);
    text = text.slice(0, at);
  }
  const shape = path === TS_PAGE ? /^(?:[a-z]+[A-Z][A-Za-z0-9]*|Ow[A-Z][A-Za-z0-9]*|[A-Z][A-Z0-9]*_[A-Z0-9_]+)$/ : /^(?:[a-z]+[A-Z][A-Za-z0-9]*|Ow[A-Z][A-Za-z0-9]*)$/;
  const seen = new Set();
  for (const m of text.matchAll(/`([^`\s]+)`/g)) {
    const name = m[1].replace(/\(.*\)$/, '').replace(/^(?:client|err|sdk)\./, '');
    if (!shape.test(name) || seen.has(name)) continue;
    seen.add(name);
    if (path === TS_PAGE && ENV.test(name)) continue;
    names++;
    if (declared.has(name)) continue;
    if (OTHERS[name]) { others.add(name); continue; }
    fails.push(`${path}:${text.slice(0, m.index).split('\n').length}: \`${name}\` is not declared by @onlyworlds/sdk ${version}; if it is someone else's, name whose in OTHERS`);
  }
}
if (!names) blind('the pages give no TypeScript-shaped name in backticks: the pattern or the pages moved');
for (const n of Object.keys(OTHERS)) if (!others.has(n)) fails.push(`OTHERS names \`${n}\`, which no page gives any more: take it out`);
for (const f of fails) console.log(`  FAIL   ${f}`);
const summary = `${names} names on ${pages.length} pages against @onlyworlds/sdk ${version}'s index.d.ts (${declared.size} declared names and members), ${others.size} named as someone else's`;
if (fails.length) { console.log(`verify-identifiers: FAIL — ${fails.length} problem(s); ${summary}`); process.exit(1); }
console.log(`verify-identifiers: PASS — ${summary}. Not checked: which type a member is on; the Python, Unity and C# names.`);
