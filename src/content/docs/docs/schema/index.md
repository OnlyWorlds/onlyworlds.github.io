---
title: Schema
description: The OnlyWorlds standard, its 22 element categories, typed links, and where the schema is defined and governed.
---

The OnlyWorlds schema is the standard every OnlyWorlds tool and world shares. It defines 22 element **categories**, the fields each one carries, and typed links between them. An **element** is one record in a world: a Character, a Location, a Law.

Use as much of it as you need. Only `name` is required: the key must be present, and an empty string is accepted, on every category, Pins and Markers included. So a world of nothing but Objects is a valid world. Supertype and subtype add a world's own categories, `x_` fields carry data the schema doesn't model, and high-volume data can live in your own database beside the world, keyed by element id.

## The 22 Categories

| Category | Definition |
| :--- | :--- |
| [Character](/docs/schema/element_categories/character) | A Character represents an individual with agency and the capacity to make choices that affect their world. |
| [Creature](/docs/schema/element_categories/creature) | Creatures are living entities within a world that exhibit behavior and agency but lack the strategic reasoning, narrative focus, or social complexity of Characters. |
| [Species](/docs/schema/element_categories/species) | A Species defines a distinct biological or cultural form of life. |
| [Family](/docs/schema/element_categories/family) | A Family is a group tied together by lineage, heritage or community. |
| [Collective](/docs/schema/element_categories/collective) | A Collective is a group of individuals that acts as a unit but lacks formal governance or hierarchical structure. |
| [Institution](/docs/schema/element_categories/institution) | Institutions are organized bodies with purpose and structure. |
| [Location](/docs/schema/element_categories/location) | A Location represents a distinct place within the world where activities occur and elements converge. |
| [Object](/docs/schema/element_categories/object) | Objects are tangible, non-living things that can be made, owned, traded or destroyed. |
| [Construct](/docs/schema/element_categories/construct) | Constructs are abstract or conceptual structures that exist within a world and can have causal, symbolic, or systemic roles. |
| [Ability](/docs/schema/element_categories/ability) | An Ability represents something an entity in the world can do: a defined action, power, skill, or effect that can change the world or its perception. |
| [Trait](/docs/schema/element_categories/trait) | Traits describe qualities that shape how a character or creature acts, responds, or is perceived. |
| [Title](/docs/schema/element_categories/title) | A Title is a formal designation that confers identity, standing, or power within a world. |
| [Language](/docs/schema/element_categories/language) | Languages are systems of shared meaning, whether natural, constructed, or symbolic. |
| [Law](/docs/schema/element_categories/law) | A Law represents a formalized rule or set of guidelines that governs the actions of individuals or groups within a specific jurisdiction. |
| [Event](/docs/schema/element_categories/event) | An Event represents a time-bound happening within the world. |
| [Narrative](/docs/schema/element_categories/narrative) | Narratives represent stories told in your world, and can involve the organization or reinterpretation of Events. |
| [Phenomenon](/docs/schema/element_categories/phenomenon) | Phenomena are ongoing or emergent conditions that act in or upon the world. |
| [Relation](/docs/schema/element_categories/relation) | Relations are non-material and capture meaningful connections between world elements. |
| [Map](/docs/schema/element_categories/map) | A Map represents a spatial template that defines a coordinate system for placing elements within your world. |
| [Pin](/docs/schema/element_categories/pin) | Pins represent a single element on a single Map, indicating its position in that particular world view. |
| [Marker](/docs/schema/element_categories/marker) | Groups of Markers, each at a specific coordinate, together designate a Zone in the world. |
| [Zone](/docs/schema/element_categories/zone) | Zones represent abstract or meaningful areas within the world that hold significance due to cultural, political, environmental, or narrative reasons. |

Every element also carries the same base fields (name, description, supertype, subtype, image and more). [Fields](/docs/schema/fields) lists them, with the field types and what is required. [Worlds](/docs/schema/worlds) covers the container that holds the elements and its timeline. [A Worked Example](/docs/schema/example) reads one small world through the API, link by link.

## Typed Links

Links are typed fields. A Character's `location` is a single link that holds one Location; its `friends` is a multi link that holds any number of Characters. Each link field names the category it points to, so a tool always knows what kind of element is on the other end. One field, the Pin's `element`, is a generic link that can point to an element of any category.

Links point one way, from the element that holds the field. For connections that carry their own history, span or intensity, the schema has a category of its own: [Relation](/docs/schema/element_categories/relation). [Conventions](/docs/schema/conventions) covers when to use which.

## Where the Schema Lives

| What | Where |
| :--- | :--- |
| The standard, as YAML | [github.com/OnlyWorlds/OnlyWorlds](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema): one file per category, plus `base_properties.yaml` for the fields every element shares and a `VERSION` file |
| Governance | [council.onlyworlds.com](https://council.onlyworlds.com): the schema changes in public, by motion and vote. Take part on the site or through the toolkit. |
| For tool builders | [schema-dist](https://github.com/OnlyWorlds/schema-dist): the generated distribution, its decoder (the walk), and the ruling table. Vendor it rather than writing a parser of your own. |

