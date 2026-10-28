// The write body figure's data and words: what a body sent to POST, PUT or PATCH an element may
// carry, in three answers: stored, tolerated and ignored, rejected with 422. Every field, cap,
// reason and error code comes from the API's own document through the snapshot contract/write.json
// (scripts/gen_write.mjs): the 22 categories' write schemas, read by one rule. A field a schema
// types is stored; one it describes as "Tolerated and ignored" is ignored, with the document's
// reason; one it forbids (`not`) is refused, with its code; the server-managed fields its
// description names, and any other key, are refused. The words no source holds sit here, each one
// a phrase of the page's own source, which scripts/verify-figures.mjs holds them to. Pure: the page
// (WriteBody.astro) and its Markdown twin (scripts/postbuild.mjs) read the same thing.

// The notes on the stored fields, by field, in the page's words.
export const NOTES = {
  id: 'any RFC 4122 UUID is accepted',
  name: 'the key must be present on create and full replace, and an empty string is accepted',
  description: 'any kind of details about the element',
  supertype: 'free text',
  subtype: 'free text',
  image_url: 'link to a representative image',
  hidden: 'counts only on a create, where true creates the element hidden',
};
// When a field the full write stores is ignored instead, in the page's words; the document's
// descriptions must say so (writeView checks each).
export const WHEN = { id: 'on PUT and PATCH', hidden: 'on PATCH, or a PUT that replaces' };
const WHEN_SAYS = { id: /\bPUT\/PATCH: ignored, ([^.]+)\./, hidden: /On a PUT that replaces an existing element it is ignored/ };
// The extension prefixes in the page's order (its table: the open namespace first).
export const PREFIXES = ['x_', 'atlas_', 'shadow_'];
export const HEADS = { stored: 'Stored', ignored: 'Tolerated and ignored', refused: 'Rejected with 422' };
const TOLERATED = /^Tolerated and ignored: (.+?)\.?$/;

export function writeView(snap, labels) {
  const w = snap.write, p = snap.patch;
  const kinds = Object.keys(snap.own);
  const kind = (def) => (TOLERATED.test(def.description ?? '') ? 'ignored' : 'not' in def ? 'refused' : 'stored');
  for (const f of Object.keys(w.fields)) if (!p.fields[f]) throw new Error(`write: ${f} is in every full write and not every partial one; the figure draws one answer for both`);
  // stored: what the full write types, in the document's order
  const stored = Object.entries(w.fields).filter(([, d]) => kind(d) === 'stored').map(([f, d]) => {
    if (!(f in NOTES)) throw new Error(`write: the full write takes ${f}, which the figure has no note for`);
    return { field: f, max: d.maxLength ?? null, note: NOTES[f] };
  });
  if (JSON.stringify(w.required) !== '["name"]' || p.required.length) throw new Error(`write: the full write requires ${w.required.join(', ')} and the partial ${p.required.join(', ') || 'nothing'}; the figure says only name, only as a key on a full write`);
  // ignored: what both describe as tolerated (one row per reason), then the stored fields ignored on PUT or PATCH
  const ignored = [];
  for (const [f, d] of Object.entries(w.fields)) {
    if (kind(d) !== 'ignored') continue;
    if (kind(p.fields[f]) !== 'ignored') throw new Error(`write: ${f} is ignored by the full write and not the partial one`);
    const note = d.description.match(TOLERATED)[1];
    const row = ignored.find((r) => r.note === note);
    if (row) row.fields.push(f);
    else ignored.push({ fields: [f], note, when: null });
  }
  for (const s of stored) {
    const pd = p.fields[s.field];
    if (kind(pd) === 'ignored') {
      if (!WHEN.hasOwnProperty(s.field) || !WHEN_SAYS[s.field].test(w.fields[s.field].description)) throw new Error(`write: PATCH ignores ${s.field}; the figure does not say when else`);
      ignored.push({ fields: [s.field], note: pd.description.match(TOLERATED)[1], when: WHEN[s.field] });
    } else if (WHEN_SAYS[s.field]) {
      const m = w.fields[s.field].description.match(WHEN_SAYS[s.field]);
      if (!m) throw new Error(`write: the document no longer says ${s.field} is ignored ${WHEN[s.field]}`);
      ignored.push({ fields: [s.field], note: m[1], when: WHEN[s.field] });
    }
  }
  // refused: the server-managed fields the description names, each field forbidden with its code, any other key
  const named = (says) => says.match(/including the server-managed ([a-z_, ]+?)\.$/)?.[1];
  if (named(w.says) !== named(p.says)) throw new Error('write: the full and partial writes name different server-managed fields');
  const managed = named(w.says)?.split(/, | and /);
  if (!managed?.length || managed.some((f) => w.fields[f] || p.fields[f])) throw new Error(`write: the description names no server-managed fields, or the schema takes one: "${w.says}"`);
  const forbidden = Object.entries(w.fields).filter(([, d]) => kind(d) === 'refused').map(([f, d]) => {
    const code = d.description?.match(/^Refused \(422 ([a-z_]+)\)/)?.[1];
    if (!code) throw new Error(`write: ${f} is forbidden with no 422 code this reads: "${d.description}"`);
    return { fields: [f], code };
  });
  if (w.additional !== false || p.additional !== false) throw new Error('write: a write schema takes keys it does not list; the figure says any other key is a 422');
  // the extension fields: the pattern's prefixes and its byte cap
  const [pattern, ext] = Object.entries(w.extensions ?? {})[0] ?? [];
  if (JSON.stringify(w.extensions) !== JSON.stringify(p.extensions)) throw new Error('write: the full and partial writes take different extension fields');
  const prefixes = pattern?.match(/^\^\(([a-z_|]+)\)$/)?.[1]?.split('|') ?? [];
  if (prefixes.length !== PREFIXES.length || PREFIXES.some((x) => !prefixes.includes(x))) throw new Error(`write: the extension pattern is ${pattern}; the figure draws ${PREFIXES.join(', ')}`);
  const bytes = Number(ext.description.match(/at most (\d+) bytes of extensions per element/)?.[1]);
  if (!bytes || bytes % 1024) throw new Error(`write: the extension cap is not a whole number of KB: "${ext.description}"`);
  // the category's own fields: how many, fewest and most
  const counts = kinds.map((t) => [t, snap.own[t].length]);
  const lo = Math.min(...counts.map((c) => c[1])), hi = Math.max(...counts.map((c) => c[1]));
  const at = (n) => counts.filter((c) => c[1] === n).map((c) => labels[c[0]]);
  return {
    readAt: snap.read_at,
    categories: kinds.length,
    stored,
    own: { lo, hi, loAt: at(lo), hiAt: at(hi) },
    ext: { prefixes: PREFIXES, kb: bytes / 1024, bytes },
    ignored,
    managed,
    forbidden,
  };
}

