---
title: Reads and pagination
description: How to list and fetch elements, page through results, filter, search a world's text, expand links, and read the world itself.
---

Reads take the key alone: a prefixed key (`ow_w_`, `ow_r_`) never needs the PIN to read. See [Keys and PINs](/docs/getting-started/keys).

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

Treat the cursor as opaque: do not parse or build it. Pages come in change order, the order the cursor walks, so each element appears exactly once in a walk. To pull a whole world, or to keep a local copy in sync, use the [change feed](/docs/development/api/changes) instead.

## Single elements

`GET /api/v2/{type}/{id}` returns the bare element object, with no `data` wrapper. An id not in this world is `404` [`not_found`](/api/errors/#not_found), and one this world deleted is `410` [`gone`](/api/errors/#gone), with the deletion's `change_seq` and `deleted_at`; a malformed id is a `422`. An element [hidden](/docs/development/api/hidden) from the key is a `404`, the same answer as an id not in this world, never a `410`.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}" -H "API-Key: {key}"
```

## What an element carries

Besides its category's fields (see [the schema](/docs/schema/)), every element read carries:

| Field | Meaning |
|:--|:--|
| `type` | The element's category slug, as the first key, so a body identifies itself |
| `id` | The element's UUID |
| `created_at`, `updated_at` | Server timestamps; `updated_at` is always present |
| `change_seq` | The world's change sequence at this element's last write |
| `created_by` | The membership that created the element, or `null` when the owner did ([Members](/docs/development/api/members)) |
| `changed_by`, `changed_via`, `changed_client` | Who made the last change, through which door, and the name the client gave in `X-OW-Client` (`null` when none); `seat`, `mcp` and `declared` mean an agent did ([Agent writes](/docs/development/api/writes#agent-writes)) |
| `hidden` | `true` when the element is [hidden](/docs/development/api/hidden#the-hidden-flag) and this reader still sees it; absent otherwise, never `false`. Read-only: ignored in a write |

Fields under the extension namespaces `atlas_*`, `shadow_*` and `x_*` appear inline, exactly as they were written. Links read as bare UUIDs: see [Link fields](/docs/development/api/links). Files attached to an element are never in its body: they have their own routes ([Files](/docs/development/api/files)).

## Filters

| Parameter | Matches |
|:--|:--|
| `name` | Exact name |
| `name__icontains` | Case-insensitive substring of the name |
| `supertype` | Exact supertype |
| `subtype` | Exact subtype |
| `characters` | On the six categories with a `characters` link (collective, construct, event, narrative, relation, title): the elements whose `characters` contain that Character id |
| `ids` | Comma-separated ids, 1 to 200: only these elements, in the list's own order. An id the key cannot see, or that names nothing of this category, is simply absent. More than 200, or a malformed id, is a `422` with `param` `ids` |
| `created_by` | A membership id, as [`GET /api/v2/members`](/docs/development/api/members#the-roster) lists them: the elements that member created. `owner` selects the owner's own writes (`created_by` `null`). An element the key knows only as [known-of](/docs/development/api/members#known-of) never matches. Anything else is a `422` with `param` `created_by` |

```bash
curl -s "https://www.onlyworlds.com/api/v2/character?name__icontains=consul" -H "API-Key: {key}"
```

Besides these filters, a list takes the parameters `limit`, `cursor`, `expand` and `fields`. Any other query parameter is a `422` [`invalid_request`](/api/errors/#invalid_request) whose message lists the category's filters, so a typo fails loudly instead of returning the unfiltered list:

```json
{ "error": { "type": "invalid_request", "code": "invalid_request",
  "message": "Unknown filter 'foo'. Filters: name, name__icontains, supertype, subtype.",
  "param": "foo", "doc_url": "https://onlyworlds.github.io/api/errors#invalid_request" } }
```

The [TypeScript SDK](/docs/development/typescript) sends these under `filter`: `client.list('character', { filter: { name__icontains: 'consul' } })`. A filter written at the top level of the parameters instead, or any key `list` does not know, is a `TypeError` before anything is sent (since 4.51.0; until then the key was dropped without a word and the list came back whole).

**Ordering is not supported.** `?ordering=` is a `422`, and pages always come in change order. Sort on your side.

## Search

`GET /api/v2/search?q=` finds the elements whose name or text holds every word of `q` as a whole word, ignoring case. The text is the name, the description and each category's own prose fields, such as a Character's background or a Narrative's story; supertype, subtype and `image_url` are not searched. There is no stemming: `drip` does not find "Drippers", and `quiet valley` needs both words somewhere in the element.

| Parameter | Meaning |
|:--|:--|
| `q` | Required: 2 to 200 characters, with at least one word of letters or digits |
| `type` | One category slug; without it, all 22 are searched |
| `limit` | Default 50, clamped into 1 to 200; a non-integer is a `422` |

Any other parameter is a `422` [`invalid_request`](/api/errors/#invalid_request) naming the three.

```bash
curl -s "https://www.onlyworlds.com/api/v2/search?q=drippers&limit=2" -H "API-Key: 0000000001"
```

```json
{ "query": "drippers",
  "results": [
    { "type": "collective", "id": "069959a3-e99e-7862-8000-f1fb6761af2c", "name": "The Drippers",
      "supertype": "Covert", "subtype": "Cabal", "field": "name", "snippet": "The Drippers" },
    { "type": "construct", "id": "069945ca-acf6-7764-8000-e085272bf98f", "name": "Puddle Futures",
      "supertype": "Society", "subtype": "Economy", "field": "description",
      "snippet": "is, well, eternal. A small group of traders called 'the Drippers' have noticed micro-fluctuations in delivery volume and are quietly buying long-term" } ],
  "count": 2, "truncated": true }
```

Elements whose name matches come first, then the rest, each by category and then by name. `field` is where the words were found, and `snippet` is up to 160 characters of that field around the first match. `truncated` is `true` when more elements matched than `limit`; there are no further pages, so narrow the query or raise the limit. A row for an element the reader only [knows of](/docs/development/api/members#known-of) carries `known_of: true` (it matches on what the stub keeps). A guest key searches only what it may read, and no key finds an element hidden from it. The MCP server's [`search_elements`](/docs/development/mcp#read-a-key) runs the same search.

## Expansion and sparse fields

Both work on lists and on single elements.

- **`?expand=location,friends`** replaces those links' ids with stub objects, one level deep: `{id, name, supertype, subtype, image_url}`. A field that is not a link is a `422`.
- **`?fields=id,name,description`** returns only the named keys.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}?expand=location,institutions" -H "API-Key: {key}"
```

## The world

`GET /api/v2/world` returns the world named by the key:

```json
{ "id": "…", "name": "Hyperion", "description": "…", "image_url": "",
  "time_format_names": [], "time_format_equivalents": [], "time_basic_unit": "Year",
  "time_range_min": 0, "time_range_max": 500, "time_range_current": 500,
  "length_unit": "", "mass_unit": "", "distance_unit": "",
  "public_read": false, "agent_narrator_rule": false, "owner_character": null,
  "created_at": "…", "updated_at": "…" }
```

`owner_character` is the Character that is the owner, or `null`. `agent_narrator_rule` is the owner's switch on the world page (Agents narrate as themselves, [Agents](/docs/development/agents)), read-only here. The response carries an `ETag`; send it back as `If-None-Match` and an unchanged world answers `304`. A `200` validates the key. Updating these fields is on [Writes](/docs/development/api/writes#the-world).

## Guests

A key with the guest role reads only part of a world, and everything else answers as if it did not exist. See [Guests](/docs/development/api/members#guests). An element the owner or a co-builder hid answers the same way to every key it is hidden from: see [Hidden elements](/docs/development/api/hidden).
