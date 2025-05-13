---
layout: default
title: Typings
parent: Specification
av_order: 4
has_toc: false
---

# Typings (Supertype/Subtype System)

The Typings system provides an optional, additional layer of classification for elements within their main [Category](./categories.md). It uses two fields present in the [Base Fields](./fields.md) of every element:

*   `Supertype`
*   `Subtype`

## Purpose

Typings serve multiple purposes:

1.  **Organization:** Allows for finer-grained grouping and filtering of elements beyond their main category. For example, within the `Location` category, you could have a `Settlement` Supertype with Subtypes like `City`, `Town`, `Village`.
2.  **Functional Relationships:** Enables more specific linking between elements. Some fields might be restricted to only link to elements with a particular Supertype or Subtype. For instance:
    *   A `Location`'s `Buildings` field might only accept links to other `Location` elements that have the `Building` Supertype.
    *   A `Character`'s `Profession` field might link to an `Institution` element with the `Guild` Subtype.
3.  **Contextual Behavior:** Tools implementing the standard could potentially use Typings to alter behavior or display based on an element's specific type (e.g., displaying different icons for a `City` vs. a `Village`).

## Implementation Details

*   Both `Supertype` and `Subtype` fields accept simple string values.
*   The specific valid Supertypes and Subtypes available may depend on the element's Category.
*   Currently, the definition and enforcement of valid Typings are primarily handled by the tools using the standard, rather than being rigidly defined in the core schema itself.
*   This system is considered optional and is still evolving. Not all categories may have defined Typings yet.

## Future Directions

Potential future developments include:

*   More formalized definition of valid Typings per category within the schema.
*   The concept of **custom templates** where users could define their own Typings relevant to their specific world's genre or theme (e.g., `Megalopolis`, `Outpost` for sci-fi Locations vs. `City`, `Fortress` for fantasy).


