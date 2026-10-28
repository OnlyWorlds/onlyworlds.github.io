// The category fields figure's data: the 22 categories in their families, each with its own field
// count split into links and values. From the SDK's field table (FIELD_SCHEMA) and its presentation
// data (ELEMENT_FAMILIES, FAMILY_ORDER), so the figure moves the day the docs' SDK pin moves. Pure:
// the caller passes them in, so the page (CategoryFields.astro) and its Markdown twin
// (scripts/postbuild.mjs) read the same thing. scripts/verify-figures.mjs holds the built figure to
// the element pages' field tables, which are generated from schema-dist, not from the SDK.
//
// A category's own fields are its fields in the table less the ones every category has (the base
// fields; the table leaves out id and world, so those are never counted either). A link is a
// single or a multi link. A generic link is held in the table as a pair, `<x>_type` (text) and
// `<x>_id` (a link to any element), and counts once, as the one link `<x>`: a Pin's `element`.

// What each family is about, in a few words: no source holds these. A family the SDK adds that is
// not named here is drawn last, without words.
export const FAMILIES = {
  agents: 'who acts',
  world: 'where things are, and what they are',
  abstract: 'rules, skills and ideas',
  temporal: 'what happens, and when',
};

export const label = (k) => k[0].toUpperCase() + k.slice(1);
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const isLink = (f) => f.type === 'single_link' || f.type === 'multi_link';

export function categoryFields(fieldSchema, types, familyOf, familyOrder) {
  const names = types.map((k) => Object.keys(fieldSchema[k] ?? {}));
  const base = names.reduce((a, b) => a.filter((n) => b.includes(n)));
  const count = (k) => {
    const all = fieldSchema[k] ?? {};
    const own = Object.entries(all).filter(([n]) => !base.includes(n));
    const generic = own
      .filter(([n, f]) => f.target === 'any' && n.endsWith('_id') && all[`${n.slice(0, -3)}_type`]?.type === 'text')
      .map(([n]) => n.slice(0, -3));
    const fields = own.length - generic.length;
    const links = own.filter(([, f]) => isLink(f)).length;
    return { k, fields, links, values: fields - links, generic };
  };
  const known = [...familyOrder];
  const fams = [...new Set(types.map((k) => familyOf[k]))].sort((a, b) => {
    const ia = known.indexOf(a), ib = known.indexOf(b);
    return (ia < 0 ? known.length : ia) - (ib < 0 ? known.length : ib) || byName(a, b);
  });
  const families = fams.map((family) => ({
    family,
    says: FAMILIES[family] ?? '',
    kinds: types.filter((k) => familyOf[k] === family).map(count)
      .sort((a, b) => b.fields - a.fields || byName(a.k, b.k)),
  }));
  const all = families.flatMap((f) => f.kinds).sort((a, b) => byName(a.k, b.k));
  const pick = (better) => all.reduce((w, c) => (better(c, w) ? c : w));
  return {
    total: all.length,
    base,
    families,
    max: Math.max(...all.map((c) => c.fields)),
    fewest: pick((c, w) => c.fields < w.fields),
    most: pick((c, w) => c.fields > w.fields),
    // the largest share of links among its own fields; a tie keeps the first A to Z
    linked: pick((c, w) => c.links * w.fields > w.links * c.fields),
    generic: all.flatMap((c) => c.generic.map((g) => ({ k: c.k, field: g }))),
  };
}

const NUMBER = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const say = (n) => NUMBER[n] ?? String(n);

// The figure's sentences, shared by the page and the twin; code() wraps a field name, link() a
// link to another page of the docs.
export function fieldWords(data, code = (s) => `\`${s}\``, link = (text, href) => `[${text}](${href})`) {
  const { fewest, most, linked } = data;
  const g = data.generic.map(({ k, field }) =>
    ` A ${label(k)}'s ${code(field)} link counts as one field; on the wire it is two, ${code(`${field}_type`)} and ${code(`${field}_id`)}.`);
  return {
    head: `${data.total} categories in ${say(data.families.length)} families.`,
    lead: `From ${label(fewest.k)}'s ${fewest.fields} fields to ${label(most.k)}'s ${most.fields}. ${label(linked.k)} is the most linked: ${linked.links} of its ${linked.fields} fields are links to other elements.`,
    link: 'a link to other elements',
    value: 'a value (text or a number)',
    caption: `Generated from the schema. Each category's own fields: the ${link('base fields', '/docs/schema/fields')} every element carries are not counted.${g.join('')}`,
  };
}

// One family's categories as words, for the text version on the page and in the twin.
export const kindsText = (f) =>
  f.kinds.map((c) => `${label(c.k)} ${c.fields} fields (${c.links} ${c.links === 1 ? 'link' : 'links'})`).join(', ');

export function categoryFieldsMarkdown(fieldSchema, types, familyOf, familyOrder) {
  const data = categoryFields(fieldSchema, types, familyOf, familyOrder);
  const w = fieldWords(data);
  const fams = data.families.map((f) => `- **${label(f.family)}**${f.says ? `, ${f.says}` : ''}: ${kindsText(f)}.`);
  return [`**${w.head}** ${w.lead}`, '', ...fams, '', w.caption].join('\n');
}
