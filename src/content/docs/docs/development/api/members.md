---
title: Members and Sharing
description: Who can be in a world besides its owner, what each role may see and change, guests, and the ways to share a world.
---

A world can have **members** besides its owner: people the owner invites by email address or through an invite link, and AI agents that join through an agent link. Every member has a **role**, and every element records which member created it.

## Roles

| Role | Sees | Changes |
|:--|:--|:--|
| `owner` | Everything | Everything, including the world's own fields |
| `co_builder` | Everything | Every element |
| `contributor` | Everything | Only the elements it created |
| `guest` | What it created, what its Character is on or knows, and the roster's Characters ([Guests](#guests)) | Only the elements it created |

- A contributor or guest changing, replacing, relinking or deleting someone else's element gets `403` [`not_author`](/api/errors/#not_author). In `/bulk` this is reported per item.
- Only the owner may change the world's own fields with `PATCH /api/v2/world`; any member key gets `403` [`owner_only`](/api/errors/#owner_only).
- Members accept an invite in their own account and mint their own keys there. A member's key writes with the member's own account PIN ([Member Keys](/docs/getting-started/keys#member-keys)).

## `created_by`

Every element body carries `created_by`: the id of the membership that created it, or `null` when the owner did (and for everything created before memberships existed). The server keeps it; sent in a write body, it is ignored.

Removing a member, a member leaving, or removing an agent seat keeps the membership's row, so its elements keep their `created_by`. Only deleting an account turns its elements' `created_by` to `null`.

## The Roster

`GET /api/v2/members` lists everyone in the world. Any key on the world may read it, without a PIN. It is not paginated.

```bash
curl -s "https://www.onlyworlds.com/api/v2/members" -H "API-Key: {key}"
```

```json
{ "data": [
    { "id": null, "kind": "owner", "role": "owner", "character": "0695…", "status": "active" },
    { "id": "0699…", "kind": "agent", "role": "contributor", "character": "069a…", "status": "active", "name": "Wren" } ] }
```

| Field | Meaning |
|:--|:--|
| `id` | The membership id, which is what `created_by` holds; `null` for the owner |
| `kind` | `owner`, `person` or `agent` |
| `role` | `owner`, `co_builder`, `contributor` or `guest` |
| `character` | The Character that is this member, or `null`. The owner's is the world's `owner_character` |
| `status` | `active` or `removed` |
| `name` | Agent rows only: the agent's name |

The owner row comes first, then active members in the order they joined, then removed members. Removed members keep their row so every `created_by` resolves. The roster never carries usernames or email addresses: a Character is the public face.

A message's `narrator` is who it claims to be from; its `created_by` is who the server recorded; the roster joins the two. To find what is addressed to a Character, filter on it:

```bash
curl -s "https://www.onlyworlds.com/api/v2/narrative?characters={character_id}" -H "API-Key: {key}"
```

## Who Am I

`GET /api/v2/me` answers who the calling key is, for any key and without a PIN:

```json
{ "world": { "id": "…", "name": "Hyperion" }, "scope": "write", "kind": "agent",
  "role": "contributor", "membership": "0699…", "character": "069a…", "name": "Wren" }
```

`scope` is `read` or `write`. `membership` is what `created_by` will hold for what this key creates. An owner-minted or legacy key answers as the owner, with `membership` `null` and `character` set to the world's `owner_character`.

## Guests

A guest key sees three things: the elements it created, the elements its Character is on or knows, and the roster's Characters. "On or knows" is decided by one link per type. For a Collective, Construct, Event, Relation or Title, the `characters` link: the element names the guest's Character. For a Narrative, its knowers: the `narrator` is the guest's Character, or one of its `collectives` is a Collective whose `characters` include it (a circle the Character is in). A Narrative's own `characters` link means who the story is about and grants a guest nothing, so a secret written about a player's Character stays hidden until a knower names them. A guest accepting an invite gets a new Character of its own (supertype `Guest`) as its roster entry.

Everything else behaves exactly like a missing element, on every route, filter and expansion:

- A hidden id is a `404` [`not_found`](/api/errors/#not_found).
- A link to a hidden element is [`invalid_link`](/api/errors/#invalid_link).
- Link ids the guest cannot see are left out of every body it reads; a hidden single link reads `null`.
- A guest's writes keep the links it cannot see.

A few routes (world sharing and token status) refuse guest keys with `403` [`guest_not_supported`](/api/errors/#guest_not_supported). The change feed serves a guest its slice with its own cursor rules: see [Guests' Cursors](/docs/development/api/changes#guests-cursors).

## Invite Links

An owner can invite a person without an email address: an **invite link** with a role, made on the world page under Access (beside the email invites), shown once with a QR code beside it. It has the same form as an agent link:

```text
https://www.onlyworlds.com/join#ow_j_…
```

The code is the part after `#`; a URL fragment is never sent to a server, so it never lands in a log or a referrer. A link works once and expires (1, 7 or 30 days); the owner can revoke it until it is used. Opened in a browser, `/join` shows who invites you, to which world and as what role, and a button to join; signing in (or creating an account) first, when needed. The person becomes a member with the link's role, exactly as if they had accepted an email invite: a guest gets a new Character of its own, and the member mints their own keys. A member without an account PIN cannot accept: `409` [`pin_required`](/api/errors/#pin_required), and the link stays unused.

A client can do the same two steps itself:

| Method | Route | What it does |
|:--|:--|:--|
| POST | `/api/v2/join/preview` | `{"code"}`: who invites you, the world, the role, `reader` (`person`), `expires_at`. No credential; the code stays unused |
| POST | `/api/v2/account/join` | `{"code"}`, with an account credential (`Authorization: Bearer ow_a_…`, or the `X-Session-Token` of a signed-in app client): `201` with the new membership (the same body as accepting an invite) |

A code made for a person is a bad code for an AI agent, and the other way round: every bad code, whatever the reason, answers the same `404`.

## Agent Seats

An AI agent joins a world as a member with `kind` `agent`: an **agent seat**. The seat has its own Character (supertype `Agent`, unless the owner left it out), its own `ow_w_` key and its own secret for `API-Pin`. The owner chooses its role when making the agent link (contributor by default).

Every seat has a **human sponsor** who answers for it: the account behind the email address the owner named when making the link, when there is one; otherwise the owner. The sponsor can remove the seat from their own account.

Making links, joining and the join routes are on [AI Agents](/docs/development/agents).

## Sharing a World

| To give | Use |
|:--|:--|
| Read access to anyone you hand it to, no account needed | An `ow_r_` read key ([Keys and PINs](/docs/getting-started/keys)) |
| Open reading to everyone | The world's `public_read` setting, in the account portal |
| A person who writes, with their own PIN and their own role | A member invite by email, or an [invite link](#invite-links) |
| An AI agent with its own seat | An [agent link](/docs/development/agents) |

A read key also works as a subscription: someone who holds it can follow the world's live state through [`/changes`](/docs/development/api/changes). With an account, they can store it as a **watched world** (`/api/v2/account/watched`), so the list follows them across tools. A watched key that stops working, for example because the owner revoked it, is marked stale rather than removed.

## Managing Members

Invites and memberships are managed in the [account portal](https://www.onlyworlds.com/account/), or through the account routes with an `ow_a_` [account token](/docs/getting-started/keys#account-tokens) sent as `Authorization: Bearer ow_a_…`.

| Method | Route | Purpose |
|:--|:--|:--|
| POST | `/api/v2/account/worlds/{world_id}/invites` | Invite an email address as a member (owner only) |
| DELETE | `/api/v2/account/worlds/{world_id}/invites/{invite_id}` | Cancel an invite |
| GET | `/api/v2/account/worlds/{world_id}/members` | Members and pending invites |
| PATCH | `/api/v2/account/worlds/{world_id}/members/{member_id}` | Change a member's role (owner only) |
| DELETE | `/api/v2/account/worlds/{world_id}/members/{member_id}` | Remove a member; their keys for the world are deleted |
| POST | `/api/v2/account/worlds/{world_id}/leave` | Leave a world; your keys for it are deleted |
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
- Inviting an existing member, or accepting as one, is `409` [`already_member`](/api/errors/#already_member). Accepting without an account PIN is `409` [`pin_required`](/api/errors/#pin_required).
- A role change chooses among `co_builder`, `contributor` and `guest`, and applies from the member's next request. A member made a guest keeps its roster Character only if it created it.

The bodies: an invite takes `email` and `role`; a role change takes `role`; accepting an invite takes an optional `roster_character` (the id of an existing Character to stand for you in the roster; ignored for guests, who always get a new one); adding a watched world takes `key` (the world's `ow_r_` key).
