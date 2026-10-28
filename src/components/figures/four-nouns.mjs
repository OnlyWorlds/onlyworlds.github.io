// The four nouns figure's words, in one place: FourNouns.astro draws them, and the page's
// Markdown twin carries them as text (scripts/postbuild.mjs). scripts/verify-figures.mjs parses
// ADDRESS with the SDK's parseOwLink.

export const ADDRESS = 'https://www.onlyworlds.com/w/<world id>/<type>/<id>@<step>?lens=<id>';

export const NOUNS = {
  world: { name: 'A world', says: 'its elements, and the links between them' },
  lens: {
    name: 'A lens',
    says: 'what to read of the world',
    parts: ['where it starts', 'how far it reaches', 'which element types it keeps', 'how much of each'],
    small: 'Read for whoever holds it: each reader sees only what they may.',
  },
  picture: { name: 'A picture', says: 'a graph, a map, a list or a walk' },
  address: {
    name: 'An address',
    says: 'says where a thing is. It can also name a lens and the moment to read it at, so a link opens a reading.',
  },
};

export const CAPTION =
  'The world holds the elements; a lens chooses which of them to read, for whoever holds it; a picture ' +
  'draws that reading; an address says where it all is, and can carry the lens in a link.';

export function fourNounsMarkdown() {
  const { world, lens, picture, address } = NOUNS;
  return [
    `- **${world.name}**: ${world.says}.`,
    `- **${lens.name}**, which reads the world: ${lens.says} (${lens.parts.join(', ')}). ${lens.small}`,
    `- **${picture.name}**, which draws what the lens kept: ${picture.says}.`,
    `- **${address.name}** ${address.says} \`${ADDRESS}\``,
    '',
    CAPTION,
  ].join('\n');
}
