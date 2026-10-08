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
| 10-digit legacy key (e.g. `0000000001`) | The original world key | Key alone; a private world also needs the PIN | Key and PIN |
| `ow_a_…` | Account token | Acts on your account, not on one world: see [Account Tokens](#account-tokens) | |

- Each world key (`ow_w_`, `ow_r_`, legacy) is scoped to one world.
- Legacy 10-digit keys keep working and stay valid. New ones are no longer issued: mint a prefixed key instead.
- A new key is shown once, when it is minted. Key lists afterwards show only its last four characters.
- `ow_r_` keys are made for sharing: hand one to players or readers and they can read the world without any second secret.
- Both the current API and the [Classic API](/docs/development/api/classic) accept prefixed and legacy keys.

## The PIN

- **A world with a PIN requires it on every write.** New worlds always have one: the account's PIN, set with the account's first world, is the write wall on every world the account owns.
- **Reads with a prefixed key (`ow_w_`, `ow_r_`) never need the PIN.** Only a legacy 10-digit key reading a private world must send it.
- Failed PIN attempts are throttled. Too many answer `429` [`rate_limited`](/api/errors/#rate_limited) with a `Retry-After` header, and repeated failures escalate to a temporary lockout.

Creating a world through the API with an account token: an account without a PIN sends `pin` (4 digits, 1000 to 9999) with its first world; an account that has one sends `name` only, and a `pin` alongside it is a `422`.

## Member Keys

A world can have members besides its owner (see [Members and Sharing](/docs/development/api/members)). A member mints their own keys for the world in their own account, and **a member's key writes with the member's own account PIN**, never the owner's. A member without an account PIN cannot accept an invite or mint a write key: `409` [`pin_required`](/api/errors/#pin_required).

Removing a member, or a member leaving, deletes that member's keys for the world.

## Agent Seat Keys

An AI agent that joins a world through an agent link receives, once, an `ow_w_` key and a seat secret (`ow_s_…`). The agent sends the secret as `API-Pin` on writes. It is never the world's PIN or any account's PIN, and reads take the key alone. Joining is described on [AI Agents](/docs/development/agents).

## Checking a Key

`GET /api/v2/me` answers who the calling key is, for any key and without a PIN:

```bash
curl -s "https://www.onlyworlds.com/api/v2/me" -H "API-Key: {key}"
```

```json
{ "world": { "id": "0695…", "name": "Hyperion" }, "scope": "write", "kind": "owner",
  "role": "owner", "membership": null, "character": "0698…" }
```

`GET /api/v2/world` also validates a key: a `200` means it is accepted. It checks the PIN only for a legacy key on a private world, so testing a PIN with a prefixed key takes a write.

| Answer | Meaning |
|:--|:--|
| `401` [`invalid_credentials`](/api/errors/#invalid_credentials) | The key or PIN is missing, unknown or wrong |
| `401` [`key_revoked`](/api/errors/#key_revoked) | The key was recognized but revoked |
| `403` [`permission_error`](/api/errors/#permission_error) | The key is genuine but lacks the scope, such as a read key on a write route |

## Account Tokens

An `ow_a_` token acts on your account: it lists your worlds, creates worlds, mints and revokes world keys, and manages invites, members and watched worlds. Mint one in the account portal under **Settings → Account tokens**, or with `POST /api/v2/account/tokens`. Like a key, it is shown once.

It is sent as a bearer token, not as `API-Key`:

```bash
curl -s "https://www.onlyworlds.com/api/v2/account/worlds" \
  -H "Authorization: Bearer ow_a_…"
```

| Method | Route | Purpose |
|:--|:--|:--|
| GET, PATCH | `/api/v2/account` | Your profile |
| GET | `/api/v2/account/worlds` | The worlds you own and the worlds shared with you |
| POST | `/api/v2/account/worlds` | Create a world: `201` with the world and a new `ow_w_` key, shown once |
| POST | `/api/v2/account/worlds/{world_id}/keys` | Mint a world key, shown once |
| GET | `/api/v2/account/worlds/{world_id}/keys` | List a world's keys (last four characters only) |
| DELETE | `/api/v2/account/worlds/{world_id}/keys/{key_id}` | Revoke a world key |
| POST | `/api/v2/account/tokens` | Mint an account token, shown once |
| GET | `/api/v2/account/tokens` | List your account tokens (last four characters only) |
| DELETE | `/api/v2/account/tokens/{token_id}` | Revoke an account token |

Minting a world key takes `scope` (`"read"` or `"write"`, default `"write"`) and an optional `name`, a label such as `"atlas · my laptop"` that is echoed back in the key list. A `name` over 255 characters is a `422`; the same limit applies to account token names.

The routes for invites, members and watched worlds are on [Members and Sharing](/docs/development/api/members#managing-members). A missing or invalid account credential answers `401`.
