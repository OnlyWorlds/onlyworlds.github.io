---
layout: default
title: worlds
parent: Specification
nav_order: 1
---

# Worlds

A world is the top-level container for any number of elements. Worlds can (at this time) not be nested with other worlds: a single world should represent a complete setting.

---

## Core Properties

| Field         | Type          | Required | Description |
| :------------ | :------------ | :------- | :---------- |
| `id`          | string (uuid) | Yes      | Unique world identifier (UUIDv7) |
| `name`        | string        | Yes      | Display name of your world |
| `description` | string        | No       | Overview or summary of your world |
| `image_url`   | string (url)  | No       | Cover image or representative visual |

---

## System Properties
 
| Field     | Type          | Required | Description |
| :-------- | :------------ | :------- | :---------- |
| `api_key` | string        | Yes      | auto-generated 10-character key for API access |
| `version` | string        | Yes      | OnlyWorlds format version (e.g., "1.0") |
| `user`    | string (uuid) | Yes      | Owner's account identifier |

---

## Timeline System

| Field                     | Type          | Required | Description |
| :------------------------ | :------------ | :------- | :---------- |
| `time_format_names`       | array[string] | No       | Standard units: ["Day", "Week", "Month", "Year"] |
| `time_format_equivalents` | array[string] | No       | Your custom names: ["Sol", "Cycle", "Season", "Era"] |
| `time_basic_unit`         | string        | No       | Smallest time unit (e.g., "Day" or "Hour") |
| `time_range_min`          | integer       | No       | Earliest tracked time point |
| `time_range_max`          | integer       | No       | Latest tracked time point |
| `time_current`            | integer       | No       | Current time in your world |

### Timeline Examples

**Fantasy world with custom calendar:**
- `time_format_equivalents`: ["Sun", "Tenday", "Moon", "Turning"]
- `time_basic_unit`: "Sun"
- `time_current`: 1247 (Year 1247 of the Third Age)

**Sci-fi setting with stardates:**
- `time_format_equivalents`: ["Cycle", "Rotation", "Orbit", "Epoch"]
- `time_basic_unit`: "Cycle"
- `time_range_min`: 0
- `time_range_max`: 128256

---

 