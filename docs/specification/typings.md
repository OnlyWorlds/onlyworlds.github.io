---
layout: default
title: Typings
parent: Framework
nav_order: 4
---

## Supertypes and Subtypes

The **Typings System** in OnlyWorlds is a classification structure designed to further organize elements within each category. 

It uses **supertypes** and **subtypes** to add additional layers of specificity, both for organizational purposes and to enable functional relationships between elements. 

Each element in a category is first classified into a **supertype**, which is a broad classification that defines the general nature of the element. Supertypes serve as an additional layer of categorization within a category, helping to group similar elements.

Within each supertype, there are **subtypes**, which provide a more granular classification of the element. Subtypes allow for a greater level of detail and distinction between elements.

For example, within the **Location** category:
- There is currently a **supertype** called **Settlement**
- Subtypes under this supertype include **City**, **Town**, **Village**, and **Hamlet**

Beyond classification and filtering, types can also pdefine functional relationships between elements: some fields in an element can only link to other elements that have a specific **supertype** or **subtype**. 

For instance:
- **Location** elements have a **Buildings** field that links to other **Location** elements, but only those that have a **Building** supertype
- **Location** elements also have a **Primary Industry** field that links to any **Construct** element that has both a **Solution** supertype and **Industrial** subtype

The current supertypes and subtypes system is still under active development. While it provides structure and functionality, not all categories have supertypes and/or subtypes implemented yet, and the current technical implementation is rudimentary.

One potential long term approach is to introduce **custom templates**, allowing supertypes and subtypes to be adapted based on the theme or genre of a world. These templates would enable flexibility while maintaining the underlying structure and functionality. For example, a **Fantasy** setting might use subtypes like **City**, **Village**, and **Fortress** under the **Location** supertype, while a **Sci-Fi** world might use **Megalopolis**, **Outpost**, and **Colony**. 


