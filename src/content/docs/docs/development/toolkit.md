---
title: Toolkit
description: The OnlyWorlds toolkit, a Claude Code plugin of skills for structuring, growing, playing in and building on worlds.
---

The toolkit is a Claude Code plugin: a set of skills, an orchestration agent and a knowledge base for working with worlds. Its skills follow the life of a world: structure it, grow it, play in it and keep it true, build on it. Any AI that reads markdown can use its files; it is built for Claude Code.

**Repository**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

## Install

In Claude Code:

```bash
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
```

Restart Claude Code to load it. Or load it straight from a clone, with no restart:

```bash
git clone https://github.com/OnlyWorlds/toolkit
claude --plugin-dir ./toolkit
```

### Other AIs

Point the assistant at the knowledge files, in this order:

1. [principles.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/principles.md): the shared rules every skill follows
2. [world-folder.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/world-folder.md): the world as files, and keeping its history
3. [world-memory.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/world-memory.md): loading a world into AI sessions and writing each session back
4. [onlyworlds-core.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/onlyworlds-core.md)
5. [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md)
6. [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md)
7. [ai-builders.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/ai-builders.md)

The skill files themselves sit in the repository's `skills/` folder, one folder per skill, and read as plain markdown.

## Skills

| Stage | Skill | What it does |
|:--|:--|:--|
| Start | `onlyworlds-start` | The entry point: works out your situation and routes you to the right skill. |
| Structure it | `parsing` | Turns text, files or folders (notes, novels, campaign docs, wikis) into a structured world: JSON, or a world folder Atlas opens. |
| | `modeling` | Design help for complex systems (magic, politics, economies, tech trees) as linked elements. |
| | `schema` | Field reference across all 22 categories: look up fields, validate structure, tell similar categories apart. |
| Grow it | `survey` | Reads a world and writes a creative brief of its themes, tensions and structure. |
| | `link` | Finds missing connections, enriches links and resolves orphaned elements. |
| Play in it and keep it true | `context` | Designs how the right part of a world gets loaded into each AI session: fresh, scoped, sourced. |
| | `resolve` | Designs how a finished session (notes, recap, transcript) gets written back into the world, so canon holds. |
| Build on it | `api` | Reads, creates, updates and deletes elements through natural language, handling auth, endpoints and field mapping. |
| | `dev` | SDK integration, project scaffolding, credentials and deployment. |
| | `council` | Browse and draft schema governance motions when the 22 categories don't fit. |
| | `project-setup` | Connects a project to an OnlyWorlds account world: credentials and a local cache. Runs when another skill needs it. |

The orchestration agent, `ow-agent`, chains several skills for multi-step jobs, such as parsing a whole corpus and then linking and surveying it. The knowledge base covers the schema reference, the category descriptions, and decision trees for ambiguous modeling choices.

## A World Folder or an Account World

Most of the toolkit runs on files alone, with no account:

- `parsing`, `modeling` and `schema` work fully standalone.
- `survey` and `link` read a world folder straight off disk: an Atlas world, converter output, or anything in the [world folder shape](https://github.com/OnlyWorlds/toolkit/blob/main/knowledge/world-folder.md).
- `parsing` can write that folder shape directly, so your notes become a world Atlas opens.
- `context` and `resolve` work with whatever holds the world: a folder, your own notes, or an OnlyWorlds world.

With an OnlyWorlds account, the same skills work on an account world over the [API](/docs/development/api-reference/). `project-setup` connects the project (a `.env` you fill with your key and PIN, kept out of git), and `api` and `dev` build on it. To connect an agent to a world directly, see the [MCP server](/docs/development/mcp/).

## Example Requests

```text
"Help me organize my worldbuilding notes"
"Turn my notes into a world folder"
"How should I model a magic system?"
"What fields does Character have?"
"Find orphaned elements in my world"
"My AI keeps forgetting my campaign's canon"
"Turn last session's notes into world updates"
"I'm building a game with world data"
```
