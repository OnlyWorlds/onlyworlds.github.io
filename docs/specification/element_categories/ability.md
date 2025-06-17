---
layout: default
title: Ability
parent: Element Categories
grand_parent: Specification
nav_order: 1
---

<span class="material-symbols-outlined">auto_fix_normal</span>

An Ability represents something an entity in the world can do: a defined action, power, skill, or effect that can change the world or its perception. Abilities are performable and traceable: they have causes, consequences, and conditions. They can be passive traits, active powers, or conditional techniques. 
---

An Ability is a performable effect or power. They interact with:

- **Characters and Creatures** (as actors who employ them)  
- **Traits** (which may grant or enhance them)  
- **Objects and Constructs** (that might enable or constrain them)  
- **Phenomena** (which may result from or trigger them)  
- **Institutions** (which can teach or restrict them)  

They are distinct from:

- **Traits** (which describe qualities, not actions)   
- **Events** (which describe outcomes or occurrences, not repeatable powers)  

---

### Discussion Topics

* **Representing Cost**  
  Should Abilities include detailed cost mechanics? The current schema supports `prerequisites`, but resource consumption or cooldown-like patterns may need clearer support.

* **Active vs. Passive**  
  Should there be a distinction between always-on abilities and deliberate actions? Current modeling treats all abilities as "capabilities," but tone and usage might vary.

* **Conditional Access**  
  How should dependency on objects, traits, or world states be modeled — should Abilities support dynamic access logic?

[Ability Discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Ability)
