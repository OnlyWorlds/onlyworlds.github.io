---
title: TypeScript SDK
description: The @onlyworlds/sdk package, a typed client for the v2 API and the standard's constants, generated from schema-dist.
---

`@onlyworlds/sdk` is the typed client for the OnlyWorlds REST API v2. It also exports the standard's constants (the 22 element types, their icons, colour groups and field schema), generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist) at a pinned, hash-verified tag. The generated files name that tag in their header.

The 4.x line speaks v2 only and is ESM-only (Node 18 or later). Tools on the v1 API dialect (`OnlyWorldsClient`) or on CommonJS `require()` stay on the 3.x line, which is still published.

## Install

```bash
npm install @onlyworlds/sdk
```

For a web page with the setup done, start from [World Starter](https://github.com/OnlyWorlds/event-starter), a template repository that reads a world through this package.

## Read a world

This runs as written: `0000000001` is a public demo key that reads the sample world Moppetopia. Save it as `read.mjs` and run `node read.mjs`. The package is ESM and the example uses top-level `await`, so in a `.js` or `.ts` file set `"type": "module"` in your `package.json` first (then `npx tsx read.ts` runs the TypeScript).

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const client = new OwV2Client({ apiKey: '0000000001' });

const page = await client.list('character'); // one page: { data, has_more, next_cursor }
console.log(page.data.length, 'on the first page');

for await (const character of client.listAll('character')) { // every page
  console.log(character.name);
}
```

For your own world, use its read-only key (`ow_r_`), which needs no PIN. The other demo key, `0000000000`, reads Hyperion. See [Keys and PINs](/docs/getting-started/keys) for the key types.

One Character's context in one read is `draught(characterId, policy)` ([The draught](/docs/development/api/draught)). From 4.69.0, `draught(id, { compact: true })` leaves out the packet's empty sections and is typed `OwDraughtCompact` (`cut` optional); without `compact` the answer is the fixed `OwDraught`. From 4.86.0, `draughtText(draught)` gives a packet as plain text to paste into a prompt ([As text](/docs/development/api/draught#as-text)), the same bytes as Python's `draught_text`.

## Write

Keep the write key and PIN out of the code, in a `.env` file beside it:

```bash
OW_API_KEY=ow_w_...
OW_API_PIN=1234
```

and run the script with `node --env-file=.env write.mjs` (Node 20.6 or later):

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const writer = new OwV2Client({ apiKey: process.env.OW_API_KEY, apiPin: process.env.OW_API_PIN });

const ranger = await writer.create('character', { name: 'Ilse the Ranger' });
console.log('made', ranger.name, ranger.id);
```

That makes one Character; open the world in Atlas and it is there. The client sends the PIN only where the server checks it (since 4.59.0): on writes, on `me()`, and on every call with a 10-digit legacy key; a prefixed key's reads go without it, which spares the server a verification per read. Links and edits go the same way:

```typescript
const peak = await writer.create('location', { name: 'Dragon Peak' });
await writer.patch('character', ranger.id, { location: peak.id });
const dragon = await writer.create('creature', { name: 'Vorrath', location: peak.id });

await writer.patch('location', peak.id, { supertype: 'Mountain' });

const breath = await writer.create('ability', { name: 'Ember Breath' });
await writer.editLinks('creature', dragon.id, 'abilities', { add: [breath.id], remove: [] });
```

The v2 rules the client follows:

- A link field has one bare name in both directions (`location`, `abilities`). The `_id` and `_ids` suffixes belong to v1.
- Never send a `world` field: the key decides the world, and the client strips the field.
- `name` is the one required field. `''` and `null` are accepted and stored as `''`.
- An `id` is minted on the client when you leave it out (in `create` and in each item of `bulk`). Pass an `idempotencyKey` to make a retry safe: the id then comes from the key, so the same call with the same key replays the first answer instead of writing twice. Without a key, each call mints a fresh id. (A plain REST request without an `id` gets one from the server instead.)
- `patch` replaces every field it sends, and an array replaces the whole list. To add or remove links without replacing them, use `editLinks`.
- To write only if nobody changed the element since you read it, pass `{ ifMatch: el.change_seq }` to `patch` or `editLinks` (since 4.9.0). If it moved, nothing is written and the call throws `OwPreconditionFailedError`, whose `current` is the element as it is now. See [Only if unchanged](/docs/development/api/writes#only-if-unchanged).
- If your code is an AI agent, say so: `new OwV2Client({ ..., agent: true })` (since 4.26.0) sends `X-OW-Agent` on its element writes, and OnlyWorlds records your writes as agent-made. A tool people use leaves it off, since it would mark every person's edit. Every element read carries `changed_by` and `changed_via`, the last write's member and door; `isAgentDoor(el.changed_via)` is true for an agent seat, the MCP server or a client that declared itself. See [Agents](/docs/development/agents).
- Name your tool: `new OwV2Client({ ..., client: 'atlas' })` (since 4.56.0) sends `X-OW-Client` on every element write (and on a proposal, its accept and a review), never on a read or another write, and OnlyWorlds keeps the name on the element as `changed_client` ([a write can name its client](/docs/development/api/writes#agent-writes)). The default is `sdk`; a name outside lower case letters, digits and hyphens, 1 to 32 characters, is a `TypeError` at construction.

## Bulk writes

A bulk write succeeds partly by default: HTTP 200 with a status per slot. Check `errors` every time.

```typescript
const res = await writer.bulk(
  [
    { type: 'character', element: { name: 'A' } },
    { type: 'event', element: { name: 'B' } },
  ],
  { idempotencyKey: crypto.randomUUID() }, // keep it for a retry if the answer is lost
);
if (res.errors) {
  for (const slot of res.items.filter((s) => s.status >= 400)) {
    console.warn(slot.error?.code, slot.error?.message, slot.error?.doc_url);
  }
}
```

- `{ atomic: true }` makes the batch all or nothing. After a failed atomic batch nothing was written, but the slots that would have succeeded still report 201: do not record those ids as created.
- The server stores every 2xx answer under its idempotency key, and never an error. So when an answer is lost, retry with the **same** key: a stored answer replays, and an error runs again. If the first request is still running, the retry throws with `err.isIdempotencyInFlight` (409): wait `err.retryAfter` seconds and send it again, same key and body (since 4.27.0).
- A bulk answer with item errors is still a 200, so it is stored too. Fix the failed items and send them with a **new** key, because the same key replays the same errors.
- `res.wasReplay` is true when the server answered from that store.

## Images

```typescript
const image = await writer.uploadImage(file); // a Blob, File, ArrayBuffer or Uint8Array
await writer.patch('character', id, { image_url: image.url });
```

This makes two requests: a single-use ticket from the API, then the bytes straight to the media edge. The API never sees the bytes, and the edge never sees your key. Accepted formats are webp, png, jpeg and avif, read from the bytes (never SVG or gif). Each ticket counts toward the world's daily limit and the account's image storage. For a progress bar, call `createMediaTicket()` and POST the bytes to its `upload_url` yourself, with `Authorization: Bearer <ticket>`.

In a browser, shrink a phone photo before uploading it (since 4.11.0):

```typescript
const photo = await preparePhoto(file); // longest side 2048, webp (JPEG where the browser can't encode webp)
const image = await writer.uploadImage(photo.blob);
```

## Follow changes

```typescript
let cursor; // opaque and never expires: persist it
for await (const change of client.changesAll(cursor)) {
  // changes arrive in (change_seq, id) order; apply them in order
}
```

To poll for news cheaply, `client.changesHead()` returns `{ head, cursor, epoch, unchanged }` without reading any element (since 4.15.0; `epoch` since 4.16.0; `unchanged` since 4.57.0). The poll is conditional: the client keeps the `ETag` of its last `200` and sends it back as `If-None-Match`, so an unmoved head is a `304` keel does not count against your budget, returned as the head it holds with `unchanged: true`; a `409` clears the tag so the next poll is a full read with `epoch_reason`. Walk `changesAll` only when `head` has moved past the head you last applied, or when `epoch` changed: for a guest or a contributor it moves when what they may see changes, even with `head` unchanged. For the owner and co-builders it is `null`. A `delete` op's `reason` is `deleted`, or `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from the key: remove it from your copy either way.

Edits to the world itself (its name, calendar, `public_read`) do not enter the change feed. Poll `client.getWorld()` and compare `updated_at` for those. See [Sync with changes](/docs/development/api/changes).

## Sign in with a password

`signInWithPassword` turns an OnlyWorlds email (or username) and password into an account token (`ow_a_`) for this device (since 4.31.0). A client with no key can call it. With `OW_EMAIL` and `OW_PASSWORD` in a `.env` file, run this with `node --env-file=.env signin.mjs`:

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const { token } = await new OwV2Client().signInWithPassword({
  email: process.env.OW_EMAIL, // or username: '...'
  password: process.env.OW_PASSWORD,
  tokenName: 'My app on iPhone', // the name the token is listed under
});
const account = new OwV2Client({ apiKey: token }); // store the token: it is shown once
```

Pass exactly one of `email` and `username`; both or neither is a `TypeError` before anything is sent. The SDK signs in at onlyworlds.com's sign-in service, mints the token with `POST /api/v2/account/tokens`, then ends the sign-in session, whether the mint worked or not. Only the token is kept: the password is sent once and held nowhere. The answer is `{ token, id, name, last4 }`. The token is listed under `tokenName` on the account's tokens page (**Settings → Account tokens** in the [account portal](https://www.onlyworlds.com/account/)), where it can be revoked.

A refusal throws `OwSignInError`, whose `reason` is one of:

- `invalid_credentials`: a wrong email, username or password
- `email_unverified`: the account's email address is not confirmed yet
- `rate_limited`: too many attempts; wait `err.retryAfter` seconds when it is set
- `offline`: onlyworlds.com was not reached
- `mint_failed`: signed in, but no token was made
- `failed`: anything else, with the server's message

The password is never in an error.

## Invite links

A world's owner can invite a person with a link (see [Invite links](/docs/development/api/members#invite-links)). The code is the part after `#` (since 4.12.0):

```typescript
const invite = await client.previewJoin(code);    // who invites, which world, what role; sends no key
const membership = await account.acceptJoin(code); // account: a client with an ow_a_ token
```

A bad code is one 404 (`err.isNotFound`). Accepting can answer `err.isAlreadyMember`; it needs no account PIN, though a write key for the new membership waits for one. A refusal never uses up the code.

The owner makes, lists and revokes the links with the account token (since 4.24.0). The code comes back once, in the answer that makes it:

```typescript
const made = await account.createWorldLink(worldId, { reader: 'person', role: 'contributor', days: 7 });
// made.line: the one line to send (who invites, to which world, the link); made.code: the ow_j_ code
const links = await account.listWorldLinks(worldId);  // no codes: status pending | used | revoked | expired
await account.revokeWorldLink(worldId, made.id);
```

`reader: 'agent'` makes a link an AI agent redeems for a seat instead, with `redeemJoin`: the answer has `kind: 'agent'`, the seat's key and secret, and its `.env` lines. Anyone but the owner gets a 404.

`reader: 'player'` makes a link for a friend with no account, who reads the world as a guest playing one Character and writes nothing (since 4.30.0; see [Members and sharing](/docs/development/api/members)). The friend's side needs no key at all:

```typescript
const link = await account.createWorldLink(worldId, { reader: 'player', character: 'new' }); // or a Character's id
// on the friend's device:
const phone = new OwV2Client();                       // no key: only health, previewJoin, redeemJoin and signInWithPassword work
const joined = await phone.redeemJoin(code, { name: 'Ana' }); // joined.kind === 'player'
const reader = new OwV2Client({ apiKey: joined.key }); // a read key, no PIN, shown once
```

The code is spent on redeem, and the answer can't be replayed: if it is lost, the owner sees the row never used, and sends a new link.

One player link can also seat a whole table (since 4.39.0; see [A table of players](/docs/development/api/members#a-table-of-players)). Each player picks one Character from the owner's list, and a refusal spends nothing:

```typescript
const table = await account.createWorldLink(worldId, { reader: 'player', maxUses: 4, characters: [aliceId, borinId] });
// on each player's device:
const seen = await phone.previewJoin(code);           // seen.uses_left, seen.characters: [{ id, name, image_url, taken }]
try {
  const joined = seen.name_required
    ? await phone.redeemJoin(code, { name: 'Ana' })   // no list: a fresh Character named for the player
    : await phone.redeemJoin(code, { character: seen.characters.find((c) => !c.taken).id });
} catch (err) {
  if (err.isCharacterTaken || err.isCharacterInvalid) { /* preview again and pick another */ }
  else if (err.isWorldFull) { /* the world has its 50 players */ }
  else throw err;
}
```

Once in, a world key can ask who it is and who else is there (since 4.22.0; see [Who am I](/docs/development/api/members#who-am-i)):

```typescript
const me = await client.me();          // { world, scope, kind, role, membership, character }
const roster = await client.members(); // the roster's rows: { id, kind, role, character, status }
```

Since 4.116.0 an account token reads the roster too: on a client made with the token and `world` (`new OwV2Client({ apiKey: token, world: worldId })`), `members()` sends `GET /members?world=<id>` and reads it as the token's own access there, the owner as the owner and a member as their own member key; an account with no access gets a `404`. Without `world` it refuses before sending.

## A seat for your AI

To let your own AI work in a world you own or belong to, make it a seat: its own membership, key and secret, with no link to pass around (see [Giving your AI access](/docs/development/agents#giving-your-ai-access)). With the account token (since 4.28.0):

```typescript
const made = await account.createSeat(worldId, { name: 'Quill', role: 'contributor', character: 'new' });
// made.env: the .env lines for the AI (OW_API_KEY, OW_API_PIN, OW_WORLD, ...), shown once
const seats = await account.listSeats(worldId);          // yours; every seat for the owner; no keys
const renewed = await account.rekeySeat(worldId, made.seat.id); // a new key and secret; the old stop (4.29.0)
await account.removeSeat(worldId, made.seat.id);
```

`role` is at most your own; `character` is `new` (a Character of its own), `none`, or `mine` (it plays the Character you play). None of these sends an `Idempotency-Key`, so a key is never stored for a replay: if an answer is lost, `listSeats` shows the seat, and `rekeySeat` gives it a new key.

## A world on the account

Since 4.66.0 an account token makes a world: `createAccountWorld({ name, pin, keyName, source, producer })` answers the world and its one write key, shown once. A fresh account has no PIN yet, so the first create answers `422` with `err.param === 'pin'` until you send one, which becomes the account's PIN; an account that has one must leave `pin` out. `keyName` names the key (1 to 80 characters); `source` and `producer` are the [folder's provenance lines](/docs/schema/folders#worldjson), for a tool that makes the world from a folder, kept as the world's `origin`.

```typescript
const acct = new OwV2Client({ apiKey: 'ow_a_…' });
const made = await acct.createAccountWorld({ name: 'Hyperion', keyName: 'my tool', producer: { tool: 'my-tool', version: '1.0.0', input: 'bare' } });
```

Since 4.88.0 the token also [reads a world](/docs/getting-started/keys#reading-a-world-with-an-account-token) with no key minted: give the client the world's id as `world`, and `list`, `listAll`, `get` and `getWorld` read it as the account's own access there. The account calls keep working on the same client. With no key at all, the same option is the [public reader](/docs/development/api/public#the-keyless-reads), and `getWorld()` then carries `counts`. Any other world call on such a client (a write, `changes`, `draught`, `me`, files) is a `TypeError` before anything is sent.

A tool that stores a world key on the device mints it with `mintWorldKey(worldId, { keep: true })` (since 4.90.0), so signing out keeps the key; without `keep`, revoking the token revokes the keys it minted.

```typescript
const reader = new OwV2Client({ apiKey: 'ow_a_…', world: worldId });
for await (const el of reader.listAll('character', { signal })) { /* … */ }
const open = new OwV2Client({ world: worldId });   // no key: what the public reads
```

## Proposed changes

Since 4.58.0 a member can [propose a change](/docs/development/api/proposals) for a keeper to accept instead of writing it, and a world's owner can make every agent seat work that way.

```typescript
const row = await client.propose('character', id, { fields: { reputation: 'Feared' }, evidence: 'Chapter 12', expires: new Date(Date.now() + 14 * 86_400_000).toISOString() });
const queue = await client.worldProposals({ state: 'open' });        // newest first; keepers see every row, others their own
const { proposal, element } = await client.acceptProposal('character', id, row.id); // the keeper's own write, one feed row
await client.declineProposal('character', id, row.id, { reason: 'not yet' });
await client.withdrawProposal('character', id, row.id);               // the proposer's
for (const r of queue.data) if (r.kind === 'new_element') await client.reviewNewElement(r.element_type, r.element_id, { decision: 'accept' }); // a seat's new element: accept clears the mark, decline deletes it
```

Since 4.66.0 the queue holds two kinds of row, `OwProposal` (`kind: 'proposal'`, its `fields` only what differs and `omitted` what an upsert left empty) and `OwProposedNewElement` (`kind: 'new_element'`): narrow on `kind` before reading a proposal's own keys. `next_cursor` is opaque. `reviewNewElement` settles a new element a seat made under the switch; an element with no mark throws with `err.isNotProposed`.

With **AI seats propose, a person accepts** on for the world (`agent_writes_proposed` on `getWorld()`, read-only; `patchWorld` strips it), an agent seat's `patch`, `upsert` or `editLinks` on an existing element answers `202` and the client throws `OwProposedError` (`err.isProposed`, `err.proposal`) rather than returning a body that is not the element; a `bulk` slot with `status: 202` stays in the result, typed. An accept that finds a proposed field moved throws `OwStaleProposalError` (409, `err.isStaleProposal`, `err.conflicts`, `err.current`); the other codes are `isOwnProposal`, `isProposedOnly`, `isTooManyOpen` and `isFieldNotVisible`. Nothing about a proposal reaches the change feed: poll the queue to learn of new ones.

<a id="find-things-in-a-world"></a>

## Find elements in a world

With a world's elements in memory, `lookupWorld` finds the ones a plain question is about. It uses no model and no network, and runs in a few milliseconds (since 4.11.0).

```typescript
import { buildWorldIndex, lookupWorld, renderElement } from '@onlyworlds/sdk';

const index = buildWorldIndex(elements); // once per world; each element needs id and type
const hits = lookupWorld(index, 'who runs the mill in Ostvik?');
// hits[0].element, hits[0].reasons: best first, with why each matched
const card = renderElement(hits[0].element, index); // a short text card, links by name
```

Names come first, then supertype and subtype, then one link step in either direction, then the elements' other text, custom fields (`x_*`) included since 4.19.0. A card shows a custom field by its own name: `x_eye_colour` reads `eye colour: grey`.

For an answer in a sentence, a signed-in account can use OnlyWorlds' [AI proxy](/docs/development/ai#ask-your-world-without-a-key-of-your-own) (since 4.13.0):

```typescript
const { context, kept, leftOut } = buildAskContext(hits.slice(0, 8), index); // the hits you show, within the proxy's limits
const reply = await account.ask({ worldId, question, context });    // account: a client with an ow_a_ token
// reply.answer comes from those elements only, or is "The world doesn't say."
```

`kept` says which elements were sent, so the sources you show are the ones the answer used. Since 4.72.0 it hands nothing on that a world holds back from an AI: proposed elements (the [review profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)), [hidden](/docs/development/api/hidden) ones and the room's are left out unless you pass `includeProposed`, `includeHidden` or `includeRoom`, and `leftOut` lists them by id so you can say how many. A proposed element you include carries `[proposed, not yet reviewed]` on its first line, and a kept element's link to a left-out one reads as not present, so its name stays out too. Asking spends from the account's token rating, its daily budget of tokens: `reply.tokens_remaining` and `reply.token_rating` since 4.19.0, and `reply.remaining` counts the answers of this size still in it. Used up, it throws with `err.isQuotaExceeded`. `account.allowance()` reads the token rating without spending anything: `{ token_rating, tokens_used_today, tokens_remaining, resets_at }` (since 4.21.0).

The same proxy [sorts loose notes](/docs/development/ai#sort-notes-into-a-world) into rows for the user to review (since 4.18.0). Send what your lookup found as the slice; every id in a row comes from it, and nothing is written until your app applies what the user accepts:

```typescript
const slice = hits.slice(0, 100).map(({ element: e }) => ({ id: e.id, type: e.type, name: e.name }));
const { rows, not_proposed } = await account.sort({ worldId, notes: ['Mira moved to Ostvik.'], slice });
// rows: make, add_to, link, or ask (with candidates); one question from the same token rating
```

## World files

A world file is one `.zip` holding a whole world folder (`world.json` and `elements/<type>/*.json`), the file Atlas downloads and opens. Reading and writing one needs no account, and works in the browser and in Node (since 4.10.0).

```typescript
import { readWorldFile, writeWorldFile, OwWorldFileError } from '@onlyworlds/sdk';

const world = readWorldFile(bytes); // a Uint8Array
// world.worldId, world.name, world.world (world.json), world.files: [{ path, data }]

const zip = writeWorldFile(world.files, 'hollow-reach-0192a000'); // one top-level folder
const share = writeWorldFile(world.files, 'hollow-reach-0192a000', {
  includeHidden: false,                          // a file to hand on: hidden elements left out (4.70.0)
  report: r => console.log(r.hiddenLeftOut, r.authorFieldsLeftOut),
});
const mine = writeWorldFile(world.files, 'hollow-reach-0192a000', {
  includeAuthorFields: true,                     // your own archive: every file byte for byte (4.109.0)
});
```

Since 4.109.0 a world file leaves out who wrote each element: `created_by`, `changed_by`, `changed_via`, `changed_client` and `doors` record a member's id and a tool's door, which mean nothing to someone the world is handed to. An element file holding any of them is written without them, in the folder's own form (two-space indent, a trailing newline, its other keys in their order); every other file travels byte for byte. Pass `includeAuthorFields: true` to archive your own world as it is.

From 4.49.0 both follow the folder format's archive section (§4.7, the `.owworld` file) and give its verdict on every fixture of its conformance set. The reader checks the archive's directory before it inflates anything and refuses a file before returning anything: a path that could land outside the folder (`unsafe_path`), more than 2 GiB or 500,000 files uncompressed, or an entry that inflates past the size it declares (`too_big`, `too_many`), no `world.json` with an `id` (`not_a_world`), more than one world (`more_than_one`; a `world.json` under `records/` is a producer's data, not a second world), a file that is not a zip it can read (`not_openable`), two entries with one name (`duplicate`) or two names that are one after NFC and simple case folding (`collision`; from 4.71.0 both at Unicode 15.1, built from Unicode's own files rather than the runtime's, as the spec rules, and exported as `nfc` and `simpleCaseFold`), a link or device entry (`link`), an encrypted, spanned or otherwise compressed entry (`method`), a name with a device name, a trailing dot or space, a forbidden character or no UTF-8 flag on non-ASCII (`name`), or a `mimetype` marker whose bytes are not `application/vnd.onlyworlds.world+zip` (`marker`; the marker is never required). Files beside the world's folder are ignored. `err.reason` on the `OwWorldFileError` says which, and `files` come back in code point order. The writer gives one set of bytes for one input: the marker first and stored, entries ordered by the UTF-8 bytes of their names, every entry stamped 1980-01-01, and only `world.json`, `elements/`, `spatial/`, `media/`, `records/` and a tool's dot-folder it is handed. From 4.63.0 it leaves out, whole, every `records/<producer>/` that `records/RECORDS.json` marks `"private": true` (the name matched after the same fold), keeping `RECORDS.json` as it is; `writeWorldFile(files, top, { includePrivateRecords: true })` carries them, and a manifest it cannot read throws a `TypeError` unless you pass that ([private records](/docs/schema/folders#folders-and-onlyworldscom)). From 4.70.0 it takes `includeHidden` (the folder format's §4.8): a world file is a copy, so by default an element file carrying the [hidden](/docs/development/api/hidden) mark travels byte for byte. A tool making a file to hand to someone else passes `{ includeHidden: false }`, and every `.json` file directly in a type folder of `elements/` or `spatial/` whose JSON has a top-level `hidden` (anything but absent, `null` or `false`, so `"true"` and `1` count) is left out whole; a file there that is not UTF-8 JSON, or not an object, is kept. Nothing else is rewritten: a visible element's link to a hidden one keeps its id. `report: r => …` is called once with `{ hiddenLeftOut }`, the count left out, after the archive is made and never on a refusal; the return stays the bytes. An `includeHidden` that is not a boolean, or a `report` that is not a function, is a `TypeError` before anything is written. The two defaults differ on purpose: private records stay out unless asked, hidden elements stay in unless the file is a share. Both functions remove `world.json`'s `api` block, so the world's link and key never travel in a file.

## World calendars

A world's time is an integer line: the world's now (`time_range_current`) and an Event's `start_date` are points on it. A calendar names those points with months, days and eras. Atlas keeps a calendar on an element in its `atlas_calendar` field, and the SDK reads it with its calendar code, which Atlas uses too (since 4.20.0). Atlas owns that field: read it, never write it (the Python package's LegendKeeper import writes one from a source calendar, by Atlas's rules).

```typescript
import { worldCalendars, resolveCalendar, formatStep, parseDate } from '@onlyworlds/sdk';

const calendars = worldCalendars(elements); // every element with a valid atlas_calendar
const cal = resolveCalendar(elements, chosenId, { fallbackToOnly: true }); // one calendar: used
if (cal) {
  formatStep(cal.config, 400);               // "4 Alturiak, 1 DR" (Harptos, from Atlas's tests)
  parseDate(cal.config, '4 Alturiak, 1 DR'); // { step: 400 }
}
```

No calendar, or a broken one, gives null: show the bare number.

Since 4.76.0 the SDK reads the calendar profile's version 2: a leap day's rule can carry `except`, divisors that flip it in order, and `offset`, added to the year index before the rule (1 for a calendar with no year 0). Gregorian is `every_years: 4, except: [100, 400], offset: 1`. A reader that knows only version 1 gives null for a version-2 calendar, so it shows the bare number, never a wrong date. An era with no `end` runs to the next up era's start, whatever order the eras are listed in.

## Addresses

Since 4.89.0 the [address profile](/docs/schema/profiles/addresses) reads and writes an element's link: `parseOwLink(text)` reads any of the three spellings (the site's address, `ow://<type>/<id>`, `ow://<world>/<type>/<id>`) with its moment and lens, and `elementAddress(address)` writes one. A string the profile refuses throws an `OwAddressError` whose `reason` is the profile's own name.

```typescript
import { parseOwLink, elementAddress } from '@onlyworlds/sdk';

const r = parseOwLink('ow://character/0193f1c2-7a00-7000-8000-000000000001');   // { form: 'text', world: null, type: 'character', id, lens: null, moment: null, canonical: true, … }
const link = elementAddress({ form: 'human', world: worldId, type: 'character', id });   // https://www.onlyworlds.com/w/<world>/character/<id>
```

Since 4.105.0 `openersFor(tools, kind, address, surface)` gives the rows of an **Open with** menu for a world or an element: onlyworlds.com first, then each [listed tool](/docs/development/list-your-tool) whose `open` key has a door for it, in the list's order. Each row is `{ id, name, href, state }`. `state` is null when the row opens now, or one of `You are here`, `Sign in to <tool> first`, `Opens in your browser`, `Needs the world on this phone` or `Opens the world`. `surface` says what the page knows: `audience` (`member` or `public`), and optionally `tool` (your own tool's client name), `signedIn`, `browser` and `phone`. A public page gets only the tools that need nothing first. `TOOLS` is the tools list baked at this release.

```typescript
import { openersFor, TOOLS, parseOwLink } from '@onlyworlds/sdk';

const rows = openersFor(TOOLS, 'element', parseOwLink(link), { audience: 'member', tool: 'lantern', signedIn: false });
// [{ id: 'onlyworlds', name: 'onlyworlds.com', href: 'https://www.onlyworlds.com/w/<world id>/character/<id>', state: null },
//  { id: 'atlas', name: 'Atlas', href: 'https://atlas.onlyworlds.com/#/open/…', state: 'Sign in to Atlas first' },
//  { id: 'lantern', name: 'Lantern', href: 'https://lantern.onlyworlds.com/#/open/…', state: 'You are here' }]
```

Since 4.107.0 `doorsOf(element, tools = TOOLS)` reads an element's [door history](/docs/development/api/reads), the `doors` field a world's members are served: which tools wrote it, newest first, each `{ door, at, tool, last, from }`. `tool` is the listed tool whose client name is the door, or null for a door word (`site`, `mcp`, …). `last` marks the entry that made the element's last write, so a "by you" line compares `changed_by` with the reader's own membership there. An element with no `doors` yet reads one entry from its last write (`from: 'last-write'`), and a public read gives `[]`. It returns data, never words. Since 4.108.0 `doorWhere(entry)` gives one entry's where in the words a "Last shaped" line uses: `in <tool name>` for a listed tool (such as `in Atlas`), `on onlyworlds.com` for `site`, `with an AI` for `seat`, `mcp` and `declared`, `by OnlyWorlds` for `server`, and `in code` for any other door. The rest of the sentence ("Last shaped", "by you", the time) stays the caller's.

```typescript
import { doorsOf, doorWhere } from '@onlyworlds/sdk';

const [newest] = doorsOf(element);
// { door: 'atlas', at: '2026-10-29T14:31:07.123456+00:00', tool: { id: 'atlas', name: 'Atlas' }, last: true, from: 'doors' }
doorWhere(newest); // 'in Atlas'
```

### The Open with menu, drawn

Since 4.113.0 the subpath `@onlyworlds/sdk/waymark` draws that menu for a page: `mountWaymark(target, options)` puts the OnlyWorlds mark beside a world's or an element's name, and the mark opens the menu (the name line, the Open with rows, the lenses you pass, Copy link). Every word in it comes from the readers above: the rows and their state words from `openersFor`, a member's "Last shaped" line from `doorsOf` and `doorWhere`. It returns a function that removes everything it added. Its stylesheet is `@onlyworlds/sdk/waymark.css`, for a dark or a paper page (`ground`). `reader` is `member`, `guest` or `public`; a public page shows only the rows that need nothing first. `entry` picks the way in: the mark (`'mark'`, the default), an Open with item for your page's own menu (`'menu'`, given back as `entry` on the returned function), or both. The main `@onlyworlds/sdk` import never loads it, so a server or a script that only reads worlds carries no page code. Since 4.117.0 an Escape it handles stops there, so a page's own Escape on `document` does not also run; the fan-out measures the nearest box that clips it when it opens and opens toward the room it has (to the left of a right edge, above a bottom edge); your own tool's row, "You are here", is a plain item that closes the menu; and at 480 px wide or less the menu is a sheet from the bottom.

```typescript
import { mountWaymark } from '@onlyworlds/sdk/waymark';
import '@onlyworlds/sdk/waymark.css';

const remove = mountWaymark(document.querySelector('#title'), {
  world: { id: worldId, name: 'Moppetopia' },
  element,                       // the element as your page read it, or leave it out for the world
  reader: 'member',
  tool: 'lantern',               // your own tool's client name: its row says "You are here"
  signedIn: true,
  ground: 'dark',
});
// later: remove();
```

## Lenses

Since 4.91.0 the [lens profile](/docs/lenses) has its reader: `resolveLens(world, lens, reader, { asOf, clock })` reads a world snapshot through a lens for one reader and returns the kept elements in order, the cut counted by reason, and the mail part when the lens names one; it never writes. `isLens(el)` and `isTemplate(el)` say what an element is; `lensesInUse(membership, xLensUses)` gives a seat's chosen lenses (the membership's choice first, else a folder Character's `x_lens_uses`). The reading's date is `asOf`, else the world's own now; the mail rule's thirty days run on `clock`, the wall clock.

Since 4.96.0 the profile's date table is exported: `DATE_FIELD` gives each dated type's date field (an Event's `start_date`, a Character's `birth_date`; the ten timeless types are not in it), and `dateOf(el)` gives an element's date as that table reads it, the whole number in its type's date field, else null. A timeline dates elements exactly as the lens's fence does.

Since 4.93.0 the profile's graph section has its reader: `worldGraph(world, reader, options)` reads the same snapshot, for the same reader, as nodes and edges. It returns `nodes` (`{ id, type, name, family, icon }`, by id), `edges` (`{ source, field, target, index }`, one per link), `edgesCut` (links to elements that are not nodes, counted by reason), `cut`, and `unreadable` (the `x_lens` key a lens could not be read by, else null). Room elements, hidden and proposed elements, and map space (Maps, Pins and Markers; a Zone is a node like any other) are left out unless `rooms`, `hidden`, `proposed` or `mapSpace` brings them back. `hidden` and `proposed` are the owner's alone, and a public reader takes no flag: a refused flag throws, naming it, before anything is read. With `{ lens }` the nodes are exactly what the lens kept, and `outside_lens` counts the links from them to elements the reader sees but the lens did not reach.

```typescript
import { degreeOf, worldGraph } from '@onlyworlds/sdk';

const g = worldGraph({ elements }, { rung: 'owner' }, { rooms: true });
g.nodes; g.edges; g.edgesCut; // e.g. { map_space: 2, hidden: 1 }
degreeOf(g); // since 4.95.0: each node's edges, in or out, { [id]: count }
```

Since 4.100.0 a lens's rows for a reader below the owner are the bodies the API serves that reader: a link to an element the reader cannot see is left out, a lens kept as an element keeps only the notes on elements the reader sees, and `x_served_trimmed` names a message's `characters` and `narrator`, or a lens's anchor fields, for a contributor or a guest, never for the public. The owner's rows are the bodies as stored. Since 4.100.1 a contributor's or a guest's row keeps a link to a proposed element it sees, and a lens's note keyed to one, as the API serves them; the public rung loses both. No row carries a stored `x_served_trimmed`: the mark names only what this reading trimmed.

## Reading aids

Since 4.100.0 the [charter profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/charter.md) has its reader (the API's own copy is [`reading_aids`](/docs/development/api/members#reading-aids)): `charterOf(world, reader)` returns what a world's front door shows first, `{ charter, guide, domains }`, as that reader sees them. `charter` is `{ id, name, rules, skill }` or null: the newest marked Charter, its `x_checks_rules` list (`[]` when none) and the Objects its text names, at most five. `guide` is `{ id, name }` or null. Each Domain is `{ id, name, sentence, hubs }`: its description up to the first line break, and the elements its links name that the reader sees, as `{ type, id }`. `domainsOf(world, reader)` returns the Domains alone. `world` holds the elements as the owner is served them, with `open: true` for a world open to anyone (only then does a public reader see anything), and `reader` is a lens reader. `isCharterElement(el)` reads the mark `x_charter_of` by its presence: any value but null, and a string only when something is left after trimming. `CHARTER_PAIRS` lists the three type-and-supertype pairs. Since 4.101.0 `readingAidOf(element)` answers which aid an element's type and supertype make it, `'charter'`, `'guide'`, `'domain'` or null, with the mark ignored: what a tool offers to mark it as.

```typescript
import { charterOf } from '@onlyworlds/sdk';

const { charter, guide, domains } = charterOf({ elements }, { rung: 'owner' });
```

## Messages

Messages between members follow the [message profile](/docs/schema/profiles/messages) (since 4.80.0): who a message is for, whether its sender is proved, what is unread, and a thread.

```typescript
import { isMessage, isAddressedTo, senderStatus, readMarkOf, unreadFor } from '@onlyworlds/sdk';

const messages = (await Array.fromAsync(client.listAll('narrative', { filter: { supertype: 'Message' } }))).filter(isMessage);
const members = await client.members();
const marks = await Array.fromAsync(client.listAll('relation', { filter: { supertype: 'Read' } }));
const mark = readMarkOf(marks, myCharacter, members);   // only a mark in my own hand counts
for (const m of unreadFor(messages, myCharacter, mark, members)) {   // members: only a verified sender makes a message mine
  const { status, claimed, writtenBy } = senderStatus(m, members);
  // 'verified': show the sender; 'mismatch': "claims to be from <claimed>, written by <writtenBy>'s key";
  // 'unverifiable': "claims to be from <claimed>" (or "from nobody" when claimed is null)
}
```

A body read with no key, as the public reader is served, carries no hands, so `readMarkOf(marks, id, members, { keyless: true })` is `null` (since 4.115.0), the option `isToEveryone` takes. `isAddressedTo(m, id)` is true for a message to everyone (an empty `characters`), and `isToEveryone(m)` (since 4.81.0) asks only that; `threadOf(messages, rootId)` lists a thread in order.

Since 4.88.0 (schema-dist serial 76) the readers know a message the server trimmed for its reader (`x_served_trimmed`): an empty `characters` with the mark is to someone you cannot see, never to everyone; `hasUnseenRecipients(m)` says so; a hidden sender is `senderStatus` `'unseen'` ("from someone you cannot see"). A body read with no credential carries no mark, so pass `{ keyless: true }` to `isToEveryone` and `hasUnseenRecipients` there: the first is then false, the second `null` (unknown). `editedBy(m, members)` says whether a later hand changed a message, and whose. A Note (supertype `Note`) is a member's own line, never a message: `isNote(el)`, and `noteOf(narratives, characterId, members)` gives the id of that Character's newest Note in its own hand.

An element an AI seat wrote as [proposed](/docs/development/api/proposals) follows the [review profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md) (since 4.83.0): `proposedMarkOf(el)` gives its mark as a viewer shows it, `{ by, expires, lapsed }`, or `null` for a settled element, and `handsOnAsProposed(el)` is what a reader that hands a world on (a context for an AI, a share) leaves out, a malformed mark included. `buildAskContext` reads the same function.

## Errors

Every non-2xx answer throws `OwApiError` with the platform's error envelope: `.status`, `.type`, `.code`, `.param` (the field that failed, or `API-Pin` when a PIN was refused) and `.docUrl`, which links to the code on [the errors page](/api/errors). Show `docUrl` to your users. Transport failures throw `OwNetworkError`. `err.isValidationError` covers the common case. A write sent with `ifMatch` that found the element moved throws `OwPreconditionFailedError` (412, `err.isPreconditionFailed`), an `OwApiError` that also carries `current`. `signInWithPassword` throws `OwSignInError` instead, which is not an `OwApiError`: its `reason` says why, `status` and `code` are keel's answer when one came back, and `retryAfter` comes with a rate limit.

A write a world's switch turned into a [proposal](#proposed-changes) throws `OwProposedError` (202, `err.isProposed`, `err.proposal`) since 4.58.0, and an accept on a moved field `OwStaleProposalError` (409, `err.isStaleProposal`, `err.conflicts`, `err.current`).

## Schema constants

```typescript
import {
  ELEMENT_TYPES,    // the 22 type slugs, and the ElementType union
  ELEMENT_ICONS,    // the Material Symbols icon for each type
  ELEMENT_LABELS,   // plural display labels
  ELEMENT_SECTIONS, // the field groups and their display order
  FIELD_SCHEMA,     // type and target of every field
  ROOM_PAIRS,       // the nine type-and-supertype pairs a parlor keeps in a world (since 4.55.0; Take since 4.75.0)
  CHARTER_PAIRS,    // the three reading aids' pairs: Law Charter, Construct Guide, Construct Domain (since 4.100.0)
  ELEMENT_GROUPS,   // each type's colour group: blue, green, pink or amber (since 4.102.0)
  GROUP_COLORS,     // each group's light and dark colour
  elementColor,     // the colour of a type's group
  fieldLabel,       // a field name as the words a tool shows
  dragField,        // the link a drag between two types writes (since 4.115.0)
} from '@onlyworlds/sdk';

elementColor('character', 'dark');
fieldLabel('image_url'); // "Image URL"
dragField('location', 'character'); // { on: 'character', field: 'location', holds: true }
```

Colour marks a type's colour group and the icon marks the type. The four groups are a visual aid for drawing the 22 types, not part of the standard; until 4.102.0 they were `ELEMENT_FAMILIES`, `FAMILY_COLORS` and `FAMILY_ORDER`, which stay, deprecated, in their old words until 5.0. Always pair a colour with its icon and label, because colour alone is not accessible. `fieldLabel` (since 4.34.0) writes a field's label in sentence case with acronyms kept (`birth_date` is "Birth date", `image_url` is "Image URL"; a word written all in capitals stays as written, so a custom `STR` is "STR", since 4.36.0), the house rule for OnlyWorlds tools; a tool that hides an extension prefix drops it before calling it. `isRoomElement(el)` (since 4.55.0) is true when an element's type and supertype, trimmed and compared without regard to case, match one of the `ROOM_PAIRS` and it carries a non-empty `x_room_of`, the id of the world or sitting the room belongs to; a pair without the mark is lore, so a novel's Message Narratives stay in view. A lore view (a list, a count, a search) leaves room elements out unless the person asks, and the room's own views show them whole: the [room profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md), schema-dist serial 45. `typeWord(world, type, { supertype, many })` (since 4.62.0) gives the word a world's `x_names` map prints for a type (*Employee* for Character in a work world), or `null` for the standard's name; a supertype's own word wins over the type's, and the word is printed as written: the [names profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md), schema-dist serial 48. `dragField(a, b)` (since 4.115.0) says what a tool writes when a person drags one type onto another: `on`, the type that carries the field; `field`, the link; and `holds`, whether the drop puts the dragged element inside the target or only draws a line. The two types can come in either order, and a pair the table does not offer (two of the same type, a pair with no link between them, or one whose only link names a role) is `null`. It reads schema-dist's `pairs.json`, presentation data like the colours, not part of the standard. The package also ships `SCHEMA.md` (every field and its meaning, generated) and `AGENTS.md` for AI agents working in a codebase that uses it.

## SDK or MCP?

Use the SDK for known operations in code: reads, writes, sync, bulk. For an AI exploring a world from a chat or an agent, use the [MCP server](/docs/development/mcp) at `https://www.onlyworlds.com/mcp`. It takes the same `API-Key` and `API-Pin` headers.

## Links

- [npm](https://www.npmjs.com/package/@onlyworlds/sdk) · [Source](https://github.com/OnlyWorlds/sdk) · [Changelog](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md) · [Migrating from 3.x to 4.x](https://github.com/OnlyWorlds/sdk/blob/main/docs/migrating-3-to-4.md)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)

<!-- generated:sdk-reference (scripts/gen_sdk_ref.mjs rewrites everything below this line) -->

## Reference

Generated from the types of `@onlyworlds/sdk` 4.117.0, the version these docs pin. The full declarations ship in the package (`dist/index.d.ts`), with `SCHEMA.md` and `AGENTS.md` beside them.

### Client options

`new OwV2Client(config)` takes:

| Option | Type | Notes |
|---|---|---|
| `apiKey` | `string` | The key: an ow_w_ (write) or ow_r_ (read) world key, an ow_a_ account token (sent as a Bearer token, for the account routes, and with `world` set for that world's reads), or a 10-digit legacy key. |
| `apiPin` | `string` | The PIN (or an agent seat's `ow_s_` secret), needed for writes when the world has one, and for legacy-key reads of a world with a PIN. |
| `baseUrl` | `string` | The API's base URL, default https://www.onlyworlds.com/api/v2. |
| `pageSize` | `number` | Page size for element lists, default 100 (the server's default; at most 1000). |
| `changesPageSize` | `number` | Page size for /changes pulls, default 100. |
| `fetch` | `typeof globalThis.fetch` | A fetch implementation to use instead of globalThis.fetch (for tests and other runtimes). |
| `agent` | `boolean` | Declare this client an AI agent: every element write (create, upsert, patch, delete, editLinks, bulk) carries `X-OW-Agent`, the operations keel declares it on, and keel records its writes as agent-made (`changed_via: 'declared'`; keel stores that the header was there, never its value). |
| `client` | `string` | This client's own name, sent as `X-OW-Client` on every element write (create, upsert, patch, delete, editLinks, bulk, adopt), on propose, acceptProposal and reviewNewElement, and on no read. |
| `world` | `string` | A world's id, for a client that holds an account token (`ow_a_`) or no key. |

### Methods

| Method | Route | What it does | Returns |
|---|---|---|---|
| `health()` | `GET /health` | unauthenticated liveness pulse. | `Promise<unknown>` |
| `getWorld(opts?)` | `GET /world` | world meta (name, calendar/time fields, public_read). | `Promise<OwWorldMeta>` |
| `patchWorld(partial)` | `PATCH /world` | partial world-meta update. | `Promise<OwWorldMeta>` |
| `setMyCharacter(character)` | `PUT /me/character` | pick the roster Character that is you in this world, or none. | `Promise<OwMe>` |
| `setMyLenses(lensIds)` | `PUT /me/lenses` | choose the lenses this key's holder starts with: lens ids in order, 0 to 20, repeats dropped by keel; an empty list is a choice too (the draught then adds no frame), and keeps a seat off its Titles' lenses. | `Promise<OwMe>` |
| `worldLenses(worldId, opts?)` | `GET /world/{worldId}/lenses` | every lens in the world this key can see, templates included and marked, each with its recipe echoed (`x_lens`, defaults filled in), the Titles it is the default for and whether this key chose it. | `Promise<OwWorldLenses>` |
| `me()` |  |  | `Promise<OwMe>` |
| `members()` | `GET /members` | the world's roster: each member's id (null for the owner), kind, role, Character and status (`removed` rows stay, so their elements keep `created_by`). | `Promise<OwMember[]>` |
| `list(type, params?)` | `GET /{type}/` | one cursor page. | `Promise<OwPage>` |
| `draught(characterId, policy?)` | `GET /character/{id}/context` | the draught: what one Character knows, as the recorded world holds it, in one read: her element, what she holds and sits in, her open work, how she works, the Events she was in, the Narratives she knows, everything else that names her, her sheet, what changed around her (`since`), and who plays whom; the world's name and calendar beside; the room's messages (`messages`), its other elements (`room`) and elements written as proposed (`proposed`) only when `components` names them. | `Promise<OwDraught>` or `Promise<OwDraughtCompact>` |
| `listAll(type, params?)` |  | Cursor-walk every page of a type. | `AsyncGenerator<OwElement>` |
| `get(type, id, opts?)` | `GET /{type}/{id}/` | optional one-level stub expansion / sparse fields, and `viewAs` (the owner reads as another reader; see ListParams.viewAs). | `Promise<OwElement>` |
| `create(type, element, opts?)` | `POST /{type}/` | create one element, minting an id on the client when you leave id out. | `Promise<OwElement>` |
| `upsert(type, id, element)` | `PUT /{type}/{id}/` | The local-first write primitive. | `Promise<OwElement>` |
| `patch(type, id, partial, opts?)` | `PATCH /{type}/{id}/` | DESTRUCTIVE on sent fields: arrays replace wholesale, omitted fields stay untouched. | `Promise<OwElement>` |
| `delete(type, id, opts?)` | `DELETE /{type}/{id}/` | idempotent (204 on absent). | `Promise<void>` |
| `editLinks(type, id, field, edit, opts?)` | `POST /{type}/{id}/links/{field} with {add, remove}` | atomic link merge. | `Promise<OwElement>` |
| `adopt(type, id, member)` | `POST /{type}/{id}/adopt with {member}` | change who made an element. | `Promise<OwElement>` |
| `bulk(items, opts?)` | `POST /bulk` | up to ~1000 items. | `Promise<OwBulkResponse>` |
| `changes(opts?)` | `GET /changes` | one page of the world's ordered change feed. | `Promise<OwChangesPage>` |
| `changesHead()` | `GET /changes?head=true` | where the feed is now, without a page: no element is read. | `Promise<{ head: number; cursor: string; epoch: number | null; unchanged: boolean; epoch_reason?: OwResyncReason | null; }>` |
| `changesAll(since?, opts?)` |  | Walk the feed from `since` (or from zero = full export) to the current tail, yielding ops in order. | `AsyncGenerator<OwChange, { cursor: string; head: number; epoch: number | null; }>` |
| `createMediaTicket()` | `POST /media/ticket` | permission to upload ONE image into this world (a write key and its PIN; no body). | `Promise<OwMediaTicket>` |
| `uploadImage(image, opts?)` |  | Upload one image and get its permanent public URL: a ticket from the API, then the bytes straight to the media edge (the API never sees them). | `Promise<OwUploadedImage>` |
| `createRemovalTicket(key)` | `POST /media/remove-ticket` | permission to remove ONE image (a write key and its PIN). | `Promise<OwRemovalTicket>` |
| `removeImage(keyOrUrl, opts?)` |  | Remove one uploaded image: a removal ticket from the API, then the removal at the edge (the API key never leaves for the edge). | `Promise<OwRemovedImage>` |
| `listFiles(type, id)` | `GET /{type}/{id}/files` | the element's files, newest first: each with its name, kind, size in bytes, label (or null), who added it (`added_by.agent` is true when an agent did) and when. | `Promise<OwFileRow[]>` |
| `worldFiles()` | `GET /world/files` | every file in the world this key may see, newest first, each with its element's `element_type` and `element_id`; and the world's total, `used_bytes` of `cap_bytes` (for a line like "41 MB of 250 MB"). | `Promise<OwWorldFiles>` |
| `createFileTicket(type, id, req)` | `POST /{type}/{id}/files` | permission to upload ONE file onto this element: a write key (and its PIN) that may change the element. | `Promise<OwFileTicket>` |
| `uploadFile(type, id, file, opts?)` |  | Attach one file to an element: a ticket from the API (createFileTicket), then the bytes straight to the upload host (the API never sees them, and the key and PIN never leave for the host). | `Promise<OwUploadedFile>` |
| `fileDownloadLink(type, id, fileId)` | `GET /{type}/{id}/files/{fileId}/download` | a link to the file and when it stops working: `url` (the file as an attachment, from the download host), `exp` (unix seconds, 5 minutes after issue), and the file's `name`, `kind` and `size`. | `Promise<OwFileDownload>` |
| `removeFile(type, id, fileId)` | `DELETE /{type}/{id}/files/{fileId}` | remove a file for real: it leaves the lists and the world's total at once, and its bytes are deleted from the store. | `Promise<void>` |
| `previewJoin(code)` | `POST /join/preview` | what a join code holds, without using it: who invites, to which world, in what role, and `reader` (`person`: accept it with acceptJoin; `agent`: an AI agent redeems it at POST /join). | `Promise<OwJoinPreview>` |
| `redeemJoin(code, opts?)` | `POST /join` | redeem a join code that needs no account: a player's (a friend reading as a guest) or an AI agent's. | `Promise<OwJoined>` |
| `signInWithPassword(opts)` |  | Sign in with an email address (or a username) and password, and get a new account token (`ow_a_`) for this device, named `tokenName` (say, "Lantern on iPhone"): the name the account's tokens page lists it under, where it can be revoked. | `Promise<OwSignedIn>` |
| `acceptJoin(code)` | `POST /account/join` | accept an invite link's code as the account this client's `ow_a_` token belongs to: 201 with the new membership. | `Promise<OwJoinedMembership>` |
| `createWorldLink(worldId, opts)` | `POST /account/worlds/{worldId}/links` | a new invite link for a world this client's `ow_a_` token owns: `reader` is required (`person`, accepted with acceptJoin; `agent`, redeemed at POST /join; `player`, a friend with no account, redeemed with redeemJoin for a read key); `role`, when left out, is keel's default: guest for a person link, contributor for an agent link (a player link is guest, and refuses any other), `days` (1, 7 or 30) to 7; `withCharacter` (agent links only) to true; `character` (player links only) a Character's id or `new` (the default): whoever opens the link first reads as it, until removed. | `Promise<OwCreatedWorldLink>` |
| `listWorldLinks(worldId)` | `GET /account/worlds/{worldId}/links` | the world's invite links, without their codes: each with its status (pending, used, revoked or expired) and uses. | `Promise<OwWorldLink[]>` |
| `revokeWorldLink(worldId, linkId)` | `DELETE /account/worlds/{worldId}/links/{linkId}` | revoke a link: its code no longer works. | `Promise<void>` |
| `createSeat(worldId, opts)` | `POST /account/worlds/{worldId}/seats` | a seat for your own AI in a world you own or are a member of: its own membership, write key and `ow_s_` secret, no join link. | `Promise<OwSeatCreated>` |
| `listSeats(worldId)` | `GET /account/worlds/{worldId}/seats` | the live agent seats you can see: your own AI's, or, as the world's owner, every seat. | `Promise<OwSeat[]>` |
| `rekeySeat(worldId, seatId)` | `POST /account/worlds/{worldId}/seats/{seatId}/key` | a new key and secret for a seat whose AI lost its own: its sponsor or the world's owner may. | `Promise<OwSeatCreated>` |
| `removeSeat(worldId, seatId)` | `DELETE /account/worlds/{worldId}/seats/{seatId}` | remove an agent seat: its sponsor or the world's owner may. | `Promise<void>` |
| `setMemberLenses(worldId, memberId, lensIds)` |  | PATCH /account/worlds/{worldId}/members/{memberId} with `lenses` alone -- set the lenses a row starts with: lens ids in order, 0 to 20, repeats dropped by keel; an empty list is a choice too, and keeps a seat off its Titles' lenses, while `null` puts the row back to never chosen (a seat playing a Character then starts with its Titles' lenses; for `'owner'`, `null` is the empty list). | `Promise<OwMemberLenses>` |
| `hide(type, id)` | `PUT /{type}/{id}/hidden` | hide an element. | `Promise<void>` |
| `unhide(type, id)` | `DELETE /{type}/{id}/hidden` | clear the mark; an element that is not hidden stays as it is. | `Promise<void>` |
| `listHidden()` | `GET /world/hidden` | every hidden element of the world, newest first: `{type, id, set_at, set_by}` each (`set_by` null when the owner hid it). | `Promise<OwHiddenRow[]>` |
| `propose(type, id, input, opts?)` | `POST /{type}/{id}/proposals` | propose a change to an element without making it. | `Promise<OwProposal>` |
| `listProposals(type, id, opts?)` | `GET /{type}/{id}/proposals` | one element's proposals, newest first: every row for the owner's and a co-builder's keys, a member's own for any other. | `Promise<OwProposalList>` |
| `worldProposals(opts?)` | `GET /world/proposals` | the world's queue, newest first by created_at, two kinds of row told apart by `kind`: `proposal`, a proposed change to an element (OwProposal), and `new_element`, an element written as proposed, carrying `x_review_proposed` (OwProposedNewElement: settle it with reviewNewElement). | `Promise<OwWorldProposalList>` |
| `acceptProposal(type, id, pid)` | `POST /{type}/{id}/proposals/{pid}/accept` | write the proposal's fields to the element as one ordinary write by this key (`changed_by` is the keeper, a new change_seq, a /changes row), and the row turns accepted. | `Promise<OwProposalAccepted>` |
| `declineProposal(type, id, pid, opts?)` | `POST /{type}/{id}/proposals/{pid}/decline` | the row turns declined, with an optional `reason` (at most 2,000 characters); the element does not change. | `Promise<OwProposal>` |
| `withdrawProposal(type, id, pid)` | `DELETE /{type}/{id}/proposals/{pid}` | the proposer takes back its own undecided proposal, with any of its keys: the row goes. | `Promise<void>` |
| `reviewNewElement(type, id, opts)` | `POST /{type}/{id}/review` | settle a new element written as proposed, one carrying `x_review_proposed` (the queue's `new_element` row). | `Promise<OwReviewed>` |
| `listAccountWorlds()` | `GET /account/worlds` | every world the account owns or is a member of, with its keys by name and last four (a member sees only their own keys on a shared world). | `Promise<OwAccountWorld[]>` |
| `createAccountWorld(opts)` | `POST /account/worlds` | make a world on the account, with its one write key. | `Promise<OwCreatedAccountWorld>` |
| `mintWorldKey(worldId, opts?)` | `POST /account/worlds/{id}/keys` | mint a world key, `scope` `'write'` (the default) or `'read'`, `name` as the key list shows it (at most 255 characters). | `Promise<OwMintedKey>` |
| `revokeWorldKey(worldId, keyId, opts?)` | `DELETE /account/worlds/{worldId}/keys/{keyId}` | revoke a world key, by the `id` mintWorldKey returned: from then on it answers 401 `key_revoked`. | `Promise<void>` |
| `signInWithOnlyWorlds(opts)` |  | Start Sign in with OnlyWorlds from a tool's page: mint `state` and a PKCE verifier, keep them under `clientId` in `storage` (sessionStorage by default; in Node pass one), and send the browser to `https://www.onlyworlds.com/signin/authorize` (or only return the URL with `navigate: false`). | `Promise<OwSignInBegun>` |
| `completeSignIn(opts)` |  | Finish Sign in with OnlyWorlds on the callback page: check `state` against the record and the page against the registered address (scheme, host with port, and path, each exactly), take `code` and `state` out of the address bar (only when `url` is not given: a native app passes the address its loopback server or scheme handler received), trade the code once at `POST /auth/token` with the PKCE verifier and no credential, and return the `ow_a_` token with the account and `resume`. | `Promise<OwSignInResult>` |
| `ask(req)` | `POST /account/ask` | a question about a world the account owns or is in, answered by keel's AI proxy from `context` only (build it with buildAskContext from the elements the user sees; it leaves proposed, hidden and room elements out unless asked). | `Promise<OwAskAnswer>` |
| `sort(req)` | `POST /account/sort` | the user's unsorted notes, and the elements the app's own search found for them (`slice`: id, lowercase type, name, optional anchor; build it from lookupWorld's hits), sorted by the same proxy as ask into rows to review: `make`, `add_to`, `link`, `ask`. | `Promise<OwSortAnswer>` |
| `allowance()` | `GET /account/allowance` | the account's token rating, the one daily meter ask, sort and the Council spend from (keel 872431f): the rating, what is used and left today, and when it resets (the next midnight UTC). | `Promise<OwAllowance>` |
| `request(method, path, opts?)` |  | Raw authenticated request against this client's baseUrl. | `Promise<T>` |
