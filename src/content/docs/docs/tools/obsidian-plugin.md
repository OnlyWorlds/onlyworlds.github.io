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
- **Local-only worlds.** Build a world entirely in your vault, no account needed.
- **Optional sync.** Connect a world to onlyworlds.com, or take a local-only world online later.
- **Your account.** Sign in once, and Download world lists your onlyworlds.com worlds. Join a world with a link, or create one on your account (see [Your OnlyWorlds account](#your-onlyworlds-account)).
- **World units.** `World.md` holds the world's length, mass and distance units, free text such as `cm` or `leagues`. The nine numbers that use them show the unit beside the value, as in `182 cm`; nothing converts. Download, upload, copy and folder export carry them. Change them in `World.md` and Upload world sends them; only the world's owner can change them.
- **A Bases file per world.** Download world, **Join a world with a link** and Create world write `<World name>.base` beside `World.md`: an all-elements table, and a table and a card view for each element type, in Obsidian's core Bases plugin (Obsidian 1.9 or later). On by default, in the settings. Once you change it, the plugin leaves it alone; **Write Bases file** rebuilds it and keeps yours as `<World name> (your copy).base`. With Obsidian Sync or another sync tool, let an edited base reach every device before you download on another.
- **Relationships on a canvas.** **Draw relationships on a canvas** draws the active element, what it links to and what links to it as an Obsidian canvas beside its note, each arrow labelled with its field. A canvas you changed is saved as `(your copy)` before a redraw.
- **World folder import and export.** Read and write OnlyWorlds world folders, which open directly in [Atlas](/docs/tools/atlas). Since 3.8.1 a save never undoes another writer's change: the plugin remembers which version of each element a note was last downloaded or saved at (`.ow-seq.json` beside `World.md`, never in a note or an export) and sends it as `If-Match`, so a note pulled before someone else's change is refused with one notice and the edit stays in the note (Download brings the current copy); a note with no recorded version saves once without the check and says so; a downloaded world's export carries `exported_as` from the key's own `/me`. The export claims folder format 0.3.15 since 3.10.0 (it writes no `records/`, so no private record can travel). Since 3.8.0 a downloaded world's export keeps the server's world id, every world setting and the `source` and `producer` lines, so Atlas opens it as the same world; a nameless element's note is named by its type and the last eight characters of its id, so none is lost to a name shared with another.
- **Plain type folders.** Since 3.9.0 a note lives at `Elements/<Type>/<Name>.md`, such as `Elements/Location/Vallaki.md`, with no count in the folder name, so creating, pasting or deleting a note renames no folder and Sync, git and links hold still. The first Download world after updating renames each old `<Type> (N)` folder once, through Obsidian, and names the folders it renamed. Links by note name keep working; links written with a folder path follow Obsidian's setting for updating links. When a note's name is already taken in the plain folder, nothing in that folder moves and the notice names the note. Update every device that shares a vault: a device still on 3.8.1 counts the folders again and undoes the rename for the others.
- **The server's Properties.** Since 3.10.0 every note downloaded from onlyworlds.com carries seven Properties the server keeps, after its own fields: `created_at`, `updated_at`, `change_seq` (the element's change number), `created_by`, `changed_by`, `changed_via` and `changed_client` (the door and the tool of the last change; see [Reads](/docs/development/api/reads#what-an-element-carries)). They are read-only: a save never sends them, editing one changes nothing on onlyworlds.com, and after each save the plugin rewrites them from the server's answer, so the note and the folder export show the server's values. One the server leaves empty, such as `changed_by` after the owner's own edit, is left out.
- **Commands.** World operations are available in the Obsidian command palette.

## Setup

1. Install Obsidian (desktop or mobile).
2. Enable community plugins in Obsidian settings.
3. Search for "OnlyWorlds Builder" in the plugin browser, or open the [plugin's listing](https://community.obsidian.md/plugins/onlyworlds-builder).
4. Install the OnlyWorlds Builder plugin.
5. Create or import worlds with the OnlyWorlds commands.
6. Send edits to onlyworlds.com with Save element (the active note) or Upload world (the whole world), or write the world as a folder with Export as OnlyWorlds folder.

A world on onlyworlds.com keeps its API key in its `World.md`, in plain text: the plugin reads it there to sync that world. A vault that is itself shared or synced somewhere public carries the key with it; use a read key (`ow_r_`) for such a vault, or keep the vault private.

## Sync

**Save element** sends the active note's changed fields. **Auto-sync** (off by default) does the same a few seconds after you stop typing, but only for edits typed in Obsidian, so run **Upload world** after another tool such as Atlas writes your notes. Upload world creates and updates, never deletes. **Download world** fetches what changed and rewrites each changed note from the server's copy, so unsaved local edits in that note are replaced. Without signing in, Download world takes a world's API key and your PIN; a read key (`ow_r_`) needs no PIN.

Only notes inside a world's `Elements` folders are elements. A link to a `[[Name]]` that matches no note in the vault is not sent, so the server keeps its copy of that field.

When Save element changes an element's name, its note is renamed to match, and links to it update as Obsidian's **Files and links** setting says. Auto-sync never renames: since 3.5.1 the note keeps its old file name and says so, and the next Save element renames it, also after a restart. Turn renaming off with the **Rename note when the element's name changes** setting (on by default, since 3.5.0).

A Zone's `shape` (`polygon` or `line`) is a `### Shape` section like every text field, sent when the note has it (since 3.10.0). Text fields round-trip byte for byte (since 3.5.1). In a note, a line that starts with `### ` starts a new field, so a value's own `###` line, or a code fence line such as `~~~`, gains one backslash in the note (`\###`, `\~~~`) and loses it again on the way back to onlyworlds.com. Write `\###` yourself for a line that should read `###`. Inside a closed code block nothing changes. A save is refused only when a code fence left open would swallow the next heading; the notice names the field and the heading.

## Hidden and known-of elements

An element the world's owner hides from you, or one that leaves your view, keeps its note, but its fields are emptied from it. Anything outside them (text above the first field, sections that are not fields) stays, under the line "Hidden by the world's owner.", and Save element and Upload world leave the note out. If the owner shows it to you again, the next Download writes the fields back and keeps what you wrote above them. To keep your own notes through a hide, write them above the first field: text under a field's heading is part of that field (since 3.6.0).

A player or guest may know of an element without seeing all of it: your Character's sheet names it, and nothing else of yours reaches it ([Known of](/docs/development/api/members#known-of)). Download writes its note with `known_of: true` in its Properties, only the fields you know, and the line "Known of: you know of this element, not all of it. A field not shown here is unknown, not empty." Such a note is never sent: Save element and auto-sync say so, Upload world counts it apart, Delete element moves the note to the trash without deleting anything on onlyworlds.com, and Manage fields leaves it as it is (since 3.7.0).

What you write above its first field, or under a `###` heading of your own, stays through later downloads, and so do Properties of your own. Its fields follow the server, and a field the server no longer shows you leaves the note. When you come to see the whole element, the next Download writes it in full and the mark goes; from then on what you added is part of its note, and Save element sends it.

## Saving linked notes

Since version 3.5.0, **Save element** on a note that links to notes not yet on onlyworlds.com lists them and asks first, then creates them together with the note. It creates at most 50 this way; past that it creates and saves nothing and points you to Upload world. Auto-sync never creates them.

An element deleted on onlyworlds.com is never brought back without your word, even though Download keeps its note. Save element asks "create it again?", auto-sync refuses, and Upload world asks once for all of them. A link to a deleted element is left out of what is sent and named, and the note keeps it. Since 3.5.1 an element onlyworlds.com answers as deleted is known as deleted at once, without reading the change feed.

## Your OnlyWorlds account

Since version 3.4.0 the plugin can sign in to onlyworlds.com, so you no longer copy a key per world.

1. On onlyworlds.com, make an account token: Account settings, under Account tokens. It starts with `ow_a_`.
2. In the plugin's settings, paste it under OnlyWorlds account and choose Sign in.

Signed in, you can:

- **Download world** from a list of your worlds. The plugin makes the world its own key, named `obsidian: <your vault's name>`, so your account's keys page shows which vault holds which key.
- **Join a world with a link.** A person invite needs an account. A player link needs none, and its world is read-only in the vault.
- **Create world** directly on your account.

The token is stored in the vault's plugin data (`data.json`), which Obsidian Sync and git carry with the vault: sign out before you share a vault. Signing out revokes the token on onlyworlds.com (when it cannot, it says to revoke it there by hand) and keeps your worlds and their keys in the vault.

Your PIN is asked once per plugin session, unless you saved it in the settings. Reloading the plugin or Obsidian asks again. Closing the PIN prompt with Escape, or by clicking outside it, cancels the save with "Save cancelled: PIN not provided." (since 3.10.0; before, the save waited until Obsidian reloaded).

## Read-only worlds

A world whose key can only read (a read key `ow_r_`, a player link, or a guest invite) is read-only in the vault. Your edits stay in your notes, and nothing is sent to onlyworlds.com. Save, Delete, Upload and Rename say so before any dialog, with no PIN prompt. Upload's and Rename's pickers list only the worlds the vault can write to, and say when they left one out. Before you join through a guest invite, its preview says the key will be a read key.
