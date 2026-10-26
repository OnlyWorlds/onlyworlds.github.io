// public-words.mjs: the crew's own words that public text never carries (the founder's ruling,
// 2026-10-24). One list, read by this site's verify-public-words.mjs and by any other public page's
// check. Each entry is [pattern, what it is]. The team's own words are held as hashes, below.
//
// Kept beside keel's own list (codegen/public_words.py, the server's and the schema distribution's
// gate): its spend-figure row and its project words for an item pointer are taken here as written
// (2026-10-25). Three of its rows are left out because on these pages they refuse what is true and
// public, measured over the built site that day (35 hits outside the changelog, none a leak): a
// bay's name, since two of the Unity package's parts carry bay names; a local address, since
// the API pages tell a developer about loopback sign-in; and a bare four- or five-digit number
// after a hash sign, since every changelog date is an anchor. Its repository-address and
// two room-id rows were taken on 2026-10-25 (0 hits over the built site). KEEL_ROWS below holds
// the account, row by row.
import { createHash } from 'node:crypto';

const NUM = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const CUR = String.raw`(?:USD|EUR|GBP|[Dd][Oo][Ll][Ll][Aa][Rr][Ss]?|[Ee][Uu][Rr][Oo][Ss]?)\b`;

export const WORDS = [
  [/\bh\d{1,3} #\d+/g, 'a room pointer'],
  [/github\.com\/tmoosting\b/g, "the founder's own repository address (the organisation's, or nothing)"],
  [/\bh\d{1,3}(?= \d{4}-\d{2}-\d{2})/g, 'a room beside a date'],
  [/(?<![\w-])h\d{2,3}(?=\s*[(·,])/g, 'a room id'],
  [new RegExp(String.raw`(?<![\w.])${NUM}\s+of\s+${NUM}\s?${CUR}|[$€£]\s?(?!\d(?![\d,]|\.\d))${NUM}|(?<![\w.])${NUM}\s?(?:${CUR}|[€£])|\b(?:USD|EUR|GBP)\s?${NUM}`, 'g'),
    'a spend figure (money is the owner\'s, never public)'],
  [/(?<!<!-- )\b[Kk]eel PR #?\d{1,5}\b/g, "a pull request in the platform's private repository (the changelog's follow markers, SWEEP.md rule 1, are comments and pass)"],
];

// Every row of keel's list, by the first ten hex of the sha256 of its pattern source, and what this
// list does with it. A cross-tool check reads keel's published list and fails on a row
// declared here that keel no longer has, or a keel row declared nowhere: a row keel adds is read
// here before it is taken or left out. Whether a taken row refuses exactly what keel's does is not
// checked; this list is written for these pages.
export const KEEL_ROWS = [
  ['4889a51ebb', "taken: the founder's title"],
  ['782e8f3209', "taken: the team's console"],
  ['0be65d6b60', "taken: the team's ship"],
  ['561b225535', 'taken: a room pointer (wider here: any number after the #)'],
  ['35324f162a', 'taken: an item pointer (ITEM_POINTER)'],
  ['bb0ea4d978', "taken: a keel pull request, except the changelog's follow markers (SWEEP.md rule 1), which open a comment"],
  ['6281fb040b', 'left out: every changelog date is an anchor (a hash sign and the date)'],
  ['f33a2c9b3e', 'taken: a room beside a date'],
  ['a7df1a778d', 'taken: a spend figure (a sign before one bare digit, $1 in a regex or a shell line, passes, as keel PR 250 has it)'],
  ['56dc0c6331', "left out: two of the Unity package's parts carry bay names; the narrower bay row is kept"],
  ['4340fc2d94', 'taken: the crew email'],
  ['56ca4875fe', 'left out: the API pages tell a developer about loopback sign-in'],
  ['124283a4c2', "taken: the founder's own repository address"],
  ['c2279c332d', 'taken: a room id'],
];

// An item pointer: a tracker's name and a number, with the numbers that follow it in a list.
export const ITEM_POINTER = [/\b(?:[Kk]eel|OW [A-Z][a-z]+|Council|Spine|Porch|Infra|Collab|Journey|Story|Industry|Market|Parlor|Sikelia|Constellation|Rapid Deploys|items?) #\d{1,5}\b(?:(?:,|,? and|,? or) #\d{1,5}\b)*/g, 'an item pointer'];

// The team's own words, held as the first 12 hex of each word's sha256, so this list does not publish
// what it refuses (2026-10-26; the npm and Python packages hold the same rows). A row is one word, or
// two ("the" before it, or "bay" after it). The founder's title followed by a capitalised name is a
// character (a ship's captain in a fixture world) and passes.
const TEAM_WORDS = new Map([
  ['2e786c488b83', "the founder's title"],
  ['9dd2ca99ffc9', "the crew's ship"],
  ['271c535631ff', "the crew's ship"],
  ['4340fc2d9418', 'the crew email'],
  ...['d97084040035', 'b372644b8fec', '0c6874e447ef', '66ada4d485d7', '40f62620904e', '11f5dda40f92'].map((h) => [h, 'a bay name']),
]);
const hash12 = (w) => createHash('sha256').update(w).digest('hex').slice(0, 12);

// Every team word in a text: [{ index, length, what }].
export function teamWords(text) {
  const out = [];
  const tokens = [...text.matchAll(/[A-Za-z][A-Za-z0-9]*/g)];
  tokens.forEach((m, i) => {
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    const tries = [[m.index, m[0]]];
    if (prev && prev[0] === 'the' && text.slice(prev.index + 3, m.index) === ' ') tries.push([prev.index, `the ${m[0]}`]);
    if (next && next[0] === 'bay' && text.slice(m.index + m[0].length, next.index) === ' ') tries.push([m.index, `${m[0]} bay`]);
    for (const [index, w] of tries) {
      const what = TEAM_WORDS.get(hash12(w));
      if (!what) continue;
      if (what === "the founder's title" && /^ [A-Z][a-z]/.test(text.slice(m.index + m[0].length, m.index + m[0].length + 3))) continue;
      out.push({ index, length: w.length, what });
    }
  });
  return out;
}
