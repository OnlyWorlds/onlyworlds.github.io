---
title: "Title"
description: "A Title is a formal designation that confers identity, standing, or power within a world."
sidebar:
  order: 19
---

<img src="/icons/title.png" alt="" width="48" height="48" class="ow-type-icon" />

A Title is a formal designation that confers identity, standing, or power within a world. It may be granted, inherited, or assumed, and often functions within a wider system of governance, belief, or custom. Titles help structure how individuals relate to institutions, spaces, and ideas across time.

Titles define structured identity and power. They interact with:

- **Characters** (holding titles)
- **Institutions** (issuing or hosting titles)
- **Zones, Locations, Objects** (governing or representing)
- **Constructs, Laws, and Collectives** (giving them shape or purpose)

They are distinct from:

- **Traits** (which describe personal attributes)
- **Abilities** (which define actions that can physically be taken)
- **Relations** (which describe personal or emotional bonds)

[Title discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/title)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Mandate

| Field | Type | Description |
|---|---|---|
| `authority` | text | Rights or powers granted by the title |
| `eligibility` | text | Conditions or qualifications for receiving or holding the title |
| `grant_date` | integer | Date on which the title was granted, defined in world TIME units |
| `revoke_date` | integer | Date on which the title ended or was revoked, defined in world TIME units |
| `issuer` | link to Institution | Institution that formally created or granted the title |
| `body` | link to Institution | Institution in which the title functions or holds relevance |
| `superior_title` | link to Title | Another title that has authority over this one |
| `holders` | links to Character | Characters who currently hold or represent the title |
| `symbols` | links to Object | Objects that symbolize or authorize the title |

### World

| Field | Type | Description |
|---|---|---|
| `status` | text | Current state or general condition of the title |
| `history` | text | Background information on the title's origin, evolution, or significance |
| `characters` | links to Character | Characters otherwise relevant to the title |
| `institutions` | links to Institution | Institutions relevant to the title |
| `families` | links to Family | Families relevant to the title |
| `zones` | links to Zone | Zones relevant to the title |
| `locations` | links to Location | Locations relevant to the title |
| `objects` | links to Object | Objects otherwise relevant to the title |
| `constructs` | links to Construct | Constructs relevant to the title |
| `laws` | links to Law | Laws relevant to the title |
| `collectives` | links to Collective | Collectives relevant to the title |
| `creatures` | links to Creature | Creatures relevant to the title |
| `phenomena` | links to Phenomenon | Phenomena relevant to the title |
| `species` | links to Species | Species relevant to the title |
| `languages` | links to Language | Languages relevant to the title |
