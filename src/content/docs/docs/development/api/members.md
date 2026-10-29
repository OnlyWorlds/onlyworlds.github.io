---
title: Members and sharing
description: Who can be in a world besides its owner, what each role may see and change, guests, and the ways to share a world.
---

A world can have **members** besides its owner: people the owner invites by email address or through an invite link, AI agents with a seat (made by a member, or through an agent link), and players who read with no account. Every member has a **role**, and every element records which member created it.

## Roles

| Role | Sees | Changes |
|:--|:--|:--|
| `owner` | Everything, [hidden elements](/docs/development/api/hidden) included | Everything, including the world's own fields |
| `co_builder` | Everything, hidden elements included | Every element |
| `contributor` | Everything except the hidden elements it did not create | Only the elements it created |
| `guest` | What it created, what its Character is on or knows, the stubs of what its Character's sheet points to, the roster's Characters, the messages addressed to it or to everyone, and the world's Charter and the Objects it names ([Guests](#guests)), except the hidden elements it did not create | Only the elements it created |

- A contributor or guest changing, replacing, relinking or deleting someone else's element gets `403` [`not_author`](/api/errors/#not_author). In `/bulk` this is reported per item.
- A seat the owner gives a Character to play (**Plays**, [Agents](/docs/development/agents#after-joining)) may change that Character, never delete it.
- A Read mark (a Relation with supertype `Read`, the [message profile](/docs/schema/profiles/messages)'s record of what one reader has read) is written only by its own reader, the owner and co-builders included: any other key gets `403` [`not_reader`](/api/errors/#not_reader).
- The world's own fields (`PATCH /api/v2/world`) are the owner's and a co-builder's: a co-builder may change every writable field but `owner_character`. A contributor's or guest's key there, or a co-builder's sending `owner_character`, gets `403` [`owner_only`](/api/errors/#owner_only). The public switch stays the owner's, on the world page.
- A co-builder may also make, list and revoke the world's guest and contributor [invite links](#invite-links) with its world key; co-builder links stay the owner's.
- Members accept an invite in their own account and mint their own keys there. A member's key writes with the member's own account PIN ([Member keys](/docs/getting-started/keys#member-keys)).

## `created_by`

Every element body carries `created_by`: the id of the membership that created it, or `null` when the owner did (and for everything created before memberships existed). The server keeps it; sent in a write body, it is ignored.

The owner or a co-builder can change who made an element: `POST /api/v2/{type}/{id}/adopt` with `{"member": "<membership id>"}` (a person or an AI seat, as the roster lists them) or `{"member": "owner"}` (`created_by` back to `null`), with the key's PIN. A contributor's key gets `403 not_author`. Nothing else in the element changes, but the write stamps `changed_by` and `changed_via` and takes a new `change_seq`, so the [feed](/docs/development/api/changes) carries the element with its new `created_by`. It hands a contributor an element someone else made, or takes one back; when the element is hidden, or the member is a guest, the old and the new maker may each get a `view` reset on the feed. On the site, the owner's view of an element page has an Author card for the same act.

A membership's row is never deleted. Removing a member, a member leaving, removing an agent seat, and deleting the account behind a membership (or the account answering for a seat) all keep it, as a removed row on [the roster](#the-roster), so its elements keep their `created_by` and `changed_by`. An id whose roster row has `status` `removed` is a former member's, never the owner's: the owner is always `null`. A member who is removed or leaves takes the AI seats they made in that world with them: those seats' keys stop working at once, and their rows and what they wrote stay (the owner's own seats are untouched). A Character the member made and nobody touched (a name and a supertype only, last written by the member, linked from nothing) is deleted with the membership; any other stays.

## The roster

`GET /api/v2/members` lists everyone in the world. Any key on the world may read it, without a PIN. It is not paginated.

```bash
curl -s "https://www.onlyworlds.com/api/v2/members" -H "API-Key: {key}"
```

```json
{ "data": [
    { "id": null, "kind": "owner", "role": "owner", "character": "0695…", "status": "active", "lenses": [] },
    { "id": "0699…", "kind": "agent", "role": "contributor", "character": "069a…", "status": "active", "name": "Wren", "lenses": [] } ] }
```

| Field | Meaning |
|:--|:--|
| `id` | The membership id, which is what `created_by` holds; `null` for the owner |
| `kind` | `owner`, `person`, `agent` or `player` |
| `role` | `owner`, `co_builder`, `contributor` or `guest` |
| `character` | The Character that is this member, or `null`. The owner's is the world's `owner_character`. `null` too when that Character is [hidden](/docs/development/api/hidden) from the calling key |
| `status` | `active` or `removed` |
| `name` | Agent and player rows only: their name |
| `lenses` | The [lenses](/docs/lenses/api) the row starts with, lens ids in order: the ones it chose, or, when it chose none, the lenses whose `titles` name a Title its Character holds (the owner row: always the owner's own choice); `[]` for none. A lens the calling key cannot see is left out |
| `lenses_from` | Where `lenses` comes from: `chosen` (the row's own list, an empty one included) or `titles` (it never chose, and its Character's Titles bring these) |
| `x_served_trimmed` | Present only when `lenses` was served with a lens left out: then it names `lenses` ([A list trimmed for its reader](/docs/schema/folders#a-list-trimmed-for-its-reader)) |

The owner row comes first, then active members in the order they joined, then removed members. Removed members keep their row so every `created_by` and `changed_by` resolves: a member who was removed, who left, or whose account was deleted. A removed row whose account was deleted carries nothing that names the person. The roster never carries usernames or email addresses: a Character is the public face.

A message's `narrator` is who it claims to be from; its `created_by` is who the server recorded; the roster joins the two. To find what is addressed to a Character, filter on it:

```bash
curl -s "https://www.onlyworlds.com/api/v2/narrative?characters={character_id}" -H "API-Key: {key}"
```

## Who am I

`GET /api/v2/me` answers who the calling key is, for any key and without a PIN:

```json
{ "world": { "id": "…", "name": "Hyperion" }, "scope": "write", "kind": "agent",
  "role": "contributor", "membership": "0699…", "character": "069a…", "lenses": [], "name": "Wren",
  "front_door": { "sponsor": { "id": "0698…", "kind": "person", "name": "Mara" },
    "sponsor_character": "069b…", "my_character": "069a…", "my_seats": [],
    "charter": "069c…", "charter_skill": ["069d…"] } }
```

`scope` is `read` or `write`. `membership` is what `created_by` will hold for what this key creates. `lenses` are the lenses you start with: the ones you chose (`PUT /api/v2/me/lenses`), or, when you never chose, your Character's Titles' (`lenses_from` says which); choosing an empty list keeps you off your Titles' lenses, with `x_served_trimmed` as on the roster. An owner-minted or legacy key answers as the owner, with `membership` `null` and `character` set to the world's `owner_character`. A Character [hidden](/docs/development/api/hidden) from the key reads `null`, the one its own member plays included, unless that member created it.

### The front door

`front_door` is on every `/me` answer (and on `PUT /me/character`'s, and an agent's join reply), so a key learns in its first read where it is and whom it answers to:

| Field | What it is |
|:--|:--|
| `sponsor` | The person who answers for this seat (an AI or a player seat): `id`, their membership id as the [roster](#the-roster) lists it (`null` for the world's owner); `kind`, `owner` or `person`; `name`, their Character's name (`null` when they play none you can read). `null` for the owner's keys, a person's own key, and a seat made from a link for an email address, which never says whose account the address matched. |
| `sponsor_character` | The sponsor's Character, the one to address a message to, or `null`. |
| `my_character` | Your own Character (the owner's is the world's `owner_character`), or `null`. |
| `my_seats` | The live AI and player seats you answer for (since 2026-10-26), agent seats first, then the oldest first. Each is `{id, kind, name, character}`: `id` the seat's membership id as the [roster](#the-roster) lists it, `kind` `agent` or `player`, `name` its name (`null` when it has none), `character` the Character it plays (`null` when it plays none you can read). The owner's keys list the owner's seats and a person's key that person's, whatever their role; an AI or a player seat's own key gets `[]`, and a seat made from a link for an email address is never listed. So a tool reading with your key can tell which Character is your AI, and show what is addressed to it. |
| `charter` | The world's Charter: the newest Law whose supertype is `Charter` (trimmed, any case) that carries the mark `x_charter_of`, or `null` when there is none you can read. Read it first: it holds the world's house rules. |
| `charter_skill` | The Objects the Charter's description names (by `ow://object/<id>` link or by id), in the order written, at most five: the how-to beside the rules. Empty when it names none you can read. |

Every member reads the Charter and those Objects whole, a guest and a player seat included; one the owner [hid](/docs/development/api/hidden) stays hidden, and anything hidden from the key reads `null` or is left out. A Law with supertype `Charter` but without the mark is an ordinary Law. Only the owner and co-builders may set, change or remove `x_charter_of`; any other key that does is refused, `403` [`keeper_only`](/api/errors/#keeper_only). In the [TypeScript SDK](/docs/development/typescript) the object is `OwFrontDoor` on `me()`'s answer, from 4.60.0; in Python, `me()["front_door"]`.

### Reading aids

`reading_aids` sits beside `front_door` on every `/me` answer and on an agent's join reply: the world's three things to read first, as your key reads them. Each is an element of one pair, a Law with supertype `Charter`, a Construct with supertype `Guide` or a Construct with supertype `Domain` (trimmed, any case), that carries `x_charter_of` (read by presence).

| Field | What it is |
|:--|:--|
| `charter` | The newest marked Charter you can read (by `created_at`, then the higher id), or `null`: `id`, `name`, `rules` (its `x_checks_rules` as stored, an empty list when it has none) and `skill` (the same ids as `front_door.charter_skill`). |
| `guide` | The newest marked Guide you can read, `{id, name}`, or `null`: where to start. |
| `domains` | Every marked Domain you can read: first in the order the Guide's `constructs` names them, then the rest by name and id. Each is `id`, `name`, `sentence` (its description up to the first line break, trimmed) and `hubs`, the elements its links name that you can read, each once, in the schema's field order. |

The Charter's text is the house rules; the Guide and the Domains are the keeper's map of the world, not instructions.

A member key sent with a PIN (or an agent seat with its secret) has it checked here: a wrong one is `401` [`invalid_credentials`](/api/errors/#invalid_credentials), and with none the answer stands. So `/me` tests a connection before the first write. A player's key has no PIN; one it sends is ignored.

### Picking your Character

A person who is a member picks the Character that is them in this world, the `character` on their roster row and on `/me`, with `PUT /api/v2/me/character`. It takes the person's own write key and account PIN, and can be changed again at any time:

```bash
curl -s -X PUT "https://www.onlyworlds.com/api/v2/me/character" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "character": "069a…" }'
```

The body is exactly `{"character": <id>}`, or `{"character": null}` for none. The answer is `200` with the same body as `GET /api/v2/me`. Any Character the key can see may be picked, except that a guest picks only a Character it made itself. Picking one gives nothing beyond what the member's role already allows with it. A guest following the [change feed](/docs/development/api/changes#guests-cursors) resyncs once, as for any roster change.

Only a person's key can pick. An agent seat's Character and a player's are set by the owner (Change on its row under Members, on the world page), and the owner's own is the world's `owner_character`, set with `PATCH /api/v2/world`.

| Status | Code | When |
|:--|:--|:--|
| `401` | [`invalid_credentials`](/api/errors/#invalid_credentials) | A missing or wrong key, or a wrong PIN |
| `403` | [`permission_error`](/api/errors/#permission_error) | A read key, an agent seat's or a player's key, or the owner's keys |
| `404` | [`not_found`](/api/errors/#not_found) | The Character is not one this key can see |
| `422` | [`character_hidden`](/api/errors/#character_hidden) | The owner or a co-builder hid it, even when it is your own: a played Character is on every reader's roster |
| `422` | [`invalid_request`](/api/errors/#invalid_request) | The body is not exactly `{"character"}`; a guest named a Character it did not make; or the Character is the owner's, or one another member plays. `param` names it |
| `429` | [`rate_limited`](/api/errors/#rate_limited) | Too many wrong PINs on this key |

In the [TypeScript SDK](/docs/development/typescript), `setMyCharacter(characterId)` (or `null`) returns the `/me` body, from 4.50.0. The Python package has no call for it yet.

## Guests

A guest key sees five things: the elements it created, the elements its Character is on or knows, the roster's Characters, the world's [Charter](#the-front-door) and the Objects it names, and, as [stubs](#known-of), what its Character's own sheet points to. "On or knows" is decided by one link per type. For a Collective, Construct, Event, Relation or Title, the `characters` link: the element names the guest's Character. For a Narrative, its knowers: the `narrator` is the guest's Character, or one of its `collectives` is a Collective whose `characters` include it (a circle the Character is in). A Narrative's own `characters` link means who the story is about and grants a guest nothing, so a secret written about a player's Character stays hidden until a knower names them. The one exception is a message (a Narrative with supertype `Message`, the [message profile](/docs/schema/profiles/messages)): there `characters` are its addressees, so a guest sees a message that names their Character there, or names nobody (addressed to every member). Hidden still wins (2026-10-26). A guest accepting an invite gets a new Character of its own (supertype `Guest`) as its roster entry.

### Known of

A guest playing a Character also reads what that Character's own sheet points to, one step out: every element a link field on the Character names (its location, species, family, traits, the Characters it calls friends or rivals, and the rest), never further, and never an element the owner [hid](/docs/development/api/hidden). The same holds for a player, a person's own Character, a guest agent seat, and the owner's [view as](/docs/development/api/hidden#view-as) a Character.

An element reached only that way is a **stub**, marked `known_of: true`. It keeps `id`, `type`, `name`, `description`, `supertype`, `subtype`, `image_url`, `created_at`, `updated_at` and `change_seq`, and its type's **public fields**, what anyone could see: for a Character, `physicality`, `height`, `weight`, `species` and `reputation`; no other type has any yet. Which fields are public is published per type in schema-dist's `presentation.json` (`public`), and the TypeScript and Python packages export them as `PUBLIC_FIELDS`. Every other field reads as unset: text `""`, numbers and single links `null`, multi-links `[]`, no extension fields, and `created_by`, `changed_by` and `changed_via` `null`. Search matches only what it keeps and marks its row `known_of: true`, and its files answer `404`. Any other grant makes it whole: it names the Character, the Character knows it, it is on the roster, or the reader made it. Without `known_of`, an element is whole.

A client shows a stub as something the Character knows of (its name, picture, description and public fields), never as an empty record. Its unset fields are not values and not a deletion. Never write a stub back: `known_of` in a write body, whatever its value, is a `422` ([`known_of_not_writable`](/api/errors#known_of_not_writable)), and a stub's empties written as a whole element would blank the real one. In a world folder, a stub keeps `known_of: true`, its kept keys and the fields served with a value, and is never pushed ([Known-of elements](/docs/schema/folders#known-of-elements)).

Everything else behaves exactly like a missing element, on every route, filter and expansion:

- An id out of its view is a `404` [`not_found`](/api/errors/#not_found).
- A link to an element out of its view is [`invalid_link`](/api/errors/#invalid_link).
- Link ids the guest cannot see are left out of every body it reads; such a single link reads `null`.
- A guest's writes keep the links it cannot see.

An element the owner or a co-builder [hid](/docs/development/api/hidden) is out of a guest's view whatever links it to the guest's Character, unless the guest created it.

A guest writes elements of any element type. Its Narratives are notes, narrated by its own Character:

- The `narrator` is the guest's Character. Left out of a create or a `PUT`, or sent as `null`, it is filled in. Another Character the guest can see is a `422` [`invalid_request`](/api/errors/#invalid_request) with `param` `narrator`; one it cannot see is [`invalid_link`](/api/errors/#invalid_link).
- `collectives` takes only the circles its Character is in. Any other Collective answers as a missing one, [`invalid_link`](/api/errors/#invalid_link).
- A guest with no Character of its own in the world cannot create or replace a note: `403` [`guest_not_supported`](/api/errors/#guest_not_supported). Nothing in the request can fix that; ask the world's owner.

A few routes (world sharing and token status) refuse guest keys with `403` [`guest_not_supported`](/api/errors/#guest_not_supported). The change feed serves a guest its slice with its own cursor rules: see [Guests' cursors](/docs/development/api/changes#guests-cursors).

## Invite links

An owner can invite a person without an email address: an **invite link** with a role, made on the world page under Access, in **Let someone in**: A person, By a link you send (`/account/worlds/<world_id>/access` opens it, after a sign-in if one is needed), shown once with a QR code beside it, or through the owner's [link routes](#managing-members) below. It has the same form as an agent link:

```text
https://www.onlyworlds.com/join#ow_j_…
```

The code is the part after `#`; a URL fragment is never sent to a server, so it never lands in a log or a referrer. A person or player link can also carry the world's id in its path, `https://www.onlyworlds.com/join/<world_id>#ow_j_…`: pasted into a chat that shows link previews, it shows the world's name and picture (a hidden Map's picture never), as long as the world holds a link with the preview on that is neither revoked nor expired (a used one still counts). Without one, the page is the plain one, the same as for an id that names no world, so a world's id alone (from an address, a folder or a screenshot) shows nothing. The world page's forms make links this way by default, with a box under More options to turn it off; over the API it is `preview: true`, off when left out. An agent link never carries it. A link works once and expires (1, 7 or 30 days); the owner can revoke it until it is used. Opened in a browser, `/join` shows who invites you, to which world and as what role, and a button to join; signing in (or creating an account) first, when needed. A person's invitation also offers Open in Lantern (on the phone) and Open in Atlas (in the browser); an agent's offers Open in Atlas. The person becomes a member with the link's role, exactly as if they had accepted an email invite: a guest gets a new Character of its own, and the member mints their own keys. No account PIN is needed to join; a write key for the membership waits for one: `409` [`pin_required`](/api/errors/#pin_required).

An invite link for people can let in up to 50 accounts: set Uses when you make it (`max_uses`, 1 to 50, on the [link routes](#managing-members)), and each person joins once with the role you chose. The link stops working when every use is taken, it expires, or you revoke it; who already joined stays.

A client can do the same two steps itself:

| Method | Route | What it does |
|:--|:--|:--|
| POST | `/api/v2/join/preview` | `{"code"}`: who invites you, the world, the role, `reader` (`person`), `expires_at`. No credential; the code stays unused |
| POST | `/api/v2/account/join` | `{"code"}`, with an account credential (`Authorization: Bearer ow_a_…`, or the `X-Session-Token` of a signed-in app client): `201` with the new membership (the same body as accepting an invite) |

A code made for a person is a bad code for an AI agent, and the other way round: every bad code, whatever the reason, answers the same `404`.

### A co-builder's links

A co-builder makes, lists and revokes the world's invite links with its own world key (a person's write key with its PIN, or an agent seat's key with its secret), through the same body and answers as the owner's account routes:

| Method | Route | What it does |
|:--|:--|:--|
| POST | `/api/v2/links` | Make a person, agent or player link: the owner's body (`reader`, `role`, `days`, `max_uses`, …). `role` may be `contributor` or `guest`; `co_builder` is `422`, param `role` |
| GET | `/api/v2/links` | Every link made for the world, by the owner or a co-builder, newest first, each with its state. No codes |
| DELETE | `/api/v2/links/{link_id}` | Revoke a guest or contributor link, whoever made it. A co-builder link is `422`, param `link_id`, and stays as it was |

The co-builder answers for what its link lets in: an agent co-builder's sponsor answers for it, and a link it made stops working when it stops being a co-builder. Any other key gets `403` [`not_co_builder`](/api/errors/#not_co_builder), the owner's own world keys included: the owner uses the account routes.

## Player links

A **player link** lets a friend read the world with no account and no PIN, as one Character: the game-night guest. The owner makes it on the world page (Let someone in, **Players at a table**, One player), in [Atlas](/docs/tools/atlas)'s or [Lantern](/docs/tools/lantern)'s Invite someone (A player), or with `reader` `player` on the owner's [link routes](#managing-members), choosing the Character the player reads as or a fresh one. It is always a guest's, and the same single-use, expiring `/join#ow_j_…` link as an invite link. Whoever opens it first reads as that Character, until the owner removes them.

Opened in a browser, `/join` offers Open in Lantern, with no sign-in. Redeemed, it makes a member with `kind` `player`: no account behind it, role `guest` for good (it cannot be promoted: `422` [`player_role_fixed`](/api/errors/#player_role_fixed)), and one `ow_r_` read key. A player reads exactly what a guest playing that Character reads ([Guests](#guests)) and writes nothing; a write with its key is `403`. The owner can change which Character the player reads as (`character` on the member's `PATCH`, or Change on its row under Members; never a hidden Character: `422` [`character_hidden`](/api/errors/#character_hidden)), or remove them, which stops the key at once. A lost key: remove the player and make a new link. The members table shows a player who never opened their link as never used.

A client redeems a player code with no credential:

| Method | Route | What it does |
|:--|:--|:--|
| POST | `/api/v2/join/preview` | As for an invite link, with `reader` `player` |
| POST | `/api/v2/join` | `{"code", "name"}` (`name` optional: the player's name on the owner's members list, and a fresh Character's name too; without it, the picked Character's name stands in, else `Player`): `201` with `kind` `player`, `role` `guest`, the world, the Character and the read `key`, shown only in this answer. The answer is typed by `kind`; an agent's code answers its own seat |

### A table of players

One player link can seat a whole table. The owner sets how many times it works (`max_uses`, 2 to 50; `1`, the default, is a link for one) and, optionally, which Characters the players may pick (`characters`, in the order they are shown; a hidden Character is refused, `422` `param` `characters`, since it can never be picked). Each person who opens it picks one Character, once, and reads as that Character like any player. The owner's list is never the cast list: only the Characters picked for the table are offered. With no list, each player names a fresh Character after themselves. On the world page it is Let someone in, Players at a table, A table of players.

A table code's preview carries four more keys; a link for one answers without them:

| Key | What it is |
|:--|:--|
| `max_uses` | How many times the link works |
| `uses_left` | How many places are left |
| `name_required` | `true` when the owner listed no Characters: the player sends a `name` instead of a pick |
| `characters` | `[{id, name, image_url, taken}]`, the owner's order. `taken` is `true` while a live seat in the world plays it, a person's included. A Character hidden or deleted since the link was made is left out |

The player redeems with `POST /api/v2/join` and `{"code", "character"}` (the id of an untaken Character from the list), or `{"code", "name"}` when `name_required` is `true`. The answer is the player's `201`, as for a link for one. The refusals spend nothing:

- A Character already taken: `422` [`character_taken`](/api/errors/#character_taken).
- A pick not on the list, or hidden or deleted since the link was made: `422` [`invalid_request`](/api/errors/#invalid_request), `param` `character`.
- The world at 50 players: `422` [`world_full`](/api/errors/#world_full), from a table or a link for one.
- The last place taken a moment before: the ordinary `404`, as for a used link.

A world holds at most 50 players, counted as each one joins, from a table or a link for one. A table counts once against the 50 pending links while it has places left. Revoking it closes the places not yet taken; the players already seated stay. A seat that is removed frees its Character but still counts as a use.

## Agent seats

An AI agent joins a world as a member with `kind` `agent`: an **agent seat**. The seat has its own Character (supertype `Agent`, unless the owner left it out), its own `ow_w_` key and its own secret for `API-Pin`. Whoever makes the seat chooses its role: the owner on an agent link (contributor by default), or a member making a seat for their AI, at most their own role.

Every seat has a **human sponsor** who answers for it: for a seat a member made ([Making a seat](/docs/development/agents#making-a-seat)), that member; for a join link, the account behind the email address the owner named when making the link, when there is one; otherwise the owner. The sponsor can remove the seat, or give it a new key, from their own account. On the owner's `GET /api/v2/account/worlds/{id}/members`, an agent row's `sponsor` is the sponsor's username when they are the owner or a member, and null for a sponsor behind an email or one who has left. On an agent row the owner also sees `may_change_character`: true when the seat may change, never delete, the Character it plays.

A world's owner can hold every seat's changes for a person's word: with **AI seats propose, a person accepts** on (`agent_writes_proposed` on the world), a seat's edits to existing elements answer `202` as [proposals](/docs/development/api/proposals) a keeper accepts or declines, and its new elements carry `x_review_proposed`. Making links, joining and the join routes are on [AI agents](/docs/development/agents).

## Sharing a world

| To give | Use |
|:--|:--|
| Read access to anyone you hand it to, no account needed | An `ow_r_` read key ([Keys and PINs](/docs/getting-started/keys)). It shows what you [hid](/docs/development/api/hidden): to share a world without that, use a player link or an invite with a role |
| Open reading to everyone, with no key or account, and a public page if you want one | **Anyone can read it, with no account** under **Who can see this world** on the world page's Settings. See [Public worlds](/docs/development/api/public) |
| A person who writes, with their own PIN and their own role | A member invite by email, or an [invite link](#invite-links) |
| A friend who reads as one Character, with no account | A [player link](#player-links) |
| An AI agent with its own seat | A [seat for your AI](/docs/development/agents#making-a-seat), or an [agent link](/docs/development/agents#the-join-link) |

A read key also works as a subscription: someone who holds it can follow the world's live state through [`/changes`](/docs/development/api/changes). With an account, they can store it as a **watched world** (`/api/v2/account/watched`), so the list follows them across tools. A watched key that stops working, for example because the owner revoked it, is marked stale rather than removed.

Sharing is forward-only: what someone has already read is theirs to keep. A key, a role or a membership governs what they receive from now on. Revoking a key, lowering a role or removing a member stops or narrows what arrives next, and takes nothing back from a copy already made.

## Managing members

Invites and memberships are managed in the [account portal](https://www.onlyworlds.com/account/), or through the account routes with an `ow_a_` [account token](/docs/getting-started/keys#account-tokens) sent as `Authorization: Bearer ow_a_…`.

| Method | Route | Purpose |
|:--|:--|:--|
| POST | `/api/v2/account/worlds/{world_id}/invites` | Invite an email address as a member (owner only) |
| DELETE | `/api/v2/account/worlds/{world_id}/invites/{invite_id}` | Cancel an invite |
| GET | `/api/v2/account/worlds/{world_id}/members` | Members and pending invites |
| PATCH | `/api/v2/account/worlds/{world_id}/members/{member_id}` | Change a member's `role`, the `character` an agent or player plays, or who answers for an agent seat, `sponsor` (a person who is a member, or `owner`) (owner only; a [hidden](/docs/development/api/hidden#playing-a-hidden-character) Character is `422` [`character_hidden`](/api/errors/#character_hidden)). `lenses` sent alone sets a row's lenses, the one change a member makes here on its own row or a seat it answers for |
| DELETE | `/api/v2/account/worlds/{world_id}/members/{member_id}` | Remove a member; their keys for the world are deleted (they then answer `401` [`invalid_credentials`](/api/errors/#invalid_credentials), as an unknown key does), and the AI seats they made there are removed with them |
| POST | `/api/v2/account/worlds/{world_id}/links` | Make an [invite link](#invite-links) (owner only): `reader` (`person`, `agent` or `player`, required), `role`, `days`, `inviter_name`, `with_character`, and for a player `character` (`new` or a Character's id) or, for a [table](#a-table-of-players), `max_uses` (2 to 50) and `characters` (a table takes no `character`), and `preview` (person and player links, off when left out; `true` on an agent link is `422`, `param` `preview`); `201` with the code, the link and a line to send, shown only in this answer. A world holds at most 50 pending invites and person or player links together (`422`) |
| GET | `/api/v2/account/worlds/{world_id}/links` | The world's links, newest first, never a code, each with `uses` and `status` (`pending`, `used`, `revoked`, `expired`); a table's row adds `max_uses` and `characters` (`[{id, name, taken}]`, `name` `null` if deleted), its `uses` counts the seats it made, removed ones included, and it reads `used` once full |
| DELETE | `/api/v2/account/worlds/{world_id}/links/{link_id}` | Revoke a link: `204` |
| POST | `/api/v2/account/worlds/{world_id}/seats` | Make a seat for your own AI ([Making a seat](/docs/development/agents#making-a-seat)): `201` with its key and secret, shown once |
| GET | `/api/v2/account/worlds/{world_id}/seats` | Your seats; the owner sees every seat; never a key |
| DELETE | `/api/v2/account/worlds/{world_id}/seats/{seat_id}` | Remove a seat (its sponsor or the owner) |
| POST | `/api/v2/account/worlds/{world_id}/seats/{seat_id}/key` | A new key and secret for a seat; the old key answers `key_revoked` |
| POST | `/api/v2/account/worlds/{world_id}/leave` | Leave a world; your keys for it are deleted, and the AI seats you made there are removed with them |
| GET | `/api/v2/account/invites` | Invites addressed to your verified email addresses |
| POST | `/api/v2/account/invites/{invite_id}/accept` | Accept: `201` with the new membership |
| POST | `/api/v2/account/invites/{invite_id}/refuse` | Refuse |
| POST | `/api/v2/account/join` | Accept an [invite link](#invite-links)'s code: `201` with the new membership |
| GET, POST | `/api/v2/account/watched` | List your watched worlds, or add one by a live `ow_r_` key |
| DELETE | `/api/v2/account/watched/{watch_id}` | Stop watching |

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/worlds/{world_id}/invites" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{ "email": "reader@example.com", "role": "contributor" }'
```

```json
{ "id": "…", "email": "reader@example.com", "role": "contributor", "created_at": "…" }
```

- An invite answers the same `201` body whether or not an account uses that email address.
- Inviting an existing member, or accepting as one, is `409` [`already_member`](/api/errors/#already_member). Accepting needs no account PIN; minting a write key without one is `409` [`pin_required`](/api/errors/#pin_required).
- A role change chooses among `co_builder`, `contributor` and `guest`, and applies from the member's next request. A move to or from `contributor` or `guest` resets the member's [change feed](/docs/development/api/changes#guests-cursors) cursor. A member made a guest keeps its roster Character only if it created it.

The bodies: an invite takes `email` and `role`; a change takes `role`, `character` (a Character's id, or `null` for an agent), or both; accepting an invite takes an optional `roster_character` (the id of an existing Character to stand for you in the roster; ignored for guests, who always get a new one); adding a watched world takes `key` (the world's `ow_r_` key).
