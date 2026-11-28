---
title: SDKs and clients
description: Every way to call OnlyWorlds from code, by language and by where it runs.
---

Every client below speaks the same REST API v2. Pick by language, or by where your code runs.

| Client | For | Install | State |
|---|---|---|---|
| [TypeScript SDK](/docs/development/typescript) | web apps, Node tools, browser games | `npm install @onlyworlds/sdk` | published on npm |
| [Python package](/docs/development/python) | scripts, pipelines, world folders | `pip install onlyworlds` | published on PyPI |
| [Unity SDK](/docs/development/unity) | Unity games and tools | `openupm add com.onlyworlds.sdk`, or the Package Manager by git URL | public; may change between releases, so pin a version |
| [Godot SDK](/docs/development/godot) | Godot 4.7 games and tools, in GDScript (no .NET) | Godot's [Asset Library](https://godotengine.org/asset-library/asset/5621), or the release zip unpacked into your project's `addons/` | public on GitHub; before 1.0 a minor version may rename a call; since 0.14.0 it writes an account world as a world folder; no share yet (a pack carries hidden elements too) |
| [Unreal SDK](https://github.com/OnlyWorlds/unreal-sdk#first-run) | Unreal Engine 5.8 C++ projects on Windows | a source plugin: the release zip, unpacked into your project's `Plugins/` | public on GitHub; before 1.0 a minor version may rename a call; over the API its Blueprint nodes answer JSON text (C++ turns it into structs); since 0.8.0 Blueprints read a world's maps (frames, Zones, Pins) and lay out its graph, since 0.9.0 how an element is shown (the schema's views), since 0.10.0 a world held and kept current from the change feed, as in Unity and Godot, and since 0.16.0 the one-file world export an owner downloads; no share yet |
| [MCP server](/docs/development/mcp) | AI assistants and agents | nothing to install: `https://www.onlyworlds.com/mcp` | live |
| Plain REST | any other language or engine | none | live |

**A world's origin.** A world's `origin` says which tool made it, and from what. Every client's world patch call (`patchWorld`, `patch_world`, `PatchWorldAsync`) sends `source` and `producer` only when you name them, as given. A folder's `world.json` names the folder's maker, so a patch made from that file leaves its pair out. Only a push fills a world's `origin` from a folder, and only when the world has none and the folder was not exported from that same world.

The TypeScript, Python and Unity clients generate their element types and fields from [schema-dist](https://github.com/OnlyWorlds/schema-dist), the published copy of the schema. The Godot and Unreal SDKs hold a class or struct for each of the 22 types too. For any other engine, see [Games](/docs/development/games).

## Plain REST

The API needs no SDK. Send the key (and, for writes, the PIN) as headers:

```python
import requests

r = requests.get("https://www.onlyworlds.com/api/v2/character/", headers={"API-Key": "your-key"})
characters = r.json()["data"]

write = {"API-Key": "your-write-key", "API-Pin": "your-pin"}
requests.post("https://www.onlyworlds.com/api/v2/character/", headers=write, json={"name": "The Consul"})
```

List responses come back in a `{data, has_more, next_cursor}` envelope, so paginate on `next_cursor`. To generate a client in another language, start from the OpenAPI document at `https://www.onlyworlds.com/api/v2/openapi.json`; the [interactive reference](https://www.onlyworlds.com/api/docs) is built from the same document.

## Retired

The `@onlyworlds/mcp-client` npm package is retired: the MCP server is hosted now, with nothing to install.
