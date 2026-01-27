---
layout: default
title: tooling
parent: development
nav_order: 1
---

## OnlyWorlds Toolkit

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin for parsing, modeling, API operations, and tool development. Also works with other local AI tools.

**GitHub**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

### Setup

```bash
git clone https://github.com/OnlyWorlds/toolkit
claude --plugin-dir ./toolkit
```

### Skills

- **`/onlyworlds:parsing`** - Convert text into OnlyWorlds elements
- **`/onlyworlds:modeling`** - Design help structuring your world
- **`/onlyworlds:api`** - CRUD operations on world data
- **`/onlyworlds:dev`** - SDK setup, tool building, deployment
- **schema** - Field reference (loads automatically)

### Try it

```
"Parse this into OnlyWorlds" + paste text
"How do I model a magic system?"
"What fields does Character have?"
```

---

## Other Options

**Any AI + raw files** - Point your AI at the toolkit's knowledge files on GitHub:
- [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md) - All fields for all 22 elements
- [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md) - How to structure worlds

**Browser AI** - Paste the <a href="/assets/ow_llm_guide.txt" download>LLM guide</a> into chat, or link the [GitHub repo](https://github.com/OnlyWorlds/toolkit), describe what you want to build.

**[OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot)** - ChatGPT assistant for quick questions.

**[MCP Server](https://onlyworlds.com/mcp)** - Schema/API access for Claude Desktop, Cursor. `npm install @onlyworlds/mcp-client`

---

## Manual Development

Don't want AI assistance? Standard setup:

1. Get API credentials from [onlyworlds.com](https://onlyworlds.com) (Profile → PIN, World Settings → API Key)
2. Install SDK: `npm install @onlyworlds/sdk`
3. See [API Reference](/docs/development/api-reference) and [SDK docs](https://www.npmjs.com/package/@onlyworlds/sdk)

