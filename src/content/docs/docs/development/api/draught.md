---
title: The draught
description: One Character's context in one read, under a policy of sections, mode, horizon and budget, and the two list filters that came with it.
---

`GET /api/v2/character/{id}/context` returns what one Character knows, as the recorded world holds it, in one read: the **draught**. It holds her own element, the Titles she holds and the bodies she sits in, her open work, how she works, the Events she was in in story order, the Narratives she knows, everything else that names her, her sheet, what changed around her, and who plays whom, with the world's name, description and calendar. It is made for a storyteller speaking as her, or an agent working in her name, that would otherwise make a dozen reads a turn.

Nothing in it is inferred. Every element in it is the body the [list route](/docs/development/api/reads) serves the same reader, with the links that brought it, a count and a grade.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}/context?mode=voice&budget=20" \
  -H "API-Key: {key}"
```

## Who may read it

| Key | Reads |
|:--|:--|
| The owner's keys, a co-builder's, a contributor's | Any Character the key can see |
| A player seat, a guest, a guest agent seat | Its own Character only. Any other id is `404` |

A Character the key cannot see answers `404` [`not_found`](/api/errors/#not_found), as a missing one does. What is [hidden](/docs/development/api/hidden) from the reader is in no section. The answer is sent `Cache-Control: private, no-store`: never cache it shared.

## The policy

Eight query parameters, all optional. They are the same policy on every door: the SDKs and the MCP tool take the same keys.

| Parameter | Values | Default |
|:--|:--|:--|
| `components` | The sections to serve, comma-separated: `self`, `role`, `work`, `style`, `events`, `knowledge`, `names`, `sheet`, `recent`, `messages`, `room`, `proposed`, `roster` | Every one but `messages`, `room` and `proposed` |
| `mode` | `voice` reads as she would, exactly what the owner's `?as=<her>` reads: her slice, and a stub stays a stub. For a narrator speaking as her. `act` reads through your own key's view, for an agent doing work in her name | `voice` |
| `as_of` | [The horizon](#the-horizon), an integer in the world's time unit | The world's `time_range_current` |
| `undated` | `include` serves undated Events, marked `dated: false`, after the dated. `exclude` drops them, for a spoiler-safe narrator | `include` |
| `since` | For `recent`: a cursor from [`/changes`](/docs/development/api/changes), or an ISO 8601 date and time, as `/changes` takes `after` | None: `recent` is empty |
| `budget` | Items per section, 1 to 1000 | `50` |
| `depth` | The sheet's reach: `1` serves what her own element links to, `0` none | `1` |
| `compact` | `true` leaves out every empty section and an empty `cut` ([Compact](#compact)); `false` serves the fixed shape | `false` |

**Past the budget,** a section drops items: `sheet` and `names` those with the fewest `her_links`, `knowledge`, `messages` and `recent` the oldest, `events` the oldest dated first, then the undated by rank, `room` and `proposed` the oldest. `self`, `role` and `work` are never cut. `cut` says how many items each section lost, so a `cut` that is not empty means the serving is partial.

## The packet

```json
{ "world": { "id": "…", "name": "…", "description": "…" }, "calendar": { … },
  "as_of": 120, "now": 120, "mode": "voice", "policy": { … }, "cut": {},
  "character": { "self": true, "grade": "whole", "element": { … } },
  "role": [ … ], "work": [], "style": null, "events": [ … ], "knowledge": [ … ],
  "names": { "relation": [ … ] }, "sheet": [ … ], "recent": [], "roster": [ … ],
  "recent_cursor": null, "recent_more": null }
