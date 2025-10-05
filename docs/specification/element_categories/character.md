---
layout: default
title: character
parent: elements
grand_parent: Specification
nav_order: 2
---

<span class="material-symbols-outlined">person_4</span>

A Character represents an individual with agency and the capacity to make choices that affect their world. Characters are self-directed actors who can respond to situations, form relationships, and drive narrative change through their decisions and actions.

---

A Character is an individual with agency. They interact with:

- **Species** (defining their biological or cultural blueprints)  
- **Traits and Abilities** (defining their nature and powers)  
- **Objects and Constructs** (defining what they own, carry, or believe)  
- **Institutions, Zones, and Events** (contexts they affect or are affected by)  
- **Families, Collectives, and Relations** (their networks and bonds)

They are distinct from:

- **Creatures** (which lack reasoned choices or structured goals)  
- **Collectives** (which model group entities without individual agency)  
 
[Character discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Character)

---
### Constitution
- **Physicality**: The character's visible physical features and body attributes
- **Mentality**: The character's mindset, emotional tone, and style of thinking
- **Height** (#): The character's approximate or exact height, using world LENGTH units
- **Weight** (#): The character's approximate or exact weight, using world MASS units
- **Species** (multi-link: Species): Species the character might belong to
- **Traits** (multi-link: Trait): Traits for notable behavioral, physical, or systemic characteristics
- **Abilities** (multi-link: Ability): Abilities the character might perform, control, or invoke

### Origins
- **Background**: History, upbringing, or formative experiences of the character
- **Motivations**: Core desires, goals, or values that drive the character's choices and behavior
- **Birth_date** (#): Moment of birth, expressed in the world's TIME units
- **Birthplace** (single-link: Location): Location where the character was born
- **Languages** (multi-link: Language): Languages the character can understand, speak, or use for communication

### World
- **Reputation**: Brief summary of the character's current condition, role, or predicament
- **Location** (single-link: Location): The character's present physical location
- **Objects** (multi-link: Object): Key objects owned by or symbolically linked to the character
- **Institutions** (multi-link: Institution): Institutions the character is affiliated with

### Personality
- **Charisma** (# max:100): Ability to attract, inspire, and influence others
- **Coercion** (# max:100): Capacity to dominate, intimidate, or apply force to shape outcomes
- **Competence** (# max:100): Skill in planning, understanding, and managing complex systems or situations
- **Compassion** (# max:100): Willingness to empathize with and care for others
- **Creativity** (# max:100): Ability to generate novel ideas, perspectives, or solutions
- **Courage** (# max:100): Readiness to face danger, risk, or adversity

### Social
- **Family** (multi-link: Family): Families the character belongs to by blood or adoption
- **Friends** (multi-link: Character): Characters the character considers close allies or companions
- **Rivals** (multi-link: Character): Characters the character is in active opposition or competition with

### Ttrpg
- **Level** (#): Progression rank of the character in a game system
- **Hit_points** (#): Total health available to the character
- **Str** (#): Physical force and carrying capacity
- **Dex** (#): Agility, coordination, and reflexes
- **Con** (#): Endurance and resistance to strain
- **Int** (#): Reasoning, memory, and learning
- **Wis** (#): Intuition, awareness, and judgment
- **Cha** (#): Persuasiveness and personal magnetism

