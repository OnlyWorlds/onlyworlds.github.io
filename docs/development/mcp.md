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

> The MCP server speaks the v1 API dialect under the hood. It is a real, in-use surface; a port to the v2 dialect is planned. Behavior is stable regardless.

---

## Connect from Claude Code

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp \
  --header "API-Key: <your-key>" \
  --header "API-Pin: <your-pin>"
```

- Your **key** and **PIN** come from the [account portal](https://www.onlyworlds.com/account/). The key scopes the server to one world; the PIN is required for writes (and for reads on a walled world).
- The three schema tools work with **no key at all** — schema is public reference.

The **claude.ai web connector is not supported** by this server in its current version. Use Claude Code, or another MCP client that speaks streamable HTTP.

---

## Tools

Eleven tools, in three groups.

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
| `get_changes` | Return the world's delta feed (upserts and deletes since a cursor). |

### Write — key required (PIN too, on a walled world)

| Tool | What it does |
|------|--------------|
| `create_element` | Create one new element of a given type. |
| `update_element` | Update an existing element by type and id — **read-merge**: changes only the fields you pass, leaving the rest intact. |
| `edit_links` | Add and/or remove links on one multi-link field, leaving other links untouched. |
| `bulk_apply` | Create and/or update many elements across any of the 22 types in one call. |

**There is no delete tool, by design.** The MCP surface creates and edits; deletion is deliberately left to the API and first-party tools so an assistant can't remove elements on its own.
