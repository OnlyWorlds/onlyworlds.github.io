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

## Follow changes

```typescript
let cursor; // opaque and never expires: persist it
for await (const change of client.changesAll(cursor)) {
  // changes arrive in (change_seq, id) order; apply them in order
}
```

Edits to the world itself (its name, calendar, `public_read`) do not enter the change feed. Poll `client.getWorld()` and compare `updated_at` for those. See [Sync with Changes](/docs/development/api/changes).

## Errors

Every non-2xx answer throws `OwApiError` with the platform's error envelope: `.status`, `.type`, `.code`, `.param` (the field that failed) and `.docUrl`, which links to the code on [the errors page](/api/errors). Show `docUrl` to your users. Transport failures throw `OwNetworkError`. `err.isValidationError` covers the common case.

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

Generated from the types of `@onlyworlds/sdk` 4.6.0, the version these docs pin. The full declarations ship in the package (`dist/index.d.ts`), with `SCHEMA.md` and `AGENTS.md` beside them.

### Client options

`new OwV2Client(config)` takes:

| Option | Type | Notes |
|---|---|---|
| `apiKey` (required) | `string` | ow_w_ / ow_r_ / ow_a_ prefixed key, or grandfathered 10-digit legacy key. |
| `apiPin` | `string` | Required for writes when the world has a PIN, and for legacy-key reads of private worlds. |
| `baseUrl` | `string` | Default: https://www.onlyworlds.com/api/v2 |
| `pageSize` | `number` | Page size for element lists. |
| `changesPageSize` | `number` | Page size for /changes pulls. |
| `fetch` | `typeof globalThis.fetch` | Injectable for tests / fake-keel harnesses. |

### Methods

| Method | Route | What it does | Returns |
|---|---|---|---|
| `health()` | `GET /health` | unauthenticated liveness pulse. | `Promise<unknown>` |
| `getWorld()` | `GET /world` | world meta (name, calendar/time fields, public_read). | `Promise<OwWorldMeta>` |
| `patchWorld(partial)` | `PATCH /world` | partial world-meta update. | `Promise<OwWorldMeta>` |
| `list(type, params?)` | `GET /{type}/` | one cursor page. | `Promise<OwPage>` |
| `listAll(type, params?)` |  | Cursor-walk every page of a type. | `AsyncGenerator<OwElement>` |
| `get(type, id, opts?)` | `GET /{type}/{id}/` | optional one-level stub expansion / sparse fields. | `Promise<OwElement>` |
| `create(type, element, opts?)` | `POST /{type}/` | Mints an RFC 9562 UUIDv7 for element.id when the caller omits one (design ruling D29d) so a retry carrying the same Idempotency-Key is structurally safe. | `Promise<OwElement>` |
| `upsert(type, id, element)` | `PUT /{type}/{id}/` | The local-first write primitive. | `Promise<OwElement>` |
| `patch(type, id, partial)` | `PATCH /{type}/{id}/` | DESTRUCTIVE on sent fields: arrays replace wholesale, omitted fields stay untouched. | `Promise<OwElement>` |
| `delete(type, id)` | `DELETE /{type}/{id}/` | idempotent (204 on absent). | `Promise<void>` |
| `editLinks(type, id, field, edit)` | `POST /{type}/{id}/links/{field} with {add, remove}` | atomic link merge. | `Promise<OwElement>` |
| `bulk(items, opts?)` | `POST /bulk` | up to ~1000 items. | `Promise<OwBulkResponse>` |
| `changes(opts?)` | `GET /changes` | one page of the world's ordered change feed. | `Promise<OwChangesPage>` |
| `changesAll(since?)` |  | Walk the feed from `since` (or from zero = full export) to the current tail, yielding ops in order. | `AsyncGenerator<OwChange, { cursor: string; head: number; }>` |
| `createMediaTicket()` | `POST /media/ticket` | permission to upload ONE image into this world (a write key and its PIN; no body). | `Promise<OwMediaTicket>` |
| `uploadImage(image, opts?)` |  | Upload one image and get its permanent public URL: a ticket from keel, then the bytes straight to the edge (keel never sees them). | `Promise<OwUploadedImage>` |
| `request(method, path, opts?)` |  | Raw authenticated request against this client's baseUrl. | `Promise<T>` |
