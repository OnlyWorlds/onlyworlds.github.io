---
title: TypeScript SDK
description: The @onlyworlds/sdk package, a typed client for the v2 API and the standard's constants, generated from schema-dist.
---

`@onlyworlds/sdk` is the typed client for the OnlyWorlds REST API v2. It also exports the standard's constants (the 22 element types, their icons, colour families and field schema), generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist) at a pinned, hash-verified tag. The generated files name that tag in their header.

The 4.x line speaks v2 only and is ESM-only (Node 18 or later). Tools on the v1 API dialect (`OnlyWorldsClient`) or on CommonJS `require()` stay on the 3.x line, which is still published.

## Install

```bash
npm install @onlyworlds/sdk
```

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

That makes one Character; open the world in Atlas and it is there. Links and edits go the same way:

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

To poll for news cheaply, `client.changesHead()` returns `{ head, cursor, epoch }` without reading any element (since 4.15.0; `epoch` since 4.16.0). Walk `changesAll` only when `head` has moved past the head you last applied, or when `epoch` changed: for a guest or a contributor it moves when what they may see changes, even with `head` unchanged. For the owner and co-builders it is `null`. A `delete` op's `reason` is `deleted`, or `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from the key: remove it from your copy either way.

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

## Find things in a world

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
const { context, kept } = buildAskContext(hits.slice(0, 8), index); // the hits you show, within the proxy's limits
const reply = await account.ask({ worldId, question, context });    // account: a client with an ow_a_ token
// reply.answer comes from those elements only, or is "The world doesn't say."
```

`kept` says which elements were sent, so the sources you show are the ones the answer used. Asking spends from the account's token rating, its daily budget of tokens: `reply.tokens_remaining` and `reply.token_rating` since 4.19.0, and `reply.remaining` counts the answers of this size still in it. Used up, it throws with `err.isQuotaExceeded`. `account.allowance()` reads the token rating without spending anything: `{ token_rating, tokens_used_today, tokens_remaining, resets_at }` (since 4.21.0).

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
```

