// type-pages.mjs: how a type page's definition is read, in one place. A type's definition is the opening
// paragraph of its own page (docs/schema/element_categories/<type>.md); every check that holds a copy of it
// to the page (the Schema table, the API document's group descriptions) reads the paragraph and its
// sentences through these.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const typePagesDir = (root) => join(root, 'src', 'content', 'docs', 'docs', 'schema', 'element_categories');

// The first block of the page's body that is prose: not an import, a tag, a heading or an aside.
export const intro = (text) => {
  const body = text.startsWith('---') ? text.split('---').slice(2).join('---') : text;
  for (const block of body.trim().split(/\r?\n\s*\r?\n/)) {
    const b = block.trim();
    if (b && !/^(import |<|#|:::)/.test(b)) return b.replace(/\s+/g, ' ');
  }
  return '';
};

export const sentences = (s) => s.split(/(?<=\.)\s+/).filter(Boolean);

// type (the page's file name) -> its opening paragraph, in name order; null when the folder is missing.
export function readTypePages(root) {
  const dir = typePagesDir(root);
  if (!existsSync(dir)) return null;
  const pages = new Map();
  for (const f of readdirSync(dir).filter((f) => /\.mdx?$/.test(f) && !f.startsWith('index.')).sort()) {
    pages.set(f.replace(/\.mdx?$/, ''), intro(readFileSync(join(dir, f), 'utf8')));
  }
  return pages;
}
