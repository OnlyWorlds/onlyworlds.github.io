---
layout: default
title: object
parent: Elements
grand_parent: Specification
nav_order: 14
---
 
<span class="material-symbols-outlined">webhook</span>

Objects are tangible, non-living things that can be made, own, traded or destroyed. They can enable abilities, consume resources, trigger phenomena and shape stories.

---

Objects are a core material element of worlds. They interact with:

- **Characters** (who own or interact with them)
- **Traits and Abilities** (which determine who can use them and how)
- **Locations** (which define where they are stored or used)
- **Phenomena** (which they may emit, trigger, or be affected by)

They are distinct from:

- **Constructs** (which define their underlying principles or technologies)
- **Creatures and Characters** (which are animate)
- **Phenomena** (which represent ongoing effects or supernatural features)

[Object discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/object)

---
### Form
- **Aesthetics**: Appearance, design, or visual presentation of the object
- **Weight** (#): Approximate or exact mass of the object, defined by world MASS units
- **Amount** (#): The number of identical units in this object entry
- **Parent_object** (single-link: Object): Larger object that this one is part of or contained within
- **Materials** (multi-link: Construct): The phyiscal matter that constitutes the object
- **Technology** (multi-link: Construct): Mechanisms relating the object's design or operation

### Function
- **Utility**: Intended purpose or primary use of the object
- **Effects** (multi-link: Phenomenon): Phenomena potentially triggered or emitted on object use
- **Abilities** (multi-link: Ability): Abilities that the object grant or enables
- **Consumes** (multi-link: Construct): What might be used or depleted on object use

### World
- **Origins**: Background or history of the object
- **Location** (single-link: Location): Physical place where the object is currently located or stored
- **Language** (single-link: Language): Required to read, understand, or activate the object
- **Affinities** (multi-link: Trait): Traits that resonate with or enhance the object's use, function, or effects

