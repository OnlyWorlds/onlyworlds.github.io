---
title: "Pin"
description: "A Pin is a special Map element."
sidebar:
  order: 16
---

<img src="/icons/pin.png" alt="" width="48" height="48" class="ow-type-icon" />

A Pin is a special Map element. Pins represent a single element on a single Map, indicating its position in that particular world view. 

Pins place elements on a map. They interact with:

- **Maps** (Pins exist on only one map at a time)
- **Elements** (Pins locate a single element on a Map)

They are distinct from:

- **Markers** (which define a Zone on a Map)

[Pin discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/pin)

The element a Pin places is the standard's one generic link, `element`, which the API carries as two keys, `element_type` and `element_id`, set together or not at all. While a Pin places nothing, `element_type` reads as an empty string.

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

Drawn with the other element types: [what Pin links to](/docs/schema/?kind=pin#what-links-to-what).

Integers are whole numbers: the API truncates a decimal, and a range is a display hint it does not enforce ([Field types](/docs/schema/fields#field-types)).

### Details

| Field | Type | Description |
|---|---|---|
| `map` | link to Map | Map that the pin is placed on |
| `element_type` | text: one of the 22 type names | The type of the linked element, any of the 22 |
| `element_id` | id of an element of that type | The id of the linked element |
| `x` | integer | x coordinate, from bottom left of the map |
| `y` | integer | y coordinate, from bottom left of the map |
| `z` | integer | z coordinate, in case of depth (optional) |
