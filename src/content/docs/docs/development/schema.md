---
title: "Schema"
description: "The onlyworlds schema defines the 22 element categories and their field definitions and relations in YAML format."
---

The onlyworlds schema defines the 22 element categories and their field definitions and relations in YAML format.

**Repository**: [github.com/OnlyWorlds/OnlyWorlds](https://github.com/OnlyWorlds/OnlyWorlds)

## Source Schema

The authoritative schema lives in the `/schema` directory as YAML files. Each element category has its own schema file defining available fields, types, and validation rules. A base_properties schema file defines base fields common to all element categories.

Version tracking is maintained in the repository's VERSION file.

## For tool builders

Typed clients live with the tools that maintain them (the TypeScript SDK on npm). Tool builders who decode the schema should use **[schema-dist](https://github.com/OnlyWorlds/schema-dist)**: the generated distribution, its decoder, and the ruling table.

For details on schema definition, visit the [schema](/docs/schema) page.
