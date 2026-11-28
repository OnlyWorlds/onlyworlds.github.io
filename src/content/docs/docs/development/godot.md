---
title: "Godot SDK"
description: "The OnlyWorlds SDK for Godot: a GDScript addon with a class for each of the 22 element types, a client for the v2 API, and world folders and .owworld files on disk."
---

The OnlyWorlds SDK for Godot is a GDScript addon that brings a world into a Godot game: read at run time over the [onlyworlds.com API](/docs/development/api-reference), or shipped with the game as a folder. It runs on the standard Godot build, with no .NET. For what a world gives a game, see [Games](/docs/development/games).

It is at its first releases (0.13.2). Before 1.0 a minor version may change a call's name, and its [changelog](https://github.com/OnlyWorlds/godot-sdk/blob/main/CHANGELOG.md) says so when it does. The repository is [OnlyWorlds/godot-sdk](https://github.com/OnlyWorlds/godot-sdk); every call, with what it answers and what it refuses, is in its [reference](https://github.com/OnlyWorlds/godot-sdk/blob/main/docs/reference.md).

## Install

Godot 4.7, the standard build. Earlier 4.x versions are untested, and so are exports other than Windows desktop, the web and mobile among them.

- **Godot's Asset Library**: [OnlyWorlds SDK](https://godotengine.org/asset-library/asset/5621), or the editor's **AssetLib** tab, searching for OnlyWorlds. Install with the installer's defaults and it lands at `addons/onlyworlds/`. The Library carries a release, so it can be a step behind the repository.
- **The release zip** (`onlyworlds-godot-0.13.2.zip`), from the repository's [Releases](https://github.com/OnlyWorlds/godot-sdk/releases) page: unpack it into your project folder, where its `addons/onlyworlds/` joins your project's `addons/`.

Then open the project in the editor once, or with no editor run `godot --headless --path . --import` once, so Godot registers the `OW…` classes. Enabling the plugin under **Project Settings → Plugins** is optional: the classes work without it.

## First run

This reads Moppetopia, a public sample world, with its demo key. No account is needed.

```gdscript
extends Node

func _ready() -> void:
	var client := OWClient.new({"api_key": "0000000001"})   # demo key: Moppetopia, read-only
	var world := await client.get_world()
	if not world.ok:
		print(world.error)   # no connection, or the server said why
		return
	print(world.value["name"])

	var found := await client.list("character", {"name_contains": "fluffington"})
	print(found.value.data[0].name)
```

Attach it to any node and run the scene. The Output panel shows `Moppetopia`, then `Admiral Fluffington`. With no editor, save the node as a scene, end `_ready` with `get_tree().quit()`, and run `godot --headless --path . res://first_run.tscn`: `--script` runs only a script that extends `SceneTree` or `MainLoop`, and this one extends `Node`. `await client.list_all("character")` pages through every Character.

## Your own world

A world's keys are on its page on [onlyworlds.com](https://www.onlyworlds.com) ([Keys and PINs](/docs/getting-started/keys)).

- A read key (`ow_r_`) reads, with no PIN. This is the key to ship in a game.
- A write key (`ow_w_`) reads and writes, and a write also sends your PIN, as `api_pin`.

```gdscript
var client := OWClient.new({"api_key": world_key, "api_pin": pin})   # ow_w_…, your PIN
var made := await client.create("character", {"name": "The Brine Cartographer"})
await client.patch("character", made.value.id, {"description": "Maps the tide lines."})
```

`patch` sends only the fields you pass, and `delete("character", id)` removes one. Every call answers a reply with `value` on success, else `error`, an `OWApiError` that says why. A write the server would refuse for its size names the limit it passed: `limit()` reads its key, and `is_element_too_large()`, `is_element_too_many_links()` and `is_extensions_too_large()` ask it directly (since 0.10.0). A body the client cannot send whole is refused before anything goes, kind `refused`: a NaN or an infinity, named with its place, and a body nested past 256 levels (since 0.10.1). So is a standard field's value of the wrong kind, which the server would store as another value, named with its field: `2.5`, `"7"` or `true` in an integer field, a number or a list in a text field, in `create`, `upsert`, `patch`, `bulk` and `propose`; an extension, a link field and a type outside the standard are not checked (since 0.10.2). An answer whose connection dropped while its body was read is kind `transport`, never a value read from half a body, and a DELETE whose answer never came is no longer reported as done (since 0.11.1).

Keep write keys out of a game you ship. A key written in a script, a scene or an exported variable is packed into the export, where anyone with the build can read it, so read write credentials at run time. An AI agent that writes to your world takes an [agent seat](/docs/development/agents) of its own.

## A world kept current

Since 0.8.0 `OWWorldCache` holds a world in the game and `OWSync` keeps it current from the world's [change feed](/docs/development/api/changes): the first call reads every element, each later one only what changed, with the server's resets, rewinds and deletes applied. The cache keeps itself between launches in one file.

