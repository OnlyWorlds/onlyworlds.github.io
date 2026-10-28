---
title: Hidden elements
description: How the world's owner or a co-builder hides an element from the rest of the world, what each reader then sees, and the routes.
---

The world's owner and its co-builders can **hide** an element: a twist the players have not reached, a villain's real allegiance, the game master's own notes. A hidden element stays in the world, unchanged. The owner, the co-builders and the member who created it still see it; to everyone else it answers as if it did not exist, and a contributor's [change feed](#the-feed) says it was hidden.

The mark is a record beside the element, not a field. Hiding or unhiding leaves the element's fields and its `change_seq` alone; a reader who still sees it is told by [`hidden: true`](#the-hidden-flag) on its body.

![Who sees what in a world: owner, co-builder, contributor, guest, player and public, with the hidden mark](/assets/images/reader-ladder.svg)

## Who sees a hidden element

| Reader | Sees |
|:--|:--|
| The owner: on onlyworlds.com, with every world key the owner minted (`ow_w_`, `ow_r_`), and with a legacy key | Everything, hidden elements included |
| A co-builder, person or agent seat | Everything, hidden elements included |
| A contributor, person or agent seat | The whole world except the hidden elements, apart from those it created |
| A guest, or a player | Its [guest's view](/docs/development/api/members#guests) except the hidden elements, apart from those it created |

- Hiding wins over every way a guest is given sight: an element that names its Character, a Narrative its Character narrates or one of its circles holds, a Character on the roster. Only having created the element gives it back.
- An agent seat reads as its role, also when it plays a Character.
- A key you mint is your own tool and shows what you hid. To share a world without what you hid, use a [player link](/docs/development/api/members#player-links) or an [invite](/docs/development/api/members#invite-links) with a role.

### The hidden flag

Every reader who still sees a hidden element gets `hidden: true` at the top level of its body: the owner, a co-builder, a key the owner minted, and the member who made it. It is there on `GET /api/v2/{type}/{id}`, on lists, on the [change feed](/docs/development/api/changes)'s upserts and in the [MCP server](/docs/development/mcp)'s reads, whatever `fields=` asked for. On every other body it is absent, never `false`. Sent back in an update (`PATCH`, or a `PUT` that replaces), it is ignored, so a body sent back never hides or unhides anything. Sent on a create, `hidden: true` [creates the element hidden](#creating-an-element-hidden). The owner's [export file](/docs/development/api/changes#the-export-file), world sync and the [Classic API](/docs/development/api/classic) never carry it. The [TypeScript SDK](/docs/development/typescript)'s element types carry it as an optional `hidden: true`, from 4.50.0.

## What everyone else gets

To a reader it is hidden from, a hidden element answers exactly as a missing one, byte for byte:

- `GET /api/v2/{type}/{id}` is `404` [`not_found`](/api/errors/#not_found), never `410` [`gone`](/api/errors/#gone).
- Lists, the `characters` filter, [search](/docs/development/api/reads#search), the [MCP server](/docs/development/mcp)'s tools and world index, and every count and `has_more` leave it out. Its [files](/docs/development/api/files) answer `404`.
- Links to it are left out of every body the reader reads: a single link reads `null`, a multi link loses the id, and `?expand` has nothing to expand. The elements that carry those links do not change: their `change_seq` stays where it was.
- A hidden Character's id reads `null` on the [roster](/docs/development/api/members#the-roster) (`GET /api/v2/members`), on [`GET /api/v2/me`](/docs/development/api/members#who-am-i) and in the world's `owner_character` (`GET /api/v2/world`, and the join preview). That holds for the Character the reader's own member plays, too, unless that member created it. The world's `ETag` differs for a reader whose `owner_character` reads `null`, so a cached body does not outlive the hide.
- A reader following [`/changes`](/docs/development/api/changes) is told in the feed: see [The feed](#the-feed).

## Writes that name it

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

## Playing a hidden Character

A Character someone plays is on every reader's roster, so a hidden Character can never be picked to play, by anyone, the owner included:

- Setting it as the Character an agent seat or a player plays (`character` on [`PATCH /api/v2/account/worlds/{world_id}/members/{member_id}`](/docs/development/api/members#managing-members), or **Change** on its row under Members on the world page) is `422` [`character_hidden`](/api/errors/#character_hidden), `param` `character`. Unhide it first, or pick another.
- Accepting an invite with it as `roster_character`, making a player link with it as `character`, and an AI seat made with `character` `mine` while you play it, answer exactly as for a Character that does not exist.
- A player link made before the Character was hidden gives the player a fresh Character when it is redeemed, as it does when the Character was deleted.
- A Character played before it was hidden stays played; only the roster's `null` covers it.

## Hiding and unhiding

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
- **Which element.** One of this world's, of the element type in the path; any other id is `404` [`not_found`](/api/errors/#not_found).
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

In the [TypeScript SDK](/docs/development/typescript), `listHidden()` returns these rows (from 4.48.0).

Deleting a hidden element deletes its mark with it, and deleting a world deletes all of its marks. The [MCP server](/docs/development/mcp) has no tool to hide or unhide an existing element; its `create_element` can [create one hidden](#creating-an-element-hidden).

### Creating an element hidden

A create can carry the mark (since 2026-10-23), so what a source kept private never shows, even for a moment, to a reader who cannot see hidden elements. Send `hidden: true` in the body of `POST /api/v2/{type}`, of a `PUT /api/v2/{type}/{id}` that creates, or of a [`/bulk`](/docs/development/api/writes#bulk) item that creates:

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/narrative" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "name": "Why the Time Tombs open", "hidden": true }'
```

- **Who.** The same keys as the hidden routes: the owner's, and a co-builder's, a person's or an agent seat's. Any other key gets `403` [`hidden_not_allowed`](/api/errors/#hidden_not_allowed) and nothing is created; in `/bulk` the error is in that item's slot.
- **The value.** `false`, `null` or absent creates a visible element, as ever. A value that is not a boolean or `null` is `422` [`invalid_request`](/api/errors/#invalid_request) with `param` `hidden`. Where the server has the hidden mark switched off, `true` is a `422` with `param` `hidden` too, and nothing is created.
- **One step.** The mark is written in the create's own transaction, at the element's first `change_seq`. A contributor's [feed](#the-feed) gets one `delete` row with `reason` `hidden` at that place and never the body; a guest gets nothing; the owner and co-builders get the upsert with `hidden: true`.
- **Only a create.** On a `PUT` that replaces an existing element, and on a `PATCH`, `hidden` is ignored: an existing element is hidden and unhidden only through `PUT` and `DELETE /api/v2/{type}/{id}/hidden`.
- **MCP.** `create_element` takes `hidden` (boolean, off by default), or `hidden: true` in its `element`, on the same terms.
- **Python.** From 0.43.0 the [package](/docs/development/python)'s `create`, `upsert` and `bulk` send `hidden` as the element carries it (before, they stripped it, so a folder's hidden element was created visible), and `ApiError.is_hidden_not_allowed` names the `403`. Its `push` creates nothing and never sends the mark.

## Errors

| Status | Code | When |
|:--|:--|:--|
| `401` | [`invalid_credentials`](/api/errors/#invalid_credentials) | A missing or wrong key, or a wrong PIN |
| `403` | [`permission_error`](/api/errors/#permission_error) | The key is not the owner's or a co-builder's, or a read key on `PUT` or `DELETE` |
| `404` | [`not_found`](/api/errors/#not_found) | The element is not in this world as that element type |
| `422` | [`invalid_request`](/api/errors/#invalid_request) | A malformed id; a body that is not JSON, not an object, or anything but an empty `fields`. `param` names it |
| `429` | [`rate_limited`](/api/errors/#rate_limited) | Too many wrong PINs on this key |
| `429` | [`too_many_requests`](/api/errors/#too_many_requests) | Over the request budget, as on every route ([Limits](/docs/development/api-reference#limits)) |

## The feed

Every `delete` op on [`/changes`](/docs/development/api/changes) says why, in `reason`: `deleted` for an element that was deleted, `hidden` for one hidden from this key. (`out_of_view` is reserved; nothing sends it yet.) A hide takes one place in the world's change sequence, so `head` moves by one, and so does an unhide that clears a mark (a second unhide takes none).

| Reader | When an element is hidden from it | When it is unhidden |
|:--|:--|:--|
| A contributor, person or agent seat | One `delete` op with `reason` `hidden`, at the place the hide took | Its next call answers `409` [`resync_required`](/api/errors/#resync_required) |
| A guest or a player that could see it | Its next call answers `409` [`resync_required`](/api/errors/#resync_required); a guest never gets a `delete` op | `409` again |
| A guest or a player that could not see it | Nothing | Nothing |
| The owner, a co-builder, the member who created it | One `upsert` op at the place the hide took, its body with `hidden: true` | One `upsert` op at the place the unhide took, its body without `hidden` |

The hidden row has the shape of any delete:

```json
{ "op": "delete", "type": "character", "id": "…", "change_seq": 412, "deleted_at": "…",
  "deleted_by": "0699…", "deleted_via": "api", "reason": "hidden" }
```

`deleted_at` is when it was hidden, `deleted_by` the membership that hid it (`null` for the owner), and `deleted_via` the door it came through; a hide made on onlyworlds.com reads `site`, the owner's act. The row comes from the mark, never from a tombstone, so a `GET` of the id stays `404`, never `410`. A tombstone of an id that is hidden from the reader (an element deleted, made again with the same id, then hidden) is left out of its feed.

The readers who still see the element get it as an `upsert` at that place instead: the body as their `GET` of it answers, and who acted, when and through which door, in the delete row's shape:

```json
{ "op": "upsert", "type": "character", "id": "…", "change_seq": 412, "updated_at": "…",
  "changed_at": "…", "changed_by": "0699…", "changed_via": "api",
  "element": { "type": "character", "id": "…", "name": "…", "hidden": true, "change_seq": 377, … } }
```

The row's `change_seq` is the act's place; the element's own, inside `element`, stays where it was, since a hide changes nothing in the element. `changed_by` is `null` for the owner. `changed_at`, `changed_by` and `changed_via` ride only on these rows; every other `upsert` carries none of the three. An [`after=`](/docs/development/api/changes) window reads such a row by its `changed_at`. Before 2026-10-25 these readers got no row, and `hidden: true` first reached the feed on the element's next change.

What a client does:

- **On `reason` `hidden`:** remove the element from the local copy, as for any delete, and do not offer to keep it. A row may name an id you never held (an element made and hidden while you were not reading): drop it as you would any delete of an unknown id.
- **On `409` `resync_required`:** pull the feed again from `since=0`, then follow the error's `reason` ([What a reset keeps](/docs/development/api/changes#what-a-reset-keeps)): `role` (your own role or membership moved), keep what the new walk does not name; `view` (something left your view: a delete, a hide, an unhide, a Character change), drop it. When both happened since your cursor, the answer is `role`. A tool never empties a copy on its own.
- A hidden row reaches a reader only for a hide made after its view last started (when it joined, or when its cursor was last reset), whatever cursor it sends. A new member, or one whose cursor was just reset, gets no row for an earlier hide; a walk from the start by a reader whose view started before the hide does carry it.

### The contributor's cursor

A contributor, person or agent seat, carries the cursor a [guest](/docs/development/api/changes#guests-cursors) carries: three parts, an `epoch` on every page and on `?head=true`, and a `?head=true` cursor to pass straight back as `since`. Unlike a guest, it still receives every `delete` op.

- **Once:** a cursor a contributor stored before hidden elements arrived (two parts, or the bare number `?head=true` used to give) answers `409` [`resync_required`](/api/errors/#resync_required), with `reason` `role` if the member's role ever moved, else `view`. Pull again from `since=0`, follow the `reason`, and store the new cursor.
- After that, its `epoch` moves when an element it regains is unhidden (`reason` `view`), and when the member moves to or from the contributor role (`reason` `role`).
- Every page and `?head=true` carry `epoch_reason` beside `epoch`: why the epoch last moved, `role` or `view`. It names the last move only; the `409`'s `reason` covers every move since your cursor.
- The owner and co-builders keep the two-part cursor and `epoch` `null`. A three-part cursor from them (a contributor made co-builder) is the same `409`.

## View as

The owner can read the world as another reader would, to check what a member, a Character's player or the public sees before or after a hide. Add `as` to a read:

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/?as=public" \
  -H "API-Key: {key}"
```

| Route | Takes `as` |
|:--|:--|
| `GET /api/v2/{type}` and `GET /api/v2/{type}/{id}` | Yes |
| [`GET /api/v2/search`](/docs/development/api/reads#search) | Yes |
| `GET /api/metadata/{type}/` and `GET /api/metadata/{type}/sections/` (the choice lists) | Yes |
| Every write, `/changes`, `/members`, `/me`, `/world`, the files routes and the hidden routes | No: `422` |

| Value | Reads as |
|:--|:--|
| A membership id of this world (a person, an agent seat or a player seat) | That member's own key, its own creations included. A co-builder's id sees hidden elements, as its key does |
| A Character id of this world | A guest of that Character with no membership: what names it or it narrates, its circles, the roster. Nothing counts as its own creation |
| `public` | Everything that is not hidden, not a room element and not still proposed: no creations, no grants |

A membership id is tried first. The answer is what that reader's own key would get: links in the bodies, `?expand` and the `characters` filter follow the same reader.

- **Who.** Only a key with no member: the owner's own keys and a legacy key. A member key that sends `as` gets `403` [`view_as_owner_only`](/api/errors/#view_as_owner_only).
- **A hidden element** is `404` [`not_found`](/api/errors/#not_found), never `410`. A deleted element is `410` [`gone`](/api/errors/#gone) as a co-builder or a contributor; as a guest, a player, a Character or the public it is `404`. The public reads no tombstones.
- **Refused.** `as` on a route that does not take it, or a value that is not a live membership, a Character of this world or `public`, is `422` [`invalid_request`](/api/errors/#invalid_request) with `param` `as`. The route is checked before the key, so a member key sending `as` to a route that does not take it gets the `422`. The metadata routes answer their refusals in their own shape, `{"error": {"code": …, "detail": …}}`, with no `param`.

On onlyworlds.com, the owner's world page has a **View as** picker (me, a player, a Character, anyone). The world page, the type lists and the element pages then show that reader's view, read-only, under a bar that says who is shown; a hidden element shows the not-found page, and so, viewed as the public, does an element still proposed.

## What the mark does not reach

- **Published share pages.** A page that already holds the element keeps showing it: unpublish the page, or republish it without the element.
- **The owner's copies.** The owner's [export file](/docs/development/api/changes#the-export-file) carries hidden elements like any other, with nothing in the body to mark them. The owner's walk of `/changes` carries them too, each upsert with [`hidden: true`](#the-hidden-flag).

On onlyworlds.com, the owner hides and unhides from the element's page: see [onlyworlds.com](/docs/tools/onlyworlds-com).
