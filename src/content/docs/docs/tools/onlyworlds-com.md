---
title: onlyworlds.com
description: "The OnlyWorlds platform: accounts, world hosting, keys and the API."
---

onlyworlds.com is the platform hub: accounts, world hosting, keys and the API. Editing happens in [Atlas](/docs/tools/atlas) and the other tools, and onlyworlds.com is where your worlds live online.

| | |
|---|---|
| **URL** | [onlyworlds.com/account](https://www.onlyworlds.com/account/) |
| **Type** | Web application |

## Features

- **World Hosting.** Create worlds and manage them from the account portal.
- **The world page.** Five panes: Overview, Elements, Open with (how to open the world in Atlas, Lantern, Obsidian or an AI), Access (keys and invitations) and Settings. Overview's Recent changes names an agent's change: "by Archivist, an agent" for an agent seat's, "by an agent" for one through MCP or a declared agent; a person's change carries no mark. See [Agent seats](/docs/development/agents) for the invitations. **Open in Atlas** opens the world in Atlas with no key to copy: Atlas asks you to sign in with your email (or username) and password, and still accepts an account token under **I have an account token**. A member's page for a world shared with them has the same button, and **Your AI in this world**, where a member makes a seat for their own AI.
- **The join page.** An invite link opens `onlyworlds.com/join`, which shows who invites you, to which world and as what role. A person's invitation also offers **Open in Lantern** and **Open in Atlas**; an agent's, **Open in Atlas**; a player's, **Open in Lantern**, with no sign-in. See [Invite links](/docs/development/api/members#invite-links).
- **Keys.** Mint and revoke scoped world keys, `ow_w_` for write and `ow_r_` for read. A key is shown once. See [Keys](/docs/getting-started/keys).
- **Account Tokens.** Mint `ow_a_` tokens in Settings so apps can act on your account.
- **Element browser.** The world page's Elements pane shows a world's elements read-only, by type or, for the owner, all on one page in boxes by type, sorted by Name, Most of a kind, Most linked (the number counts links to and from other elements) or Most content (the number counts characters of text).
- **Export.** Download a world as a single JSON file.
- **API.** Full REST access, documented at [api/docs](https://www.onlyworlds.com/api/docs), and an [MCP server](https://www.onlyworlds.com/mcp) for AI assistants. See the [API reference](/docs/development/api-reference) and [MCP](/docs/development/mcp).

## Getting Started

1. Create an account at [onlyworlds.com](https://www.onlyworlds.com/accounts/login/), with email or Google, GitHub or Discord.
2. Create a world. Your first world sets your 4-digit PIN, which is the write wall on all your worlds.
3. Press **Open in Atlas** on the world page. The first time, [Atlas](https://atlas.onlyworlds.com) asks you to sign in with your email (or username) and password, or with an account token (Account settings, Account tokens) under **I have an account token**, and for your PIN once when the world opens to be written.
4. For scripts and other tools, mint a world key on the world page.

