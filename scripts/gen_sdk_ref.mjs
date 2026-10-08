#!/usr/bin/env node
/**
 * gen_sdk_ref.mjs: write the TypeScript page's reference tables from the published SDK's types.
 *
 * Usage: node scripts/gen_sdk_ref.mjs [--check]
 *
 * Reads node_modules/@onlyworlds/sdk/dist/index.d.ts (the version pinned in package.json) with the
 * TypeScript compiler, and writes two tables below the marker line in
 * src/content/docs/docs/development/typescript.md: the client's options (OwClientConfig) and its
 * public methods (OwV2Client). Each row takes the member's own signature and the first sentence of
 * its doc comment; for a method that comment opens with its route ("GET /world -- ..."), which
 * becomes its own column. Prose above the marker is hand-written and never touched.
 *
 * --check writes nothing and exits 1 if the page would change. Bumping the pinned SDK version and
 * rebuilding is how the reference follows a release.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = join(ROOT, 'node_modules', '@onlyworlds', 'sdk');
const PAGE = join(ROOT, 'src', 'content', 'docs', 'docs', 'development', 'typescript.md');
const MARKER = '<!-- generated:sdk-reference (scripts/gen_sdk_ref.mjs rewrites everything below this line) -->';

const version = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).version;
const dts = readFileSync(join(PKG, 'dist', 'index.d.ts'), 'utf8');
const sf = ts.createSourceFile('index.d.ts', dts, ts.ScriptTarget.Latest, true);

const find = (kind, name) => {
  let hit;
  sf.forEachChild((n) => { if (n.kind === kind && n.name?.text === name) hit = n; });
  if (!hit) { console.error(`gen_sdk_ref: no ${name} in @onlyworlds/sdk ${version}`); process.exit(2); }
  return hit;
};
const docOf = (node) => {
  const jd = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
  const c = jd?.comment;
  return (typeof c === 'string' ? c : Array.isArray(c) ? c.map((p) => p.text).join('') : '').replace(/\s+/g, ' ').trim();
};
// First sentence, skipping a bare lead word like "Optional." (the field's ? already says it).
const firstSentence = (s) => {
  const parts = s.split(/(?<=\.)\s+/).filter(Boolean);
  while (parts.length > 1 && parts[0].split(' ').length < 3) parts.shift();
  return parts[0] ?? '';
};
const esc = (s) => s.replace(/\|/g, '\\|');
const code = (s) => '`' + s.replace(/\s+/g, ' ').replace(/`/g, "'") + '`';

// ---- OwClientConfig ----------------------------------------------------------------------------
const cfg = find(ts.SyntaxKind.InterfaceDeclaration, 'OwClientConfig');
const cfgRows = cfg.members.filter(ts.isPropertySignature).map((m) => {
  const name = m.name.getText(sf) + (m.questionToken ? '' : ' (required)');
  return `| ${code(m.name.getText(sf))}${m.questionToken ? '' : ' (required)'} | ${code(m.type?.getText(sf) ?? '')} | ${esc(firstSentence(docOf(m)))} |`;
});

// ---- OwV2Client --------------------------------------------------------------------------------
const cls = find(ts.SyntaxKind.ClassDeclaration, 'OwV2Client');
const isPublic = (m) => !(ts.getCombinedModifierFlags(m) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected));
const methodRows = cls.members.filter((m) => ts.isMethodDeclaration(m) && isPublic(m)).map((m) => {
  const name = m.name.getText(sf);
  const params = m.parameters.map((p) => p.name.getText(sf) + (p.questionToken ? '?' : '')).join(', ');
  const ret = m.type?.getText(sf) ?? '';
  const doc = docOf(m);
  const route = doc.match(/^((?:GET|POST|PUT|PATCH|DELETE)\s+\S+(?:\s+with\s+\{[^}]*\})?)\s+--\s+(.*)$/);
  const what = route ? route[2] : doc;
  return `| ${code(`${name}(${params})`)} | ${route ? code(route[1]) : ''} | ${esc(firstSentence(what))} | ${code(ret)} |`;
});

const body = [
  MARKER,
  '',
  '## Reference',
  '',
  `Generated from the types of \`@onlyworlds/sdk\` ${version}, the version these docs pin. The full declarations ship in the package (\`dist/index.d.ts\`), with \`SCHEMA.md\` and \`AGENTS.md\` beside them.`,
  '',
  '### Client options',
  '',
  '`new OwV2Client(config)` takes:',
  '',
  '| Option | Type | Notes |',
  '|---|---|---|',
  ...cfgRows,
  '',
  '### Methods',
  '',
  '| Method | Route | What it does | Returns |',
  '|---|---|---|---|',
  ...methodRows,
  '',
].join('\n');

const page = readFileSync(PAGE, 'utf8');
if (!page.includes(MARKER)) { console.error(`gen_sdk_ref: ${PAGE} has no marker line`); process.exit(2); }
const next = page.split(MARKER)[0] + body;
const changed = next !== page;
if (process.argv.includes('--check')) {
  console.log(`gen_sdk_ref: @onlyworlds/sdk ${version}; ${changed ? 'STALE' : 'current'}`);
  process.exit(changed ? 1 : 0);
}
if (changed) writeFileSync(PAGE, next);
console.log(`gen_sdk_ref: @onlyworlds/sdk ${version}; ${cfgRows.length} options, ${methodRows.length} methods${changed ? ' (page rewritten)' : ''}`);
