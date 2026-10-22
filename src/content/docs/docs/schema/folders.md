---
title: World folders
description: The folder format a world can live in on disk, and the rules a tool follows to read and write one.
---

A world folder is one OnlyWorlds world stored as plain JSON files: one file for the world, one per element. A text editor opens it, a copy backs it up, and any tool reads it with no account, key or network. Under git, each commit is a point in the world's history and a branch is a what-if; element ids stay the same on every branch.

## Layout

```text
moppetopia/
  world.json                 the world
  elements/
    character/
      admiral-fluffington--295f8866.json
    location/
    ...                      one folder per category present, lowercase singular
  media/                     optional; its format is not yet specified
  .atlas/                    a tool's private state; never needed to read the world
```

A folder holds one world. All 22 categories, `map`, `pin`, `zone` and `marker` included, live under `elements/<type>/`. A missing category folder means no elements of that category.

The `id` inside a file is the element's identity. The filename is for people: rename a file and nothing breaks. The recommended name is `<slug>--<tail>.json`. The slug is the name in lowercase ASCII, each run of other characters as one hyphen, cut to 40 characters, any trailing hyphen removed. The tail is the id's last 8 characters. An element with no usable name gets `<id>.json`.

## world.json

Two keys are required: `id` (a non-empty string) and `name` (a string, which may be empty). The rest are optional.

