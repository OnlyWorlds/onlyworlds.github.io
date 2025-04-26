---
layout: default
title: Core Concepts
nav_order: 3
has_children: false
has_toc: true
---

# Core Concepts

This section explains the fundamental ideas and design principles behind the OnlyWorlds standard.

## Structured Data: A Common Language

The heart of OnlyWorlds is a **standardized data structure**: a common language for describing worlds. It defines how information about characters, locations, objects, events, and other world facets is organized and interlinked.

By providing a consistent format, the standard allows different software applications to understand and interact with the same world data. Elements have defined categories and fields, ensuring that essential information is captured in a predictable way.

All world elements share a common set of **base fields**:
*   `Id` 
*   `Name`
*   `Description`
*   `Supertype` and `Subtype` (for classification, see Typings below)
*   `Image_URL`
*   `World` (linking back to the world it belongs to)

Each specific [Category](../specification/categories.md) then adds its own unique fields relevant to that type of element.

## Interoperability: Breaking Down Walls

A primary goal of this standard is **interoperability**. By defining world data in a shared format, creators are not locked into a single tool or platform.

You can:
*   Build your world's history and lore in a writing tool.
*   Visualize its geography using a mapping application.
*   Manage character relationships in a dedicated database.
*   Simulate events or integrate the world into a game engine.

This **data portability** ensures that your creative work remains accessible and usable across different tools, now and in the future.

## Flexibility: Adapting to Your World

While structure enables interoperability, the standard is also designed for **flexibility**. The aim is to define high-level abstractions that can represent diverse worlds, from low-magic fantasy to space opera to realistic historical settings.

The system uses:
*   **[Categories](../specification/categories.md):** Broad classifications for different types of world elements (Character, Location, Object, etc.).
*   **[Fields](../specification/fields.md):** Specific attributes for each category, capturing relevant details.
*   **[Typings](../specification/typings.md):** A customizable, optional system of 'Supertypes' and 'Subtypes' for finer-grained classification within categories.

Finding the perfect balance between structure and flexibility is an ongoing process. The goal is not a rigid, universal truth, but a useful and intuitive foundation adaptable to a wide range of creative needs.

## Open Standard & Community Driven

OnlyWorlds is developed as a **free and open-source standard**, rooted in years of research and experimentation: from personal interest in translating complex world dynamics into flexible, usable data structures. The initial design draws heavily from work that includes exploring political power modeling (see ["Power Scheming" Thesis](link-to-thesis-if-available)) and practical applications like reconstructing ancient Sicily for simulation (WorldSmith project).

However, this specification should be seen as a **well-researched starting point**, not a rigid proposal. Defining a truly universal language for world-building is an immense challenge. The goal is for this initial framework, representing one developer's focused effort, to serve as a foundation that an interested community can build on.

The standard is intended to evolve based on this **community feedback and collaboration**. Suggestions for improving categories, fields, relationships, or the overall structure are actively encouraged through channels like [Discord](https://discord.gg/twCjqvVBwb) and [GitHub Discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions). Such a collaborative approach is essential to ensure any future standard meets the diverse needs of world builders, storytellers, academics, game masters, and developers.

 