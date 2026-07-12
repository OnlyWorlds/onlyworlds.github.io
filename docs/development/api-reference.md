---
layout: default
title: world api
parent: development
nav_order: 2
---

# World API

A REST API for reading and writing world data. Two dialects share one base host:

- **v2 (`/api/v2/`)** — the modern API. Cursor pagination, flat UUID link arrays, native create/upsert, bulk, and a change feed. **Use this for new work.**
- **Classic (`/api/worldapi/`)** — the original v1 dialect, unchanged and supported. Kept for existing clients; see the [Classic API](#classic-api-v1-dialect--legacy) section at the bottom.

**Base URL (v2)**: `https://www.onlyworlds.com/api/v2/`

**Format**: JSON

Interactive docs: [onlyworlds.com/api/v2/docs](https://www.onlyworlds.com/api/v2/docs) · OpenAPI: [onlyworlds.com/api/v2/openapi.json](https://www.onlyworlds.com/api/v2/openapi.json)

---

## Authentication

Requests carry the world key, and the PIN when the world is walled:

```http
API-Key: your-world-api-key
API-Pin: your-world-pin
```

**Key types.** Keys are minted in the [account portal](https://www.onlyworlds.com/account/):

- `ow_w_…` — **world write.** Read and write one world.
- `ow_r_…` — **read capability.** Read one world; write routes return `403`.
- `ow_a_…` — **account token.** Acts on your account, not one world: list your worlds (`GET /api/v2/account/worlds`), create worlds, mint/revoke world keys, manage watched worlds. Sent as `Authorization: Bearer ow_a_…`. Mint one under **Settings → Account tokens** in the portal.
- **Legacy 10-digit keys** (e.g. `0000000001`) still work and are valid forever. New 10-digit keys are no longer issued — use the prefixed keys above.

Each key is scoped to one world. The key alone determines the world; you do not pass a world id in the body.

**The PIN is the world's wall.** A world with a PIN requires it on **every write**, and on **reads** too. A world with no PIN (a public/demo world) reads without a PIN, but writes still require one if the world has one set. So whether a read needs a PIN is a property of the *world*, not the dialect: walled world → PIN on reads; open world → no PIN on reads.

Credentials are managed at the [account portal](https://www.onlyworlds.com/account/).

---

## Resources

All 22 element types are addressed by their singular slug. The URL determines the type; the credential determines the world.

| Method | Endpoint | Purpose |
|:-------|:---------|:--------|
| GET | `/api/v2/{type}` | List elements (paginated, filterable) |
| GET | `/api/v2/{type}/{id}` | Get one element |
| POST | `/api/v2/{type}` | Create (server or client-minted id) |
| PUT | `/api/v2/{type}/{id}` | Upsert by id (create or full replace) |
| PATCH | `/api/v2/{type}/{id}` | Partial update |
| DELETE | `/api/v2/{type}/{id}` | Delete |
| POST | `/api/v2/bulk` | Mixed-type batch create/upsert |
| GET | `/api/v2/changes` | World change feed (sync/export) |
| GET | `/api/v2/world` | The world named by the credential (identity + meta) |
| PATCH | `/api/v2/world` | Update world meta (name, description, time fields) |

(Trailing slashes are tolerated on v2 — `/api/v2/character/{id}` and `/api/v2/character/{id}/` both resolve.)

**Example — list characters:**
```bash
curl -s "https://www.onlyworlds.com/api/v2/character?limit=50" \
  -H "API-Key: {key}" \
  -H "API-Pin: {pin}"
```

**Example — create a location** (no `world` field — the key names the world):
```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/location" \
  -H "API-Key: {key}" \
  -H "API-Pin: {pin}" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Hyperion", "description": "Time Tomb planet" }'
```

---

## Reads and pagination

List responses are **enveloped**:

```jsonc
{ "data": [ … ], "has_more": false, "next_cursor": null }
```

- **`data`** — the array of elements for this page.
- **`has_more`** — `true` if more pages remain.
- **`next_cursor`** — opaque token; pass it back as `?cursor=` to fetch the next page. Treat it as opaque (do not parse it).

Paginate with `?limit=` (default 100, max 1000) and `?cursor=`:

```bash
# first page
curl -s "https://www.onlyworlds.com/api/v2/character?limit=100" -H "API-Key: {key}"
# next page — pass the returned next_cursor back
curl -s "https://www.onlyworlds.com/api/v2/character?limit=100&cursor={next_cursor}" -H "API-Key: {key}"
```

A **single-element** GET (`/api/v2/character/{id}`) returns the bare element object — **not** enveloped, no `data` wrapper.

**Filtering** uses a closed set of Django-style operators — anything else is a `422` (typos are rejected, not silently ignored):

`__icontains`, `__in`, `__gte`, `__lte`, `__isnull`, plus `supertype` / `subtype` equality, and `?ordering=`.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character?name__icontains=admiral" -H "API-Key: {key}"
```

**Expansion and sparse fields** (optional): `?expand=friends,location` inlines those linked elements (one level deep); `?fields=id,name,description` returns only those fields.

---

## Link fields — flat UUID arrays, both directions

In v2, link fields use **one bare name** in **both** reads and writes — no suffix, no shape change.

```jsonc
{
  "id": "0695…",
  "name": "Admiral Splashworth",
  "location": "0698…",             // single link: a UUID string, or null
  "friends": ["0695…", "0698…"]    // multi link: an array of UUID strings
}
```

- **Read and write use the same field name** (`friends`, `location`) and the same value shape (raw UUIDs). No `_ids`/`_id` suffix exists in v2 — sending one is a `422 invalid_request`.
- Multi-link fields are plain UUID arrays on write; single-link fields are a UUID or `null`.

**Link operations** (add/remove without a read-modify-write):
```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/character/{id}/links/friends" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "add": ["uuid-a", "uuid-b"], "remove": ["uuid-c"] }'
```
Adds dedupe (idempotent); removes tolerate ids that aren't present. No prior GET required.

---

## Writes

- **`POST /{type}`** — create. You may supply an `id` (any RFC-4122 UUID; v7 recommended), or omit it and the server mints one. Reusing an existing id is a `409 id_conflict` — use `PUT` to upsert.
- **`PUT /{type}/{id}`** — upsert by id: creates if absent, **full-replaces** if present.
- **`PATCH /{type}/{id}`** — partial update. Omitted fields are left untouched. **Arrays replace** (a `PATCH` to `friends` sets the whole list — use the [link operations](#link-fields--flat-uuid-arrays-both-directions) endpoint to add/remove). To clear a field, send its empty shape: `""`/`null` for text, `null` for a single link, `[]` for a multi link, `null` for a number.
- **`DELETE /{type}/{id}`** — returns `204`. Idempotent: deleting an already-absent element is still `204`. Deleting an element also scrubs its UUID from every other element's links — no dangling references.
- **Unknown fields** return a `422` naming the field. (Fields under the reserved extension namespaces `atlas_*`, `shadow_*`, `x_*` pass through and are stored verbatim.)

**Idempotency-Key** (on `POST` and `/bulk`): send a unique key header and the first successful response is stored for 24h. An identical replay returns that stored response (with an `Idempotent-Replay: true` header) and does not act twice; the same key with a *different* body is a `409 idempotency_error`. Only successful (2xx) responses are stored — a retry after an error re-executes.

---

## Bulk

`POST /api/v2/bulk` — one call, mixed types, the parse-pipeline and sync workhorse. Always returns HTTP `200`; results are per-item, in request order:

```jsonc
// request
{ "items": [ { "op": "upsert", "type": "character", "element": { "name": "…" } }, … ] }

// response
{ "errors": false,
  "items": [ { "status": 201, "id": "…", "created_at": "…", "updated_at": "…" }, … ] }
```

- **Partial success is the default** — one bad item does not sink the batch. Send `"atomic": true` for all-or-nothing.
- Each success slot echoes the server's `created_at` / `updated_at`, so a sync client sets its baseline from the bulk response alone.
- Links are validated against the world **plus surviving items in the same batch**, in any order — a batch may reference its own members without pre-sorting.
- Failed items carry the standard [error envelope](/api/errors) under `error`; the top-level `errors` flag is `true` if any item failed.

---

## Changes and export

`GET /api/v2/changes?since={cursor}` — the world's ordered change feed, and the full-export path:

```jsonc
{ "cursor": "…", "has_more": false, "head": 4213, "changes": [
    { "op": "upsert", "type": "character", "id": "…", "updated_at": "…", "element": { … } },
    { "op": "delete", "type": "location",  "id": "…", "deleted_at": "…" } ] }
```

- **Walk it** by passing the returned `cursor` back as `?since=` until `has_more` is `false`. Treat the cursor as opaque. The continuation parameter is `since=` — passing an unknown parameter (e.g. `cursor=`) is a `422`, not a silent no-op.
- **Full export = no `since`.** `GET /api/v2/changes` with no cursor returns every live element (at its latest state) plus tombstones — the whole world in one walk.
- **Deletes are explicit** tombstones (`op: "delete"`), never inferred from absence. Tombstones are retained indefinitely, so an old cursor still replays every delete above it.
- **`head`** is the world's current change sequence; if your stored cursor position exceeds `head`, a restore rewound the world — treat your cursor as invalid and re-baseline.
- `?limit=` (default 500, cap 1000) bounds one response.

`GET /api/v2/world` — returns the world named by the credential: `{id, name, description, image_url, time_format_names, time_format_equivalents, time_basic_unit, time_range_min, time_range_max, time_range_current, public_read, created_at, updated_at}`. A `200` also validates the key (and PIN, if walled).

`PATCH /api/v2/world` — update world meta (write key + PIN). Writable: `name`, `description`, `image_url`, `time_basic_unit` (strings), `time_format_names`, `time_format_equivalents` (lists of strings), `time_range_min`, `time_range_max`, `time_range_current` (integers or null). Unknown fields are a `422`; `public_read` and the PIN are managed in the [account portal](https://www.onlyworlds.com/account/), not here. World meta does **not** appear in `/changes` — poll `GET /world` and compare `updated_at`.

---

## Errors

Every v2 / bulk / changes error is one envelope:

```jsonc
{ "error": {
    "type": "invalid_request",
    "code": "invalid_link",
    "message": "friends references Character '0123…' which does not exist.",
    "param": "friends",
    "doc_url": "https://onlyworlds.github.io/api/errors#invalid_link" } }
```

Branch on `code`; group on `type`; `param` names the offending field; `doc_url` links the [full error reference](/api/errors). See the **[API error reference](/api/errors)** for every code, its cause, and how to fix it.

---

## CORS

The API accepts cross-origin requests from a wide range of hosting platforms.

**Pre-approved platforms:**

- **OnlyWorlds domains**: `*.onlyworlds.com` subdomains, `onlyworlds.github.io`
- **Static hosting**: GitHub Pages, GitLab Pages, Cloudflare Pages
- **Modern platforms**: Vercel, Netlify, Render, Railway, Fly.io
- **Traditional hosting**: Heroku, AWS Amplify, Firebase Hosting
- **Quick deploy**: Surge.sh, Glitch
- **Online IDEs**: Replit, CodeSandbox, StackBlitz, CodePen, JSFiddle
- **Local development**: `localhost` and `127.0.0.1` on any port

For custom domain CORS access, contact [info@onlyworlds.com](mailto:info@onlyworlds.com).

---

## Classic API (v1 dialect) — legacy

The original API remains available and unchanged at `/api/worldapi/`. It is supported for existing clients; **new work should use v2 above.** The two dialects differ in several ways — most notably link-field naming.

> **v2 does NOT use the `_ids` / `_id` suffixes described in this section.** The suffix convention below is **v1-only**. On v2 (and `/bulk`), link fields are bare names in both directions (`friends`, `location`) — sending `friends_ids` there is a `422`.

**Base URL**: `https://www.onlyworlds.com/api/worldapi/`

**Authentication**: same `API-Key` / `API-Pin` headers. Legacy 10-digit keys and prefixed keys both work here.

### Classic operations

Endpoint names are **singular** (`/character/`, `/location/`). Note the **trailing slash is required** on single-element reads — `GET /character/{id}` without it returns a `301` redirect with an empty body that curl/requests won't follow by default; `GET /character/{id}/` returns `200`.

| Method | Endpoint | Purpose |
|:-------|:---------|:--------|
| GET | `/{type}/` | List elements (returns a bare JSON array — no envelope, no pagination) |
| POST | `/{type}/` | Create |
| GET | `/{type}/{uuid}/` | Get one element |
| PATCH | `/{type}/{uuid}/` | Partial update |
| PUT | `/{type}/{uuid}/` | Full replace |
| DELETE | `/{type}/{uuid}/` | Delete |

### Classic link fields — the `_ids` asymmetry

In the v1 dialect, multi-link fields use **different names on read vs write**:

| Direction | Field name | Example |
|:----------|:-----------|:--------|
| GET (read) | `characters` | Returns the linked elements (expanded into `{id, name, …}` stub objects) |
| POST/PATCH (write) | `characters_ids` | Send a list of UUIDs to link |

Single-link fields use the `_id` suffix on write (e.g. `location_id`). This read/write asymmetry is specific to v1 — **v2 removed it entirely.**

### Classic errors

The v1 dialect uses the legacy envelope, **not** the v2 shape:

- Most errors: `{"detail": "…"}` (a string) or `{"detail": [ … ]}` (a list of field validation errors).
- Auth failures add a nested legacy object: `{"detail": "Unauthorized", "error": {"code": "unauthorized", "detail": "Authentication required."}}`.

Unknown fields (including `world` in the body) return a `422` naming the field — the same friendly message as v2, in the legacy `{"detail": [...]}` shape.
