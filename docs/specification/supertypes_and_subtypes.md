---
layout: default
title: Supertypes and Subtypes
parent: Specification
av_order: 4
has_toc: false
---
 

The typings system provides an optional, additional layer of classification for elements within their main category, using the `Supertype` and `Subtype` base fields.
 

*   Both `Supertype` and `Subtype` fields accept simple string values. Enums of 'official' values are provided, but are not enforced and far from final
 *   This system is considered optional and is still in development. Not all categories have defined Subtypes or even Supertypes yet  
*   More formalized definition of valid typings per category within the schema is subject to community input and validation
*   Future tooling might integrate organizational or relational functionality based on typings
*   This might include a concept of **custom templates** where users could define their own typings relevant to their specific world's genre or theme (e.g., `Megalopolis`, `Outpost` for sci-fi Locations vs. `City`, `Fortress` for fantasy)


