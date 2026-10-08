---
title: "Institution"
description: "Institutions are organized bodies with purpose and structure."
sidebar:
  order: 8
---

<img src="/icons/institution.png" alt="" width="48" height="48" class="ow-type-icon" />

Institutions are organized bodies with purpose and structure. They shape the world through policy, organization, and culture. Institutions can serve as key agents of power, coordinating individuals and collectives around shared goals, practices, or ideologies. 

Institutions are executive structures of meaning in a world. They interact with:

- **Characters and Titles** (placing people in institutions)
- **Zones, Objects, and Creatures** (what they define or control)
- **Laws and Constructs** (what they enforce, create or utilize)

They are distinct from:

- **Collectives** (which model informal or non-agentic groups)
- **Families** (which have implications of kinship and ancestry)

[Institution discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/institution)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Foundation

| Field | Type | Description |
|---|---|---|
| `doctrine` | text | Core belief, mission, or purpose that drives the institution |
| `founding_date` | integer | Date when the institution was established, in the world's TIME format |
| `parent_institution` | link to Institution | Institution that governs, embodies, or originated this one |

### Claims

| Field | Type | Description |
|---|---|---|
| `zones` | links to Zone | Areas the institution controls or claims authority over |
| `objects` | links to Object | Significant objects owned or tied to the institution's operations, holdings, or identity |
| `creatures` | links to Creature | Creatures under the institution's protection, use, or symbolic control |

### World

| Field | Type | Description |
|---|---|---|
| `status` | text | Current political, cultural, or functional standing of the institution in the world |
| `allies` | links to Institution | Institutions this one actively cooperates or aligns with |
| `adversaries` | links to Institution | Institutions this one opposes, competes with, or is in conflict with |
| `constructs` | links to Construct | Conceptual, procedural, or structural systems created or maintained by the institution |
