---
title: Conventions
description: How to model a world with the categories and fields the schema already has.
---

The schema covers most worlds with its 22 categories and their fields. Before reaching for a new field or category, check whether one of these conventions carries the case. When none does, the [Council](https://council.onlyworlds.com) is where the schema changes.

## Use Only What You Need

A world can use any subset of the categories. Only `name` is required on an element, so a world of nothing but Objects is a valid world, and most tools work with two to four categories.

## Supertype and Subtype Are the World's Own Categories

Every element has two free-text classification fields: `supertype`, the top-level category the element belongs to, and `subtype`, a further classification within it. The schema fixes no values, so each world defines its own: a Location with supertype `City` and subtype `Port`, an Institution with supertype `Guild`.

The API filters on both by exact value (`?supertype=City`), so keep the vocabulary consistent within a world. Some platform features use supertypes too: an agent's own Character has supertype `Agent`, and in-world messages are Narratives with supertype `Message` (see below).

## Links and Relations

A link field states that a connection exists: a Character's `location`, an Event's `characters`. Links point one way, from the element that holds the field.

When the connection itself has content, make it a [Relation](/docs/schema/element_categories/relation). A Relation is an element of its own, so it can carry what a link cannot:

| Relation field | Holds |
| :--- | :--- |
| `actor` | The primary Character defining the relation |
| `background` | History and origin of the relation |
| `start_date`, `end_date` | When it began and ended, in world time units |
| `intensity` | Significance, 0 to 100 |
| `events` | Events where the relation is involved |
| `characters`, `institutions`, `locations`, … | The elements it connects, across most categories |

If the Consul's ties to the Hegemony have a history and a span worth recording, they are a Relation; the Consul's current location is a link.

## Choosing Between Neighbouring Categories

The category definitions draw these lines themselves:

| Pair | The line |
| :--- | :--- |
| Character / Creature | A Character is "an individual with agency and the capacity to make choices"; Creatures "lack the strategic reasoning, narrative focus, or social complexity of Characters." |
| Institution / Collective | Institutions are "organized bodies with purpose and structure"; a Collective "acts as a unit but lacks formal governance or hierarchical structure." |
| Species / Collective | A Species is "a distinct biological or cultural form of life"; a Collective is "unified by shared traits, contexts, or purpose." |
| Object / Construct | Objects are "tangible, non-living things that can be made, owned, traded or destroyed"; Constructs are "non-physical, non-character entities that help explain or organize how the world works." |
| Phenomenon / Construct | Phenomena are "ongoing or emergent conditions... not defined by intent or agency"; Constructs are "frameworks that are made, sustained and lost over time." |
| Trait / Ability | Traits are "not active powers or learned abilities, but underlying aspects of identity"; an Ability is "a defined action, power, skill, or effect." |
| Event / Narrative | An Event is "a time-bound happening within the world"; Narratives are "stories told in your world, and can involve the organization or reinterpretation of Events." |
| Location / Zone | A Location is "a distinct place within the world where activities occur and elements converge"; Zones "are not defined by geometry themselves but gain spatial presence through linked map markers." |

## Zones Take Their Shape From Markers

A Zone has no geometry of its own. Its shape on a [Map](/docs/schema/element_categories/map) is a set of [Markers](/docs/schema/element_categories/marker), each linked to the Map and the Zone, at an `x`/`y` coordinate, with an `order` that sequences them into a polygon or line (`0` is the first point). Markers are boundary points and usually carry an empty name. A [Pin](/docs/schema/element_categories/pin) places one element of any category at one point on one Map.

## Time and Units

Dates are integers in the world's own time units, set on the [world](/docs/schema/worlds): a Character's `birth_date`, an Event's `start_date` and `end_date`, a Relation's span. Height and weight use the world's length and mass units. All numbers are whole, and the API truncates decimals, so choose units small enough that values come out whole.

## Story and Description

On a [Narrative](/docs/schema/element_categories/narrative), `story` holds the content of the narrative, as told or remembered. `description`, the base field every element has, holds details about it. Put the text of a tale, a chronicle or a message in `story`, and an account of it in `description`.

## Messages Between Members

In-world messages are [Narratives](/docs/schema/element_categories/narrative) with supertype `Message`. The `narrator` is the Character credited with the message, and `characters` names its recipients, so a member's inbox is one filtered read:

```http
GET /api/v2/narrative/?supertype=Message&characters=<character-id>
```

`narrator` is what a message claims; the element's `created_by` is what the server recorded. [Members](/docs/development/api/members) covers the roster that joins the two.

## Data the Schema Does Not Model

Two places hold what the categories have no field for:

- **Extension fields** (`x_*`) on the element itself, for small amounts of tool-specific data. They are stored and returned verbatim, up to 64 KB per element. See [Fields](/docs/schema/fields#extension-fields).
- **Your own database**, beside the world, for high-volume data such as logs, statistics or simulation state. Key each row by the element's `id`.

Data in either place travels only to the tools that read it. Anything another tool should understand belongs in the schema's own fields.

