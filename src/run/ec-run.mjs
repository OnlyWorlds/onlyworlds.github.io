// ec-run.mjs: an Expressive Code plugin that puts the Run button in a sample's own header bar.
//
// remark-run.mjs gives a runnable sample's code block the meta option ow-run=<base64url request>.
// After every block of a group is rendered (so the frames plugin has built the header), this adds,
// at the header's right: the Run button, carrying the request, and the short label "on the
// practice world", a link to where the practice world is explained. The header comes before the
// code and its copy button in the document, so Run comes first in the tab order.
const BOX = '/docs/getting-started/keys#the-practice-world';
const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const PLAY = el('svg', { viewBox: '0 0 12 12', ariaHidden: 'true', focusable: 'false' }, [
  el('path', { d: 'M2 1.2v9.6L10.5 6z', fill: 'currentColor' }),
]);

function find(node, test) {
  if (test(node)) return node;
  for (const c of node.children ?? []) {
    const hit = find(c, test);
    if (hit) return hit;
  }
  return null;
}
const hasClass = (n, c) => n.type === 'element' && [].concat(n.properties?.className ?? []).includes(c);

export function pluginRun() {
  return {
    name: 'ow-run',
    hooks: {
      postprocessRenderedBlockGroup: ({ renderedGroupContents }) => {
        for (const { codeBlock, renderedBlockAst } of renderedGroupContents) {
          const req = codeBlock.metaOptions.getString('ow-run');
          if (!req) continue;
          const header = find(renderedBlockAst, (n) => n.type === 'element' && n.tagName === 'figcaption' && hasClass(n, 'header'));
          if (!header) throw new Error('ec-run: a runnable sample has no header bar to carry its Run button (a terminal frame has one: is it a bash block?)');
          const frame = find(renderedBlockAst, (n) => hasClass(n, 'frame'));
          frame.properties.className = [].concat(frame.properties.className ?? [], 'ow-runnable');
          header.children.push(el('span', { className: ['ow-run-bar'] }, [
            el('button', { type: 'button', className: ['ow-run'], dataOwRun: req, ariaLabel: 'Run on the practice world' }, [
              PLAY, el('span', { className: ['ow-run-label'] }, [text('Run')]),
            ]),
            el('a', { className: ['ow-run-where'], href: BOX }, [text('on the practice world')]),
          ]));
        }
      },
    },
  };
}
