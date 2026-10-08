---
title: "Law"
description: "A Law represents a formalized rule or set of guidelines that governs the actions of individuals or groups within a specific jurisdiction."
sidebar:
  order: 10
---

<img src="/icons/law.png" alt="" width="48" height="48" class="ow-type-icon" />

A Law represents a formalized rule or set of guidelines that governs the actions of individuals or groups within a specific jurisdiction. Laws define what is permitted or prohibited, outline consequences for violations, and specify who interprets and enforces them. They can be administrative, punitive, or symbolic, and may carry legal, cultural, or spiritual significance.

Laws are formalized rules that govern behavior within a jurisdiction. They interact with:

- **Institutions** (which often issue them)
- **Locations and Zones** (which define where they apply)
- **Titles** (which define who upholds them or judges them)
- **Constructs** (which describe the abstract concepts they prohibit or rely on)

They are distinct from:

- **Constructs** (which describe the abstract concepts they prohibit or rely on)
- **Institutions** (which often issue them but are not rules themselves)
- **Titles** (which define authority but not the rules themselves)

[Law discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/law)

<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->

## Fields

### Code

| Field | Type | Description |
|---|---|---|
| `declaration` | text | The formal wording, expression, or decree of the law |
| `purpose` | text | The intent, motivation, or justification for the law's creation |
| `date` | integer | Date the law was formally established, in world TIME units |
| `parent_law` | link to Law | A law that this law derives from, modifies, or enhances |
| `penalties` | links to Construct | Consequences intended to be applied when the law is contravened |

### World

| Field | Type | Description |
|---|---|---|
| `author` | link to Institution | The institution that created or issued the law |
| `locations` | links to Location | Locations where the law is supported or enforced |
| `zones` | links to Zone | Zones where the law is supported or enforced |
| `prohibitions` | links to Construct | Things that the law explicitly or effectively forbids |
| `adjudicators` | links to Title | Titles responsible for interpreting or ruling on the law's application and jurisdiction |
| `enforcers` | links to Title | Titles responsible for enforcing or imposing the law |
