---
layout: default
title: Creature
parent: Element Categories
grand_parent: Specification
nav_order: 5
---

# Creature

**Definition**

*A living entity, often non-sentient or with limited agency, existing within the world*

A Creature refers to any living being that does not possess the kind of autonomy or complex decision-making capabilities that would have it become a Character in their world. 

**Examples**
- Dire Wolf
- Phoenix
- Vampire Nighthawk


**[Discussion](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Creature)**

Potential alternate names: *Lifeform, ..*

What is the dividing line between a Creature and Character? This might ultimately be down to a builder's subjective taste over hardcoded rules.

Creature vs Species: similar to the Object vs Construct challenge of physical vs descriptive; Creature is any physical entity that is present in the world at a given time, while a Species element can describe some or all of its qualities and origins. 

---
### Physiology
- **Appearance**: Visual description of the creature's physical appearance.
- **Weight** (#): Weight of the creature, typically in kilograms or pounds.
- **Height** (#): Height of the creature, usually measured in centimeters or feet.
- **Species** (multi-link: Species): Species classification of the creature.

### Lifestyle
- **Behaviour**: Typical behaviors or habits of the creature.
- **Demeanour**: General demeanor or attitude of the creature.
- **Traits** (multi-link: Trait): Distinctive traits or characteristics of the creature.
- **Abilities** (multi-link: Ability): Special abilities or powers possessed by the creature.
- **Languages** (multi-link: Language): Languages known or used by the creature.

### World
- **Birth_date** (#): Birth date of the creature, often recorded as an integer.
- **Location** (single-link: Location): Current primary habitat or residence of the creature.
- **Territory** (single-link: Territory): Territorial range or area commonly occupied by the creature.

### Games
- **Lore**: Background story or mythology associated with the creature.
- **Senses**: Description of the sensory capabilities of the creature.
- **Hit_points** (#): Total hit points of the creature, indicating its health.
- **Armor_class** (#): Armor class of the creature, reflecting its defensive capabilities.
- **Challenge_rating** (#): Challenge rating, indicating the difficulty level in combat.
- **Speed** (#): Movement speed of the creature, typically measured in feet per round.
- **Tt_str** (# max:20): Strength attribute, measuring physical power.
- **Tt_int** (# max:20): Intelligence attribute, measuring cognitive ability.
- **Tt_con** (# max:20): Constitution attribute, measuring endurance.
- **Tt_dex** (# max:20): Dexterity attribute, measuring agility.
- **Tt_wis** (# max:20): Wisdom attribute, measuring perception and insight.
- **Tt_cha** (# max:20): Charisma attribute, measuring force of personality.
- **Actions** (multi-link: Ability): Combat actions available to the creature.
- **Reactions** (multi-link: Construct): Reactive abilities or defensive actions of the creature.
- **Alignment**: d&d alignment of the creature.

