---
title: "Phenomenon"
description: "Phenomena are ongoing or emergent conditions that act in or upon the world."
sidebar:
  order: 15
---

<img src="/icons/phenomenon.png" alt="" width="48" height="48" class="ow-type-icon" />

Phenomena are ongoing or emergent conditions that act in or upon the world. They are not defined by intent or agency, but might be wielded or enabled by other elements.

Phenomena interact with the rest of the world in some meaningful ways, including:

- **Characters** (wielding or enabling)
- **Traits and Abilities** (enhancing or being enhanced)
- **Objects and Constructs** (trigger or affected)
- **Locations** (appear or enrich)

They are distinct from:

- **Events** (which are dated incidents of history)
- **Constructs** (which are designed or conceptual structures)
- **Abilities** (which are agent-bound)

[Phenomenon discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/phenomenon)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

Drawn with the other element types: [what Phenomenon links to](/docs/schema/?kind=phenomenon#what-links-to-what).

Integers are whole numbers: the API truncates a decimal, and a range is a display hint it does not enforce ([Field types](/docs/schema/fields#field-types)).

### Mechanics

| Field | Type | Description |
|---|---|---|
| `expression` | text | How the phenomenon manifests or takes shape in the world |
| `effects` | text | The primary outcomes or changes caused by the phenomenon |
| `duration` | integer | The amount of time the phenomenon lasts, measured in world TIME units |
| `catalysts` | links to Object | Objects or materials that initiate or enhance the phenomenon |
| `empowerments` | links to Ability | Abilities that initiate or enhance the phenomenon, or are initiated or enhanced by it |

### World

| Field | Type | Description |
|---|---|---|
| `mythology` | text | Cultural, religious, or narrative meaning associated with the phenomenon |
| `system` | link to Phenomenon | Broader phenomenon that this one is part of or linked to |
| `triggers` | links to Construct | Conceptual mechanisms or patterns that cause the phenomenon to activate |
| `wielders` | links to Character | Characters capable of intentionally directing or controlling the phenomenon |
| `environments` | links to Location | Locations where the phenomenon occurs or is known to manifest |
