---
layout: default
title: zone
parent: Elements
grand_parent: Specification
nav_order: 21
---

<span class="material-symbols-outlined">architecture</span>

Zones represent abstract or meaningful areas within the world that hold significance due to cultural, political, environmental, or narrative reasons. They are not defined by geometry themselves but gain spatial presence through linked map markers. Zones can be used to track boundaries, effects, or jurisdictions that extend beyond a single location.

--- 
  
Zones are spatial definitions within a world. They interact with:

- **Maps** (that a zone exists on)
- **Institutions** (which define or claim zones)
- **Creatures** (that dominate or traverse them)
- **Phenomena** (that enrich or transform the area)
- **Titles** (for roles tied to management or protection)

They are distinct from:

- **Locations** (which are specific places of interest or activity)
- **Markers** (which define the geometry of a zone on a map)

[Zone discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/zone)

---
### Scope
- **Role**: The operational function or intent of the zone
- **Start_date** (#): Date when the zone becomes extant or relevant, defined in world TIME units
- **End_date** (#): Date when the zone ceases to be meaningful or enforced, defined in world TIME units
- **Phenomena** (multi-link: Phenomenon): Phenomena that affect, define, or occur within the zone
- **Linked_zones** (multi-link: Zone): Other zones that are associated with the zone

### World
- **Context**: Historical and key knowledge about the zone
- **Populations** (multi-link: Collective): Distinct collective groups or communities residing within the zone
- **Titles** (multi-link: Title): Titles assigned to represent, manage, or protect the zone
- **Principles** (multi-link: Construct): Influential mechanics acted within, upon, or by the zone

