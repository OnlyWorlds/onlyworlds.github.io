// public-words.mjs: the crew's own words that public text never carries (the founder's ruling,
// 2026-10-24). One list, read by this site's verify-public-words.mjs and by any other public page's
// check (the Constellation's verify-sky.mjs reads it from this repo's published main). Each entry
// is [pattern, what it is]. "Captain" followed by a capitalised name is a character (Moppetopia's
// Captain Snoot) and passes.
export const WORDS = [
  [/\bh\d{1,3} #\d+/g, 'a room pointer'],
  [/\b(?:the )?Captain\b(?! [A-Z][a-z])/g, 'Captain'],
  [/\b(?:the Deck|Carrier)\b/g, 'the crew\'s ship'],
  [/\b(?:Armature|Orrery|Hangar|Hatchery|Assembly bay|Forge bay)\b/g, 'a bay name'],
  [/allthecarriercrew/g, 'the crew email'],
];

// An item pointer: a tracker's name and a number.
export const ITEM_POINTER = [/\b(?:[Kk]eel|OW [A-Z][a-z]+) #\d+/g, 'an item pointer'];
