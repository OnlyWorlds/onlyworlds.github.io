---
layout: default
title: Base Properties
parent: Elements
grand_parent: Specification
nav_order: 1
---

# Base Properties

All elements in OnlyWorlds share a common set of base properties that provide fundamental identification and classification. Individual element categories extend these base properties with their own specific fields.

---

## Required Properties

### id
- **Type:** string (uuid)
- **Description:** Unique identifier for the element in UUIDv7 format
- **Required:** Yes

### name
- **Type:** string
- **Description:** Display name of the element
- **Required:** Yes

### world
- **Type:** string (uuid)
- **Description:** UUID of the world this element belongs to
- **Required:** Yes

---

## Optional Properties

### description
- **Type:** string
- **Description:** Any text information about the element
- **Required:** No

### supertype
- **Type:** string
- **Description:** Primary classification of the element (see [Supertypes and Subtypes](../supertypes_and_subtypes.md))
- **Required:** No

### subtype
- **Type:** string
- **Description:** Secondary classification of the element (as a subset of the supertype)
- **Required:** No

### image_url
- **Type:** string (url)
- **Description:** URL to an image representing the element
- **Required:** No

 