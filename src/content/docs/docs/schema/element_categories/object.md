---
title: "Object"
description: "Objects are tangible, non-living things that can be made, owned, traded or destroyed."
sidebar:
  order: 14
---

<img src="/icons/object.png" alt="" width="48" height="48" class="ow-type-icon" />

Objects are tangible, non-living things that can be made, owned, traded or destroyed. They can enable abilities, consume resources, trigger phenomena and shape stories.

Objects are a core material element of worlds. They interact with:

- **Characters** (who own or interact with them)
- **Traits and Abilities** (which determine who can use them and how)
- **Locations** (which define where they are stored or used)
- **Phenomena** (which they may emit, trigger, or be affected by)

They are distinct from:

- **Constructs** (which define their underlying principles or technologies)
- **Creatures and Characters** (which are animate)
- **Phenomena** (which represent ongoing effects or supernatural features)

[Object discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/object)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Form

| Field | Type | Description |
|---|---|---|
| `aesthetics` | text | Appearance, design, or visual presentation of the object |
| `weight` | integer | Approximate or exact mass of the object, in the world's mass unit (World mass_unit) |
| `amount` | integer | The number of identical units in this object entry |
| `parent_object` | link to Object | Larger object that this one is part of or contained within |
| `materials` | links to Construct | The physical matter that constitutes the object |
| `technology` | links to Construct | Mechanisms relating to the object's design or operation |

### Function

| Field | Type | Description |
|---|---|---|
| `utility` | text | Intended purpose or primary use of the object |
| `effects` | links to Phenomenon | Phenomena potentially triggered or emitted on object use |
| `abilities` | links to Ability | Abilities that the object grants or enables |
| `consumes` | links to Construct | What might be used or depleted on object use |

### World

| Field | Type | Description |
|---|---|---|
| `origins` | text | Background or history of the object |
| `location` | link to Location | Physical place where the object is currently located or stored |
| `language` | link to Language | Required to read, understand, or activate the object |
| `affinities` | links to Trait | Traits that resonate with or enhance the object's use, function, or effects |
