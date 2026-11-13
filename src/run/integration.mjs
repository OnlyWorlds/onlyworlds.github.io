// integration.mjs: a page's run markers become Run buttons, answer panels, one line and one script.
//
// Astro 7 renders .md through Sätteri; Starlight and Expressive Code add their plugins to that
// processor, and this integration adds one Markdown-tree plugin beside them. For each run marker
// (marker.mjs) in a .md page:
//   - the code block right above it takes the request in its meta (ow-run=<base64url>), which
//     ec-run.mjs reads to put the Run button in the block's header bar;
//   - the marker itself becomes the empty answer panel under the block;
// and, on a page with at least one marker:
//   - one line above its first runnable sample says where Run sends it;
//   - one script, the runner (public/assets/ow-run.js), is loaded at the end, carrying the practice
//     world's key and PIN read from contract/practice.json at build time.
// A page with no marker gets none of this, so no script. A marker with no code block right above
// it fails the build (scripts/verify-run.mjs says the same, and holds the request to the sample).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MARKER_LINE, parseMarker, encodeRequest } from './marker.mjs';

const ROOT = new URL('../../', import.meta.url);
const BOX = '/docs/getting-started/keys#the-practice-world';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');

function practice() {
  const p = JSON.parse(read('contract/practice.json'));
  for (const k of ['key', 'pin', 'reset_utc']) if (typeof p[k] !== 'string' || !p[k]) throw new Error(`ow-run: contract/practice.json has no ${k}`);
  return p;
}
// The practice world's per-address rate, as the Keys page ties it: the keyless limit's value in
// contract/limits.json (60 a minute per address).
function rate() {
  const v = JSON.parse(read('contract/limits.json')).limits?.requests_per_minute_keyless?.value;
  if (!Number.isInteger(v)) throw new Error('ow-run: contract/limits.json has no requests_per_minute_keyless value');
  return v;
}

// The once-per-page line; verify-run.mjs reads it back from the built page.
export const noteText = (reset) => `Run sends the sample to the practice world: anyone can read what it makes, and it resets every night at ${reset} UTC.`;
const noteHtml = (reset) => `<p class="ow-run-note">Run sends the sample to the <a href="${BOX}">practice world</a>: anyone can read what it makes, and it resets every night at ${esc(reset)} UTC.</p>`;

// One plugin per .md document that mentions a run marker.
function runMarkers({ fileURL, sourceFormat, source }) {
  if (sourceFormat !== 'markdown' || !/<!--\s*run:/.test(source)) return undefined;
  const where = fileURL ? fileURLToPath(fileURL) : 'a page';
  const runs = [];
  return {
    name: 'ow-run-markers',
    options: { position: true },
    html(node, ctx) {
      const m = node.value.trim().match(MARKER_LINE);
      if (!m) return;
      const line = node.position?.start?.line ?? '?';
      const parent = ctx.parent(node);
      const prev = parent?.children[ctx.indexOf(node) - 1];
      if (parent?.type !== 'root' || prev?.type !== 'code' || prev.position?.end?.line !== line - 1) {
        throw new Error(`ow-run: ${where}:${line}: a run marker with no code block right above it`);
      }
      let req;
      try { req = parseMarker(m[1]); } catch (e) { throw new Error(`ow-run: ${where}:${line}: ${e.message}`); }
      runs.push({ marker: node, code: prev, req });
    },
    after(root, ctx) {
      if (!runs.length) return;
      const p = practice();
      runs.forEach((r, n) => {
        ctx.setProperty(r.code, 'meta', `${r.code.meta ? r.code.meta + ' ' : ''}ow-run=${encodeRequest(r.req)}`);
        ctx.replaceNode(r.marker, { type: 'html', value: `<div class="ow-run-panel not-content" data-ow-run-panel="${n}" aria-live="polite"></div>` });
      });
      ctx.insertBefore(runs[0].code, { type: 'html', value: noteHtml(p.reset_utc) });
      const v = createHash('sha256').update(readFileSync(new URL('public/assets/ow-run.js', ROOT))).digest('hex').slice(0, 10);
      ctx.appendChild(root, {
        type: 'html',
        value: `<script type="module" src="/assets/ow-run.js?v=${v}" data-ow-run data-key="${esc(p.key)}" data-pin="${esc(p.pin)}" data-reset="${esc(p.reset_utc)}" data-rate="${rate()}"></script>`,
      });
    },
  };
}

// The Astro integration: adds runMarkers to the configured Sätteri processor.
export default function owRun() {
  return {
    name: 'ow-run',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const p = config.markdown?.processor;
        if (p?.name !== 'satteri' || !Array.isArray(p.options?.mdastPlugins)) {
          throw new Error('ow-run: the Markdown processor is not Sätteri, so the run markers would not become Run buttons');
        }
        p.options.mdastPlugins.push(runMarkers);
      },
    },
  };
}
