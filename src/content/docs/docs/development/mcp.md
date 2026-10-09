---
title: MCP Server
description: The hosted OnlyWorlds MCP server, how to connect a client to it, and the tools it offers.
---

OnlyWorlds runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server. Any MCP client can read and write your worlds through it, with nothing to install.

**Server URL**: `https://www.onlyworlds.com/mcp`

- **Transport**: streamable HTTP. Point an MCP client at the URL; there is no package to install.
- Opening the URL in a browser shows a plain info page. MCP clients POST JSON-RPC to the same URL.
- The old npm client (`@onlyworlds/mcp-client`) and the `/mcp/messages/` endpoint are retired. Use the hosted server above.

The server runs on the same schema registry and service layer as the [World API](/docs/development/api-reference): an element read or written through MCP has the same body, validation and permissions as through `/api/v2/`. The tools are shaped for assistants, so paging, filters and errors differ: see [How It Differs From REST](#how-it-differs-from-rest).

## Connect From Claude Code

The schema tools need no account and no key:

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp
```

For your own world, the same command with your credentials as headers:

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp --header "API-Key: <your-key>" --header "API-Pin: <your-pin>"
```

Each command is a single line: paste it whole. A backslash-continued form breaks in PowerShell.

## Connect Other Clients

Any MCP client that can send HTTP headers uses the same URL and the same two headers. Claude Desktop and the Anthropic API's MCP connector work this way.

Codex reads the server from `~/.codex/config.toml`, taking the two header values from environment variables:

```toml
[mcp_servers.onlyworlds]
url = "https://www.onlyworlds.com/mcp"
env_http_headers = { "API-Key" = "OW_API_KEY", "API-Pin" = "OW_API_PIN" }
```

`OW_API_KEY` and `OW_API_PIN` are the names an [agent seat's](/docs/development/agents) join response uses. Any variable names work, as long as the config and the environment agree.

## Credentials

Credentials travel as headers on every request, exactly as on the REST API.

| Header | Value |
|:--|:--|
| `API-Key` | A world key. The key scopes the server to one world. |
| `API-Pin` | The PIN, required for writes. |

- Keys are minted on your world's page in the [account portal](https://www.onlyworlds.com/account/). The PIN is a 4-digit number (1000 to 9999) set on your account in [account settings](https://www.onlyworlds.com/account/settings), and it guards writes to every world you own; a member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as `API-Pin`. See [Keys and PINs](/docs/getting-started/keys).
- A read-only `ow_r_` key needs no PIN. A prefixed write key (`ow_w_`) reads without the PIN too; only a legacy 10-digit key reading a private world must send it.
- The client saves both headers in its configuration as written. For read-only use, connect with an `ow_r_` key and no PIN.

## Tools

The tools fall into three groups by what they need.

### Schema: No Key

| Tool | What it does |
|:--|:--|
| `list_element_types` | List all 22 element categories with a one-line shape summary of each. |
| `get_element_schema` | Return the fields of one category, grouped by kind (text, integer, single link, multi link, generic), with each link field's target category. |
| `search_schema` | Search every category's fields for a substring, such as "which categories have a `location` field?". |

### Read: A Key

| Tool | What it does |
|:--|:--|
| `list_elements` | List elements of one category in the key's world, newest first. Filters by `name_contains` and `supertype`; pages with `limit` (default 100, up to 1000) and `offset`. |
| `get_element` | Fetch one element by category and UUID, in the same shape as `GET /api/v2/{type}/{id}`. |
| `search_elements` | Search elements by name across all 22 categories in the world, up to 50 matches per category. |
| `get_changes` | Return the world's delta feed (upserts and deletes since a cursor), paged: 25 entries per call by default, `limit` up to 1000. A guest key gets only what it can see and no deletes; when its view changes, the tool says to pull again from the start and replace the local copy. Mirrors [`GET /api/v2/changes`](/docs/development/api/changes). |

### Write: A Write Key and PIN

| Tool | What it does |
|:--|:--|
| `create_element` | Create one new element of a given category. Supply your own `id` (a UUID) or let the server mint one. |
| `update_element` | Update an existing element by category and id. A server-side read-merge: it changes only the fields you pass and leaves the rest intact. A multi-link field you pass replaces that field's whole array. |
| `edit_links` | Add and/or remove links on one multi-link field, leaving the field's other links untouched. |
| `bulk_apply` | Create and/or update up to 1000 elements across any categories in one call. An item with an `id` updates that element (creating it if absent); items can link to each other. With `atomic` true, any failure rolls the whole batch back. |
| `get_image_upload_ticket` | Return a single-use ticket for one image upload: `ticket`, `upload_url`, `max_bytes`, `exp`. The image never passes through the tool: the agent uploads the bytes itself to `upload_url` with the ticket, then calls `update_element` with the returned `url` as `image_url`. See [Images](/docs/development/api/images). |

:::note
There is no delete tool, by design. The MCP server creates and edits; deletion stays in the REST API and the portal, so an assistant cannot remove elements on its own. `bulk_apply` never removes an element either.
:::

## Resources

Besides tools, the server lists one resource, `onlyworlds://schema` (the 22 element types, each with a one-line shape: the `list_element_types` tool's output), and serves `onlyworlds://schema/{type}` for one type's fields (the `get_element_schema` tool's output). Both need no key.

## How It Differs From REST

| | MCP tools | REST (`/api/v2/`) |
|:--|:--|:--|
| Listing order | `list_elements`: newest created first | Change order, the order the cursor walks |
| Paging | `limit` and `offset`; the answer is `{data, limit, offset, has_more}` | `limit` and `cursor`; the answer is `{data, has_more, next_cursor}` |
| Name filter | `name_contains` (case-insensitive substring) | `name__icontains`, or `name` for an exact match. `offset` and `name_contains` are a `422` here |
| Other filters | `supertype` | `supertype`, `subtype`, and `characters` on six categories ([Reads](/docs/development/api/reads#filters)) |
| Search across categories | `search_elements` | None: filter one category at a time |
| Change feed | `get_changes`: `since_cursor`, 25 entries per page by default | `GET /changes`: `since`, 500 per page by default |
| Errors | A tool error carrying the human message, without `code` or the other envelope fields | The [error envelope](/api/errors/) |
| Retries | No `Idempotency-Key` | `Idempotency-Key` on `POST` and `/bulk` ([Writes](/docs/development/api/writes#idempotency)) |
| Delete | No tool | `DELETE /api/v2/{type}/{id}` |

## See Also

- [World API](/docs/development/api-reference): the same data over REST, with the interactive reference at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).
- [Agent seats](/docs/development/agents): give an agent its own key and Character in a world, then connect it here.
- [Toolkit](/docs/development/toolkit): Claude Code skills that work on a world folder or an account world.
