---
layout: default
title: Specification
nav_order: 4
has_children: true
has_toc: false
---

# Specification Overview

This section details the technical specification of the OnlyWorlds data standard. It defines the structure used to represent worlds and their components.

The specification is built around several key components:

*   **[World Metadata](/docs/specification/world-metadata):** Defines properties of the world itself (name, description, version, etc.).
*   **[Categories](/docs/specification/categories):** The fundamental types of elements that make up a world (e.g., Character, Location, Object).
*   **[Fields](/docs/specification/fields):** The specific data attributes associated with each element, including common base fields and category-specific ones.
*   **[Typings](/docs/specification/typings):** A system for sub-classifying elements within categories.

Navigate through the child pages to understand each component in detail. The goal is a structured yet flexible format suitable for diverse world-building needs and tool integration.

OnlyWorlds are defined through a single JSON file that encapsulates [world metadata](/docs/framework/world-metadata/) and the world elements that make up the structure of your world.

These elements are divided into 18 distinct [categories](/docs/framework/categories/), designed to represent all aspects of world building.

Each category is configured with its own set of [fields](/docs/framework/fields/), which are named attributes capable of holding text, numeric values, or links to other elements.

Additionally, each category includes a system of [typings](/docs/framework/typings/), which are sub-categorizations that further refine and organize the elements within the world.
 





