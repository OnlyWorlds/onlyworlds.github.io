---
layout: default
title: advanced topics
parent: Specification
nav_order: 5
has_toc: false
---

Advanced topics that are in consideration for future schema versions.

## Temporal States (Planned)

Elements exist in time. Fields relate to time differently: a character's current location is a snapshot, their birthplace is historical, a location's description might be timeless.

Currently, each world represents a single frozen moment. The `time_current` field hints at this, but you cannot yet create multiple versions of a world at different time points.  

onlyworlds should eventually support git-style versioning for worlds: branch at different times, track changes between states, merge timelines. This enables multiple world versions from a single base—before and after major events, alternate timelines, different campaign states.

---

## Simulation Capabilities (Partial)

Some fields are functional, not just descriptive. Resource yields feed economic simulations, health values determine combat outcomes, character personalities affect political systems.

Every element category includes text fields (write anything in any format) and structured fields (specific data types for mechanical inference). onlyworlds' predecessor [WorldSmith](https://www.onlyworlds.com/sikelia) was an economic simulation engine. Supporting this functionality is a core goal.

Fields have different natures: a character's location is time-bound and dynamic, their backstory is static. A location's economic production is functional-quantitative. Future schema versions might include field metadata or tagging to formalize these distinctions—enabling tools to identify time-sensitive fields, economic fields, or simulation-relevant data automatically.


---

## Knowledge Systems (Prototype)

Not everyone knows everything. This applies to characters within your world and to people you collaborate with.

For in-world knowledge, a field metadata or tagging system could enable knowledge tracking and integrate with timeline and simulation systems.

 