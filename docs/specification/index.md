---
layout: default
title: Specification
nav_order: 3
has_children: true
has_toc: false
---  
  

OnlyWorlds is a standard for representing worlds in a **structured data format**. 

Worlds are primarily defined by their **elements**: these represent everything that exists in your world, as physical entities or  abstract concepts. There are 20 categories of elements, each with a set of fields that describe them and the relationships between them.

These textual definitions are structured in human-readable [YAML files](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema) that are auto-converted to other programming languages for integration with other software and services.

This means that worlds consist of textual and semantic data rather than raw graphical assets (like 3D models or terrain geometry). Each world, however, can host any number of 2D or 3D maps that elements can be placed into.
 

### Key Concepts

* **Worlds**: Top-level entity that encapsulates and contextualizes a set of interlinked elements.
* **Elements**:  The discrete, identifiable components that populate a World.  
* [**Element Categories**](element_categories/): The various types (currently 22) of elements (e.g., Character, Location, Object, Event).  
* [**Fields**](fields/): Properties that describe an element. These include a set of common **base fields** shared by all elements, plus **custom fields** specific to each category. 
* [**Typings**](typings/): An optional, customizable system for finer-grained classification within Categories, using 'Supertypes' and 'Subtypes'.  



  
