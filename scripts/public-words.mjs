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
// after `#`, since every changelog date is an anchor (`#2026-10-08`).
const NUM = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const CUR = String.raw`(?:USD|EUR|GBP|[Dd][Oo][Ll][Ll][Aa][Rr][Ss]?|[Ee][Uu][Rr][Oo][Ss]?)\b`;

export const WORDS = [
  [/\bh\d{1,3} #\d+/g, 'a room pointer'],
  [/\b(?:the )?Captain\b(?! [A-Z][a-z])/g, 'Captain'],
  [/\b(?:the Deck|Carrier)\b/g, 'the crew\'s ship'],
  [/\b(?:Armature|Orrery|Hangar|Hatchery|Assembly bay|Forge bay)\b/g, 'a bay name'],
  [/allthecarriercrew/g, 'the crew email'],
  [new RegExp(String.raw`(?<![\w.])${NUM}\s+of\s+${NUM}\s?${CUR}|[$€£]\s?${NUM}|(?<![\w.])${NUM}\s?(?:${CUR}|[€£])|\b(?:USD|EUR|GBP)\s?${NUM}`, 'g'),
    'a spend figure (money is the owner\'s, never public)'],
];

// An item pointer: a tracker's name and a number, with the numbers that follow it in a list.
export const ITEM_POINTER = [/\b(?:[Kk]eel|OW [A-Z][a-z]+|Council|Spine|Porch|Infra|Collab|Journey|Story|Industry|Market|Parlor|Sikelia|Constellation|Rapid Deploys|items?) #\d{1,5}\b(?:(?:,|,? and|,? or) #\d{1,5}\b)*/g, 'an item pointer'];
