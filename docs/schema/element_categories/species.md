---
layout: default
title: species
parent: categories
grand_parent: schema
nav_order: 18
---

<span class="material-symbols-outlined">crib</span>

Species defines a distinct biological or cultural form of life. They help define how life functions or diverges across environments and histories.

--- 
  
Species shape physical and behavioral defaults of a world. They interact with:

- **Characters and Creatures** (defined as members of species)
- **Locations and Zones** (determining habitat and environmental interaction)
- **Traits and Constructs** (expressing shared abilities or mythic significance)

They are distinct from:

- **Characters** (individual agents with goals and identity)
- **Creatures** (instinct-driven individuals)
- **Collectives** (behavioral groups of individuals)

[Species discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/species)

---
### Biology
- **Appearance**: Typical physical or form features of the species
- **Life_span** (#): Average or typical life expectancy of an individual, defined in world TIME units
- **Weight** (#): Average or typical adult weight, defined in world MASS units
- **Nourishment** (multi-link: Species): Other species consumed as food sources
- **Reproduction** (multi-link: Construct): Reproductive method(s) of the species
- **Adaptations** (multi-link: Ability): Special physiological or evolutionary abilities

### Psychology
- **Instincts**: Innate behavioral drives and survival tendencies
- **Sociality**: Typical patterns of social behavior
- **Temperament**: Overall behavioral disposition
- **Communication**: Typical methods and approaches of interaction
- **Aggression** (# max:100): General aggressiveness level, on relative scale of 0 to 100
- **Traits** (multi-link: Trait): Behavioral patterns associated with the species

### World
- **Role**: The species' ecological or cultural function in the world
- **Parent_species** (single-link: Species): Species that the species is considered a subspecies of
- **Locations** (multi-link: Location): Locations associated with the species or its habitat
- **Zones** (multi-link: Zone): Zones associated with the species or its habitat
- **Affinities** (multi-link: Phenomenon): Phenomena associated with the species or its behavior

