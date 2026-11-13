// The run marker: a request declared beside a code sample, never parsed out of it.
//
// It sits on the line right after a code block's closing fence, in a .md page:
//   <!-- run: METHOD PATH [API-Key:<demo key>] [Header-Name:value ...] [JSON body] -->
// METHOD is GET, POST, PUT, PATCH or DELETE; PATH starts /api/v2/ and may carry a query; each
// header token is a name, a colon and a value with no space (Idempotency-Key:6f1c…); a body, when
// there is one, is the rest of the marker and parses as JSON.
//
// Which key a Run sends:
//   - API-Key:<demo key> (0000000000 to 0000000009) when the sample reads with that demo key: Run
//     sends it to the world it names, with no PIN. A demo key is read-only, so only a GET may
//     name one;
//   - otherwise the practice world's key, from contract/practice.json, with its PIN on a write
//     (never on a GET).
// Any other API-Key, an API-Pin and Content-Type (sent when there is a body) are the runner's, never
// the marker's.
//
// An id an earlier Run on the same page made: {made:<type>}, in the path or as a whole string in the
// body (POST /api/v2/character {"name": "Sad King Billy", "location": "{made:location}"}). The
// runner fills it with the id of the newest element of that type made by a Run on this page and not
// deleted since with its Delete button; until there is one the button waits, disabled, its label
// naming the create it waits for. The sample shows <type-id> at the same place (<location-id>), and
// an earlier marker on the page must create that type (POST /api/v2/<type>): verify-run holds both.
// A demo-key Run names no made id: what a Run makes is in the practice world.
//
// integration.mjs turns each marker into a Run button on its sample (through ec-run.mjs) and an
// answer panel under it; scripts/verify-run.mjs holds each marker to the sample above it;
// scripts/postbuild.mjs drops the marker line from the page's Markdown twin.

export const API_ORIGIN = 'https://www.onlyworlds.com';
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export const DEMO_KEY = /^000000000\d$/;
// the headers the runner sets itself; a marker may not carry them (API-Key only as a demo key)
export const RUNNER_HEADERS = ['api-key', 'api-pin', 'content-type'];

// Where a Run sends its request, in the words the button and the panel use.
export const BOX = '/docs/getting-started/keys#the-practice-world';
export const DEMO_BOX = '/docs/getting-started/keys#demo-keys';
export const where = (req) => (req.demoKey
  ? { label: 'with the demo key', href: DEMO_BOX }
  : { label: 'on the practice world', href: BOX });

// A whole source line that is a run marker (with its text in group 1).
export const MARKER_LINE = /^<!--\s*run:([\s\S]*?)-->\s*$/;
// Anything that looks like a run marker, in either page form, anywhere: for the checks.
export const MARKER_ANY = /<!--\s*run:[\s\S]*?-->|\{\/\*\s*run:[\s\S]*?\*\/\}/g;

// Parse a marker's text (what follows `run:`). Returns { method, path, headers, body, demoKey },
// body and demoKey undefined when none, or throws an Error saying what is wrong.
export function parseMarker(text) {
  let rest = text.trim();
  const m = rest.match(/^(\S+)\s+(\S+)\s*/);
  if (!m) throw new Error('a run marker needs a method and a path');
  const [, method, path] = m;
  if (!METHODS.includes(method)) throw new Error(`method "${method}" is not one of ${METHODS.join(', ')}`);
  if (!path.startsWith('/api/v2/')) throw new Error(`path "${path}" does not start /api/v2/`);
  rest = rest.slice(m[0].length);
  const headers = {};
  let demoKey;
  for (;;) {
    if (!rest || rest.startsWith('{') || rest.startsWith('[')) break;
    const h = rest.match(/^([A-Za-z][A-Za-z0-9-]*):(\S+)\s*/);
    if (!h) throw new Error(`cannot read "${rest.slice(0, 40)}" as a header (Name:value) or a JSON body`);
    const [, name, value] = h;
    rest = rest.slice(h[0].length);
    if (name.toLowerCase() === 'api-key') {
      if (!DEMO_KEY.test(value)) throw new Error(`API-Key ${value.slice(0, 12)} is not a demo key (0000000000 to 0000000009): only a demo key may be named, the practice key is the runner's`);
      if (demoKey !== undefined) throw new Error('API-Key given twice');
      demoKey = value;
      continue;
    }
    if (RUNNER_HEADERS.includes(name.toLowerCase())) throw new Error(`header ${name} is the runner's, not the marker's`);
    if (Object.keys(headers).some((k) => k.toLowerCase() === name.toLowerCase())) throw new Error(`header ${name} given twice`);
    headers[name] = value;
  }
  if (demoKey !== undefined && method !== 'GET') throw new Error(`a demo key runs only a GET, never a ${method} (a demo key is read-only)`);
  let body;
  if (rest) {
    try { body = JSON.parse(rest); } catch (e) { throw new Error(`the body is not JSON (${e.message})`); }
    if (method === 'GET' || method === 'DELETE') throw new Error(`a ${method} carries no body`);
  }
  if (path.replace(MADE, '').includes('{made')) throw new Error(`path "${path}" holds a {made…} that is not {made:<type>}`);
  for (const s of strings(body)) {
    if (s.includes('{made') && !MADE_WHOLE.test(s)) throw new Error(`the body's "${s.slice(0, 40)}" holds a {made…} that is not a whole string {made:<type>}`);
  }
  const req = demoKey === undefined ? { method, path, headers, body } : { method, path, headers, body, demoKey };
  if (demoKey !== undefined && madeTypes(req).length) throw new Error('a demo-key Run names no {made:…} id: what a Run makes is in the practice world');
  return req;
}

// ---- made ids ---------------------------------------------------------------------------------------
export const MADE = /\{made:([a-z]+)\}/g;
const MADE_WHOLE = /^\{made:([a-z]+)\}$/;
// what the sample shows in a made id's place
export const holder = (type) => `<${type}-id>`;
export const waitLabel = (type) => `Run after the ${type[0].toUpperCase()}${type.slice(1)} above`;
// every string in a JSON value, keys included, in document order
function strings(v) {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => [k, ...strings(x)]);
  return [];
}
// The element types a request's made ids name, each once, path first, then the body in order.
export function madeTypes(req) {
  const all = [...req.path.matchAll(MADE)].map((m) => m[1]);
  for (const s of strings(req.body)) { const m = s.match(MADE_WHOLE); if (m) all.push(m[1]); }
  return [...new Set(all)];
}
// The type a marker creates (POST /api/v2/<type>, no query), or undefined.
export const createdType = (req) => (req.method === 'POST' ? req.path.match(/^\/api\/v2\/([a-z]+)$/)?.[1] : undefined);
// A body with each made id as the sample shows it.
export const withHolders = (v) => (typeof v === 'string' ? v.replace(MADE_WHOLE, (_, t) => holder(t))
  : Array.isArray(v) ? v.map(withHolders)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withHolders(x)])) : v);
// The type of the first made id a Run waits for while none is made yet: of the types it names, the
// one whose first create on the page comes first. reqs: the page's requests, in order.
export function firstWait(req, reqs) {
  const at = (t) => reqs.findIndex((r) => createdType(r) === t);
  return madeTypes(req).filter((t) => at(t) >= 0).sort((a, b) => at(a) - at(b))[0];
}

// The request as the page carries it: base64url of its JSON, so it sits in an attribute and in
// Expressive Code's meta string without quoting.
export const encodeRequest = (req) => Buffer.from(JSON.stringify(req), 'utf8').toString('base64url');
export const decodeRequest = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
