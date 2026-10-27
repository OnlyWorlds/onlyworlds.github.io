---
title: Changes and export
description: The world's ordered change feed, used to export a whole world and to keep a local copy in sync.
---

`GET /api/v2/changes` is the world's change feed: every create, update and delete, in order. Walked from the start it is a full export; walked from a stored cursor it returns what changed since.

## The feed

```bash
curl -s "https://www.onlyworlds.com/api/v2/changes?limit=1" -H "API-Key: 0000000000"
```

```json
{ "cursor": "1:068e2e60-fc37-789e-8000-a64560195ff8", "has_more": true, "head": 124, "epoch": null, "epoch_reason": null, "changes": [
    { "op": "upsert", "type": "ability", "id": "068e2e60-fc37-789e-8000-a64560195ff8", "change_seq": 1,
      "updated_at": "2025-10-05T21:41:35.764549+00:00", "element": { "type": "ability", "name": "Piano Playing", "…": "…" } } ] }
```

That is Hyperion's first page. The next call sends `?since=1:068e2e60-fc37-789e-8000-a64560195ff8`. A delete in the feed reads:

```json
{ "op": "delete", "type": "location", "id": "…", "change_seq": 41, "deleted_at": "…", "deleted_by": null, "deleted_via": "api", "deleted_client": null, "reason": "deleted" }
```