| Key | Holds |
| :--- | :--- |
| `description`, `image_url`, timeline fields, `length_unit`, `mass_unit`, `distance_unit` | As on [Worlds](/docs/schema/worlds). The unit keys have the same spelling on disk and on the wire. The current time is `time_current` on disk, the standard's name; the API calls it `time_range_current`. |
| `format_version` | The version of this format the folder was written against, currently `"0.3.14"`. Written only when the folder is created. |
| `producer` | Which tool made the folder and from what: `{"tool", "version", "input"}`. `tool` is the name the tool publishes under (`@onlyworlds/sdk`, `onlyworlds`, `atlas`, `keel`, `ow-folder-store`, or a converter's repository name); `input` is one word from a closed list: `server` (an export from onlyworlds.com), `bare` (a world born empty in a tool), `azgaar-map`, `worldanvil-export`, `foundry-world`, `obsidian-vault`, `text` (a parse from prose or notes), `json` (loose JSON of unknown origin). Written once, by the writer that makes the folder; a tool that copies, snapshots or rewrites a folder keeps the line as it found it and never invents one. Absent is the honest value for a hand-made folder or one made before this row. A reader never refuses a folder on an `input` word it does not know. Since v0.3.14 (2026-10-22). |
| `source` | Where the folder came from: `{"server", "world", "at"}`, the server's address, the world's id there and when it was exported. Written by a tool that exports from a server; absent on a folder made by hand. |
| `exported_as` | Which part of the world this is: `{"kind", "role", "character"}`, with `kind` `owner` (the whole world), `member` (a co-builder's or contributor's view), `character` (what one Character knows, with its `{id, name}`) or `public`. A tool that cannot tell writes none. A tool that pushes refuses to push a `character` or `public` folder as the whole world. |
| `api` | The link to a world on onlyworlds.com (`world_id`, `api_key`). Present: the folder syncs with it. Absent: a local world. |
| `snapshot_*`, `writable` | Only on a [snapshot](#snapshots) |

```json
{
  "id": "0695db52-5433-7332-8000-db7fe10da375",
  "name": "Moppetopia",
  "time_basic_unit": "Year",
  "time_range_min": 0,
  "time_range_max": 500,
  "time_current": 500
}
```

## Element files

An element file must hold a non-empty string `id`. The rest are the category's [fields](/docs/schema/fields), link fields under bare names holding an id or a list of ids, as in the API. Trimmed:

```json
{
  "id": "0695db83-afd7-76ee-8000-00f4295f8866",
  "name": "Admiral Fluffington",
  "location": "0695db83-972a-74da-8000-262f1559a7f1",
  "rivals": ["0695db83-b69a-772b-8000-557e9ba0dcc3"]
}
```

A reader fills in `type` from the folder name unless the file declares one. A file without an `id` is skipped and left as it is. Tools may add their own fields under a prefix (`atlas_*`, `x_*`). An element named in prose is `[Label](ow://<type>/<id>)`. Map coordinates run from the bottom left, y upward.

## Folders and onlyworlds.com

- **Linked**: a folder with an `api` block is that account world on disk. To find the server's world, read `api.world_id` first and fall back to `id` (older folders can differ).
- **Account to folder**: let [Atlas](/docs/tools/atlas) download the world (a linked folder), export it with the Python package's `export_world` or the Unity SDK's `OWFolderExport`, or by script read [changes](/docs/development/api/changes) from the start until `has_more` is false and write `world.json` from `GET /api/v2/world`, renaming `time_range_current` to `time_current`.
- **Folder to account**: Atlas can take a local folder online. Or send the files to an empty world through [`/bulk`](/docs/development/api/writes#bulk), stripping `local_updated_at`, `server_updated_at`, `image_media_id`, `created_at`, `updated_at`, `created_by`, `type` and `change_seq`, and renaming `map_id` to `map`, `zone_id` to `zone`.
- **A copy to share** may drop the `api` block, which holds a key, and nothing else. It keeps its `id`. If a key was ever pushed somewhere public, revoke it in your account.
- **Archives** (`.owworld`, the spec's §4.7, ruled 2026-10-22 on a 78-case conformance set that ships in [schema-dist](https://github.com/OnlyWorlds/schema-dist) from serial 39 at `fixtures/owworld/`: the zips, `verdicts.json`, the generator and `CaseFolding-15.1.0.txt`; a changed verdict is a new serial, never a moved tag): one world per zip, as one top-level folder; readers also accept `world.json` at the root, ignore files beside the folder, never require the `mimetype` marker (`application/vnd.onlyworlds.world+zip`, first and stored, which writers should place) and refuse one with other bytes; every reader accepts 500,000 entries and 2 GiB; a writer gives the same bytes for the same world (entries in code point order, stamped 1980-01-01); names are strict, duplicates and case-fold collisions, links, encryption and other compression methods refuse. The [TypeScript SDK](/docs/development/typescript#world-files) follows it from 4.49.0 and the [Unity SDK](/docs/development/unity#ship-a-world-with-your-game) from v0.11.0, each at 78 of 78 on the set; the [Python package](/docs/development/python) reads and writes it from 0.17.0, 80 of 80 on the set as it stands in serial 41, and the directory it writes matches the TypeScript writer's.

## Snapshots

A snapshot is a frozen copy of a world at one moment, such as a chapter's end.

| Key | Holds |
| :--- | :--- |
| `snapshot_of` | The source world's id |
| `snapshot_label` | A label, such as `"ch05"` |
| `snapshot_at` | Capture time (ISO 8601) |
| `snapshot_change_seq` | The source's change cursor at capture |
| `snapshot_counts` | Optional: files written per category. A receipt; the files are the truth. |
| `snapshot_torn` | `true` only on a capture known to be inconsistent |
| `writable` | `false`. Advisory: a tool may still write. The Unity SDK opens such a folder read-only and refuses to sync into it. |

The writer mints a fresh world id and keeps every element id; a re-capture under the same label keeps the snapshot's id. It copies `name` exactly and every `world.json` key the source had, keeps `change_seq`, `created_at`, `updated_at` and `type` as received, and writes no `.<tool>/` folder. If the change cursor moved during the walk it fails, or on an explicit override sets `snapshot_torn: true`.

## Who reads and writes folders

| Tool | With folders |
| :--- | :--- |
| [Atlas](/docs/tools/atlas) | Reference implementation; stores every world as a folder. Folder mode needs a Chromium browser. Worlds sit inside `onlyworlds-atlas/<name>-<id-prefix>/`: point other tools at the world's own folder. |
| [Obsidian plugin](/docs/tools/obsidian-plugin) | Exports a world as a folder; imports a folder into notes |
| [Toolkit](/docs/development/toolkit) | Reads a folder in place of the API; parsing writes new ones |
| [Python package](/docs/development/python) | Reads and writes folders (`read_folder`, `write_folder`); `export_world` writes an account world as a folder; exports a folder to an OKF bundle |
| [Unity SDK](/docs/development/unity) | Reads a folder, or a whole folder zipped as one `.owworld` file, into a world cache; writes elements, and exports an account world as a folder |
| [Azgaar converter](https://github.com/OnlyWorlds/azgaar-converter) | Azgaar map in, as a folder |
| [Foundry converter](https://github.com/OnlyWorlds/foundry-converter) | Folder out, to Foundry VTT |

### Known-of elements

A guest's or player's export can hold elements its Character only [knows of](/docs/development/api/members#known-of): stubs marked `known_of: true`. A stub on disk keeps `known_of`, the keys a stub always keeps (`id`, `type`, `name`, `description`, `supertype`, `subtype`, `image_url`, `created_at`, `updated_at`, `change_seq`) and every other field it was served with a value, such as a Character's public fields; its unset fields are left out, never written as empty values. A reader treats such a file as known of, never whole: a missing field is unknown, not empty. A writer never pushes it. When the element later arrives whole, it is written whole and `known_of` goes. The other way round, a whole element arriving as a stub (the reader lost a grant) follows the reset that brought it: after a `view` reset the stub replaces the whole copy, since what the reader may see narrowed; after a `role` reset, or with no reset at all (a folder handed over, another server), a tool that merges into an existing folder keeps the whole copy as last known. keel's own feed always narrows a view with a `view` reset ([What a reset keeps](/docs/development/api/changes#what-a-reset-keeps)).

## Rules for tools

**Reading**

- MUST read every `*.json` in a category folder and key on the inner `id`; MUST NOT parse filenames. SHOULD skip a dot-prefixed file there: it is a tool's litter, not an element.
- MUST treat a missing category folder as empty, and MUST NOT require any `.<tool>/` folder.
- SHOULD also read `spatial/{map,pin,zone,marker}/` (older Atlas). An id found in both layouts: serve the `elements/` copy, and SHOULD log the duplicate.
- Accept both spellings: `map`/`map_id`, `zone`/`zone_id`, `time_current`/`time_range_current`.
- MUST NOT rewrite a file's key spellings as a side effect of opening it.
- A tool holding several worlds MUST key storage by source and world id, never world id alone.

**Writing**

- UTF-8 without BOM, LF endings, 2-space indent, one trailing newline, keys in received order (never sorted), `1` not `1.0`.
- Write new elements under `elements/<type>/`, never `spatial/`; an element read from a file is written back to that file, so one id never sits in both layouts. SHOULD omit empty category folders.
- Two elements with the same filename: the later ones (by ascending id) MUST use the full id, `<slug>--<id>.json`.
- An id, once minted, MUST be kept and MUST NOT be re-derived (from a new name, say).
- MUST NOT invent data it lacks, such as timestamps, nor drop data it has. A [known-of](#known-of-elements) stub is written with its kept keys and served values only, and never pushed.
- MUST preserve unknown fields and MUST NOT change another tool's prefixed field at any depth: copy it through byte for byte.
- `format_version` only when creating a folder. MUST NOT create or edit a `.gitignore` in a folder it did not create (in your own repo, `.*/` keeps every tool folder out).
- One writer per folder at a time; never write into another tool's `.<tool>/`.
- In a linked folder, every changed element file MUST get `local_updated_at` set to now (UTC, ISO 8601), `server_updated_at` left alone; otherwise Atlas never sends the edit. New files carry neither.

**Checking a folder**

[schema-dist](https://github.com/OnlyWorlds/schema-dist) has a checker: `python walk/lint_folder.py path/to/world`. It names every key that is not a field of its type, every link that does not resolve or points at the wrong type, and every value of the wrong shape. Server keys, the folder's own keys and prefixed fields pass. Its last line is the count it checked, and it exits 1 when it finds a problem. A link to an element the folder does not hold (a partial download, say) is reported, and is true. It also reports a `world.json` that carries an `api` block while git tracks it: a linked folder is never committed (§4.6 d), so a world kept in a shared repository is the portable copy and the key stays outside it.
