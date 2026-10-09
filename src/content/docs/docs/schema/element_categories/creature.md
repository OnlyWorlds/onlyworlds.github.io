---
title: "Creature"
description: "Creatures are living entities within a world that exhibit behavior and agency but lack the strategic reasoning, narrative focus, or social complexity of Characters."
sidebar:
  order: 5
---

<img src="/icons/creature.png" alt="" width="48" height="48" class="ow-type-icon" />

Creatures are living entities within a world that exhibit behavior and agency but lack the strategic reasoning, narrative focus, or social complexity of Characters. Their role is typically reactive over proactive, but they can still play important parts in a world's ecology, mythology, or atmosphere.

Creatures help populate the world with living presence. They interact with:

- **Species** (defining their biological origin or variation)
- **Traits and Abilities** (for what they can do or how they can act)
- **Locations and Zones** (the spaces they inhabit)
- **Characters and Institutions** (as caretakers, enemies, or breeders)

They are distinct from:

- **Characters** (who possess intent, narrative relevance, and structured goals)
- **Objects** (which are inanimate)
- **Phenomena** (which are forces or occurrences, not beings)

[Creature discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/creature)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Biology

| Field | Type | Description |
|---|---|---|
| `appearance` | text | Visual description of the creature |
| `weight` | integer | Approximate or exact weight of the creature, in the world's mass unit (World mass_unit) |
| `height` | integer | Approximate height of the creature, in the world's length unit (World length_unit) |
| `species` | links to Species | Species this creature belongs to |

### Behavior

| Field | Type | Description |
|---|---|---|
| `habits` | text | Typical behaviors, instincts, or recurring actions the creature tends to display |
| `demeanor` | text | The emotional tone or attitude the creature conveys through posture, expression, or aggression |
| `traits` | links to Trait | Traits that influence the creature's behavior, capabilities, or appearance |
| `abilities` | links to Ability | Innate or learned abilities the creature can perform or activate |
| `languages` | links to Language | Languages the creature can understand, speak, or otherwise use to communicate |

### World

| Field | Type | Description |
|---|---|---|
| `status` | text | Current situation or classification of the creature |
| `birth_date` | integer | The time of the creature's birth, recorded in the world's defined TIME unit |
| `location` | link to Location | Specific location where the creature is currently found or most associated with |
| `zone` | link to Zone | Larger area or region commonly inhabited or currently claimed by the creature |

### TTRPG

| Field | Type | Description |
|---|---|---|
| `challenge_rating` | integer | Difficulty or threat level of the creature in a gameplay context |
| `hit_points` | integer | Total health or durability value in combat |
| `armor_class` | integer | Defense rating against physical attacks or effects |
| `speed` | integer | Typical movement speed, in the world's distance unit (World distance_unit) per round |
| `actions` | links to Ability | Combat or tactical abilities the creature can perform or use |
