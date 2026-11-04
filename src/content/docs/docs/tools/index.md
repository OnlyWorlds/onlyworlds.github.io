---
title: Tools
description: The tools that read and write OnlyWorlds worlds, with a link to each.
---

These tools all read and write the same world format, so a world can move between them: as a folder on disk, or through the [API](/docs/development/api-reference). Each tool works with its own part of it: a field, profile or view one tool shows can be missing in another. The live directory is at [onlyworlds.com/tools](https://www.onlyworlds.com/tools). Built one yourself? [List your tool](/docs/development/list-your-tool).

## Build and view

| Tool | What it does | Where |
|---|---|---|
| [Atlas](/docs/tools/atlas) | The main workspace: build, write, map and chart a world that lives as a folder on your disk. | [atlas.onlyworlds.com](https://atlas.onlyworlds.com) |
| [Lantern](/docs/tools/lantern) | Your worlds on your phone, offline too: find, read and change them, and run a game at the table, where a player needs no account. | [lantern.onlyworlds.com](https://lantern.onlyworlds.com) |
| [Little Lens](/docs/tools/little-lens) | Look at a world as a web of its elements and links, and at each element with what links to it and what it links to. It only reads: a public world needs no account. | [little-lens.onlyworlds.com](https://little-lens.onlyworlds.com) |
| [Obsidian plugin](/docs/tools/obsidian-plugin) | Each element is a markdown note in your Obsidian vault, syncable with online worlds. | [GitHub](https://github.com/OnlyWorlds/obsidian-plugin) |
| [onlyworlds.com](/docs/tools/onlyworlds-com) | Accounts, world hosting, keys and the API. | [onlyworlds.com](https://www.onlyworlds.com) |

## Learn and govern

| Tool | What it does | Where |
|---|---|---|
| [Explorer](/docs/tools/explorer) | An interactive 3D introduction to the standard and the ecosystem. | [explorer.onlyworlds.com](https://explorer.onlyworlds.com) |
| [Council](/docs/tools/council) | Governance of the standard: motions, precedents, amendments and votes by characters from your worlds. | [council.onlyworlds.com](https://council.onlyworlds.com) |

## Play and showcase

| Tool | What it does | Where |
|---|---|---|
| Tactical Tangle | A hoplite battle game where your OnlyWorlds characters fight in the ranks of a phalanx. | [tangle.onlyworlds.com](https://tangle.onlyworlds.com) |
| DCC Viewer | A parsed book series (Dungeon Crawler Carl) explored as a 3D world graph. | [dcc.onlyworlds.com](https://dcc.onlyworlds.com) |

## Integrations

| Tool | What it does | Where |
|---|---|---|
| Foundry Converter | Converts a world folder into an installable Foundry VTT module. | [GitHub](https://github.com/OnlyWorlds/foundry-converter) |
| Azgaar Converter | Turns an Azgaar Fantasy Map Generator export into a world, with a map and pins. | [GitHub](https://github.com/OnlyWorlds/azgaar-converter) |
| Unity SDK | Typed C# models and a client for worlds in the Unity engine. | [Unity SDK](/docs/development/unity) |

## Bring in your notes

Three ways to turn notes you already have into a world, none of them needing code:

- **An AI assistant, then Atlas.** Ask a chat assistant to turn your notes into OnlyWorlds JSON (give it the [LLM guide](/docs/development/llm-guide), or use [OnlyWorldsBot](/docs/development/ai#in-a-chat)), then in [Atlas](/docs/tools/atlas), before you have a world, **Other ways in → Bring in a file, notes or JSON**: you review what it read, and **Create world** makes the world.
- **The toolkit's `import`**, if you use Claude Code or another coding agent: it reads notes, a manuscript, PDFs or a wiki and writes a world folder Atlas opens ([Toolkit](/docs/development/toolkit#skills)).
- **One note at a time, in [Lantern](/docs/tools/lantern#catch-and-unsorted)**: **Catch** keeps a note in a world, and **Sort your notes** has an AI propose the elements it makes.

Coming from another worldbuilding app? The Python package reads an export from Campfire, Kanka, LegendKeeper, Notion or World Anvil into a world folder with one command: [Import from other apps](/docs/development/python-import).

For AI tooling see [AI agents](/docs/development/ai), the [MCP server](/docs/development/mcp) and the [Toolkit](/docs/development/toolkit).

## Retired tools

Older tools, most still online but no longer developed, are on the [Legacy](/docs/tools/legacy) page.

