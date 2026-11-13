// The docs' Run buttons: send a page's sample from the browser and show the answer under it.
// Loaded only on a page with a runnable sample (src/run/integration.mjs writes the script tag, with
// the practice world's key and PIN read from contract/practice.json at build time when the page has
// a practice-world Run). Each Run button carries its request (method, path, extra headers, body, and
// a demo key when the sample reads with one) as base64url JSON, declared beside the sample in the
// page source and held to it by scripts/verify-run.mjs. A demo-key Run sends that key and no PIN;
// any other sends the practice world's key, and its PIN on a write only. A request may name an id an
// earlier Run on the page made ({made:<type>}, src/run/marker.mjs): it is filled with the newest
// element of that type made here and not deleted since, and until there is one the button waits,
// disabled, saying which create it waits for.
const API = 'https://www.onlyworlds.com';
const FOLD = 14; // lines shown before "Show the other N lines"
const WAIT = 20; // seconds before a request counts as no answer
const cfg = document.querySelector('script[data-ow-run]');
const KEY = cfg?.dataset.key;
const PIN = cfg?.dataset.pin;
const RESET = cfg?.dataset.reset || '03:00';
const RATE = cfg?.dataset.rate;        // the practice world's limit, per address
const RATE_KEY = cfg?.dataset.rateKey; // a key's, so a demo key's

const ICON = {
  play: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 1.2v9.6L10.5 6z" fill="currentColor"/></svg>',
  wait: '<svg class="ow-spin" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="20 9"/></svg>',
  ok: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 6.4l2.6 2.6L10 3.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  warn: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 1.5L11 10.5H1z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 5v2.5M6 8.8v.2" stroke="currentColor" stroke-width="1.4"/></svg>',
};
const REASON = { 200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content' };

const decode = (s) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))));
};
const make = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const textEl = (tag, cls, text) => {
  const e = make(tag, cls);
  e.textContent = text;
  return e;
};

// ---- made ids (marker.mjs's grammar and words, which verify-run holds on the built page) ----------
const MADE = /\{made:([a-z]+)\}/g;
const MADE_WHOLE = /^\{made:([a-z]+)\}$/;
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings)
  : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...strings(x)]) : []);
const madeTypes = (req) => [...new Set([
  ...[...req.path.matchAll(MADE)].map((m) => m[1]),
  ...strings(req.body).map((s) => s.match(MADE_WHOLE)?.[1]).filter(Boolean),
])];
const createdType = (req) => (req.method === 'POST' ? req.path.match(/^\/api\/v2\/([a-z]+)$/)?.[1] : undefined);
const waitLabel = (t) => `Run after the ${t[0].toUpperCase()}${t.slice(1)} above`;
const madeIds = new Map(); // type -> the ids Runs on this page made and did not delete, oldest first
const newest = (t) => madeIds.get(t)?.at(-1);
const fill = (v) => (typeof v === 'string' ? v.replace(MADE_WHOLE, (_, t) => newest(t))
  : Array.isArray(v) ? v.map(fill)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)])) : v);

const runs = [...document.querySelectorAll('button[data-ow-run]')].map((button) => {
  const wrap = button.closest('.expressive-code');
  let panel = wrap?.nextElementSibling;
  if (!panel?.matches('.ow-run-panel')) panel = null;
  const req = decode(button.dataset.owRun);
  return { button, panel, req, needs: madeTypes(req), where: req.demoKey ? 'with the demo key' : 'on the practice world', ran: false, busy: false };
});
const firstCreate = (t) => runs.findIndex((r) => createdType(r.req) === t);
// the type a Run still waits for: of those it names with none made yet, the one created first on the page
const waitingFor = (run) => run.needs.filter((t) => !newest(t)).sort((a, b) => firstCreate(a) - firstCreate(b))[0];

// ---- the button's states ------------------------------------------------------------------------
let heldUntil = 0;
let holdTimer = null;
function setButton(run, label, icon, disabled, name = `${label} ${run.where}`) {
  run.button.innerHTML = `${ICON[icon]}<span class="ow-run-label">${label}</span>`;
  run.button.setAttribute('aria-label', name);
  run.button.disabled = disabled;
}
function idle(run) {
  const t = waitingFor(run);
  if (t) setButton(run, waitLabel(t), 'play', true, waitLabel(t));
  else setButton(run, run.ran ? 'Run again' : 'Run', 'play', false);
}
// after a create or a delete: each Run that names a made id waits or is ready again (a held one
// keeps its count, which ends in idle)
function refresh() {
  for (const r of runs) if (r.needs.length && !r.busy && (Date.now() >= heldUntil || waitingFor(r))) idle(r);
}

