// The credentials figure's data: the API's operations by route family and by the credential each
// accepts, from the API's own document through the snapshot contract/callers.json
// (scripts/gen_callers.mjs). Pure: the caller passes the snapshot and the 22 category names in, so
// the page (ApiCallers.astro) and its Markdown twin (scripts/postbuild.mjs) read the same thing.
// scripts/verify-figures.mjs recounts the built figure from the snapshot with code of its own.
//
// An operation counts under every credential its security lists. A route family is the path's
// first segment after /api/v2/; the 22 category names fold into one family, {type}. A route that
// all 22 categories have is shown once, as {type}, with its count.

// The four credentials, in the order drawn. The words are the docs' own: "Key alone" and "Key and
// PIN" are the Reads and Writes cells of the key types table on Keys and PINs, "Account token" its
// section; "No key" is how the API overview's resource table marks a route that takes none.
export const CREDENTIALS = [
  { key: 'none', label: 'No key' },
  { key: 'key', label: 'Key alone' },
  { key: 'keypin', label: 'Key and PIN' },
  { key: 'account', label: 'Account token' },
];

// Each security alternative the document can list, as its scheme names sorted, and what it is.
// SessionToken is the app sign-in's X-Session-Token, which Keys and PINs says an account route takes
// in place of the account token: it is no column of its own, and an operation listing it without
// AccountToken fails the build. Any other alternative fails the build too, so a new credential is
// never drawn under an old name.
const ALTERNATIVES = { '': 'none', ApiKey: 'key', 'ApiKey ApiPin': 'keypin', AccountToken: 'account', SessionToken: 'session' };

export const PREFIX = '/api/v2';
const cp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function credentialsOf(op) {
  const [method, path, alts] = op;
  // null: the operation states no security (and the document none at its top); []: it lists none.
  if (alts === null) return { creds: ['none'], declared: 'absent', session: false };
  if (!alts.length) return { creds: ['none'], declared: 'empty', session: false };
  const got = new Set();
  for (const a of alts) {
    const k = ALTERNATIVES[a.join(' ')];
    if (!k) throw new Error(`callers: ${method} ${path} lists the credential ${JSON.stringify(a)}, which the figure does not draw`);
    got.add(k);
  }
  if (got.has('session') && !got.has('account')) throw new Error(`callers: ${method} ${path} takes a session token without an account token`);
  return { creds: CREDENTIALS.map((c) => c.key).filter((k) => got.has(k)), declared: 'list', session: got.has('session') };
}

export function apiCallers(snap, types) {
  const typeSet = new Set(types);
  const fams = new Map();
  for (const op of snap.operations) {
    const [method, path] = op;
    if (!path.startsWith(`${PREFIX}/`)) throw new Error(`callers: ${path} is not under ${PREFIX}/`);
    const seg = path.slice(PREFIX.length + 1).split('/')[0];
    const name = typeSet.has(seg) ? '{type}' : seg;
    const c = credentialsOf(op);
    if (!fams.has(name)) fams.set(name, { name, label: `/${name}`, total: 0, cells: Object.fromEntries(CREDENTIALS.map((x) => [x.key, 0])), groups: new Map() });
    const f = fams.get(name);
    f.total++;
    for (const k of c.creds) f.cells[k]++;
    const gk = `${c.creds.join(' ')}|${c.declared}|${c.session}`;
    if (!f.groups.has(gk)) f.groups.set(gk, { ...c, ops: 0, byRoute: new Map() });
    const g = f.groups.get(gk);
    g.ops++;
    // the route as {type} when its first segment is a category: folded only if all 22 are in this group
    const folded = name === '{type}' ? `${PREFIX}/{type}${path.slice(PREFIX.length + 1 + seg.length)}` : path;
    const rk = `${method} ${folded}`;
    if (!g.byRoute.has(rk)) g.byRoute.set(rk, []);
    g.byRoute.get(rk).push([method, path]);
  }
  const bits = (g) => CREDENTIALS.map((c) => (g.creds.includes(c.key) ? '1' : '0')).join('');
  const families = [...fams.values()].map((f) => {
    const groups = [...f.groups.values()].map((g) => {
      const routes = [];
      for (const [rk, ops] of g.byRoute) {
        if (ops.length === types.length && f.name === '{type}') {
          const [method, path] = rk.split(' ');
          routes.push({ method, path, shown: path.slice(PREFIX.length), ops: ops.length });
        } else {
          for (const [method, path] of ops) routes.push({ method, path, shown: path.slice(PREFIX.length), ops: 1 });
        }
      }
      routes.sort((a, b) => cp(a.shown, b.shown) || cp(a.method, b.method));
      return { creds: g.creds, declared: g.declared, session: g.session, ops: g.ops, routes };
    });
    groups.sort((a, b) => cp(bits(b), bits(a)) || cp(a.declared, b.declared) || Number(a.session) - Number(b.session));
    return { name: f.name, label: f.label, total: f.total, cells: f.cells, groups };
  });
  families.sort((a, b) => b.total - a.total || cp(a.label, b.label));
  const all = families.flatMap((f) => f.groups);
  const sum = (pick) => all.reduce((n, g) => n + (pick(g) ? g.ops : 0), 0);
  return {
    operations: snap.operations.length,
    readAt: snap.read_at,
    types: types.length,
    families,
    totals: Object.fromEntries(CREDENTIALS.map((c) => [c.key, families.reduce((n, f) => n + f.cells[c.key], 0)])),
    // keyless: no key listed beside a key or an account token (the keyless reads of an open world)
    keyless: sum((g) => g.creds.includes('none') && g.creds.length > 1),
    absent: sum((g) => g.declared === 'absent'),
    session: sum((g) => g.session),
  };
}

