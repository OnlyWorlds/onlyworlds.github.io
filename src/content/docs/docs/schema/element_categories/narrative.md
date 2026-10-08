---
title: "Narrative"
description: "Narratives represent stories told in your world, and can involve the organization or reinterpretation of Events."
sidebar:
  order: 13
---

<img src="/icons/narrative.png" alt="" width="48" height="48" class="ow-type-icon" />

Narratives represent stories told in your world, and can involve the organization or reinterpretation of Events.  

Narratives are how stories are expressed in a world. They interact with:

- **Events** (the actual happenings they group or reinterpret)
- **Characters, Institutions, and Families** (as storytellers or subjects)
- **Objects, Constructs, and Laws** (as story elements or consequences)
- **Titles, Relations, and Collectives** (as sources of tension or resolution)

They are distinct from:

- **Events** (which record what happened without particular subjectivity)
- **Constructs** (which express abstract ideas but not narrative form)
- **Relations** (which may exist inside a story, but don't organize one)

[Narrative discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/narrative)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Context

| Field | Type | Description |
|---|---|---|
| `story` | text | Content of the narrative, as told or remembered |
| `consequences` | text | Outcomes or legacy of the narrative |
| `start_date` | integer | Date when the narrative begins, measured in world TIME units |
| `end_date` | integer | Date when the narrative ends, measured in world TIME units |
| `order` | integer | Position of this narrative within a parent narrative's sequence |
| `parent_narrative` | link to Narrative | Larger narrative that this narrative takes place in |
| `protagonist` | link to Character | Primary character of the narrative |
| `antagonist` | link to Character | Opposing character of the narrative |
| `narrator` | link to Character | Character credited with telling or recording the narrative |
| `conservator` | link to Institution | Institution that preserves or curates the narrative |

### Involves

| Field | Type | Description |
|---|---|---|
| `events` | links to Event | Events relevant to the narrative |
| `characters` | links to Character | Characters relevant to the narrative |
| `objects` | links to Object | Objects relevant to the narrative |
| `locations` | links to Location | Locations relevant to the narrative |
| `species` | links to Species | Species relevant to the narrative |
| `creatures` | links to Creature | Creatures relevant to the narrative |
| `institutions` | links to Institution | Institutions relevant to the narrative |
| `traits` | links to Trait | Traits relevant to the narrative |
| `collectives` | links to Collective | Groups relevant to the narrative |
| `zones` | links to Zone | Zones relevant to the narrative |
| `abilities` | links to Ability | Abilities relevant to the narrative |
| `phenomena` | links to Phenomenon | Phenomena relevant to the narrative |
| `languages` | links to Language | Languages relevant to the narrative |
| `families` | links to Family | Families relevant to the narrative |
| `relations` | links to Relation | Relationships relevant to the narrative |
| `titles` | links to Title | Titles relevant to the narrative |
| `constructs` | links to Construct | Constructs relevant to the narrative |
| `laws` | links to Law | Laws relevant to the narrative |
