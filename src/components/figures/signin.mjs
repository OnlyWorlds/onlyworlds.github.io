// The sign-in figure's data and words: the four steps of Sign in with OnlyWorlds as hops between
// the tool, the person's browser and onlyworlds.com. The routes, parameters, fields, the code's
// lifetime and the token's prefix come from the API's own document through the snapshot
// contract/signin.json (scripts/gen_signin.mjs); the words no document holds sit here. Pure: the
// page (SigninSteps.astro) and its Markdown twin (scripts/postbuild.mjs) read the same thing.
// scripts/verify-figures.mjs holds the built figure to the snapshot and to the page's own tables.

// What keel's answering page does that the document does not say in fields: a refused request is
// a 400 page there, the code goes back in a 302, and Cancel goes back with this error.
// gen_signin.mjs holds the three to keel's code.
export const REFUSED_STATUS = 400;
export const REDIRECT_STATUS = 302;
export const CANCEL_ERROR = 'access_denied';

export const LANES = [
  { key: 'tool', label: 'The tool', short: 'the tool' },
  { key: 'browser', label: "The person's browser", short: 'the browser' },
  { key: 'site', label: 'onlyworlds.com', short: 'onlyworlds.com' },
];

export function signinSteps(snap) {
  const { authorize: a, token: t } = snap;
  if (!a?.params?.length || !t?.body?.length || !t?.answer?.length) throw new Error('signin: contract/signin.json lacks the authorize parameters, the token body or its answer');
  if (!Array.isArray(t.security)) throw new Error(`signin: POST ${t.path} states no security in the snapshot; the figure draws only a listed one`);
  // [] lists no credential; the figure says so, and would say nothing it cannot read
  if (t.security.length && !t.security.some((alt) => !alt || !Object.keys(alt).length)) throw new Error(`signin: POST ${t.path} takes a credential (${JSON.stringify(t.security)}); the figure draws it as taking none`);
  const path = new URL(a.url).pathname;
  const query = (pairs) => `redirect_uri?${pairs.map(([k, v]) => `${k}=${v}`).join('&')}`;
  return {
    readAt: snap.read_at,
    seconds: t.code_seconds,
    steps: [
      {
        name: 'Send',
        hops: [
          { hop: 'send', from: 'tool', to: 'browser', say: 'sends the browser to sign in' },
          {
            hop: 'authorize', from: 'browser', to: 'site', method: 'GET', path, host: new URL(a.url).host,
            params: a.params.map((p) => (p === 'code_challenge_method' ? { name: p, value: a.method } : { name: p })),
          },
        ],
      },
      {
        name: 'Ask',
        box: { lane: 'site', from: 'browser', lines: ['The person signs in, if they are not.', 'No consent yet for this tool: Continue or Cancel.'] },
        refused: { status: REFUSED_STATUS, say: 'page, no redirect' },
      },
      {
        name: 'Return',
        hops: [
          { hop: 'redirect', from: 'site', to: 'browser', status: REDIRECT_STATUS, say: 'redirects the browser' },
          {
            hop: 'return', from: 'browser', to: 'tool',
            back: a.back, address: query(a.back.map((k) => [k, '…'])),
            cancel: { error: CANCEL_ERROR, address: query([['error', CANCEL_ERROR], ['state', '…']]) },
          },
        ],
        box: { lane: 'tool', check: 'state' },
      },
      {
        name: 'Trade',
        hops: [
          { hop: 'token', from: 'tool', to: 'site', method: t.method, path: t.path, credential: 'none', fields: t.body },
          { hop: 'answer', from: 'site', to: 'tool', status: 200, fields: t.answer, prefix: t.prefix },
        ],
      },
    ],
  };
}

const lane = (k) => LANES.find((l) => l.key === k);
export const who = (h) => `${lane(h.from).short} → ${lane(h.to).short}`;

// The figure's sentences, shared by the page and the twin; code() wraps code.
export function signinWords(data, code = (s) => `\`${s}\``) {
  return {
    life: `the code: ${data.seconds} seconds, one exchange`,
    noCredential: 'no credential',
    caption: `Generated from the API's own document (${code('openapi.json')}), as read on ${data.readAt}: the authorize page's address and parameters, the token route, its fields and the code's lifetime.`,
  };
}

export function signinMarkdown(snap) {
  const data = signinSteps(snap);
  const w = signinWords(data);
  const c = (s) => `\`${s}\``;
  const [send, ask, ret, trade] = data.steps;
  const auth = send.hops[1], back = ret.hops[1], tok = trade.hops[0], ans = trade.hops[1];
  const param = (p) => c(p.value ? `${p.name}=${p.value}` : p.name);
  return [
    `1. **${send.name}.** The tool sends the browser to ${c(`${auth.method} ${auth.path}`)} on ${auth.host} with ${auth.params.map(param).join(', ')}.`,
    `2. **${ask.name}.** ${ask.box.lines.join(' ')} A refused request gets a ${c(String(ask.refused.status))} ${ask.refused.say}.`,
    `3. **${ret.name}.** A ${c(String(ret.hops[0].status))} sends the browser back to ${c(back.address)} (Cancel: ${c(back.cancel.address)}); ${w.life}. The tool checks ${c(ret.box.check)}.`,
    `4. **${trade.name}.** The tool posts ${tok.fields.map(c).join(', ')} to ${c(`${tok.method} ${tok.path}`)}, ${w.noCredential}. The answer, ${c(String(ans.status))}: ${ans.fields.map((f) => (f === 'token' ? `${c(f)} (${c(`${ans.prefix}…`)})` : c(f))).join(', ')}.`,
    '',
    w.caption,
  ].join('\n');
}
