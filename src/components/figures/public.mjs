// The public view figure's data and words: what a stranger reads of an open world. What the public
// reader leaves out, the /w/ pages and the graph, what is never served and the two 404s come from
// the platform's own public reader through the snapshot contract/public.json
// (scripts/gen_public.mjs, read from keel's code); the keyless routes from the API's own document
// through contract/callers.json (scripts/gen_callers.mjs): the operations that list no credential
// beside a key. The words no source holds sit here, each one a phrase of the page's own source,
// which scripts/verify-figures.mjs holds them to. Pure: the page (PublicView.astro) and its Markdown
// twin (scripts/postbuild.mjs) read the same thing.
import { credentialsOf, PREFIX } from './callers.mjs';

// Each removal the reader makes, by the snapshot's key, in the order drawn.
export const REMOVED = {
  hidden: 'hidden elements',
  proposed: 'elements still proposed',
  room: "a parlor's room elements",
};
// A mark's value that keeps an element in: the proposal mark removes it with any value but this or an empty one
// (keel PR 329: an empty mark, "", whitespace, [] or {}, reads as absent).
export const SETTLED = { proposed: 'null' };
// The /w/ routes' placeholders as the page writes them.
export const PLACE = { addr: 'address', type_slug: 'category', element_id: 'element id' };
export const WAYS = { api: 'Keyless API reads', page: 'The public page', graph: 'The graph' };
export const PAGE_VIEWS = ['world_page', 'element_page'];
export const GRAPH_VIEW = 'graph_page';

export function publicView(snap, callers, types, labels) {
  const keys = Object.keys(REMOVED);
  const got = snap.removed.map((r) => r.key);
  if (got.length !== keys.length || keys.some((k) => !got.includes(k))) throw new Error(`public: the reader removes ${got.join(', ')}; the figure draws ${keys.join(', ')}`);
  const removed = keys.map((k) => ({ key: k, say: REMOVED[k], mark: snap.removed.find((r) => r.key === k).mark, settled: SETTLED[k] ?? null }));
  // the keyless reads: an operation that lists no credential beside a key; a route all the
  // categories have is drawn once, as {type}
  const typeSet = new Set(types);
  const byRoute = new Map();
  for (const op of callers.operations) {
    const c = credentialsOf(op);
    if (!(c.creds.includes('none') && c.creds.length > 1)) continue;
    const [method, path] = op;
    const seg = path.slice(PREFIX.length + 1).split('/')[0];
    const folded = typeSet.has(seg) ? `${PREFIX}/{type}${path.slice(PREFIX.length + 1 + seg.length)}` : path;
    const k = `${method} ${folded}`;
    if (!byRoute.has(k)) byRoute.set(k, []);
    byRoute.get(k).push([method, path]);
  }
  const routes = [];
  for (const [k, ops] of byRoute) {
    if (ops.length === types.length) { const [method, path] = k.split(' '); routes.push({ method, path, ops: ops.length }); }
    else for (const [method, path] of ops) routes.push({ method, path, ops: 1 });
  }
  if (!routes.length) throw new Error('public: contract/callers.json lists no keyless read');
  const fileOpen = callers.operations.filter((op) => op[0] === 'GET' && /\/files(\/|$)/.test(op[1]) && credentialsOf(op).creds.includes('none'));
  if (fileOpen.length) throw new Error(`public: ${fileOpen[0][0]} ${fileOpen[0][1]} takes no key; the figure says files are never served`);
  const members = callers.operations.find((op) => op[0] === 'GET' && op[1] === `${PREFIX}/members`);
  if (!members || credentialsOf(members).creds.includes('none')) throw new Error('public: GET /api/v2/members is missing or takes no key; the figure says the roster is never served');
  if (snap.world_body.owner_character !== null) throw new Error('public: the keyless world body keeps owner_character; the figure says the roster is never served');
  if (snap.tombstones) throw new Error('public: the public reader meets a 410 for a deleted element; the figure says a 404');
  const route = (view) => {
    const p = snap.pages.find((x) => x.view === view)?.path;
    if (!p) throw new Error(`public: the snapshot has no route for ${view}`);
    return p.replace(/<([a-z_]+)>/g, (m, n) => { if (!PLACE[n]) throw new Error(`public: ${p} has a placeholder ${n} the figure does not name`); return `<${PLACE[n]}>`; });
  };
  const idPage = `/w/<world id>`;
  if (!snap.address.id_first) throw new Error('public: the page\'s address is not read as an id first');
  const left = snap.graph_left_out.map((t) => {
    if (!labels[t]) throw new Error(`public: the graph leaves out ${t}, which is no category`);
    return { type: t, label: labels[t] };
  }).sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
  return {
    readAt: snap.read_at,
    types: types.length,
    callersAt: callers.read_at,
    removed,
    absent: snap.absent_from,
    api: routes,
    pages: PAGE_VIEWS.map(route),
    idPage,
    graph: route(GRAPH_VIEW),
    left,
    misses: snap.misses,
  };
}

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

