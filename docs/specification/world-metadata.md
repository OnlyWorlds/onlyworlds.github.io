---
layout: default
title: World Metadata
parent: Specification
nav_order: 1
---

Each OnlyWorld has metadata that exists outside of that world's elements. This includes user ownership properties and some timeline settings.

 

| Field                     | Type           | Required | Description                                                                                                |
| :------------------------ | :------------- | :------- | :--------------------------------------------------------------------------------------------------------- |
| `id`                      | string (uuid)  | Yes      | Unique identifier for the world (uuidv7 format)                                               |
| `name`                    | string         | Yes      | Name of the world                                                                                         |
| `description`             | string         | No       | Any textual information about the world                                                                         |
| `image_url`               | string (url)   | No       | URL to an image that is relevant to the world                                                                    |
| `api_key`                 | string         | Yes      | Unique API key (10 digit) for sharing the world across applications                        |
| `version`                 | string         | Yes      | The specific version of the OnlyWorlds data format the world conforms to                           |
| `user`                    | string (uuid)  | Yes      | UUID of the user who owns the world on onlyworlds.com                                                                      |
| `time_format_names`       | array[string]  | No       | List of default names for time units ["Day", "Week", "Month", "Year"].             
| `time_format_equivalents` | array[string] | No        | List of world-specific custom names mapped to these time units     |                   |
| `time_basic_unit`         | string         | No       | The fundamental unit of time measurement                          |
| `time_range_min`          | integer        | No       | The earliest point in time tracked in the world's timeline                                     |
| `time_range_max`          | integer        | No       | The latest point in time tracked in the world's timeline                                 |
| `time_current`            | integer        | No       | The current point in time within the world's timeline                                 |

 

