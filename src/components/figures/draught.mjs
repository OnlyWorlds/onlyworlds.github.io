// The draught figure's data and words: one Character's context in one read, its sections round her
// and the policy that shapes the read. Every section, which are off unless named, which the budget
// never cuts, every parameter with its values and defaults comes from the API's own document
// through the snapshot contract/draught.json (scripts/gen_draught.mjs): the route
// GET /api/v2/character/{id}/context and its answer, the Draught schema. The words no source holds
// sit here, each one a phrase of the page's own source, which scripts/verify-figures.mjs holds them
// to. Pure: the page (DraughtRead.astro) and its Markdown twin (scripts/postbuild.mjs) read the same
// thing.

// What each section holds, in the page's words.
export const SAYS = {
  self: 'her own element, with self: true',
  role: 'the Titles she holds and the bodies she sits in',
  work: 'her open work',
  style: 'how she works',
  events: 'the Events she was in in story order',
  knowledge: 'the Narratives she knows',
  names: 'everything else that names her',
  sheet: 'what her own element links to, one step out',
  recent: 'what changed around her',
  roster: 'who plays whom',
  messages: 'Narratives with supertype Message that name her',
  room: "a parlor's room elements",
  proposed: 'no keeper has settled yet',
};
// The query parameter that is not the policy: the world a keyless or account-token reader names
// (the page's "Who may read it"), the same parameter as on the list routes.
export const READER = ['world'];
export const HEADS = { title: 'A Character in one read', centre: 'One Character', centreNote: 'as the recorded world holds it', off: 'Only when components names it', neverCut: 'never cut', withSince: 'with since' };
const NUMBERS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NEVER_CUT = /;\s*([a-z_, ]+?) are never cut\b/;
const ON_ITS_OWN = /each section is cut to it on its own, never one order across sections/;

const count = (n) => (n < NUMBERS.length ? NUMBERS[n][0].toUpperCase() + NUMBERS[n].slice(1) : String(n));
const list = (xs, and = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}`);

export function draughtView(snap) {
  const P = snap.parameters;
  const sections = P.components?.schema?.items?.enum;
  if (!sections?.length) throw new Error('draught: the components parameter lists no sections');
  // off by default: the names the components description gives after "every one but", its asides dropped
  const d = P.components.description ?? '';
  const but = d.match(/Default: every one but (.+?), each off unless named\./)?.[1];
  if (!but) throw new Error(`draught: the components parameter does not say which are off unless named: "${d}"`);
  const off = [...but.replace(/\([^()]*\)/g, '').matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
  if (!off.length || off.some((s) => !sections.includes(s))) throw new Error(`draught: off unless named reads ${off.join(', ')}, not all of them sections`);
  for (const s of sections) if (!(s in SAYS)) throw new Error(`draught: the API serves the section ${s}, which the figure has no words for`);
  // each section's key in the packet: its own name, but self, which is the key whose body carries self: true
  const keys = snap.packet.keys;
  const keyOf = (s) => (s === 'self' ? snap.packet.self : s);
  for (const s of sections) if (!(keyOf(s) in keys)) throw new Error(`draught: the section ${s} has no key ${keyOf(s)} in the packet`);
  // never cut: what the budget parameter says
  const nc = P.budget?.description?.match(NEVER_CUT)?.[1]?.split(/, | and /);
  if (!nc?.length || nc.some((s) => !sections.includes(s))) throw new Error(`draught: the budget does not say which sections are never cut: "${P.budget?.description}"`);
  if (!ON_ITS_OWN.test(P.budget.description)) throw new Error('draught: the budget no longer says each section is cut on its own');
  // recent needs since
  if (!/Absent, `recent` is empty\./.test(P.since?.description ?? '')) throw new Error('draught: the since parameter no longer says recent is empty without it');
  const on = sections.filter((s) => !off.includes(s));
  const half = Math.ceil(on.length / 2);
  const card = (s) => ({ section: s, key: keyOf(s), says: SAYS[s], neverCut: nc.includes(s), since: s === 'recent' });
  // the lenses: a packet key no component names, added by the lens parameter
  if (!keys.lenses || !P.lens) throw new Error('draught: the packet has no lenses or the route no lens parameter');
  // the policy: every query parameter but the reader's world
  const settings = Object.entries(P).filter(([k]) => !READER.includes(k)).map(([k, p]) => ({ param: k, values: valuesOf(p.schema), default: p.schema.default ?? null }));
  if (!P.as_of?.description?.includes("default the world's time_range_current")) throw new Error('draught: as_of no longer defaults to the world\'s time_range_current');
  if (P.lens?.schema?.default !== undefined || P.since?.schema?.default !== undefined || P.components?.schema?.default !== undefined) throw new Error('draught: components, since or lens has a default in the document the figure does not draw');
  for (const s of settings) if (!(s.param in NOTES)) throw new Error(`draught: the route takes ${s.param}, which the figure has no words for`);
  return {
    readAt: snap.read_at,
    route: snap.route,
    left: on.slice(0, half).map(card),
    right: on.slice(half).map(card),
    on,
    off: off.map(card),
    neverCut: nc,
    settings,
  };
}

// A parameter's values, from its schema: an enum's values, a range, a boolean; else none.
export function valuesOf(s) {
  if (s.enum) return s.enum.map(String).join(' or ');
  if (s.type === 'boolean') return 'true or false';
  if (s.minimum !== undefined && s.maximum !== undefined) return `${s.minimum} to ${s.maximum}`;
  return null;
}

// What each parameter does, in the page's words (its policy table).
const NOTES = {
  components: () => 'the sections to serve, comma-separated',
  mode: (c) => `${c('voice')} reads as she would; ${c('act')} reads through your own key's view`,
  as_of: () => "the horizon, an integer in the world's time unit",
  undated: (c) => `${c('exclude')} drops them, for a spoiler-safe narrator`,
  since: (c) => `for ${c('recent')}: a cursor from ${c('/changes')}, or an ISO 8601 date and time`,
  budget: () => 'items per section',
  depth: () => "the sheet's reach",
  lens: (c) => `a lens id; ${c('lens')} beside ${c('depth')} or ${c('budget')} is a 422`,
  compact: (c) => `${c('true')} leaves out every empty section`,
};
// The defaults the document gives in words, not as a schema default; in the page's words.
const DEFAULTS = {
  components: (c, data) => `every one but ${list(data.off.map((o) => c(o.section)))}`,
  as_of: (c) => `the world's ${c('time_range_current')}`,
  since: (c) => `none: ${c('recent')} is empty`,
  lens: () => 'none',
};

