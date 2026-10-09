---
title: "Species"
description: "A Species defines a distinct biological or cultural form of life."
sidebar:
  order: 18
---

<img src="/icons/species.png" alt="" width="48" height="48" class="ow-type-icon" />

A Species defines a distinct biological or cultural form of life. They help define how life functions or diverges across environments and histories.

Species shape physical and behavioral defaults of a world. They interact with:

- **Characters and Creatures** (defined as members of species)
- **Locations and Zones** (determining habitat and environmental interaction)
- **Traits and Constructs** (expressing shared abilities or mythic significance)

They are distinct from:

- **Characters** (individual agents with goals and identity)
- **Creatures** (instinct-driven individuals)
- **Collectives** (behavioral groups of individuals)

[Species discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/species)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Biology

| Field | Type | Description |
|---|---|---|
| `appearance` | text | Typical physical or form features of the species |
| `life_span` | integer | Average or typical life expectancy of an individual, defined in world TIME units |
| `weight` | integer | Average or typical adult weight, in the world's mass unit (World mass_unit) |
| `nourishment` | links to Species | Other species consumed as food sources |
| `reproduction` | links to Construct | Reproductive method(s) of the species |
| `adaptations` | links to Ability | Special physiological or evolutionary abilities |

### Psychology

| Field | Type | Description |
|---|---|---|
| `instincts` | text | Innate behavioral drives and survival tendencies |
| `sociality` | text | Typical patterns of social behavior |
| `temperament` | text | Overall behavioral disposition |
| `communication` | text | Typical methods and approaches of interaction |
| `aggression` | integer | General aggressiveness level, on relative scale of 0 to 100 |
| `traits` | links to Trait | Behavioral patterns associated with the species |

### World

| Field | Type | Description |
|---|---|---|
| `role` | text | The species' ecological or cultural function in the world |
| `parent_species` | link to Species | Species that the species is considered a subspecies of |
| `locations` | links to Location | Locations associated with the species or its habitat |
| `zones` | links to Zone | Zones associated with the species or its habitat |
| `affinities` | links to Phenomenon | Phenomena associated with the species or its behavior |
