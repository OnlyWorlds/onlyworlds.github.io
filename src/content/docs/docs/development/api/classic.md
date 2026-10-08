---
title: Classic API
description: The original OnlyWorlds API dialect at /api/worldapi/, kept unchanged for existing clients.
---

The original API remains available and unchanged at `/api/worldapi/`. It is supported for existing clients and many older tools, guides and SDK releases use it. **New work should use the current API** ([API Reference](/docs/development/api-reference/)). The two dialects serve the same data and differ most in how link fields are named.

:::caution
The `_ids` and `_id` suffixes on this page belong to the Classic API only. In `/api/v2/` and `/bulk`, link fields are bare names in both directions (`friends`, `location`), and sending `friends_ids` there is a `422`.
:::

**Base URL**: `https://www.onlyworlds.com/api/worldapi/`

**Authentication**: the same `API-Key` and `API-Pin` headers. Legacy 10-digit keys and prefixed keys both work. See [Keys and PINs](/docs/getting-started/keys/).

## Operations

Routes use the singular category slug (`/character/`, `/location/`).

| Method | Route | Purpose |
|:--|:--|:--|
| GET | `/{type}/` | List elements: a bare JSON array, with no envelope and no pagination |
| POST | `/{type}/` | Create |
| GET | `/{type}/{uuid}/` | Get one element |
| PATCH | `/{type}/{uuid}/` | Partial update |
| PUT | `/{type}/{uuid}/` | Full replace |
| DELETE | `/{type}/{uuid}/` | Delete |

**The trailing slash is required** on single-element routes. `GET /character/{uuid}` without it answers a `301` redirect with an empty body, which curl and Python's `requests` do not follow by default; `GET /character/{uuid}/` answers `200`.

```bash
curl -s "https://www.onlyworlds.com/api/worldapi/character/{uuid}/" \
  -H "API-Key: {key}" -H "API-Pin: {pin}"
```

## Link Fields

Multi-link fields use different names for reading and writing:

| Direction | Field name | Shape |
|:--|:--|:--|
| GET (read) | `characters` | The linked elements, as stub objects `{id, name, …}` |
| POST, PATCH (write) | `characters_ids` | A list of UUIDs |

Single-link fields take the `_id` suffix on write (for example `location_id`). The current API has no such asymmetry: see [Link Fields](/docs/development/api/links/).

## Errors

The Classic API answers errors in its own envelope, not the one on the [error reference](/api/errors/):

- Most errors: `{"detail": "…"}` (a string) or `{"detail": [ … ]}` (a list of field validation errors).
- Authentication failures add a nested object:

```json
{ "detail": "Unauthorized", "error": { "code": "unauthorized", "detail": "Authentication required." } }
```

Unknown fields, including `world` in a body, are a `422` naming the field, in the `{"detail": [ … ]}` shape.
