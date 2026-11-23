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
 * becomes its own column. A third table lists every name the package's declaration files mark
 * @deprecated (the root's and each subpath's, by the package's export map), each with its mark's
 * own comment. Prose above the marker is hand-written and never touched.
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
// An overloaded method is one row: the first signature's parameters and doc comment, and every
// signature's return type (draught's compact overload, SDK 4.69.0, came out as a bare second row).
const methods = [];
for (const m of cls.members.filter((m) => ts.isMethodDeclaration(m) && isPublic(m))) {
  const name = m.name.getText(sf);
  const ret = m.type?.getText(sf) ?? '';
  const last = methods[methods.length - 1];
  if (last && last.name === name) { if (!last.rets.includes(ret)) last.rets.push(ret); continue; }
  methods.push({ name, m, rets: [ret] });
}
// A method's @deprecated tag ends its row, so the table never reads a retiring name as current
// (ask and sort, SDK 4.139.0). The tag's own words: "Since X. Use `Y`...", else its first sentence.
const textOf = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((p) => p.text).join('') : '').replace(/\s+/g, ' ').trim();
const deprecatedOf = (node) => {
  const tag = ts.getJSDocDeprecatedTag(node);
  if (!tag) return '';
  const t = textOf(tag.comment);
  const m = t.match(/^Since (\S+?)\.\s+Use (`[^`]+`)/);
  return m ? ` **Deprecated** since ${m[1]}: use ${m[2]}.` : ` **Deprecated**${t ? `: ${firstSentence(t)}` : '.'}`;
};
const methodRows = methods.map(({ name, m, rets }) => {
  const params = m.parameters.map((p) => p.name.getText(sf) + (p.questionToken ? '?' : '')).join(', ');
  const doc = docOf(m);
  const route = doc.match(/^((?:GET|POST|PUT|PATCH|DELETE)\s+\S+(?:\s+with\s+\{[^}]*\})?)\s+--\s+(.*)$/);
  const what = route ? route[2] : doc;
  return `| ${code(`${name}(${params})`)} | ${route ? code(route[1]) : ''} | ${esc(firstSentence(what) + deprecatedOf(m))} | ${rets.map(code).join(' or ')} |`;
});

// ---- Deprecated names --------------------------------------------------------------------------
// Every declaration the package marks @deprecated, in each declaration file its export map names
// (the root and every subpath): a type, a constant, a function, a method, a field. The row is the
// tag's own words. A tag this walk cannot put on a named declaration stops the script (exit 2):
// the count of tags it attributes must be the count of @deprecated in the file's text.
const exportsMap = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).exports ?? {};
const typeFiles = Object.entries(exportsMap)
  .map(([sub, v]) => [sub, typeof v === 'object' && v ? (v.types ?? v.import?.types) : undefined])
  .filter(([, t]) => typeof t === 'string' && t.endsWith('.d.ts'));
if (!typeFiles.some(([sub]) => sub === '.')) { console.error(`gen_sdk_ref: @onlyworlds/sdk ${version} names no types for its root export`); process.exit(2); }
const sentences = (s) => s.split(/(?<=\.)\s+/).filter(Boolean);
const LEAVES = /\b(?:leaves?|removed|removal|until)\b[^.]*?(\d+\.\d+(?:\.\d+)?)/i;
const deprecatedRows = [];
for (const [sub, rel] of typeFiles) {
  const text = sub === '.' ? dts : readFileSync(join(PKG, rel), 'utf8');
  const file = sub === '.' ? sf : ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true);
  const seen = new Map(); // one row per tag: a constant's tag is met on its statement and its declaration
  const visit = (node, owner) => {
    let name = node.name ? node.name.getText(file) : undefined;
    if (ts.isVariableStatement(node)) name = node.declarationList.declarations.map((d) => d.name.getText(file)).join(', ');
    for (const tag of ts.getJSDocTags(node).filter((t) => t.tagName.text === 'deprecated')) {
      if (name && !seen.has(tag.pos)) seen.set(tag.pos, { owner, name, call: ts.isMethodDeclaration(node) || ts.isMethodSignature(node) || ts.isFunctionDeclaration(node), said: textOf(tag.comment) });
    }
    const here = (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isModuleDeclaration(node) || ts.isTypeAliasDeclaration(node)) && name ? name : owner;
    ts.forEachChild(node, (c) => visit(c, here));
  };
  visit(file, null);
  // A mark on one value of a union ('integer_max' in FieldType) hangs on no declaration: the compiler
  // reads no tag there. It is read from the text: the comment that holds it, then the union member
  // that follows that comment, named with the type alias it belongs to.
  const tagSpans = [];
  const spans = (node) => { for (const t of ts.getJSDocTags(node)) tagSpans.push([t.pos, t.end]); ts.forEachChild(node, spans); };
  spans(file);
  for (const hit of text.matchAll(/@deprecated\b/g)) {
    if (tagSpans.some(([a, b]) => hit.index >= a && hit.index < b)) continue;
    const close = text.indexOf('*/', hit.index);
    if (close < 0) continue;
    const start = close + 2 + text.slice(close + 2).match(/^\s*\|?\s*/)[0].length;
    let member;
    const seek = (node) => { if (node.parent && ts.isUnionTypeNode(node.parent) && node.getStart(file) === start) member = node; ts.forEachChild(node, seek); };
    seek(file);
    let alias = member?.parent;
    while (alias && !ts.isTypeAliasDeclaration(alias)) alias = alias.parent;
    if (!member || !alias) continue;
    const said = text.slice(hit.index + '@deprecated'.length, close).replace(/^\s*\*+\s?/gm, ' ').replace(/\s+/g, ' ').trim();
    seen.set(hit.index, { owner: null, name: member.getText(file), memberOf: alias.name.getText(file), call: false, said });
  }
  const inText = (text.match(/@deprecated\b/g) ?? []).length;
  if (seen.size !== inText) {
    console.error(`gen_sdk_ref: ${rel} of @onlyworlds/sdk ${version} holds ${inText} @deprecated tag(s) and ${seen.size} could be put on a named declaration`);
    process.exit(2);
  }
  for (const { owner, name, memberOf, call, said } of seen.values()) {
    const all = sentences(said);
    const since = all[0]?.match(/^Since (\d+\.\d+\.\d+)\.$/)?.[1];
    const rest = since ? all.slice(1) : all;
    const at = rest.findIndex((s) => LEAVES.test(s));
    // Through the sentence that names the version it leaves in, and a pointer right after it ("See ...", "Use ...").
    const upTo = at < 0 ? 1 : at + 1 + (/^(?:See|Use) /.test(rest[at + 1] ?? '') ? 1 : 0);
    deprecatedRows.push(`| ${code(`${owner ? `${owner}.` : ''}${name}${call ? '()' : ''}`)}${memberOf ? ` (a value of ${code(memberOf)})` : ''}${sub === '.' ? '' : ` (${code(`@onlyworlds/sdk${sub.slice(1)}`)})`} | ${since ?? ''} | ${at < 0 ? 'not said' : rest[at].match(LEAVES)[1]} | ${esc(rest.slice(0, upTo).join(' '))} |`);
  }
}

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
  '### Deprecated names',
  '',
  ...(deprecatedRows.length === 0
    ? [`The declarations of ${version} mark no name \`@deprecated\`.`]
    : [
      `Every name the package's declarations mark \`@deprecated\`, read from the same files as the tables above: ${deprecatedRows.length} in ${version}. Each row is the mark's own comment, to the sentence that names the version the name leaves in. How much notice a change to the API itself gets: [Stability and deprecation](/docs/development/api/stability).`,
      '',
      '| Name | Deprecated since | Leaves in | What its comment says |',
      '|---|---|---|---|',
      ...deprecatedRows,
    ]),
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
console.log(`gen_sdk_ref: @onlyworlds/sdk ${version}; ${cfgRows.length} options, ${methodRows.length} methods, ${deprecatedRows.length} deprecated names in ${typeFiles.length} declaration files${changed ? ' (page rewritten)' : ''}`);
