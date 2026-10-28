---
title: Profiles
description: "The extension profiles: named fields and reading rules on the standard's types that every tool reads the same way, published in schema-dist."
---

A profile is a convention on the standard's types: a named extension field, or a rule for reading the fields the standard already has, that tools agree to read the same way. Each is a page in schema-dist's [`profiles/`](https://github.com/OnlyWorlds/schema-dist/tree/main/profiles) folder, beside the schema. A new profile's field is named `x_<profile>_<field>`.

Three have pages of their own: [Messages](/docs/schema/profiles/messages), [Addresses](/docs/schema/profiles/addresses) and [Lenses](/docs/lenses).

## What every reader does

### Identity

**[`x_identity_key`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/identity.md)**: the same being in several worlds. Two Characters or Creatures carrying the same UUID are one being; a value that is not a UUID means nothing, and a tool that lets people add their own fields reserves the `x_identity_` prefix.

### Calendar

**[`atlas_calendar`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md)**: a world's own calendar, the names it gives its time line. It changes no date. Read by Atlas and by the TypeScript and Unity SDKs; it keeps its name from before the profile grammar. Version 2 (serial 68) adds a leap rule's exceptions and offset, enough for the Gregorian calendar.

### Charter

**[`x_charter_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/charter.md)** (serial 82; the charter profile serial 83): marks a Law with supertype `Charter`, a Construct with supertype `Guide` or one with supertype `Domain` as one of the world's reading aids, read by its presence (any value but null, a string only when something is left after trimming); the value names the world it was written for. A tool's front door shows the aids first and its lore views leave them out; the same pair without the mark is lore (a kingdom's charter in a novel). Only a keeper writes the mark. The TypeScript and Python SDKs read it as `isCharterElement` / `is_charter_element` (4.98.0, 0.80.0), and the front door's selection as `charterOf` / `charter_of` (4.100.0, 0.82.0).

### Room

**[`x_room_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md)** (serial 45; the ninth pair serial 66): marks an element as part of a parlor's room, the world's or a sitting's id; with one of nine type-and-supertype pairs it makes a room element, which a lore view leaves out unless asked, and the TypeScript and Python SDKs export `ROOM_PAIRS` and `isRoomElement` / `is_room_element`. The pairs, each compared trimmed and without regard to case: Narrative `Message` (a line in the room), Narrative `Board` (a board entry), Relation `Work item` (a packet of work), Construct `Spec` (a workshop's spec), Relation `Heart` (one person's heart on a spec or an item), Relation `Take` (one member's take on a work item, which also carries `x_room_item`, the item's id), Relation `Vote` (one person's ranked picks), Event `Sitting` (a workshop's sitting) and Character `Member` (a member's card in the room). The mark, not the word, makes the room: a Narrative with supertype Message and no `x_room_of` is lore and stays in view. Since serial 83 the mark is read by its presence, as `x_charter_of` is: any value but null, a string only when something is left after trimming.

### Message

**[The message](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/message.md)** (serial 72; rule 1 serial 73; serial 75: the verified sender and the mark's last writer; serial 76: the trimmed list, the edit, Notes): no field of its own, the one definition of a message's addressing, its sender's proof, the read mark, the thread and the Note beside it, as [Messages between members](/docs/schema/profiles/messages) says.

### Checks

**[`x_checks_rules`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/checks.md)** (serial 47; serial 54 adds the list readings and three reader rules): a work world's house rules as a machine can check them, on the Charter beside the text a person reads: the world's Charter as the [charter profile](#charter) selects it: the newest marked Charter. Each rule is its sentence plus one check from a closed set (a field present, a text matching a pattern, a link field holding at least n ids, a value from a list), scoped by type (one, or a list) and optionally supertype or subtype; a reader reports how many elements each rule scoped and which fall short, and names by name any rule it cannot apply (a list naming a type the schema does not know, a field one listed type lacks, a pattern outside the regex subset Python and JavaScript share), never passing it silently. A known-of stub is judged by no rule: its missing fields are unknown, not short (since serial 64 the fixture holds two stub cases, a bare one and one with its fields filled, so every reader is tested on it). The Python package's doctor reads it from 0.24.0, from the Charter only since 0.28.0.

### Names

**[`x_names`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md)** (serial 48): a world's own words for the 22 types, on the World. In a work world a Character shows as *Employee*, an Institution as *Team*. Only what a person reads changes: the API, the folder, its directory names and every id keep the standard's names, and a tool that never reads the map shows Character as always. A folder's `world.json` carries it. The TypeScript and Python SDKs' `typeWord` / `type_word` give the word to print.

### Spine

**[`x_spine_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/spine.md)** (serial 55): a world that maps a software ecosystem, what is built, the contracts it speaks, where each thing lives and who keeps it. Each kind is an element type with a supertype from a closed list (`Package`, `Repo`, `Profile`, `Charter`…); ownership is a Title with supertype `Seat` and the elements it links; thirteen `x_spine_*` keys carry what no field holds (address, truth, access, status, layer, audience, depends on, probe, what the probe last read, verified, the keeping seat's name on a public projection, the projection's source on its World, and the row a retirement Event retires). It counts days from 2012-01-01 and ships the calendar that reads them. The Python package reads it (`read_spine_element`); its 44 fixture cases are the test.

### Packet

**[`x_packet_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/packet.md)**: a packet of work about a world, a Relation with supertype `Work item` listing elements with a reason each (`x_packet_elements`), the world they belong to (`x_packet_source`) and the tool that made it (`x_packet_producer`); the Relation's own link fields carry the same elements, and the subtype is its state (`open`, `taken`, `done`). The [Python doctor](/docs/development/python#check-a-world)'s `--packet` prints its findings in this shape.

### Review

**[`x_review_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)**: two marks on any element. `x_review_proposed` (`by`, `evidence`, `expires`) on a new element written as proposed, shown apart from settled elements until a keeper acts; `x_review_checked` (`by`, `at`, `against`) records who last confirmed it true, when, and against what. A proposed change to an existing element is a [proposal](/docs/development/api/proposals) beside it, not this mark. The TypeScript and Python SDKs read the mark with `proposedMarkOf` / `proposed_mark_of` and `handsOnAsProposed` / `hands_on_as_proposed`.

### Import map

The import map is not a field at all, but a table a door reads when it brings a world in from another tool.

**[The import map](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/import-map.md)** (serial 67): for each source tool, the words its users write for their own categories, each mapped to one of the 22 types (`city` to Location, `organization` to Institution). LegendKeeper's table is the first. A door offers the table and applies it only on the user's yes; it never types anything silently. The [Python package](/docs/development/python)'s LegendKeeper door reads it since 0.58.0.

## On onlyworlds.com

- **[`x_charter_of`](#charter)**: the front door ([`front_door`](/docs/development/api/members#the-front-door)) names the Charter the profile selects, the newest marked Charter, and serves the three aids as [`reading_aids`](/docs/development/api/members#reading-aids).
- **[`x_names`](#names)**: onlyworlds.com stores it on the World since 2026-10-23.
