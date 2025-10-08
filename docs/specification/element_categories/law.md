---
layout: default
title: law
parent: elements
grand_parent: specification
nav_order: 10
---

*A system of rules and penalties built on claims to authority*

A Law is a formalized set of guidelines or commands that govern the actions of individuals or groups within a specific jurisdiction.  

<span class="material-symbols-outlined">gpp_bad</span>

Laws are formal rules issued by an authority to guide behavior, establish boundaries, or enforce order within a world. They define what is permitted or prohibited, outline consequences for violations, and specify who interprets and enforces them. Laws can be administrative, punitive, or symbolic, and may carry legal, cultural, or spiritual significance. 

---

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

---
### Code
- **Declaration**: The formal wording, expression, or decree of the law
- **Purpose**: The intent, motivation, or justification for the law's creation
- **Date** (#): Date the law was formally established, in world TIME units
- **Parent_law** (single-link: Law): A law that this law derives from, modifies, or enhances
- **Penalties** (multi-link: Construct): Consequences intended to beapplied when the law is contravened

### World
- **Author** (single-link: Institution): The institution that created or issued the law
- **Locations** (multi-link: Location): Locations where the law is supported or enforced
- **Zones** (multi-link: Zone): Zones where the law is supported or enforced
- **Prohibitions** (multi-link: Construct): Things that the law explicitly or effectively forbids
- **Adjudicators** (multi-link: Title): Titles responsible for interpreting or ruling on the law's application and jurisdiction
- **Enforcers** (multi-link: Title): Titles responsible for enforcing or imposing the law

