---
layout: default
title: Character
parent: Element Categories
grand_parent: Specification
nav_order: 2
---

<h3><span class="material-symbols-outlined">person_4</span><br>Character</h3>
<br>
Embodies any individual actor defined by their agency and capacity to make choices that influence the world around them.  

---
### Key Concepts

The 'Character' category is fundamental for representing sentient beings capable of independent action and decision-making. The key distinction for a Character often lies in their demonstrated agency, differentiating them from instinct-driven Creatures. 
   
*   **Agency vs. Instinct:** The line between a highly intelligent `Creature` and a `Character` can be subjective. Generally, if an entity makes reasoned choices, has complex motivations, and plays a distinct role beyond simple behavior patterns, it qualifies as a Character.
*   **Relationships:** Characters are richly defined by their links to other elements: their `Species` and `Traits` (like "Hunger for Fame and Fortune" or "Fear of Death"), the `Abilities` they possess, their `Location`, owned `Objects`, and associated `Institutions`. `Relation` elements can further define relations between `Character`s.

[Character Discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Character).

---
### Constitution
- **Physicality**: Physical traits and appearance descriptions..
- **Psychology**: Psychological traits and mindset descriptions
- **Height** (#): Height of the character in appropriate units
- **Weight** (#): Weight of the character in appropriate units
- **Species** (multi-link: Species): Species of the character
- **Traits** (multi-link: Trait): Traits of the character
- **Abilities** (multi-link: Ability): Abilities of the character

### Origins
- **Background**: The character's background story.
- **Motivations**: Driving motivations behind the character's actions.
- **Birth_date** (#): Birth date of the character.
- **Birthplace** (single-link: Location): Birthplace of the character
- **Languages** (multi-link: Language): Languages the character can speak

### World
- **Situation**: Current situation or predicament of the character.
- **Location** (single-link: Location): The character's current location
- **Titles** (multi-link: Title): Titles held by the character
- **Objects** (multi-link: Object): Objects owned or associated with the character
- **Institutions** (multi-link: Institution): Institutions associated with the character

### Personality
- **Charisma** (# max:100): Charisma score of the character..
- **Coercion** (# max:100): Coercion score of the character.
- **Capability** (# max:100): Capability score of the character.
- **Compassion** (# max:100): Compassion score of the character.
- **Creativity** (# max:100): Creativity score of the character.
- **Courage** (# max:100): Courage score of the character.

### Social
- **Family** (multi-link: Family): Family members of the character
- **Friends** (multi-link: Character): Friends of the character
- **Rivals** (multi-link: Character): Rivals of the character

### Games
- **Backstory**: The backstory of the character.
- **Level** (#): Level of the character.
- **Power** (#): Power level of the character.
- **Price** (# max:9999): Price or value associated with the character.
- **Hit_points** (# max:999): Total hit points of the character.
- **Skill_stealth** (#): Stealth skill level of the character.
- **Tt_str** (# max:20): Strength attribute of the character.
- **Tt_int** (# max:20): Intelligence attribute of the character.
- **Tt_con** (# max:20): Constitution attribute of the character.
- **Tt_dex** (# max:20): Dexterity attribute of the character.
- **Tt_wis** (# max:20): Wisdom attribute of the character.
- **Tt_cha** (# max:20): Charisma attribute of the character.
- **Class**: Class of the character.
- **Alignment**: Alignment of the character.
- **Equipment** (multi-link: Object): Equipment carried by the character
- **Backpack** (multi-link: Object): Items in the character's backpack
- **Proficiencies** (multi-link: Construct): Proficiencies of the character
- **Features** (multi-link: Trait): Features of the character
- **Spells** (multi-link: Ability): Spells known by the character
- **Inspirations** (multi-link: Construct): Inspirations of the character

