---
title: Toolkit
description: The OnlyWorlds toolkit, a Claude Code plugin of skills for structuring, growing, playing in, moving and building on worlds.
---

The toolkit is a Claude Code plugin: eleven skills, an orchestration agent and a knowledge base for working with worlds. Its skills follow the life of a world: structure it, grow it, play in it and keep it true, move it, build on it. Any AI that reads markdown can use its files; it is built for Claude Code.

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

A copy installed before 5.0 updates with `/plugin marketplace update`, then the install line again.

### Other AIs

The skills CLI copies the skills into your project, for any agent that reads a skills folder (`--list` shows them without installing):

```bash
npx skills add OnlyWorlds/toolkit
```

Or point the assistant at the knowledge files, in this order. A world is a folder of JSON files first; the API is the optional hosted case.

1. [principles.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/principles.md): the shared rules every skill follows
2. [world-folder.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/world-folder.md): the world as files, and keeping its history
3. [element-types.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/element-types.md): the 22 types, and when to create each
4. [decision-trees.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/decision-trees.md): choosing between the types that get confused
5. [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md): translating a system (magic, a political order, an economy) into the types
6. [common-errors.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/common-errors.md): the mistakes an import makes most, with examples
7. [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md): every field of every type, generated from the standard
8. [world-memory.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/world-memory.md): loading a world into AI sessions and writing each session back
9. [atlas-conventions.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/atlas-conventions.md): how Atlas uses the schema, for worlds that live there

The skill files themselves sit in the repository's `skills/` folder, one folder per skill, and read as plain markdown.

## Skills

| Stage | Skill | What it does |
|:--|:--|:--|
| Start | `start` | The entry point: works out your situation, routes you to the right skill, and connects a folder to your onlyworlds.com account when you want one. |
| | `setup` | Sets up a world for work rather than fiction (a company, a team, an AI's own home, a council, a software project) from a starter pack: house rules, a world skill for the AIs, a seed and the invites. |
| Structure it | `import` | Turns notes, a manuscript, PDFs, a wiki or old session notes into a world folder Atlas opens, or reconciles them into an existing world. Invents no fields. |
| | `model` | How to represent a system (magic, a political order, an economy, a tech tree) in the 22 types, and every type's fields across [every category](/docs/schema/). |
| Grow it | `read` | Reads a whole world through one lens: a creative brief of what it holds, the connections it is missing, or where it contradicts itself. |
| | `draw` | Draws a world as a graph, its maps with their pins and zones, or its events on a timeline, in a file you open in a browser. It never changes the world. |
| Play in it and keep it true | `context` | Designs how the right part of a world gets loaded into each AI session: fresh, scoped, sourced. |
| | `update` | Writes a finished session (notes, recap, transcript) back into the world through a change list you approve, so canon holds. |
| Move it | `carry` | Moves a world between files, tools and homes: one [`.owworld` file](/docs/schema/folders) and back, an export from World Anvil, LegendKeeper, Kanka, Campfire or Notion, Markdown or OKF, a folder to an account and back. |
| Build on it | `develop` | Builds a tool, game, app or AI agent on world data: the API, the SDK, the MCP server, credentials and deployment. |
| | `council` | Ask about, propose or back a change to the standard, when its categories don't fit. |

Each skill's full name is `onlyworlds-<skill>` (in Claude Code, `/onlyworlds:onlyworlds-<skill>`). The orchestration agent, `ow-agent`, chains several skills for multi-step jobs, such as importing a whole corpus and then reading it for missing links. The knowledge base covers the schema reference, the category descriptions, and decision trees for ambiguous modeling choices.

### Coming from 4.8

Toolkit 5.0 has eleven skills where 4.8 had fourteen. The old names no longer load: update them wherever you wrote them (your notes, a CLAUDE.md, an agent of your own).

| 4.8 | 5.0 |
|:--|:--|
| `project-setup` | `start` (Connect an account) |
| `parsing` | `import` |
| `modeling`, `schema` | `model` |
| `survey`, `link`, `consistency` | `read` (a lens of the same name) |
| `resolve` | `update` |
| `api`, `dev` | `develop` |
| `start`, `context`, `setup`, `council` | unchanged |

The retired knowledge files (`onlyworlds-core.md`, `ai-builders.md`, `ecosystem.md`, `tangle-conventions.md`) still answer at their old addresses as two-line pointers to where the text went. With the skills CLI, delete the ten 4.8 folders still in your skills folder (`onlyworlds-parsing` to `onlyworlds-project-setup`), or your AI sees two skills for one job. The [release notes](https://github.com/OnlyWorlds/toolkit/releases/tag/v5.0.0) have the rest.

## A world folder or an account world

Most of the toolkit runs on files alone, with no account:

- `import` and `model` work fully standalone: import writes a world folder, so your notes become a world Atlas opens.
- `read` and `draw` work on a world folder straight off disk: an Atlas world, converter output, or anything in the [world folder shape](/docs/schema/folders).
- `carry` packs, unpacks and converts folders on disk; only the move to or from an account needs one.
- `context` and `update` work with whatever holds the world: a folder, your own notes, or an OnlyWorlds world.

With an OnlyWorlds account, the same skills work on an account world over the [API](/docs/development/api-reference). `start` connects the project (a `.env` you fill with your key and PIN as `OW_API_KEY` and `OW_API_PIN`, kept out of git; a folder that still holds the older `ONLYWORLDS_API_KEY` and `ONLYWORLDS_API_PIN` keeps working), and `develop` builds on it. To connect an agent to a world directly, see the [MCP server](/docs/development/mcp).

## Example requests

```text
"Help me organize my worldbuilding notes"
"Turn my notes into a world folder"
"How should I model a magic system?"
"What fields does Character have?"
"Find orphaned elements in my world"
"Show my world as a graph"
"Bring my World Anvil export into a world folder"
"My AI keeps forgetting my campaign's canon"
"Turn last session's notes into world updates"
"I'm building a game with world data"
```
