---
layout: default
title: toolkit
parent: tools
nav_order: 8
---


Claude Code plugin for AI-assisted worldbuilding with OnlyWorlds.

**URL:** [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)
**Type:** Plugin/Extension (Claude Code)

---

## What It Does

Five skills for working with OnlyWorlds:

| Skill | Purpose |
|-------|---------|
| **parsing** | Convert text into OnlyWorlds elements |
| **modeling** | Design consultation for structuring worlds |
| **schema** | Field reference and validation |
| **api** | CRUD operations with OnlyWorlds API |
| **dev** | Build tools with the SDK |

## Setup

1. **Install Claude Code** ([docs.anthropic.com/claude-code](https://docs.anthropic.com/en/docs/claude-code))
2. **Clone the toolkit**:
   ```bash
   git clone https://github.com/OnlyWorlds/toolkit
   ```
3. **Launch with plugin**:
   ```bash
   claude --plugin-dir ./toolkit
   ```

## Usage

Once loaded, try:
- `/onlyworlds:parsing` - Parse worldbuilding text
- `/onlyworlds:modeling` - Get help structuring your world
- "What fields does Character have?" - Schema lookups work automatically

## For Other AIs

The toolkit's knowledge files work with any AI that can read markdown. Point your AI at the raw GitHub URLs:

- [schema-reference.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/schema-reference.md)
- [modeling-patterns.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/modeling-patterns.md)
- [onlyworlds-core.md](https://raw.githubusercontent.com/OnlyWorlds/toolkit/main/knowledge/onlyworlds-core.md)


