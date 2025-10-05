---
layout: default
title: marker
parent: Elements
grand_parent: Specification
nav_order: 12
---
 
<span class="material-symbols-outlined">brush</span>

A Marker is a special Map element. Groups of Markers, each at a specific coordinate, together designate a Zone in the world.

--- 
   
Markers are for painting the Zones of your world. They interact with:

- **Maps** (Markers exist on only one map at a time)
- **Zones** (A mininum of three Markers together defines one Zone)

They are distinct from:

- **Pins** (which locate an element at a specific coordinate on a Map)

[Marker discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/marker)

---
### Details
- **Map** (single-link: Map): Map this marker is placed on
- **Zone** (single-link: Zone): Zone that is defined by this marker
- **X** (#): x coordinate, from bottom left of the map
- **Y** (#): y coordinate, from bottom left of the map
- **Z** (#): z coordinate, in case of depth

