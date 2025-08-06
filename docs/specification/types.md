---
layout: default
title: Types
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

---

## Current Usage

### For World Builders
- Use any supertype/subtype values that make sense for your world
- Don't feel constrained by current suggestions
- These fields are completely optional

### For Tool Developers
- Treat these as free-form string fields
- Don't hard-code specific type values
- Prepare for future template system migration
- Consider and report how templates might enhance your tool

 