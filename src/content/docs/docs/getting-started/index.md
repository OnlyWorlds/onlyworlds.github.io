---
title: Getting Started
description: What OnlyWorlds is, and how to make a first read and write against a world.
---

OnlyWorlds is an open standard for world data. It structures a world into 22 element categories (Characters, Locations, Events and more) with fields and typed links between them, so any tool or AI agent that speaks the schema can read and write the same worlds.

It has four layers:

| Layer | What it is |
| :--- | :--- |
| **Standard** | The schema: 22 element categories defined in YAML, governed in public by the [Council](https://council.onlyworlds.com). See [Schema](/docs/schema/). |
| **Platform** | [onlyworlds.com](https://www.onlyworlds.com) stores worlds, their members and roles, and issues per-world keys. |
| **Interfaces** | The REST API, the change feed, the MCP server and agent join links. |
| **Clients** | Apps and tools (Atlas, the Obsidian plugin, converters), SDKs, and AI agents. |

A [video introduction](https://youtu.be/1IEazx8wg4I) covers the project as a whole.

## Your First Call

### 1. Get a Key

Sign up at [onlyworlds.com](https://www.onlyworlds.com/accounts/signup/) and create a world. Then mint a key for it in the [account portal](https://www.onlyworlds.com/account/):

| Key | Scope |
| :--- | :--- |
| `ow_w_…` | One world, read and write. Writes also need the world's PIN. |
| `ow_r_…` | One world, read only. No PIN, safe to share. |

Each key is scoped to one world: the key decides which world a request reads or writes, so you never send a world id. Older 10-digit keys still work and never expire, but new ones are no longer issued. [Keys and PINs](/docs/getting-started/keys) covers every key kind, the PIN and account tokens.

Send the key as the `API-Key` header, and the PIN as `API-Pin` on writes.

### 2. Read

List the Characters in a world:

```bash
curl -H "API-Key: ow_r_your_key" \
  "https://www.onlyworlds.com/api/v2/character/"
```

Lists come in an envelope: `{"data": [...], "has_more": false, "next_cursor": null}`. When `has_more` is true, pass `next_cursor` back as `?cursor=` for the next page. To try this before you have a world, use Hyperion's demo key `0000000000`, which reads without a PIN.

Every one of the 22 categories has the same routes at its singular name: `/api/v2/location/`, `/api/v2/event/`, and so on. [Reads and Pagination](/docs/development/api/reads) covers filters, sparse fields and expansion.

### 3. Write

Create a Character with a write key and the PIN. Only `name` is required:

```bash
curl -X POST "https://www.onlyworlds.com/api/v2/character/" \
  -H "API-Key: ow_w_your_key" \
  -H "API-Pin: 1234" \
  -H "Content-Type: application/json" \
  -d '{"name": "The Consul"}'
```

The response is `201` with the full element, including its server-assigned `id`. Change it with `PATCH`, sending only the fields you change. A link is the id of the element it points to:

```bash
curl -X PATCH "https://www.onlyworlds.com/api/v2/character/<character-id>/" \
  -H "API-Key: ow_w_your_key" \
  -H "API-Pin: 1234" \
  -H "Content-Type: application/json" \
  -d '{"description": "Diplomat of the Hegemony.", "location": "<location-id>"}'
```

A read key on a write route answers `403` ([`permission_error`](/api/errors/#permission_error)). [Writes and Bulk](/docs/development/api/writes) covers upserts, deletes and clearing fields; [Link Fields](/docs/development/api/links) covers adding and removing links without reading first.

## Where to Go Next

- **Build an app or script**: [SDKs](/docs/development/packages) for TypeScript, Python and Unity, or the [API reference](/docs/development/api-reference).
- **Connect an AI agent**: the [MCP server](/docs/development/mcp), agent seats, the LLM guide and the toolkit, under [AI Agents](/docs/development/ai).
- **Learn the data model**: [Schema](/docs/schema/), [Fields](/docs/schema/fields) and [Conventions](/docs/schema/conventions).
- **Build a world without code**: the guide at [onlyworlds.com/start](https://www.onlyworlds.com/start) covers which tool fits how you work and how to bring in existing material. [Atlas](https://atlas.onlyworlds.com) is the recommended workspace and keeps your world as plain files on your own disk; the [Obsidian plugin](https://github.com/OnlyWorlds/obsidian-plugin) syncs a world as markdown notes. Every tool is listed under [Tools](/docs/tools/).
- **Shape the schema**: motions and votes happen at [council.onlyworlds.com](https://council.onlyworlds.com).
