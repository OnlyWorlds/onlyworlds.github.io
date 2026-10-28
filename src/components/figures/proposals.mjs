// The proposals figure's data and words: a proposal's life, from the propose to its accept, decline
// or withdraw, what the switch turns an AI seat's writes into, and the queue that lists both. Every
// route, method, status, refusal, state, value, decision and kind comes from the API's own document
// through the snapshot contract/proposals.json (scripts/gen_proposals.mjs). The words no source holds
// sit here, each one a phrase of the page's own source, which scripts/verify-figures.mjs holds them
// to, but the few in DOC_SAYS, which are the document's own and held to it. Pure: the page
// (ProposalLife.astro) and its Markdown twin (scripts/postbuild.mjs) read the same thing.

export const HEADS = {
  title: "A proposal's life",
  lead: "a change to an element that waits for a keeper's word",
  undecided: 'undecided',
  switchHead: 'AI seats propose, a person accepts',
  queueHead: 'The queue',
};
// What each part says, in the page's words.
export const SAYS = {
  propose: { who: 'any member whose key reads the element', note: 'the element does not change' },
  open: "waits for a keeper's word",
  lapsed: 'can still be accepted or declined',
  keeper: 'the owner or a co-builder',
  pin: 'with the PIN',
  withdraw: { who: 'the proposer' },
  accepted: ['writes the element as their own write', 'the feed gets one row'],
  declined: ['the element does not change'],
  readOnly: 'read-only on the API',
  neverHeld: "a person's key is never held by the switch",
  existing: 'an existing element',
  linkEdit: 'a link edit',
  becomes: 'becomes a proposal instead of a write',
  newElement: 'a new element',
  created: 'created and carries',
  waits: 'waits in the queue as a',
  decisions: { accept: 'clears the mark', decline: 'deletes the element' },
  kinds: 'kinds of row, told apart by',
  theDefault: 'the default',
  noFeed: 'a proposal never enters the feed; an accept\'s write does',
};
// The document's own words, each held to the description it is quoted from.
export const DOC_SAYS = { lapse: 'once `expires` has passed', gone: 'the row goes' };
// The refusals the figure draws, each found in a route's answers by its words there, said in the page's words.
export const REFUSALS = [
  { status: '403', find: /\bown_proposal\b/, code: 'own_proposal', says: 'their own proposal' },
  { status: '409', find: /\bstale_proposal\b/, code: 'stale_proposal', says: 'a proposed field moved since: nothing is written' },
  { status: '422', find: /\balready accepted or declined\b/, code: null, says: 'already decided' },
];
const NUMBERS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (n) => (n < NUMBERS.length ? NUMBERS[n][0].toUpperCase() + NUMBERS[n].slice(1) : String(n));
export const list = (xs, and = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}`);

export function proposalView(snap) {
  const R = snap.routes;
  const states = snap.proposal.state.enum;
  const pinned = (r) => r.security.length > 0 && r.security.every((alt) => alt.includes('ApiPin'));
  const ok = (r) => Object.keys(r.responses).find((s) => /^2\d\d$/.test(s));
  // each decision's state: the one its route says the row turns
  const turns = (r) => r.description?.match(/\b[Tt]he row turns ([a-z]+)\b/)?.[1];
  const action = (name, outcome) => {
    const r = R[name];
    if (!ok(r)) throw new Error(`proposals: ${name} answers no 2xx`);
    if (outcome && !states.includes(outcome)) throw new Error(`proposals: ${name} turns the row ${outcome}, not a state`);
    const refusals = REFUSALS.filter((x) => x.find.test(r.responses[x.status] ?? ''));
    return { action: name, method: r.method.toUpperCase(), path: r.path, status: ok(r), pin: pinned(r), outcome, refusals };
  };
  const accept = action('accept', turns(R.accept));
  const decline = action('decline', turns(R.decline));
  const withdraw = action('withdraw', null);
  if (!accept.outcome || !decline.outcome) throw new Error('proposals: accept or decline no longer says which state the row turns');
  if (!R.withdraw.description?.includes(DOC_SAYS.gone)) throw new Error(`proposals: withdraw no longer says "${DOC_SAYS.gone}"`);
  // undecided: every state no decision turns the row to; the first is where a proposal starts
  const undecided = states.filter((s) => s !== accept.outcome && s !== decline.outcome);
  if (undecided.length !== 2) throw new Error(`proposals: ${undecided.join(', ')} undecided, not open and one lapsed state`);
  const [open, lapsed] = undecided;
  const sd = snap.proposal.state.description ?? '';
  if (!sd.includes(`${lapsed} ${DOC_SAYS.lapse}`) || !/it may still be accepted or declined/.test(sd)) throw new Error(`proposals: the state ${lapsed} is not the one past expires that may still be decided: "${sd}"`);
  // expires: the propose body's words
  const ex = snap.expires.description.match(/\((\d+) to (\d+) days out; default (\d+) days\)/);
  if (!ex || snap.expires.format !== 'date-time') throw new Error(`proposals: expires reads "${snap.expires.description}"`);
  const propose = { action: 'propose', method: R.propose.method.toUpperCase(), path: R.propose.path, status: ok(R.propose), expires: { min: Number(ex[1]), max: Number(ex[2]), def: Number(ex[3]) } };
  // the switch: the writes on an existing element that answer 202, and the review of a new one
  const proposed = snap.switch.proposed.map((k) => k.split(' '));
  const existing = [];
  for (const [m, p] of proposed) {
    if (p === '/api/v2/{type}/{id}') existing.push(m.toUpperCase());
    else if (/^\/api\/v2\/\{type\}\/\{id\}\/links\//.test(p) && m === 'post') existing.push('link');
    else throw new Error(`proposals: ${m.toUpperCase()} ${p} answers 202, which the figure does not draw`);
  }
  const order = ['PATCH', 'PUT', 'link'];
  existing.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const rv = R.review;
  for (const d of rv.decisions) if (!(d in SAYS.decisions)) throw new Error(`proposals: the review takes ${d}, which the figure has no words for`);
  if (!/writes the mark null/.test(rv.description ?? '') || !/deletes the element/.test(rv.description ?? '')) throw new Error('proposals: the review no longer says accept writes the mark null and decline deletes the element');
  if (!/x_review_proposed/.test(snap.new_element.description ?? '')) throw new Error('proposals: the queue\'s new_element row no longer names x_review_proposed');
  const review = { method: rv.method.toUpperCase(), path: rv.path, status: ok(rv), pin: pinned(rv), decisions: rv.decisions };
  // the queue
  const q = R.queue;
  const kinds = [snap.proposal.kind[0], snap.new_element.kind[0]];
  const queue = { method: q.method.toUpperCase(), path: q.path, states: q.state.schema.enum, def: q.state.schema.default ?? null, kinds, newStates: snap.new_element.state.enum };
  for (const s of queue.newStates) if (!queue.states.includes(s)) throw new Error(`proposals: a new element reads ${s}, which the queue does not filter on`);
  return {
    readAt: snap.read_at,
    types: snap.types,
    states,
    open,
    lapsed,
    propose,
    acts: [accept, decline, withdraw],
    field: snap.switch.field,
    readOnly: snap.switch.readOnly,
    existing,
    newStates: snap.new_element.state.enum,
    review,
    queue,
  };
}

// The figure's sentences, shared by the page and the twin; code() wraps code.
export function proposalWords(data, code = (s) => `\`${s}\``) {
  const who = (a) => (a.action === 'withdraw' ? SAYS.withdraw.who : `${SAYS.keeper}${a.pin ? ` ${SAYS.pin}` : ''}`);
  const all = data.queue.states.filter((s) => !data.states.includes(s));
  const listed = [...data.queue.newStates, ...all];
  const never = data.queue.states.filter((s) => !listed.includes(s));
  return {
    route: (r) => `${r.method} ${r.path}`,
    who,
    expires: `${code('expires')}: ${data.propose.expires.min} to ${data.propose.expires.max} days from now, default ${data.propose.expires.def} days`,
    lapse: DOC_SAYS.lapse.replace(/`([^`]+)`/g, (_, c) => code(c)),
    refusal: (x) => `${x.code ? `${x.status} ${x.code}` : x.status}`,
    existingSays: data.existing.map((m) => (m === 'link' ? SAYS.linkEdit : m)),
    reviewWho: `${SAYS.keeper}${data.review.pin ? ` ${SAYS.pin}` : ''}`,
    marked: `a marked element is listed under ${list(listed.map(code))}, never ${list(never.map(code), 'or')}`,
    kinds: `${count(data.queue.kinds.length).toLowerCase()} ${SAYS.kinds} ${code('kind')}`,
    caption: `${count(data.states.length)} states, the Proposal's ${code('state')}; every route is the same on all ${data.types} element types. Generated from the API's own document (${code('openapi.json')}): the proposal routes, the queue and the schemas they answer, as read on ${data.readAt}.`,
  };
}

export function proposalsMarkdown(snap) {
  const d = proposalView(snap);
  const w = proposalWords(d);
  const c = (s) => `\`${s}\``;
  const act = (a) => `- ${c(a.action)} (${w.who(a)}): ${c(w.route(a))}, ${c(a.status)}. ${a.outcome ? `The row turns ${c(a.outcome)}: ${SAYS[a.outcome].join('; ')}` : `${DOC_SAYS.gone[0].toUpperCase()}${DOC_SAYS.gone.slice(1)}`}.${a.refusals.length ? ` Refused: ${a.refusals.map((x) => `${c(w.refusal(x))} ${x.says}`).join('; ')}.` : ''}`;
  return [
    `**${HEADS.title}:** ${HEADS.lead}.`,
    '',
    `- ${c(d.propose.action)} (${SAYS.propose.who}): ${c(w.route(d.propose))}, ${c(d.propose.status)}; ${SAYS.propose.note}. ${w.expires}.`,
    `- ${c(d.open)}: ${SAYS.open}.`,
    `- ${c(d.lapsed)}: ${w.lapse}; ${SAYS.lapsed}.`,
    '',
    `From ${c(d.open)} or ${c(d.lapsed)} (${HEADS.undecided}):`,
    '',
    ...d.acts.map(act),
    '',
    `**${HEADS.switchHead}** (${c(d.field)}, ${SAYS.readOnly}; ${SAYS.neverHeld}):`,
    '',
    `- ${SAYS.existing}: ${list(w.existingSays.map((m) => (m === SAYS.linkEdit ? m : c(m))), 'or')} ${SAYS.becomes}, ${c('202')}, the proposal ${c(d.open)} as above.`,
    `- ${SAYS.newElement}: ${SAYS.created} ${c('x_review_proposed')}, ${SAYS.waits} ${c(d.queue.kinds[1])} row (${list(d.newStates.map(c), 'or')}); ${c(w.route(d.review))} (${w.reviewWho}): ${d.review.decisions.map((x) => `${c(x)} ${SAYS.decisions[x]}`).join(', ')}.`,
    '',
    `**${HEADS.queueHead}:** ${c(w.route(d.queue))}, ${c('state')} ${list(d.queue.states.map((s) => (s === d.queue.def ? `${c(s)} (${SAYS.theDefault})` : c(s))), 'or')}; ${w.kinds}: ${list(d.queue.kinds.map(c))}; ${w.marked}. ${SAYS.noFeed[0].toUpperCase()}${SAYS.noFeed.slice(1)}.`,
    '',
    w.caption,
  ].join('\n');
}
