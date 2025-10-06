---
layout: default
title: worlds
parent: Specification
nav_order: 1
---

A world is the top-level container for elements, representing a complete setting at any scope you define.

---

## Properties

### Core

| Field         | Type          | Required | Description |
| :------------ | :------------ | :------- | :---------- |
| `id`          | string (uuid) | Yes      | Unique world identifier (UUIDv7) |
| `name`        | string        | Yes      | Display name |
| `description` | string        | No       | Text description |
| `image_url`   | string (url)  | No       | Cover image or representative visual |

### System

| Field     | Type          | Required | Description |
| :-------- | :------------ | :------- | :---------- |
| `api_key` | string        | Yes      | Auto-generated 10-character key for API access |
| `version` | string        | Yes      | onlyworlds format version (e.g., "1.0") |
| `user`    | string (uuid) | Yes      | Owner's account identifier |

### Timeline

| Field                     | Type          | Required | Description |
| :------------------------ | :------------ | :------- | :---------- |
| `time_format_names`       | array[string] | No       | Standard units: ["Day", "Week", "Month", "Year"] |
| `time_format_equivalents` | array[string] | No       | Custom names: ["Sol", "Cycle", "Season", "Era"] |
| `time_basic_unit`         | string        | No       | Smallest time unit (e.g., "Day" or "Hour") |
| `time_range_min`          | integer       | No       | Earliest tracked time point |
| `time_range_max`          | integer       | No       | Latest tracked time point |
| `time_current`            | integer       | No       | Current time in your world |

---

## Timeline Examples

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

Timeline fields integrate with [events](/docs/specification/element_categories/event) and [narratives](/docs/specification/element_categories/narrative).
