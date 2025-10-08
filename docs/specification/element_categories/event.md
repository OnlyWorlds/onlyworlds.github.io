---
layout: default
title: event
parent: elements
grand_parent: specification
nav_order: 6
---

 <span class="material-symbols-outlined">saved_search</span>

An Event represents a time-bound happening within the world. Events capture notable incidents—historical, natural, or supernatural—that hold significance for the world or its inhabitants. They define what happens, when it happens, and who or what is involved. 

--- 
  
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

---
### Nature
- **History**: Historical context and background of the event
- **Challenges**: Adversity or difficulties faced during the event
- **Consequences**: Outcomes and impacts resulting from the event
- **Start_date** (#): Date on which the event began
- **End_date** (#): Date on which the event concluded
- **Triggers** (multi-link: Event): Events that eventuated the event

### Involves
- **Characters** (multi-link: Character): Key characters relevant to the event
- **Objects** (multi-link: Object): Objects relevant to the event
- **Locations** (multi-link: Location): Locations relevant to the event
- **Species** (multi-link: Species): Species relevant to the event
- **Creatures** (multi-link: Creature): Creatures relevant to the event
- **Institutions** (multi-link: Institution): Institutions relevant to the event
- **Traits** (multi-link: Trait): Traits relevant to the event
- **Collectives** (multi-link: Collective): Groups or collectives relevant to the event
- **Zones** (multi-link: Zone): Zones relevant to the event
- **Abilities** (multi-link: Ability): Abilities relevant to the event
- **Phenomena** (multi-link: Phenomenon): Natural or supernatural phenomena relevant to the event
- **Languages** (multi-link: Language): No description available.
- **Families** (multi-link: Family): Families relevant to the event
- **Relations** (multi-link: Relation): Interpersonal or political relations relevant to the event
- **Titles** (multi-link: Title): Titles relevant to the event
- **Constructs** (multi-link: Construct): Concepts, laws, or built entities relevant to the event

