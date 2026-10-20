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

Some errors carry extra top-level keys beside `error`, named in their row: `precondition_failed` carries `current`, the element as it is now, and `gone` carries the deletion's `change_seq` and `deleted_at`. Read the body whole; the envelope is not a closed shape.

## Error Codes

<!-- generated:error-codes (scripts/gen_errors.mjs, from contract/error-codes.json) -->
| Code | Type | Status | What happened |
|:--|:--|:--|:--|
| [`invalid_request`](#invalid_request) | `invalid_request` | `422` | The body or query is malformed: an unknown field or query parameter, a bad value, or a wrong-shaped payload; `param` names the culprit. |
| [`invalid_link`](#invalid_link) | `invalid_request` | `400` | A link field names an element that does not exist in this world (or among a /bulk batch's surviving items). |
| [`id_conflict`](#id_conflict) | `invalid_request` | `409` | A create supplied an id that already exists, in this world or another (element ids are unique across all worlds). |
| [`resync_required`](#resync_required) | `invalid_request` | `409` | A guest's, or (with the hidden mark on) a contributor's, /changes cursor predates a change to what it can see, or is not this caller's cursor shape: pull again from since=0. With the hidden mark on, the envelope's `reason` says why: `role` (your own role or membership moved: keep what the new walk does not name) or `view` (what you may see moved: drop it). |
| [`already_member`](#already_member) | `invalid_request` | `409` | The invite names someone who is already a member, or the accepting account already is one. |
| [`removal_in_flight`](#removal_in_flight) | `invalid_request` | `409` | A removal ticket for this image was issued less than 10 minutes ago and is not yet spent; use it, or retry after Retry-After. |
| [`upload_pending`](#upload_pending) | `invalid_request` | `409` | No image is recorded under this key yet, but an upload ticket in this world is still open and unreported (the upload may have just finished); retry after Retry-After (2 s). The platform cannot tell which key an open ticket will get, so any key answers this while the caller holds one, until it expires; then not_found. |
| [`pin_required`](#pin_required) | `invalid_request` | `409` | A member without an account PIN tried to mint a write key. Accepting an invite or a link needs no PIN. |
| [`precondition_failed`](#precondition_failed) | `invalid_request` | `412` | The request carried If-Match with a change_seq, and the element has moved since; the reply's top-level `current` is the element as it is now. Nothing was written and nothing is merged: re-read `current`, then re-send or ask the user. |
| [`player_role_fixed`](#player_role_fixed) | `invalid_request` | `422` | The owner tried to change a player seat's role: a player (no account) reads as a guest, and that role can't be changed. Remove the player instead. |
| [`character_hidden`](#character_hidden) | `invalid_request` | `422` | The owner tried to set a hidden Character as the one a seat or a player plays (`param` character): a played Character is on every reader's roster, so a hidden one can never be picked. Unhide it first, or pick another. |
| [`apply_failed`](#apply_failed) | `invalid_request` | `422` | A /bulk item passed validation but its write failed a database constraint (most often an id that already exists in another world). |
| [`file_too_large`](#file_too_large) | `invalid_request` | `413` | A file asked to be attached to an element is over 25 MB; the message gives both sizes (`param` size). |
| [`invalid_credentials`](#invalid_credentials) | `authentication_error` | `401` | The API key or PIN is missing, unrecognised or wrong. A PIN refusal names param API-Pin and says whether the PIN was missing or wrong. |
| [`key_revoked`](#key_revoked) | `authentication_error` | `401` | The API key was recognised but has been revoked. |
| [`permission_error`](#permission_error) | `permission_error` | `403` | The credential is valid but lacks the scope for this route (e.g. a read key on a write route). |
| [`not_author`](#not_author) | `permission_error` | `403` | A contributor or guest key changed, replaced, relinked or deleted an element someone else created. |
| [`owner_only`](#owner_only) | `permission_error` | `403` | A member key tried to change the world's own settings (a co-builder may change time_range_current alone). |
| [`view_as_owner_only`](#view_as_owner_only) | `permission_error` | `403` | A member key sent `as` (view as): reading as another reader is the owner's, from a key with no member. |
| [`guest_not_supported`](#guest_not_supported) | `permission_error` | `403` | A guest key called a route guests cannot use yet, or wrote a note (Narrative) without a Character of its own in the world. |
| [`storage_full`](#storage_full) | `permission_error` | `403` | The account the upload counts against has used all of its image storage. |
| [`files_full`](#files_full) | `permission_error` | `403` | The world's files have no room for this one (250 MB a world); the message gives the world's use, its cap and the file's size. Remove a file, or ask the owner. |
| [`not_found`](#not_found) | `not_found` | `404` | The element or route does not exist in this world. |
| [`gone`](#gone) | `not_found` | `410` | The element was deleted from this world; the body carries the deletion's `change_seq` and `deleted_at` beside the envelope (GET of one element only). |
| [`rate_limited`](#rate_limited) | `rate_limited` | `429` | Too many failed PIN attempts; retry after the Retry-After header's seconds. |
| [`quota_exceeded`](#quota_exceeded) | `rate_limited` | `429` | A daily limit is used up (the world's image upload tickets, its file upload tickets, or the account's token rating for AI); retry after Retry-After. |
| [`too_many_requests`](#too_many_requests) | `rate_limited` | `429` | Over the request budget: 300 requests a minute per key or account token, 60 a minute per address for a request with neither, reads and writes together (a /bulk call is one request); retry after Retry-After. Every reply carries RateLimit-Limit, RateLimit-Remaining and RateLimit-Reset. |
| [`idempotency_error`](#idempotency_error) | `idempotency_error` | `409` | An Idempotency-Key was reused with a different request body. |
| [`idempotency_in_flight`](#idempotency_in_flight) | `idempotency_error` | `409` | A request with this Idempotency-Key is still running; retry after Retry-After (1 s): once it has answered, the same key and body replay its answer. |
| [`api_error`](#api_error) | `api_error` | `500` | An unexpected server-side error; the envelope is kept even here. |
| [`ask_failed`](#ask_failed) | `api_error` | `502` | The AI proxy could not get an answer from the model; try again in a moment. Nothing was counted. |
| [`ask_unavailable`](#ask_unavailable) | `api_error` | `503` | Asking your world is not switched on for this server, or is paused for the day (the server-wide cap); nothing was counted. |
| [`server_busy`](#server_busy) | `api_error` | `503` | Every request slot stayed full for 10 seconds; retry after Retry-After. |
| [`payload_too_large`](#payload_too_large) | `api_error` | `413` | The request body is over 2.5 MB; split a large /bulk into several calls. |
| [`media_unavailable`](#media_unavailable) | `api_error` | `503` | Image or file upload is not configured on the server right now. |
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

- **Common cause:** linking to an element that was never created, was deleted, or whose UUID was mistyped. An id of an element of another category (a Location's id in `friends`, which holds Characters). In `/bulk`, linking to a sibling item that itself failed. For a guest key, linking to an element the guest cannot see; for any key, linking to an element [hidden](/docs/development/api/hidden) from it.
- **How to fix:** check that the referenced element exists and is of the category the field names (read it first, or include it in the same `/bulk` batch). Links in a batch are checked against the world **plus** the batch's surviving items, in any order, but an item that fails cannot be linked to. `param` names the link field.

A single write that fails with `invalid_link` writes nothing, so after fixing the link you can retry it with the same element id. A dangling link is an explicit, named error. The Classic API's old behaviour of silently dropping it does not apply here.

### id_conflict

**Type** `invalid_request` · **Status** `409`

A `POST` supplied an `id` that already exists, or a `PUT` named an id held by an element in another world. Element ids are unique across **all** worlds, so the collision may be with another world. The message says which case it is.

- **Common cause:** retrying a create with a client-minted UUID that already landed, or reusing ids copied from another world.
- **How to fix:** if the id exists in this world, use `PUT /api/v2/{type}/{id}`, the upsert: `POST` only creates. If it exists in another world, mint a new id. To retry a request that may have completed, send an `Idempotency-Key` header instead of posting again.

### precondition_failed

**Type** `invalid_request` · **Status** `412`

A `PATCH` or a link operation carried `If-Match` with a `change_seq`, and the element has changed since. Nothing was written and nothing is merged. The reply carries, beside the error, a top-level `current`: the element as it is now, as this caller sees it.

- **Common cause:** an edit made offline or from a stale copy, while another client (Atlas, a plugin, an agent) changed the same element.
- **How to fix:** read `current`. If the fields you changed are not the ones that moved, re-send your `PATCH` with `current.change_seq` in `If-Match`. If the same field moved on both sides, ask the user which version to keep. See [Only if unchanged](/docs/development/api/writes#only-if-unchanged).

### resync_required

**Type** `invalid_request` · **Status** `409`

A guest's or a contributor's `/changes` cursor is from before a change to what that key can see, or the cursor is not this caller's shape (a guest's and a contributor's have three parts, the owner's and a co-builder's two). A contributor's cursor stored before [hidden elements](/docs/development/api/hidden) arrived answers this once.

While keel's hidden mark is on, the envelope carries `reason` beside the five fields: `role` (your own role or membership moved) or `view` (something left your view: a delete, a hide, an unhide, a Character change). When both happened since your cursor, it says `role`. A page of the feed then carries `epoch_reason` beside `epoch`: why the epoch last moved, with the same two values.

- **How to fix:** pull the feed again from `since=0`. With `reason` `role`, keep what your copy holds that the new walk does not name; with `view`, drop it; with no `reason` (the hidden mark off), keep it: a reset never empties a copy. A tool never empties a copy on its own. See [What a Reset Keeps](/docs/development/api/changes#what-a-reset-keeps), [Guests' Cursors](/docs/development/api/changes#guests-cursors) and [The Contributor's Cursor](/docs/development/api/hidden#the-contributors-cursor).

### already_member

**Type** `invalid_request` · **Status** `409`

An invite names someone who is already a member of the world, or an invite is accepted by an account that is already a member.

- **How to fix:** nothing to do; the membership exists. Check the roster with `GET /api/v2/members`.

### pin_required

**Type** `invalid_request` · **Status** `409`

A member without an account PIN tried to mint a write key. Accepting an invite or a link needs no PIN; member keys write with the member's own account PIN.

- **How to fix:** set a PIN in your [account settings](https://www.onlyworlds.com/account/settings), then retry.

### player_role_fixed

**Type** `invalid_request` · **Status** `422`

The owner tried to change a player seat's role: a player (no account) reads as a guest, and that role can't be changed. Remove the player instead.

- **How to fix:** a [player](/docs/development/api/members#player-links) stays a guest. To give that friend more, remove the player and invite them as a person, by email or with an invite link; they will need an account.

### character_hidden

**Type** `invalid_request` · **Status** `422`

The owner tried to set a hidden Character as the one an agent seat or a player plays (`character` on the member's `PATCH`, or Plays on the members table; `param` `character`). A played Character is on every reader's roster, so a hidden one can never be picked, by anyone.

- **How to fix:** unhide the Character first, or pick another. See [Playing a Hidden Character](/docs/development/api/hidden#playing-a-hidden-character).

### removal_in_flight

**Type** `invalid_request` · **Status** `409`

`POST /api/v2/media/remove-ticket`: a removal ticket for this image was issued less than 10 minutes ago and hasn't been used yet.

- **How to fix:** use the ticket you already have, or retry after the `Retry-After` header's seconds.

### upload_pending

**Type** `invalid_request` · **Status** `409`

`POST /api/v2/media/remove-ticket`: no image is recorded under this key yet, but an upload ticket in this world is still open and unreported. The upload may have just finished. The platform can't tell which key an open ticket will get, so while the caller holds an open ticket (the owner key: any ticket in the world; anyone else: their own), any key answers this until that ticket expires, 10 minutes after it was issued. After that a key with no image answers [`not_found`](#not_found).

- **How to fix:** retry after the `Retry-After` header's seconds (2).

### invalid_credentials

**Type** `authentication_error` · **Status** `401`

The API key or PIN is missing, unknown or wrong.

- **Common cause:** no `API-Key` header, a mistyped key, or a missing or wrong `API-Pin` on a write. Only a legacy 10-digit key also needs the PIN to read a private world; prefixed keys (`ow_w_`, `ow_r_`) read without it. A deleted world's keys are deleted with it, so they also answer `invalid_credentials`.
- **How to fix:** check the `API-Key` and `API-Pin` headers (exact names) and that the key belongs to the world you mean. `param` tells the two apart: `API-Pin` on every PIN refusal, `null` for the key. The message then says which: `A PIN is required: send it as API-Pin.` when none was sent, `Incorrect PIN.` when it was wrong, `No valid API-Key.` for the key. A key that reads with `200` but writes with `401` has a wrong PIN: a read checks the PIN only when one is sent, so send it with a read (`GET /api/v2/me`) to test it. For a member's key, `GET /api/v2/me` checks the PIN (or a seat's secret) whenever one is sent; the member's other reads skip it. Keys are minted in the [account portal](https://www.onlyworlds.com/account/). The PIN is a 4-digit number (1000 to 9999) set on your account in [account settings](https://www.onlyworlds.com/account/settings), and it guards writes to every world you own; a member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as `API-Pin`. See [Keys and PINs](/docs/getting-started/keys#checking-the-pin).

### key_revoked

**Type** `authentication_error` · **Status** `401`

The API key was recognized but has been revoked.

- **Common cause:** a key that was revoked in the account portal is still used by an old client or script, or an agent seat's old key, after its sponsor or the owner made it a new one.
- **How to fix:** mint a new key in the [account portal](https://www.onlyworlds.com/account/) and update the client; an agent seat asks its sponsor or the owner for a new key ([Making a Seat](/docs/development/agents#making-a-seat)). Revocation is permanent for that key.

### permission_error

**Type** `permission_error` · **Status** `403`

The credential is valid but lacks the scope for this route.

- **Common cause:** a read key (`ow_r_…`) on a write route: create, update, delete, link operations, bulk, or an image ticket.
- **How to fix:** use a write key (`ow_w_…`, or a legacy key) for writes. A `403` means the key is genuine and cannot do this; a `401` [`invalid_credentials`](#invalid_credentials) means the key itself is not accepted.

### not_author

**Type** `permission_error` · **Status** `403`

A contributor or guest key changed, replaced, relinked or deleted an element someone else created. In `/bulk` it is reported per item.

- **How to fix:** these roles change only their own elements (`created_by` names the creator). Ask the owner for the co-builder role, or leave the element alone. One exception: a seat the owner gave a Character to play may change it, never delete it ([After Joining](/docs/development/agents#after-joining)). See [Roles](/docs/development/api/members#roles).

### owner_only

**Type** `permission_error` · **Status** `403`

A member key tried to change the world's own fields (`PATCH /api/v2/world`). The one exception: a co-builder may send `time_range_current` alone, to move the world's now.

- **How to fix:** only the owner's key can do this; a co-builder can move the world's now with a body holding `time_range_current` and nothing else.

### view_as_owner_only

**Type** `permission_error` · **Status** `403`

A member key sent `as` on a read that takes it (an element get or list, search, the metadata routes). Reading as another reader is the owner's: only a key with no member, the owner's own keys or a legacy key, may send it. Keel answers it only while its hidden mark is switched on; until then `as` is an unknown parameter (`422`, `param` `as`).

- **How to fix:** send `as` with one of the owner's keys, or leave it out. A member key reads as itself. See [View As](/docs/development/api/hidden#view-as).

### guest_not_supported

**Type** `permission_error` · **Status** `403`

A guest key called a route guests cannot use (world sharing, token status), or wrote a note (a Narrative) with no Character of its own in the world, or, where agents narrate as themselves, an agent seat with no Character wrote a Narrative.

- **How to fix:** use a key with a role other than guest, or skip the route. For a note, nothing in the request can fix it: ask the world's owner. See [Guests](/docs/development/api/members#guests).

### storage_full

**Type** `permission_error` · **Status** `403`

`POST /api/v2/media/ticket`: the account the upload counts against has used all of its image storage. The message names the cap.

- **How to fix:** no ticket is issued. Use an image hosted elsewhere (`image_url` takes any URL), or contact [info@onlyworlds.com](mailto:info@onlyworlds.com) about the cap.

### files_full

**Type** `permission_error` · **Status** `403`

Asking for a ticket to attach a file to an element (`POST /api/v2/{type}/{id}/files`): the world's files have no room for this one. A world holds 250 MB of files, whoever uploads them. The message gives the world's use, its cap and the file's size: "This world has 249.6 MB of its 250 MB. This file is 4 MB. Remove a file, or ask the owner."

- **How to fix:** no ticket is issued. Remove a file from the world, or ask the world's owner to. `GET /api/v2/world/files` lists the world's files and its total. See [Files](/docs/development/api/files#limits).

### not_found

**Type** `not_found` · **Status** `404`

The requested element or route does not exist.

- **Common cause:** a read, `PATCH` or link operation on an element UUID that is not in this world, or a mistyped path: an address under `/api/` that no route matches answers this envelope too, never a web page. For a guest key, an element the guest cannot see; for any key, an element [hidden](/docs/development/api/hidden) from it, also on a `PUT` or a `POST` naming its id (never `id_conflict`). An agent join code that is unknown, used, revoked or expired also answers `not_found`, the same answer for every case.
- **How to fix:** check that the UUID exists in this world and that the path is right. `DELETE` is idempotent: deleting an element that is already gone returns `204`, not `404`.

### gone

**Type** `not_found` · **Status** `410`

A read of one element (`GET /api/v2/{type}/{id}`) named an element this world held and deleted. Beside the error, the reply carries the deletion's `change_seq` and `deleted_at`:

```json
{ "error": { "type": "not_found", "code": "gone", "message": "marker '…' was deleted from this world.", "param": null, "doc_url": "https://onlyworlds.github.io/api/errors/#gone" },
  "change_seq": 3, "deleted_at": "2026-10-08T16:43:38.278435+00:00" }
```

- **Common cause:** a local copy, a link or a bookmark that still holds the id after someone deleted the element.
- **How to fix:** drop the element from your copy. To learn of deletes as they happen, follow the [change feed](/docs/development/api/changes), which carries each as a tombstone. An id this world never held, one deleted in another world, a guest's read, an element [hidden](/docs/development/api/hidden) from the key and the Classic API still answer `404` [`not_found`](#not_found).

### rate_limited

**Type** `rate_limited` · **Status** `429`

Too many failed authentication attempts, such as repeated wrong PINs.

- **Common cause:** a script retrying with a wrong PIN in a tight loop.
- **How to fix:** wait the number of seconds in the `Retry-After` header. Repeated failures escalate to a temporary lockout, so fix the credential before retrying.

### quota_exceeded

**Type** `rate_limited` · **Status** `429`

A daily limit is used up. These routes answer it:

- `POST /api/v2/media/ticket`: the world has used its 200 image upload tickets for the day.
- `POST /api/v2/{type}/{id}/files`: the world has asked for 200 file tickets in the last 24 hours ([Files](/docs/development/api/files#limits)).
- `POST /api/v2/account/ask` and `POST /api/v2/account/sort`: the account has used its daily token rating (fewer tokens left than the call's output cap). Tokens used reset at midnight UTC.

- **How to fix:** retry after the `Retry-After` header's seconds.

### too_many_requests

**Type** `rate_limited` · **Status** `429`

Over the request budget: 300 requests a minute for one key or account token, 60 a minute from one address for a request with neither. Reads and writes count together, and a `/bulk` call is one request. The minute is the clock's minute, so the count starts again at its end. The message names the budget and the wait: `Too many requests: 300 a minute for this key. Wait 12 seconds.`

- **Common cause:** a loop that never sleeps, or many copies of one program (every player of a game, every tab of a page) sending the same key, which share its 300.
- **How to fix:** wait the `Retry-After` seconds, which equal `RateLimit-Reset`. To stay under, read the `RateLimit-Remaining` header every reply carries, batch writes into [`/bulk`](/docs/development/api/writes#bulk), and follow [`/changes`](/docs/development/api/changes) instead of reading every category again. A key locked by wrong PINs answers [`rate_limited`](#rate_limited) instead, even over the budget. See [Limits](/docs/development/api-reference#limits).

### idempotency_error

**Type** `idempotency_error` · **Status** `409`

An `Idempotency-Key` header was reused with a **different** request body.

- **Common cause:** reusing one idempotency key across two different requests.
- **How to fix:** one key names exactly one request: use a new key (a new UUID) for each distinct write. Replaying the identical body with the same key is fine: it returns the original stored response, with an `Idempotent-Replay: true` header, and does not write twice. See [Idempotency](/docs/development/api/writes#idempotency).

### idempotency_in_flight

**Type** `idempotency_error` · **Status** `409` · **Retry-After** `1`

A request with the same `Idempotency-Key` is still running. Nothing was written by this one.

- **Common cause:** a retry sent while the first request was still being processed, typically after a client-side timeout.
- **How to fix:** wait `Retry-After` seconds and send again with the **same** key and body: once the first request has answered, the retry replays its answer (`Idempotent-Replay: true`). Don't change the key; that would write twice. The Python package retries this for you (0.4.0); the TypeScript SDK names it `isIdempotencyInFlight` (4.27.0).

### api_error

**Type** `api_error` · **Status** `500`

An unexpected server-side error. The envelope holds even here: the API never answers with a bare HTML error page.

- **Common cause:** a bug or a passing infrastructure fault on the server, not your request's shape.
- **How to fix:** retry after a short delay. If it persists, report it to [info@onlyworlds.com](mailto:info@onlyworlds.com) with the time and the request. Server errors are logged on our side.

### server_busy

**Type** `api_error` · **Status** `503`

Every request slot on the server stayed full for 10 seconds.

- **How to fix:** retry after the `Retry-After` header's seconds.

### ask_failed

**Type** `api_error` · **Status** `502`

`POST /api/v2/account/ask`: the model behind [Ask Your World](/docs/development/ai#ask-your-world-without-a-key-of-your-own) gave no answer. The question was not counted against the day's token rating.

- **How to fix:** try again in a moment.

### ask_unavailable

**Type** `api_error` · **Status** `503`

`POST /api/v2/account/ask`: asking is switched off on this server, or paused for the rest of the day because the server-wide spending cap was reached. The question was not counted.

- **How to fix:** try again tomorrow (UTC). Your world's own search still works without it.

### payload_too_large

**Type** `api_error` · **Status** `413`

The request body is over 2.5 MB. The server refuses it without writing anything.

- **How to fix:** send less per request: split a large `/bulk` batch into several, and upload images through [image upload](/docs/development/api/images), never inside a JSON body.

### file_too_large

**Type** `invalid_request` · **Status** `413` · **Param** `size`

Asking for a ticket to attach a file to an element (`POST /api/v2/{type}/{id}/files`): the file is over 25 MB. The message gives both sizes: "This file is 41 MB; a file can be at most 25 MB."

- **How to fix:** no ticket is issued. Send a smaller file, or split the document into parts. See [Files](/docs/development/api/files#limits).

### media_unavailable

**Type** `api_error` · **Status** `503`

Image or file upload is not configured on the server right now: `POST /api/v2/media/ticket` for an image, and for a [file](/docs/development/api/files) the ticket, download and remove routes. There is no `Retry-After`.

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

The upload host, `upload.onlyworlds.com`, takes [images](/docs/development/api/images) and [files](/docs/development/api/files). It is not part of the API and answers errors in its own shape, `{"error": "<code>"}`. Its open paths are `POST https://upload.onlyworlds.com/v1/upload` and [`POST /v1/remove`](/docs/development/api/images#removing-an-image) for images, and `POST /v1/file` for a file (the `upload_url` of a file ticket); the host's root and every other path redirect to a login on purpose, and are not for browsers. A successful image upload answers `201` with `{url, key, bytes, type, etag}`, a file upload with `{key, fid, bytes, type, etag}`.

| Status | Code | What to do |
|:--|:--|:--|
| `401` | `ticket_required` | Send the ticket as `Authorization: Bearer <ticket>`. |
| `401` | `ticket_invalid` | Send the ticket exactly as the API returned it. |
| `401` | `ticket_expired` | Tickets last 10 minutes: get a new one. |
| `401` | `ticket_used` | One ticket, one upload: get a new one for the next image or file. |
| `400` | `bad_key` | The `X-Key` is not allowed: it must start with the ticket's `prefix`, use only `a-z 0-9 . _ -` and single slashes, stay within 200 characters, and carry an extension that matches the file's bytes. The response's `reason` field names the cause. |
| `400` | `empty_body` | The request had no bytes. |
| `411` | `content_length_required` | Send a `Content-Length` header. |
| `405` | `method_not_allowed` | Only `POST` uploads. |
| `409` | `exists` | An image: that `X-Key` is taken and objects are never overwritten; choose another, or omit `X-Key`. A file: its ticket was already used and the file is stored, so a retry after a success reads this as done. |
| `413` | `too_large` | The image or file is over the ticket's `max_bytes`. |
| `415` | `unsupported_type` | An image: send webp, png, jpeg or avif (the type is read from the bytes; no SVG). A file: its bytes are not its kind, or a zip is not a world's bundle ([What a File Can Be](/docs/development/api/files#what-a-file-can-be)); nothing was stored and the ticket is still unspent, and the `reason` field names the cause. |
| `502` | `write_failed` | Nothing was stored and the ticket is still unspent: retry with the same ticket. |
| `403` | `not_removable` | The image was not uploaded into the removal ticket's world with a ticket, so it can't be removed this way. |
| `502` | `remove_failed` | Nothing was removed and the removal ticket is still unspent: retry with the same ticket. |
| `503` | `ticket_lane_unconfigured` | Uploads or removals, of images and files alike, are not configured on the host right now: nothing was stored and the ticket is unspent; retry later. |