const list = (xs, and = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}`);

// The figure's sentences, shared by the page and the twin; code() wraps code. Each is a phrase of
// the page's own source (verify-figures holds them there).
export function writeWords(data, code = (s) => `\`${s}\``) {
  return {
    cap: (n) => `up to ${n} characters`,
    own: 'the fields of its own element type',
    ownNote: `from ${data.own.lo} (${list(data.own.loAt)}) to ${data.own.hi} (${list(data.own.hiAt)}); each element type's own fields are listed on its page`,
    ext: data.ext.prefixes.map((x) => code(`${x}*`)).join(' '),
    extNote: `extension fields: any JSON value, stored as they are, and returned verbatim; each element can carry at most ${data.ext.kb} KB of them, counted as compact UTF-8 JSON; a ${code('PATCH')} merges extension fields by key`,
    managedNote: 'the API adds these to every element it returns',
    forbiddenNote: 'the server adds it to a message or a lens it serves',
    other: 'any other unknown field',
    otherNote: `naming the field, so a typo such as ${code('freinds')} fails loudly`,
    caption: `Generated from the API's own document (${code('openapi.json')}): the ${data.categories} element types' write schemas for ${code('POST')} and ${code('PUT')} and their partial ones for ${code('PATCH')}, as read on ${data.readAt}.`,
  };
}

export const fieldsSay = (fields, code = (s) => `\`${s}\``) => list(fields.map(code));

export function writeMarkdown(snap, labels) {
  const data = writeView(snap, labels);
  const w = writeWords(data);
  const c = (s) => `\`${s}\``;
  return [
    `**${HEADS.stored}.**`,
    '',
    ...data.stored.map((s) => `- ${c(s.field)}: ${s.note}${s.max ? `; ${w.cap(s.max)}` : ''}`),
    `- ${w.own}: ${w.ownNote}`,
    `- ${w.ext}: ${w.extNote}`,
    '',
    `**${HEADS.ignored}.**`,
    '',
    ...data.ignored.map((r) => `- ${fieldsSay(r.fields)}${r.when ? ` ${r.when}` : ''}: ${r.note}`),
    '',
    `**${HEADS.refused}.**`,
    '',
    `- ${fieldsSay(data.managed)}: ${w.managedNote}`,
    ...data.forbidden.map((r) => `- ${fieldsSay(r.fields)}: ${w.forbiddenNote} (${c(r.code)})`),
    `- ${w.other}: ${w.otherNote}`,
    '',
    w.caption,
  ].join('\n');
}
