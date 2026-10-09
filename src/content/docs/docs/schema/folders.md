---
title: World Folders
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
| `format_version` | The version of this format the folder was written against |
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

## Element Files

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
- **Account to folder**: let [Atlas](/docs/tools/atlas) download the world (a linked folder), or by script read [changes](/docs/development/api/changes) from the start until `has_more` is false and write `world.json` from `GET /api/v2/world`, renaming `time_range_current` to `time_current`.
- **Folder to account**: Atlas can take a local folder online. Or send the files to an empty world through [`/bulk`](/docs/development/api/writes#bulk), stripping `local_updated_at`, `server_updated_at`, `image_media_id`, `created_at`, `updated_at`, `created_by`, `type` and `change_seq`, and renaming `map_id` to `map`, `zone_id` to `zone`.
- **A copy to share** may drop the `api` block, which holds a key, and nothing else. It keeps its `id`. If a key was ever pushed somewhere public, revoke it in your account.
- **Archives**: one world per zip, as one top-level folder; readers also accept `world.json` at the root.

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
| `writable` | `false`. Advisory; no tool is known to honor it. |

The writer mints a fresh world id and keeps every element id; a re-capture under the same label keeps the snapshot's id. It copies `name` exactly and every `world.json` key the source had, keeps `change_seq`, `created_at`, `updated_at` and `type` as received, and writes no `.<tool>/` folder. If the change cursor moved during the walk it fails, or on an explicit override sets `snapshot_torn: true`.

## Who Reads and Writes Folders

| Tool | With folders |
| :--- | :--- |
| [Atlas](/docs/tools/atlas) | Reference implementation; stores every world as a folder. Folder mode needs a Chromium browser. Worlds sit inside `onlyworlds-atlas/<name>-<id-prefix>/`: point other tools at the world's own folder. |
| [Obsidian plugin](/docs/tools/obsidian-plugin) | Exports a world as a folder; imports a folder into notes |
| [Toolkit](/docs/development/toolkit) | Reads a folder in place of the API; parsing writes new ones |
| [Azgaar converter](https://github.com/OnlyWorlds/azgaar-converter) | Azgaar map in, as a folder |
| [Foundry converter](https://github.com/OnlyWorlds/foundry-converter) | Folder out, to Foundry VTT |

## Rules for Tools

**Reading**

- MUST read every `*.json` in a category folder and key on the inner `id`; MUST NOT parse filenames.
- MUST treat a missing category folder as empty, and MUST NOT require any `.<tool>/` folder.
- SHOULD also read `spatial/{map,pin,zone,marker}/` (older Atlas).
- Accept both spellings: `map`/`map_id`, `zone`/`zone_id`, `time_current`/`time_range_current`.
- MUST NOT rewrite a file's key spellings as a side effect of opening it.
- A tool holding several worlds MUST key storage by source and world id, never world id alone.

**Writing**

- UTF-8 without BOM, LF endings, 2-space indent, one trailing newline, keys in received order (never sorted), `1` not `1.0`.
- Write under `elements/<type>/`, never `spatial/`; SHOULD omit empty category folders.
- Two elements with the same filename: MUST use `<id>.json`, ties broken by ascending id.
- An id, once minted, MUST be kept and MUST NOT be re-derived (from a new name, say).
- MUST NOT invent data it lacks, such as timestamps, nor drop data it has.
- MUST preserve unknown fields and MUST NOT change another tool's prefixed field at any depth: copy it through byte for byte.
- `format_version` only when creating a folder. MUST NOT create or edit a `.gitignore` in a folder it did not create (in your own repo, `.*/` keeps every tool folder out).
- One writer per folder at a time; never write into another tool's `.<tool>/`.
- In a linked folder, every changed element file MUST get `local_updated_at` set to now (UTC, ISO 8601), `server_updated_at` left alone; otherwise Atlas never sends the edit. New files carry neither.
