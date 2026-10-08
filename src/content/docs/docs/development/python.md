---
title: Python Package
description: "The onlyworlds Python package: the world folder format and a client for the v2 API. A pre-release, installed from GitHub."
---

:::caution[Pre-release]
The package is not on PyPI yet. Install it from GitHub, and expect the interface to change before the first release.
:::

`onlyworlds` is the Python package for OnlyWorlds. It reads and writes the world folder format, pushes a folder's changes to a world, and has a client for the REST API v2. It needs Python 3.12 or later and has no runtime dependencies.

The 22 element types and the kind of every field are generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist), never listed by hand. The package's version is its own and does not track the schema's.

## Install

```bash
pip install "git+https://github.com/OnlyWorlds/python-sdk"
```

The `onlyworlds` package on TestPyPI is an older, unrelated package for the v1 API.

## Read a world

```python
from onlyworlds import Client

client = Client("ow_r_...")  # a read key needs no PIN
for character in client.iter_elements("character"):
    print(character["name"])
```

A write key also takes a PIN: `Client(key, pin)`. The PIN is a 4-digit number (1000 to 9999) set on your account in account settings, and it guards writes to every world you own. A member writes with their own account PIN, and an agent seat sends its seat secret (`ow_s_…`) as the PIN.

Elements are plain dicts. Two demo keys read public sample worlds: `0000000000` (Hyperion) and `0000000001` (Moppetopia).

## Write

```python
writer = Client("ow_w_...", "1234")  # a write key and its PIN

peak = writer.create("location", {"name": "Dragon Peak"})
writer.patch("location", peak["id"], {"supertype": "Mountain"})

# add or remove links on a multi-link field without replacing the list
writer.edit_links("location", peak["id"], "founders", add=[character_id])
```

`create` gives an element without an `id` one, and always sends an `Idempotency-Key`. So retrying a create after a lost answer is safe: it replays the stored result instead of making a second element. `patch` replaces every field it sends, and a list replaces the whole list. Use `edit_links` to add or remove links. `bulk` takes up to about 1,000 `{"type", "element"}` items: it succeeds partly by default (check each slot's `status`), or all or nothing with `atomic=True`.

## Follow changes

```python
walk = client.walk_changes(saved_cursor)  # None for everything
for op in walk:
    ...  # op["op"] is "upsert" or "delete"
saved_cursor = walk.cursor  # opaque: persist it, never parse it
```

If the feed refuses a cursor (`is_resync_required` on the error), walk again from the start and replace the local copy. See [Sync with Changes](/docs/development/api/changes).

## What it covers

- **World folders**: `read_folder` and `write_folder` implement the folder format and pass its shared conformance fixture. The reader never changes a folder.
- **Push**: `plan_push` and `push` compare a folder with a baseline and PATCH only the fields that changed. A rerun skips what already landed.
- **Client**: `get_world`, `patch_world`, `list_page`, `iter_elements`, `get`, `create`, `upsert`, `patch`, `delete`, `edit_links`, `bulk`, `changes` and `walk_changes`. `create` and `bulk` always send an `Idempotency-Key`, so a retry after a lost answer is safe: it never creates an element twice.
- **Errors**: `ApiError` carries the envelope's `code`, `param` and `doc_url`, with flags such as `is_id_conflict`, `is_not_author`, `is_resync_required` and `is_validation_error`.
- **Export**: `export_world`.

Not yet: typed element models, the account routes and the snapshot writer.

## Links

- [Source and README](https://github.com/OnlyWorlds/python-sdk)
- [Interactive API reference](https://www.onlyworlds.com/api/docs)