| Key | Meaning |
|:--|:--|
| `changes` | The ops on this page, sorted by the world's change sequence |
| `cursor` | Pass it back as `?since=` for the next page. Its shape varies (a page's cursor such as `"1:068e…"`, or a number from `?head=true`), so store it as it came |
| `has_more` | `true` if more pages remain |
| `head` | The world's current change sequence |
| `epoch` | A guest's or a contributor's view epoch ([Guests' cursors](#guests-cursors)); `null` for the owner's and co-builders' keys |
| `epoch_reason` | Why `epoch` last moved, `role` or `view` ([What a reset keeps](#what-a-reset-keeps)); `null` when `epoch` is |

An `upsert` carries the whole element at its latest state, in the same body a [read](/docs/development/api/reads#what-an-element-carries) returns. The upsert a hide or an unhide gives the readers who still see the element also says when, who and through which door (`changed_at`, `changed_by`, `changed_via`; see [Hidden elements](/docs/development/api/hidden#the-feed)); no other upsert carries them. A `delete` carries the id, `deleted_at`, who deleted it through which door and which client (`deleted_by`, `deleted_via`, `deleted_client`: see [Agent writes](/docs/development/api/writes#agent-writes)), and why, in `reason`: `deleted` for a tombstone, `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from this key (a third value, `out_of_view`, is reserved: nothing sends it yet). Remove the element from your copy either way.

## Walking the feed

Pass the returned `cursor` back as `?since=` until `has_more` is `false`. Store the last cursor; next time, start from it.

| Parameter | Meaning |
|:--|:--|
| `since` | The cursor to continue from. Omit it to start from the beginning |
| `limit` | Ops per page: default 500, at most 1000. A value out of range or not an integer is a `422` |
| `head` | `?head=true` returns only the current tip (`head`, and a `cursor` to follow from), with no elements. The answer carries `ETag: "<head>:<epoch>"` (`-` for a null epoch) and `Cache-Control: no-store`; send that tag back exactly as received in `If-None-Match` on your next poll (the `200`'s tag may carry a `W/` prefix, a compressed body's weak tag; never strip or compare it) and an unmoved head answers `304` with no body, which is refunded against your [request budget](/docs/development/api-reference#limits) (up to 120 a minute per key). The tag covers the epoch on purpose: a guest's or contributor's view can move with `head` unchanged, and the tag moves with it. After a `409`, poll once without the tag to read `epoch_reason` (since 2026-10-22) |
| `after` | An ISO 8601 time (`2026-10-21T09:00:00Z`; no offset means UTC; send a `+` offset as `%2B`): only the changes made at or after it, an upsert by its `updated_at`, a delete by its `deleted_at`. A filter, not a position: the order, `cursor`, `has_more` and `head` are as without it, so read the whole window by passing the cursor back as `since` with the same `after` until `has_more` is false. Anything that is not a date and time is a `422` naming `after` |

- **Treat the cursor as opaque.** Pass back exactly what you received.
- **The continuation parameter is `since`.** Any other parameter, such as `cursor=`, is a `422`, never silently ignored.
- **Apply ops in the order given.** Upserts and deletes are interleaved by sequence; applying them in that order makes the local copy converge.
- **The cursor never expires.** Tombstones are kept indefinitely, so an old cursor still replays every delete after it.
- An empty `changes` list means nothing changed since that cursor; the cursor comes back unchanged.
- `?head=true` is the cheap way to start following a world from now, or to check whether you are behind; with the tag it gave you in `If-None-Match`, an unmoved head is a free `304`. Compare `head` with the head you last applied, not the previous poll's, so a missed tick never drops a change.

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

## Full export

Walking `GET /api/v2/changes` from no `since` until `has_more` is `false` gives every live element at its latest state, plus a tombstone for each delete: the whole world. Most worlds take several pages. There is no separate export route. Deletes are always explicit `delete` ops, never inferred from an element's absence.

A key that may not see an element the owner or a co-builder hid walks the feed without it, without a tombstone of its id, and with its links left out of the bodies. A contributor learns of a hide from a `delete` op with `reason` `hidden`; a guest's cursor is reset instead. The owner, a co-builder and the member who made it get an `upsert` at the hide's place, its body with `hidden: true`, and another at an unhide's place, without it. See [Hidden elements](/docs/development/api/hidden#the-feed).

World fields (`name`, the time fields and the rest of `GET /api/v2/world`) are not in the feed. Poll `GET /api/v2/world` and compare `updated_at`; element writes never change the world's `updated_at`.

## Rewinds and `head`

In normal operation a world's change sequence only moves forward. The one exception is a restore of the whole platform's database from backup after a disaster, which rewinds it. Restoring one world, an owner's [restore to a day](#restores-in-the-feed) included, arrives as ordinary writes and never rewinds. If your stored position is beyond the `head` in a response, a restore happened: treat your cursor as invalid and pull again from the start.

## Guests' cursors

For the owner's and co-builders' keys, everything above holds. A [guest](/docs/development/api/members#guests) key walks only what it can see:

- Its cursor has three parts. It is still opaque: pass back exactly what you got.
- It never receives `delete` ops.
- When the guest's view shrinks or changes wholesale (an element leaves it, an existing element enters it, the roster changes, or the guest's own role changes), the next call answers `409` [`resync_required`](/api/errors/#resync_required). Pull again from `since=0`. What happens to what your copy holds that the new walk does not name: [What a reset keeps](#what-a-reset-keeps); without a `reason`, keep it, since a reset never empties a copy.
- A guest may always start from `since=0` or with no `since`.
- `?head=true` gives a guest a cursor it passes straight back as `since`.
- `head` in a page is still the world's change sequence.
- `epoch`, on every page and on `?head=true`, is the guest's view epoch. It moves when the guest's view changes without the change sequence moving (a Character given or taken, a role). A tip whose `epoch` differs from the one you last applied means pull again; read it from this field, never out of the cursor.

A contributor carries the same three-part cursor, `epoch` and `?head=true` cursor, and the same `409` rules, but it still receives every `delete` op; a contributor's cursor stored before hidden elements arrived answers `409` once. See [The contributor's cursor](/docs/development/api/hidden#the-contributors-cursor).

A member's move to or from the guest or the contributor role resets its cursor: its next call answers `409 resync_required`. A three-part cursor from the owner or a co-builder is the same `409`.

### What a reset keeps

Sharing is [forward-only](/docs/development/api/members#sharing-a-world): what a reader has already read is theirs to keep, and a key or a role governs only what arrives next. The `409` says why in `reason`, inside `error`, and its message says what that reason means:

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

A `409` with no `reason` (from a server older than 2026-10-20) is kept like `role`: a reset never empties a copy.

## The export file

The world page's **Download JSON** button (Access, **This world as a file**; the owner's) downloads the whole world as one JSON file, separate from the API feed. It is self-describing:

```json
{
  "format": "onlyworlds-world-export",
  "schema_version": "00.33.00",
  "exported_at": "…",
  "world": {
    "id": "…", "name": "Hyperion", "description": "…", "time_basic_unit": "Year",
    "time_range_current": 0, "length_unit": "", "public_read": false,
    "created_at": "…", "updated_at": "…",
    "source": { "server": "https://www.onlyworlds.com", "world": "…", "at": "…" },
    "exported_as": { "kind": "owner", "role": "owner", "character": null }
  },
  "elements": {
    "character": [ { "id": "…", "type": "character", "name": "The Consul" } ],
    "institution": [ { "id": "…", "type": "institution", "name": "The Hegemony" } ]
  }
}
```

- `format` is always the literal `"onlyworlds-world-export"`; a reader should reject a file without it. The envelope's shape is keyed by `format` alone: a breaking change would change it.
- `elements` is keyed by lowercase category slug, each an array ordered by `created_at`. Only categories with at least one element appear.
- Element bodies are exactly what the API returns, extension fields included.
- `world.id` is the world's identity: an importer should keep it rather than mint a new one.
- `world` is the World whole (since 2026-10-23): every key [`GET /api/v2/world`](/docs/development/api/reads#the-world) serves, its description, time settings, units, switches, `slug` and `public_page` included, beside `source` and `exported_as`. A file from before carries the id, the name, the dates and the provenance lines only.
- `schema_version` is the version of the standard the elements follow (the value `X-OW-Schema-Version` carries); it is information, not a gate. Files from before 2026-10-18 carry `0.30.00` there. Readers ignore keys they do not know.
- `world.source` and `world.exported_as` are the [folder format's provenance lines](/docs/schema/folders#worldjson): where the file came from, and that it is the owner's whole world. A tool that writes the file out as a folder carries both into `world.json` as they are. A file without them predates 2026-10-20.

## Restores in the feed

A world's owner can [restore it to a day](/docs/tools/onlyworlds-com#features) from the world page, from the daily files onlyworlds.com keeps for 90 days. A restore reaches the API as ordinary writes, never a rewind: every element in that day's file arrives as an `upsert`, every element made since as a `delete`, each with a new `change_seq` above the head, so `head` never goes back and a stored cursor stays good. The writes carry the `site` door with `changed_by` `null`, the owner's. A restore re-hides any element the world had hidden that comes back without its mark, and moves every guest's view epoch with `reason` `view`, so a guest's next feed read answers `409 resync_required`: [walk again from `0`](#guests-cursors). Memberships, keys, seats, files and proposals are left as they are, except what a delete always takes with its element (its marks, files and proposals). World settings go back too, the World's extension keys exactly as the file has them (one added since is removed; its `origin` is never touched), which the feed never carries: poll `GET /api/v2/world`.