From 4.49.0 both follow the folder format's archive section (§4.7, the `.owworld` file) and give its verdict on every fixture of its conformance set. The reader checks the archive's directory before it inflates anything and refuses a file before returning anything: a path that could land outside the folder (`unsafe_path`), more than 2 GiB or 500,000 files uncompressed, or an entry that inflates past the size it declares (`too_big`, `too_many`), no `world.json` with an `id` (`not_a_world`), more than one world (`more_than_one`; a `world.json` under `records/` is a producer's data, not a second world), two entries with one name (`duplicate`) or two names that are one after NFC and simple case folding (`collision`), a link or device entry (`link`), an encrypted, spanned or otherwise compressed entry (`method`), a name with a device name, a trailing dot or space, a forbidden character or no UTF-8 flag on non-ASCII (`name`), or a `mimetype` marker whose bytes are not `application/vnd.onlyworlds.world+zip` (`marker`; the marker is never required). Files beside the world's folder are ignored. `err.reason` on the `OwWorldFileError` says which, and `files` come back in code point order. The writer gives one set of bytes for one input: the marker first and stored, entries ordered by the UTF-8 bytes of their names, every entry stamped 1980-01-01, and only `world.json`, `elements/`, `spatial/`, `media/`, `records/` and a tool's dot-folder it is handed. Both functions remove `world.json`'s `api` block, so the world's link and key never travel in a file.

## World calendars

A world's time is an integer line: the world's now (`time_range_current`) and an Event's `start_date` are points on it. A calendar names those points with months, days and eras. Atlas keeps a calendar on an element in its `atlas_calendar` field, and the SDK reads it with its calendar code, which Atlas uses too (since 4.20.0). Atlas owns that field: read it, never write it.

```typescript
import { worldCalendars, resolveCalendarLens, formatStep, parseDate } from '@onlyworlds/sdk';

const calendars = worldCalendars(elements); // every element with a valid atlas_calendar
const cal = resolveCalendarLens(elements, chosenId, { fallbackToOnly: true }); // one calendar: used
if (cal) {
  formatStep(cal.config, 400);               // "4 Alturiak, 1 DR" (Harptos, from Atlas's tests)
  parseDate(cal.config, '4 Alturiak, 1 DR'); // { step: 400 }
}
```

No calendar, or a broken one, gives null: show the bare number.

## Errors

Every non-2xx answer throws `OwApiError` with the platform's error envelope: `.status`, `.type`, `.code`, `.param` (the field that failed, or `API-Pin` when a PIN was refused) and `.docUrl`, which links to the code on [the errors page](/api/errors). Show `docUrl` to your users. Transport failures throw `OwNetworkError`. `err.isValidationError` covers the common case. A write sent with `ifMatch` that found the element moved throws `OwPreconditionFailedError` (412, `err.isPreconditionFailed`), an `OwApiError` that also carries `current`. `signInWithPassword` throws `OwSignInError` instead, which is not an `OwApiError`: its `reason` says why, `status` and `code` are keel's answer when one came back, and `retryAfter` comes with a rate limit.

## Schema constants

```typescript
import {
  ELEMENT_TYPES,    // the 22 type slugs, and the ElementType union
  ELEMENT_ICONS,    // the Material Symbols icon for each type
  ELEMENT_LABELS,   // plural display labels
  ELEMENT_SECTIONS, // the field groups and their display order
  FIELD_SCHEMA,     // type and target of every field
  elementColor,     // the colour of a type's family
  fieldLabel,       // a field name as the words a tool shows
} from '@onlyworlds/sdk';

elementColor('character', 'dark');
fieldLabel('image_url'); // "Image URL"
```

Colour marks a type's family and the icon marks the type. Always pair a colour with its icon and label, because colour alone is not accessible. `fieldLabel` (since 4.34.0) writes a field's label in sentence case with acronyms kept (`birth_date` is "Birth date", `image_url` is "Image URL"; a word written all in capitals stays as written, so a custom `STR` is "STR", since 4.36.0), the house rule for OnlyWorlds tools; a tool that hides an extension prefix drops it before calling it. The package also ships `SCHEMA.md` (every field and its meaning, generated) and `AGENTS.md` for AI agents working in a codebase that uses it.

## SDK or MCP?

Use the SDK for known operations in code: reads, writes, sync, bulk. For an AI exploring a world from a chat or an agent, use the [MCP server](/docs/development/mcp) at `https://www.onlyworlds.com/mcp`. It takes the same `API-Key` and `API-Pin` headers.

## Links

- [npm](https://www.npmjs.com/package/@onlyworlds/sdk) · [Source](https://github.com/OnlyWorlds/sdk) · [Changelog](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md) · [Migrating from 3.x to 4.x](https://github.com/OnlyWorlds/sdk/blob/main/docs/migrating-3-to-4.md)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)

<!-- generated:sdk-reference (scripts/gen_sdk_ref.mjs rewrites everything below this line) -->

## Reference

Generated from the types of `@onlyworlds/sdk` 4.51.0, the version these docs pin. The full declarations ship in the package (`dist/index.d.ts`), with `SCHEMA.md` and `AGENTS.md` beside them.

### Client options

`new OwV2Client(config)` takes:

| Option | Type | Notes |
|---|---|---|
| `apiKey` | `string` | The key: an ow_w_ (write) or ow_r_ (read) world key, an ow_a_ account token (sent as a Bearer token, for the account routes), or a 10-digit legacy key. |
| `apiPin` | `string` | The PIN, needed for writes when the world has one, and for legacy-key reads of private worlds. |
| `baseUrl` | `string` | The API's base URL, default https://www.onlyworlds.com/api/v2. |
| `pageSize` | `number` | Page size for element lists, default 100 (the server's default; at most 1000). |
| `changesPageSize` | `number` | Page size for /changes pulls, default 100. |
| `fetch` | `typeof globalThis.fetch` | A fetch implementation to use instead of globalThis.fetch (for tests and other runtimes). |
| `agent` | `boolean` | Declare this client an AI agent: every element write (create, upsert, patch, delete, editLinks, bulk) carries `X-OW-Agent`, the operations keel declares it on, and keel records its writes as agent-made (`changed_via: 'declared'`; keel stores that the header was there, never its value). |

### Methods

| Method | Route | What it does | Returns |
|---|---|---|---|
| `health()` | `GET /health` | unauthenticated liveness pulse. | `Promise<unknown>` |
| `getWorld()` | `GET /world` | world meta (name, calendar/time fields, public_read). | `Promise<OwWorldMeta>` |
| `patchWorld(partial)` | `PATCH /world` | partial world-meta update. | `Promise<OwWorldMeta>` |
| `setMyCharacter(character)` | `PUT /me/character` | pick the roster Character that is you in this world, or none (keel PR 160, #533). | `Promise<OwMe>` |
| `me()` |  |  | `Promise<OwMe>` |
| `members()` | `GET /members` | the world's roster: each member's id (null for the owner), kind, role, Character and status (`removed` rows stay, so their elements keep `created_by`). | `Promise<OwMember[]>` |
| `list(type, params?)` | `GET /{type}/` | one cursor page. | `Promise<OwPage>` |
| `draught(characterId, policy?)` | `GET /character/{id}/context` | the draught (keel PR 155, D143): what one Character knows, as the recorded world holds it, in one read: her element, what she holds and sits in, her open work, how she works, the Events she was in, the Narratives she knows, everything else that names her, her sheet, what changed around her (`since`), and who plays whom; the world's name and calendar beside. | `Promise<OwDraught>` |
| `listAll(type, params?)` |  | Cursor-walk every page of a type. | `AsyncGenerator<OwElement>` |
| `get(type, id, opts?)` | `GET /{type}/{id}/` | optional one-level stub expansion / sparse fields, and `viewAs` (keel #421: the owner reads as another reader; see ListParams.viewAs). | `Promise<OwElement>` |
| `create(type, element, opts?)` | `POST /{type}/` | create one element, minting an id on the client when you leave id out. | `Promise<OwElement>` |
| `upsert(type, id, element)` | `PUT /{type}/{id}/` | The local-first write primitive. | `Promise<OwElement>` |
| `patch(type, id, partial, opts?)` | `PATCH /{type}/{id}/` | DESTRUCTIVE on sent fields: arrays replace wholesale, omitted fields stay untouched. | `Promise<OwElement>` |
| `delete(type, id)` | `DELETE /{type}/{id}/` | idempotent (204 on absent). | `Promise<void>` |
| `editLinks(type, id, field, edit, opts?)` | `POST /{type}/{id}/links/{field} with {add, remove}` | atomic link merge. | `Promise<OwElement>` |
| `adopt(type, id, member)` | `POST /{type}/{id}/adopt with {member}` | change who made an element (keel #427, D141). | `Promise<OwElement>` |
| `bulk(items, opts?)` | `POST /bulk` | up to ~1000 items. | `Promise<OwBulkResponse>` |
| `changes(opts?)` | `GET /changes` | one page of the world's ordered change feed. | `Promise<OwChangesPage>` |
| `changesHead()` | `GET /changes?head=true` | where the feed is now, without a page: no element is read. | `Promise<{ head: number; cursor: string; epoch: number | null; epoch_reason?: OwResyncReason | null; }>` |
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
| `redeemJoin(code, opts?)` | `POST /join` | redeem a join code that needs no account: a player's (a friend reading as a guest, keel #353) or an AI agent's. | `Promise<OwJoined>` |
| `signInWithPassword(opts)` |  | Sign in with an email address (or a username) and password, and get a new account token (`ow_a_`) for this device, named `tokenName` (say, "Lantern on iPhone"): the name the account's tokens page lists it under, where it can be revoked. | `Promise<OwSignedIn>` |
| `acceptJoin(code)` | `POST /account/join` | accept an invite link's code as the account this client's `ow_a_` token belongs to: 201 with the new membership. | `Promise<OwJoinedMembership>` |
| `createWorldLink(worldId, opts)` | `POST /account/worlds/{worldId}/links` | a new invite link for a world this client's `ow_a_` token owns (keel C1): `reader` is required (`person`, accepted with acceptJoin; `agent`, redeemed at POST /join; `player`, a friend with no account, redeemed with redeemJoin for a read key, keel #353); `role`, when left out, is keel's default: guest for a person link, contributor for an agent link (a player link is guest, and refuses any other), `days` (1, 7 or 30) to 7; `withCharacter` (agent links only) to true; `character` (player links only) a Character's id or `new` (the default): whoever opens the link first reads as it, until removed. | `Promise<OwCreatedWorldLink>` |
| `listWorldLinks(worldId)` | `GET /account/worlds/{worldId}/links` | the world's invite links, without their codes: each with its status (pending, used, revoked or expired) and uses. | `Promise<OwWorldLink[]>` |
| `revokeWorldLink(worldId, linkId)` | `DELETE /account/worlds/{worldId}/links/{linkId}` | revoke a link: its code no longer works. | `Promise<void>` |
| `createSeat(worldId, opts)` | `POST /account/worlds/{worldId}/seats` | a seat for your own AI in a world you own or are a member of: its own membership, write key and `ow_s_` secret, no join link. | `Promise<OwSeatCreated>` |
| `listSeats(worldId)` | `GET /account/worlds/{worldId}/seats` | the live agent seats you can see: your own AI's, or, as the world's owner, every seat. | `Promise<OwSeat[]>` |
| `rekeySeat(worldId, seatId)` | `POST /account/worlds/{worldId}/seats/{seatId}/key` | a new key and secret for a seat whose AI lost its own: its sponsor or the world's owner may. | `Promise<OwSeatCreated>` |
| `removeSeat(worldId, seatId)` | `DELETE /account/worlds/{worldId}/seats/{seatId}` | remove an agent seat: its sponsor or the world's owner may. | `Promise<void>` |
| `hide(type, id)` | `PUT /{type}/{id}/hidden` | hide an element (keel #421). | `Promise<void>` |
| `unhide(type, id)` | `DELETE /{type}/{id}/hidden` | clear the mark; an element that is not hidden stays as it is. | `Promise<void>` |
| `listHidden()` | `GET /world/hidden` | every hidden element of the world, newest first: `{type, id, set_at, set_by}` each (`set_by` null when the owner hid it). | `Promise<OwHiddenRow[]>` |
| `listAccountWorlds()` | `GET /account/worlds` | every world the account owns or is a member of, with its keys by name and last four (a member sees only their own keys on a shared world). | `Promise<OwAccountWorld[]>` |
| `mintWorldKey(worldId, opts?)` | `POST /account/worlds/{id}/keys` | mint a world key, `scope` `'write'` (the default) or `'read'`, `name` as the key list shows it (at most 255 characters). | `Promise<OwMintedKey>` |
| `signInWithOnlyWorlds(opts)` |  | Start Sign in with OnlyWorlds from a tool's page: mint `state` and a PKCE verifier, keep them under `clientId` in `storage` (sessionStorage by default; in Node pass one), and send the browser to `https://www.onlyworlds.com/signin/authorize` (or only return the URL with `navigate: false`). | `Promise<OwSignInBegun>` |
| `completeSignIn(opts)` |  | Finish Sign in with OnlyWorlds on the callback page: check `state` against the record and the page against the registered address, take `code` and `state` out of the address bar, trade the code once at `POST /auth/token` with the PKCE verifier and no credential, and return the `ow_a_` token with the account and `resume`. | `Promise<OwSignInResult>` |
| `ask(req)` | `POST /account/ask` | a question about a world the account owns or is in, answered by keel's AI proxy from `context` only (build it with buildAskContext from the elements the user sees). | `Promise<OwAskAnswer>` |
| `sort(req)` | `POST /account/sort` | the user's unsorted notes, and the elements the app's own search found for them (`slice`: id, lowercase type, name, optional anchor; build it from lookupWorld's hits), sorted by the same proxy as ask into rows to review: `make`, `add_to`, `link`, `ask`. | `Promise<OwSortAnswer>` |
| `allowance()` | `GET /account/allowance` | the account's token rating, the one daily meter ask, sort and the Council spend from (keel 872431f): the rating, what is used and left today, and when it resets (the next midnight UTC). | `Promise<OwAllowance>` |
| `request(method, path, opts?)` |  | Raw authenticated request against this client's baseUrl. | `Promise<T>` |
