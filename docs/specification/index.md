---
layout: default
title: Specification
nav_order: 3
has_children: true
has_toc: false
---  
  

OnlyWorlds is a standard for representing worlds as a **structured data format**. 
A world is defined by its overall metadata, collections of core elements, the specific fields describing these elements, and the defined relationships between them.

The standard focuses on representing the textual and semantic data of a world rather than raw graphical assets (like 3D models or complex terrain geometry). It is structured in human-readable [YAML files](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema) that are auto-converted to other languages for integration with other software and services.
 

### Key Concepts

* **Worlds**: Top-level entity that encapsulates and contextualizes a set of interlinked elements.
* **Elements**:  The discrete, identifiable components that populate a World.  
* [**Element Categories**](element_categories/): The various types (currently 22) of elements (e.g., Character, Location, Object, Event).  
* [**Fields**](fields/): Properties that describe an element. These include a set of common **base fields** shared by all elements, plus **custom fields** specific to each category. 
* [**Typings**](typings/): An optional, customizable system for finer-grained classification within Categories, using 'Supertypes' and 'Subtypes'. This system is a work in progress.  



  
