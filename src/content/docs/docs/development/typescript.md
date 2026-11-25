---
title: TypeScript SDK
description: The @onlyworlds/sdk package, a typed client for the v2 API and the standard's constants, generated from schema-dist.
---

New to OnlyWorlds? [Your first hour](/docs/getting-started/first-hour) reads a world, writes to the practice world and deletes again, in one short page. This page covers the whole package.

`@onlyworlds/sdk` is the typed client for the OnlyWorlds REST API v2. It also exports the standard's constants (the 22 element types, their icons, colour groups and field schema), generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist) at a pinned, hash-verified tag. The generated files name that tag in their header.

The 4.x line speaks v2 only and is ESM-only (Node 18 or later). Tools on the v1 API dialect (`OnlyWorldsClient`) or on CommonJS `require()` stay on the 3.x line, which is still published ([Migrating from 3.x to 4.x](https://github.com/OnlyWorlds/sdk/blob/main/docs/migrating-3-to-4.md)).

This page covers installing, reading, writing, bulk writes, errors, images, files, hidden elements, following changes, context for an AI, world files and the schema constants. Two more pages cover the rest of the package:

- [Accounts, members and sharing](/docs/development/typescript-accounts): signing in, invite links, a seat for your AI, a world on the account and proposed changes.
- [Reading worlds as a tool](/docs/development/typescript-readers): the readers a tool uses to show a world it has read, from search and lenses to calendars, messages and the Open with menu.

Every method of the client, with the route it calls and what it returns, is in the [Reference](#reference) at the end of this page.

## SDK or MCP?

Use the SDK for known operations in code: reads, writes, sync, bulk. For an AI exploring a world from a chat or an agent, use the [MCP server](/docs/development/mcp) (MCP is the Model Context Protocol) at `https://www.onlyworlds.com/mcp`. It takes the same `API-Key` and `API-Pin` headers.

## Install

```bash
npm install @onlyworlds/sdk
```

Types are included, and TypeScript is optional: a JavaScript project installs no compiler.

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

`await client.search('Fluffington', { limit: 200 })` finds the elements whose name or text holds every word you give ([Search](/docs/development/api/reads#search)).

`(await client.getWorld()).counts` says how many elements the key may read, in all and per type: `{ total, types: { character, location, … } }`. `await client.get('character', id)` reads one element.

For your own world, use its read-only key (`ow_r_`), which needs no PIN. The other demo key, `0000000000`, reads Hyperion. See [Keys and PINs](/docs/getting-started/keys) for the key types.

With no key at all, a client given a world's id reads what the public reads of it ([the keyless reads](/docs/development/api/public#the-keyless-reads)), and `getWorld()` then carries `counts`:

```typescript
const open = new OwV2Client({ world: worldId }); // no key: what the public reads
```

## Write

Keep the write key and PIN out of the code, in a `.env` file beside it. These two are the [practice world](/docs/getting-started/keys#the-practice-world)'s, which anyone may write to and which goes back to the same copy every night; for your own world, put in its `ow_w_` key, minted on the world's page on onlyworlds.com ([Key types](/docs/getting-started/keys#key-types)), and your account's [PIN](/docs/getting-started/keys#the-pin).

```bash
OW_API_KEY=ow_w_QRRMlAFPF9vPZSqmiV6QJm2HDJH_sP28x2RccPmYP1A
OW_API_PIN=1234
```

and run the script with `node --env-file=.env write.mjs` (Node 20.6 or later):

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const writer = new OwV2Client({ apiKey: process.env.OW_API_KEY, apiPin: process.env.OW_API_PIN });

const ranger = await writer.create('character', { name: 'Ilse the Ranger' });
console.log('made', ranger.name, ranger.id);
```

That makes one Character and prints its name and id. To see it in the world, run the read above with `apiKey: process.env.OW_API_KEY` in place of the demo key. Each type's fields and links are listed on its [type page](/docs/schema/element_categories), and in code `FIELD_SCHEMA` gives them ([Schema constants](#schema-constants)). Links and edits go the same way:

```typescript
const peak = await writer.create('location', { name: 'Dragon Peak' });
await writer.patch('character', ranger.id, { location: peak.id });
const dragon = await writer.create('creature', { name: 'Vorrath', location: peak.id });

await writer.patch('location', peak.id, { supertype: 'Mountain' });

const breath = await writer.create('ability', { name: 'Ember Breath' });
await writer.editLinks('creature', dragon.id, 'abilities', { add: [breath.id], remove: [] });
```

The client sends the PIN only where the server checks it: on writes, on `me()`, and on every call with a 10-digit legacy key, when you gave one (the public demo keys read without a PIN). A prefixed key's reads go without it, which spares the server a verification per read.

### Rules every write follows

- A link field has one bare name in both directions (`location`, `abilities`). The `_id` and `_ids` suffixes belong to v1.
- Never send a `world` field: the key decides the world, and the client strips the field.
- `name` is the one required field. `''` and `null` are accepted and stored as `''`.
- `patch` replaces every field it sends, and an array replaces the whole list. To add or remove links without replacing them, use `editLinks`.

### Safe retries, conflicts and naming

These are optional; use them when you need them.

- **Retries: `idempotencyKey`.** Pass one to `create` or `bulk` whenever a lost answer could make you send the call again. The id then comes from the key, so the same call with the same key replays the first answer instead of writing twice.

  Without a key, an `id` is minted on the client when you leave it out (in `create` and in each item of `bulk`), a fresh one for each call. A plain REST request without an `id` gets one from the server instead.
- **Only if unchanged: `ifMatch`.** Pass `{ ifMatch: el.change_seq }` to `patch` or `editLinks` when the write must not land if somebody changed the element since you read it. If it moved, nothing is written and the call throws `OwPreconditionFailedError`, whose `current` is the element as it is now. See [Only if unchanged](/docs/development/api/writes#only-if-unchanged).
- **An AI agent: `agent`.** Set `new OwV2Client({ ..., agent: true })` when your code is an AI agent. It sends `X-OW-Agent` on the client's element writes, and OnlyWorlds records them as an AI's. A tool people use leaves it off, since it would mark every person's edit. See [Agents](/docs/development/agents).
- **Your tool's name: `client`.** Set `new OwV2Client({ ..., client: 'atlas' })` to your tool's name. It is sent as `X-OW-Client` on every element write (and on a proposal, its accept and a review), never on a read or another write, and OnlyWorlds keeps the name on the element as `changed_client` ([a write can name its client](/docs/development/api/writes#agent-writes)).

  The default is `sdk`. A name outside lower case letters, digits and hyphens, 1 to 32 characters, is a `TypeError` at construction.

Every element read carries `changed_by` and `changed_via`, the last write's member and door (the way it came in: [the doors](/docs/development/api/reads#what-an-element-carries)); `isAgentDoor(el.changed_via)` is true for an [AI seat](/docs/development/api/members#ai-seats) (an AI that is a member of the world), the MCP server or a client that declared itself.

## Bulk writes

`bulk` writes many elements in one request. Its answer has one slot per item you sent: `res.items` lines up with your list, and each slot carries its own `status`. A bulk write succeeds partly by default: HTTP 200 with a status per slot, so check `errors` every time.

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

A slot holds the API's own answer for that item, so its fields keep the API's spelling (`doc_url`), where a thrown `OwApiError` says `docUrl`. `{ atomic: true }` makes the batch all or nothing. After a failed atomic batch nothing was written, but the slots that would have succeeded still report 201: do not record those ids as created.

To retry a bulk write safely:

1. Send it with an `idempotencyKey`, and keep the key until you have the answer. The server stores every 2xx answer under its idempotency key, and never an error.
2. If the answer is lost, retry with the **same** key and body: a stored answer replays (`res.wasReplay` is true when the server answered from that store), and an error runs again. If the first request is still running, the retry throws with `err.isIdempotencyInFlight` (409): wait `err.retryAfter` seconds and send it again, same key and body.
3. If the answer came back with item errors, it is still a 200, so it is stored too, and the same key would replay the same errors. Fix the failed items and send them with a **new** key.

## Errors

Every non-2xx answer throws `OwApiError` with the platform's error envelope: `.status`, `.type`, `.code`, `.param` (the field that failed, or `API-Pin` when a PIN was refused) and `.docUrl`, which links to the code on [the errors page](/api/errors). Show `docUrl` to your users.

Transport failures throw `OwNetworkError`. `err.isValidationError` covers the common case. A read of an element this world deleted throws with `status` 410 and `code` `'gone'`; `err.isNotFound` is the 404 alone. A write sent with `ifMatch` that found the element moved throws `OwPreconditionFailedError` (412, `err.isPreconditionFailed`), an `OwApiError` that also carries `current`.

The client never retries. On a 429 `too_many_requests` or a 503 `server_busy`, wait `err.retryAfter` seconds (read from `Retry-After`) and send the request again; the [Python package](/docs/development/python) retries those itself.

[`signInWithPassword`](/docs/development/typescript-accounts#sign-in-with-a-password) throws `OwSignInError` instead, which is not an `OwApiError`: its `reason` says why, `status` and `code` are the server's answer when one came back, and `retryAfter` comes with a rate limit.

A write that a world's [proposals switch](/docs/development/api/proposals#the-switch) (**AI seats propose, a person accepts**) turned into a [proposal](/docs/development/typescript-accounts#proposed-changes) throws `OwProposedError` (202, `err.isProposed`, `err.proposal`), and an accept on a moved field `OwStaleProposalError` (409, `err.isStaleProposal`, `err.conflicts`, `err.current`). The other proposal refusals read as `err.isFieldNotVisible`, `err.isTooManyOpen`, `err.isProposedOnly`, `err.isOwnProposal` and `err.isNotProposed`.

## Images

```typescript
const image = await writer.uploadImage(file); // a Blob, File, ArrayBuffer or Uint8Array
await writer.patch('character', id, { image_url: image.url });
```

This makes two requests: a single-use ticket from the API, then the bytes straight to the media edge. The API never sees the bytes, and the edge never sees your key. Accepted formats are webp, png, jpeg and avif, read from the bytes (never SVG or gif), up to 15 MB ([Images](/docs/development/api/images)). An image larger than the ticket allows throws 413 `too_large` before any byte is sent. Each ticket counts toward the world's daily limit and the account's image storage.

For a progress bar, call `createMediaTicket()` and POST the bytes to its `upload_url` yourself, with `Authorization: Bearer <ticket>`.

In a browser, shrink a phone photo before uploading it:

```typescript
import { preparePhoto } from '@onlyworlds/sdk';

const photo = await preparePhoto(file); // longest side 2048, webp (where the browser can't encode webp: PNG for a PNG or a picture with transparency, else JPEG)
const image = await writer.uploadImage(photo.blob);
```

`removeImage(keyOrUrl)` takes an uploaded image down, given its `image_url` or its object key: a removal ticket from the API, then the removal at the edge. The image's uploader or the world's owner may remove it, and the space goes back to the uploader's storage. Removal leaves elements as they are, so clear their `image_url` yourself: `(await writer.createRemovalTicket(key)).referenced` says how many still show it. A copy the network or a browser already holds can keep answering for a while ([Removing an image](/docs/development/api/images#removing-an-image)).

## Files

An element can carry files: PDF, text, Markdown, JSON, CSV, YAML, TOML, an image (PNG, JPEG, WebP, AVIF), or a zip that is a world's own bundle. A file sits beside its element, never in its body or the change feed ([Files](/docs/development/api/files)).

`uploadFile(type, id, file)` attaches one, the same two steps as an image: a ticket from the API, then the bytes straight to the upload host. `listFiles(type, id)` lists an element's files, and `worldFiles()` every file in the world with the world's total. `fileDownloadLink(type, id, fileId)` gives a link to one that works for five minutes, and `removeFile(type, id, fileId)` deletes it.

`uploadFile` takes a File, a Blob, an ArrayBuffer or a Uint8Array. The name is a File's own unless you pass `name` (anything but a File needs one), and the kind is read from the name's extension. To send the bytes yourself, `createFileTicket(type, id, { name, size })` gives the ticket alone. `onProgress(loaded, total)` reports the bytes sent: in a browser through XMLHttpRequest, and elsewhere once, when the upload has succeeded. The limits are 25 MB a file, 250 MB a world and 200 tickets a world a day, and their refusals read as `err.isFileTooLarge` (413), `err.isFilesFull` (403) and `err.isQuotaExceeded` (429, with `err.retryAfter`). The download link is the credential to the file: ask for it when the file is opened, and do not keep it.

## Hidden elements

The world's owner and its co-builders can hide an element: it stays in the world, and only they and the member who created it still see it ([Hidden elements](/docs/development/api/hidden)). `hide(type, id)` sets the mark and `unhide(type, id)` clears it, with a write key and its PIN; neither changes the element's fields or its `change_seq`. `listHidden()` lists every hidden element of the world, for the owner's and the co-builders' keys.

## Follow changes

To keep a copy of a world up to date, poll `client.changesHead()`, which reads no element. When its `head` has moved past the head you last applied, walk `client.changesAll(cursor)` from your saved cursor and apply each change in order.

```typescript
let cursor; // opaque and never expires: persist it
for await (const change of client.changesAll(cursor)) {
  // changes arrive in (change_seq, id) order; apply them in order
}
```

`client.changesHead()` returns `{ head, cursor, epoch, unchanged }`:

- `head` is the world's `change_seq` now: where the change feed has got to.
- `cursor` is a position in the feed to pass back to `changesAll`. It is opaque: store it as it came, never build one.
- `epoch` is for a guest or a contributor (the [roles](/docs/development/api/members#roles) that see less than the whole world): it moves when what they may see changes, even with `head` unchanged, so walk the feed when it changes too. For the owner and co-builders it is `null`.
- `unchanged` is true when the poll found nothing new.

The poll is conditional: the client keeps the `ETag` (the server's tag for that answer) of its last `200` and sends it back as `If-None-Match`, so an unmoved head is a `304` that onlyworlds.com does not count against your budget, returned as the head it holds with `unchanged: true`. A `409` clears the tag so the next poll is a full read with `epoch_reason`.

A `delete` op's `reason` is `deleted`, or `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from the key: remove it from your copy either way.

Edits to the world itself (its name, calendar, `public_read`) do not enter the change feed. Poll `client.getWorld()` and compare `updated_at` for those. See [Sync with changes](/docs/development/api/changes).

`client.patchWorld(partial)` writes the world's own settings ([The world](/docs/development/api/writes#the-world)) and takes a `getWorld()` body back: it leaves out the keys the server does not take there (`id`, `slug`, `public_page`, `public_read`, `agent_narrator_rule`, `agent_writes_proposed`, `origin` and `counts`, and an element's read-only keys: `world`, `type`, `created_at`, `updated_at`, `change_seq` and `known_of`). The world's origin is written as `source` and `producer`, each an object or `null`, and extension keys (`x_*`, `atlas_*`, `shadow_*`) go as given, `null` removing one.

## Context for an AI

The draught is one read that gathers what one Character knows, packed for an AI's prompt: their element, the Events they were in, the Narratives they know and everything else that names them ([The draught](/docs/development/api/draught)). The answer is called a packet.

```typescript
import { draughtText } from '@onlyworlds/sdk';

const packet = await client.draught(characterId, { components: ['self', 'events', 'knowledge'], budget: 20 }); // characterId: a Character's id
const prompt = draughtText(packet); // plain text, ready for a prompt
```

Call it as `draught(characterId, policy)`. The `policy` picks which sections to serve (`components`) and how many items each may hold (`budget`); the packet's `cut` counts, per section, the items that limit left out.

`draught(id, { compact: true })` leaves out the packet's empty sections and is typed `OwDraughtCompact` (`cut` optional); without `compact` the answer is the fixed `OwDraught`. (Versions before 4.69.0 have no `compact`.)

`draughtText(draught)` gives a packet as plain text to paste into a prompt ([As text](/docs/development/api/draught#as-text)), the same bytes as Python's `draught_text`.

## World files

A world file is one `.zip` holding a whole world folder (`world.json` and `elements/<type>/*.json`), the file Atlas downloads and opens. Reading and writing one needs no account, and works in the browser and in Node.

```typescript
import { readFile } from 'node:fs/promises';
import { readWorldFile, writeWorldFile, OwWorldFileError } from '@onlyworlds/sdk';

const bytes = new Uint8Array(await readFile('hollow-reach.zip')); // in a browser: new Uint8Array(await file.arrayBuffer())
const world = readWorldFile(bytes);
// world.worldId, world.name, world.world (world.json), world.files: [{ path, data }]

const zip = writeWorldFile(world.files, 'hollow-reach-0192a000'); // one top-level folder
const share = writeWorldFile(world.files, 'hollow-reach-0192a000', {
  includeHidden: false,                          // a file to hand on: hidden elements left out
  report: r => console.log(r.hiddenLeftOut, r.authorFieldsLeftOut),
});
const mine = writeWorldFile(world.files, 'hollow-reach-0192a000', {
  includeAuthorFields: true,                     // your own archive: every file byte for byte
});
```

Both functions remove `world.json`'s `api` block, so the world's link and key never travel in a file. The reader refuses a file that is unsafe or not a world, and the writer leaves out what should not travel.

### Reading a world file

The reader checks the archive's directory before it inflates anything, and refuses a file before returning anything. `err.reason` on the `OwWorldFileError` says why:

| `err.reason` | The file has |
|---|---|
| `unsafe_path`, `too_many`, `too_big` | a path that could land outside the folder or is both a file and a folder (`unsafe_path`), more than 500,000 files (`too_many`), or more than 2 GiB uncompressed or an entry that inflates past the size it declares (`too_big`) |
| `not_a_world` | no `world.json` with an `id` |
| `more_than_one` | more than one world (a `world.json` under `records/` is a producer's data, and one under a dot-folder such as `.atlas/` a tool's own, not a second world; since 4.201.1) |
| `not_openable` | not a zip the reader can read: no zip at all, a zip spanned across disks, or a broken entry |
| `duplicate` | two entries with one name |
| `collision` | two names that differ only in case or in how their characters are encoded |
| `link` | a link or device entry |
| `method` | an encrypted entry, or one compressed by a method other than stored or deflate |
| `name` | a name with a device name, a trailing dot or space, a forbidden character or no UTF-8 flag on non-ASCII |
| `marker` | a `mimetype` marker whose bytes are not `application/vnd.onlyworlds.world+zip`, exported as `WORLD_FILE_MEDIA_TYPE` (the marker is never required) |

The 500,000 files and 2 GiB are the floor every reader accepts; `readWorldFile(bytes, { maxBytes, maxEntries })` sets other limits.

Files beside the world's folder and archive junk (`__MACOSX`, `.DS_Store`, `Thumbs.db`) are ignored, though still checked, and `files` come back in code point order. A tool's own folder (`.atlas/` and the like) comes back like any other file: pass `skip: path => …` to leave a file out of `files`, which still checks it.

<details>
<summary>How names are compared (the spec's rule)</summary>

A `collision` is two names that are one after NFC and simple case folding, both at Unicode 15.1, built from Unicode's own files rather than the runtime's, as the spec rules. Both are exported, as `nfc` and `simpleCaseFold`.

</details>

### Writing a world file

Besides the `api` block, the writer leaves two things out by default and keeps one in:

- **Who wrote each element.** `created_by`, `changed_by`, `changed_via`, `changed_client` and `doors` record a member's id and a tool's door, which mean nothing to someone the world is handed to, so they are left out; `created_at` and `updated_at` stay. Pass `includeAuthorFields: true` to archive your own world as it is. (Versions before 4.109.0 kept them.) A file whose text writes an integer no double holds (`9007199254740993`, which JavaScript reads as `...992`) travels as written, its author fields with it, so a copy never changes a number (since 4.203.2).
- **Private records.** Every `records/<producer>/` that `records/RECORDS.json` marks `"private": true` is left out, whole. `writeWorldFile(files, top, { includePrivateRecords: true })` carries them ([private records](/docs/schema/folders#folders-and-onlyworldscom)). (Versions before 4.63.0 carried them.)
- **Hidden elements stay in.** A world file is a copy, so by default an element file carrying the [hidden](/docs/development/api/hidden) mark travels byte for byte. A tool making a file to hand to someone else passes `{ includeHidden: false }`.

`report: r => …` tells you what was left out: it is called once with `{ hiddenLeftOut, authorFieldsLeftOut, unreadLeftOut, unreadPaths }`, the hidden elements and the author-field files left out and, on a share, the files that could not be read as an element, after the archive is made and never on a refusal; the return stays the bytes.

<details>
<summary>What the writer does, in detail (the folder format's rules)</summary>

Both functions follow the folder format's [archive rules](/docs/schema/folders#folders-and-onlyworldscom) (the `.owworld` file) and give its verdict on every fixture of its conformance set.

The writer gives one set of bytes for one input: the marker first and stored, entries ordered by the UTF-8 bytes of their names, every entry stamped 1980-01-01, and only `world.json`, `elements/`, `spatial/`, `media/`, `records/` and a tool's dot-folder it is handed. A dot-folder makes the file a private copy rather than a portable `.owworld`.

Every file under `elements/` or `spatial/` that is one JSON object by the folder reader's own JSON rules (UTF-8, at most 200 deep, every number a double holds) and holds an author field is written without it, in the folder's own form (two-space indent, a trailing newline, its other keys in their order), whether or not the reader serves it as an element; every other file travels byte for byte. A file under those folders that is no such object (text that is not JSON, an array, a number a double cannot hold) is carried by a copy with whatever its text holds, and left out of a share. (4.197.0 to 4.203.0 kept the author fields in a file the reader passed over: a duplicated id, no `id`, a `.JSON` name, a deeper or unknown folder. Upgrade if you hand world files on.)

A private `records/<producer>/` is matched by name after the same fold as a `collision`, and `RECORDS.json` is kept as it is. A manifest the writer cannot read throws a `TypeError` unless you pass `includePrivateRecords: true`.

`includeHidden` follows the folder format's [hidden mark](/docs/schema/folders#folders-and-onlyworldscom). With `{ includeHidden: false }`:

- every element file whose JSON has a top-level `hidden` (anything but absent, `null` or `false`, so `"true"` and `1` count) is left out whole
- a file under `elements/` or `spatial/` travels only when it was read as an element, and "read as an element" is the [folder reader](#a-world-folder-as-the-source)'s own verdict: a `.json` file directly in a type folder, one JSON object with a non-empty string `id`. Every other file there is left out too, since its mark cannot be told: not UTF-8 JSON (a write cut short, or text after the one JSON value), nested more than 200 deep, holding a number too large for a double, not an object, without an `id`, with another extension (`notes.txt`, `M.JSON`), deeper than a type folder (a hidden element's file moved into `old/` by hand), directly under `elements/`, or in a folder that is no type. The report names these apart, in `unreadLeftOut` and `unreadPaths` (since 4.197.0; 4.196.0 left out only a file in a type folder that it could not parse, earlier versions kept that one too, and 4.195.0 threw on one too deep)
- an id that two files hold travels in neither file, in one layout or across `elements/` and `spatial/`: which of the two marks is the element's cannot be said, so both are named in `unreadPaths` (since 4.197.0; before, each file was judged by its own mark, and a hidden element's second, unmarked file travelled)
- a copy (no `includeHidden: false`) carries every such file: byte for byte, except that one which is one JSON object loses its author fields, as above (since 4.203.1)
- nothing else is rewritten: a visible element's link to a hidden one keeps its id

An `includeHidden` that is not a boolean, or a `report` that is not a function, is a `TypeError` before anything is written.

</details>

## A world folder as the source

The same client reads a [world folder](/docs/schema/folders) on disk, or a world file, with no account and no key (since 4.190.0). `folderFetch` from the `@onlyworlds/sdk/folder` subpath turns the folder's files into the client's `fetch`, so every read your tool already makes answers from the folder:

```ts
import { OwV2Client } from '@onlyworlds/sdk';
import { entriesFromDirectory, folderFetch } from '@onlyworlds/sdk/folder';

const entries = await entriesFromDirectory('./my-world'); // Node; any {path, data} list works
const client = new OwV2Client({ fetch: folderFetch(entries) });

const world = await client.getWorld();
const page = await client.list('character', { limit: 50 });
const found = await client.search('harbour');
```

A world file is a source too: `folderFetch(readWorldFile(bytes).files)`. In a browser or a desktop shell, build the same list of `{path, data}` from whatever opened the folder.

It answers `getWorld` (the world file's fields, with the element counts worked out from the files), the lists with onlyworlds.com's filters, `limit`, `cursor`, `fields` and `expand` (and the same refusal for a filter it does not know), one element, `search`, and the health read, each as onlyworlds.com would answer it for the same world. The reader of a folder is its owner: hidden elements are served with their mark, the counts are the owner's, and `created_by=owner` means a file that names no maker.

What a folder cannot answer is refused with one answer: the account, members, files, the changes feed, proposals, hidden lists, lenses, every write, any address it does not know (a misspelled type included), and `as` or `world` on any read, since a folder has one reader and one world. A write is refused before anything is read; a read is refused once the folder has been read. The refusal is status `501` with the code `not_in_a_folder` in the usual [error envelope](/api/errors/), so a tool can tell "not here" from "not found". A folder whose `world.json` does not parse as an object with a non-empty string `id` answers every read it would answer, health included, with a `500` that says so.

The source reads its files once, as a snapshot, at the first request: when the folder changes, make a new `folderFetch`. `folderFetch(entries, { onRead })` hands `onRead` a report of that read: `served`, each file served as an element (`{ path, type, id, name }`, since 4.192.0), and `skipped`, each file passed over with why: `not_json`, `no_id`, `duplicate`, and since 4.195.0 `too_deep` (nested more than 200 deep) and `number_out_of_range` (a number too large for a double, which would otherwise be served as `null`), and since 4.197.0 `extension` (a file in a type folder whose extension is `.json` in another spelling, such as `M.JSON`, which the format does not read). The source reads names as written: a type folder is the type word in lower case, and two ids are the same id when they are written the same, so one UUID in capitals in one file and in lower case in another is two elements (since 4.197.0; before, the second file was skipped as a `duplicate`). A request by id names an element by its UUID, as the API does, and the first file read answers either spelling. A tool that watches a folder can compare two reports to tell new, changed and removed elements, and ask `countsPath(path)` (since 4.193.0) whether a new file is one the source reads at all, so a change under `.git/` or a swap file needs no read: it is the reader's own test, and a path that ends in `/` asks it of a folder moved in whole.

Where a folder's answer is not onlyworlds.com's:

- **Elements made offline come last.** Lists come in the same order, by `change_seq` and then id; an element whose file has no whole-number `change_seq` comes after every one that has it, by id.
- **A cursor belongs to the source that gave it.** A folder takes onlyworlds.com's cursors, but onlyworlds.com refuses a folder's cursor that points at an element with no `change_seq`.
- **A missing id is always `404`.** onlyworlds.com answers `410` for an element that was deleted; a folder keeps no record of deletions. An id that is no UUID is `422`, as online.
- **An element whose `id` is no UUID** (only a folder holds one) is served in lists and search, but cannot be read by id, matched by `ids` or reached by `expand`.
- **The world read sends no ETag**, so there is no `304`.
- **A file that cannot be read is passed over, never fatal**: one that is not UTF-8 JSON, one that is no object or has no non-empty string `id`, and a second file with an id already seen (compared as a UUID), the one kept coming from `elements/` before a legacy `spatial/`, then the first path in code point order. A file outside `elements/<type>/` and `spatial/{map,pin,zone,marker}/` is not read at all, nor are dot-named files and folders.
- **A file's type** is the one its body declares, when that is exactly one of the 22 type slugs (see [world folders](/docs/schema/folders)); otherwise its folder's.

## The MCP tools on a world folder

The [MCP server](/docs/development/mcp)'s read tools can answer from a world folder on the same machine (since 4.191.0). `folderMcpTools` from the `@onlyworlds/sdk/mcp` subpath gives its nine read tools (`list_element_types`, `get_element_schema`, `search_schema`, `list_worlds`, `get_me`, `list_elements`, `count_elements`, `get_element`, `search_elements`), its two resources and its two templates, with the same names, arguments and answers as onlyworlds.com's server (`count_elements` and `total` on a `list_elements` page since 4.202.0), so a prompt or a skill written for one works on the other. It holds no transport: your own MCP server (stdio, or anything else) passes each request in and the answer out.

```ts
import { entriesFromDirectory } from '@onlyworlds/sdk/folder';
import { folderMcpTools } from '@onlyworlds/sdk/mcp';

const door = folderMcpTools([{ entries: await entriesFromDirectory('./my-world') }]);

door.tools;                                  // as tools/list carries them
const result = await door.callTool('list_elements', { type: 'character', limit: 10 });
// result is an MCP CallToolResult, ready to send: content, structuredContent and isError
```

Each answer is the MCP result as onlyworlds.com's server sends it: the JSON as text and as `structuredContent`, and a refusal as text with `isError: true`, never a rejected promise. `readResource(uri)` answers the resources, or throws `OwMcpError`, whose `code` is the JSON-RPC error to send (`MCP_RESOURCE_NOT_FOUND` when the address names nothing). A call's `world` is the folder's own id from its `world.json`; with one world given it can be left out. With several, each call names one, and the two world resources (`onlyworlds://world`, `onlyworlds://element/{type}/{id}`), whose addresses have no place for a world, are refused. With none (`folderMcpTools([])`, since 4.192.0, for a server that starts before a folder is added), the schema tools and `list_worlds` answer, and every read of a world is refused with one sentence. The tool definitions and the schema answers are those onlyworlds.com served when the package was built, each description with one sentence added saying it answers on this computer (`{ asServed: true }` keeps them as served). Nothing writes, and the tools the server answers only for an account (`get_changes`, `get_draught`, files) are not offered. A folder is read once, as a snapshot: when it changes, make the tools again.

## Accounts, members and sharing

Signing in, inviting people and AIs, making a world on an account and proposed changes have their own page, [Accounts, members and sharing](/docs/development/typescript-accounts):

- <a id="sign-in-with-a-password"></a>[Sign in with a password](/docs/development/typescript-accounts#sign-in-with-a-password): `signInWithPassword`
- <a id="invite-links"></a>[Invite links](/docs/development/typescript-accounts#invite-links): `previewJoin`, `acceptJoin`, `redeemJoin` and `createWorldLink`
- [Who is in a world](/docs/development/typescript-accounts#who-is-in-a-world): `me()` and `members()`
- <a id="a-seat-for-your-ai"></a>[A seat for your AI](/docs/development/typescript-accounts#a-seat-for-your-ai): `createSeat`, `listSeats`, `rekeySeat` and `removeSeat`
- <a id="a-world-on-the-account"></a>[A world on the account](/docs/development/typescript-accounts#a-world-on-the-account): `createAccountWorld` and `mintWorldKey`
- <a id="proposed-changes"></a>[Proposed changes](/docs/development/typescript-accounts#proposed-changes): `propose`, `worldProposals`, `acceptProposal` and `reviewNewElement`

## Reading worlds as a tool

The readers that turn a world you have read into what a tool shows have their own page, [Reading worlds as a tool](/docs/development/typescript-readers):

- <a id="find-elements-in-a-world"></a><a id="find-things-in-a-world"></a>[Find elements in a world](/docs/development/typescript-readers#find-elements-in-a-world): `buildWorldIndex`, `lookupWorld`, `renderElement` and `buildAskContext`
- <a id="lenses"></a>[Lenses](/docs/development/typescript-readers#lenses): `resolveLens`, `isLens`, `lensesInUse`, `DATE_FIELD` and `dateOf`
- [A world as a graph](/docs/development/typescript-readers#a-world-as-a-graph): `worldGraph` and `degreeOf`
- [Landing](/docs/development/typescript-readers#landing): `landingOf`
- [The most linked](/docs/development/typescript-readers#the-most-linked): `mostLinkedOf`
- [Map space](/docs/development/typescript-readers#map-space): `mapSpace`
- <a id="reading-aids"></a>[Reading aids](/docs/development/typescript-readers#reading-aids): `charterOf`, `domainsOf`, `isCharterElement`, `readingAidOf` and `designPartsOf`
- <a id="the-strand"></a>[The strand](/docs/development/typescript-readers#the-strand): `strandOf`
- [Records](/docs/development/typescript-readers#records): `recordsOf` and `recordMarkOf`
- <a id="messages"></a>[Messages](/docs/development/typescript-readers#messages): `isMessage`, `isAddressedTo`, `senderStatus`, `readMarkOf` and `unreadFor`
- [Talks](/docs/development/typescript-readers#talks): `talksOf` and `reportTalksOf`
- [Work items](/docs/development/typescript-readers#work-items): `workStateOf`, `isOpenWork`, `askerOf` and `workOf`
- [Proposed elements](/docs/development/typescript-readers#proposed-elements): `proposedMarkOf` and `handsOnAsProposed`
- <a id="world-calendars"></a>[World calendars](/docs/development/typescript-readers#world-calendars): `worldCalendars`, `resolveCalendar`, `formatStep` and `parseDate`
- <a id="addresses"></a>[Addresses](/docs/development/typescript-readers#addresses): `parseOwLink` and `elementAddress`
- <a id="open-with"></a>[Open with](/docs/development/typescript-readers#open-with): `openersFor` and `TOOLS`
- <a id="door-history"></a>[Door history](/docs/development/typescript-readers#door-history): `doorsOf` and `doorWhere`
- <a id="the-open-with-menu-drawn"></a>[The Open with menu, drawn](/docs/development/typescript-readers#the-open-with-menu-drawn): the `@onlyworlds/sdk/waymark` subpath

## Schema constants

```typescript
import {
  ELEMENT_TYPES,    // the 22 type slugs, and the ElementType union
  ELEMENT_ICONS,    // the Material Symbols icon for each type
  ELEMENT_LABELS,   // plural display labels
  ELEMENT_SECTIONS, // the field groups and their display order
  FIELD_SCHEMA,     // type and target of every field
  ROOM_PAIRS,       // the ten type-and-supertype pairs a world's chat room keeps as elements
  CHARTER_PAIRS,    // the three reading aids' pairs: Law Charter, Construct Guide, Construct Domain
  ELEMENT_GROUPS,   // each type's colour group: blue, green, pink or amber
  GROUP_COLORS,     // each group's light and dark colour
  elementColor,     // the colour of a type's group
  fieldLabel,       // a field name as the words a tool shows
  dragField,        // the link a drag between two types writes
  viewOf,           // how an element is shown by its kind: its row, its one sentence, its banners, its drawing order
  isRoomElement,    // whether an element belongs to a world's chat room
  typeWord,         // the word a world uses for a type, or null
  trimAndFold,      // a name trimmed and without regard to case, as the profiles compare names
  byCodePoint,      // two strings compared by code point, as the profiles order them
} from '@onlyworlds/sdk';

elementColor('character', 'dark'); // '#3987e5'
fieldLabel('image_url'); // "Image URL"
dragField('location', 'character'); // { on: 'character', field: 'location', holds: true }
viewOf({ type: 'narrative', supertype: 'Message', story: 'See you at the gate.\nBring the map.' }).sentence; // 'See you at the gate.'
```

Colour marks a type's colour group and the icon marks the type. Always pair a colour with its icon and label, because colour alone is not accessible. The four groups are a visual aid for drawing the 22 types, not part of the standard, so never show a group's word as a label. They are named by their colour, `blue`, `green`, `pink` and `amber`, in `GROUP_ORDER`, the order the palette was checked in for colour-vision separation; `groupOf(type)` gives a type's group. Their names before 4.102.0, `ELEMENT_FAMILIES`, `FAMILY_COLORS`, `FAMILY_ORDER` and `familyOf`, stay, deprecated, in their old words (`agents`, `world`, `abstract`, `temporal`) until 5.0. A [graph node](/docs/development/typescript-readers#a-world-as-a-graph) still names its type's group in a field called `family`.

`fieldLabel` writes a field's label in sentence case with acronyms kept (`birth_date` is "Birth date", `image_url` is "Image URL"; a word written all in capitals stays as written, so a custom `STR` is "STR"), the house rule for OnlyWorlds tools. A tool that hides an extension prefix drops it before calling it.

`isRoomElement(el)` is true for an element of a world's chat room. A lore view (a list, a count, a search, a graph, a link picker, a story's context) leaves room elements out unless the person asks, and the room's own views show them whole. The room keeps its lines, board entries, reports, work items, specs, hearts, takes, votes, sittings and member cards in the world as ordinary elements, one pair each in `ROOM_PAIRS`. A tool that writes the world writes room elements like any other, the mark kept byte for byte. The charter (a Law with supertype `Charter`) is never a room element: with its own mark it is a [reading aid](/docs/development/typescript-readers#reading-aids), and without it lore.

`typeWord(world, type, { supertype, many })` gives the word a world prints for a type (*Employee* for Character in a work world), or `null` for the standard's name. `world` is a `getWorld()` body or a folder's `world.json`, either way read for its `x_names`. The word is for display only: the API, a world folder, the schema and every id keep the standard's names.

`trimAndFold(text)` and `byCodePoint(a, b)` (since 4.180.0) compare and order names the way the profiles and the package's readers do. `trimAndFold` removes Unicode's White_Space at both ends and folds case by Unicode 15.1's simple case folding. A byte order mark stays, and the long s `ſ` folds to `s`. JavaScript's `trim()` strips the byte order mark too, and `toLowerCase()` leaves the long s. `byCodePoint` is a comparator for `sort`. It orders by code point, never by UTF-16 unit or a locale. To order names as the profiles do, compare their folds and break a tie by id: `byCodePoint(trimAndFold(a.name), trimAndFold(b.name)) || byCodePoint(a.id, b.id)`.

<details>
<summary>How the room and the names are read (the profiles' rules)</summary>

`isRoomElement(el)` is true when an element's type and supertype, trimmed and compared without regard to case, match one of the `ROOM_PAIRS` and it carries a non-empty `x_room_of`, the id of the world or sitting the room belongs to (since 4.163.0 an empty list or an empty object is no mark). A pair without the mark is lore, so a novel's Message Narratives stay in view. This is the [room profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md), schema-dist serial 45.

`typeWord` reads the world's `x_names` map. A supertype's own word wins over the type's, and the word is printed as written, never re-cased: the [names profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md), schema-dist serial 48, whose fixture is the function's own test.

</details>

`dragField(a, b)` says what a tool writes when a person drags one type onto another: `on`, the type that carries the field; `field`, the link; and `holds`, whether the drop puts the dragged element inside the target or only draws a line. The two types can come in either order, and a pair the table does not offer (two of the same type, a pair with no link between them, or one whose only link names a role), and anything that is not one of the 22 type slugs, is `null`, and a pair answered `null` draws no line. It reads schema-dist's `pairs.json`, presentation data like the colours, not part of the standard.

`PUBLIC_FIELDS` gives, per type, the fields onlyworlds.com shows on a known-of element (`known_of: true`) besides the base fields; every other field of such a stub reads unset.

`viewOf(element)` says how an element is shown by its kind (since 4.147.0), from the distribution's `views.json`: `row`, the row that matches (with its `lead` and `fold` fields and its `layout`), or `null` when the element draws as its type; `sentence`, the one line for a card, a list row or a hover (the first field the row names that holds text, up to its first line break), or `null`; and `banners`, the marks to show at the head of its page, in order (`known_of`, `hidden`, the review marks, `x_served_trimmed`, then the row's own, such as `x_room_of`); and, since 4.151.0, `order`, the fields its page draws in the order drawn (the row's lead, then the type's other fields in the schema's own section order, then the row's folds, each once and only where it holds something). A row matches a profile's pair only with that profile's mark, then a type with a supertype, then a type alone. Today's rows are a report, a charter, a message and a line in a room. Which fields a page draws, in what order, open or folded, are the row's; the words on a heading or a fold are your tool's own drawing, and a fold's `label` is the word to use where your tool has none of its own. Pass the element as you were served it: the banners read what was served. `VIEWS` is the table itself. Like the colours, it is presentation, not part of the standard, and it says nothing about who may see what.

The package also ships `SCHEMA.md` (every field and its meaning, generated) and `AGENTS.md` for AI agents working in a codebase that uses it.

## The token resource

`new TokenResource(client)` reads the account's token rating under `/tokens/`, where onlyworlds.com still serves two routes: `getStatus()` (`token_rating`, `tokens_used_today`, `tokens_available_today`) and `getEncryptionInfo()`. Its `consume()`, `getAccessKey()`, `revokeSession()` and `revokeAllSessions()` answer 404, are deprecated since 4.23.0 and leave in 5.0. To read the token rating, use `account.allowance()` ([the token rating](/docs/development/typescript-readers#find-elements-in-a-world)).

## Links

- [npm](https://www.npmjs.com/package/@onlyworlds/sdk) · [Source](https://github.com/OnlyWorlds/sdk) · [Changelog](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md) · [Migrating from 3.x to 4.x](https://github.com/OnlyWorlds/sdk/blob/main/docs/migrating-3-to-4.md)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)

<!-- generated:sdk-reference (scripts/gen_sdk_ref.mjs rewrites everything below this line) -->

## Reference

Generated from the types of `@onlyworlds/sdk` 4.203.2, the version these docs pin. The full declarations ship in the package (`dist/index.d.ts`), with `SCHEMA.md` and `AGENTS.md` beside them.

### Client options

`new OwV2Client(config)` takes:

| Option | Type | Notes |
|---|---|---|
| `apiKey` | `string` | The key: an ow_w_ (write) or ow_r_ (read) world key, an ow_a_ account token (sent as a Bearer token, for the account routes, and with `world` set for that world's reads), or a 10-digit legacy key. |
| `apiPin` | `string` | The PIN (or an AI seat's `ow_s_` secret), needed for writes when the world has one, and for legacy-key reads of a world with a PIN. |
| `baseUrl` | `string` | The API's base URL, default https://www.onlyworlds.com/api/v2. |
| `pageSize` | `number` | Page size for element lists, default 100 (the server's default; at most 1000). |
| `changesPageSize` | `number` | Page size for /changes pulls, default 100. |
| `fetch` | `typeof globalThis.fetch` | A fetch implementation to use instead of globalThis.fetch (for tests and other runtimes). |
| `agent` | `boolean` | Declare this client an AI agent: every element write (create, upsert, patch, delete, editLinks, bulk) carries `X-OW-Agent`, the operations the API document declares it on, and onlyworlds.com records its writes as an AI's (`changed_via: 'declared'`; the server stores that the header was there, never its value). |
| `client` | `string` | This client's own name, sent as `X-OW-Client` on every element write (create, upsert, patch, delete, editLinks, bulk, adopt), on propose, acceptProposal and reviewNewElement, and on no read. |
| `world` | `string` | A world's id, for a client that holds an account token (`ow_a_`) or no key. |

### Methods

| Method | Route | What it does | Returns |
|---|---|---|---|
| `health()` | `GET /health` | unauthenticated liveness pulse. | `Promise<unknown>` |
| `getWorld(opts?)` | `GET /world` | world meta (name, calendar/time fields, public_read). | `Promise<OwWorldMeta>` |
| `patchWorld(partial)` | `PATCH /world` | partial world-meta update. | `Promise<OwWorldMeta>` |
| `setMyCharacter(character)` | `PUT /me/character` | pick the roster Character that is you in this world, or none. | `Promise<OwMe>` |
| `setMyLenses(lensIds)` | `PUT /me/lenses` | choose the lenses this key's holder starts with: lens ids in order, 0 to 20, repeats dropped by the server; an empty list is a choice too (the draught then adds no frame), and keeps a seat off its Titles' lenses. | `Promise<OwMe>` |
| `worldLenses(worldId, opts?)` | `GET /world/{worldId}/lenses` | every lens in the world this key can see, templates included and marked, each with its recipe echoed (`x_lens`, defaults filled in), the Titles it is the default for and whether this key chose it. | `Promise<OwWorldLenses>` |
| `me()` | `GET /me` | who this key is in its world: the world, the key's scope, kind and role, its membership and Character, the lenses it starts with, the world's reading aids, and the front door (`front_door`: the sponsor and their Character, your own Character, the Charter and the Objects it names, the seats you sponsor). | `Promise<OwMe>` |
| `members()` | `GET /members` | the world's roster: each member's id (null for the owner), kind, role, Character and status (`removed` rows stay, so their elements keep `created_by`). | `Promise<OwMember[]>` |
| `list(type, params?)` | `GET /{type}/` | one cursor page, shaped by `params`: `limit` (up to 1000), `cursor` (a page's `next_cursor`), `filter` (the wire filters), `ids`, `createdBy`, `expand`, `fields`, `viewAs` (an owner key) and `signal`. | `Promise<OwPage>` |
| `draught(characterId, policy?)` | `GET /character/{id}/context` | the draught: what one Character knows, as the recorded world holds it, in one read: her element, what she holds and sits in, her open work, how she works, the Events she was in, the Narratives she knows, everything else that names her, her sheet, what changed around her (`since`), and who plays whom; the world's name and calendar beside; the room's messages (`messages`), its other elements (`room`) and elements written as proposed (`proposed`) only when `components` names them. | `Promise<OwDraught>` or `Promise<OwDraughtCompact>` |
| `listAll(type, params?)` |  | Cursor-walk every page of a type. | `AsyncGenerator<OwElement>` |
| `get(type, id, opts?)` | `GET /{type}/{id}/` | optional one-level stub expansion / sparse fields, and `viewAs` (the owner reads as another reader; see ListParams.viewAs). | `Promise<OwElement>` |
| `search(q, opts?)` | `GET /search` | the world's elements whose `name` or text fields (`description` and the type's other prose fields; never supertype, subtype or image_url) hold every word of `q` as a whole word, ignoring case. | `Promise<OwSearchResults>` |
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
| `listFiles(type, id)` | `GET /{type}/{id}/files` | the element's files, newest first: each with its name, kind, size in bytes, label (or null), who added it (`added_by.agent` is true when an agent did, `added_by.owner` when the world's current owner did) and when. | `Promise<OwFileRow[]>` |
| `worldFiles()` | `GET /world/files` | every file in the world this key may see, newest first, each with its element's `element_type` and `element_id`; and the world's total, `used_bytes` of `cap_bytes` (for a line like "41 MB of 250 MB"). | `Promise<OwWorldFiles>` |
| `createFileTicket(type, id, req)` | `POST /{type}/{id}/files` | permission to upload ONE file onto this element: a write key (and its PIN) that may change the element. | `Promise<OwFileTicket>` |
| `uploadFile(type, id, file, opts?)` |  | Attach one file to an element: a ticket from the API (createFileTicket), then the bytes straight to the upload host (the API never sees them, and the key and PIN never leave for the host). | `Promise<OwUploadedFile>` |
| `fileDownloadLink(type, id, fileId)` | `GET /{type}/{id}/files/{fileId}/download` | a link to the file and when it stops working: `url` (the file as an attachment, from the download host), `exp` (unix seconds, 5 minutes after issue), and the file's `name`, `kind` and `size`. | `Promise<OwFileDownload>` |
| `removeFile(type, id, fileId)` | `DELETE /{type}/{id}/files/{fileId}` | remove a file for real: it leaves the lists and the world's total at once, and its bytes are deleted from the store. | `Promise<void>` |
| `previewJoin(code)` | `POST /join/preview` | what a join code holds, without using it: who invites, to which world, in what role, and `reader` (`person`: accept it with acceptJoin; `agent`: an AI agent redeems it at POST /join). | `Promise<OwJoinPreview>` |
| `redeemJoin(code, opts?)` | `POST /join` | redeem a join code that needs no account: a player's (a friend reading as a guest) or an AI agent's. | `Promise<OwJoined>` |
| `signInWithPassword(opts)` |  | Sign in with an email address (or a username) and password, and get a new account token (`ow_a_`) for this device, named `tokenName` (say, "Lantern on iPhone"): the name the account's tokens page lists it under, where it can be revoked. | `Promise<OwSignedIn>` |
| `acceptJoin(code)` | `POST /account/join` | accept an invite link's code as the account this client's `ow_a_` token belongs to: 201 with the new membership. | `Promise<OwJoinedMembership>` |
| `createWorldLink(worldId, opts)` | `POST /account/worlds/{worldId}/links` | a new invite link for a world this client's `ow_a_` token owns: `reader` is required (`person`, accepted with acceptJoin; `agent`, redeemed at POST /join; `player`, a friend with no account, redeemed with redeemJoin for a read key); `role`, when left out, is the server's default: guest for a person link, contributor for an AI link (a player link is guest, and refuses any other), `days` (1, 7 or 30) to 7; `withCharacter` (AI links only) to true; `character` (player links only) a Character's id or `new` (the default): whoever opens the link first reads as it, until removed. | `Promise<OwCreatedWorldLink>` |
| `listWorldLinks(worldId)` | `GET /account/worlds/{worldId}/links` | the world's invite links, without their codes: each with its status (pending, used, revoked or expired) and uses. | `Promise<OwWorldLink[]>` |
| `revokeWorldLink(worldId, linkId)` | `DELETE /account/worlds/{worldId}/links/{linkId}` | revoke a link: its code no longer works. | `Promise<void>` |
| `createSeat(worldId, opts)` | `POST /account/worlds/{worldId}/seats` | a seat for your own AI in a world you own or are a member of: its own membership, write key and `ow_s_` secret, no join link. | `Promise<OwSeatCreated>` |
| `listSeats(worldId)` | `GET /account/worlds/{worldId}/seats` | the live AI seats you can see: your own AI's, or, as the world's owner, every seat. | `Promise<OwSeat[]>` |
| `rekeySeat(worldId, seatId)` | `POST /account/worlds/{worldId}/seats/{seatId}/key` | a new key and secret for a seat whose AI lost its own: its sponsor or the world's owner may. | `Promise<OwSeatCreated>` |
| `removeSeat(worldId, seatId)` | `DELETE /account/worlds/{worldId}/seats/{seatId}` | remove an AI seat: its sponsor or the world's owner may. | `Promise<void>` |
| `setMemberLenses(worldId, memberId, lensIds)` |  | PATCH /account/worlds/{worldId}/members/{memberId} with `lenses` alone -- set the lenses a row starts with: lens ids in order, 0 to 20, repeats dropped by the server; an empty list is a choice too, and keeps a seat off its Titles' lenses, while `null` puts the row back to never chosen (a seat playing a Character then starts with its Titles' lenses; for `'owner'`, `null` is the empty list). | `Promise<OwMemberLenses>` |
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
| `mintWorldKey(worldId, opts?)` | `POST /account/worlds/{id}/keys` | mint a world key, `scope` `'write'` (the default) or `'read'`, `name` as the key list shows it (trimmed, at most 80 characters, else a 422; null or blank: no name). | `Promise<OwMintedKey>` |
| `madeWorldKey(worldId, idempotencyKey, opts?)` | `GET /account/worlds/{worldId}/keys/made?key=` | the key a mintWorldKey call sent with this `idempotencyKey` made, as a row without the key itself (`OwWorldKeyRow`), or null when it made none. | `Promise<OwWorldKeyRow | null>` |
| `revokeWorldKey(worldId, keyId, opts?)` | `DELETE /account/worlds/{worldId}/keys/{keyId}` | revoke a world key, by the `id` mintWorldKey returned: from then on it answers 401 `key_revoked`. | `Promise<void>` |
| `listAccountTokens()` | `GET /account/tokens` | the account's tokens, each by name and last four, never the token itself: when it was last used, whether it is revoked, when it expires, how many live world keys it minted, and who it is for (`audience`). | `Promise<OwAccountToken[]>` |
| `revokeAccountToken(tokenId, opts?)` | `DELETE /account/tokens/{tokenId}` | revoke one of the account's tokens, this client's own included (a tool done with a sign-in revokes it by the `tokenId` the sign-in answered); every other token stays live. | `Promise<void>` |
| `mintAiToken(uses, opts?)` |  | POST /account/tokens with `ai_uses` -- trade this client's account token down to an AI door token: an `ow_a_` token that opens only `aiUses()` and the uses named here (1 to 8, by slug, as `aiUses()` lists them), as this account and on its token rating. | `Promise<OwMintedAiToken>` |
| `signInWithOnlyWorlds(opts)` |  | Start Sign in with OnlyWorlds from a tool's page: mint `state` and a PKCE verifier, keep them under `clientId` in `storage` (sessionStorage by default; in Node pass one), and send the browser to `https://www.onlyworlds.com/signin/authorize` (or only return the URL with `navigate: false`). | `Promise<OwSignInBegun>` |
| `completeSignIn(opts)` |  | Finish Sign in with OnlyWorlds on the callback page: check `state` against the record and the page against the registered address (scheme, host with port, and path, each exactly), take `code` and `state` out of the address bar (only when `url` is not given: a native app passes the address its loopback server or scheme handler received), trade the code once at `POST /auth/token` with the PKCE verifier and no credential, and return the `ow_a_` token with the account and `resume`. | `Promise<OwSignInResult>` |
| `ask(req)` | `POST /account/ask` | a question about a world the account owns or is in, answered by onlyworlds.com's AI proxy from `context` only (build it with buildAskContext from the elements the user sees; it leaves proposed, hidden and room elements out unless asked). **Deprecated** since 4.139.0: use `ai('ask', { world_id, question, context }, { idempotencyKey })`. | `Promise<OwAskAnswer>` |
| `sort(req)` | `POST /account/sort` | the user's unsorted notes, and the elements the app's own search found for them (`slice`: id, lowercase type, name, optional anchor; build it from lookupWorld's hits), sorted by the same proxy as ask into rows to review: `make`, `add_to`, `link`, `ask`. **Deprecated** since 4.139.0: use `ai('sort', { world_id, notes, slice }, { idempotencyKey })`. | `Promise<OwSortAnswer>` |
| `allowance()` | `GET /account/allowance` | the account's token rating, the one daily meter ask, sort and the Council spend from: the rating, what is used and left today, and when it resets (the next midnight UTC), and `own_key` (`{provider}` when the account saved its own AI key, which ask and sort use once the rating is spent; else null). | `Promise<OwAllowance>` |
| `aiUses(opts?)` | `GET /account/ai` | the AI uses onlyworlds.com runs, each a named call a tool makes with ai(): its owner, provider, model and effort, the hash of its system prompt, what its body may hold, its answer cap, its price, its daily ceiling, this account's calls left today, and whether it is on. | `Promise<OwAiUse[]>` |
| `ai(use, body, opts?)` | `POST /account/ai/{use}` | one call of an AI use (aiUses lists them), metered on the account's daily token rating, then its own saved AI key, as ask and sort are. | `Promise<OwAiAskAnswer>` or `Promise<OwAiSortAnswer>` or `Promise<Record<string, unknown> & OwAiMeter>` |
| `request(method, path, opts?)` |  | Raw authenticated request against this client's baseUrl. | `Promise<T>` |

### Deprecated names

Every name the package's declarations mark `@deprecated`, read from the same files as the tables above: 22 in 4.203.2. Each row is the mark's own comment, to the sentence that names the version the name leaves in. How much notice a change to the API itself gets: [Stability and deprecation](/docs/development/api/stability).

| Name | Deprecated since | Leaves in | What its comment says |
|---|---|---|---|
| `FieldInfo.max` |  | 5.0.0 | Never populated; removed in 5.0.0. See `FieldType.integer_max`. |
| `OwV2Client.ask()` | 4.139.0 | 5.0 | Use `ai('ask', { world_id, question, context }, { idempotencyKey })`: the same answer, with the use's meter (`use_remaining`) and a retry under the same key is never billed twice. This name keeps working until 5.0. |
| `OwV2Client.sort()` | 4.139.0 | 5.0 | Use `ai('sort', { world_id, notes, slice }, { idempotencyKey })`: the same answer, with the use's meter (`use_remaining`) and a retry under the same key is never billed twice. This name keeps working until 5.0. |
| `ElementFamily` | 4.102.0 | 5.0 | Use `ElementGroup`, the colour words; this name leaves in 5.0. |
| `ELEMENT_FAMILIES` | 4.102.0 | 5.0 | Use `ELEMENT_GROUPS`; this name leaves in 5.0. |
| `FAMILY_COLORS` | 4.102.0 | 5.0 | Use `GROUP_COLORS`; this name leaves in 5.0. |
| `FAMILY_ORDER` | 4.102.0 | 5.0 | Use `GROUP_ORDER`; this name leaves in 5.0. |
| `familyOf()` | 4.102.0 | 5.0 | Use `groupOf`; this name leaves in 5.0. |
| `OwLayoutByKind.version` |  | 5.0 | The layout profile's mark carries no version key. Leaves in 5.0. |
| `OwLayoutAround.version` |  | 5.0 | The layout profile's mark carries no version key. Leaves in 5.0. |
| `resolveCalendarLens()` | 4.85.0 | 5.0 | Use `resolveCalendar`; this name leaves in 5.0. |
| `TokenConsumeResponse` |  | 5.0 | Serves only a `TokenResource` method keel answers with 404 (production, since 2026-10). Leaves in 5.0 with that method. |
| `TokenConsumeParams` |  | 5.0 | Serves only a `TokenResource` method keel answers with 404 (production, since 2026-10). Leaves in 5.0 with that method. |
| `AccessKeyResponse` |  | 5.0 | Serves only a `TokenResource` method keel answers with 404 (production, since 2026-10). Leaves in 5.0 with that method. |
| `RevokeSessionResponse` |  | 5.0 | Serves only a `TokenResource` method keel answers with 404 (production, since 2026-10). Leaves in 5.0 with that method. |
| `RevokeAllSessionsResponse` |  | 5.0 | Serves only a `TokenResource` method keel answers with 404 (production, since 2026-10). Leaves in 5.0 with that method. |
| `TokenResource.consume()` |  | 5.0 | keel serves no consume route (404 on production since 2026-10; no client decides what its act costs, ruled 2026-10-14): spending happens server-side in the route that does the work. Removed in 5.0. |
| `TokenResource.getAccessKey()` |  | 5.0 | keel serves no access-key route (404 on production since 2026-10). AI answers come from keel's own proxy: `OwV2Client.ai('ask', ...)` and `ai('sort', ...)`. Removed in 5.0. |
| `TokenResource.revokeSession()` |  | 5.0 | keel serves no revoke-session route (404 on production since 2026-10); sessions came from getAccessKey(), which is gone too. Removed in 5.0. |
| `TokenResource.revokeAllSessions()` |  | 5.0 | keel serves no revoke-all-sessions route (404 on production since 2026-10). Removed in 5.0. |
| `'integer_max'` (a value of `FieldType`) |  | 5.0.0 | Emitted by nothing, and scheduled for removal in 5.0.0. |
| `resolveCalendarLens()` (`@onlyworlds/sdk/calendar`) | 4.85.0 | 5.0 | Use `resolveCalendar`; this name leaves in 5.0. |
