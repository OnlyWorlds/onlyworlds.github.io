---
layout: default
title: Object
parent: Element Categories
grand_parent: Specification
nav_order: 14
---

<span class="material-symbols-outlined">webhook</span>

An Object is any distinct, physical entity that exists within your world – the tangible *stuff of the physical realm*. This category encompasses a vast array of items, from mundane tools like a *wrench* or a *Sea Chest* found in "The Wager", to unique and powerful artifacts such as *The One Ring*, or complex machinery like a *leaky spaceship* or the *Ebony Spaceship* from "Hyperion".

---
### Key Concepts

The 'Object' category is crucial for populating your world with interactive items, resources, and equipment. Objects can be simple or complex, common or unique, and their definition often hinges on their physical nature and potential for interaction.

*   **Tangibility:** The primary characteristic of an Object is its physical existence. Unlike abstract `Constructs` or ephemeral `Phenomena`, Objects can typically be touched, moved, or owned.
*   **Supertypes and Subtypes:** `Supertype` helps define the broad nature of an object (e.g., "Item", "Vehicle", "Component", "Apparel", "Weapon"), while `Subtype` provides more specific classification (e.g., "Tool", "Ship", "Engine", "Armor", "Sword"). For example, the *Centurion* in "The Wager" is an Object of `Supertype: Vehicle` and `Subtype: Ship`.
*   **Functionality and Interaction:** Objects are often defined by their utility. Fields like `Effects`, `Enables`, and `Consumes` (linking to `Phenomenon`, `Ability`, and `Construct` respectively) describe what an object does. Game-specific fields like `Damage` or `Armor` further detail their interactive properties.
*   **Composition:** Objects can be part of larger assemblies. The `Parent_object` field allows for linking an object as a component of another (e.g., a `Spyglass` might be an object, but an *Engine* object could have a `Parent_object` link to the *Spaceship* object it belongs to).

[Object Discussions on GitHub](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Object).

---
### Form
- **Aesthetics**: Visual and design characteristics of the object.
- **Weight** (#): Physical weight of the object, usually in kilograms or pounds.
- **Amount** (#): Quantity or count of the object, particularly if it is part of a set or collection.
- **Parent_object** (single-link: Object): Directly related or parent object from which this one is derived or part of.
- **Technology** (multi-link: Construct): Technological aspects or mechanisms incorporated within the object.

### Function
- **Utility**: Primary function or use of the object.
- **Effects** (multi-link: Phenomenon): Effects or outcomes produced by the object when used.
- **Enables** (multi-link: Ability): Abilities or actions enabled by using the object.
- **Consumes** (multi-link: Construct): Resources or materials consumed by the object during use.

### World
- **Origins**: Origins or historical background of the object.
- **Location** (single-link: Location): Current location or usual storage place of the object.

### Games
- **Craftsmanship**: Quality of workmanship or level of craftsmanship of the object.
- **Requirements**: Conditions or prerequisites required to use the object effectively.
- **Durability**: Measure of the object's resistance to wear and damage.
- **Value** (#): Monetary or trade value of the object.
- **Damage** (#): Potential damage the object can inflict, applicable if used as a weapon.
- **Armor** (#): Armor rating, applicable if the object provides protection.
- **Rarity**: Scarcity or uniqueness of the object.
- **Language** (single-link: Language): Language associated with or required to understand the object.
- **Requires** (multi-link: Trait): Specific traits or skills required to use the object.

