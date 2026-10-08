---
title: Writes and Bulk
description: Creating, replacing, updating and deleting elements, retrying safely, writing many elements in one call, and updating the world itself.
---

Writes take a write key (`ow_w_`, a legacy key, a member's or an agent seat's key) and the PIN in `API-Pin`. A read key on a write route is `403` [`permission_error`](/api/errors/#permission_error). The key names the world, so a body never carries one.

## Create

`POST /api/v2/{type}` creates an element and returns `201` with the full element.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/location" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "name": "The Time Tombs", "description": "Structures on Hyperion that move backward through time." }'
```

- You may supply an `id`: any RFC 4122 UUID is accepted, and UUIDv7 is recommended. Omit it and the server mints a UUIDv7.
- An `id` that already exists is `409` [`id_conflict`](/api/errors/#id_conflict). Element ids are unique across all worlds, so the message says which case it is: the id exists in this world (use `PUT` to upsert), or in another world (mint a new id).

## Upsert

`PUT /api/v2/{type}/{id}` creates the element if absent and **replaces it whole** if present: fields left out are reset to empty. It returns `201` when it created and `200` when it replaced. The path decides the id; an `id` in the body is dropped. An id held by an element in another world is `409` [`id_conflict`](/api/errors/#id_conflict).

## Partial Update

`PATCH /api/v2/{type}/{id}` changes only the fields sent and returns `200` with the full element.

- Omitted fields are left untouched.
- **Arrays replace.** A `PATCH` to `friends` sets the whole list; to add or remove single ids, use the [link operations route](/docs/development/api/links#link-operations).
- Extension fields merge by key.
- To clear a field, send its empty shape:

| Kind | Clear with |
|:--|:--|
| Text | `""` or `null` (stored as `""`) |
| Number | `null` |
| Single link | `null` |
| Multi link | `[]` |

## Delete

`DELETE /api/v2/{type}/{id}` returns `204`. It is idempotent: deleting an element that is already gone also returns `204`. Deleting an element removes its id from every other element's links, and the change feed records the delete as a [tombstone](/docs/development/api/changes).

## Field Rules

- **`name`** is required on `POST` and `PUT`. It may be empty.
- **Unknown fields** are a `422` naming the field. A misspelled field fails loudly instead of vanishing.
- **Extension fields** under the namespaces `atlas_*`, `shadow_*` and `x_*` are accepted, stored as written and returned verbatim, up to 65,536 bytes of extensions per element (counted as compact UTF-8 JSON). More is a `422` with `param` `extensions`.
- **Server fields** `type`, `created_at`, `updated_at` and `change_seq` appear on reads and are a `422` on writes. Strip them before sending a read body back.
- **`created_by`** and **`world`** in a body are ignored, whatever their value.
- **Text length**: `name` holds up to 255 characters, `supertype` and `subtype` 128, `image_url` 1024. Longer is a `422`.
- **Values are coerced where they can be**: an integer field accepts `"7"` as 7, truncates `7.9` to 7, and reads `true` as 1; a value that cannot become an integer is a `422`. Text fields turn a number into its digits. Send the types the schema names.

## Idempotency

`POST /api/v2/{type}` and `POST /api/v2/bulk` accept an `Idempotency-Key` header (up to 200 characters). The first successful response is stored for 24 hours under that key:

- An identical replay returns the stored response, with an `Idempotent-Replay: true` header, and does not write again.
- The same key with a different body is `409` [`idempotency_error`](/api/errors/#idempotency_error).
- Only successful (`2xx`) responses are stored. A retry after an error runs again.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/character" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -H "Idempotency-Key: 6f1c2a9e-3b7d-4e0a-9c55-2f8d1b4a7e10" \
  -d '{ "id": "0199a1c2-7d3e-7f00-8a11-3c5e7b9d2f40", "name": "The Consul" }'
```

The store suppresses replays on a best-effort basis; it is not a ledger. Minting the `id` on the client keeps a retry safe even without the header: two concurrent creates without client ids can make two elements.

## Bulk

`POST /api/v2/bulk` creates and upserts up to 1000 elements of mixed categories in one call.

```json
{
  "items": [
    { "type": "institution", "element": { "id": "0199a1c2-…", "name": "The Hegemony" } },
    { "type": "character", "element": { "id": "0199a1c3-…", "name": "The Consul", "institutions": ["0199a1c2-…"] } }
  ],
  "atomic": false
}
```

```json
{
  "errors": false,
  "items": [
    { "status": 201, "id": "0199a1c2-…", "created_at": "…", "updated_at": "…" },
    { "status": 201, "id": "0199a1c3-…", "created_at": "…", "updated_at": "…" }
  ]
}
```

- An item whose `element` carries an `id` upserts that id; one without an `id` creates. An `op` field on an item is optional and ignored.
- The answer is HTTP `200` once the batch is read. Results are per item, in request order, and each `status` is what a single write would have returned (`201`, `200`, or an error status).
- **Partial success is the default**: one bad item does not stop the rest. Send `"atomic": true` for all or nothing. In atomic mode, if `errors` is `true` **nothing was written**, even though the items that would have succeeded show `201` or `200`.
- A failed item carries the standard [error envelope](/api/errors/) under `error`; the top-level `errors` is `true` if any item failed. The codes seen per item are listed under [Bulk Errors](/api/errors/#bulk-errors).
- Links are checked against the world **plus the batch's surviving items**, in any order, so a batch may reference its own items without sorting. All checks run before any write, and an item that fails also fails the items linking to it.
- Each success echoes the server's `created_at` and `updated_at`, so a sync client can set its baseline from the bulk response alone.
- A malformed request (not valid JSON, `items` not an array, over 1000 items) or an auth failure answers with its own status and the error envelope, not `200`.

## The World

`PATCH /api/v2/world` updates the world's own fields. It takes a write key and PIN and is **owner only**: a member's key, even a co-builder's, gets `403` [`owner_only`](/api/errors/#owner_only).

| Field | Type |
|:--|:--|
| `name`, `description`, `image_url`, `time_basic_unit` | String |
| `time_format_names`, `time_format_equivalents` | List of strings |
| `time_range_min`, `time_range_max`, `time_range_current` | Integer or `null` |
| `owner_character` | A Character id in this world (the Character that is the owner), or `null` |

```bash
curl -s -X PATCH "https://www.onlyworlds.com/api/v2/world" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "time_basic_unit": "Year", "time_range_current": 2732 }'
```

- Unknown fields are a `422`, and the whole patch is refused before anything is written.
- `public_read` and the PIN are managed in the [account portal](https://www.onlyworlds.com/account/), not here.
- Every field sent is applied, so an identical value still moves `updated_at`. Send only real changes.
- World fields do not appear in [`/changes`](/docs/development/api/changes). To follow them, poll `GET /api/v2/world` and compare `updated_at`.
