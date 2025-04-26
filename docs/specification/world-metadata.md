---
layout: default
title: World Metadata
parent: Specification
nav_order: 1
---

# World Metadata

The `World` object defines the top-level container for all elements and settings within a specific OnlyWorlds instance. It holds essential metadata about the world itself.

## Fields

| Field                     | Type           | Required | Description                                                                                                |
| :------------------------ | :------------- | :------- | :--------------------------------------------------------------------------------------------------------- |
| `id`                      | string (uuid)  | Yes      | Unique identifier for the world (uuidv7 format). Read-only.                                                |
| `name`                    | string         | Yes      | Name of the world.                                                                                         |
| `description`             | string         | No       | Detailed description of the world.                                                                         |
| `image_url`               | string (url)   | No       | URL to an image representing the world.                                                                    |
| `api_key`                 | string         | Yes      | Unique API key (10 chars) for external access. (Uniqueness enforced by application).                        |
| `version`                 | string         | Yes      | The version of the OnlyWorlds data format this world conforms to. (e.g., "0.20.10")                          |
| `user`                    | string (uuid)  | Yes      | UUID of the user who owns this world.                                                                      |
| `time_format_equivalents` | array[integer] | No       | List of integers for time units (e.g., `[1, 7, 30, 365]` for Day, Week, Month, Year if base unit is Day).   |
| `time_format_names`       | array[string]  | No       | List of names for time units (e.g., `["Day", "Week", "Month", "Year"]`).                                |
| `time_basic_unit`         | string         | No       | The fundamental unit of time measurement (e.g., "Year", "Day"). Default: "Year".                          |
| `time_range_min`          | integer        | No       | The earliest point in time tracked in the world's timeline. Default: 0.                                    |
| `time_range_max`          | integer        | No       | The latest point in time tracked in the world's timeline. Default: 100.                                   |
| `time_current`            | integer        | No       | The current point in time within the world's timeline. Default: 0.                                       |

*(Based on schema version 0.20.10)*

