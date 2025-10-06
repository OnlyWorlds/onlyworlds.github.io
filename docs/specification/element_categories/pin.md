---
layout: default
title: pin
parent: elements
grand_parent: Specification
nav_order: 16
---


<span class="material-symbols-outlined">location_pin</span>
 

A Pin is a special Map element. Pins represent a single element on a single Map, indicating its position in that particular world view. 

--- 
   
Pins are how you shape your world. They interact with:

- **Maps** (Pins exist on only one map at a time)
- **Elements** (Pins locate a single element on a Map)

They are distinct from:

- **Markers** (which define a Zone on a Map)

[Pin discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/pin)

---
### Details
- **Map** (single-link: Map): Map that the pin is placed on
- **Element**: Link to any Element (managed by ContentType + UUID)
- **X** (#): x coordinate, from bottom left of the map
- **Y** (#): y coordinate, from bottom left of the map
- **Z** (#): z coordinate, in case of depth (optional)

