---
title: Reads and Pagination
description: How to list and fetch elements, page through results, filter, expand links, and read the world itself.
---

Reads take the key alone: a prefixed key (`ow_w_`, `ow_r_`) never needs the PIN to read. See [Keys and PINs](/docs/getting-started/keys/).

## Lists

`GET /api/v2/{type}` returns one page of that category's elements in an envelope:

```json
{ "data": [], "has_more": false, "next_cursor": null }
```

| Key | Meaning |
|:--|:--|
| `data` | The elements on this page |
| `has_more` | `true` if more pages remain |
| `next_cursor` | Pass it back as `?cursor=` for the next page; `null` on the last page |

## Pagination

Page with `?limit=` (default 100) and `?cursor=`. A `limit` outside 1 to 1000 is clamped into that range; a non-integer is a `422`.

```bash
# first page
curl -s "https://www.onlyworlds.com/api/v2/character?limit=100" -H "API-Key: {key}"

# next page: pass back the next_cursor you received
curl -s "https://www.onlyworlds.com/api/v2/character?limit=100&cursor={next_cursor}" -H "API-Key: {key}"
```

Treat the cursor as opaque: do not parse or build it. Pages come in change order, the order the cursor walks, so each element appears exactly once in a walk. To pull a whole world, or to keep a local copy in sync, use the [change feed](/docs/development/api/changes/) instead.

## Single Elements

`GET /api/v2/{type}/{id}` returns the bare element object, with no `data` wrapper. An id not in this world is `404` [`not_found`](/api/errors/#not_found); a malformed id is a `422`.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}" -H "API-Key: {key}"
```

## What an Element Carries

Besides its category's fields (see [the schema](/docs/schema/)), every element read carries:

| Field | Meaning |
|:--|:--|
| `type` | The element's category slug, as the first key, so a body identifies itself |
| `id` | The element's UUID |
| `created_at`, `updated_at` | Server timestamps; `updated_at` is always present |
| `change_seq` | The world's change sequence at this element's last write |
| `created_by` | The membership that created the element, or `null` when the owner did ([Members](/docs/development/api/members/)) |

Fields under the extension namespaces `atlas_*`, `shadow_*` and `x_*` appear inline, exactly as they were written. Links read as bare UUIDs: see [Link Fields](/docs/development/api/links/).

## Filters

| Parameter | Matches |
|:--|:--|
| `name` | Exact name |
| `name__icontains` | Case-insensitive substring of the name |
| `supertype` | Exact supertype |
| `subtype` | Exact subtype |
| `characters` | On the six categories with a `characters` link (collective, construct, event, narrative, relation, title): the elements whose `characters` contain that Character id |

```bash
curl -s "https://www.onlyworlds.com/api/v2/character?name__icontains=consul" -H "API-Key: {key}"
```

Any other query parameter is a `422` [`invalid_request`](/api/errors/#invalid_request) whose message lists the category's filters, so a typo fails loudly instead of returning the unfiltered list:

```json
{ "error": { "type": "invalid_request", "code": "invalid_request",
  "message": "Unknown filter 'foo'. Filters: name, name__icontains, supertype, subtype.",
  "param": "foo", "doc_url": "https://onlyworlds.github.io/api/errors#invalid_request" } }
```

**Ordering is not supported.** `?ordering=` is a `422`, and pages always come in change order. Sort on your side.

## Expansion and Sparse Fields

Both work on lists and on single elements.

- **`?expand=location,friends`** replaces those links' ids with stub objects, one level deep: `{id, name, supertype, subtype, image_url}`. A field that is not a link is a `422`.
- **`?fields=id,name,description`** returns only the named keys.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}?expand=location,institutions" -H "API-Key: {key}"
```

## The World

`GET /api/v2/world` returns the world named by the key:

```json
{ "id": "…", "name": "Hyperion", "description": "…", "image_url": "",
  "time_format_names": [], "time_format_equivalents": [], "time_basic_unit": "Year",
  "time_range_min": 0, "time_range_max": 500, "time_range_current": 500,
  "public_read": false, "owner_character": null,
  "created_at": "…", "updated_at": "…" }
```

`owner_character` is the Character that is the owner, or `null`. The response carries an `ETag`; send it back as `If-None-Match` and an unchanged world answers `304`. A `200` validates the key. Updating these fields is on [Writes](/docs/development/api/writes/#the-world).

## Guests

A key with the guest role reads only part of a world, and everything else answers as if it did not exist. See [Guests](/docs/development/api/members/#guests).
