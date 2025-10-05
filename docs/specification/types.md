---
layout: default
title: types
parent: Specification
nav_order: 4
has_toc: false
---
 

# Types

An optional classification system that adds genre-specific detail to your elements. Types help categorize elements within their base categories for better organization and discovery.

---

## Current Implementation

Elements can optionally include:
- **`supertype`** - Primary classification within a category
- **`subtype`** - Secondary classification within the supertype

Both fields accept any string value. Some pre-made default values are available for most categories.

### Examples

**Fantasy Character:**
- Category: `Character`
- Supertype: `Humanoid`
- Subtype: `Elf`

**Sci-fi Location:**
- Category: `Location`
- Supertype: `Spaceborne`
- Subtype: `Station`

---

## Important Notes

### 🚧 Draft Status

The current suggested supertypes and subtypes in the schema are:
- **Incomplete** - Many categories lack suggestions entirely
- **Draft quality** - Existing suggestions are preliminary
- **Not enforced** - You can use any values that fit your world
- **Subject to change** - Will be revised based on community feedback

### 🔮 Future Direction

This system is a placeholder for a more robust template system that will:
- Allow **genre-specific templates** (Fantasy, Sci-fi, Historical, etc.)
- Support **custom templates** for unique world types
- Provide **validation rules** and restrictions for consistency  
 