---
title: "Pin"
description: "A Pin is a special Map element."
sidebar:
  order: 16
---

<img src="/icons/pin.png" alt="" width="48" height="48" class="ow-type-icon" />

A Pin is a special Map element. Pins represent a single element on a single Map, indicating its position in that particular world view. 

Pins are how you shape your world. They interact with:

- **Maps** (Pins exist on only one map at a time)
- **Elements** (Pins locate a single element on a Map)

They are distinct from:

- **Markers** (which define a Zone on a Map)

[Pin discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/pin)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Details

| Field | Type | Description |
|---|---|---|
| `map` (required) | link to Map | Map that the pin is placed on |
| `element` (required) | link to any element | Link to any Element (managed by ContentType + UUID) |
| `x` (required) | integer | x coordinate, from bottom left of the map |
| `y` (required) | integer | y coordinate, from bottom left of the map |
| `z` | integer | z coordinate, in case of depth (optional) |