const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;

// The figure's sentences, shared by the page and the twin; code() wraps code, link() a link.
export function callerWords(data, code = (s) => `\`${s}\``, link = (text, href) => `[${text}](${href})`) {
  return {
    head: `${n(data.operations, 'operation', 'operations')} in ${n(data.families.length, 'route family', 'route families')}.`,
    lead: `Each counts under every credential the API document lists for it. ${data.keyless} take no key as well as a key or an account token: the ${link('keyless reads', '/docs/development/api/public#the-keyless-reads')} of a world open to anyone.`,
    none: `the document lists no credential${data.absent ? `; ${n(data.absent, 'operation', 'operations')}, marked, ${data.absent === 1 ? 'states' : 'state'} no security at all` : ''}.`,
    key: `as the document declares it: a legacy 10-digit key sends its PIN on every read of a world that has one (${link('Keys and PINs', '/docs/getting-started/keys#the-pin')}).`,
    account: `${data.session} of these also take an app's ${code('X-Session-Token')} in its place (${link('Account tokens', '/docs/getting-started/keys#account-tokens')}).`,
    caption: `Generated from the API's own document (${code('openapi.json')}): the security each operation lists, as read on ${data.readAt}. Paths are under ${code(`${PREFIX}/`)}; ${code('{type}')} is any of the ${data.types} element types.`,
  };
}

// The marks a group of routes can carry beside its credentials.
export const ABSENT_MARK = 'states no security';
export const SESSION_MARK = (code = (s) => `\`${s}\``) => `or ${code('X-Session-Token')}`;

export const routeText =(r, code = (s) => `\`${s}\``) => `${code(`${r.method} ${r.shown}`)}${r.ops > 1 ? ` (×${r.ops})` : ''}`;
export const credText = (g) => g.creds.map((k) => CREDENTIALS.find((c) => c.key === k).label).join(', ');

export function apiCallersMarkdown(snap, types) {
  const data = apiCallers(snap, types);
  const w = callerWords(data);
  const head = `| Routes | ${CREDENTIALS.map((c) => c.label).join(' | ')} | All |`;
  const rows = data.families.map((f) => `| \`${f.label}\` | ${CREDENTIALS.map((c) => f.cells[c.key] || '').join(' | ')} | ${f.total} |`);
  const groups = data.families.flatMap((f) => f.groups.map((g) => {
    const note = [g.declared === 'absent' && ABSENT_MARK, g.session && SESSION_MARK()].filter(Boolean).join('; ');
    return `- **\`${f.label}\`**, ${credText(g)}${note ? ` (${note})` : ''}: ${g.routes.map((r) => routeText(r)).join(', ')}`;
  }));
  return [
    `**${w.head}** ${w.lead}`,
    '',
    head,
    `|:--|${CREDENTIALS.map(() => '--:').join('|')}|--:|`,
    ...rows,
    `| All | ${CREDENTIALS.map((c) => data.totals[c.key]).join(' | ')} | ${data.operations} |`,
    '',
    'Each route, by the credentials it takes:',
    '',
    ...groups,
    '',
    `**No key**: ${w.none} **Key alone**, ${w.key} **Account token**: ${w.account}`,
    '',
    w.caption,
  ].join('\n');
}
