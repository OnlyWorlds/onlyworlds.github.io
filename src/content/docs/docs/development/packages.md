---
title: SDKs and Clients
description: Every way to call OnlyWorlds from code, by language and by where it runs.
---

Every client below speaks the same REST API v2 and the same 22 element types. Pick by language, or by where your code runs.

| Client | For | Install | State |
|---|---|---|---|
| [TypeScript SDK](/docs/development/typescript) | web apps, Node tools, browser games | `npm install @onlyworlds/sdk` | published on npm |
| [Python package](/docs/development/python) | scripts, pipelines, world folders | `pip install "git+https://github.com/OnlyWorlds/python-sdk"` | pre-release, not on PyPI yet |
| [Unity SDK](/docs/development/unity) | Unity games and tools | Package Manager, by git URL | public, interface not yet stable |
| [MCP server](/docs/development/mcp) | AI assistants and agents | nothing to install: `https://www.onlyworlds.com/mcp` | live |
| Plain REST | any other language or engine | none | live |

The TypeScript, Python and Unity clients generate their types from [schema-dist](https://github.com/OnlyWorlds/schema-dist), the published copy of the schema. For other engines, see [Games](/docs/development/games).

## Plain REST

The API needs no SDK. Send the key (and, for writes, the PIN) as headers:

```python
import requests

headers = {"API-Key": "your-key", "API-Pin": "your-pin"}
r = requests.get("https://www.onlyworlds.com/api/v2/character/", headers=headers)
characters = r.json()["data"]
```

List responses come back in a `{data, has_more, next_cursor}` envelope, so paginate on `next_cursor`. To generate a client in another language, start from the OpenAPI document at `https://www.onlyworlds.com/api/v2/openapi.json`; the [interactive reference](https://www.onlyworlds.com/api/docs) is built from the same document.

## Retired

The `@onlyworlds/mcp-client` npm package is retired: the MCP server is hosted now, with nothing to install.
