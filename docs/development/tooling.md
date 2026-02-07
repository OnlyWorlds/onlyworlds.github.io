---
layout: default
title: tooling
parent: development
nav_order: 1
---

## Worldbuilding Toolkit

A local AI toolkit for worldbuilding with structured data. Turn text into queryable elements, design complex systems, build tools that use world data as a backend.

Native plugin for Claude Code. Also works with other local AI systems, through skill and/or knowledge files. 

**Repository**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

---

## What It Does

**Get oriented**: New to OnlyWorlds? The toolkit explains what OnlyWorlds is, what it can do, and routes you to the right workflow.

**Connect projects**: Set up `.ow/` folder with credentials and world cache for ongoing work. Supports multiple worlds per project.

**Parse text**: Convert xisting world data, stories you wrote, campaign notes, or any other text into queryable JSON ready for import.

**Model systems**: Get recommendations for representing magic systems, empires, tech trees, or other complex structures. Which element types? How do they connect?

**Build tools**: Scaffold projects that use OnlyWorlds as a backend. Your world data lives in the cloud with REST API access. Build games, visualizations, editors without managing a database.

**Reference schema**: Look up fields, validate structure, check what exists. The full OnlyWorlds schema (22 element types, all fields) available on demand.

**Sync data**: Create, read, update, and delete elements in your world via API.

---

## Install

### Via Marketplace

```bash
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
# Restart Claude Code
```

### Direct Install

```bash
git clone https://github.com/OnlyWorlds/toolkit
claude --plugin-dir ./toolkit
```

---

## Skills

| Skill | Use Case |
|-------|---------|
| **onlyworlds-start** | New to OnlyWorlds? Start here for orientation |
| **project-setup** | Connect your project to your world (credentials, caching) |
| **parsing** | Turn text into OnlyWorlds elements |
| **modeling** | Figure out how to structure complex systems |
| **schema** | Look up fields and element types |
| **api** | Create, update, or delete elements |
| **dev** | Set up SDK and build tools |

---

## Usage

**First time?** Say "OnlyWorlds" or use `/onlyworlds-start` to get oriented.

**Connecting a project?** Use `/project-setup` to create `.ow/` folder with credentials and world cache.

**Parsing or modeling?** Just ask:

```
"Parse this text: [paste text]"
"How should I model a magic system with learned and innate abilities?"
"What fields does Character have?"
"Create a new Location in my world"
"Build a quiz tool using my world data"
```

Skills load automatically when needed, or invoke directly with `/skill-name`.

---

## Alternative Access

**Other local AI tools**:
- **Cursor / Windsurf**: Point at raw toolkit files - they read markdown skills directly
- **Knowledge files**: [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md), [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md)
- **MCP Server** (Claude Desktop / Cursor): `npm install @onlyworlds/mcp-client`

**Browser-based**:
- [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot) - ChatGPT custom GPT for quick parsing/questions
- <a href="/assets/ow_llm_guide.txt" download>LLM guide</a> - paste into any AI chat for basic support

**Manual development** (no AI):
1. Get credentials: **Profile → PIN**, **World Settings → API Key**
2. Install SDK: `npm install @onlyworlds/sdk`
3. See [API Reference](/docs/development/api-reference) and [SDK docs](https://www.npmjs.com/package/@onlyworlds/sdk)
