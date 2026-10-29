// The roles figure's data and words: one invented world of 36 elements, read by the owner, a
// co-builder, a contributor, a guest and the public. The four roles' words are the members page's
// roles table, read from the page's own source at build time (rolesTable); the public's are the
// Hidden page's `public` row and the public worlds page's keyless writes line, read the same way.
// Nothing here restates a cell. The dots are a shape only: which invented elements are hidden,
// proposed, a room element, made by the reader or reached by a guest's grants sits in WORLD, and
// each panel's dots follow from its rule below. scripts/verify-figures.mjs holds the drawn words to
// the built table, the role names to the API's own document and each count to its own dots. Pure:
// the page (RolesView.astro) and its Markdown twin (scripts/postbuild.mjs) read the same thing.

export const N = 36;
// The invented world: each set a handful of element numbers, 0 to 35.
export const WORLD = {
  hidden: [3, 9, 14, 20, 27, 33], // hidden by the owner, none made by the reader
  proposed: [17, 24], // still proposed
  room: [10, 30], // a room element
  made: [5, 11, 22], // what the contributor or the guest made
  on: [0, 1, 7, 12], // what the guest's Character is on or knows
  sheet: [6, 18], // what its Character's sheet points to (stubs)
  roster: [2, 8, 13, 19, 26, 31], // the roster's Characters
  everyone: [25], // a message addressed to everyone
  house: [29, 35], // the world's Charter and an Object it names
};

// The readers, in the table's order; the public last. `key` is the role as the table writes it, and
// the panel's tag the role in code, or the public's words; `sees` and `changes` name its rules
// (rolesView), so the names stay the table's alone.
export const READERS = [
  { key: 'owner', name: 'Owner', sees: 'all', changes: 'all' },
  { key: 'co_builder', name: 'Co-builder', sees: 'all', changes: 'all' },
  { key: 'contributor', name: 'Contributor', sees: 'unhidden', changes: 'made' },
  { key: 'guest', name: 'Guest', sees: 'granted', changes: 'made', player: true },
  { key: 'public', name: 'The public', tag: 'no key', sees: 'open', changes: 'none' },
];

// The words no table holds. The one claim among them, the player line, is held phrase by phrase to the
// page's own source by verify-figures, and the public's Changes to the public worlds page's line
// (rolesView); the rest say what the figure is.
export const WORDS = {
  title: 'One world, read five ways',
  lead: 'The same invented world of 36 elements five times. The words are the roles table above; the dots only show its shape.',
  sees: 'Sees',
  changes: 'Changes',
  publicLead: 'An open world, read with no key: ',
  publicChanges: 'Nothing: every write answers a keyless request `401`',
  player: 'A player reads exactly what a guest playing that Character reads and writes nothing: its key is a read key.',
  key: { seen: 'seen', unseen: 'not seen', hidden: 'hidden by the owner', out: 'still proposed or a room element: the public read leaves it out', change: 'can change' },
  caption: 'The dots are a shape, not a count of any world: the roles table is the rule, and its notes under it say what the dots leave out.',
};

// The roles table under `## Roles` in the members page's source: [{ role, sees, changes }], each
// cell as written (Markdown).
export function rolesTable(src) {
  const at = src.indexOf('\n## Roles\n');
  if (at < 0) throw new Error('roles: the members page has no "## Roles" section');
  const rows = [];
  for (const line of src.slice(at + 10).split('\n')) {
    if (line.startsWith('## ')) break;
    const m = line.match(/^\| `([a-z_]+)` \| (.+) \| (.+) \|$/);
    if (m) rows.push({ role: m[1], sees: m[2], changes: m[3] });
    else if (rows.length && !line.startsWith('|')) break;
  }
  if (!rows.length) throw new Error('roles: the members page\'s roles table has no rows');
  return rows;
}

// The public's Sees: the Hidden page's view-as row for `public`, up to its colon.
export function publicSees(hiddenSrc) {
  const m = hiddenSrc.match(/^\| `public` \| ([^:|]+):/m);
  if (!m) throw new Error('roles: the Hidden page has no `public` row in its view-as table');
  return `${WORDS.publicLead}${m[1][0].toLowerCase()}${m[1].slice(1)}`;
}

export function rolesView(membersSrc, hiddenSrc, publicSrc) {
  const table = rolesTable(membersSrc);
  const want = READERS.filter((r) => r.key !== 'public').map((r) => r.key);
  if (table.map((r) => r.role).join() !== want.join()) throw new Error(`roles: the table's roles are ${table.map((r) => r.role).join(', ')}; the figure draws ${want.join(', ')}`);
  if (!/every write answers? a keyless request[^\n]*`401`/.test(publicSrc)) throw new Error('roles: the public worlds page no longer says every write answers a keyless request 401');
  const all = [...Array(N).keys()];
  const W = Object.fromEntries(Object.entries(WORLD).map(([k, v]) => [k, new Set(v)]));
  const hidden = (i) => W.hidden.has(i) && !W.made.has(i);
  const guestGrant = (i) => ['made', 'on', 'sheet', 'roster', 'everyone', 'house'].some((k) => W[k].has(i));
  // each reader's rule, as the table says it
  const RULES = {
    all: () => true,
    unhidden: (i) => !hidden(i),
    granted: (i) => guestGrant(i) && !hidden(i),
    open: (i) => !W.hidden.has(i) && !W.proposed.has(i) && !W.room.has(i),
    made: (i) => W.made.has(i),
    none: () => false,
  };
  const panels = READERS.map((r) => {
    const row = table.find((t) => t.role === r.key);
    const dot = (i, on) => ({ i, on, hidden: W.hidden.has(i), out: r.sees === 'open' && (W.proposed.has(i) || W.room.has(i)) });
    const sees = all.map((i) => dot(i, RULES[r.sees](i)));
    const changes = all.map((i) => dot(i, RULES[r.changes](i)));
    return {
      key: r.key,
      name: r.name,
      tag: r.tag ?? `\`${r.key}\``,
      sees: { words: row ? row.sees : publicSees(hiddenSrc), dots: sees, count: sees.filter((d) => d.on).length },
      changes: { words: row ? row.changes : WORDS.publicChanges, dots: changes, count: changes.filter((d) => d.on).length },
      note: r.player ? WORDS.player : null,
    };
  });
  return { n: N, panels };
}

// A cell's Markdown as HTML: links, code and bold, nothing else (a table cell holds no more).
export function inline(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc(md)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

export const countSay = (n, of = N) => `${n} of ${of}`;

export function rolesMarkdown(membersSrc, hiddenSrc, publicSrc) {
  const d = rolesView(membersSrc, hiddenSrc, publicSrc);
  return [
    `**${WORDS.title}.** ${WORDS.lead}`,
    '',
    ...d.panels.map((p) => `- **${p.name}** (${p.tag}). ${WORDS.sees} (${countSay(p.sees.count)}): ${p.sees.words}. ${WORDS.changes} (${countSay(p.changes.count)}): ${p.changes.words}.${p.note ? ` ${p.note}` : ''}`),
    '',
    WORDS.caption,
  ].join('\n');
}
