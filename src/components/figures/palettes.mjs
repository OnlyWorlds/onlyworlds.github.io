// The public page palettes figure's data and words, from keel's palette table (the snapshot
// contract/palettes.json, written by scripts/gen_palettes.mjs). Pure: the caller passes the
// snapshot in, so the page (PagePalettes.astro) and its Markdown twin (scripts/postbuild.mjs) read
// the same thing. scripts/verify-figures.mjs holds the built figure to the snapshot with a
// contrast formula of its own.
//
// Every ratio printed is computed here from the snapshot's colours (WCAG 2.x relative luminance).
// The lead's claim is computed too: PAIRS is keel's own contrast check (the one its test suite
// runs over the table, every text colour on every surface it can sit on, and the focus ring,
// which is the accent drawn on the page), and a pair under its floor throws, so the build fails
// rather than print a claim the table does not keep.

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const channel = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (h) => { const [r, g, b] = rgb(h).map(channel); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// The pin's wash, rgba over the page colour, as the browser paints it.
export const wash = (bg, rgba) => {
  const [r, g, b, a] = rgba.match(/[\d.]+/g).map(Number);
  return '#' + [r, g, b].map((c, i) => Math.round(a * c + (1 - a) * rgb(bg)[i]).toString(16).padStart(2, '0')).join('');
};

// keel's contrast check, pair by pair: [what, foreground field, surface, floor]. A surface is a
// palette field, or 'wash' (the pin card's wash over the page).
const TEXT = 4.5, RING = 3;
export const PAIRS = [
  ['text on the page', 'text', 'bg', TEXT],
  ['text on a card', 'text', 'surf', TEXT],
  ['muted text on the page', 'muted', 'bg', TEXT],
  ['muted text on a card', 'muted', 'surf', TEXT],
  ['a link on the page', 'accent', 'bg', TEXT],
  ['a link on a card', 'accent', 'surf', TEXT],
  ['a link on the pin\'s wash', 'accent', 'wash', TEXT],
  ['text on the pin\'s wash', 'text', 'wash', TEXT],
  ['muted text on the pin\'s wash', 'muted', 'wash', TEXT],
  ['a button\'s label on its fill', 'onfill', 'fill', TEXT],
  ['the focus ring on the page', 'accent', 'bg', RING],
];

// The four numbers each card prints: [label, foreground, surface].
export const SHOWN = [
  ['text', 'text', 'bg'],
  ['muted', 'muted', 'bg'],
  ['link', 'accent', 'bg'],
  ['button', 'onfill', 'fill'],
];

const NUMBER = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const fixed = (r) => r.toFixed(2);

export function pagePalettes(snap) {
  const palettes = snap.palettes.map((p) => {
    const surface = (s) => (s === 'wash' ? wash(p.bg, p.wash) : p[s]);
    const pairs = PAIRS.map(([what, fg, on, floor]) => ({ what, fg: p[fg], on: surface(on), floor, ratio: ratio(p[fg], surface(on)) }));
    const under = pairs.filter((x) => x.ratio < x.floor);
    if (under.length) {
      throw new Error(`palettes: ${p.name}'s ${under.map((x) => `${x.what} is ${fixed(x.ratio)} to 1, under ${x.floor}`).join('; ')}: the figure's claim does not hold, so it is not printed`);
    }
    return {
      ...p,
      isDefault: p.key === snap.default,
      shown: SHOWN.map(([label, fg, on]) => ({ label, ratio: fixed(ratio(p[fg], p[on])) })),
    };
  });
  const def = palettes.find((p) => p.isDefault);
  if (!def) throw new Error(`palettes: the default ${snap.default} is not in the table`);
  return { palettes, def, count: palettes.length, pairs: PAIRS.length, readAt: snap.read_at };
}

// The figure's sentences, shared by the page and the twin; code() wraps a key or a field name.
export function paletteWords(data, code = (s) => `\`${s}\``) {
  const count = NUMBER[data.count] ?? String(data.count);
  return {
    head: `${count} palettes, each checked.`,
    lead: `Every text colour on every surface it can sit on is at least ${TEXT} to 1, and the focus ring ${RING} to 1. The default is ${data.def.name}.`,
    key: 'Numbers are contrast ratios against the card\'s page colour; the button\'s is its label on its fill.',
    wire: `On the wire, ${code('public_page.palette')} is one of ${data.palettes.map((p) => code(p.key)).join(', ')}, or ${code('null')} for ${data.def.name}.`,
    caption: `Generated from the platform's own palette table, the one the public pages' stylesheet is built from; every ratio is computed from its colours when the docs are built.`,
  };
}

// One palette as a line of text: the page's details list and the twin.
export function paletteText(p, code = (s) => `\`${s}\``) {
  const mood = `${p.mood}${p.isDefault ? ', the default' : ''}`;
  const n = Object.fromEntries(p.shown.map((s) => [s.label, s.ratio]));
  return {
    name: p.name,
    rest: ` (${code(p.key)}, ${mood}): page ${code(p.bg)}, card ${code(p.surf)}, text ${code(p.text)}, muted ${code(p.muted)}, link and focus ring ${code(p.accent)}, button label ${code(p.onfill)} on ${code(p.fill)}. Contrast: text ${n.text}, muted ${n.muted}, link ${n.link}, button ${n.button} to 1.`,
  };
}

export function pagePalettesMarkdown(snap) {
  const data = pagePalettes(snap);
  const w = paletteWords(data);
  return [
    `**${w.head}** ${w.lead}`,
    '',
    ...data.palettes.map((p) => { const t = paletteText(p); return `- **${t.name}**${t.rest}`; }),
    '',
    `${w.key} ${w.wire}`,
  ].join('\n');
}
