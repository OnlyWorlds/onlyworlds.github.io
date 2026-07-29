---
layout: default
title: packages
parent: development
nav_order: 4
---


## NPM Packages

### [@onlyworlds/sdk](https://www.npmjs.com/package/@onlyworlds/sdk)

TypeScript/JavaScript SDK for building web applications and tools. Current version **4.0.0**, v2-native (link fields use bare schema names; the `_id`/`_ids` suffixes are the legacy v1 dialect).

**Install:**
```bash
npm install @onlyworlds/sdk
```

**Features:**
- Complete TypeScript types for all 22 element categories
- Simple CRUD operations (create, get, list, update, delete)
- Automatic relationship handling
- Built-in authentication

### MCP server (hosted — no package to install)

AI-assistant integration is now a **hosted server**, not an npm package. Point any MCP client at `https://www.onlyworlds.com/mcp`.

The old `@onlyworlds/mcp-client` package is retired. See the [MCP setup guide](/docs/development/mcp/).


## Python

There is no published Python package. The API is plain REST, so `requests` plus the [API reference](https://onlyworlds.com/api/docs) is all you need:

```python
import requests

headers = {"API-Key": "your-key", "API-Pin": "your-pin"}
r = requests.get("https://www.onlyworlds.com/api/v2/character/", headers=headers)
characters = r.json()["data"]
```

List responses come back in a `{data, has_more, next_cursor}` envelope, so paginate on `next_cursor`.

 