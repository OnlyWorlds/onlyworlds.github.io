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
{ "cursor": "1:068e2e60-fc37-789e-8000-a64560195ff8", "has_more": true, "head": 124, "changes": [
    { "op": "upsert", "type": "ability", "id": "068e2e60-fc37-789e-8000-a64560195ff8", "change_seq": 1,
      "updated_at": "2025-10-05T21:41:35.764549+00:00", "element": { "type": "ability", "name": "Piano Playing", "…": "…" } } ] }
```

That is Hyperion's first page. The next call sends `?since=1:068e2e60-fc37-789e-8000-a64560195ff8`. A delete in the feed reads:

```json
{ "op": "delete", "type": "location", "id": "…", "deleted_at": "…" }
```

| Key | Meaning |
|:--|:--|
| `changes` | The ops on this page, sorted by the world's change sequence |
| `cursor` | Pass it back as `?since=` for the next page. Its shape varies (a page's cursor such as `"1:068e…"`, or a number from `?head=true`), so store it as it came |
| `has_more` | `true` if more pages remain |
| `head` | The world's current change sequence |

An `upsert` carries the whole element at its latest state, in the same body a [read](/docs/development/api/reads#what-an-element-carries) returns. A `delete` is a tombstone with the id and `deleted_at`.

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

World fields (`name`, the time fields and the rest of `GET /api/v2/world`) are not in the feed. Poll `GET /api/v2/world` and compare `updated_at`; element writes never change the world's `updated_at`.

## Rewinds and `head`

In normal operation a world's change sequence only moves forward. The one exception is a restore from backup, which rewinds it. If your stored position is beyond the `head` in a response, a restore happened: treat your cursor as invalid and pull again from the start.

## Guests' Cursors

For every key except a guest's, everything above holds. A [guest](/docs/development/api/members#guests) key walks only what it can see:

- Its cursor has three parts. It is still opaque: pass back exactly what you got.
- It never receives `delete` ops.
- When the guest's view shrinks or changes wholesale (an element leaves it, an existing element enters it, the roster changes, or the guest's own role changes), the next call answers `409` [`resync_required`](/api/errors/#resync_required). Pull again from `since=0` and **replace** the local copy: merging would keep elements the guest can no longer see.
- A guest may always start from `since=0` or with no `since`.
- `?head=true` gives a guest a cursor it passes straight back as `since`.
- `head` in a page is still the world's change sequence.

A guest that becomes a contributor (or the reverse) holds a cursor of the wrong shape, and also gets `409 resync_required`.

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
