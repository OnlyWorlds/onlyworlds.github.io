---
layout: default
title: worlds
parent: schema
nav_order: 1
---

A world is the top-level container for elements, representing a complete setting at any scope you define.

---
 

### Core

| Field         | Type          | Required | Description |
| :------------ | :------------ | :------- | :---------- |
| `id`          | string (uuid) | No (server-assigned) | Unique world identifier (UUIDv7) |
| `name`        | string        | Yes      | Display name |
| `description` | string        | No       | Text description |
| `image_url`   | string (url)  | No       | Cover image or representative visual |

### System

| Field     | Type          | Required | Description |
| :-------- | :------------ | :------- | :---------- |
| `api_key` | string        | No       | Legacy 10-character key, not issued for new worlds. Use world keys (`ow_w_` / `ow_r_`) minted in the [account portal](https://www.onlyworlds.com/account/) |
| `version` | string        | No       | onlyworlds format version (e.g., "0.30.01") |
| `user`    | string (uuid) | No       | Owner's account identifier (not exposed on the API) |

### Timeline

| Field                     | Type          | Required | Description |
| :------------------------ | :------------ | :------- | :---------- |
| `time_format_names`       | array[string] | No       | Names of each time step: ["Day", "Week", "Month", "Year"], or custom names like ["Sol", "Cycle", "Season", "Era"] |
| `time_format_equivalents` | array[integer] | No      | Basic units per step, e.g. [1, 7, 30, 365] |
| `time_basic_unit`         | string        | No       | Smallest time unit (e.g., "Day" or "Hour") |
| `time_range_min`          | integer       | No       | Earliest tracked time point |
| `time_range_max`          | integer       | No       | Latest tracked time point |
| `time_current`            | integer       | No       | Current time in your world |

---

### Timeline Examples

**Fantasy world with custom calendar:**
- `time_format_names`: ["Sun", "Tenday", "Moon", "Turning"]
- `time_basic_unit`: "Sun"
- `time_current`: 1247 (Year 1247 of the Third Age)

**Sci-fi setting with stardates:**
- `time_format_names`: ["Cycle", "Rotation", "Orbit", "Epoch"]
- `time_basic_unit`: "Cycle"
- `time_range_min`: 0
- `time_range_max`: 128256

---

Timeline fields integrate with [events](/docs/schema/element_categories/event) and [narratives](/docs/schema/element_categories/narrative).