// The figure's sentences, shared by the page and the twin; code() wraps code. Each is a phrase of
// the page's own source (verify-figures holds them there), but the caption's first sentence, which
// is the document's.
export function draughtWords(data, code = (s) => `\`${s}\``) {
  const n = data.settings.length;
  return {
    route: `GET ${data.route}`,
    on: `${count(data.on.length)} by default`,
    note: (s) => SAYS[s],
    keyNote: (k) => `in the packet: ${code(k)}`,
    lenses: `${code('lenses')}: with ${code('lens')}, one frame with that lens read for your own view; without it, one frame per lens you chose`,
    policy: `${count(n)} query parameters, all optional`,
    policyNote: `the packet's ${code('policy')}: every key resolved`,
    setting: (s) => NOTES[s.param](code),
    def: (s) => (s.default !== null ? code(String(s.default)) : DEFAULTS[s.param](code, data)),
    caption: `Each section is cut to the budget on its own, never one order across sections. Generated from the API's own document (${code('openapi.json')}): the route's query parameters and its answer, as read on ${data.readAt}.`,
  };
}

export function draughtMarkdown(snap) {
  const data = draughtView(snap);
  const w = draughtWords(data);
  const c = (s) => `\`${s}\``;
  const row = (x) => `- ${c(x.section)}${x.key !== x.section ? ` (${w.keyNote(x.key)})` : ''}: ${x.says}${x.neverCut ? `; ${HEADS.neverCut}` : ''}${x.since ? `; ${HEADS.withSince}` : ''}`;
  return [
    `**${HEADS.title}.** ${c(w.route)}: ${HEADS.centre} ${HEADS.centreNote}.`,
    '',
    `**${w.on}.**`,
    '',
    ...[...data.left, ...data.right].map(row),
    '',
    `**${HEADS.off.replace('components', c('components'))}.**`,
    '',
    ...data.off.map(row),
    '',
    w.lenses,
    '',
    `**${w.policy}** (${w.policyNote}).`,
    '',
    ...data.settings.map((s) => `- ${c(s.param)}${s.values ? ` (${s.values})` : ''}: ${w.setting(s)}; default ${w.def(s)}`),
    '',
    w.caption,
  ].join('\n');
}
