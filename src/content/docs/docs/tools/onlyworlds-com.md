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
- **The world page.** Five panes: Overview, Elements, Open with (how to open the world in Atlas, Lantern, Obsidian or an AI), Access (keys and invitations) and Settings. Three have a path of their own, for a link that must survive a sign-in: `/account/worlds/<world_id>/open-with`, `/access`, and `/keys` for the keys under Access. Overview's Recent changes names an agent's change: "by Archivist, an agent" for an agent seat's, "by an agent" for one through MCP or a declared agent; a person's change carries no mark. See [Agent seats](/docs/development/agents) for the invitations. **Open in Atlas** opens the world in Atlas with no key to copy: Atlas asks you to sign in with your email (or username) and password, and still accepts an account token under **I have an account token**. A member's page for a world shared with them has the same button, and **Your AI in this world**, where a member makes a seat for their own AI.
- **The join page.** An invite link opens `onlyworlds.com/join`, which shows first who the link is for (you, or an AI agent), then who invites you, to which world and as what role; a link pasted without its code says so and asks for the full link. A person's invitation also offers **Open in Lantern** and **Open in Atlas**; an agent's, **Open in Atlas**; a player's, **Open in Lantern**, with no sign-in. See [Invite links](/docs/development/api/members#invite-links).
- **Keys.** Mint and revoke scoped world keys, `ow_w_` for write and `ow_r_` for read. A key is shown once. See [Keys](/docs/getting-started/keys).
- **Account Tokens.** Mint `ow_a_` tokens in Settings so apps can act on your account.
- **Element browser.** The world page's Elements pane shows a world's elements read-only, by type or, for the owner, all on one page in boxes by type, sorted by Name, Most of a kind, Most linked (the number counts links to and from other elements) or Most content (the number counts characters of text). An element's page has a Files card, where the owner adds, downloads and removes the files attached to it ([Files](/docs/development/api/files)).
- **Lenses.** A world's Lenses page, in the world's menu, lists its lenses, changes one and shows its reading. See [Lenses](/docs/lenses#on-onlyworldscom).
- **Hidden elements.** An element's page has a **Who can see this** card with a **Hide** button. A hidden element's page shows a **Hidden · DM's eyes** badge beside its type, and the card reads **Hidden: the owner and co-builders only**, names the member who made it (who still sees it), lists the world's published pages ("A page that holds it stays visible there until you republish or unpublish it.") and has **Unhide**. The Elements pane has a **Hidden · N** filter beside By type and All elements, and each type's list has the same filter and a **Hidden** badge on each hidden row. See [Hidden elements](/docs/development/api/hidden).
- **Public worlds.** In Settings, **Who can see this world**: **Only people you invite** (the default) or **Anyone can read it, with no account**, with a tick for **Give it a page at onlyworlds.com/w/…** and its address. The page shows the world as a stranger reads it, hidden elements left out, in one of five palettes, with an optional hero line, the element types in the owner's order and one pinned element; each element has a page of its own under it. See [Public worlds](/docs/development/api/public).
- **Export.** Under Access, **This world as a file**: **Download JSON** saves the world as one [export file](/docs/development/api/changes#the-export-file), **Copy JSON** puts the same file on the clipboard.
- **Restore to a day.** Each night a world changed, onlyworlds.com keeps a file of it for 90 days, and a world's newest file is always kept. The owner's world page lists the files under Access, below the export card, each row naming its file ("Daily file, 23 Oct 2026", or "Kept before a restore, 23 Oct 2026 07:24 UTC"); its button opens a confirm page whose heading and button name the same file, and the restore puts every element, every link and the world's own settings back as they were that day, the keys tools keep on the World (`x_`, `atlas_`, `shadow_`) included: one a tool added since is removed. Where the world first came from (its `origin`) is never changed by a restore. A file of the world as it is now is kept first, listed as "Kept before a restore" with its time, so a restore can be undone. An element you hid stays hidden; pictures and files are not restored, only their links; members, keys and seats are left as they are. A world over 100 MB gets no daily file. See [Restores in the feed](/docs/development/api/changes#restores-in-the-feed).
- **Changelog.** [onlyworlds.com/changelog](https://www.onlyworlds.com/changelog): everything that shipped across OnlyWorlds, newest first and back to the beginning, by month, each row marked with its source: the site, Atlas, the Obsidian plugin, the toolkit, the TypeScript SDK, the Python package, schema-dist and the Unity SDK. An Atom feed at `/changelog.xml`, and the merged list as JSON at `/changelog.json` (the old `/whats-new` paths redirect), with a row per source that says whether it was read. The feedback page links to it.
- **API.** Full REST access, documented at [api/docs](https://www.onlyworlds.com/api/docs), and an [MCP server](https://www.onlyworlds.com/mcp) for AI assistants. See the [API reference](/docs/development/api-reference) and [MCP](/docs/development/mcp).

## Getting started

1. Create an account at [onlyworlds.com](https://www.onlyworlds.com/accounts/login/), with email or Google, GitHub or Discord.
2. Create a world. Your first world sets your 4-digit PIN, which is the write wall on all your worlds.
3. Press **Open in Atlas** on the world page. The first time, [Atlas](https://atlas.onlyworlds.com) asks you to sign in with your email (or username) and password, or with an account token (Account settings, Account tokens) under **I have an account token**, and for your PIN once when the world opens to be written.
4. For scripts and other tools, mint a world key on the world page.

