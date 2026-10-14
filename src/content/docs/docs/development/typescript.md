---
title: TypeScript SDK
description: The @onlyworlds/sdk package, a typed client for the v2 API and the schema's constants, generated from schema-dist.
---

`@onlyworlds/sdk` is the typed client for the OnlyWorlds REST API v2. It also exports the schema's constants (the 22 element types, their icons, colour families and field schema), generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist) at a pinned, hash-verified tag. The generated files name that tag in their header.

The 4.x line speaks v2 only and is ESM-only (Node 18 or later). Tools on the v1 API dialect (`OnlyWorldsClient`) or on CommonJS `require()` stay on the 3.x line, which is still published.

## Install

```bash
npm install @onlyworlds/sdk
```

## Read a world

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const client = new OwV2Client({ apiKey: 'ow_r_your_key' });
const page = await client.list('character'); // { data, has_more, next_cursor }

for await (const character of client.listAll('character')) {
  console.log(character.name);
}
```

A read-only key (`ow_r_`) needs no PIN. Two demo keys read public sample worlds: `0000000000` (Hyperion) and `0000000001` (Moppetopia). See [Keys and PINs](/docs/getting-started/keys) for the key types.

## Write

```typescript
const writer = new OwV2Client({ apiKey: 'ow_w_your_key', apiPin: '1234' });

const peak = await writer.create('location', { name: 'Dragon Peak' });
const dragon = await writer.create('creature', { name: 'Vorrath', location: peak.id });

await writer.patch('location', peak.id, { supertype: 'Mountain' });

const breath = await writer.create('ability', { name: 'Ember Breath' });
await writer.editLinks('creature', dragon.id, 'abilities', { add: [breath.id], remove: [] });
```

The v2 rules the client follows:

- A link field has one bare name in both directions (`location`, `abilities`). The `_id` and `_ids` suffixes belong to v1.
- Never send a `world` field: the key decides the world, and the client strips the field.
- `name` is the one required field. `''` and `null` are accepted and stored as `''`.
- An `id` is minted on the client when you leave it out, so a retried create stays idempotent. (A plain REST request without an `id` gets one from the server instead.)
- `patch` replaces every field it sends, and an array replaces the whole list. To add or remove links without replacing them, use `editLinks`.
- To write only if nobody changed the element since you read it, pass `{ ifMatch: el.change_seq }` to `patch` or `editLinks` (since 4.9.0). If it moved, nothing is written and the call throws `OwPreconditionFailedError`, whose `current` is the element as it is now. See [Only if unchanged](/docs/development/api/writes#only-if-unchanged).

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
- The server stores every 2xx answer under its idempotency key, and never an error. So when an answer is lost, retry with the **same** key: a stored answer replays, and an error runs again.
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

To poll for news cheaply, `client.changesHead()` returns `{ head, cursor, epoch }` without reading any element (since 4.15.0; `epoch` since 4.16.0). Walk `changesAll` only when `head` has moved past the head you last applied, or when `epoch` changed: for a guest it moves when what they may see changes, even with `head` unchanged. For everyone else it is `null`.

Edits to the world itself (its name, calendar, `public_read`) do not enter the change feed. Poll `client.getWorld()` and compare `updated_at` for those. See [Sync with Changes](/docs/development/api/changes).

## Invite links

A world's owner can invite a person with a link (see [Invite Links](/docs/development/api/members#invite-links)). The code is the part after `#` (since 4.12.0):

```typescript
const invite = await client.previewJoin(code);    // who invites, which world, what role; sends no key
const membership = await account.acceptJoin(code); // account: a client with an ow_a_ token
```

A bad code is one 404 (`err.isNotFound`). Accepting can answer `err.isAlreadyMember` or `err.isPinRequired` (the account needs a PIN first). A refusal never uses up the code.

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

`kept` says which elements were sent, so the sources you show are the ones the answer used. Asking spends from the account's daily AI allowance in tokens: `reply.tokens_remaining` and `reply.token_rating` since 4.19.0, and `reply.remaining` counts the answers of this size still in it. Used up, it throws with `err.isQuotaExceeded`.

