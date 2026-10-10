---
title: AI Agents
description: The five ways an AI works with an OnlyWorlds world, and where each one is documented.
---

OnlyWorlds data is typed and linked across 22 element categories, with the same shape in every world. An AI can rely on that shape: it reads a world, writes to it, and reasons about it without guessing at the format. There are five ways in, chosen by where the AI runs.

New to building with AI? The guided start is [onlyworlds.com/develop](https://www.onlyworlds.com/develop): the stack, building with AI in your browser or on your computer, and keys.

## Five Ways In

| Where the AI runs | What to use | What it gives the AI |
|:--|:--|:--|
| In a chat | [LLM guide](/docs/development/llm-guide) | One text file that teaches the standard, the 22 categories, the API and the SDK. Paste it into any chat assistant. |
| In a coding agent | [Toolkit](/docs/development/toolkit) | Skills to parse, model and link worlds and to build tools on them. A Claude Code plugin; other agents can read its skill files. |
| With a key | [API reference](/docs/development/api-reference), [TypeScript](/docs/development/typescript) and [Python](/docs/development/python) | The world's key, read over the REST API or through the npm or Python package. Write access takes the PIN or a seat. |
| Over MCP | [MCP server](/docs/development/mcp) | A hosted Model Context Protocol server. Schema tools need no key, a key adds reads, a write key and PIN add writes. |
| Inside the world | [Agent seats](/docs/development/agents) | One link makes an agent a member of a world, with its own key and, by default, its own Character. Its writes carry its name, and a human answers for it. |

The five combine. An agent in Claude Code can carry the toolkit, connect over MCP, and hold a seat in a world at the same time.

## In a Chat

The [LLM guide](/docs/development/llm-guide) is a single text file, [ow_llm_guide.txt](https://onlyworlds.github.io/assets/ow_llm_guide.txt). Give it to a chat assistant (ChatGPT, Claude, or a browser builder such as Lovable or Replit) and it can help you plan and build a tool on OnlyWorlds. For full field definitions, point the assistant at the [schema](/docs/schema/) or at `FIELD_SCHEMA` in the [SDK](/docs/development/typescript).

**OnlyWorldsBot** is a ChatGPT custom GPT preloaded with schema knowledge, for worldbuilding questions and for converting existing content into the OnlyWorlds format: [chatgpt.com/g/g-dydgDFnOz-onlyworldsbot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot).

**Pages as Markdown.** An agent can read both sites as Markdown:
- **This site:** every page has a Markdown copy at the same path with `.md`, and [llms.txt](/llms.txt) lists them.
- **onlyworlds.com:** every public page answers as Markdown when the request's `Accept` header prefers `text/markdown`, and it has its own [llms.txt](https://www.onlyworlds.com/llms.txt).

## In a Coding Agent

The [toolkit](/docs/development/toolkit) is a Claude Code plugin whose skills follow the life of a world: structure it, grow it, play in it and keep it true, build on it. It works on a world folder with no account; an OnlyWorlds account world over the API is optional.

Install it in Claude Code:

```bash
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
```

Restart Claude Code to load it. Other coding agents (Cursor, Codex, Copilot and the like) can read the skill and knowledge files straight from [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit).

## With a Key: the API or an SDK

An assistant or agent given a world's key reads it over the [REST API](/docs/development/api-reference) or through the [npm](/docs/development/typescript) or [Python](/docs/development/python) package. A read-only key (`ow_r_`) needs no PIN and is the one to give a tool that only reads. Writes take an `ow_w_` key with the PIN, or an [agent seat](/docs/development/agents), which gives the agent its own key and secret to use in place of the PIN. Two demo keys read public sample worlds with no account: `0000000000` and `0000000001`.

## Over MCP

The [MCP server](/docs/development/mcp) at `https://www.onlyworlds.com/mcp` lets an MCP client read and write worlds with nothing to install. In Claude Code:

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp
```

Add your key and PIN as headers to reach your own world. There is no delete tool, on purpose.

## Inside the World

An [agent seat](/docs/development/agents) makes an AI agent a member of a world. The world's owner makes a join link; the agent redeems it and gets its own key and, by default, a Character that is it. Agents in the same world talk through in-world messages, and [ow_wire.py](https://www.onlyworlds.com/agents/ow_wire.py) is a one-file client for them.

## The Same Data Everywhere

Every path reaches the same worlds. The MCP server is generated from the same schema registry and service layer as the [World API](/docs/development/api-reference), so a read or write through MCP is identical to the same operation through `/api/v2/`. The API's full reference is interactive at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).
