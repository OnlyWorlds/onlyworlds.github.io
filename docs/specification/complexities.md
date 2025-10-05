---
layout: default
title: Complexities
parent: Specification
nav_order: 5
has_toc: false
---

# Complexities

Advanced concepts that OnlyWorlds will support in future versions.

---

## Temporal states and timeline

Elements exist in time, but fields relate to time differently: a character's current location is a snapshot, their birthplace is historical (though might not exist on the entire timeline). A location's description might be timeless.

Currently, each world represents a single frozen moment. The `time_current` field hints at this, but you can't yet create multiple versions at different time points (unless you get creative with world duplication, but this is not intended behavior).  

OnlyWorlds will eventually support a variation of git-style versioning for worlds: branch at different times, track changes between states, merge timelines. This will enable multiple world versions: before and after major events, what-if alternate timelines, different campaign states, all from a single world base.

---

## Simulation capabilities

Some fields are functional, not just descriptive: resource yields feed economic simulations, health values determine combat outcomes, character personalities can affect politics. 

Besides their text fields, where you can write any information in anyformat, every OnlyWorlds category also has game- and simulation enabling fields. In these, specific formats and data types can be used for mechanical inference and simulation in academic or game systems.

OnlyWorlds' predecessor WorldSmith originated as an [economic simulation engine](https://www.onlyworlds.com/sikelia), and it's this type of function that OnlyWorlds aims to support. Identifying optimal 'simulation fields' and creating systems to formalize this static vs dynamic approach to fields is a major and continuous goal of the upcoming refactors and refinement of the OnlyWorlds schema. 

---

## Points of view

Not everyone knows everything: this applies to characters within your world as well as IRL people you share or collaborate the world's content with.

New tooling can enable the latter: the [browse tool](../tools/browse_tool) has a prototype 'showcase' function where you can choose what to share for a specific element. This kind of logic can built out much further in dedicacted tools. 

For 'in-world knowledge', a field metadata or tagging system might enable future complexity of this sort (and integrate with the timeline and simulation systems, as well).  

---


 

*Your thoughts on these and other systems are welcome! Share your ideas and critiques in [discord](https://discord.gg/9m8fSTbG) or on [GitHub discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions).*