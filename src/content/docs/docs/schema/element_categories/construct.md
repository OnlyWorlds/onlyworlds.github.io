---
title: "Construct"
description: "Constructs are abstract or conceptual structures that exist within a world and can have causal, symbolic, or systemic roles."
sidebar:
  order: 4
---

<img src="/icons/construct.png" alt="" width="48" height="48" class="ow-type-icon" />

Constructs are abstract or conceptual structures that exist within a world and can have causal, symbolic, or systemic roles. They are non-physical, non-character entities that help explain or organize how the world works. Constructs shape cultures, behaviors, and institutions by providing internal logic or justification for how things work. They are not universal truths, but frameworks that are made, sustained and lost over time.

Constructs describe structured ideas or systems that the world acknowledges or operates through. They interact with:

- **Characters** (who invent, oppose, or live by them)
- **Institutions** (that organize, enforce, or exploit them)
- **Objects and Abilities** (which might manifest or otherwise relate to them)
- **Languages, Titles, and Traits** (to carry or symbolize them)

They are distinct from:

- **Laws** (which are more externalized, often enforceable by rule)
- **Phenomena** (which are observed and natural rather than believed or structured)
- **Narratives** (which explain or contain constructs)

[Construct discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/construct)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Nature

| Field | Type | Description |
|---|---|---|
| `rationale` | text | The internal reasoning, structure, or justification of how the construct functions or makes sense within the world |
| `history` | text | The historical development or ideation of the construct, and its place in wider historical contexts |
| `status` | text | The present condition or operational status of the construct |
| `reach` | text | The geographic, cultural, or political extent of the construct's influence |
| `start_date` | integer | The point in time when the construct began or was first established (uses world's TIME definition) |
| `end_date` | integer | The point in time when the construct ceased to function or lost its meaning |
| `founder` | link to Character | Character who conceived or initiated the construct |
| `custodian` | link to Institution | Institution maintaining, enforcing, or exploiting the construct |

### Involves

| Field | Type | Description |
|---|---|---|
| `characters` | links to Character | Characters relevant to the construct |
| `objects` | links to Object | Objects relevant to the construct |
| `locations` | links to Location | Locations relevant to the construct |
| `species` | links to Species | Species relevant to the construct |
| `creatures` | links to Creature | Creatures relevant to the construct |
| `institutions` | links to Institution | Institutions relevant to the construct |
| `traits` | links to Trait | Traits relevant to the construct |
| `collectives` | links to Collective | Collectives relevant to the construct |
| `zones` | links to Zone | Zones relevant to the construct |
| `abilities` | links to Ability | Abilities relevant to the construct |
| `phenomena` | links to Phenomenon | Phenomena relevant to the construct |
| `languages` | links to Language | Languages relevant to the construct |
| `families` | links to Family | Families relevant to the construct |
| `relations` | links to Relation | Relations relevant to the construct |
| `titles` | links to Title | Titles relevant to the construct |
| `constructs` | links to Construct | Other constructs relevant to the construct |
| `events` | links to Event | Events relevant to the construct |
| `narratives` | links to Narrative | Narratives relevant to the construct |
