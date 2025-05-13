---
layout: default
title: Relation
parent: Element Categories
grand_parent: Specification
nav_order: 14
---

# Relation

**Definition**

*A connection or interaction between two or more entities within the world*

Relation is a functional element that details a shared state of information between Characters, Creatures, and Institutions

**Examples**
- A man and their dog
- A rivalry between two scholars
- A debt owed between a merchant and a noble

**[Discussion](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/Relation)**

Potential alternate names: *Connection, Association, ..*


---
### Nature
- **History**: Historical background of the relationship, outlining its origins and development.
- **Impact**: The overall effect or influence the relationship has had on the entities involved.
- **Start_date** (#): The date on which the relationship officially began.
- **End_date** (#): The date on which the relationship officially ended, if applicable.
- **Debt** (#): Any obligations or debts incurred due to the relationship.
- **Events** (multi-link: Event): Significant events that have occurred within the context of this relationship.

### Involves
- **Primary_character** (single-link: Character): The main character involved in the relationship.
- **Primary_creature** (single-link: Creature): The main creature involved in the relationship.
- **Primary_institution** (single-link: Institution): The main institution involved in the relationship.
- **Secondary_characters** (multi-link: Character): Other characters who are significantly involved in the relationship.
- **Secondary_creatures** (multi-link: Creature): Other creatures that play a significant role in the relationship.
- **Secondary_institutions** (multi-link: Institution): Other institutions that are significantly involved in the relationship.