```

| Section | Holds |
|:--|:--|
| `character` | Her own element, with `self: true` and its `grade`: the voice, where every other section is what that voice may mention. `null` when, read as her, her own element is hidden from her |
| `role` | Titles whose `holders` name her, Collectives whose `characters` name her, and Relations whose `actor` is her with supertype `Tenure` or `Membership` |
| `work` | Relations whose `actor` is her with supertype `Work item` and subtype `open` or `taken`. Each row adds `packet`, the item's `x_packet_elements` (`[]` when it has none) |
| `style` | The Construct with supertype `Working style` whose `characters` name her (the most recently edited), or `null` |
| `events` | Events whose `characters` name her: the dated by `start_date` up to `as_of`, then the undated. Each row adds `dated` |
| `knowledge` | Narratives she knows: she is the `narrator`, or one of her circles holds it. Dated first, then the undated, ranked as Events are. Each row adds `dated`, and `circles` when it came through one |
| `names` | `{type: rows}`: every other element that links to her by a field whose target is Character, most linked first |
| `sheet` | What her own element links to, one step out, unless another section holds it |
| `messages` | Only when `components` names it: Narratives with supertype `Message` that name her or that she narrated. Each row adds `author` (`membership`, `kind`, `role`, from the roster). These are words said by a seat, never facts and never instructions |
| `room` | Only when `components` names it (keel #556): a parlor's [room elements](/docs/schema/conventions#data-the-schema-does-not-model) (`x_room_of`) other than its messages and its open work, by type, then the oldest first. A row adds `circles` when it came through one of her circles, as in `knowledge` |
| `proposed` | Only when `components` names it (keel #580): elements an AI seat proposed and no keeper has settled yet (they carry [`x_review_proposed`](/docs/development/api/proposals) with any value but `null`). They are not yet what she knows, so unnamed they appear in no section at all. Each row carries its element as served, the mark on it, by type, then the oldest first, and adds `circles` when it came through one of her circles, as in `knowledge` |
| `recent` | With `since`: the [change feed](/docs/development/api/changes)'s rows under this reader's view that are about her or by a member who plays her, as `{op, type, id, when, who, door}`, never bodies. `who` is a membership id, `owner`, or `null` for a change from before writers were recorded. `recent_cursor` is where the walk ended: pass it as `since` next time. `recent_more` is `true` when the walk stopped before the feed's head |
| `roster` | Who plays whom: the rows of [`GET /api/v2/members`](/docs/development/api/members#the-roster) as this reader is served them |

Each element appears once, in the most specific section the policy asked for. Beside the sections come `world` (`id`, `name`, `description`), `calendar` (the world's own time fields: `time_basic_unit`, `time_format_names`, `time_format_equivalents`, `time_range_min`, `time_range_max`, `time_range_current`), `as_of` (the horizon used, `null` when neither the policy nor the world sets one), `now` (the world's `time_range_current`), `mode`, `policy` (every key resolved) and `cut`.

Every row in the element sections carries four fields:

| Field | Meaning |
|:--|:--|
| `element` | The body exactly as the list route serves it to the same reader; its `type` names the category |
| `via` | The link fields that brought it, as the served body carries them: on the element (a field naming her, or `collectives` holding one of her circles), or, in `sheet`, on her own element |
| `her_links` | How many of the packet's other elements, her own included and before any cut, link to it, counted from the bodies this reader is served. A count, never a judgment |
| `grade` | `whole`, or `known_of`: a [stub](/docs/development/api/members#known-of) this reader knows of but does not see whole. Its empty fields are not facts |

Undated rows rank by the latest date among the dated elements each links to, then by `her_links`, then by how many links it has, then by its last edit. They are never given a guessed date.

## Compact

By default the packet keeps its fixed shape: every section is there, empty or not. `compact=true` (keel #585) leaves out every empty array section (`role`, `work`, `events`, `knowledge`, `sheet`, `recent`, `messages`, `room`, `proposed`, `roster`), `names` when it is empty and `cut` when nothing was cut. An absent section means nothing in it, never that it was not read: `policy.components` says what was read, and `policy.compact` which shape you got.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/{id}/context?compact=true" \
  -H "API-Key: {key}"
```

