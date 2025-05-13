---
layout: default
title: Territory
parent: Categories
grand_parent: Specification
nav_order: 16
---

# Territory

**Definition**

*An area that is claimed, occupied, or otherwise defined*

A Territory represents a specific geographic region within the world, usually associated with a particular authority or community

**Examples**
- The Kingdom of Gondor
- The Sahara Desert
- The Forbidden City

**[Discussion](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Territory)**

Potential alternate names: *Domain, ..*


---
### Situation
- **Terrain**: Description of the land features and geographical characteristics of the territory.
- **Size** (#): Total area of the territory, typically measured in square kilometers or miles.
- **Parent_territory** (single-link: Territory): The larger territory of which this one is a part.

### Yield
- **Maintenance**: Resources and effort required to maintain and manage the territory.
- **Primary_output** (#): Main product or resource produced by the territory.
- **Secondary_output** (#): Additional products or resources produced by the territory.
- **Primary_resource** (single-link: Construct): Primary natural or economic resource available in the territory.
- **Secondary_resources** (multi-link: Construct): Other significant resources found within the territory.

### World
- **History**: Historical background and major events that have shaped the territory.
- **Occupants** (multi-link: Species): Species that inhabit or are native to the territory.
- **Occurrences** (multi-link: Phenomenon): Significant events or natural phenomena occurring within the territory.

