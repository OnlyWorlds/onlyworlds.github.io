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

## Ask Your World, Without a Key of Your Own

For an app that wants to answer a question about a world without the user bringing their own model key, OnlyWorlds runs a small proxy: `POST /api/v2/account/ask`, with an account credential (`Authorization: Bearer ow_a_…`, a signed-in session, or an app client's `X-Session-Token`). The app does the search itself and sends the question with the elements it found, as text (1 to 8, at most 2,000 characters each); the proxy answers from those elements only, through a fast model, and says "The world doesn't say." when they do not hold the answer. The account must own the world or be a member of it. In TypeScript, the SDK's [`lookupWorld` and `renderElement`](/docs/development/typescript#find-things-in-a-world) do the search and write those texts.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/ask" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{"world_id": "…", "question": "Who holds Balkonon?",
       "context": ["Mira Thel (character)\ndescription: Holds the fort of Balkonon."]}'
```

`200` answers `{answer, model, stop_reason, usage: {input_tokens, output_tokens}, remaining}`. Each account has an allowance of questions per day (`remaining` counts down; over it, `429` [`quota_exceeded`](/api/errors/#quota_exceeded) with `Retry-After` to midnight UTC). When the proxy is switched off or paused for the day, `503` [`ask_unavailable`](/api/errors/#ask_unavailable); when the model gives no answer, `502` [`ask_failed`](/api/errors/#ask_failed). Neither counts against the allowance. The proxy keeps no questions and no answers; it records only how many questions an account asked and the tokens they took.

### Sort Notes Into a World

The same proxy turns loose notes into changes for the user to review: `POST /api/v2/account/sort`, with the same credential. The app sends the notes (1 to 8, each text up to 4,000 characters and 16,000 in all, or `{text, image_url}` with a picture already uploaded into this world, at most four) and a `slice`: up to 100 elements its own search found for them, each `{id, type, name, anchor?}`.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/sort" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{"world_id": "…", "notes": ["Mira moved to Ostvik."],
       "slice": [{"id": "…", "type": "character", "name": "Mira Thel"},
                 {"id": "…", "type": "location", "name": "Ostvik"}]}'
```

`200` answers `{rows, not_proposed, model, stop_reason, usage, remaining}`. Each row is one of four kinds, with the `source_line` it came from: `make` (a new element: type, name, description), `add_to` (text to append to a field of a slice element), `link` (one slice element to another through a field) and `ask` (a question with `candidates`, when a name matches several elements or the sorter is unsure; its optional `then` is the `add_to` or `link` the user's pick completes). Every id in a row is from the slice, and names come from the slice too; a row naming anything else moves to `not_proposed` with its reason, as do lines the sorter could not place. At most 40 rows. Nothing is written: the app applies what the user accepts. A sort counts as one question against the same allowance, with the same errors. In TypeScript: `account.sort({ worldId, notes, slice })` (SDK 4.18.0).

## The Same Data Everywhere

Every path reaches the same worlds. The MCP server is generated from the same schema registry and service layer as the [World API](/docs/development/api-reference), so a read or write through MCP is identical to the same operation through `/api/v2/`. The API's full reference is interactive at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).
