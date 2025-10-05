---
layout: default
title: Your First World
parent: Getting Started
nav_order: 1
---

# Your First World
{: .no_toc }

Build Dan Simmons' Hyperion setting element by element, from the Consul's introduction to the Time Tombs.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Create your world

### Account setup

- Create an account at [onlyworlds.com](https://onlyworlds.com)
- Navigate to **Profile**
- Note your PIN (automatically created, changeable in the current password field)

{: .warning }
> This PIN authenticates your worlds in external tools. Keep it private.

### World creation

- Navigate to **Worlds**
- Click **+**
- Name your world "Hyperion"

{: .important }
> Your world's API key identifies this world for external tools. Anyone with this key and your PIN has full read/write access.

{: .note }
> **Share access** with other OnlyWorlds users (grants full access using their PIN). **Export to JSON** for local backup. **Import data** by pasting JSON into the Overwrite box.

---

## Create your first character

The [Character](/docs/specification/element_categories/character.html) category represents individuals.

- Click the <span class="material-symbols-outlined">person_4</span> **Character** icon
- Click **+**
- Name: "the Consul"
- Description: `Former diplomat to Bressia, member of the Shrike Pilgrimage. Carries his family's history with Hyperion and knowledge of the planet's political significance to the Hegemony.`
- **Save**

{: .important }
> All elements require a **name** field. Everything else is optional. The **description** field holds narrative text that doesn't fit elsewhere.

### Character fields

Characters have 33 specific fields beyond the 9 base fields.

- **physicality**: `Tall, muscular build, curly brown hair, prematurely graying`
- **mentality**: `Intelligent, burdened by secrets, conflicted loyalties`
- **status**: `alive`
- **age**: `~35`

Fill what you know. Leave the rest empty.

---

## Create your first location

- Click the <span class="material-symbols-outlined">castle</span> **Location** icon
- Create new [Location](/docs/specification/element_categories/location.html)
- Name: "Hyperion"
- Description: `Temperate planet on the edge of Hegemony space. Home to the Time Tombs and the Shrike. Features the Sea of Grass, the Briars, and the Pinion Plateau range.`
- **subtype**: `Planet`
- **Save**

### Connect character to location

- Navigate to the Consul
- **birthplace** field: Select "Hyperion"
- **Save**

{: .note }
> **birthplace** is a [single-link](/docs/specification/fields.html) field—references exactly 0 or 1 elements.

This structured relationship enables tools to display the Consul's origin on maps, filter characters by birthplace, and track family histories across locations.

---

## Create a creature

- Click the <span class="material-symbols-outlined">pets</span> **Creature** icon
- Name: "the Shrike"
- Description: `Metallic, thorn-covered creature associated with the Time Tombs. Appears throughout Hyperion's history in different time periods. Impales victims on the Tree of Pain. Possibly controls time or exists outside normal causality.`
- **physicality**: `Four meters tall, chrome-steel surface, covered in thorns, red eyes`
- **location**: "Hyperion"
- **danger_level**: `Extreme`
- **Save**

The Shrike's nature is unclear—motivations unknown, no human communication. It functions as a force of nature. If its sentience and agency were central to your world, you might use **Character** instead.

---

## Create a construct

The Time Tombs are built structures, not natural locations. [Construct](/docs/specification/element_categories/construct.html) represents this.

- Click the <span class="material-symbols-outlined">hard_hat</span> **Construct** icon
- Name: "the Time Tombs"
- Description: `Nine massive structures in the Valley of the Time Tombs on Hyperion. Origin unknown, possibly billions of years old. Move backward through time due to anti-entropic fields. House the Shrike. Include the Sphinx, the Jade Tomb, the Crystal Monolith.`
- **creator**: Leave empty (unknown)
- **date_created**: `Unknown (possibly far future)`
- **Save** (we'll link location next)

### Nested locations

The Time Tombs exist in a specific valley.

- Go to **Locations**
- Create "Valley of the Time Tombs"
- Description: `Desert valley in the Briars region containing the Time Tombs complex`
- **parent_location**: "Hyperion"
- **Save**

Return to the Time Tombs construct, set **location** to "Valley of the Time Tombs", and save.

{: .note }
> Location hierarchies: Hyperion (planet) → Valley of the Time Tombs (region) → Time Tombs (structures)

---

## Create objects

The Consul travels in a spacecraft adapted for diplomatic missions. [Object](/docs/specification/element_categories/object.html) represents movable, personal-scale items.

- Click the <span class="material-symbols-outlined">webhook</span> **Object** icon
- Name: "Consul's ship"
- Description: `Modified Hegemony diplomatic spacecraft capable of interstellar travel. Contains personal effects and classified data about Hyperion's history.`
- **owner**: "the Consul"
- **location**: "Hyperion"
- **Save**

### Object vs Construct

The ship is an **Object** because it's movable and personal-scale. The Time Tombs are a **Construct** because they're large and permanent. A massive generation ship might be a Construct. Choose based on scale and permanence.

Create two more objects:
1. "Shrike Cult medallion" - religious artifact, owned by the Consul
2. "Diplomatic credentials" - authorization documents, owned by the Consul

---

## Create an event

- Click the <span class="material-symbols-outlined">event</span> **Event** icon
- Name: "the Shrike Pilgrimage"
- Description: `Seven pilgrims selected by the Church of the Final Atonement travel to the Time Tombs to meet the Shrike. Each hopes to have their prayer granted. Takes place during the Fall of the Web as the Ousters invade Hyperion system.`
- **participants**: "the Consul"
- **locations**: "Hyperion", "Valley of the Time Tombs"
- **objects**: "Consul's ship"
- **time_start**: `3126 CE`
- **status**: `ongoing`
- **Save**

{: .note }
> Events tie multiple elements together through time. They can reference characters, locations, objects, creatures—anything involved.

---

## View relationships

You now have:
- 1 Character: the Consul
- 2 Locations: Hyperion, Valley of the Time Tombs
- 1 Creature: the Shrike
- 1 Construct: the Time Tombs
- 3 Objects: ship, medallion, credentials
- 1 Event: the Shrike Pilgrimage

These aren't isolated entries—they're connected through explicit relationships:

- The Consul was born on Hyperion, currently at Valley of the Time Tombs
- The Consul owns his ship, medallion, and credentials
- The Shrike is located on Hyperion
- The Time Tombs are in the Valley of the Time Tombs
- The Valley is part of Hyperion
- The Pilgrimage involves the Consul, occurs at Hyperion and the Valley, uses the Consul's ship

These relationships are queryable and actionable by any OnlyWorlds tool.

---

## Map your world

The [Map Tool](/docs/tools/map_tool.html) visualizes spatial relationships.

### Set current location

- Go to the Consul
- **location** field: "Valley of the Time Tombs"
- **Save**

{: .note }
> **birthplace** (where someone was born) differs from **location** (where they currently are).

### Create a map

- Open [Map Tool](https://onlyworlds.com/map_tool)
- Enter API key and PIN
- Click **Load World**
- Click **+**, name "Hyperion Surface", click **Create Map**

{: .important }
> OnlyWorlds doesn't host images. Provide a URL to an online image. Use any image host.

- Paste map image URL
- Click **Load Map**

### Place elements

- Find "Valley of the Time Tombs" in sidebar
- Click to select, click canvas where it should appear
- Click **Save New Map** (top right)

{: .warning }
> Maps aren't saved until you click **Save New Map**.

### Spawn characters at locations

Since the Consul's **location** is "Valley of the Time Tombs":

- Click the Valley's pin
- Click the sprout button in sidebar
- The Consul spawns at that location
- Save the map

### Map hierarchies

Valley of the Time Tombs has **parent_location** set to Hyperion. To visualize:

- Create a second map for Hyperion
- Use the dropdown (default "Global Map") to assign which location each map represents
- Load the Valley map
- Click the map icon next to Hyperion in sidebar
- The stack interface shows both maps in hierarchical order

{: .note }
> **Local maps** represent specific locations. **Global maps** don't represent any location. Local map stacks use parent_location relationships. Global maps form a single stack using hierarchy values.

---

## Element categories used

You've used 7 of the 22 element categories:
- **Character** for individuals
- **Location** for places
- **Creature** for non-human entities
- **Construct** for built structures
- **Object** for items
- **Event** for temporal occurrences
- **Map** for spatial visualization

Each category has specific fields. All follow the same base structure: `name`, `description`, `world`, `created_at`, `updated_at`, `image_url`, `supertype`, `subtype`.

## Relationships work

Connections between elements use two field types:
- **Single-link** fields (birthplace, location, owner) reference 0 or 1 element
- **Multi-link** fields (participants, objects, locations) reference any number

Tools use these relationships to filter, visualize, and navigate your world.

## The workflow

1. Create world container
2. Add elements
3. Connect elements through relationship fields
4. Visualize with tools
5. Export, expand, iterate

---

## Next steps

### Expand this world

Continue building Hyperion:
- **Characters**: the Poet, Scholar, Detective, Priest, Soldier, Templar
- **Locations**: Keats, Sea of Grass, Worldweb farcasters
- **Institutions**: Hegemony, Church of the Final Atonement, Ousters
- **Events**: Treaty of the Tombs, Ouster invasion, Fall of the Worldweb
- **Narratives**: Each pilgrim's tale

See [Specification](/docs/specification/) for complete field details per category.

### Try other tools

- **[Browse Tool](/docs/tools/browse_tool.html)** - Advanced element editing
- **[Parse Tool](/docs/tools/parse_tool.html)** - AI-powered text conversion
- **[Obsidian Plugin](/docs/tools/obsidian.html)** - Edit elements as markdown
- **[Mobile Companion](/docs/tools/mobile.html)** - Mobile world management

### Build your own tool

Everything here can be done programmatically. **[My First Tool](/docs/develop/my-first-tool/)** walks through building a Hyperion viewer using the REST API. The [Template Tool](https://github.com/OnlyWorlds/tool-template) provides an extensible foundation designed for LLM-assisted development—build custom tools without manual coding.

### Convert existing content

This entire Hyperion world could be built by parsing the novel's opening chapters instead of creating elements manually. **[Migration Guide](migration-guide/)** shows how to convert book text, campaign notes, WorldAnvil exports, or scattered documentation into OnlyWorlds format using free AI-powered tools.

---

Feedback: [GitHub discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/feedback-bug-reports)

---

**Previous: [Getting Started](.)** | **Next: [Migration Guide](migration-guide/)**