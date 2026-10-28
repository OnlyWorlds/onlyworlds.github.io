---
title: "Trait"
description: "Traits describe qualities that shape how a character or creature acts, responds, or is perceived."
sidebar:
  order: 20
---

<img src="/icons/trait.png" alt="" width="48" height="48" class="ow-type-icon" />

Traits describe qualities that shape how a character or creature acts, responds, or is perceived. These are not active powers or learned abilities, but underlying aspects of identity.

Traits enrich the make up of actors. They interact with:

- **Characters** (holding traits and being shaped by them)
- **Abilities** (requiring, unlocking, or enhancing traits)
- **Species** (establishing cultural or biological expressions)

They are distinct from: 

- **Constructs** (frameworks a world holds or works by, such as a tradition or a currency, where a Trait is a quality of one being or kind)
- **Titles** (which are formally constructed, not potentially natural)

[Trait discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/trait)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

Drawn with the other element types: [what Trait links to](/docs/schema/?kind=trait#what-links-to-what).

Integers are whole numbers: the API truncates a decimal, and a range is a display hint it does not enforce ([Field types](/docs/schema/fields#field-types)).

### Qualitative

| Field | Type | Description |
|---|---|---|
| `social_effects` | text | Relating to social relationships, reputation, or interaction dynamics |
| `physical_effects` | text | Relating to physical changes, limitations, or enhancements |
| `functional_effects` | text | Relating to practical or learned performance or aptitude |
| `personality_effects` | text | Relating to temperament, mental state, or personality expression |
| `behaviour_effects` | text | Relating to visible aspects and patterns of behavior |

### Quantitative

| Field | Type | Description |
|---|---|---|
| `charisma` | integer | Affecting a character's charisma score |
| `coercion` | integer | Affecting a character's coercion score |
| `competence` | integer | Affecting a character's competence score |
| `compassion` | integer | Affecting a character's compassion score |
| `creativity` | integer | Affecting a character's creativity score |
| `courage` | integer | Affecting a character's courage score |

### World

| Field | Type | Description |
|---|---|---|
| `significance` | text | Describes the trait's societal, symbolic, or systemic presence |
| `anti_trait` | link to Trait | Opposing trait that contradicts or nullifies the trait |
| `empowered_abilities` | links to Ability | Abilities strengthened or enabled by the trait |
