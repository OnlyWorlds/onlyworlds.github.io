---
title: "Family"
description: "A Family is a group tied together by lineage, heritage or community."
sidebar:
  order: 7
---

<img src="/icons/family.png" alt="" width="48" height="48" class="ow-type-icon" />

A Family is a group tied together by lineage, heritage or community.

A Family is a group tied together by lineage, heritage or community. They interact with:

- **Characters** (who are members, descendants or ancestors)
- **Traits, Abilities, and Languages** (passed down or shared)
- **Objects and Creatures** (as heirlooms or symbols)
- **Institutions and Locations** (which they govern or inhabit)

They are distinct from:

- **Institutions** (which organize for more general purposes)
- **Collectives** (which group by circumstance, not inheritance)

[Family discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/family)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Identity

| Field | Type | Description |
|---|---|---|
| `spirit` | text | The core values or shared ethos that the family embodies |
| `history` | text | Background or origin story of the family |
| `traditions` | links to Construct | Cultural practices, symbols, or customs overseen by the family |
| `traits` | links to Trait | Traits possibly found among members of the family |
| `abilities` | links to Ability | Abilities or special qualities possibly present in the family |
| `languages` | links to Language | Languages spoken by, or associated with the family |
| `ancestors` | links to Character | Notable forebears or historic characters in the family's lineage |

### World

| Field | Type | Description |
|---|---|---|
| `reputation` | text | Current social, political, or general standing of the family |
| `estates` | links to Location | Key locations owned, governed, or symbolically tied to the family |
| `governs` | links to Institution | Institutions administered or managed by the family |
| `heirlooms` | links to Object | Important objects or artifacts handed down by the family |
| `creatures` | links to Creature | Creatures owned, bonded to, or representing the family |