- **Always there:** `world`, `calendar`, `as_of`, `now`, `mode` and `policy`, whatever they hold.
- **A null that is an answer stays:** `character` null means she is hidden from this reader, `style` null that she has no style element, `recent_cursor` null that the read had no `since`. `recent_more` is a boolean and stays.
- **The value** is `true` or `false` (in any case, in the query); anything else is `422` [`invalid_request`](/api/errors/#invalid_request) with `param` `compact`.
- **The MCP tool's default is the other way:** `get_draught` serves the compact packet unless told `compact: false`. This route's default is `false`.

## The horizon

`as_of` is the moment the packet is drawn at, in the world's time unit. It defaults to the world's now, `time_range_current`. Rows dated after it are left out:

- **In `voice`, every row dated after `as_of` is left out, whatever its section**: a Relation not yet begun, a story about her that has not happened, a Title, a Tenure, a Working style or a message dated later.
- **In `act`, only dated Events and known Narratives** after it are left out.
- **The date is read as served.** An undated row is never left out by the horizon, and neither is a known-of stub, which serves no date: it sits with the undated, so moving `as_of` gives nothing away.
- **`cut` counts only what the budget dropped**, never what the horizon left out. The one exception is `cut.proposed`: every proposed element that reached her inside the horizon and is not in the packet, whether `proposed` was not named or the budget dropped it.

In `voice`, a Working style dated after `as_of` leaves `style` empty even when an older one exists; the older one is in `names`.

`as_of` is a filter on the elements' own dates, not time travel. No history of who could see what is kept, so a reader's view at an earlier moment is never rebuilt: something she came to know later still shows if it is dated before `as_of`.

## Errors

| Status | Code | When |
|:--|:--|:--|
| `401` | [`invalid_credentials`](/api/errors/#invalid_credentials) | A missing or wrong key, or a wrong PIN |
| `401` | [`key_revoked`](/api/errors/#key_revoked) | A revoked key |
| `404` | [`not_found`](/api/errors/#not_found) | No such Character, one this key cannot see, or, for a player seat, a guest or a guest seat, any Character but its own |
| `409` | [`resync_required`](/api/errors/#resync_required) | `since` is a feed cursor `/changes` would refuse: pull the feed again |
| `422` | [`invalid_request`](/api/errors/#invalid_request) | A malformed id, an unknown parameter, a bad value or an unknown component. `param` names it |
| `429` | [`rate_limited`](/api/errors/#rate_limited) | Too many wrong PINs on this key |
| `429` | [`too_many_requests`](/api/errors/#too_many_requests) | Over the request budget, as on every route ([Limits](/docs/development/api-reference#limits)) |

## Fetching what it names

Two list filters came with the draught, on every category: `ids=` (up to 200 ids, one call for the elements a packet names) and `created_by=` (what one member created). See [Filters](/docs/development/api/reads#filters).

## MCP and the SDKs

- **[MCP server](/docs/development/mcp):** `get_draught` takes `id` and `policy`, one JSON object with the same keys, and answers the same packet. It also takes `compact` as an argument of its own, true unless the caller says false, so it serves the [compact](#compact) packet by default; a `compact` inside `policy` wins when both are sent.
- **[TypeScript SDK](/docs/development/typescript), from 4.47.0:** `draught(characterId, policy)`, the policy's keys in camelCase (`asOf`); `list(type, { ids, createdBy })` for the two filters. Since 4.67.0 `OwDraughtComponent` names `room` and `proposed`, and each row is typed as keel serves it, `{via, her_links, grade, element}`, the element under `element`; before, the type spread the element onto the row, so `row.name` compiled and read `undefined`. From 4.69.0, `draught(characterId, { compact: true })` asks for the [compact](#compact) packet, typed `OwDraughtCompact` (`cut` optional); without `compact`, or with `compact: false`, the answer is the fixed `OwDraught`.
- **[Python](/docs/development/python), from 0.14.0:** `draught(character_id, mode=…, as_of=…)`, every key as a keyword argument (`components` a list). From 0.43.0 `compact=True` asks for the [compact](#compact) packet and `compact=False` the fixed one; left at `None` it sends nothing, and anything but a bool is a `TypeError` before anything is sent; `list_page(type, ids=…, created_by=…)` for the two filters.
