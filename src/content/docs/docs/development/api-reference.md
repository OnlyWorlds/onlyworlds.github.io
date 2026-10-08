---
title: API Reference
description: The OnlyWorlds REST API at a glance, with its base URL, authentication, list envelope and every resource.
---

The OnlyWorlds API reads and writes world data on onlyworlds.com over HTTPS, in JSON. Two dialects share one host:

- **`/api/v2/`**: cursor pagination, flat UUID link arrays, create and upsert, bulk writes and a change feed. Use it for new work. Every page in this section describes it unless it says otherwise.
- **`/api/worldapi/`**: the [Classic API](/docs/development/api/classic), the original dialect. It stays unchanged and supported for existing clients.

**Base URL**: `https://www.onlyworlds.com/api/v2/`

**Interactive reference**: [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs) · **OpenAPI document**: [onlyworlds.com/api/v2/openapi.json](https://www.onlyworlds.com/api/v2/openapi.json)

## Authentication

Every request carries a world key in the `API-Key` header. Writes also carry the PIN in `API-Pin`. The key alone decides the world: no world id goes in a path or a body.

```bash
curl -s "https://www.onlyworlds.com/api/v2/world" \
  -H "API-Key: {key}"
```

Key types, PIN rules, member keys and account tokens are on [Keys and PINs](/docs/getting-started/keys).

## Response Shapes

A list answers in an envelope:

```json
{ "data": [], "has_more": false, "next_cursor": null }
```

A single element answers as the bare element object. Every error answers in one envelope, `{"error": {"type", "code", "message", "param", "doc_url"}}`, described on the [error reference](/api/errors/).

## Resources

`{type}` is one of the 22 element categories, addressed by its singular lowercase slug: `ability`, `character`, `collective`, `construct`, `creature`, `event`, `family`, `institution`, `language`, `law`, `location`, `map`, `marker`, `narrative`, `object`, `phenomenon`, `pin`, `relation`, `species`, `title`, `trait`, `zone`. The URL names the category; the key names the world.

| Method | Route | Purpose | Page |
|:--|:--|:--|:--|
| GET | `/api/v2/{type}` | List elements (paginated, filterable) | [Reads](/docs/development/api/reads) |
| GET | `/api/v2/{type}/{id}` | Get one element | [Reads](/docs/development/api/reads) |
| POST | `/api/v2/{type}` | Create | [Writes](/docs/development/api/writes) |
| PUT | `/api/v2/{type}/{id}` | Create or replace by id (upsert) | [Writes](/docs/development/api/writes) |
| PATCH | `/api/v2/{type}/{id}` | Partial update | [Writes](/docs/development/api/writes) |
| DELETE | `/api/v2/{type}/{id}` | Delete | [Writes](/docs/development/api/writes) |
| POST | `/api/v2/{type}/{id}/links/{field}` | Add or remove ids on one multi-link field | [Link Fields](/docs/development/api/links) |
| POST | `/api/v2/bulk` | Create and upsert many elements of mixed categories | [Writes](/docs/development/api/writes#bulk) |
| GET | `/api/v2/changes` | The world's change feed, and full export | [Changes](/docs/development/api/changes) |
| GET | `/api/v2/world` | The world named by the key | [Reads](/docs/development/api/reads#the-world) |
| PATCH | `/api/v2/world` | Update the world's own fields (owner only) | [Writes](/docs/development/api/writes#the-world) |
| GET | `/api/v2/members` | The world's roster | [Members](/docs/development/api/members) |
| GET | `/api/v2/me` | Who the calling key is | [Members](/docs/development/api/members) |
| POST | `/api/v2/media/ticket` | A ticket for one image upload | [Images](/docs/development/api/images) |
| POST | `/api/v2/join/preview` | Read an agent link without using it | [Agents](/docs/development/agents) |
| POST | `/api/v2/join` | Join a world as an AI agent | [Agents](/docs/development/agents) |
| GET | `/api/v2/health` | Liveness check, no key needed | |
| various | `/api/v2/account/...` | Account token routes: worlds, keys, invites, members, watched worlds | [Keys and PINs](/docs/getting-started/keys#account-tokens), [Members](/docs/development/api/members#managing-members) |

Trailing slashes are tolerated on every route: `/api/v2/character/{id}` and `/api/v2/character/{id}/` both resolve, with no redirect.

## Limits

| Limit | Value |
|:--|:--|
| Request rate | No per-key quota on reads. Under load the server answers `503` [`server_busy`](/api/errors/#server_busy) with a `Retry-After` header: each worker runs six requests at once, and a request waits up to 10 seconds for a slot |
| Request body | Keep a JSON body under 2.5 MB: larger bodies are refused. Over 8 MB the server answers `413` [`payload_too_large`](/api/errors/#payload_too_large) before reading it. Split a large `/bulk` into several calls |
| Wrong PINs | Repeated failures lock the key out: `429` [`rate_limited`](/api/errors/#rate_limited) with `Retry-After` |
| `/bulk` | Up to 1000 items per request |
| List pages | `limit` from 1 to 1000, default 100; the change feed defaults to 500 |
| Images | A daily cap on upload tickets per world (`429` [`quota_exceeded`](/api/errors/#quota_exceeded)) and a storage cap per account (`403` [`storage_full`](/api/errors/#storage_full)). See [Images](/docs/development/api/images) |
| `expand` | One level deep: a stub is `{id, name, supertype, subtype, image_url}`, with no links of its own |

There are no webhooks. To follow a world's changes, poll [`/changes`](/docs/development/api/changes) with your stored cursor; `?head=true` is the cheap check for whether anything moved.

## Stability

- `/api/v2/` is the current API. The [Classic API](/docs/development/api/classic) at `/api/worldapi/` keeps working, and no retirement date is set.
- Error codes and field names are a contract: a client may branch on them. Error messages are not.
- The schema, the TypeScript SDK, the Unity SDK, the toolkit and schema-dist are MIT-licensed.

## API Pages

| Page | Covers |
|:--|:--|
| [Keys and PINs](/docs/getting-started/keys) | Key types, the PIN, member and agent-seat keys, account tokens |
| [Reads and Pagination](/docs/development/api/reads) | The list envelope, cursors, filters, expansion, sparse fields, the world |
| [Link Fields](/docs/development/api/links) | How links read and write, and the link operations route |
| [Writes and Bulk](/docs/development/api/writes) | Create, upsert, patch, delete, idempotency, bulk |
| [Changes and Export](/docs/development/api/changes) | The change feed, full export, guests' cursors |
| [Members and Sharing](/docs/development/api/members) | Roles, the roster, guests, invites, read keys |
| [Images](/docs/development/api/images) | Hosting an element's picture on OnlyWorlds |
| [CORS](/docs/development/api/cors) | Which browser origins may call the API |
| [Classic API](/docs/development/api/classic) | The original `/api/worldapi/` dialect |
| [Error Reference](/api/errors/) | Every error code, its cause and its fix |
