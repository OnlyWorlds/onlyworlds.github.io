// What each category links to, computed from the SDK's own field table (FIELD_SCHEMA), so the
// figure moves the day the docs' SDK pin moves. One entry per category, A to Z:
//   links[k]   [{to, fields}] for every other category one of k's link fields points at
//   self[k]    k's link fields that point at its own category (a Character's friends)
//   generic[k] k's link fields whose target is any element (a Pin's element_id)
//   incoming[k] [{from, fields}] for every other category whose own link fields point at k
//              (Trait is linked from Character's traits): the same fields, read the other way
// scripts/verify-figures.mjs reads the result back from the built page and holds it to the
// element pages, which are generated from schema-dist, not from the SDK.

export function categoryLinks(fieldSchema, types) {
  const order = [...types].sort();
  const links = {}, self = {}, generic = {};
  for (const k of order) {
    const by = new Map();
    self[k] = [];
    generic[k] = [];
    for (const [name, f] of Object.entries(fieldSchema[k] ?? {})) {
      if (f.type !== 'single_link' && f.type !== 'multi_link') continue;
      if (f.target === 'any') generic[k].push(name);
      else if (f.target === k) self[k].push(name);
      else {
        if (!by.has(f.target)) by.set(f.target, []);
        by.get(f.target).push(name);
      }
    }
    links[k] = [...by].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([to, fields]) => ({ to, fields }));
  }
  const incoming = Object.fromEntries(order.map((k) => [k, []]));
  for (const from of order) for (const l of links[from]) incoming[l.to].push({ from, fields: l.fields });
  return { order, links, self, generic, incoming };
}

export const categoryLabel = (k) => k[0].toUpperCase() + k.slice(1);

// One sentence per category, the figure's text version: the page draws it as HTML
// (CategoryLinks.astro), the Markdown twin carries it as Markdown (scripts/postbuild.mjs).
export function linkSentences(data, plural, code = (n) => `\`${n}\``) {
  const fields = (names) => names.map(code).join(', ');
  return data.order.map((k) => {
    const parts = data.links[k].map((l) => `${categoryLabel(l.to)} (${fields(l.fields)})`);
    if (data.self[k].length) parts.push(`other ${plural[k]} (${fields(data.self[k])})`);
    if (data.generic[k].length) parts.push(`any element (${fields(data.generic[k])})`);
    const back = data.incoming[k].map((l) => `${categoryLabel(l.from)} (${fields(l.fields)})`).join(', ');
    return { k, text: parts.join(', '), back };
  });
}

export function categoryLinksMarkdown(fieldSchema, types, labels) {
  const data = categoryLinks(fieldSchema, types);
  return linkSentences(data, labels)
    .map(({ k, text, back }) => `- **${categoryLabel(k)}** links to ${text}.${back ? ` Linked from ${back}.` : ''}`)
    .join('\n');
}
