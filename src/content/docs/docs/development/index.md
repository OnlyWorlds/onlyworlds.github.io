---
title: Build on OnlyWorlds
description: Where to start for apps, scripts, games and AI agents that read and write OnlyWorlds worlds.
---

OnlyWorlds is open source and license free. A world on [onlyworlds.com](https://www.onlyworlds.com) is reachable through a REST API, a change feed and an MCP server; every interface reads and writes the same data, scoped by a per-world key. New here? [Getting Started](/docs/getting-started/) walks through a first read and write.

## API

The REST API at `https://www.onlyworlds.com/api/v2/` serves all 22 element categories at the same routes, with cursor pagination, one-shape links, bulk writes and a change feed.

| Page | Covers |
| :--- | :--- |
| [API Reference](/docs/development/api-reference) | Overview: base URL, authentication, routes |
| [Reads and Pagination](/docs/development/api/reads) | Lists, filters, sparse fields, expansion |
| [Link Fields](/docs/development/api/links) | Link fields and adding or removing links atomically |
| [Writes and Bulk](/docs/development/api/writes) | Create, upsert, patch, delete, bulk |
| [Changes and Export](/docs/development/api/changes) | The change feed, for keeping a cache or mirror in step, and the world export |
| [Members](/docs/development/api/members) | Worlds shared with people and agents, and their roles |
| [Images](/docs/development/api/images) | Uploading images |
| [CORS](/docs/development/api/cors) | Calling the API from a browser |
| [Classic API](/docs/development/api/classic) | The original `/api/worldapi/` dialect, still supported |
| [Errors](/api/errors/) | The error envelope and every error code |

The interactive reference is at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs), and the machine-readable spec at [openapi.json](https://www.onlyworlds.com/api/v2/openapi.json). Any language or engine without an SDK can generate a client from the spec.

## SDKs

| Page | For |
| :--- | :--- |
| [Packages](/docs/development/packages) | Which SDK fits, and calling the API without one |
| [TypeScript](/docs/development/typescript) | Web apps and tools: a typed client and generated constants (`npm install @onlyworlds/sdk`) |
| [Python](/docs/development/python) | Scripts and data pipelines |
| [Unity](/docs/development/unity) | Games: typed C# models and a client |

## AI Agents

| Page | For |
| :--- | :--- |
| [AI Agents](/docs/development/ai) | Which way in fits where the agent runs |
| [MCP Server](/docs/development/mcp) | Any MCP client, at `https://www.onlyworlds.com/mcp` |
| [Agent Seats](/docs/development/agents) | An agent joining a world as a member, with its own key and Character |
| [LLM Guide](/docs/development/llm-guide) | One text file that teaches the standard to a chat assistant |
| [Toolkit](/docs/development/toolkit) | A Claude Code plugin with skills to parse, model and link worlds and build tools |

## The Schema for Tool Builders

The element categories, fields and links are documented under [Schema](/docs/schema/). Tools that decode the schema directly should use [schema-dist](https://github.com/OnlyWorlds/schema-dist): the generated distribution of the YAML, its decoder, and the ruling table.
