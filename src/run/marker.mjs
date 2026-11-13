// The run marker: a request declared beside a code sample, never parsed out of it.
//
// It sits on the line right after a code block's closing fence, in a .md page:
//   <!-- run: METHOD PATH [Header-Name:value ...] [JSON body] -->
// METHOD is GET, POST, PUT, PATCH or DELETE; PATH starts /api/v2/ and may carry a query; each
// header token is a name, a colon and a value with no space (Idempotency-Key:6f1c…); a body, when
// there is one, is the rest of the marker and parses as JSON. The key, the PIN (writes only) and
// Content-Type (when there is a body) are the runner's, from contract/practice.json, never the
// marker's.
//
// remark-run.mjs turns each marker into a Run button on its sample (through ec-run.mjs) and an
// answer panel under it; scripts/verify-run.mjs holds each marker to the sample above it;
// scripts/postbuild.mjs drops the marker line from the page's Markdown twin.

export const API_ORIGIN = 'https://www.onlyworlds.com';
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
// the headers the runner sets itself; a marker may not carry them
export const RUNNER_HEADERS = ['api-key', 'api-pin', 'content-type'];

// A whole source line that is a run marker (with its text in group 1).
export const MARKER_LINE = /^<!--\s*run:([\s\S]*?)-->\s*$/;
// Anything that looks like a run marker, in either page form, anywhere: for the checks.
export const MARKER_ANY = /<!--\s*run:[\s\S]*?-->|\{\/\*\s*run:[\s\S]*?\*\/\}/g;

// Parse a marker's text (what follows `run:`). Returns { method, path, headers, body } with
// body undefined when none, or throws an Error saying what is wrong.
export function parseMarker(text) {
  let rest = text.trim();
  const m = rest.match(/^(\S+)\s+(\S+)\s*/);
  if (!m) throw new Error('a run marker needs a method and a path');
  const [, method, path] = m;
  if (!METHODS.includes(method)) throw new Error(`method "${method}" is not one of ${METHODS.join(', ')}`);
  if (!path.startsWith('/api/v2/')) throw new Error(`path "${path}" does not start /api/v2/`);
  rest = rest.slice(m[0].length);
  const headers = {};
  for (;;) {
    if (!rest || rest.startsWith('{') || rest.startsWith('[')) break;
    const h = rest.match(/^([A-Za-z][A-Za-z0-9-]*):(\S+)\s*/);
    if (!h) throw new Error(`cannot read "${rest.slice(0, 40)}" as a header (Name:value) or a JSON body`);
    const name = h[1];
    if (RUNNER_HEADERS.includes(name.toLowerCase())) throw new Error(`header ${name} is the runner's, not the marker's`);
    if (Object.keys(headers).some((k) => k.toLowerCase() === name.toLowerCase())) throw new Error(`header ${name} given twice`);
    headers[name] = h[2];
    rest = rest.slice(h[0].length);
  }
  let body;
  if (rest) {
    try { body = JSON.parse(rest); } catch (e) { throw new Error(`the body is not JSON (${e.message})`); }
    if (method === 'GET' || method === 'DELETE') throw new Error(`a ${method} carries no body`);
  }
  return { method, path, headers, body };
}

// The request as the page carries it: base64url of its JSON, so it sits in an attribute and in
// Expressive Code's meta string without quoting.
export const encodeRequest = (req) => Buffer.from(JSON.stringify(req), 'utf8').toString('base64url');
export const decodeRequest = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
