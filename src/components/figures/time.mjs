// The time figure's data and words: how a world counts time. Its steps, each a count of the basic
// unit, and its line of whole numbers from the earliest tracked point to the latest, with the
// world's now and one element's date on it. The field names come from the standard (schema-dist's
// schema.json and its example world folder) and the API's own document, the values from the demo
// world Moppetopia as the public reads it, all through the snapshot contract/time.json
// (scripts/gen_time.mjs); the words no source holds sit here. Pure: the page (TimeLadder.astro)
// and its Markdown twin (scripts/postbuild.mjs) read the same thing. scripts/verify-figures.mjs
// holds the built figure to the snapshot, and these words to the page's own source.

// What each mark on the line is, in the words of the page's Timeline table (verify-figures holds
// each to its row there), and where each spelling of now is used.
export const MARKS = { min: 'earliest tracked', now: 'now', max: 'latest tracked' };
export const WHERE = { api: 'the API', folder: 'a world folder' };

const STEP_FIELDS = ['time_format_names', 'time_format_equivalents', 'time_basic_unit'];
const LINE_FIELDS = ['time_range_min', 'time_range_max'];

// The standard's own example of the steps, from the equivalents field's description:
// "(e.g., [1, 7, 30, 365] for Day, Week, Month, Year if basic unit is Day)".
function standardExample(desc) {
  const m = desc?.match(/\(e\.g\., \[([\d, ]+)\] for ([A-Za-z]+(?:, [A-Za-z]+)*) if basic unit is ([A-Za-z]+)\)/);
  if (!m) throw new Error(`time: the standard's time_format_equivalents description gives no example in the form this reads: "${desc}"`);
  const units = m[1].split(',').map((n) => Number(n.trim()));
  const names = m[2].split(', ');
  if (units.length !== names.length) throw new Error(`time: the standard's example names ${names.length} steps and ${units.length} counts`);
  return { names, units, unit: m[3] };
}

export function timeLadder(snap) {
  const std = snap.standard?.fields?.map((f) => f.name) ?? [];
  const api = snap.api?.fields?.map((f) => f.name) ?? [];
  for (const f of [...STEP_FIELDS, ...LINE_FIELDS]) {
    if (!std.includes(f) || !api.includes(f)) throw new Error(`time: ${f} is not in both the standard and the API document; the figure draws it as one field`);
  }
  // now is the one time field each side spells its own way
  const stdNow = std.filter((f) => !api.includes(f));
  const apiNow = api.filter((f) => !std.includes(f));
  if (stdNow.length !== 1 || apiNow.length !== 1) throw new Error(`time: the figure draws now as one field with two spellings; the standard alone has ${stdNow.join(', ') || 'none'}, the API alone ${apiNow.join(', ') || 'none'}`);
  const folderNow = snap.folder.keys.filter((k) => k === stdNow[0] || k === apiNow[0]);
  if (folderNow.length !== 1) throw new Error(`time: ${snap.folder.file} spells now ${folderNow.join(' and ') || 'neither way'}`);
  const v = snap.world.values;
  const min = v.time_range_min, max = v.time_range_max, now = v[apiNow[0]];
  const el = snap.world.element;
  for (const [k, x] of [['time_range_min', min], ['time_range_max', max], [apiNow[0], now], [`${el.name}'s ${el.field}`, el.date]]) {
    if (!Number.isInteger(x)) throw new Error(`time: ${snap.world.name}'s ${k} is ${JSON.stringify(x)}, not a whole number`);
  }
  if (!(min < max) || now < min || now > max || el.date < min || el.date > max) throw new Error(`time: ${snap.world.name}'s line does not hold its marks (${min}, ${now}, ${el.date}, ${max})`);
  const at = (x) => Math.round(((x - min) / (max - min)) * 10000) / 100;
  // the steps: the world's own when it names any; else the standard's example, said to be one
  const named = v.time_format_names ?? [], counts = v.time_format_equivalents ?? [];
  const own = named.length > 0;
  const ex = own ? { names: named, units: counts.map(Number), unit: v.time_basic_unit } : standardExample(snap.standard.fields.find((f) => f.name === 'time_format_equivalents').desc);
  if (ex.names.length !== ex.units.length || ex.units.some((n) => !Number.isInteger(n) || n < 1)) throw new Error(`time: the steps ${JSON.stringify(ex.names)} have the counts ${JSON.stringify(ex.units)}`);
  const top = Math.max(...ex.units);
  return {
    world: snap.world.name,
    readAt: snap.read_at,
    serial: snap.standard.serial,
    unit: v.time_basic_unit,
    steps: {
      own,
      unit: ex.unit,
      empty: own ? null : { names: named, counts },
      rungs: ex.names.map((name, i) => ({ name, units: ex.units[i], width: Math.round((ex.units[i] / top) * 10000) / 100 })),
    },
    line: {
      marks: [
        { key: 'min', field: 'time_range_min', value: min, at: at(min), say: MARKS.min },
        { key: 'date', field: el.field, value: el.date, at: at(el.date), element: el },
        { key: 'now', field: apiNow[0], folder: folderNow[0], value: now, at: at(now), say: MARKS.now },
        { key: 'max', field: 'time_range_max', value: max, at: at(max), say: MARKS.max },
      ].sort((a, b) => a.value - b.value || (a.key === 'max') - (b.key === 'max')),
    },
  };
}

// The figure's sentences, shared by the page and the twin; code() wraps code.
export function timeWords(data, code = (s) => `\`${s}\``) {
  const s = data.steps;
  return {
    stepsHead: s.own ? `${data.world}'s steps` : 'The steps',
    stepsNote: s.own
      ? `Each step is a count of the basic unit, ${code(s.unit)}.`
      : `${data.world} names none (${code('time_format_names')} and ${code('time_format_equivalents')} are ${code('[]')}), so these are the standard's own example, from the field's description: each step a count of the basic unit, ${code(s.unit)}.`,
    lineHead: `${data.world}'s line`,
    lineNote: `Whole numbers of ${code('time_basic_unit')}, here ${code(data.unit)}.`,
    caption: `${data.world}, the demo world, as the API served it on ${data.readAt}; the field names from the standard (schema-dist serial ${data.serial}) and the API's own document (${code('openapi.json')}).`,
  };
}

export const unitsOf = (n, unit) => `${n} ${unit}${n === 1 || /s$/.test(unit) ? '' : 's'}`;
export const dateSay = (el, code = (s) => `\`${s}\``) => `${el.name}'s ${code(el.field)}`;
export const nowSay = (m, code = (s) => `\`${s}\``) => `${code(m.field)} in ${WHERE.api}, ${code(m.folder)} in ${WHERE.folder}`;

export function timeMarkdown(snap) {
  const data = timeLadder(snap);
  const w = timeWords(data);
  const c = (s) => `\`${s}\``;
  const mark = (m) => (m.key === 'date'
    ? `- ${c(String(m.value))}: ${dateSay(m.element)}`
    : `- ${c(String(m.value))}: ${m.say}, ${m.key === 'now' ? nowSay(m) : c(m.field)}`);
  return [
    `**${w.stepsHead}.** ${w.stepsNote}`,
    '',
    ...data.steps.rungs.map((r) => `- ${r.name}: ${unitsOf(r.units, data.steps.unit)}`),
    '',
    `**${w.lineHead}.** ${w.lineNote}`,
    '',
    ...data.line.marks.map(mark),
    '',
    w.caption,
  ].join('\n');
}
