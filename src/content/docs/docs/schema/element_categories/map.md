---
title: "Map"
description: "A Map represents a spatial template that defines a coordinate system for placing elements within your world."
sidebar:
  order: 11
---

<img src="/icons/map.png" alt="" width="48" height="48" class="ow-type-icon" />

A Map represents a spatial template that defines a coordinate system for placing elements within your world. Maps can embody a 2D or 3D object where Pins locate individual elements and Markers collectively define Zones. They can be nested hierarchically to represent different layers of a world or location.

Maps are the spatial foundation of your world. They interact with:

- **Pins** (which place individual elements at specific coordinates)
- **Markers** (which define Zone boundaries through coordinate sets)
- **Locations** (which Maps can represent spatially)
- **Other Maps** (through hierarchical parent-child relationships)

They are distinct from:

- **Locations** (which are named places with properties and relationships)
- **Zones** (which are meaningful areas defined by Markers on a Map)

[Map discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/map)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Details

| Field | Type | Description |
|---|---|---|
| `background_color` | text | Color of the space around the map when zoomed out |
| `hierarchy` | integer | To associate or differentiate between maps with a common parent |
| `width` | integer | In pixels |
| `height` | integer | In pixels |
| `depth` | integer | In pixels |
| `parent_map` | link to Map | Map within which this map is contained |
| `location` | link to Location | Location element that this map represents |