```gdscript
var client := OWClient.new({"api_key": "ow_r_..."})
var world := OWWorldCache.read_file("user://world.owcache")   # empty the first time
var r := await OWSync.incremental(client, world)             # the first call walks the whole world, later ones the changes
if r.ok: world.write_file("user://world.owcache")
for c: OWCharacter in world.of_type("character"): print(c.name)
```

`read_file` answers `null` for a file of another format or a newer version. `await OWSync.has_changes(client, world)` asks with one cheap request whether a sync would do anything, so a game can poll it on a timer. The same sync runs in the [Unity SDK](/docs/development/unity), which this one ports with its tests.

## A world on disk

`OWWorld.read_folder(path)` reads a [world folder](/docs/schema/folders) and `OWWorldArchive.read_file(path)` an `.owworld` file, with no server at all, and both give the same typed elements. A world you never edited is written back byte for byte.

A pack (`OWWorldArchive.pack`, `OWWorld.pack`) is a copy: it carries every element, hidden ones included. Since 0.2.0 it leaves out who wrote each element (`created_by`, `changed_by`, `changed_via`, `changed_client`, `doors`) unless you pass `include_author_fields`. Since 0.3.0 a pack can be a share: with `include_hidden` false it leaves out every element marked hidden and every file the folder reader would not serve as an element, and both lists come back so a game can tell the player what stayed behind. `include_hidden` is true by default, a full copy as before.

## A player's link

A player link (`https://www.onlyworlds.com/join#ow_j_…`, made by a world's owner for one Character) needs no account. Redeem it once for that player's read key; the server then shows the key only what that Character may see.

```gdscript
var code := OWJoin.parse_link(pasted)           # "" when the text holds no code
var joined := await OWJoin.redeem(code)         # the code is spent: keep joined.value.key
var client := OWClient.new({"api_key": joined.value.key})
```

`OWJoin.preview(code)` says who invites, to which world, without spending the code.

## What is in it

| Part | Classes | What it does |
|---|---|---|
| **Client** | `OWClient`, `OWJoin`, `OWProposal` | The API: read a world, list and page through its elements, the change feed, writes (create, upsert, patch, delete, link edits, bulk), [proposed changes](/docs/development/api/proposals) (propose, the world's queue, accept, decline, withdraw, review a new element written as proposed; since 0.9.0; since 0.11.0 `list_proposals` and `world_proposals` take `if_none_match`, a page's `etag`, and answer `unchanged` with no rows while nothing moved), joining by invite link. Since 0.12.0 an element's [image](/docs/development/api/images) and [files](/docs/development/api/files): `upload_image` and `remove_image`, `upload_file`, `list_files`, `world_files`, `file_download_link` and `remove_file`, each upload a ticket from the API and then the bytes, a `PackedByteArray`, to the host it names; not yet tested in a web export. |
| **Held world** | `OWWorldCache`, `OWSync` | A world held in the game and kept current from the change feed, kept between launches in one file (since 0.8.0). |
| **Models** | `OWCharacter`, `OWLocation` and the rest, `OWElement` | One class per element type, generated from the schema; `OWTypes.make(type, body)` builds the right one. |
| **On disk** | `OWWorld`, `OWWorldArchive`, `OWJson`, `OWWorldExport` | World folders and `.owworld` files, read and written in the folder format's own bytes. Since 0.13.0 also the [export file](/docs/development/api/changes#the-export-file) an owner downloads from their world's page, read only: `to_world()` opens it as a folder opens, `to_cache()` as a held world that stays as the file had it. Since 0.13.1 `write_folder` and `pack` refuse, before writing anything, an element id that cannot be one file name inside the folder (empty, a `/` or `\`, a colon, a control character, `.` or `..`, or a name the archive's own checks refuse), and `OWWorld.write_refusal` says which and why. |
| **Readers** | `OWLens`, `OWGraph`, `OWLanding`, `OWMapSpace`, `OWCharter`, `OWStrand`, `OWRecord`, `OWReport`, `OWMessage`, `OWNames`, `OWViews` | Answers worked out from elements you already hold, with no request of their own: what one reader may see of a world, the world as nodes and edges, its maps as points and outlines, a Character's record of game runs, in-world messages and reports. |
| **Helpers** | `OWCalendar`, `OWAddress`, `OWOpeners`, `OWTools`, `OWId`, `OWUnicode` | A world's own calendar, `ow://` links, an Open with menu of OnlyWorlds tools, ids, name comparison. |

The 22 classes are generated from one pinned release of [schema-dist](https://github.com/OnlyWorlds/schema-dist), the standard's published form, and `OWSchemaPin` names it at run time. By the repository's own account, each reader gives the same answers as the TypeScript, Python and Unity SDKs on a shared set of test cases, and every request the client makes is checked against the API's own description of itself.
