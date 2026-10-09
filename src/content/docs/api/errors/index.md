---
title: API Error Reference
description: Every error code the OnlyWorlds API returns, what causes it, and how to fix it.
---

Every error from the current API (`/api/v2/`, including `/bulk` and `/changes`) answers in one envelope. A response with a non-2xx status has this body:

```json
{
  "error": {
    "type": "invalid_request",
    "code": "invalid_link",
    "message": "friends references Character '0123…' which does not exist.",
    "param": "friends",
    "doc_url": "https://onlyworlds.github.io/api/errors#invalid_link"
  }
}
```

| Field | Meaning |
|:--|:--|
| `type` | The error family, one of a fixed set: `invalid_request`, `authentication_error`, `permission_error`, `not_found`, `rate_limited`, `idempotency_error`, `api_error`. It names the family only: one family holds codes with different statuses and different fixes |
| `code` | The specific, stable identifier. Decide what to do from this, never from `type` |
| `message` | Human-readable and safe to log or show. Its wording may change: do not parse it |
| `param` | The field or query parameter at fault, when there is one; otherwise `null` |
| `doc_url` | This page, at the code's section (`#<code>`) |

Each code has its own section below, and the summary table lists them all. A fetch of this page gets every section; each code's section has the id `<code>`, so `doc_url`'s `#<code>` lands on it. The same page as Markdown is at [`/api/errors.md`](/api/errors.md), where each section is the heading `### <code>`. In `/bulk`, each failed item carries this same envelope: see [Bulk Errors](#bulk-errors). MCP tools report failures as tool errors carrying the same human message, without the envelope fields.

:::note
The [Classic API](/docs/development/api/classic) at `/api/worldapi/` answers in its own legacy shape, `{"detail": …}`. The codes on this page apply to `/api/v2/` only.
:::

## Error Codes

<!-- generated:error-codes (scripts/gen_errors.mjs, from contract/error-codes.json) -->
| Code | Type | Status | What happened |
|:--|:--|:--|:--|
| [`invalid_request`](#invalid_request) | `invalid_request` | `422` | The body or query is malformed: an unknown field or query parameter, a bad value, or a wrong-shaped payload; `param` names the culprit. |
| [`invalid_link`](#invalid_link) | `invalid_request` | `400` | A link field names an element that does not exist in this world (or among a /bulk batch's surviving items). |
| [`id_conflict`](#id_conflict) | `invalid_request` | `409` | A create supplied an id that already exists, in this world or another (element ids are unique across all worlds). |
| [`resync_required`](#resync_required) | `invalid_request` | `409` | A guest's /changes cursor predates a change to what it can see, or is not this caller's cursor shape: pull again from since=0. |
| [`already_member`](#already_member) | `invalid_request` | `409` | The invite names someone who is already a member, or the accepting account already is one. |
| [`pin_required`](#pin_required) | `invalid_request` | `409` | A member without an account PIN tried to accept an invite or mint a write key. |
| [`apply_failed`](#apply_failed) | `invalid_request` | `422` | A /bulk item passed validation but its write failed a database constraint (most often an id that already exists in another world). |
| [`invalid_credentials`](#invalid_credentials) | `authentication_error` | `401` | The API key or PIN is missing, unrecognised or wrong. |
| [`key_revoked`](#key_revoked) | `authentication_error` | `401` | The API key was recognised but has been revoked. |
| [`permission_error`](#permission_error) | `permission_error` | `403` | The credential is valid but lacks the scope for this route (e.g. a read key on a write route). |
| [`not_author`](#not_author) | `permission_error` | `403` | A contributor or guest key changed, replaced, relinked or deleted an element someone else created. |
| [`owner_only`](#owner_only) | `permission_error` | `403` | A member key, even a co-builder's, tried to change the world's own settings. |
| [`guest_not_supported`](#guest_not_supported) | `permission_error` | `403` | A guest key called a route guests cannot use yet. |
| [`storage_full`](#storage_full) | `permission_error` | `403` | The account the upload counts against has used all of its image storage. |
| [`not_found`](#not_found) | `not_found` | `404` | The element or route does not exist in this world. |
| [`rate_limited`](#rate_limited) | `rate_limited` | `429` | Too many failed PIN attempts; retry after the Retry-After header's seconds. |
| [`quota_exceeded`](#quota_exceeded) | `rate_limited` | `429` | The world has used its image upload tickets for the day; retry after Retry-After. |
| [`idempotency_error`](#idempotency_error) | `idempotency_error` | `409` | An Idempotency-Key was reused with a different request body. |
| [`api_error`](#api_error) | `api_error` | `500` | An unexpected server-side error; the envelope is kept even here. |
| [`server_busy`](#server_busy) | `api_error` | `503` | Every request slot stayed full for 10 seconds; retry after Retry-After. |
| [`payload_too_large`](#payload_too_large) | `api_error` | `413` | The request body is over 2.5 MB; split a large /bulk into several calls. |
| [`media_unavailable`](#media_unavailable) | `api_error` | `503` | Image upload is not configured on the server right now. |
<!-- /generated:error-codes -->

### invalid_request

**Type** `invalid_request` · **Status** `422`

The request body or query is malformed: an unknown field, a server-managed field in a write, an unknown query parameter, a value that fails validation, text over its length limit, extension fields over the size cap, a malformed id, or a wrong-shaped payload.

- **Common cause:** a misspelled field name (`freinds`); a `_ids` or `_id` suffix carried over from the [Classic API](/docs/development/api/classic) (the current API uses bare link names); an unknown query parameter, such as a mistyped filter (`nmae__icontains`) or `?ordering=`; sending a read body back with `type`, `created_at`, `updated_at` or `change_seq` still in it; a bulk request whose `items` is not an array.
- **How to fix:** read `param`: it names the field or parameter at fault. Correct the spelling, drop the suffix or the server field, or remove the parameter. The list filters are `name`, `name__icontains`, `supertype` and `subtype`, plus `characters` on the six categories with that link; the other accepted parameters are `limit`, `cursor`, `expand` and `fields`. Any other query parameter is rejected, never ignored.

Unknown fields are a hard error, not a silent drop, so a mistyped field name fails loudly instead of vanishing. Fields under the extension namespaces `atlas_*`, `shadow_*` and `x_*` are the exception: they are stored as written.

### invalid_link

**Type** `invalid_request` · **Status** `400`

A link field names a UUID that is not an element of the linked category in this world.

- **Common cause:** linking to an element that was never created, was deleted, or whose UUID was mistyped. An id of an element of another category (a Location's id in `friends`, which holds Characters). In `/bulk`, linking to a sibling item that itself failed. For a guest key, linking to an element the guest cannot see.
- **How to fix:** check that the referenced element exists and is of the category the field names (read it first, or include it in the same `/bulk` batch). Links in a batch are checked against the world **plus** the batch's surviving items, in any order, but an item that fails cannot be linked to. `param` names the link field.

A single write that fails with `invalid_link` writes nothing, so after fixing the link you can retry it with the same element id. A dangling link is an explicit, named error. The Classic API's old behaviour of silently dropping it does not apply here.

### id_conflict

**Type** `invalid_request` · **Status** `409`

A `POST` supplied an `id` that already exists, or a `PUT` named an id held by an element in another world. Element ids are unique across **all** worlds, so the collision may be with another world. The message says which case it is.

- **Common cause:** retrying a create with a client-minted UUID that already landed, or reusing ids copied from another world.
- **How to fix:** if the id exists in this world, use `PUT /api/v2/{type}/{id}`, the upsert: `POST` only creates. If it exists in another world, mint a new id. To retry a request that may have completed, send an `Idempotency-Key` header instead of posting again.

### resync_required

**Type** `invalid_request` · **Status** `409`

A guest's `/changes` cursor is from before a change to what the guest can see, or the cursor is not this caller's shape (a guest's has three parts, everyone else's two).

- **How to fix:** pull the feed again from `since=0` and replace the local copy. See [Guests' Cursors](/docs/development/api/changes#guests-cursors).

### already_member

**Type** `invalid_request` · **Status** `409`

An invite names someone who is already a member of the world, or an invite is accepted by an account that is already a member.

- **How to fix:** nothing to do; the membership exists. Check the roster with `GET /api/v2/members`.

### pin_required

**Type** `invalid_request` · **Status** `409`

A member without an account PIN tried to accept an invite or mint a write key. Member keys write with the member's own account PIN.

- **How to fix:** set a PIN in your [account settings](https://www.onlyworlds.com/account/settings), then retry.

### invalid_credentials

**Type** `authentication_error` · **Status** `401`

The API key or PIN is missing, unknown or wrong.

- **Common cause:** no `API-Key` header, a mistyped key, or a missing or wrong `API-Pin` on a write. Only a legacy 10-digit key also needs the PIN to read a private world; prefixed keys (`ow_w_`, `ow_r_`) read without it. A deleted world's keys are deleted with it, so they also answer `invalid_credentials`.
- **How to fix:** check the `API-Key` and `API-Pin` headers (exact names) and that the key belongs to the world you mean. The `message` tells the two apart: `No valid API-Key.` for the key, `Incorrect PIN.` for the PIN. A key that reads with `200` but writes with `401` has a wrong PIN, since reads with a prefixed key never check it. Keys are minted in the [account portal](https://www.onlyworlds.com/account/). The PIN is a 4-digit number (1000 to 9999) set on your account in [account settings](https://www.onlyworlds.com/account/settings), and it guards writes to every world you own; a member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as `API-Pin`. See [Keys and PINs](/docs/getting-started/keys#checking-the-pin).

### key_revoked

**Type** `authentication_error` · **Status** `401`

The API key was recognized but has been revoked.

- **Common cause:** a key that was revoked in the account portal is still used by an old client or script.
- **How to fix:** mint a new key in the [account portal](https://www.onlyworlds.com/account/) and update the client. Revocation is permanent for that key.

### permission_error

**Type** `permission_error` · **Status** `403`

The credential is valid but lacks the scope for this route.

- **Common cause:** a read key (`ow_r_…`) on a write route: create, update, delete, link operations, bulk, or an image ticket.
- **How to fix:** use a write key (`ow_w_…`, or a legacy key) for writes. A `403` means the key is genuine and cannot do this; a `401` [`invalid_credentials`](#invalid_credentials) means the key itself is not accepted.

### not_author

**Type** `permission_error` · **Status** `403`

A contributor or guest key changed, replaced, relinked or deleted an element someone else created. In `/bulk` it is reported per item.

- **How to fix:** these roles change only their own elements (`created_by` names the creator). Ask the owner for the co-builder role, or leave the element alone. See [Roles](/docs/development/api/members#roles).

### owner_only

**Type** `permission_error` · **Status** `403`

A member key, even a co-builder's, tried to change the world's own fields (`PATCH /api/v2/world`).

- **How to fix:** only the owner's key can do this.

### guest_not_supported

**Type** `permission_error` · **Status** `403`

A guest key called a route guests cannot use (world sharing, token status).

- **How to fix:** use a key with a role other than guest, or skip the route.

### storage_full

**Type** `permission_error` · **Status** `403`

`POST /api/v2/media/ticket`: the account the upload counts against has used all of its image storage. The message names the cap.

- **How to fix:** no ticket is issued. Use an image hosted elsewhere (`image_url` takes any URL), or contact [info@onlyworlds.com](mailto:info@onlyworlds.com) about the cap.

### not_found

**Type** `not_found` · **Status** `404`

The requested element or route does not exist.

- **Common cause:** a read, `PATCH` or link operation on an element UUID that is not in this world, or a mistyped path. For a guest key, an element the guest cannot see. An agent join code that is unknown, used, revoked or expired also answers `not_found`, the same answer for every case.
- **How to fix:** check that the UUID exists in this world and that the path is right. `DELETE` is idempotent: deleting an element that is already gone returns `204`, not `404`.

### rate_limited

**Type** `rate_limited` · **Status** `429`

Too many failed authentication attempts, such as repeated wrong PINs.

- **Common cause:** a script retrying with a wrong PIN in a tight loop.
- **How to fix:** wait the number of seconds in the `Retry-After` header. Repeated failures escalate to a temporary lockout, so fix the credential before retrying.

### quota_exceeded

**Type** `rate_limited` · **Status** `429`

`POST /api/v2/media/ticket`: the world has used its 200 image upload tickets for the day.

- **How to fix:** retry after the `Retry-After` header's seconds.

### idempotency_error

**Type** `idempotency_error` · **Status** `409`

An `Idempotency-Key` header was reused with a **different** request body.

- **Common cause:** reusing one idempotency key across two different requests.
- **How to fix:** one key names exactly one request: use a new key (a new UUID) for each distinct write. Replaying the identical body with the same key is fine: it returns the original stored response, with an `Idempotent-Replay: true` header, and does not write twice. See [Idempotency](/docs/development/api/writes#idempotency).

### api_error

**Type** `api_error` · **Status** `500`

An unexpected server-side error. The envelope holds even here: the API never answers with a bare HTML error page.

- **Common cause:** a bug or a passing infrastructure fault on the server, not your request's shape.
- **How to fix:** retry after a short delay. If it persists, report it to [info@onlyworlds.com](mailto:info@onlyworlds.com) with the time and the request. Server errors are logged on our side.

### server_busy

**Type** `api_error` · **Status** `503`

Every request slot on the server stayed full for 10 seconds.

- **How to fix:** retry after the `Retry-After` header's seconds.

### payload_too_large

**Type** `api_error` · **Status** `413`

The request body is over 2.5 MB. The server refuses it without writing anything.

- **How to fix:** send less per request: split a large `/bulk` batch into several, and upload images through [image upload](/docs/development/api/images), never inside a JSON body.

### media_unavailable

**Type** `api_error` · **Status** `503`

`POST /api/v2/media/ticket`: image upload is not configured on the server right now. There is no `Retry-After`.

- **How to fix:** retry later, or use an image hosted elsewhere. If it persists, report it to [info@onlyworlds.com](mailto:info@onlyworlds.com).

## Bulk Errors

`POST /api/v2/bulk` answers HTTP `200` once the batch is read. (A malformed request, such as bad JSON, `items` not an array or over 1000 items, or an authentication failure answers with its own status and the envelope.) Success and failure are reported **per item**, in request order, under a top-level `errors` flag:

```json
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

- `errors` is `true` if any item failed, `false` if all succeeded.
- Each item's `error` uses the same envelope as above. The codes seen per item are [`invalid_request`](#invalid_request) (unknown field, wrong shape), [`invalid_link`](#invalid_link) (a reference to a missing element), [`not_author`](#not_author) (`403`, a contributor or guest touching someone else's element) and [`apply_failed`](#apply_failed).
- Each item's `status` is what a single write would have returned: `201` created, `200` replaced, or `400`, `403` or `422` for the errors above.
- Partial success is the default: one bad item does not stop the batch. Send `"atomic": true` for all or nothing. See [Bulk](/docs/development/api/writes#bulk).

### apply_failed

**Type** `invalid_request` · **Status** `422`, per bulk item

The item passed validation but the write itself failed a database constraint. The most common cause is an `id` that already exists: element ids are **unique across all worlds**, so a copied element can collide with its original in another world. The message names the failing element's id.

- **How to fix:** give the element a new UUID, or remove the other copy.

## Upload Host Errors

The [image upload](/docs/development/api/images) to `upload.onlyworlds.com` is not part of the API and answers errors in its own shape, `{"error": "<code>"}`. Its only open path is `POST https://upload.onlyworlds.com/v1/upload`; the host's root and every other path redirect to a login on purpose, and are not for browsers. A successful upload answers `201` with `{url, key, bytes, type, etag}`.

| Status | Code | What to do |
|:--|:--|:--|
| `401` | `ticket_required` | Send the ticket as `Authorization: Bearer <ticket>`. |
| `401` | `ticket_invalid` | Send the ticket exactly as `POST /api/v2/media/ticket` returned it. |
| `401` | `ticket_expired` | Tickets last 10 minutes: get a new one. |
| `401` | `ticket_used` | One ticket, one upload: get a new one for the next image. |
| `400` | `bad_key` | The `X-Key` is not allowed: it must start with the ticket's `prefix`, use only `a-z 0-9 . _ -` and single slashes, stay within 200 characters, and carry an extension that matches the file's bytes. The response's `reason` field names the cause. |
| `400` | `empty_body` | The request had no image bytes. |
| `411` | `content_length_required` | Send a `Content-Length` header. |
| `405` | `method_not_allowed` | Only `POST` uploads. |
| `409` | `exists` | That `X-Key` is taken and objects are never overwritten: choose another, or omit `X-Key`. |
| `413` | `too_large` | The image is over the ticket's `max_bytes`. |
| `415` | `unsupported_type` | Send webp, png, jpeg or avif (the type is read from the bytes; no SVG). |
| `502` | `write_failed` | Nothing was stored and the ticket is still unspent: retry with the same ticket. |
| `503` | `ticket_lane_unconfigured` | Uploads are not configured on the host right now: retry later. |