// The figure's sentences, shared by the page and the twin; code() wraps code. Each is a phrase of
// the page's own source (verify-figures holds them there).
export function publicWords(data, code = (s) => `\`${s}\``) {
  return {
    title: 'An open world, read by a stranger',
    lead: 'Public reading and the public page are off for every world until its owner turns them on.',
    all: 'All the elements',
    gone: 'Missing with them: the links to them and their counts.',
    reads: 'What a stranger reads',
    readsNote: 'Every other element, with its fields, links and pictures: a picture is public by its own link.',
    ways: 'Three ways in',
    apiNote: `No ${code('API-Key')} header, and ${code('?world=<world id>')}; ${code('{type}')} is any of the ${data.types} categories.`,
    pageNote: `${code(data.idPage)} answers too, whatever address the owner chose.`,
    graphNote: `Every public element as a point and every link between two as a line; ${list(data.left.map((l) => l.label))} are left out.`,
    never: 'Never shown',
    nevers: [
      { key: 'files', say: 'files', note: 'no route that reads a file takes a request with no key' },
      { key: 'roster', say: 'the roster of who plays whom', note: `${code('owner_character')} is always ${code('null')}, and ${code('/members')} takes a key` },
      { key: 'deleted', say: 'deleted elements', note: `a ${code(String(data.misses.element.status))}, never ${code('410')}; the public reads no tombstones` },
    ],
    none: 'One answer for nothing',
    noneNote: `A mistyped address, a world whose page is off, and a private world get the same page, status ${code(String(data.misses.world.status))}: "${data.misses.world.head}."`,
    noneElement: `Under a live page, a hidden, deleted or unknown element gets one other, also ${code(String(data.misses.element.status))}: "${data.misses.element.text}"`,
    caption: `Generated from the platform's own public reader, the one the keyless API, the public page and the graph share, and the API's own document (${code('openapi.json')}), as read on ${data.callersAt}.`,
  };
}

export const markSay = (r, code = (s) => `\`${s}\``) => (r.mark ? (r.settled ? `${code(r.mark)} with a value that is neither ${code(r.settled)} nor empty` : code(r.mark)) : '');
export const routeSay = (r) => `${r.method} ${r.path.slice(PREFIX.length)}`;

export function publicMarkdown(snap, callers, types, labels) {
  const data = publicView(snap, callers, types, labels);
  const w = publicWords(data);
  const c = (s) => `\`${s}\``;
  return [
    `**${w.title}.** ${w.lead}`,
    '',
    `**Removed from ${w.all.toLowerCase()}.** ${w.gone}`,
    '',
    ...data.removed.map((r) => `- ${r.say}${r.mark ? ` (${markSay(r)})` : ''}`),
    '',
    `**${w.reads}.** ${w.readsNote}`,
    '',
    `**${w.ways}.**`,
    '',
    `- ${WAYS.api}: ${data.api.map((r) => `${c(`${r.method} ${r.path}`)}${r.ops > 1 ? ` (×${r.ops})` : ''}`).join(', ')}. ${w.apiNote}`,
    `- ${WAYS.page}: ${data.pages.map(c).join(', ')}. ${w.pageNote}`,
    `- ${WAYS.graph}: ${c(data.graph)}. ${w.graphNote}`,
    '',
    `**${w.never}.**`,
    '',
    ...w.nevers.map((n) => `- ${n.say}: ${n.note}`),
    '',
    `**${w.none}.** ${w.noneNote} ${w.noneElement}`,
    '',
    w.caption,
  ].join('\n');
}
