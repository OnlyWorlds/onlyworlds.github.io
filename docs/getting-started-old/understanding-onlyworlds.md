---
layout: default
title: Understanding OnlyWorlds
parent: Getting Started (Old)
nav_order: 0
---

# Understanding OnlyWorlds

Fictional worlds contain recurring structural patterns. Middle-earth has hobbits traveling between settlements. Westeros has noble houses competing for control of territories. Dune has factions controlling resource production. Historical settings follow similar patterns: Rome had institutions governing provinces, families accumulating wealth, and political figures shifting between allegiances.

These worlds exist in different media formats. Novels contain prose descriptions. Games store data in proprietary engines. Historical records sit in academic databases. Each format is incompatible with the others.

OnlyWorlds is a standard format for representing world data. It defines 22 element categories and their relationships. A character in any world has a name, description, current location, and connections to other elements. An institution has members, territories, and resources. These definitions apply whether describing House Stark, the Roman Senate, or the Spacing Guild.

Software that implements the OnlyWorlds standard can work with any world following the specification. A mapping tool can display character locations from Middle-earth or ancient Rome. A political simulator can model power dynamics in Westeros or Renaissance Florence. The same structured data works across different applications.

## Structure and computation

Text descriptions store information for human readers. Structured data enables software operations. When a character's location is a defined field rather than buried in prose, maps can display positions. When institutions have explicit member lists, relationship networks become calculable. When resources have numeric values, economic simulations become possible.

The OnlyWorlds format makes these computational operations consistent across worlds. Character location works the same way for hobbits and Roman senators. Institution membership follows identical patterns for noble houses and merchant guilds.

## The 22 element categories

The standard organizes world components into categories: Character, Location, Object, Event, Family, Institution, Creature, Language, Law, and others. Each category has defined fields. Characters have birthplace and current location. Events have time and place. Institutions have members and territories.

These categories resulted from iterative testing. Early frameworks from thesis research explored political power dynamics through Character, Material, and Institution types. Subsequent iterations translated text from novels and historical sources, identifying missing elements and refining definitions. The current 22 categories represent patterns found across diverse worldbuilding contexts.

## Data portability

OnlyWorlds data exists as structured text files. Any software can read and write this format. The specification is open source without licensing restrictions. Developers can create tools without permission or payment.

This independence from specific software means worlds can move between applications. Character backgrounds written in one tool transfer to mapping software without conversion. Political relationships defined in a game engine work in visualization tools. The data remains consistent because all tools follow the same specification.

## Computational worldbuilding

Structured world data enables new interactions with fictional settings. Political simulations can track power shifts when a character changes allegiance. Economic models can calculate trade disruptions when a location changes ownership. Social networks can generate storylines based on relationship patterns.

The description field in every element preserves narrative text. Prose descriptions of characters, detailed histories of locations, and atmospheric descriptions of events remain part of the data. The structure adds computational capabilities without removing narrative content.

---

**Next: [Your First World](my-first-world)** - Create your first OnlyWorlds elements with a hands-on tutorial.