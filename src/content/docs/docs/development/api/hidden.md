---
title: Hidden Elements
description: How the world's owner or a co-builder hides an element from the rest of the world, what each reader then sees, and the routes.
---

The world's owner and its co-builders can **hide** an element: a twist the players have not reached, a villain's real allegiance, the game master's own notes. A hidden element stays in the world, unchanged. The owner, the co-builders and the member who created it still see it; to everyone else it answers as if it did not exist.

The mark is a record beside the element, not a field. Hiding or unhiding leaves the element's body and its `change_seq` alone, and nothing in the body says it is hidden.

## Who Sees a Hidden Element

| Reader | Sees |
|:--|:--|
| The owner: on onlyworlds.com, with every world key the owner minted (`ow_w_`, `ow_r_`), and with a legacy key | Everything, hidden elements included |
| A co-builder, person or agent seat | Everything, hidden elements included |
| A contributor, person or agent seat | The whole world except the hidden elements, apart from those it created |
| A guest, or a player | Its [guest's view](/docs/development/api/members#guests) except the hidden elements, apart from those it created |

- Hiding wins over every way a guest is given sight: an element that names its Character, a Narrative its Character narrates or one of its circles holds, a Character on the roster. Only having created the element gives it back.
- An agent seat reads as its role, also when it plays a Character.
- A key you mint is your own tool and shows what you hid. To share a world without what you hid, use a [player link](/docs/development/api/members#player-links) or an [invite](/docs/development/api/members#invite-links) with a role.

## What Everyone Else Gets

To a reader it is hidden from, a hidden element answers exactly as a missing one, byte for byte:

- `GET /api/v2/{type}/{id}` is `404` [`not_found`](/api/errors/#not_found), never `410` [`gone`](/api/errors/#gone).
- Lists, the `characters` filter, [search](/docs/development/api/reads#search), the [MCP server](/docs/development/mcp)'s tools and world index, and every count and `has_more` leave it out. Its [files](/docs/development/api/files) answer `404`.
- Links to it are left out of every body the reader reads: a single link reads `null`, a multi link loses the id, and `?expand` has nothing to expand. The elements that carry those links do not change: their `change_seq` stays where it was.
- A copy the reader made before the hide keeps the element, and the link ids, until it reads them again ([The Feed](#the-feed)).

## Writes That Name It

A write by a reader it is hidden from answers as it would for an id that does not exist:

| Write | Answer |
|:--|:--|
| A link to it, in any write | `400` [`invalid_link`](/api/errors/#invalid_link) |
| `PATCH`, or a [link operation](/docs/development/api/links), on it | `404` [`not_found`](/api/errors/#not_found) |
| `PUT` on its id | `404` [`not_found`](/api/errors/#not_found). Never a second element at that id, never `409` [`id_conflict`](/api/errors/#id_conflict) |
| `POST` with its id in the body | `404` [`not_found`](/api/errors/#not_found), never `409` [`id_conflict`](/api/errors/#id_conflict) |
| `DELETE` | `204`, as for any missing id. Nothing is deleted |
| A `/bulk` item with its id | `404` [`not_found`](/api/errors/#not_found) in that item's slot |

A reader's write on an element that links to a hidden one keeps that link, as a guest's write keeps the links it cannot see: a `PUT` that leaves it out does not remove it.

## Hiding and Unhiding

| Method | Route | Key | Answer |
|:--|:--|:--|:--|
| PUT | `/api/v2/{type}/{id}/hidden` | Write key and PIN | `204`: hidden |
| DELETE | `/api/v2/{type}/{id}/hidden` | Write key and PIN | `204`: not hidden |
| GET | `/api/v2/world/hidden` | Any key of the owner's or a co-builder's | The world's hidden elements |

```bash
curl -s -X PUT "https://www.onlyworlds.com/api/v2/character/{id}/hidden" \
  -H "API-Key: {key}" -H "API-Pin: {pin}"
```

- **Who.** The owner's keys, and a co-builder's key, a person's or an agent seat's. Any other member key (a contributor's, a guest's, a player's, a seat below co-builder) gets `403` [`permission_error`](/api/errors/#permission_error) on all three routes. That answer comes before the id is looked at, so it says nothing about the element. A read key on `PUT` or `DELETE` gets `403` [`permission_error`](/api/errors/#permission_error) too.
- **Which element.** One of this world's, of the category in the path; any other id is `404` [`not_found`](/api/errors/#not_found).
- **The body.** None, or `{"fields": []}`. `fields` is kept for hiding single fields, which is not built: a non-empty list is `422` [`invalid_request`](/api/errors/#invalid_request) with `param` `fields`, and any other key is a `422` naming it.
- **Repeats.** Hiding a hidden element, or unhiding one that is not hidden, answers `204` and changes nothing. These routes take no `Idempotency-Key`.

`GET /api/v2/world/hidden` lists every hidden element, newest first, with `Cache-Control: no-store`:

```json
{ "data": [ { "type": "character", "id": "…", "set_at": "…", "set_by": null } ] }
```

| Field | Meaning |
|:--|:--|
| `type`, `id` | The element |
| `set_at` | When it was hidden |
| `set_by` | The membership that hid it, or `null` when the owner did (as in [`created_by`](/docs/development/api/members#created_by)) |

Deleting a hidden element deletes its mark with it, and deleting a world deletes all of its marks. The [MCP server](/docs/development/mcp) has no tool to hide or unhide.

## Errors

| Status | Code | When |
|:--|:--|:--|
| `401` | [`invalid_credentials`](/api/errors/#invalid_credentials) | A missing or wrong key, or a wrong PIN |
| `403` | [`permission_error`](/api/errors/#permission_error) | The key is not the owner's or a co-builder's, or a read key on `PUT` or `DELETE` |
| `404` | [`not_found`](/api/errors/#not_found) | The element is not in this world as that category |
| `422` | [`invalid_request`](/api/errors/#invalid_request) | A malformed id; a body that is not JSON, not an object, or anything but an empty `fields`. `param` names it |
| `429` | [`rate_limited`](/api/errors/#rate_limited) | Too many wrong PINs on this key |
| `429` | [`too_many_requests`](/api/errors/#too_many_requests) | Over the request budget, as on every route ([Limits](/docs/development/api-reference#limits)) |

## The Feed

A hide does not reach [`/changes`](/docs/development/api/changes) yet. The feed writes no row for it, and nothing tells a reader who already holds the element: its copy stays until it reads the element again and gets the `404`. From then on the element is missing from that reader's feed, lists and reads. A hide moves the feed's `head` by one, with no row at that position for any reader.

An unhide writes no row either, and the element's `change_seq` does not move. A reader following the feed from a stored cursor gets the element back at its next change, or by walking the feed again from the start.

## What the Mark Does Not Reach

- **Published share pages.** A page that already holds the element keeps showing it: unpublish the page, or republish it without the element.
- **The owner's copies.** The owner's [export file](/docs/development/api/changes#the-export-file), and the owner's walk of `/changes`, carry hidden elements like any other, with nothing in the body to mark them.

On onlyworlds.com, the owner hides and unhides from the element's page: see [onlyworlds.com](/docs/tools/onlyworlds-com).
