---
title: Conventions
description: How to model a world with the categories and fields the schema already has.
---

The standard covers most worlds with the categories and fields it has. Before reaching for a new field or category, check whether one of these conventions carries the case. When none does, the [Council](https://council.onlyworlds.com) is where the standard changes.

## Use only what you need

A world can use any subset of the categories. Only `name` is required on an element, so a world of nothing but Objects is a valid world, and most tools work with two to four categories.

## Supertype and subtype are the world's own categories

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

## Choosing between neighbouring categories

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

## Zones take their shape from Markers

A Zone has no geometry of its own. Its shape on a [Map](/docs/schema/element_categories/map) is a set of [Markers](/docs/schema/element_categories/marker), each linked to the Map and the Zone, at an `x`/`y` coordinate, with an `order` that sequences them into a polygon or line (`0` is the first point). Markers are boundary points and usually carry an empty name. A [Pin](/docs/schema/element_categories/pin) places one element of any category at one point on one Map.

## Time and units

Dates are integers in the world's own time units, set on the [world](/docs/schema/worlds): a Character's `birth_date`, an Event's `start_date` and `end_date`, a Relation's span. Height, weight, elevation, range and speed use the world's units, named by `length_unit`, `mass_unit` and `distance_unit` on the [world](/docs/schema/worlds#units) (free text such as `cm`, `kg` or `km`). All numbers are whole, and the API truncates decimals, so choose units small enough that values come out whole.

## Story and description

On a [Narrative](/docs/schema/element_categories/narrative), `story` holds the content of the narrative, as told or remembered. `description`, the base field every element has, holds details about it. Put the text of a tale, a chronicle or a message in `story`, and an account of it in `description`.

## Messages between members

In-world messages are [Narratives](/docs/schema/element_categories/narrative) with supertype `Message`. The `narrator` is the Character credited with the message, and `characters` names its recipients, so a member's inbox is one filtered read:

```http
GET /api/v2/narrative/?supertype=Message&characters=<character-id>
```

`narrator` is what a message claims; the element's `created_by` is what the server recorded. [Members](/docs/development/api/members) covers the roster that joins the two.

## Data the schema does not model

Two places hold what the categories have no field for:

- **Extension fields** (`x_*`) on the element itself, for small amounts of tool-specific data. They are stored and returned verbatim, up to 64 KB per element. See [Fields](/docs/schema/fields#extension-fields).
- **Your own database**, beside the world, for high-volume data such as logs, statistics or simulation state. Key each row by the element's `id`.

Data in either place travels only to the tools that read it. Anything another tool should understand belongs in the schema's own fields, or in a published extension profile: a named extension field that tools agree to read the same way. Profiles are published, each a page in schema-dist's [`profiles/`](https://github.com/OnlyWorlds/schema-dist/tree/main/profiles) folder:

- **[`x_identity_key`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/identity.md)**: the same being in several worlds. Two Characters or Creatures carrying the same UUID are one being; a value that is not a UUID means nothing, and a tool that lets people add their own fields reserves the `x_identity_` prefix.
- **[`atlas_calendar`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md)**: a world's own calendar, the names it gives its time line. It changes no date. Read by Atlas and by the TypeScript and Unity SDKs; it keeps its name from before the profile grammar.
- **[`x_room_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md)** (serial 45): marks an element as part of a parlor's room, the world's or a sitting's id; with one of eight type-and-supertype pairs it makes a room element, which a lore view leaves out unless asked, and the TypeScript and Python SDKs export `ROOM_PAIRS` and `isRoomElement` / `is_room_element`.
- **[`x_checks_rules`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/checks.md)** (serial 47): a work world's house rules as a machine can check them, on the Charter beside the text a person reads: the newest Law with supertype Charter made by the owner or a co-builder, the one keel names in [`front_door`](/docs/development/api/members#the-front-door) (keel #558); a Law with supertype Charter made by anyone else is never the house rules. Each rule is its sentence plus one check from a closed set (a field present, a text matching a pattern, a link field holding at least n ids, a value from a list), scoped by type and optionally supertype or subtype; a reader reports how many elements each rule scoped and which fall short, and names by name any rule it cannot apply, never passing it silently. The Python package's doctor reads it from 0.24.0, from the Charter only since 0.28.0.
- **[`x_names`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md)** (serial 48): a world's own words for the 22 types, on the World. In a work world a Character shows as *Employee*, an Institution as *Team*. Only what a person reads changes: the API, the folder, its directory names and every id keep the standard's names, and a tool that never reads the map shows Character as always. The TypeScript and Python SDKs' `typeWord` / `type_word` give the word to print. onlyworlds.com does not store `x_` keys on the World yet (keel #571 adds it); until then a folder's `world.json` carries the map.

Two more mark work on a world:

- **[`x_packet_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/packet.md)**: a packet of work about a world, a Relation with supertype `Work item` listing elements with a reason each (`x_packet_elements`), the world they belong to (`x_packet_source`) and the tool that made it (`x_packet_producer`); the Relation's own link fields carry the same elements, and the subtype is its state (`open`, `taken`, `done`). The [Python doctor](/docs/development/python#check-a-world)'s `--packet` prints its findings in this shape.
- **[`x_review_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)**: two marks on any element. `x_review_proposed` (`by`, `evidence`, `expires`) on a new element written as proposed, shown apart from settled elements until a keeper acts; `x_review_checked` (`by`, `at`, `against`) records who last confirmed it true, when, and against what. A proposed change to an existing element is a [proposal](/docs/development/api/proposals) beside it, not this mark.

A new profile's field is named `x_<profile>_<field>`.

