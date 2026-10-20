---
title: Changes and Export
description: The world's ordered change feed, used to export a whole world and to keep a local copy in sync.
---

`GET /api/v2/changes` is the world's change feed: every create, update and delete, in order. Walked from the start it is a full export; walked from a stored cursor it returns what changed since.

## The Feed

```bash
curl -s "https://www.onlyworlds.com/api/v2/changes?limit=1" -H "API-Key: 0000000000"
```

```json
{ "cursor": "1:068e2e60-fc37-789e-8000-a64560195ff8", "has_more": true, "head": 124, "epoch": null, "changes": [
    { "op": "upsert", "type": "ability", "id": "068e2e60-fc37-789e-8000-a64560195ff8", "change_seq": 1,
      "updated_at": "2025-10-05T21:41:35.764549+00:00", "element": { "type": "ability", "name": "Piano Playing", "…": "…" } } ] }
```

That is Hyperion's first page. The next call sends `?since=1:068e2e60-fc37-789e-8000-a64560195ff8`. A delete in the feed reads:

```json
{ "op": "delete", "type": "location", "id": "…", "change_seq": 41, "deleted_at": "…", "deleted_by": null, "deleted_via": "api", "reason": "deleted" }
```

| Key | Meaning |
|:--|:--|
| `changes` | The ops on this page, sorted by the world's change sequence |
| `cursor` | Pass it back as `?since=` for the next page. Its shape varies (a page's cursor such as `"1:068e…"`, or a number from `?head=true`), so store it as it came |
| `has_more` | `true` if more pages remain |
| `head` | The world's current change sequence |
| `epoch` | A guest's or a contributor's view epoch ([Guests' Cursors](#guests-cursors)); `null` for the owner's and co-builders' keys |
| `epoch_reason` | Why `epoch` last moved, `role` or `view` ([What a Reset Keeps](#what-a-reset-keeps)); `null` when `epoch` is. Only while keel's hidden mark is on |

An `upsert` carries the whole element at its latest state, in the same body a [read](/docs/development/api/reads#what-an-element-carries) returns. A `delete` carries the id, `deleted_at`, who deleted it through which door (`deleted_by`, `deleted_via`: see [Agent Writes](/docs/development/api/writes#agent-writes)), and why, in `reason`: `deleted` for a tombstone, `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from this key. Remove the element from your copy either way.

## Walking the Feed

Pass the returned `cursor` back as `?since=` until `has_more` is `false`. Store the last cursor; next time, start from it.

| Parameter | Meaning |
|:--|:--|
| `since` | The cursor to continue from. Omit it to start from the beginning |
| `limit` | Ops per page: default 500, at most 1000. A value out of range or not an integer is a `422` |
| `head` | `?head=true` returns only the current tip (`head`, and a `cursor` to follow from), with no elements |

- **Treat the cursor as opaque.** Pass back exactly what you received.
- **The continuation parameter is `since`.** Any other parameter, such as `cursor=`, is a `422`, never silently ignored.
- **Apply ops in the order given.** Upserts and deletes are interleaved by sequence; applying them in that order makes the local copy converge.
- **The cursor never expires.** Tombstones are kept indefinitely, so an old cursor still replays every delete after it.
- An empty `changes` list means nothing changed since that cursor; the cursor comes back unchanged.
- `?head=true` is the cheap way to start following a world from now, or to check whether you are behind.

```python
import requests

BASE = "https://www.onlyworlds.com/api/v2"
HEADERS = {"API-Key": "ow_r_…"}  # any key on the world; reads need no PIN

def pull(since=None):
    """Walk the feed from `since` (None = full export). Returns the ops and the next cursor."""
    ops = []
    while True:
        params = {"limit": 1000}
        if since is not None:
            params["since"] = since
        page = requests.get(f"{BASE}/changes", headers=HEADERS, params=params).json()
        ops.extend(page["changes"])
        since = page["cursor"]
        if not page["has_more"]:
            return ops, since
```

## Full Export

Walking `GET /api/v2/changes` from no `since` until `has_more` is `false` gives every live element at its latest state, plus a tombstone for each delete: the whole world. Most worlds take several pages. There is no separate export route. Deletes are always explicit `delete` ops, never inferred from an element's absence.

A key that may not see an element the owner or a co-builder hid walks the feed without it, without a tombstone of its id, and with its links left out of the bodies. A contributor learns of a hide from a `delete` op with `reason` `hidden`; a guest's cursor is reset instead. See [Hidden Elements](/docs/development/api/hidden#the-feed).

World fields (`name`, the time fields and the rest of `GET /api/v2/world`) are not in the feed. Poll `GET /api/v2/world` and compare `updated_at`; element writes never change the world's `updated_at`.

## Rewinds and `head`

In normal operation a world's change sequence only moves forward. The one exception is a restore from backup, which rewinds it. If your stored position is beyond the `head` in a response, a restore happened: treat your cursor as invalid and pull again from the start.

## Guests' Cursors

For the owner's and co-builders' keys, everything above holds. A [guest](/docs/development/api/members#guests) key walks only what it can see:

- Its cursor has three parts. It is still opaque: pass back exactly what you got.
- It never receives `delete` ops.
- When the guest's view shrinks or changes wholesale (an element leaves it, an existing element enters it, the roster changes, or the guest's own role changes), the next call answers `409` [`resync_required`](/api/errors/#resync_required). Pull again from `since=0`. What happens to what your copy holds that the new walk does not name: [What a Reset Keeps](#what-a-reset-keeps); without a `reason`, keep it, since a reset never empties a copy.
- A guest may always start from `since=0` or with no `since`.
- `?head=true` gives a guest a cursor it passes straight back as `since`.
- `head` in a page is still the world's change sequence.
- `epoch`, on every page and on `?head=true`, is the guest's view epoch. It moves when the guest's view changes without the change sequence moving (a Character given or taken, a role). A tip whose `epoch` differs from the one you last applied means pull again; read it from this field, never out of the cursor.

A contributor carries the same three-part cursor, `epoch` and `?head=true` cursor, and the same `409` rules, but it still receives every `delete` op; a contributor's cursor stored before hidden elements arrived answers `409` once. See [The Contributor's Cursor](/docs/development/api/hidden#the-contributors-cursor).

A member's move to or from the guest or the contributor role resets its cursor: its next call answers `409 resync_required`. A three-part cursor from the owner or a co-builder is the same `409`.

### What a Reset Keeps

Sharing is [forward-only](/docs/development/api/members#sharing-a-world): what a reader has already read is theirs to keep, and a key or a role governs only what arrives next. While keel's hidden mark is on, the `409` says why in `reason`, inside `error`, and its message says what that reason means:

```json
{ "error": { "type": "invalid_request", "code": "resync_required",
    "message": "Your view of this world changed (reason view). Pull the feed again from the start (since=0); drop what you hold that the new walk does not name.",
    "param": "since", "doc_url": "https://onlyworlds.github.io/api/errors/#resync_required", "reason": "view" } }
```

| `reason` | What moved since your cursor | What your copy holds that the new walk does not name |
|:--|:--|:--|
| `role` | Your own role or membership: a role change, a seat following its sponsor down, a removal, a reactivation | Keep it. It is out of your view now, not gone |
| `view` | What you may see: a delete, a hide, an unhide, a Character given or taken | Drop it |

When both happened since your cursor, the answer is `role`. A `delete` op with `reason` `hidden` is dropped, as for `view`. A tool never empties a copy on its own.

Every page and `?head=true` carry `epoch_reason` beside `epoch`, with the same values: why the epoch last moved (`view` for an epoch that never moved, `null` when `epoch` is `null`). It names the last move only. If your tip is more than one epoch past the one you applied, walk with your stored cursor and read the `409`'s `reason`, which covers every move since that cursor.

With the hidden mark off, the `409` carries no `reason` and a page no `epoch_reason`: keep what your copy holds that the new walk does not name, since a reset never empties a copy.

## The Export File

The account portal's **Export world** button downloads the whole world as one JSON file, separate from the API feed. It is self-describing:

```json
{
  "format": "onlyworlds-world-export",
  "schema_version": "…",
  "exported_at": "…",
  "world": { "id": "…", "name": "Hyperion", "created_at": "…", "updated_at": "…" },
  "elements": {
    "character": [ { "id": "…", "type": "character", "name": "The Consul" } ],
    "institution": [ { "id": "…", "type": "institution", "name": "The Hegemony" } ]
  }
}
```

- `format` is always the literal `"onlyworlds-world-export"`; a reader should reject a file without it.
- `elements` is keyed by lowercase category slug, each an array ordered by `created_at`. Only categories with at least one element appear.
- Element bodies are exactly what the API returns, extension fields included.
- `world.id` is the world's identity: an importer should keep it rather than mint a new one.
- `schema_version` versions this envelope, not the schema or the world. Readers ignore keys they do not know.
