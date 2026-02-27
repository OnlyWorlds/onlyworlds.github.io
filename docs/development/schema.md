---
layout: default
title: schema
parent: development
nav_order: 1
---

The onlyworlds schema defines the 22 element categories and their field definitions and relations in YAML format.

**Repository**: [github.com/OnlyWorlds/OnlyWorlds](https://github.com/OnlyWorlds/OnlyWorlds)

## Source Schema

The authoritative schema lives in the `/schema` directory as YAML files. Each element category has its own schema file defining available fields, types, and validation rules. A base_properties schema file defines base fields common to all element categories.

Version tracking is maintained in the repository's VERSION file.

## Precompiled Languages

The repository includes ready conversions in `/languages`. These update automatically on schema changes. You can request or propose new languages to be added here. Make sure to include a conversion script if you propose a new language.


For details on schema definition, visit the [schema](/docs/schema/) page.

