---
title: Keys and PINs
description: The credentials the OnlyWorlds API accepts, which headers carry them, and when the PIN is needed.
---

A **world key** names one world and says what the caller may do in it. The **PIN** proves the caller may write. Both are managed in the [account portal](https://www.onlyworlds.com/account/), where keys are minted and revoked.

## Headers

```http
API-Key: {key}
API-Pin: {pin}
```

The header names are exactly `API-Key` and `API-Pin`. The key alone determines the world, so no request passes a world id.

## Key Types

| Key | What it is | Reads | Writes |
|:--|:--|:--|:--|
| `ow_w_…` | World write key | Key alone | Key and PIN |
| `ow_r_…` | World read key | Key alone | Refused: `403` [`permission_error`](/api/errors/#permission_error) |
| 10-digit legacy key | The original world key | Key alone; a private world also needs the PIN | Key and PIN |
| `ow_a_…` | Account token | Acts on your account, not on one world: see [Account Tokens](#account-tokens) | |

- Each world key (`ow_w_`, `ow_r_`, legacy) is scoped to one world.
- Legacy 10-digit keys keep working and stay valid. New ones are no longer issued: mint a prefixed key instead.
- A new key is shown once, when it is minted. Key lists afterwards show only its last four characters.
- `ow_r_` keys are made for sharing: hand one to readers and they can read the whole world without any second secret. To let a friend read as one Character, with no account, use a [player link](/docs/development/api/members#player-links).
- Both the current API and the [Classic API](/docs/development/api/classic) accept prefixed and legacy keys.

## Demo Keys

The legacy keys `0000000000` to `0000000009` are reserved for demo worlds. They are read-only on every route (a write is `403` [`permission_error`](/api/errors/#permission_error)) and read without a PIN. These answer today:

| Key | World | Try |
|:--|:--|:--|
| `0000000000` | Hyperion, the public example world | `GET /api/v2/character?fields=id,name` |
| `0000000001` | Moppetopia | `GET /api/v2/character?name__icontains=admiral` |

The rest of the range is not for public use; unassigned keys answer `401` [`invalid_credentials`](/api/errors/#invalid_credentials).

## The PIN

The PIN is a 4-digit number (1000 to 9999) set on your account in [account settings](https://www.onlyworlds.com/account/settings), and it guards writes to every world you own; a member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as `API-Pin`.

- **A world with a PIN requires it on every write.** New worlds always have one. An account without a PIN chooses it when creating its first world, and changing it in account settings changes it on every world the account owns.
- **Reads with a prefixed key (`ow_w_`, `ow_r_`) never need the PIN.** Only a legacy 10-digit key reading a private world must send it. A PIN that is sent is checked all the same: a wrong one is refused on a read too, so a connection test learns of it at once. A demo key never checks it, and a member's key checks it only on a write.
- Failed PIN attempts are throttled. Too many answer `429` [`rate_limited`](/api/errors/#rate_limited) with a `Retry-After` header, and repeated failures escalate to a temporary lockout.

Creating a world through the API with an account token: an account without a PIN sends `pin` (4 digits, 1000 to 9999) with its first world; an account that has one sends `name` only, and a `pin` alongside it is a `422`.

## Member Keys

A world can have members besides its owner (see [Members and Sharing](/docs/development/api/members)). A member mints their own keys for the world in their own account, and **a member's key writes with the member's own account PIN**, never the owner's. Accepting an invite or an invite link needs no PIN; a member without an account PIN cannot mint a write key: `409` [`pin_required`](/api/errors/#pin_required).

Removing a member, or a member leaving, deletes that member's keys for the world.

## Agent Seat Keys

An agent seat, whether a member made it or it joined through an agent link, receives once an `ow_w_` key and a seat secret (`ow_s_…`). The agent sends the secret as `API-Pin` on writes. It is never the world's PIN or any account's PIN, and reads take the key alone. A lost key is replaced with a new one, never a new seat. Joining is described on [AI Agents](/docs/development/agents).

## Checking a Key

`GET /api/v2/me` answers who the calling key is, for any key and without a PIN:

```bash
curl -s "https://www.onlyworlds.com/api/v2/me" -H "API-Key: {key}"
```

```json
{ "world": { "id": "0695…", "name": "Hyperion" }, "scope": "write", "kind": "owner",
  "role": "owner", "membership": null, "character": "0698…" }
```

`GET /api/v2/world` also validates a key: a `200` means it is accepted.

### Checking the PIN

Send the PIN with a read and the read checks it. `/me` and every read take the key alone (except a legacy key reading a private world), but a PIN that comes with the request is checked all the same, so `GET /api/v2/me` with the key and the PIN confirms both. A wrong PIN answers the same `401` [`invalid_credentials`](/api/errors/#invalid_credentials) as a bad key, but with `param` `API-Pin`, so a client can tell them apart, through the same throttle as a write. An empty `API-Pin` header counts as none. Two keys are exceptions: a member's key, whose PIN (or an agent seat's secret) is checked on a write and on `GET /api/v2/me` when one is sent (other reads ignore it), and a [demo key](#demo-keys), which reads with any PIN. The `message` tells the failures apart:

| Answer | `message` | Meaning |
|:--|:--|:--|
| `401` `invalid_credentials` | `No valid API-Key.` | The key is missing or unknown |
| `401` `invalid_credentials` | `A PIN is required: send it as API-Pin.` | The key is valid; the PIN is missing (`param` `API-Pin`) |
| `401` `invalid_credentials` | `Incorrect PIN.` | The key is valid; the PIN is wrong (`param` `API-Pin`) |
| `401` [`key_revoked`](/api/errors/#key_revoked) | | The key was recognized but revoked |
| `403` [`permission_error`](/api/errors/#permission_error) | `This key is read-only and cannot write to this world.` | The key is genuine but lacks the scope, such as a read key on a write route |
| `429` [`rate_limited`](/api/errors/#rate_limited) | `Too many failed PIN attempts. Try again later.` | Too many wrong PINs: wait the `Retry-After` seconds |

Message wording may change: branch on `code`, and use the message only to tell a person what to fix.

## Keeping Credentials Safe

- A key and PIN in browser code are visible to anyone who opens the page. Ship only an `ow_r_` read key in a public page, or ask each visitor for their own credentials at runtime. See [CORS](/docs/development/api/cors).
- Keep keys and PINs in a `.env` file that git ignores, never in a commit or a chat.
- An MCP client stores the `API-Key` and `API-Pin` headers in its own configuration as written. Use a key you can revoke on its own. See [MCP Server](/docs/development/mcp).
- An agent seat's key and secret are shown once, when the seat is made or joins; a lost one is replaced with a new key, never shown again. See [AI Agents](/docs/development/agents).
- A leaked key is revoked in the account portal; mint a new one in its place.

## Account Tokens

An `ow_a_` token acts on your account: it lists your worlds, creates worlds, mints and revokes world keys, and manages invites, members, seats, links and watched worlds. Mint one in the account portal under **Settings → Account tokens**, or with `POST /api/v2/account/tokens`; an app can make one from the user's email and password (the TypeScript SDK's `signInWithPassword`, which calls that route after the login API). Like a key, it is shown once.

It is sent as a bearer token, not as `API-Key`:

```bash
curl -s "https://www.onlyworlds.com/api/v2/account/worlds" \
  -H "Authorization: Bearer ow_a_…"
```

An app signed in through the login API (`/api/v2/auth/app/v1/auth/login`) may send its `X-Session-Token` on any account route in place of the token; an unknown or expired one is a `401`.

| Method | Route | Purpose |
|:--|:--|:--|
| GET, PATCH | `/api/v2/account` | Your profile |
| GET | `/api/v2/account/worlds` | The worlds you own and the worlds shared with you |
| POST | `/api/v2/account/worlds` | Create a world: `201` with the world and a new `ow_w_` key, shown once |
| POST | `/api/v2/account/worlds/{world_id}/keys` | Mint a world key, shown once |
| GET | `/api/v2/account/worlds/{world_id}/keys` | List a world's keys (last four characters only) |
| DELETE | `/api/v2/account/worlds/{world_id}/keys/{key_id}` | Revoke a world key |
| POST | `/api/v2/account/tokens` | Mint an account token, shown once. A client that signed in through the login API (`/api/v2/auth/app/v1/auth/login`) may send its `X-Session-Token` here instead of a Bearer token, which is how an app on a phone gets a token of its own after sign-in |
| GET | `/api/v2/account/tokens` | List your account tokens (last four characters only) |
| DELETE | `/api/v2/account/tokens/{token_id}` | Revoke an account token |

Minting a world key takes `scope` (`"read"` or `"write"`, default `"write"`) and an optional `name`, a label such as `"atlas · my laptop"` that is echoed back in the key list. A `name` over 255 characters is a `422`; the same limit applies to account token names.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/worlds/{world_id}/keys" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{ "scope": "read", "name": "players" }'
```

```json
{ "id": "…", "name": "players", "last4": "…", "scope": "READ",
  "last_used_at": null, "revoked": false, "key": "ow_r_…" }
```

`key` appears in this response only. Creating a world answers its summary with a new write key the same way:

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/worlds" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{ "name": "Hyperion" }'
```

```json
{ "id": "…", "name": "Hyperion", "role": "owner", "public_read": false,
  "keys": [ { "name": "", "last4": "…", "scope": "WRITE", "revoked": false } ],
  "key": "ow_w_…" }
```

The routes for invites, members, seats, links and watched worlds are on [Members and Sharing](/docs/development/api/members#managing-members). A missing or invalid account credential answers `401`.
