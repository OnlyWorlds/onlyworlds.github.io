---
layout: default
title: fields
parent: schema
nav_order: 3
has_toc: false
---

Fields define element properties. Every element shares base fields, then gains category-specific fields.

---

## Base Fields

All elements include these fields:

| Field         | Type          | Required | Description                                                            |
| :------------ | :------------ | :------- | :--------------------------------------------------------------------- |
| `id`          | string (uuid) | Yes      | Unique identifier (UUIDv7 format) |
| `name`        | string        | Yes      | Display name                                                   |
| `world`       | string (uuid) | Yes      | World this element belongs to                            |
| `description` | string        | No       | Text description                                   |
| `supertype`   | string        | No       | Primary classification |
| `subtype`     | string        | No       | Secondary classification within supertype |
| `image_url`   | string (url)  | No       | Link to representative image                              |

Category-specific fields are documented on specific [category pages](./element_categories).

---

## Data Types

| Type | Description | Example |
| :--- | :---------- | :------ |
| string | Text data, sometimes with specific formats | "The Dark Tower", UUID, URL |
| integer | Positive whole numbers | 42, 1000, 9999 |
| single link | Reference to one other element | Character's current location |
| multi link | References to multiple elements | Event's participants, location's inhabitants |

---

Elements use UUIDv7 identifiers for time-sortable unique IDs.
