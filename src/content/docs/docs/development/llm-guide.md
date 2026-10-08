---
title: LLM Guide
description: A single text file that teaches a chat assistant OnlyWorlds, so it can help you build a tool on the standard.
---

The LLM guide is one plain-text file, written for AI assistants, that teaches the OnlyWorlds standard, the 22 element categories, the API and the TypeScript SDK. Paste it into a chat and the assistant can help you plan and build your own tool on OnlyWorlds.

**The file**: [https://onlyworlds.github.io/assets/ow_llm_guide.txt](https://onlyworlds.github.io/assets/ow_llm_guide.txt)

The guide is for people building their own tools. Someone who wants to build a world can go straight to [Atlas](/docs/tools/atlas/), and someone working in Claude Code is better served by the [toolkit](/docs/development/toolkit/), which the guide itself points to.

## Using It in a Chat

1. Open the file and copy all of it, or download it.
2. Paste it into a new chat (ChatGPT, Claude, or a browser builder such as Lovable, Replit, v0.dev or ChatGPT Canvas).
3. Describe the tool you want. The guide tells the assistant to ask what problem it solves, who uses it, its one core interaction, and which element categories matter, then to write a short spec with you before writing code.

For full field definitions beyond the guide, point the assistant at the [schema](/docs/schema/) or at `FIELD_SCHEMA` in the [SDK](/docs/development/typescript/).

## What It Covers

| Part | Contents |
|:--|:--|
| 1. How to help the user | Gauging experience (no coding, some coding, advanced), planning a tool before building it with a short spec, choosing between browser builders and a local setup, pointing Claude Code users to the toolkit, and local setup (Node.js, Git, an editor). |
| 2. OnlyWorlds essentials | What OnlyWorlds is (an open standard; a world as a folder of JSON files or a hosted world with a REST API), the 22 categories in six groups with one line each, how common concepts map onto them, and `x_` extension fields for custom data. |
| 3. Credentials and first call | Minting a key (`ow_w_`, `ow_r_`, `ow_a_`, legacy), the PIN on writes, keeping credentials out of chats, commits and browser bundles, and a first SDK call. |
| 4. SDK and API reference | Reads and cursor paging, filters, `expand` and `fields`; create, patch, upsert and delete; link fields and `editLinks`; bulk upload with client-minted ids and idempotency keys; the change feed; error codes; UI helpers (icons, colours, field groups, `FIELD_SCHEMA`); reading a world folder with no account. |
| 5. Deployment | Building, the static hosts the API accepts browser calls from without setup, deploying to Cloudflare Pages, and why a public site uses a read key. |
| 6. Resources | Links to Atlas, the developer start, the API reference, the SDK, the standard, schema-dist, the toolkit, the MCP server, the tools and the community. |

The file ends with its own changelog.

## Related

- [MCP server](/docs/development/mcp/): connect an assistant to a world directly instead of pasting the guide.
- [Toolkit](/docs/development/toolkit/): the same knowledge as Claude Code skills, readable by other agents as markdown.
- [AI agents](/docs/development/ai/): the four ways an AI works with a world.