The same proxy [sorts loose notes](/docs/development/ai#sort-notes-into-a-world) into rows for the user to review (since 4.18.0). Send what your lookup found as the slice; every id in a row comes from it, and nothing is written until your app applies what the user accepts:

```typescript
const slice = hits.slice(0, 100).map(({ element: e }) => ({ id: e.id, type: e.type, name: e.name }));
const { rows, not_proposed } = await account.sort({ worldId, notes: ['Mira moved to Ostvik.'], slice });
// rows: make, add_to, link, or ask (with candidates); one question from the same allowance
```

## World files

A world file is one `.zip` holding a whole world folder (`world.json` and `elements/<type>/*.json`), the file Atlas downloads and opens. Reading and writing one needs no account, and works in the browser and in Node (since 4.10.0).

```typescript
import { readWorldFile, writeWorldFile, OwWorldFileError } from '@onlyworlds/sdk';

const world = readWorldFile(bytes); // a Uint8Array
// world.worldId, world.name, world.world (world.json), world.files: [{ path, data }]

const zip = writeWorldFile(world.files, 'hollow-reach-0192a000'); // one top-level folder
```

The reader refuses a file before returning anything: a path that could land outside the folder, more than 1 GiB or 200,000 files uncompressed, no `world.json` with an `id`, or more than one world. `err.reason` on the `OwWorldFileError` says which. Both functions remove `world.json`'s `api` block, so the world's link and key never travel in a file.

## Errors

Every non-2xx answer throws `OwApiError` with the platform's error envelope: `.status`, `.type`, `.code`, `.param` (the field that failed) and `.docUrl`, which links to the code on [the errors page](/api/errors). Show `docUrl` to your users. Transport failures throw `OwNetworkError`. `err.isValidationError` covers the common case. A write sent with `ifMatch` that found the element moved throws `OwPreconditionFailedError` (412, `err.isPreconditionFailed`), an `OwApiError` that also carries `current`.

## Schema constants

```typescript
import {
  ELEMENT_TYPES,    // the 22 type slugs, and the ElementType union
  ELEMENT_ICONS,    // the Material Symbols icon for each type
  ELEMENT_LABELS,   // plural display labels
  ELEMENT_SECTIONS, // the field groups and their display order
  FIELD_SCHEMA,     // type and target of every field
  elementColor,     // the colour of a type's family
} from '@onlyworlds/sdk';

elementColor('character', 'dark');
```

Colour marks a type's family and the icon marks the type. Always pair a colour with its icon and label, because colour alone is not accessible. The package also ships `SCHEMA.md` (every field and its meaning, generated) and `AGENTS.md` for AI agents working in a codebase that uses it.

## SDK or MCP?

Use the SDK for known operations in code: reads, writes, sync, bulk. For an AI exploring a world from a chat or an agent, use the [MCP server](/docs/development/mcp) at `https://www.onlyworlds.com/mcp`. It takes the same `API-Key` and `API-Pin` headers.

## Links

- [npm](https://www.npmjs.com/package/@onlyworlds/sdk) · [Source](https://github.com/OnlyWorlds/sdk) · [Changelog](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md) · [Migrating from 3.x to 4.x](https://github.com/OnlyWorlds/sdk/blob/main/docs/migrating-3-to-4.md)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)

<!-- generated:sdk-reference (scripts/gen_sdk_ref.mjs rewrites everything below this line) -->

## Reference

Generated from the types of `@onlyworlds/sdk` 4.19.0, the version these docs pin. The full declarations ship in the package (`dist/index.d.ts`), with `SCHEMA.md` and `AGENTS.md` beside them.

### Client options

`new OwV2Client(config)` takes:

| Option | Type | Notes |
|---|---|---|
| `apiKey` (required) | `string` | The key: an ow_w_ (write) or ow_r_ (read) world key, an ow_a_ account token (sent as a Bearer token, for the account routes), or a 10-digit legacy key. |
| `apiPin` | `string` | The PIN, needed for writes when the world has one, and for legacy-key reads of private worlds. |
| `baseUrl` | `string` | The API's base URL, default https://www.onlyworlds.com/api/v2. |
| `pageSize` | `number` | Page size for element lists, default 100 (the server's default; at most 1000). |
| `changesPageSize` | `number` | Page size for /changes pulls, default 100. |
| `fetch` | `typeof globalThis.fetch` | A fetch implementation to use instead of globalThis.fetch (for tests and other runtimes). |

### Methods

| Method | Route | What it does | Returns |
|---|---|---|---|
| `health()` | `GET /health` | unauthenticated liveness pulse. | `Promise<unknown>` |
| `getWorld()` | `GET /world` | world meta (name, calendar/time fields, public_read). | `Promise<OwWorldMeta>` |
| `patchWorld(partial)` | `PATCH /world` | partial world-meta update. | `Promise<OwWorldMeta>` |
| `list(type, params?)` | `GET /{type}/` | one cursor page. | `Promise<OwPage>` |
| `listAll(type, params?)` |  | Cursor-walk every page of a type. | `AsyncGenerator<OwElement>` |
| `get(type, id, opts?)` | `GET /{type}/{id}/` | optional one-level stub expansion / sparse fields. | `Promise<OwElement>` |
| `create(type, element, opts?)` | `POST /{type}/` | create one element, minting a UUIDv7 id on the client when you leave id out. | `Promise<OwElement>` |
| `upsert(type, id, element)` | `PUT /{type}/{id}/` | The local-first write primitive. | `Promise<OwElement>` |
| `patch(type, id, partial, opts?)` | `PATCH /{type}/{id}/` | DESTRUCTIVE on sent fields: arrays replace wholesale, omitted fields stay untouched. | `Promise<OwElement>` |
| `delete(type, id)` | `DELETE /{type}/{id}/` | idempotent (204 on absent). | `Promise<void>` |
| `editLinks(type, id, field, edit, opts?)` | `POST /{type}/{id}/links/{field} with {add, remove}` | atomic link merge. | `Promise<OwElement>` |
| `bulk(items, opts?)` | `POST /bulk` | up to ~1000 items. | `Promise<OwBulkResponse>` |
| `changes(opts?)` | `GET /changes` | one page of the world's ordered change feed. | `Promise<OwChangesPage>` |
| `changesHead()` | `GET /changes?head=true` | where the feed is now, without a page: no element is read. | `Promise<{ head: number; cursor: string; epoch: number | null; }>` |
| `changesAll(since?)` |  | Walk the feed from `since` (or from zero = full export) to the current tail, yielding ops in order. | `AsyncGenerator<OwChange, { cursor: string; head: number; epoch: number | null; }>` |
| `createMediaTicket()` | `POST /media/ticket` | permission to upload ONE image into this world (a write key and its PIN; no body). | `Promise<OwMediaTicket>` |
| `uploadImage(image, opts?)` |  | Upload one image and get its permanent public URL: a ticket from the API, then the bytes straight to the media edge (the API never sees them). | `Promise<OwUploadedImage>` |
| `createRemovalTicket(key)` | `POST /media/remove-ticket` | permission to remove ONE image (a write key and its PIN). | `Promise<OwRemovalTicket>` |
| `removeImage(keyOrUrl, opts?)` |  | Remove one uploaded image: a removal ticket from the API, then the removal at the edge (the API key never leaves for the edge). | `Promise<OwRemovedImage>` |
| `previewJoin(code)` | `POST /join/preview` | what a join code holds, without using it: who invites, to which world, in what role, and `reader` (`person`: accept it with acceptJoin; `agent`: an AI agent redeems it at POST /join). | `Promise<OwJoinPreview>` |
| `acceptJoin(code)` | `POST /account/join` | accept an invite link's code as the account this client's `ow_a_` token belongs to: 201 with the new membership. | `Promise<OwJoinedMembership>` |
| `ask(req)` | `POST /account/ask` | a question about a world the account owns or is in, answered by keel's AI proxy from `context` only (build it with buildAskContext from the elements the user sees). | `Promise<OwAskAnswer>` |
| `sort(req)` | `POST /account/sort` | the user's unsorted notes, and the elements the app's own search found for them (`slice`: id, lowercase type, name, optional anchor; build it from lookupWorld's hits), sorted by the same proxy as ask into rows to review: `make`, `add_to`, `link`, `ask`. | `Promise<OwSortAnswer>` |
| `request(method, path, opts?)` |  | Raw authenticated request against this client's baseUrl. | `Promise<T>` |
