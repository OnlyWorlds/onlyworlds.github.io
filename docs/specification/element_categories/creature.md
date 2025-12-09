---
layout: default
title: creature
parent: categories
grand_parent: specification
nav_order: 5
---

<span class="material-symbols-outlined">bug_report</span>

Creatures are living entities within a world that exhibit behavior and agency but lack the strategic reasoning, narrative focus, or social complexity of Characters. Their role is typically reactive over proactive, but they can still play important parts in a world's ecology, mythology, or atmosphere.

--- 
  
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

---
### Biology
- **Appearance**: Visual description of the creature
- **Weight** (#): Approximate or exact weight of the creature, using world MASS units
- **Height** (#): Approximate height of the creature, using the world's defined LENGTH units
- **Species** (multi-link: Species): Species this creature belongs to

### Behavior
- **Habits**: Typical behaviors, instincts, or recurring actions the creature tends to display
- **Demeanor**: The emotional tone or attitude the creature conveys through posture, expression, or aggression
- **Traits** (multi-link: Trait): Traits that influence the creature's behavior, capabilities, or appearance
- **Abilities** (multi-link: Ability): Innate or learned abilities the creature can perform or activate
- **Languages** (multi-link: Language): Languages the creature can understand, speak, or otherwise use to communicate

### World
- **Status**: Current situation or classification of the creature
- **Birth_date** (#): The time of the creature's birth, recorded in the world's defined TIME unit
- **Location** (single-link: Location): Specific location where the creature is currently found or most associated with
- **Zone** (single-link: Zone): Larger area or region commonly inhabited or currently claimed by the creature

### Ttrpg
- **Challenge_rating** (#): Difficulty or threat level of the creature in a gameplay context
- **Hit_points** (#): Total health or durability value in combat
- **Armor_class** (#): Defense rating against physical attacks or effects
- **Speed** (#): Typical movement speed, measured in the world's DISTANCE unit per round
- **Actions** (multi-link: Ability): Combat or tactical abilities the creature can perform or use

