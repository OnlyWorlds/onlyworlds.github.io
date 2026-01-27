---
layout: default
title: tooling
parent: development
nav_order: 1
---

## Worldbuilding Toolkit

Parse text into structured world data. Model systems. Build tools.

Works with any AI that reads markdown. Optimized for Claude Code. Outputs OnlyWorlds format.

**Repository**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

---

## What It Does

**Parsing** extracts world elements from any text. Paste a paragraph, a chapter, a folder of campaign notes. Characters, locations, factions, items, events come out as linked JSON ready to import. The toolkit applies OnlyWorlds schema knowledge to avoid hallucinated fields and handles messy, contradictory sources.

**Modeling** is design consultation. "How do I represent a magic system where some people have innate gifts and others learn spells?" The toolkit understands compositional worldbuilding - one concept often becomes multiple connected elements (Construct for the system, Ability for spells, Trait for gifts, Phenomenon for effects).

**Building** uses OnlyWorlds as a headless backend. Your world data lives in the cloud with REST API access. Fetch characters, locations, relationships - render them however you want. No database to manage, no server to run. The dev skill scaffolds projects and handles SDK setup.

---

## Install (Claude Code)

### Marketplace

```bash
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
# Restart Claude Code to load
```

### Direct (no restart needed)

```bash
git clone https://github.com/OnlyWorlds/toolkit
claude --plugin-dir ./toolkit
```

---

## Skills

| Skill | Purpose |
|-------|---------|
| **parsing** | Text to OnlyWorlds elements |
| **modeling** | Design consultation |
| **schema** | Field reference (auto-loads) |
| **api** | CRUD operations |
| **dev** | SDK and deployment |

---

## Usage

```
"Parse this" + text, files, folders
"How do I model a magic system?"
"What fields does Character have?"
```

---

## Other AI Options

**Any AI + raw files** - Point at the knowledge files:
- [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md)
- [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md)
- [onlyworlds-core.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/onlyworlds-core.md)

**Browser AI** - Paste the <a href="/assets/ow_llm_guide.txt" download>LLM guide</a> into chat.

**[OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot)** - ChatGPT assistant for quick questions.

**[MCP Server](https://onlyworlds.com/mcp)** - Schema/API access for Claude Desktop, Cursor. `npm install @onlyworlds/mcp-client`

---

## Manual Development

Standard setup without AI:

1. Get API credentials from [onlyworlds.com](https://onlyworlds.com) (Profile → PIN, World Settings → API Key)
2. Install SDK: `npm install @onlyworlds/sdk`
3. See [API Reference](/docs/development/api-reference) and [SDK docs](https://www.npmjs.com/package/@onlyworlds/sdk)
