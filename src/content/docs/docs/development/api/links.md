---
title: Link Fields
description: How links between elements read and write, and how to add or remove links without rewriting a list.
---

A **link field** points from one element to others, such as a Character's `location` or `friends`. Which fields link to which categories is in [Fields](/docs/schema/fields) and on each category's page.

## One Shape, Both Directions

A link field has one bare name and one value shape, in reads and writes alike:

```json
{
  "id": "0695…",
  "name": "The Consul",
  "location": "0698…",
  "friends": ["0695…", "0698…"]
}
```

- A **single link** (`location`) is a UUID string, or `null`.
- A **multi link** (`friends`) is an array of UUID strings.
- Read and write use the same name. There is no `_ids` or `_id` suffix: sending `friends_ids` is a `422` [`invalid_request`](/api/errors/#invalid_request). (The suffixes belong to the [Classic API](/docs/development/api/classic).)
- Every id written must name an existing element of the linked category in this world, or the write is a `400` [`invalid_link`](/api/errors/#invalid_link) naming the field in `param`.

To read the linked elements' names alongside the ids, use [`?expand=`](/docs/development/api/reads#expansion-and-sparse-fields).

## Setting and Clearing Links

On `POST`, `PUT` and `PATCH`, a link field takes the same shape it reads in. A multi-link value **replaces the whole list**. To clear:

| Field | Clear with |
|:--|:--|
| Single link | `null` |
| Multi link | `[]` (`null` is treated the same) |

```bash
curl -s -X PATCH "https://www.onlyworlds.com/api/v2/character/{id}" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "location": "{time_tombs_id}", "institutions": ["{hegemony_id}"] }'
```

## Link Operations

`POST /api/v2/{type}/{id}/links/{field}` adds and removes ids on one multi-link field, with no read beforehand:

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/character/{id}/links/friends" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "add": ["{uuid_a}", "{uuid_b}"], "remove": ["{uuid_c}"] }'
```

- The server merges atomically and returns `200` with the full element.
- Adds dedupe, so repeating one is harmless. Removes tolerate ids that are not present.
- Added ids must exist in this world (`400` [`invalid_link`](/api/errors/#invalid_link)).
- `{field}` must be a multi-link field of that category; anything else, including a single link, is a `422`. Pin has no multi-link fields, so the route always answers `422` on Pin.

## Deletes Never Leave Dangling Links

Deleting an element removes its id from every other element's links in the same transaction. A write can never create a dangling link either: a reference to a missing element fails as `invalid_link` instead of being dropped.

In [`/bulk`](/docs/development/api/writes#bulk), links are checked against the world plus the batch's surviving items, in any order, so a batch may link to its own items without sorting them first.

## Guests

A guest key sees only part of a world. Link ids it cannot see are left out of every body it reads (a hidden single link reads `null`), a link it writes to a hidden element is `invalid_link`, and its writes keep the links it cannot see. See [Guests](/docs/development/api/members#guests).
