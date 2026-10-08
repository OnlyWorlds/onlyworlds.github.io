---
title: "Relation"
description: "Relations are non-material and capture meaningful connections between world elements."
sidebar:
  order: 17
---

<img src="/icons/relation.png" alt="" width="48" height="48" class="ow-type-icon" />

Relations are non-material and capture meaningful connections between world elements. They track interactions, alignments, conflicts, or agreements between characters, groups, places, and other entities. 

Relations are special definitions between world elements. They interact with:

- **Characters and Institutions** (defining personal and organizational relationships)
- **Events** (arising from or recognizing a relationship)
- **Objects, Zones, Traits, and Abilities** (as things exchanged, contested, or shared)

They are distinct from:

- **Titles** (which indicate formal authority, not interpersonal context)
- **Events** (which define a point in time, not a social span)
- **Constructs** (which encode rules or structures, not associations between elements)
- **Families and Collectives** (which describe structure, not necessarily activity)

[Relation discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/relation)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Nature

| Field | Type | Description |
|---|---|---|
| `background` | text | History and origin of the relation |
| `start_date` | integer | Date when the relation began, defined in world TIME units |
| `end_date` | integer | Date when the relation ended if any, defined in world TIME units |
| `intensity` | integer | Significance of the relation, on a relative scale of 0 to 100 |
| `actor` | link to Character | Primary character defining the relation |
| `events` | links to Event | Events where the relation is involved or relevant |

### Involves

| Field | Type | Description |
|---|---|---|
| `characters` | links to Character | Characters relevant to the relation |
| `objects` | links to Object | Objects relevant to the relation |
| `locations` | links to Location | Locations relevant to the relation |
| `species` | links to Species | Species relevant to the relation |
| `creatures` | links to Creature | Creatures relevant to the relation |
| `institutions` | links to Institution | Institutions relevant to the relation |
| `traits` | links to Trait | Traits relevant to the relation |
| `collectives` | links to Collective | Collectives relevant to the relation |
| `zones` | links to Zone | Zones relevant to the relation |
| `abilities` | links to Ability | Abilities relevant to the relation |
| `phenomena` | links to Phenomenon | Phenomena relevant to the relation |
| `languages` | links to Language | Languages relevant to the relation |
| `families` | links to Family | Families relevant to the relation |
| `titles` | links to Title | Titles relevant to the relation |
| `constructs` | links to Construct | Concepts, contracts, or principles relevant to the relation |
| `narratives` | links to Narrative | Narratives relevant to the relation |
