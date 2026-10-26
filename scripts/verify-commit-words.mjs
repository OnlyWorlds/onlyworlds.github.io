// verify-commit-words.mjs: a commit message is published text too. The messages of the commits a push
// or pull request adds carry none of the words the built site may not (public-words.mjs), and name no
// one inside the team: a person named in published text is Titus, the founder.
//
//   node scripts/verify-commit-words.mjs A..B   the commits B adds to A
//   node scripts/verify-commit-words.mjs SHA    one commit
//
// Exit 0 clean, 1 a finding, 2 when git cannot read the commits (a shallow clone, a commit gone): not a pass.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { WORDS, ITEM_POINTER, teamWords } from './public-words.mjs';

// The team's names, as the first 12 hex of each name's sha256 (the npm SDK's word list holds the same
// rows), so this file does not publish what it refuses.
const CREW = new Set(['7d07b8e5c49d', '0ced2c75df2d', '9c2a44c4716d', 'd3aaf0e63f73', '9067ae5c5374', 'fdfd7512f532',
  'fbee9d8f57c5', '6a6ac8386005', 'd5ef0f0e059a', 'c62063d665f3', '06110f3dd13d']);
const hash12 = (w) => createHash('sha256').update(w).digest('hex').slice(0, 12);

const spec = process.argv[2];
if (!spec) { console.log('commit words: give a range (A..B) or one commit'); process.exit(2); }
let log;
try {
  const args = spec.includes('..') ? [spec] : ['-1', spec];
  log = execFileSync('git', ['log', '--format=%h%x00%B%x01', ...args], { stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8');
} catch {
  console.log(`commit words: git could not read the commits ${spec} (a shallow clone, or a commit gone); not a pass`);
  process.exit(2);
}
const commits = log.split('\x01').map((c) => c.trim()).filter(Boolean);
let found = 0;
for (const c of commits) {
  const [sha, message = ''] = c.split('\0');
  const say = (what, text) => { found++; console.log(`  FOUND  commit ${sha}: ${what}: "${text}"`); };
  for (const [re, what] of [...WORDS, ITEM_POINTER]) for (const m of message.matchAll(re)) say(what, m[0]);
  for (const { index, length, what } of teamWords(message)) say(what, message.slice(index, index + length));
  for (const m of message.matchAll(/[A-Za-z][A-Za-z0-9]*/g)) if (CREW.has(hash12(m[0]))) say('a name inside the team', m[0]);
}
console.log(`${found ? 'FAIL' : 'PASS'}: ${found} finding(s) in ${commits.length} commit message(s)`);
process.exit(found ? 1 : 0);
