---
title: Build on OnlyWorlds
description: Where to start for apps, scripts, games and AI agents that read and write OnlyWorlds worlds.
---

OnlyWorlds is open source and license free. A world on [onlyworlds.com](https://www.onlyworlds.com) is reachable through a REST API, a change feed and an MCP server; every interface reads and writes the same data, scoped by a per-world key. New here? [Getting started](/docs/getting-started/) walks through a first read and write.

## API

The REST API at `https://www.onlyworlds.com/api/v2/` serves every element type at the same routes, with cursor pagination, one-shape links, bulk writes and a change feed.

| Page | Covers |
| :--- | :--- |
| [API reference](/docs/development/api-reference) | Overview: base URL, authentication, routes |
| [Reads and pagination](/docs/development/api/reads) | Lists, filters, sparse fields, expansion |
| [Link fields](/docs/development/api/links) | Link fields and adding or removing links atomically |
| [Writes and bulk](/docs/development/api/writes) | Create, upsert, patch, delete, bulk |
| [Changes and export](/docs/development/api/changes) | The change feed, for keeping a cache or mirror in step, and the world export |
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

To start a web tool from a page that already runs, use [World Starter](https://github.com/OnlyWorlds/event-starter), a template repository (MIT): plain TypeScript with Vite and the TypeScript SDK, no framework. Out of the box it reads the demo world Moppetopia, one element type at a time and one element with its links; paste a read key to read your own world. It only reads.

## AI agents

| Page | For |
| :--- | :--- |
| [AI agents](/docs/development/ai) | Which way in fits where the agent runs |
| [MCP server](/docs/development/mcp) | Any MCP client, at `https://www.onlyworlds.com/mcp` |
| [Agent seats](/docs/development/agents) | An agent joining a world as a member, with its own key and Character |
| [LLM guide](/docs/development/llm-guide) | One text file that teaches the standard to a chat assistant |
| [Toolkit](/docs/development/toolkit) | A Claude Code plugin with skills to import, model, read, draw and move worlds and build tools |

## The schema for tool builders

The element types, fields and links are documented under [Schema](/docs/schema/). Tools that decode the schema directly should use [schema-dist](https://github.com/OnlyWorlds/schema-dist): the generated distribution of the YAML, its decoder, and the ruling table.