// A 429 holds every Run on the page: the limit counts per address, not per sample.
function hold(seconds) {
  heldUntil = Date.now() + seconds * 1000;
  clearInterval(holdTimer);
  const tick = () => {
    const left = Math.ceil((heldUntil - Date.now()) / 1000);
    for (const r of runs) {
      if (r.busy) continue;
      if (left > 0 && !waitingFor(r)) setButton(r, `Run again in ${left} s`, 'wait', true);
      else idle(r);
    }
    if (left <= 0) { clearInterval(holdTimer); holdTimer = null; }
  };
  tick();
  holdTimer = setInterval(tick, 1000);
}

// ---- the request ----------------------------------------------------------------------------------
async function send(method, path, headers, body, demoKey) {
  const h = { 'API-Key': demoKey || KEY, ...headers };
  if (!demoKey && method !== 'GET') h['API-Pin'] = PIN; // never the PIN on a read, never with a demo key
  const init = { method, headers: h, credentials: 'omit', cache: 'no-store' };
  if (body !== undefined) { h['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
  const t0 = performance.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), WAIT * 1000);
  init.signal = ctl.signal;
  try {
    const res = await fetch(API + path, init);
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }
    return { res, text, json, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { failed: true, timedOut: ctl.signal.aborted, s: Math.max(1, Math.round((performance.now() - t0) / 1000)) };
  } finally {
    clearTimeout(timer);
  }
}

// ---- the panel ------------------------------------------------------------------------------------
function statusRow(r, kind, status, meta) {
  const row = make('div', `ow-st ${kind === 'ok' ? 'ow-ok' : 'ow-err'}`);
  const code = make('span', 'ow-code', ICON[kind === 'ok' ? 'ok' : 'warn']);
  code.append(textEl('span', null, status));
  row.append(code, textEl('span', 'ow-meta', `${meta} · ${r.where}`), make('span', 'ow-act'));
  return row;
}
function copyButton(text) {
  const b = textEl('button', 'ow-b', 'Copy');
  b.type = 'button';
  b.setAttribute('aria-label', 'Copy the answer');
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch { b.textContent = 'Copy failed'; }
    setTimeout(() => { b.textContent = 'Copy'; }, 2000);
  });
  return b;
}
function answerBody(text, kind) {
  const frag = document.createDocumentFragment();
  const pre = make('pre', `ow-json${kind === 'ok' ? '' : ' ow-json-err'}`);
  pre.setAttribute('aria-live', 'off'); // the status row is spoken, not the whole answer
  pre.textContent = text;
  frag.append(pre);
  const lines = text.split('\n').length;
  if (lines > FOLD) {
    pre.classList.add('ow-fold');
    const more = textEl('button', 'ow-foldbar', `Show the other ${lines - FOLD} lines`);
    more.type = 'button';
    more.addEventListener('click', () => {
      const open = pre.classList.toggle('ow-open');
      pre.classList.toggle('ow-fold', !open);
      if (open) pre.tabIndex = 0; else { pre.removeAttribute('tabindex'); pre.scrollTop = 0; }
      more.textContent = open ? `Fold to ${FOLD} lines` : `Show the other ${lines - FOLD} lines`;
    });
    frag.append(more);
  }
  return frag;
}
function note(html) { return make('div', 'ow-note', html); }
function show(run, nodes) {
  const p = run.panel;
  p.setAttribute('role', 'region');
  p.setAttribute('aria-label', run.req.demoKey ? 'Answer to the demo key' : 'Answer from the practice world');
  const box = make('div', 'ow-ans');
  box.append(...nodes);
  p.replaceChildren(box);
}

