---
layout: default
title: map
parent: elements
grand_parent: specification
nav_order: 11
---

<span class="material-symbols-outlined">map</span>

A Map represents a spatial template that defines a coordinate system for placing elements within your world. Maps can embody a 2D or 3D object where Pins locate individual elements and Markers collectively define Zones. They can be nested hierarchically to represent different layers of a world or location.

---

Maps are the spatial foundation of your world. They interact with:

- **Pins** (which place individual elements at specific coordinates)
- **Markers** (which define Zone boundaries through coordinate sets)
- **Locations** (which Maps can represent spatially)
- **Other Maps** (through hierarchical parent-child relationships)

They are distinct from:

- **Locations** (which are named places with properties and relationships)
- **Zones** (which are meaningful areas defined by Markers on a Map)

[Map discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/map)

---
### Details
- **Background_color**: Color of the space around the map when zoomed out
- **Hierarchy** (#): To associate or differentiate between maps with a common parent
- **Width** (#): In pixels
- **Height** (#): In pixels
- **Depth** (#): In pixels
- **Parent_map** (single-link: Map): Map within which this map is contained
- **Location** (single-link: Location): Location element that this map represents

