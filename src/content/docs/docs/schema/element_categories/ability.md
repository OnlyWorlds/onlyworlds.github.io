---
title: "Ability"
description: "An Ability represents something an entity in the world can do: a defined action, power, skill, or effect that can change the world or its perception."
sidebar:
  order: 1
---

<img src="/icons/ability.png" alt="" width="48" height="48" class="ow-type-icon" />

An Ability represents something an entity in the world can do: a defined action, power, skill, or effect that can change the world or its perception. Abilities are performable and traceable: they have causes, consequences, and conditions. They can be passive traits, active powers, or conditional techniques. 

An Ability is a performable effect or power. They interact with:

- **Characters and Creatures** (as actors who employ them)  
- **Traits** (which may grant or enhance them)  
- **Objects and Constructs** (that might enable or constrain them)  
- **Phenomena** (which may result from or trigger them)  
- **Institutions** (which can teach or restrict them)  

They are distinct from:

- **Traits** (which describe qualities, not actions)   
- **Events** (which describe outcomes or occurrences, not repeatable powers)   

[Ability discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/ability)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Mechanics

| Field | Type | Description |
|---|---|---|
| `activation` | text | Method or conditions under which the ability is activated |
| `duration` | integer | Length of time the ability remains active or its effects persist, measured in TIME units |
| `potency` | integer | Relative measure of the ability's inherent potency or force, used for scaling or comparison purposes |
| `range` | integer | Effective reach or distance at which the ability can be used, measured in DISTANCE units |
| `effects` | links to Phenomenon | Phenomena that result from the ability's use, such as environmental changes or sensory effects |
| `challenges` | text | Describes specific difficulties or constraints that make the ability hard to master or use effectively |
| `talents` | links to Trait | Traits that naturally enhance or improve performance with this ability |
| `requisites` | links to Construct | Constructs that must be satisfied for the ability to be used, such as rituals, permissions, or required roles |

### World

| Field | Type | Description |
|---|---|---|
| `prevalence` | text | How widely the ability is known or practiced, and potential clues to its origins and cultural diffusion |
| `tradition` | link to Construct | A construct that expresses the conceptual, social, or institutional system this ability operates within |
| `source` | link to Phenomenon | The phenomenon that serves as the enabling force or condition that allows this ability to function |
| `locus` | link to Location | Location where the ability is most strongly rooted, developed, or traditionally practiced |
| `instruments` | links to Object | Objects or tools required to activate, channel, or perform the ability |
| `systems` | links to Construct | Magic frameworks or structures that the ability associates with |