const noAnswer = (run, r) => [
  statusRow(run, 'err', 'No answer', r.timedOut ? `none within ${WAIT} s` : `after ${r.s} s`),
  note(`${run.req.demoKey ? 'onlyworlds.com' : 'The practice world'} could not be reached from this browser (offline, or a blocker in the way). Nothing was sent twice.`),
];
const pretty = (r) => (r.json !== undefined ? JSON.stringify(r.json, null, 2) : r.text);
function limited(run, r) {
  const after = parseInt(r.res.headers.get('Retry-After'), 10);
  const seconds = Number.isFinite(after) && after > 0 ? after : 60;
  hold(seconds);
  const row = statusRow(run, 'err', `${r.res.status} Too many requests`, `Retry-After ${seconds} s`);
  if (r.text) row.querySelector('.ow-act').append(copyButton(pretty(r)));
  return [
    row,
    ...(r.text ? [answerBody(pretty(r), 'err')] : []),
    note(run.req.demoKey
      ? `A key allows <b>${RATE_KEY} requests a minute</b>, and everyone reading with the demo key shares it. Run is held until the count ends; nothing was lost.`
      : `The practice world allows <b>${RATE} requests a minute per address</b>. Run is held until the count ends; nothing was lost.`),
  ];
}
function words(r, deleting) {
  const s = r.res.status;
  if (r.res.ok) return `${s} ${deleting && s === 204 ? 'Deleted' : REASON[s] || r.res.statusText || ''}`.trim();
  const code = r.json?.error?.code;
  return `${s} ${code || r.res.statusText || 'Error'}`;
}
function meta(r) {
  const bits = [`${r.ms} ms`];
  if (Array.isArray(r.json?.data)) bits.push(`${r.json.data.length} element${r.json.data.length === 1 ? '' : 's'}`);
  if (r.res.headers.get('Idempotent-Replay') === 'true') bits.push('a replay of the first answer');
  return bits.join(' · ');
}

// ---- Run and Delete -------------------------------------------------------------------------------
async function run(r) {
  if (r.busy || Date.now() < heldUntil || waitingFor(r)) return;
  r.busy = true;
  setButton(r, 'Running', 'wait', true);
  const { method, headers, demoKey } = r.req;
  const path = r.req.path.replace(MADE, (_, t) => encodeURIComponent(newest(t)));
  const body = fill(r.req.body);
  const a = await send(method, path, headers, body, demoKey);
  r.busy = false;
  r.ran = true;
  if (a.failed) { idle(r); show(r, noAnswer(r, a)); return; }
  if (a.res.status === 429) { show(r, limited(r, a)); return; }
  idle(r);
  const kind = a.res.ok ? 'ok' : 'err';
  const row = statusRow(r, kind, words(a), meta(a));
  const nodes = [row];
  if (a.text) {
    row.querySelector('.ow-act').append(copyButton(pretty(a)));
    nodes.push(answerBody(pretty(a), kind));
  }
  const made = !demoKey && a.res.status === 201 && (method === 'POST' || method === 'PUT') && a.json?.id && /^[a-z]+$/.test(a.json?.type || '');
  if (made) {
    row.querySelector('.ow-act').append(deleteButton(r, a.json.type, a.json.id));
    madeIds.set(a.json.type, [...(madeIds.get(a.json.type) ?? []), a.json.id]);
    refresh();
  }
  show(r, nodes);
}

function deleteButton(r, type, id) {
  const b = textEl('button', 'ow-b ow-del', 'Delete this element');
  b.type = 'button';
  b.addEventListener('click', async () => {
    if (b.disabled) return;
    b.disabled = true;
    b.textContent = 'Deleting';
    const a = await send('DELETE', `/api/v2/${type}/${encodeURIComponent(id)}`, {});
    if (!a.failed && a.res.status === 204) {
      madeIds.set(type, (madeIds.get(type) ?? []).filter((x) => x !== id));
      refresh();
      const row = statusRow(r, 'ok', words(a, true), meta(a));
      const done = textEl('button', 'ow-b', 'Deleted');
      done.type = 'button';
      done.disabled = true;
      row.querySelector('.ow-act').append(done);
      show(r, [row, note(`That element is gone from the practice world. Reading it again now answers <b>410</b>; the world also resets every night at ${RESET} UTC.`)]);
      return;
    }
    // no delete: the element stays, and so does its Delete
    b.disabled = false;
    b.textContent = 'Delete this element';
    let nodes;
    if (a.failed) nodes = noAnswer(r, a);
    else if (a.res.status === 429) nodes = limited(r, a);
    else {
      const row = statusRow(r, 'err', words(a, true), meta(a));
      if (a.text) row.querySelector('.ow-act').append(copyButton(pretty(a)));
      nodes = [row, ...(a.text ? [answerBody(pretty(a), 'err')] : [])];
    }
    nodes[0].querySelector('.ow-act').append(b);
    const still = note('The element ');
    still.append(textEl('code', null, id), ' is still in the practice world.');
    show(r, [...nodes, still]);
  });
  return b;
}

for (const r of runs) if (r.panel && (r.req.demoKey || (KEY && PIN))) r.button.addEventListener('click', () => run(r));
refresh();
