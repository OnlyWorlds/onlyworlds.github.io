---
layout: default
title: title
parent: elements
grand_parent: Specification
nav_order: 19
---

 <span class="material-symbols-outlined">military_tech</span>

A Title is a formal designation that confers identity, standing, or power within a world. It may be granted, inherited, or assumed, and often functions within a wider system of governance, belief, or custom. Titles help structure how individuals relate to institutions, spaces, and ideas across time.

--- 
  
Titles define structured identity and power. They interact with:

- **Characters** (holding titles)
- **Institutions** (issuing or hosting titles)
- **Zones, Locations, Objects** (governing or representing)
- **Constructs, Laws, and Collectives** (giving them shape or purpose)

They are distinct from:

- **Traits** (which describe personal attributes)
- **Abilities** (which define actions that can physically be taken)
- **Relations** (which describe personal or emotional bonds)

[Title discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/title)

---
### Mandate
- **Authority**: Rights or powers granted by the title
- **Eligibility**: Conditions or qualifications for receiving or holding the title
- **Grant_date** (#): Date on which the title was granted, defined in world TIME units
- **Revoke_date** (#): Date on which the title ended or was revoked, defined in world TIME units
- **Issuer** (single-link: Institution): Institution that formally created or granted the title
- **Body** (single-link: Institution): Institution in which the title functions or holds relevance
- **Superior_title** (single-link: Title): Another title that has authority over this one
- **Holders** (multi-link: Character): Characters who currently hold or represent the title
- **Symbols** (multi-link: Object): Objects that symbolize or authorize the title

### World
- **Status**: Current state or general condition of the title
- **History**: Background information on the title's origin, evolution, or significance
- **Characters** (multi-link: Character): Characters otherwise relevant to the title
- **Institutions** (multi-link: Institution): Institutions relevant to the title
- **Families** (multi-link: Family): Families relevant to the title
- **Zones** (multi-link: Zone): Zones relevant to the title
- **Locations** (multi-link: Location): Locations relevant to the title
- **Objects** (multi-link: Object): Objects otherwise relevant to the title
- **Constructs** (multi-link: Construct): Constructs relevant to the title
- **Laws** (multi-link: Law): Laws relevant to the title
- **Collectives** (multi-link: Collective): Collectives relevant to the title
- **Creatures** (multi-link: Creature): Creatures relevant to the title
- **Phenomena** (multi-link: Phenomenon): Phenomena relevant to the title
- **Species** (multi-link: Species): Species relevant to the title
- **Languages** (multi-link: Language): Languages relevant to the title

