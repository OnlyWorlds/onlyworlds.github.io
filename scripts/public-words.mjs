// public-words.mjs: the crew's own words that public text never carries (the founder's ruling,
// 2026-10-24). One list, read by this site's verify-public-words.mjs and by any other public page's
// check. Each entry is [pattern, what it is]. "Captain" followed by a capitalised name is a
// character (Moppetopia's Captain Snoot) and passes.
//
// Kept beside keel's own list (codegen/public_words.py, the server's and the schema distribution's
// gate): its spend-figure row and its project words for an item pointer are taken here as written
// (2026-10-25). Three of its rows are left out because on these pages they refuse what is true and
// public, measured over the built site that day (35 hits outside the changelog, none a leak): a
// bay's name, since the Unity package's parts are an Assembly and a Bridge; a local address, since
// the API pages tell a developer about loopback sign-in; and a bare four- or five-digit number
// after `#`, since every changelog date is an anchor (`#2026-10-08`). Its repository-address and
// two room-id rows were taken on 2026-10-25 (0 hits over the built site). KEEL_ROWS below holds
// the account, row by row.
const NUM = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const CUR = String.raw`(?:USD|EUR|GBP|[Dd][Oo][Ll][Ll][Aa][Rr][Ss]?|[Ee][Uu][Rr][Oo][Ss]?)\b`;

export const WORDS = [
  [/\bh\d{1,3} #\d+/g, 'a room pointer'],
  [/\b(?:the )?Captain\b(?! [A-Z][a-z])/g, 'Captain'],
  [/\b(?:the Deck|Carrier)\b/g, 'the crew\'s ship'],
  [/\b(?:Armature|Orrery|Hangar|Hatchery|Assembly bay|Forge bay)\b/g, 'a bay name'],
  [/allthecarriercrew/g, 'the crew email'],
  [/github\.com\/tmoosting\b/g, "the founder's own repository address (the organisation's, or nothing)"],
  [/\bh\d{1,3}(?= \d{4}-\d{2}-\d{2})/g, 'a room beside a date'],
  [/(?<![\w-])h\d{2,3}(?=\s*[(·,])/g, 'a room id'],
  [new RegExp(String.raw`(?<![\w.])${NUM}\s+of\s+${NUM}\s?${CUR}|[$€£]\s?(?!\d(?![\d,]|\.\d))${NUM}|(?<![\w.])${NUM}\s?(?:${CUR}|[€£])|\b(?:USD|EUR|GBP)\s?${NUM}`, 'g'),
    'a spend figure (money is the owner\'s, never public)'],
];

// Every row of keel's list, by the first ten hex of the sha256 of its pattern source, and what this
// list does with it. Assembly's verify-stitches reads keel's published list and fails on a row
// declared here that keel no longer has, or a keel row declared nowhere: a row keel adds is read
// here before it is taken or left out. Whether a taken row refuses exactly what keel's does is not
// checked; this list is written for these pages.
export const KEEL_ROWS = [
  ['4889a51ebb', 'taken: Captain'],
  ['782e8f3209', 'taken: the Deck'],
  ['0be65d6b60', 'taken: Carrier'],
  ['561b225535', 'taken: a room pointer (wider here: any number after the #)'],
  ['e2b8e03c6a', 'taken: an item pointer (ITEM_POINTER)'],
  ['6281fb040b', 'left out: every changelog date is an anchor (#2026-10-08)'],
  ['f33a2c9b3e', 'taken: a room beside a date'],
  ['a7df1a778d', 'taken: a spend figure (a sign before one bare digit, $1 in a regex or a shell line, passes, as keel PR 250 has it)'],
  ['56dc0c6331', "left out: the Unity package's parts are an Assembly and a Bridge; the narrower bay row above is kept"],
  ['4340fc2d94', 'taken: the crew email'],
  ['56ca4875fe', 'left out: the API pages tell a developer about loopback sign-in'],
  ['124283a4c2', "taken: the founder's own repository address"],
  ['c2279c332d', 'taken: a room id'],
];

// An item pointer: a tracker's name and a number, with the numbers that follow it in a list.
export const ITEM_POINTER = [/\b(?:[Kk]eel|OW [A-Z][a-z]+|Council|Spine|Porch|Infra|Collab|Journey|Story|Industry|Market|Parlor|Sikelia|Constellation|Rapid Deploys|items?) #\d{1,5}\b(?:(?:,|,? and|,? or) #\d{1,5}\b)*/g, 'an item pointer'];
