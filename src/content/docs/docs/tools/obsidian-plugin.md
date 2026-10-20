---
title: Obsidian plugin
description: The OnlyWorlds Builder plugin keeps each element as a markdown note in an Obsidian vault, with optional sync to onlyworlds.com.
---

The OnlyWorlds Builder is an Obsidian community plugin. Each element is a plain markdown note in your vault, with clickable links between elements.

| | |
|---|---|
| **URL** | [github.com/OnlyWorlds/obsidian-plugin](https://github.com/OnlyWorlds/obsidian-plugin) |
| **Type** | Obsidian community plugin |
| **Platforms** | Obsidian on desktop and mobile |

## Features

- **Vault Integration.** Create and edit elements as Obsidian notes.
- **Local-Only Worlds.** Build a world entirely in your vault, no account needed.
- **Optional Sync.** Connect a world to onlyworlds.com, or take a local-only world online later.
- **Your Account.** Sign in once, and Download World lists your onlyworlds.com worlds. Join a world with a link, or create one on your account (see [Your OnlyWorlds account](#your-onlyworlds-account)).
- **World Units.** `World.md` holds the world's length, mass and distance units, free text such as `cm` or `leagues`. The nine numbers that use them show the unit beside the value, as in `182 cm`; nothing converts. Download, upload, copy and folder export carry them. Change them in `World.md` and Upload World sends them; only the world's owner can change them.
- **A Bases file per world.** Download World, **Join a world with a link** and Create World write `<World name>.base` beside `World.md`: an all-elements table, and a table and a card view for each element type, in Obsidian's core Bases plugin (Obsidian 1.9 or later). On by default, in the settings. Once you change it, the plugin leaves it alone; **Write Bases file** rebuilds it and keeps yours as `<World name> (your copy).base`. With Obsidian Sync or another sync tool, let an edited base reach every device before you download on another.
- **Relationships on a canvas.** **Draw relationships on a canvas** draws the active element, what it links to and what links to it as an Obsidian canvas beside its note, each arrow labelled with its field. A canvas you changed is saved as `(your copy)` before a redraw.
- **World Folder Import and Export.** Read and write OnlyWorlds world folders, which open directly in [Atlas](/docs/tools/atlas).
- **Commands.** World operations are available in the Obsidian command palette.

## Setup

1. Install Obsidian (desktop or mobile).
2. Enable community plugins in Obsidian settings.
3. Search for "OnlyWorlds Builder" in the plugin browser, or open the [plugin's listing](https://community.obsidian.md/plugins/onlyworlds-builder).
4. Install the OnlyWorlds Builder plugin.
5. Create or import worlds with the OnlyWorlds commands.
6. Send edits to onlyworlds.com with Save Element (the active note) or Upload World (the whole world), or write the world as a folder with Export as OnlyWorlds folder.

A world on onlyworlds.com keeps its API key in its `World.md`, in plain text: the plugin reads it there to sync that world. A vault that is itself shared or synced somewhere public carries the key with it; use a read key (`ow_r_`) for such a vault, or keep the vault private.

## Sync

**Save Element** sends the active note's changed fields. **Auto-sync** (off by default) does the same a few seconds after you stop typing, but only for edits typed in Obsidian, so run **Upload World** after another tool such as Atlas writes your notes. Upload World creates and updates, never deletes. **Download World** fetches what changed and rewrites each changed note from the server's copy, so unsaved local edits in that note are replaced. Without signing in, Download World takes a world's API key and your PIN; a read key (`ow_r_`) needs no PIN.

Only notes inside a world's `Elements` folders are elements. A link to a `[[Name]]` that matches no note in the vault is not sent, so the server keeps its copy of that field.

When Save Element changes an element's name, its note is renamed to match, and links to it update as Obsidian's **Files and links** setting says. Auto-sync never renames: since 3.5.1 the note keeps its old file name and says so, and the next Save Element renames it, also after a restart. Turn renaming off with the **Rename note when the element's name changes** setting (on by default, since 3.5.0).

Text fields round-trip byte for byte (since 3.5.1). In a note, a line that starts with `### ` starts a new field, so a value's own `###` line, or a code fence line such as `~~~`, gains one backslash in the note (`\###`, `\~~~`) and loses it again on the way back to onlyworlds.com. Write `\###` yourself for a line that should read `###`. Inside a closed code block nothing changes. A save is refused only when a code fence left open would swallow the next heading; the notice names the field and the heading.

## Saving linked notes

Since version 3.5.0, **Save Element** on a note that links to notes not yet on onlyworlds.com lists them and asks first, then creates them together with the note. It creates at most 50 this way; past that it creates and saves nothing and points you to Upload World. Auto-sync never creates them.

An element deleted on onlyworlds.com is never brought back without your word, even though Download keeps its note. Save Element asks "create it again?", auto-sync refuses, and Upload World asks once for all of them. A link to a deleted element is left out of what is sent and named, and the note keeps it. Since 3.5.1 an element onlyworlds.com answers as deleted is known as deleted at once, without reading the change feed.

## Your OnlyWorlds account

Since version 3.4.0 the plugin can sign in to onlyworlds.com, so you no longer copy a key per world.

1. On onlyworlds.com, make an account token: Account settings, under Account tokens. It starts with `ow_a_`.
2. In the plugin's settings, paste it under OnlyWorlds account and choose Sign in.

Signed in, you can:

- **Download World** from a list of your worlds. The plugin makes the world its own key, named `obsidian: <your vault's name>`, so your account's keys page shows which vault holds which key.
- **Join a world with a link.** A person invite needs an account. A player link needs none, and its world is read-only in the vault.
- **Create World** directly on your account.

The token is stored in the vault's plugin data (`data.json`), which Obsidian Sync and git carry with the vault: sign out before you share a vault. Signing out revokes the token on onlyworlds.com (when it cannot, it says to revoke it there by hand) and keeps your worlds and their keys in the vault.

Your PIN is asked once per plugin session, unless you saved it in the settings. Reloading the plugin or Obsidian asks again.

## Read-only worlds

A world whose key can only read (a read key `ow_r_`, a player link, or a guest invite) is read-only in the vault. Your edits stay in your notes, and nothing is sent to onlyworlds.com. Save, Delete, Upload and Rename say so before any dialog, with no PIN prompt. Upload's and Rename's pickers list only the worlds the vault can write to, and say when they left one out. Before you join through a guest invite, its preview says the key will be a read key.
