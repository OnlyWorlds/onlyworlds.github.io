---
layout: default
title: World metadata
parent: Specification
nav_order: 3
---

# World metadata

World metadata defines the container that holds all your elements. It includes essential information about ownership, versioning, and time systems that exist outside of individual elements.

---

## Core Properties

These fields identify and describe your world:

| Field         | Type          | Required | Description |
| :------------ | :------------ | :------- | :---------- |
| `id`          | string (uuid) | Yes      | Unique world identifier (UUIDv7) |
| `name`        | string        | Yes      | Display name of your world |
| `description` | string        | No       | Overview or summary of your world |
| `image_url`   | string (url)  | No       | Cover image or representative visual |

---

## System Properties

These fields manage technical aspects:

| Field     | Type          | Required | Description |
| :-------- | :------------ | :------- | :---------- |
| `api_key` | string        | Yes      | 10-character key for API access |
| `version` | string        | Yes      | OnlyWorlds format version (e.g., "1.0") |
| `user`    | string (uuid) | Yes      | Owner's account identifier |

---

## Timeline System

Optional fields for worlds with custom time tracking:

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
- `time_range_max`: 9999

---

## Usage Notes

- The `api_key` allows tools to access your world data
- Timeline fields work together - use all or none
- Custom time names map directly to standard units
- Time values are integers counting from your chosen starting point