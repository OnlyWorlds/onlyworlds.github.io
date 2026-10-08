---
title: "Location"
description: "A Location represents a distinct place within the world where activities occur and elements converge."
sidebar:
  order: 9
---

<img src="/icons/location.png" alt="" width="48" height="48" class="ow-type-icon" />

A Location represents a distinct place within the world where activities occur and elements converge. Locations serve as anchors for other world elements, and describe how physical spaces are used, who organizes them, and how they relate to other places.

Locations are a structural backbone of your world. They interact with:

- **Collectives and Characters** (who inhabit or pass through them)
- **Institutions and Laws** (which govern or control them)
- **Objects and Titles** (which exist within or are tied to them)
- **Events and Narratives** (which often take place in or around them)

They are distinct from:

- **Zones** (which represent a specific marked area)
- **Institutions** (which organize power and policy within and towards them)

[Location discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/location)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Setting

| Field | Type | Description |
|---|---|---|
| `form` | text | Visual and environmental aspects of the location |
| `function` | text | Main use, role, or purpose of the location within the world |
| `founding_date` | integer | Date on which the location was founded, established, or designated |
| `parent_location` | link to Location | Wider location that this location is part of |
| `populations` | links to Collective | Distinct collective groups or communities residing within the location |

### Politics

| Field | Type | Description |
|---|---|---|
| `political_climate` | text | Political structure, stability, and dynamics of the location |
| `primary_power` | link to Institution | Institution that has the highest degree of political control over the location |
| `governing_title` | link to Title | Governing figure assigned by the location's primary power |
| `secondary_powers` | links to Institution | Institutions with significant political control |
| `zone` | link to Zone | Zone of interest that is associated with the location |
| `rival` | link to Location | Location with an active, traditional, or historical rivalry with this one |
| `partner` | link to Location | Location with active, cooperative, or historical ties to this one |

### World

| Field | Type | Description |
|---|---|---|
| `customs` | text | Cultural practices, habits, or festivals |
| `founders` | links to Character | Individual(s) who founded or named the location |
| `cults` | links to Construct | Significant religious constructs practiced or recognized at the location |
| `delicacies` | links to Species | Organisms or other species locally consumed or celebrated as specialty foods |

### Production

| Field | Type | Description |
|---|---|---|
| `extraction_methods` | links to Construct | Techniques or strategies used to gather natural resources |
| `extraction_goods` | links to Construct | Products and materials that are gathered or obtained |
| `industry_methods` | links to Construct | Techniques or workflows used to refine or manufacture goods |
| `industry_goods` | links to Construct | Products and materials that are refined or manufactured |

### Commerce

| Field | Type | Description |
|---|---|---|
| `infrastructure` | text | Roads, ports, and other physical systems that enable the movement of goods and people |
| `extraction_markets` | links to Location | Locations that receive extracted goods through trade, interchange, or seizure |
| `industry_markets` | links to Location | Locations that receive industrial goods through trade, interchange, or seizure |
| `currencies` | links to Construct | Trade media recognized or circulated at the location |

### Construction

| Field | Type | Description |
|---|---|---|
| `architecture` | text | Look, form, and materials used in the built environment and location design |
| `buildings` | links to Object | Notable structural objects at the location |
| `building_methods` | links to Construct | Techniques or systems used to construct structures at the location |

### Defense

| Field | Type | Description |
|---|---|---|
| `defensibility` | text | Qualities of natural, constructed, and implemented defenses at the location |
| `elevation` | integer | Height or elevation of the location relative to surrounding terrain, defined in world DISTANCE units |
| `fighters` | links to Construct | Military units or forces responsible for defending the location |
| `defensive_objects` | links to Object | Objects or installations for defending the location |
