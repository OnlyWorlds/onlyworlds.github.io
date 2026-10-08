---
title: "Marker"
description: "A Marker is a special Map element."
sidebar:
  order: 12
---

<img src="/icons/marker.png" alt="" width="48" height="48" class="ow-type-icon" />

A Marker is a special Map element. Groups of Markers, each at a specific coordinate, together designate a Zone in the world. Zones can be either lines or polygons (through supertype).

Markers are for painting the Zones of your world. They interact with:

- **Maps** (Markers exist on only one map at a time)
- **Zones** (A minimum of three Markers together defines one Zone)

They are distinct from:

- **Pins** (which locate an element at a specific coordinate on a Map)

[Marker discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/marker)

:::note
The API does not enforce the fields marked required below: a write needs only `name`. See [What Is Required](/docs/schema/fields#what-is-required).
:::

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Details

| Field | Type | Description |
|---|---|---|
| `map` (required) | link to Map | Map this marker is placed on |
| `zone` (required) | link to Zone | Zone that is defined by this marker |
| `x` (required) | integer | x coordinate, from bottom left of the map |
| `y` (required) | integer | y coordinate, from bottom left of the map |
| `z` | integer | z coordinate, in case of depth |
| `order` (required) | integer | Sequence position when markers define a polygon or line (0 = first point) |
