// The error families figure's data, from keel's own list of error codes (contract/error-codes.json,
// the snapshot gen_errors.mjs writes the errors page's summary table from). Pure: the caller passes
// the list in, so the page (ErrorFamilies.astro) and its Markdown twin (scripts/postbuild.mjs)
// read the same thing. scripts/verify-figures.mjs holds the built figure to the summary table on
// the same page, and its retry marks to the Retry-After headers the API's own document declares.
//
// A public code is an entry that is neither internal nor the upload host's. A code is marked
// retry when its summary in the list names Retry-After.

// The order families are drawn in, each with a few words saying what it is about: no source holds
// these words. A family the list adds that is not named here is drawn last, without words.
export const FAMILIES = {
  authentication_error: 'who are you',
  permission_error: 'you may not',
  not_found: 'no such thing',
  invalid_request: 'what you sent',
  idempotency_error: 'the same key twice',
  rate_limited: 'too fast or too much',
  api_error: 'on our side',
};

export const retries = (r) => /Retry-After/.test(r.summary ?? '');

export function errorFamilies(codes) {
  const pub = Object.entries(codes).filter(([, r]) => !r.internal && !r.host);
  const hostRows = Object.entries(codes).filter(([, r]) => r.host);
  const known = Object.keys(FAMILIES);
  const types = [...new Set(pub.map(([, r]) => r.type))].sort((a, b) => {
    const ia = known.indexOf(a), ib = known.indexOf(b);
    return (ia < 0 ? known.length : ia) - (ib < 0 ? known.length : ib) || (a < b ? -1 : a > b ? 1 : 0);
  });
  const families = types.map((type) => {
    const by = new Map();
    for (const [code, r] of pub) {
      if (r.type !== type) continue;
      if (!by.has(r.status)) by.set(r.status, []);
      by.get(r.status).push({ code, retry: retries(r) });
    }
    const statuses = [...by].sort((a, b) => a[0] - b[0]).map(([status, list]) => ({ status, codes: list }));
    return { type, says: FAMILIES[type] ?? '', count: statuses.reduce((n, s) => n + s.codes.length, 0), statuses };
  });
  // The family whose codes answer with the most statuses: the example the lead sentence gives.
  const widest = families.reduce((w, f) => (f.statuses.length > w.statuses.length ? f : w), families[0]);
  return {
    total: pub.length,
    families,
    retry: pub.filter(([, r]) => retries(r)).map(([c]) => c),
    widest: { type: widest.type, statuses: widest.statuses.map((s) => s.status) },
    host: {
      name: hostRows[0]?.[1].host ?? '',
      count: hostRows.length,
      statuses: [...new Set(hostRows.map(([, r]) => r.status))].sort((a, b) => a - b),
    },
  };
}

export const statusList = (statuses) => statuses.join(', ');

// The figure's sentences, shared by the page and the twin; code() wraps a code name, link() a
// link to a section of the same page.
export function errorWords(data, code = (s) => `\`${s}\``, link = (text, id) => `[${text}](#${id})`) {
  const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
  return {
    head: `${n(data.total, 'error code', 'error codes')} in ${n(data.families.length, 'family', 'families')}.`,
    lead: `Decide from the ${code('code')}, never the family: the ${code(data.widest.type)} family alone answers with ${data.widest.statuses.length} statuses (${statusList(data.widest.statuses)}).`,
    retry: `the answer carries ${code('Retry-After')}: wait that many seconds, then retry (${n(data.retry.length, 'code', 'codes')})`,
    host: `The upload host, ${code(data.host.name)}, is not part of the API: it answers in its own shape, with its own ${data.host.count} codes (statuses ${statusList(data.host.statuses)}), listed under ${link('Upload host errors', 'upload-host-errors')}.`,
    caption: 'Generated from the API\'s own list of error codes, the same list as the table below.',
  };
}

export function errorFamiliesMarkdown(codes) {
  const data = errorFamilies(codes);
  const w = errorWords(data);
  const fam = data.families.map((f) => {
    const groups = f.statuses
      .map((s) => `${s.status}: ${s.codes.map((c) => `\`${c.code}\`${c.retry ? ' (Retry-After)' : ''}`).join(', ')}`)
      .join('; ');
    return `- **\`${f.type}\`** (${f.count} ${f.count === 1 ? 'code' : 'codes'}${f.says ? `, ${f.says}` : ''}): ${groups}.`;
  });
  return [`**${w.head}** ${w.lead}`, '', ...fam, '', `Marked (Retry-After): ${w.retry}.`, '', w.host].join('\n');
}
