---
layout: default
title: Fields
parent: Specification
nav_order: 3
has_toc: false
---

# Fields

Fields define the essential properties of elements. Every element starts with the same base fields, then gains additional fields specific to its category.

---

## Field Types

### Base Fields

Every element, regardless of category, includes these essential fields:

| Field         | Type          | Required | Description                                                            |
| :------------ | :------------ | :------- | :--------------------------------------------------------------------- |
| `id`          | string (uuid) | Yes      | Unique identifier (UUIDv7 format) |
| `name`        | string        | Yes      | Display name of the element                                                   |
| `world`       | string (uuid) | Yes      | World this element belongs to                            |
| `description` | string        | No       | Free-form text about the element                                   |
| `supertype`   | string        | No       | Primary classification (see [Types](./types.md)) |
| `subtype`     | string        | No       | Secondary classification within the supertype |
| `image_url`   | string (url)  | No       | Link to a representative image                              |

### Category-Specific Fields

Each element category extends these base fields with its own specialized properties. For example:
- **Characters** gain fields like `titles`, `abilities`, and `relations`
- **Locations** add `coordinates`, `zones`, and `contained objects`
- **Events** include `time_start`, `time_end`, and `participants`

See individual [element pages](./element_categories/) for complete field listings.

---

## Data Types

Fields use one of four data types:

| Type | Description | Example |
| :--- | :---------- | :------ |
| **string** | Text data, sometimes with specific formats | "The Dark Tower", UUID, URL |
| **integer** | Positive whole numbers (may have limits) | 42, 1000, 9999 |
| **single link** | Reference to exactly one other element | Character's current location |
| **multi link** | References to multiple other elements | Event's participants, Location's inhabitants |

---

## Usage Notes

- Required fields must be provided when creating an element
- Optional fields can be added later as your world develops
- Link fields create the relationships that connect your world
- Field names use lowercase with underscores (e.g., `time_start`)