---
layout: default
title: location
parent: categories
grand_parent: specification
nav_order: 11
---

<span class="material-symbols-outlined">castle</span>

A Location represents a distinct place within the world where activities occur and elements converge. Locations serve as anchors for other world elements, and describe how physical spaces are used, who organizes them, and how they relate to other places.

--- 
   
Locations are a structural backbone of your world. They interact with:

- **Collectives and Characters** (who inhabit or pass through them)
- **Institutions and Laws** (which govern or control them)
- **Objects and Titles** (which exist within or are tied to them)
- **Events and Narratives** (which often take place in or around them)

They are distinct from:

- **Zones** (which represent a specific marked area)
- **Institutions** (which organize power and policy within and towards them)

[Location discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/location)

---
### Setting
- **Form**: Visual and environmental aspects of the location
- **Function**: Main use, role, or purpose of the location within the world
- **Founding_date** (#): Date on which the location was founded, established, or designated
- **Parent_location** (single-link: Location): Wider location that this location is part of
- **Populations** (multi-link: Collective): Distinct collective groups or communities residing within the location

### Politics
- **Political_climate**: Political structure, stability, and dynamics of the location
- **Primary_power** (single-link: Institution): Institution that has the highest degree of political control over the location
- **Governing_title** (single-link: Title): Governing figure assigned by the location's primary power
- **Secondary_powers** (multi-link: Institution): Institutions with significant political control
- **Zone** (single-link: Zone): Zone of interest that is associated with the location
- **Rival** (single-link: Location): Locations with active, traditional, or historical rivalries
- **Partner** (single-link: Location): Locations with active, cooperative, or historical ties

### World
- **Customs**: Cultural practices, habits, or festivals
- **Founders** (multi-link: Character): Individual(s) who founded or named the location
- **Cults** (multi-link: Construct): Significant religious constructs practiced or recognized at the location
- **Delicacies** (multi-link: Species): Organisms or other species locally consumed or celebrated as specialty foods

### Production
- **Extraction_methods** (multi-link: Construct): Techniques or strategies used to gather natural resources
- **Extraction_goods** (multi-link: Construct): Products and materials that are gathered or obtained
- **Industry_methods** (multi-link: Construct): Techniques or workflows used to refine or manufacture goods
- **Industry_goods** (multi-link: Construct): Products and materials that are refined or manufactured

### Commerce
- **Infrastructure**: Roads, ports, and other physical systems that enable the movement of goods and people
- **Extraction_markets** (multi-link: Location): Locations that receive extracted goods through trade, interchange, or seizure
- **Industry_markets** (multi-link: Location): Locations that receive industrial goods through trade, interchange, or seizure
- **Currencies** (multi-link: Construct): Trade media recognized or circulated at the location

### Construction
- **Architecture**: Look, form, and materials used in the built environment and location design
- **Buildings** (multi-link: Object): Notable structural objects at the location
- **Building_methods** (multi-link: Construct): Techniques or systems used to construct structures at the location

### Defense
- **Defensibility**: Qualities of natural, constructed, and implemented defenses at the location
- **Elevation** (#): Height or elevation of the location relative to surrounding terrain, defined in world DISTANCE units
- **Fighters** (multi-link: Construct): Military units or forces responsible for defending the location
- **Defensive_objects** (multi-link: Object): Objects or installations for defending the location

