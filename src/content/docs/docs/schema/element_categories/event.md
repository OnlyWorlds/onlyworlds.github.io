---
title: "Event"
description: "An Event represents a time-bound happening within the world."
sidebar:
  order: 6
---

<img src="/icons/event.png" alt="" width="48" height="48" class="ow-type-icon" />

An Event represents a time-bound happening within the world. Events capture notable incidents—historical, natural, or supernatural—that hold significance for the world or its inhabitants. They define what happens, when it happens, and who or what is involved. 

Events are defined occurrences. They pull in and affect:

- **Characters, Collectives, and Institutions** (as agents or sufferers)
- **Zones and Locations** (as settings or battlegrounds)
- **Constructs and Laws** (as outcomes or contested forces)
- **Traits, Titles, and Abilities** (as qualities or catalysts)
- **Phenomena, Creatures, and Objects** (as elements in motion)

They are distinct from:

- **Narratives** (which reinterpret potential collections of Events)
- **Constructs** (which represent ideas or systems that persist over time)
- **Relations** (which define ongoing bonds or tensions between actors)

Events are about what happens. The rest of the schema gives it meaning, context, and consequence.

[Event discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/event)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Nature

| Field | Type | Description |
|---|---|---|
| `history` | text | Historical context and background of the event |
| `challenges` | text | Adversity or difficulties faced during the event |
| `consequences` | text | Outcomes and impacts resulting from the event |
| `start_date` | integer | Date on which the event began |
| `end_date` | integer | Date on which the event concluded |
| `triggers` | links to Event | Events that precipitated this event |

### Involves

| Field | Type | Description |
|---|---|---|
| `characters` | links to Character | Key characters relevant to the event |
| `objects` | links to Object | Objects relevant to the event |
| `locations` | links to Location | Locations relevant to the event |
| `species` | links to Species | Species relevant to the event |
| `creatures` | links to Creature | Creatures relevant to the event |
| `institutions` | links to Institution | Institutions relevant to the event |
| `traits` | links to Trait | Traits relevant to the event |
| `collectives` | links to Collective | Groups or collectives relevant to the event |
| `zones` | links to Zone | Zones relevant to the event |
| `abilities` | links to Ability | Abilities relevant to the event |
| `phenomena` | links to Phenomenon | Natural or supernatural phenomena relevant to the event |
| `languages` | links to Language | Languages relevant to the event |
| `families` | links to Family | Families relevant to the event |
| `relations` | links to Relation | Interpersonal or political relations relevant to the event |
| `titles` | links to Title | Titles relevant to the event |
| `constructs` | links to Construct | Concepts, laws, or built entities relevant to the event |
