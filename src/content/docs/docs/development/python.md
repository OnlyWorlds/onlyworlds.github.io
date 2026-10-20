---
title: Python Package
description: "The onlyworlds Python package: the world folder format and a client for the v2 API. On PyPI."
---

`onlyworlds` is the Python package for OnlyWorlds. It reads and writes the world folder format, pushes a folder's changes to a world, and has a client for the REST API v2. It needs Python 3.12 or later and has no runtime dependencies.

The element types and the kind of every field are generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist), never listed by hand. The package's version is its own and does not track the schema's.

## Install

```bash
pip install onlyworlds
```

Releases are on PyPI, each listed in the [changelog](https://github.com/OnlyWorlds/python-sdk/blob/main/CHANGELOG.md). Until 1.0, the interface can still change between minor versions.

## Read a world

```python
from onlyworlds import Client

client = Client("0000000001")  # the public demo key for Moppetopia; your own world's ow_r_ key works the same, no PIN
for character in client.iter_elements("character"):
    print(character["name"])
```

This runs as written. A write key also takes a PIN: `Client(key, pin)`. The PIN is a 4-digit number (1000 to 9999) set on your account in account settings, and it guards writes to every world you own. A member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as the PIN.

Elements are plain dicts. Two demo keys read public sample worlds: `0000000000` (Hyperion) and `0000000001` (Moppetopia).

## Write

```python
import os
from onlyworlds import Client

# the write key and its PIN from the environment (OW_API_KEY, OW_API_PIN), never in the code
writer = Client(os.environ["OW_API_KEY"], os.environ["OW_API_PIN"])

ranger = writer.create("character", {"name": "Ilse the Ranger"})
peak = writer.create("location", {"name": "Dragon Peak"})
writer.patch("location", peak["id"], {"supertype": "Mountain"})

# add or remove links on a multi-link field without replacing the list
writer.edit_links("location", peak["id"], "founders", add=[ranger["id"]])
```

`create` gives an element without an `id` one, and always sends an `Idempotency-Key`. So retrying a create after a lost answer is safe: it replays the stored result instead of making a second element. `patch` replaces every field it sends, and a list replaces the whole list. Use `edit_links` to add or remove links. `bulk` takes up to about 1,000 `{"type", "element"}` items: it succeeds partly by default (check each slot's `status`), or all or nothing with `atomic=True`.

If your script is an AI agent, say so: `Client("ow_w_...", "1234", agent=True)` (since 0.3.0) sends `X-OW-Agent` on its element writes, and OnlyWorlds records your writes as agent-made. A tool people use leaves it off. Each element read carries `changed_by` and `changed_via`, the last write's member and door (`seat`, `mcp` and `declared` are agent-made). See [Agents](/docs/development/agents).

## Follow changes

```python
walk = client.walk_changes(saved_cursor)  # None for everything
for op in walk:
    ...  # op["op"] is "upsert" or "delete"
saved_cursor = walk.cursor  # opaque: persist it, never parse it
```

A delete's `op["reason"]` is `deleted`, or `hidden` for an element [hidden](/docs/development/api/hidden#the-feed) from the key: remove it from your copy either way. If the feed refuses a cursor (`is_resync_required` on the error), walk again from the start and keep what your copy holds that the new walk does not name. The error's `resync_reason` says which: `"role"` (your own role or membership moved), keep it; `"view"` (something left your view), drop it. A tool never empties a copy on its own ([What a Reset Keeps](/docs/development/api/changes#what-a-reset-keeps)). See [Sync with Changes](/docs/development/api/changes).

## Export to OKF

Since 0.6.0 a world folder can be exported as a valid [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format) (OKF) 0.2 bundle, as that spec stands at one pinned commit (`onlyworlds.okf.OKF_COMMIT`). It needs the `okf` extra, which adds PyYAML; the rest of the package stays dependency-free.

```bash
pip install "onlyworlds[okf]"
python -m onlyworlds.okf my-world my-world-okf
```

Each element becomes one markdown file: its fields and links in the frontmatter, its text under headings, its links again as markdown links (in-prose `ow://` references included). The World becomes `world.md` (without its `api` block), and there is an index per type and one for the bundle. The same folder always gives the same bytes, and anything left out is listed in the report (on stderr from the command line). A bundle is a copy to read elsewhere, never a folder to sync: it carries no `change_seq`, no record of who wrote what, and not the world's key.

## What it covers

- **World folders**: `read_folder` and `write_folder` implement the folder format (v0.3.10, `FORMAT_VERSION`) and pass its shared conformance fixture. Since 0.9.0 a [known-of](/docs/schema/folders#known-of-elements) stub is written with its kept keys only, flagged on read (`folder.known_of`, `is_known_of`), never pushed (`PushPlan.known_of` lists it), and refused by the client's writes before anything is sent. The reader never changes a folder. It skips a file that is not JSON, not an object or has no `id`, and since 0.5.1 a dot-prefixed file in a type folder (a tool's litter, not an element); `folder.skipped` lists each with the reason. An element found in both the current `elements/` layout and Atlas's older `spatial/` one is served from `elements/`, and `folder.in_both_layouts` lists it (since 0.5.0).
- **Push**: `plan_push` and `push` compare a folder with a baseline and PATCH only the fields that changed. A rerun skips what already landed.
- **Client**: `health`, `get_world`, `patch_world`, `list_page`, `iter_elements`, `get`, `create`, `upsert`, `patch`, `delete`, `edit_links`, `bulk`, `changes` and `walk_changes`. `create` and `bulk` always send an `Idempotency-Key`, so a retry after a lost answer is safe: it never creates an element twice. A retry that meets the first request still running (409 `idempotency_in_flight`) waits and tries again until the stored answer replays (since 0.4.0).
- **Errors**: `ApiError` carries the envelope's `code`, `param` and `doc_url`, with flags such as `is_id_conflict`, `is_not_author`, `is_resync_required`, `is_idempotency_in_flight` and `is_validation_error`. Pass `if_match=el["change_seq"]` to `patch` or `edit_links` to write only if nobody changed the element since you read it (since 0.2.0); if it moved, `PreconditionFailed` carries `current`, the element as it is now. See [Only if unchanged](/docs/development/api/writes#only-if-unchanged).
- **Export**: `export_world` (an account world to a folder; since 0.7.0 its `world.json` says where it came from and which part of the world it is, `source` and `exported_as`, read from `/me`), and `onlyworlds.okf.export_okf` (a folder to an OKF bundle, since 0.6.0).

Not yet: typed element models, the account routes, `me()` and `members()` (the TypeScript SDK has both), and the snapshot writer.

## Links

- [Source and README](https://github.com/OnlyWorlds/python-sdk)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)
