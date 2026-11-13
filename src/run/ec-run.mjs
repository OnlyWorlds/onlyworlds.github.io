// ec-run.mjs: an Expressive Code plugin that puts the Run button in a sample's own header bar.
//
// integration.mjs gives a runnable sample's code block the meta option ow-run=<base64url request>.
// After every block of a group is rendered (so the frames plugin has built the header), this adds,
// at the header's right: the Run button, carrying the request, and a short label saying where it
// runs, a link to where that is explained: "on the practice world", or "with the demo key" for a
// read that sends the sample's demo key (marker.mjs). The header comes before the code and its copy
// button in the document, so Run comes first in the tab order. A Run that fills in a made id
// (ow-run-after=<type>) is built disabled, its label and name saying what it waits for ("Run after
// the Location above"); the runner enables it once a Run on the page has made one.
import { decodeRequest, where, waitLabel } from './marker.mjs';

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
          const w = where(decodeRequest(req));
          const after = codeBlock.metaOptions.getString('ow-run-after');
          const button = after
            ? { type: 'button', className: ['ow-run'], dataOwRun: req, ariaLabel: waitLabel(after), disabled: true }
            : { type: 'button', className: ['ow-run'], dataOwRun: req, ariaLabel: `Run ${w.label}` };
          header.children.push(el('span', { className: ['ow-run-bar'] }, [
            el('button', button, [
              PLAY, el('span', { className: ['ow-run-label'] }, [text(after ? waitLabel(after) : 'Run')]),
            ]),
            el('a', { className: ['ow-run-where'], href: w.href }, [text(w.label)]),
          ]));
        }
      },
    },
  };
}
