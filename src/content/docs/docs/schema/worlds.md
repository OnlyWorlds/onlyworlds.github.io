---
title: Worlds
description: The world container, its fields, and how it configures a world's timeline.
---

A world is the top-level container for elements, representing a complete setting at any scope you define. Every element belongs to exactly one world, and a world key reads or writes exactly one world.

## Core

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string (uuid) | No (server-assigned) | Unique world identifier (UUIDv7) |
| `name` | string | Yes | Display name; it cannot be empty |
| `description` | string | No | Text description |
| `image_url` | string (url) | No | Cover image or representative visual |

## Timeline

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `time_format_names` | array of strings | No | Names of each time step: `["Day", "Week", "Month", "Year"]`, or custom names like `["Sol", "Cycle", "Season", "Era"]` |
| `time_format_equivalents` | array of strings | No | Basic units per step, e.g. `["1", "7", "30", "365"]` |
| `time_basic_unit` | string | No | Smallest time unit (e.g. `"Day"` or `"Hour"`) |
| `time_range_min` | integer | No | Earliest tracked time point |
| `time_range_max` | integer | No | Latest tracked time point |
| `time_range_current` | integer | No | Current time in your world. The standard's YAML names this field `time_current`. |

Element fields that hold a moment, such as a Character's `birth_date` or an Event's `start_date`, are integers in the world's time units.

### Timeline Examples

**Fantasy world with a custom calendar:**
- `time_format_names`: `["Sun", "Tenday", "Moon", "Turning"]`
- `time_basic_unit`: `"Sun"`
- `time_range_current`: `1247` (year 1247 of the Third Age)

**Science fiction setting with stardates:**
- `time_format_names`: `["Cycle", "Rotation", "Orbit", "Epoch"]`
- `time_basic_unit`: `"Cycle"`
- `time_range_min`: `0`
- `time_range_max`: `128256`

Timeline fields work with [Events](/docs/schema/element_categories/event) and [Narratives](/docs/schema/element_categories/narrative).

## Platform Fields

onlyworlds.com adds fields of its own to the world it serves. They are part of the platform, not the standard.

| Field | Type | Description |
| :--- | :--- | :--- |
| `public_read` | boolean | Whether the world is open to read |
| `owner_character` | string (uuid) or null | The owner's own Character in this world ("this Character is me"), or null |
| `created_at` | string (date-time) | When the world was created |
| `updated_at` | string (date-time) | When the world last changed |

The world named by a key is `GET /api/v2/world/`. Only the world's owner can change it, with `PATCH`; the writable fields are `name`, `description`, `image_url`, the timeline fields and `owner_character`.

## Legacy and Account Fields

The standard also defines these. The v2 API does not return them.

| Field | Type | Description |
| :--- | :--- | :--- |
| `api_key` | string | Legacy 10-character key, not issued for new worlds. Use world keys (`ow_w_` / `ow_r_`) minted in the [account portal](https://www.onlyworlds.com/account/). |
| `version` | string | The OnlyWorlds format version the world conforms to |
| `user` | string (uuid) | Owner's account identifier (not exposed on the API) |

