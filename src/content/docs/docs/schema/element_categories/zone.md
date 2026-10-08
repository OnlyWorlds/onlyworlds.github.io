---
title: "Zone"
description: "Zones represent abstract or meaningful areas within the world that hold significance due to cultural, political, environmental, or narrative reasons."
sidebar:
  order: 21
---

<img src="/icons/zone.png" alt="" width="48" height="48" class="ow-type-icon" />

Zones represent abstract or meaningful areas within the world that hold significance due to cultural, political, environmental, or narrative reasons. They are not defined by geometry themselves but gain spatial presence through linked map markers. Zones can be used to track boundaries, effects, or jurisdictions that extend beyond a single location.

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

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Scope

| Field | Type | Description |
|---|---|---|
| `role` | text | The operational function or intent of the zone |
| `start_date` | integer | Date when the zone becomes extant or relevant, defined in world TIME units |
| `end_date` | integer | Date when the zone ceases to be meaningful or enforced, defined in world TIME units |
| `phenomena` | links to Phenomenon | Phenomena that affect, define, or occur within the zone |
| `linked_zones` | links to Zone | Other zones that are associated with the zone |

### World

| Field | Type | Description |
|---|---|---|
| `context` | text | Historical and key knowledge about the zone |
| `populations` | links to Collective | Distinct collective groups or communities residing within the zone |
| `titles` | links to Title | Titles assigned to represent, manage, or protect the zone |
| `principles` | links to Construct | Influential mechanics acted within, upon, or by the zone |
