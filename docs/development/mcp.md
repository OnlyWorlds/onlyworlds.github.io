---
layout: default
title: MCP server
parent: development
nav_order: 5
---

# MCP server

OnlyWorlds runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server that lets any MCP-capable AI client read and write your worlds directly — no local install.

**Server URL**: `https://www.onlyworlds.com/mcp`

- **Transport**: streamable HTTP. Point an MCP client at the URL; there is nothing to `npm install`.
- Opening the URL in a **browser** shows a plain info page. MCP clients POST JSON-RPC to the same URL.
- The old npm client (`@onlyworlds/mcp-client`) and the `/mcp/messages/` endpoint are **retired** — use the hosted server above.

> The MCP server is generated from the same schema registry and service layer as the v2 REST API — a read or write through MCP is identical to the same operation through `/api/v2/`.

---

## Connect from Claude Code

Just exploring? The three schema tools need no account and no key:

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp
```

For your world: the same command, plus your credentials as headers. Each command is a single line — paste it whole (a backslash-continuation form breaks in PowerShell):

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp --header "API-Key: <your-key>" --header "API-Pin: <your-pin>"
```

- Your **key** and **PIN** come from the [account portal](https://www.onlyworlds.com/account/). The key scopes the server to one world; the PIN is required for writes (and, with a legacy 10-digit key only, for reads of a private world).
- A member's key works the same way with the member's own account PIN, and an [agent seat's](/docs/development/api-reference#agent-links) key with the seat's secret as `API-Pin`.

Claude Desktop and the Anthropic API's MCP connector work the same way, with the credentials as headers. The **claude.ai web connector is not supported** by this server in its current version.

---

## Tools

Twelve tools, in three groups.

### Schema — no key required

| Tool | What it does |
|------|--------------|
| `list_element_types` | List all 22 element types with a one-line shape summary of each. |
| `get_element_schema` | Return the full field structure of one element type. |
| `search_schema` | Search every type's fields for a query string. |

### Read — key required

| Tool | What it does |
|------|--------------|
| `list_elements` | List elements of one type in the key's world. |
| `get_element` | Fetch one element by type and UUID. |
| `search_elements` | Search elements by name across all 22 types in the world. |
| `get_changes` | Return the world's delta feed (upserts and deletes since a cursor), paged — default 25 entries per call, `limit` up to 1000. A guest key gets only what it can see and no deletes; when its view changes, the tool says to pull again from the start and replace the local copy. |

### Write — key required (PIN too, when the world has one)

| Tool | What it does |
|------|--------------|
| `create_element` | Create one new element of a given type. |
| `update_element` | Update an existing element by type and id — **read-merge**: changes only the fields you pass, leaving the rest intact. |
| `edit_links` | Add and/or remove links on one multi-link field, leaving other links untouched. |
| `bulk_apply` | Create and/or update many elements across any of the 22 types in one call. |
| `get_image_upload_ticket` | Return a single-use ticket for one image upload: `ticket`, `upload_url`, `max_bytes`, `exp`. The image never passes through the tool: the agent uploads the bytes itself to `upload_url` with the ticket, then calls `update_element` with the returned `url` as `image_url`. See [Images](/docs/development/api-reference#images). |

**There is no delete tool, by design.** The MCP surface creates and edits; deletion is deliberately left to the API and first-party tools so an assistant can't remove elements on its own.
