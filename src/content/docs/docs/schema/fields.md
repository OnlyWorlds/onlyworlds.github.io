---
title: Fields
description: The base fields every element carries, the field types, what is required, and extension fields.
---

Every element carries the same base fields, then the fields of its own category. Category fields are listed on each category's page, for example [Character](/docs/schema/element_categories/character/).

## Base Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string (uuid) | No (server-assigned if omitted) | Unique identifier, UUIDv7 |
| `name` | string | Yes | Display name, up to 255 characters |
| `world` | string (uuid) | No (set by the API key; never sent in a body) | The world this element belongs to |
| `description` | string | No | Any kind of details about the element |
| `supertype` | string | No | The top-level category the element belongs to in its world, up to 128 characters |
| `subtype` | string | No | A further classification within the supertype, up to 128 characters |
| `image_url` | string (url) | No | Link to a representative image, up to 1024 characters |

Ids are UUIDv7 when the server mints them, which makes them time-sortable. A client may supply its own `id` on create: any RFC 4122 UUID is accepted.

Supertype and subtype are free text, so each world defines its own. [Conventions](/docs/schema/conventions/) covers how to use them.

### Server-Kept Fields

The API adds these to every element it returns. They are platform bookkeeping, not part of the standard.

| Field | Description |
| :--- | :--- |
| `type` | The element's category, as a lowercase slug (`character`), first key in every body |
| `created_at`, `updated_at` | Timestamps |
| `change_seq` | The world's change sequence at the element's last write |
| `created_by` | The world membership that created the element, or null when the world's owner did |

A write body that carries `type`, `created_at`, `updated_at` or `change_seq` is rejected with `422`. `world` and `created_by` are tolerated and ignored.

## Field Types

| Type | What it holds | On the API | Example |
| :--- | :--- | :--- | :--- |
| text | A string | `"…"`; empty is `""` | A Character's `background` |
| number | A whole number (integer); some are bounded | an integer or `null` | A Character's `height` |
| single link | One element of a named category | a uuid or `null` | A Character's `location` (a Location) |
| multi link | Any number of elements of a named category | an array of uuids; empty is `[]` | A Character's `friends` (Characters) |
| generic link | One element of any category | two fields, `element_type` and `element_id` | A Pin's `element` |
| array | A list of plain values | a JSON array | A world's `time_format_names` |

Link fields use their bare names in both directions: `location`, `friends`. There is no `_id` or `_ids` suffix on the v2 API.

**Bounded numbers.** Most numbers are open. These are bounded:

| Range | Fields |
| :--- | :--- |
| 0 to 100 | Character `charisma`, `coercion`, `competence`, `compassion`, `creativity`, `courage` · Ability `potency` · Relation `intensity` · Species `aggression` |
| -100 to 100 | Trait `charisma`, `coercion`, `competence`, `compassion`, `creativity`, `courage` |

Numbers are integers. The API truncates a decimal instead of rejecting it (`7.9` is stored as `7`), so scale values to whole units before writing.

**Units.** Dates are integers in the world's time units (see [Worlds](/docs/schema/worlds/)). Some measurements name their unit kind in the schema: a Character's `height` uses the world's length units, `weight` its mass units.

## What Is Required

On every element, only `name` is required. The API requires the field to be present on create and full replace, and accepts an empty string: Markers, which mark the boundary points of a Zone, are often unnamed.

The standard requires more on two map categories:

| Category | Required fields |
| :--- | :--- |
| [Pin](/docs/schema/element_categories/pin/) | `map`, `element`, `x`, `y` |
| [Marker](/docs/schema/element_categories/marker/) | `map`, `zone`, `x`, `y`, `order` |

Coordinates `x` and `y` are integers measured from the bottom left of the map; `z` is optional, for depth. A Marker's `order` is its position in the sequence when Markers define a polygon or line (`0` is the first point).

:::note
The API does not enforce the Pin and Marker requirements: a write needs only `name`, and `map`, `x`, `y` and the rest accept `null`.
:::

## Extension Fields

Fields whose names start with a reserved prefix are accepted on write, stored as they are, and returned verbatim:

| Prefix | For |
| :--- | :--- |
| `x_*` | The open namespace, for any tool or person |
| `atlas_*` | Atlas |
| `shadow_*` | The world folder format |

An extension field can hold any JSON value. The server does not validate, index or filter extensions. Each element can carry at most 64 KB of them, counted as compact UTF-8 JSON. A `PATCH` merges extension fields by key.

Any other unknown field is rejected with `422` naming the field, so a typo such as `freinds` fails loudly instead of being stored.

The base schema is what makes a world portable between tools. Data held in extension fields is read only by the tools that know those fields.

