---
layout: default
title: Specification
nav_order: 4
has_children: true
has_toc: false
---

## Data Structure

OnlyWorlds is a standard for representing worlds as  a **structured data format**.   
Within this structure, each world
* Has defined metadata (name, owner, description, etc.).
* Contains a series of elements, organized into logical categories (Character, Location, Object, Event, etc.).
* These elements have specific fields. All elements share a set of common **base fields** and each category has its **own specific fields**.
* Relationships between elements are defined through these fields (e.g. Character X is at Location Y and is of Species Z).

This structure is primarily designed to be represented as human-readable, text-based data (YAML as the base language), making it easy for different tools and developers to work with.

## Key Concepts

* **Categories**: Different types of world elements (Character, Location, Object, Event, etc. - see the full list in the [Specification](../specification/)).
* **Fields**: Properties that describe an element. These include common **base fields** (like `Name`, `Id`, `Description`) shared by all elements, plus fields specific to each category.
* **Typings**: Sub-classifications within categories. These consist of 'Supertypes', each of which has a list of 'Subtypes'. This system is customizable, optional, and a work in progress. 


## Element Fields

All world elements share a common set of **base fields**:
*   `Id` 
*   `Name`
*   `Description`
*   `Supertype` and `Subtype` (for classification, see Typings below)
*   `Image_URL`
*   `World` (linking back to the world it belongs to)

Each specific [Category](../specification/categories.md) then adds its own unique fields relevant to that type of element.

  
