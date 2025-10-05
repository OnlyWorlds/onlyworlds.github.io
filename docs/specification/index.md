---
layout: default
title: Specification
nav_order: 3
has_children: true
has_toc: false
---

The [OnlyWorlds specification](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema) defines 22 element categories, their fields, and relationship structures. This is the complete technical standard.

---

## Core Components

**[worlds](worlds)** - Top-level containers with timeline systems and API access

**[elements](element_categories/)** - 22 categories of worldbuilding data, each with specialized fields

**[fields](fields)** - Base properties shared across all elements, plus category-specific attributes

**[types](types)** - Optional supertype/subtype classification system (draft status)

**[complexities](complexities)** - Future capabilities: temporal versioning, simulation fields, knowledge systems

---

**Implementation**: Schema defined in [YAML files](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema), accessible via REST API at [onlyworlds.com/api/worldapi/](https://www.onlyworlds.com/api/worldapi/)
