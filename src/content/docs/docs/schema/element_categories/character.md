---
title: "Character"
description: "A Character represents an individual with agency and the capacity to make choices that affect their world."
sidebar:
  order: 2
---

<img src="/icons/character.png" alt="" width="48" height="48" class="ow-type-icon" />

A Character represents an individual with agency and the capacity to make choices that affect their world. Characters are self-directed actors who can respond to situations, form relationships, and drive narrative change through their decisions and actions.

Its own link fields point to: **Species, Traits and Abilities** (`species`, `traits`, `abilities`); **Languages and Objects** (`languages`, `objects`); **Locations** (`birthplace`, `location`); **Institutions and Families** (`institutions`, `family`); **other Characters** (`friends`, `rivals`). Other elements link to a Character from their side: an Event, Collective, Construct, Narrative, Relation or Title lists it in `characters`, and a Relation names it as `actor`. Find those with a filter, e.g. `GET /api/v2/event?characters={id}`.

They are distinct from:

- **Creatures** (which lack reasoned choices or structured goals)  
- **Collectives** (which model group entities without individual agency)  

[Character discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/character)

Every field below is optional. The TTRPG group (`level`, `hit_points` and six ability scores) is for worlds that run a game system. `charisma` (Personality) and `CHA` (TTRPG) are separate fields.

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Constitution

| Field | Type | Description |
|---|---|---|
| `physicality` | text | The character's visible physical features and body attributes |
| `mentality` | text | The character's mindset, emotional tone, and style of thinking |
| `height` | integer | The character's approximate or exact height, in the world's length unit (World length_unit) |
| `weight` | integer | The character's approximate or exact weight, in the world's mass unit (World mass_unit) |
| `species` | links to Species | Species the character might belong to |
| `traits` | links to Trait | Traits for notable behavioral, physical, or systemic characteristics |
| `abilities` | links to Ability | Abilities the character might perform, control, or invoke |

### Origins

| Field | Type | Description |
|---|---|---|
| `background` | text | History, upbringing, or formative experiences of the character |
| `motivations` | text | Core desires, goals, or values that drive the character's choices and behavior |
| `birth_date` | integer | Moment of birth, expressed in the world's TIME units |
| `birthplace` | link to Location | Location where the character was born |
| `languages` | links to Language | Languages the character can understand, speak, or use for communication |

### World

| Field | Type | Description |
|---|---|---|
| `reputation` | text | Brief summary of the character's current condition, role, or predicament |
| `location` | link to Location | The character's present physical location |
| `objects` | links to Object | Key objects owned by or symbolically linked to the character |
| `institutions` | links to Institution | Institutions the character is affiliated with |

### Personality

| Field | Type | Description |
|---|---|---|
| `charisma` | integer | Ability to attract, inspire, and influence others |
| `coercion` | integer | Capacity to dominate, intimidate, or apply force to shape outcomes |
| `competence` | integer | Skill in planning, understanding, and managing complex systems or situations |
| `compassion` | integer | Willingness to empathize with and care for others |
| `creativity` | integer | Ability to generate novel ideas, perspectives, or solutions |
| `courage` | integer | Readiness to face danger, risk, or adversity |

### Social

| Field | Type | Description |
|---|---|---|
| `family` | links to Family | Families the character belongs to by blood or adoption |
| `friends` | links to Character | Characters the character considers close allies or companions |
| `rivals` | links to Character | Characters the character is in active opposition or competition with |

### TTRPG

| Field | Type | Description |
|---|---|---|
| `level` | integer | Progression rank of the character in a game system |
| `hit_points` | integer | Total health available to the character |
| `STR` | integer | Physical force and carrying capacity |
| `DEX` | integer | Agility, coordination, and reflexes |
| `CON` | integer | Endurance and resistance to strain |
| `INT` | integer | Reasoning, memory, and learning |
| `WIS` | integer | Intuition, awareness, and judgment |
| `CHA` | integer | Persuasiveness and personal magnetism |
