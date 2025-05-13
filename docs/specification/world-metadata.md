---
layout: default
title: World Metadata
parent: Specification
nav_order: 1
---

# World Metadata

Each OnlyWorld has a 'world' table that contains essential information about the world: ownership properties and some time settings (that are likely to be extricated from this table into a dedicated system later).

## Fields

| Field                     | Type           | Required | Description                                                                                                |
| :------------------------ | :------------- | :------- | :--------------------------------------------------------------------------------------------------------- |
| `id`                      | string (uuid)  | Yes      | Unique identifier for the world (uuidv7 format). Read-only.                                                |
| `name`                    | string         | Yes      | Name of the world.                                                                                         |
| `description`             | string         | No       | Detailed description of the world.                                                                         |
| `image_url`               | string (url)   | No       | URL to an image representing the world.                                                                    |
| `api_key`                 | string         | Yes      | Unique API key (10 chars) for external access. (Uniqueness enforced by application).                        |
| `version`                 | string         | Yes      | The version of the OnlyWorlds data format this world conforms to. (e.g., "0.20.10")                          |
| `user`                    | string (uuid)  | Yes      | UUID of the user who owns it on onlyworlds.com world.                                                                      |
| `time_format_names`       | array[string]  | No       | List of names for time units ["Day", "Week", "Month", "Year").             
| `time_format_equivalents` | array[string] | No        | List of custom names mapped to these time units     |                   |
| `time_basic_unit`         | string         | No       | The fundamental unit of time measurement (e.g., "Year", "Day"). Default: "Year".                          |
| `time_range_min`          | integer        | No       | The earliest point in time tracked in the world's timeline. Default: 0.                                    |
| `time_range_max`          | integer        | No       | The latest point in time tracked in the world's timeline. Default: 100.                                   |
| `time_current`            | integer        | No       | The current point in time within the world's timeline. Default: 0.                                       |

*(Based on schema version 0.20.10)*

