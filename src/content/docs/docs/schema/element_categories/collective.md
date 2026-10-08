---
title: "Collective"
description: "A Collective is a group of individuals that acts as a unit but lacks formal governance or hierarchical structure."
sidebar:
  order: 3
---

<img src="/icons/collective.png" alt="" width="48" height="48" class="ow-type-icon" />

A Collective is a group of individuals that acts as a unit but lacks formal governance or hierarchical structure. Collectives range from spontaneous mobs to herds of animals, and are unified by shared traits, contexts, or purpose. 

A Collective is a loosely organized group defined by common identity or circumstance, not by structure or command. They interact with:

- **Characters and Creatures** (who form their body)
- **Species** (defining their biological foundation(s))
- **Constructs and Abilities** (shaping what they do and believe)
- **Institutions** (which may organize or employ them)
- **Phenomena** (that bind or affect them)

They are distinct from:

- **Institutions** (which govern, plan, and wield power)
- **Families** (which define genetic or cultural lineage)

[Collective discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/collective)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Formation

| Field | Type | Description |
|---|---|---|
| `composition` | text | Internal structure or demographic makeup of the collective |
| `count` | integer | Number of members in the collective (approximate or exact) |
| `formation_date` | integer | Date the collective was formed, using world TIME units |
| `operator` | link to Institution | Institution that manages or directs the collective |
| `equipment` | links to Object | Tools or gear in possession of and/or regularly used by the collective |

### Dynamics

| Field | Type | Description |
|---|---|---|
| `activity` | text | Primary behaviors or actions the collective engages in |
| `disposition` | text | Emotional control or volatility expressed by the collective |
| `state` | text | Current condition or operational status of the collective |
| `abilities` | links to Ability | Abilities commonly shared among members of the collective, or abilities of that collective as a whole |
| `symbolism` | links to Construct | Cultural expressions, rituals, or symbols that unify or distinguish the collective |

### World

| Field | Type | Description |
|---|---|---|
| `species` | links to Species | Species that compose or participate in the collective |
| `characters` | links to Character | Characters who are members of the collective |
| `creatures` | links to Creature | Creatures associated with or included in the collective |
| `phenomena` | links to Phenomenon | Phenomena that influence or characterize the collective |
