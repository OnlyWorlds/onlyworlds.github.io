---
layout: default
title: Relation
parent: Elements
grand_parent: Specification
nav_order: 17
---

<span class="material-symbols-outlined">link</span>

Relations are non-material and capture meaningful connections between world elements. They track interactions, alignments, conflicts, or agreements between characters, groups, places, and other entities. 

--- 
  
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

---
### Nature
- **Background**: History and origin of the relation
- **Start_date** (#): Date when the relation began, defined in world TIME units
- **End_date** (#): Date when the relation ended if any, defined in world TIME units
- **Intensity** (# max:100): Significance of the relation, on a relative scale of 0 to 100
- **Actor** (single-link: Character): Primary character defining the relation
- **Events** (multi-link: Event): Events where the relation is involved or relevant

### Involves
- **Characters** (multi-link: Character): Characters relevant to the relation
- **Objects** (multi-link: Object): Objects relevant to the relation
- **Locations** (multi-link: Location): Locations relevant to the relation
- **Species** (multi-link: Species): Species relevant to the relation
- **Creatures** (multi-link: Creature): Creatures relevant to the relation
- **Institutions** (multi-link: Institution): Institutions relevant to the relation
- **Traits** (multi-link: Trait): Traits relevant to the relation
- **Collectives** (multi-link: Collective): Collectives relevant to the relation
- **Zones** (multi-link: Zone): Zones relevant to the relation
- **Abilities** (multi-link: Ability): Abilities relevant to the relation
- **Phenomena** (multi-link: Phenomenon): Phenomena relevant to the relation
- **Languages** (multi-link: Language): Languages relevant to the relation
- **Families** (multi-link: Family): Families relevant to the relation
- **Titles** (multi-link: Title): Titles relevant to the relation
- **Constructs** (multi-link: Construct): Concepts, contracts, or principles relevant to the relation
- **Events** (multi-link: Event): Events relevant to the relation
- **Narratives** (multi-link: Narrative): Narratives relevant to the relation

