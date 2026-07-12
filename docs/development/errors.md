---
layout: default
title: API errors
parent: development
nav_order: 6
permalink: /api/errors/
---

# API error reference

Every error from the modern API (`/api/v2/`, `/bulk`, `/changes`, `/mcp`) is returned in **one envelope**. When a response carries a non-2xx status, its body looks like this:

```jsonc
{
  "error": {
    "type": "invalid_request",   // small fixed enum — the error family
    "code": "invalid_link",      // stable, machine-readable — switch on this
    "message": "friends references Character '0123…' which does not exist.",
    "param": "friends",          // nullable — the offending field, when known
    "doc_url": "https://onlyworlds.github.io/api/errors#invalid_link"
  }
}
```

- **`type`** — one of a small fixed set (`invalid_request`, `authentication_error`, `permission_error`, `not_found`, `rate_limited`, `idempotency_error`, `api_error`). Group your handling on this.
- **`code`** — the specific, stable identifier. This is what you branch on in code; the `type` is the family it belongs to.
- **`message`** — human-readable, safe to log or surface. Wording may change; don't parse it.
- **`param`** — the field that caused the error, when the error is about a field. `null` otherwise.
- **`doc_url`** — points at the matching section on this page (`#<code>`).

For `/bulk`, each item carries its own error under this same shape — see [Bulk errors](#bulk-errors) below.

> **Classic API (v1 dialect) uses a different envelope.** Requests to `/api/worldapi/` return the legacy shape — either `{"detail": "…"}` (a string) or `{"detail": [ … ]}` (a list of field validation errors), and auth failures add a nested `{"error": {"code": "unauthorized", …}}`. The codes below apply to the **v2 / bulk / MCP** surface only. See the [Classic API section](api-reference#classic-api-v1-dialect--legacy) of the API reference for the v1 shapes.

---

## Error codes

### invalid_request

**Type:** `invalid_request` · **HTTP status:** `422`

The request body or query is malformed: an unknown field, an unknown query parameter, a value that fails validation, or a wrong-shaped payload.

- **Common cause:** a misspelled field name (`freinds`), a `_ids`/`_id` suffix carried over from the v1 dialect (v2 uses bare link names — see the [API reference](api-reference)), an unrecognized query parameter (a typo'd filter like `nmae__icontains`), or a bulk request whose `items` is not an array.
- **How to fix:** check the `param` field — it names the offending field or query parameter. Correct the spelling, drop the `_ids`/`_id` suffix, or remove the unknown parameter. The v2 filter operators are a closed set (`__icontains`, `__in`, `__gte`, `__lte`, `__isnull`, plus `supertype`/`subtype` equality) and unknown ones are rejected rather than ignored.

Note: unknown fields are a **hard error**, not a silent drop. A typo'd field name fails loudly instead of vanishing. (Fields under the reserved extension namespaces — `atlas_*`, `shadow_*`, `x_*` — are the exception: they pass through and are stored verbatim.)

### invalid_link

**Type:** `invalid_request` · **HTTP status:** `400`

A link field references a UUID that does not exist as an element in this world.

- **Common cause:** linking to an element that was never created, was deleted, or whose UUID was mistyped. In a `/bulk` request, referencing a sibling item that itself failed validation.
- **How to fix:** verify the referenced UUID exists (GET it first, or include the target in the same `/bulk` batch). Links are validated against the world's elements **plus** the surviving items in the same bulk batch, so a batch may reference its own members in any order — but a member that fails validation cannot be linked to. The `param` field names the link field at fault.

This replaces the old v1 behavior where a dangling link was silently dropped. It is now an explicit, named error.

### id_conflict

**Type:** `invalid_request` · **HTTP status:** `409`

A `POST` create supplied an `id` that already exists in this world.

- **Common cause:** retrying a create with a client-minted UUID that already landed, or minting a UUID that collides with an existing element.
- **How to fix:** use `PUT /{type}/{id}` instead — it is the upsert (creates if absent, replaces if present). `POST` is strictly create; a duplicate id is a real conflict, not an overwrite. If you are retrying a possibly-completed request, send an `Idempotency-Key` header instead of re-POSTing.

### invalid_credentials

**Type:** `authentication_error` · **HTTP status:** `401`

The API key or PIN was missing, unrecognized, or incorrect.

- **Common cause:** no `API-Key` header, a mistyped key, or a missing/wrong `API-Pin` on a walled world. Reads on a walled (PIN-protected) world require the PIN; writes always require it.
- **How to fix:** confirm the `API-Key` and `API-Pin` headers (exact casing) and that the key belongs to the world you're addressing. Keys are minted in the [account portal](https://www.onlyworlds.com/account/). A walled world needs its PIN on every write and on reads.

### key_revoked

**Type:** `authentication_error` · **HTTP status:** `401`

The API key was recognized but has been revoked.

- **Common cause:** a key that was rotated or deleted in the account portal is still being used by an old client or script.
- **How to fix:** mint a fresh key in the [account portal](https://www.onlyworlds.com/account/) and update the client. Revocation is permanent for that key value.

### permission_error

**Type:** `permission_error` · **HTTP status:** `403`

The credential is valid but lacks the scope for this route.

- **Common cause:** using a read-only key (`ow_r_…`) on a write route (create, update, delete, or bulk write).
- **How to fix:** use a write-capable key (`ow_w_…`, or a legacy key with write scope) for write operations. A `403` means the key is genuine — it simply cannot perform this action. (Contrast with `401 invalid_credentials`, which means the key itself is not accepted.)

### not_found

**Type:** `not_found` · **HTTP status:** `404`

The requested element or route does not exist.

- **Common cause:** a GET/PATCH/PUT against an element UUID that isn't in this world, or a mistyped path.
- **How to fix:** confirm the UUID exists in this world and the endpoint path is correct. Note that `DELETE` is idempotent — deleting an already-absent element returns `204`, not `404`.

### rate_limited

**Type:** `rate_limited` · **HTTP status:** `429`

Too many failed authentication attempts (e.g. repeated wrong PINs).

- **Common cause:** a script retrying with a bad PIN in a tight loop.
- **How to fix:** back off and retry after the delay. The response carries a `Retry-After` header (seconds). Repeated failures escalate to a temporary lockout — fix the credential before retrying rather than hammering.

### idempotency_error

**Type:** `idempotency_error` · **HTTP status:** `409`

An `Idempotency-Key` header was reused with a **different** request body.

- **Common cause:** recycling the same idempotency key across two genuinely different requests.
- **How to fix:** one idempotency key names exactly one request. Use a fresh key (a new UUID) for each distinct write. Replaying the *identical* body with the same key is fine — it returns the original stored response (with an `Idempotent-Replay: true` header) and does not act twice.

### api_error

**Type:** `api_error` · **HTTP status:** `500`

An unexpected server-side error. The envelope is preserved even here — a v2 response is always this shape, never a bare HTML 500.

- **Common cause:** a bug or transient infrastructure fault on the server. Not caused by your request shape.
- **How to fix:** retry after a short delay. If it persists, report it to [info@onlyworlds.com](mailto:info@onlyworlds.com) with the time and the request. Server errors are logged and captured on our side.

---

## Bulk errors

`POST /api/v2/bulk` always returns HTTP `200`. Success and failure are reported **per item**, in request order, under a top-level `errors` flag:

```jsonc
{
  "errors": true,
  "items": [
    { "status": 201, "id": "0695…", "created_at": "…", "updated_at": "…" },
    { "status": 400, "id": "0698…",
      "error": {
        "type": "invalid_request",
        "code": "invalid_link",
        "message": "location references Location '…' which does not exist in this world or among the batch's surviving items.",
        "param": "location",
        "doc_url": "https://onlyworlds.github.io/api/errors#invalid_link"
      } }
  ]
}
```

- **`errors`** — `true` if any item failed, `false` if all succeeded.
- Each item's `error` (when present) uses the **exact same envelope** as above — the same `type`/`code`/`message`/`param`/`doc_url` fields. The per-item codes you will see are `invalid_request` (unknown field, wrong shape), `invalid_link` (dangling reference) and `apply_failed` (below).

### apply_failed

**HTTP 422 (per item) · type `invalid_request`**

The item passed validation but the write itself failed a database constraint. The most common cause: the element's `id` already exists — element ids are **unique across all worlds**, so a copied element may collide with its original in another world. Re-id the element (mint a fresh UUID) or remove the other copy. The message names the failing element's id.
- Partial success is the default: one bad item does not sink the batch. Send `"atomic": true` in the request to opt into all-or-nothing instead.
- The `status` on each item mirrors what a single-element write would have returned (`201` created, `200` replaced, `400`/`422` on the errors above).
