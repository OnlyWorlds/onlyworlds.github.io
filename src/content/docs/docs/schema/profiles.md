---
title: Profiles
description: "The extension profiles: named fields and reading rules on the standard's types that every tool reads the same way, published in schema-dist."
---

A profile is a convention on the standard's types: a named extension field, or a rule for reading the fields the standard already has, that tools agree to read the same way. Each is a page in schema-dist's [`profiles/`](https://github.com/OnlyWorlds/schema-dist/tree/main/profiles) folder, beside the schema. Each entry below names the serial that first carried it: a serial is one numbered release of schema-dist ([its tags](https://github.com/OnlyWorlds/schema-dist/tags)). A new profile's field is named `x_<profile>_<field>`.

Three have pages of their own: [Messages](/docs/schema/profiles/messages), [Addresses](/docs/schema/profiles/addresses) and [Lenses](/docs/lenses).

## What every reader does

### Identity

**[`x_identity_key`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/identity.md)**: the same being in several worlds. Two Characters or Creatures carrying the same UUID are one being; a value that is not a UUID means nothing, and a tool that lets people add their own fields reserves the `x_identity_` prefix.

### Calendar

**[`atlas_calendar`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md)**: a world's own calendar, the names it gives its time line. It changes no date. Read by Atlas and by the TypeScript and Unity SDKs; it keeps its name from before the profile grammar. Version 2 (serial 68) adds a leap rule's exceptions and offset, enough for the Gregorian calendar.

### Charter

**[`x_charter_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/charter.md)** (since serial 82): marks a Law with supertype `Charter`, a Construct with supertype `Guide` or one with supertype `Domain` as one of the world's reading aids, read by its presence (any value but null, a string only when something is left after trimming); the value names the world it was written for. A tool's front door shows the aids first and its lore views leave them out; the same pair without the mark is lore (a kingdom's charter in a novel). Only a keeper writes the mark. The TypeScript and Python SDKs read it as `isCharterElement` / `is_charter_element` (4.98.0, 0.80.0)

### Strand

**[`x_strand`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/strand.md)** (since serial 98): a world in miniature, one story small enough to hold in one look, named on the World. The value is an object of three ids, `{"narrative": …, "event": …, "location": …}`: a Narrative (the story), one of the Events in its `events` (the happening) and one of the Locations in that Event's `locations` (where it happened). The hero is the story's `protagonist` and where the hero is now is the hero's `location`, so five slots rest on four links the standard already has. Only the story is required: `event` and `location` may be null or absent, a strand begun whose other slots are the next thing to make. Any other shape of the value is no mark, an empty string or a number in `event` or `location` included. A reader answers the five slots as one reader sees the world, plus whether then and now are the same place; a slot it cannot fill stays empty, never filled from another, and an empty slot is the next thing to make, not an error. The TypeScript and Python SDKs read it as `strandOf` / `strand_of` (4.119.0, 0.97.0; the strand begun 4.120.0, 0.98.0), and the front door's selection as `charterOf` / `charter_of` (4.100.0, 0.82.0).

### Room

**[`x_room_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md)** (since serial 45): a parlor is a chat room on a world, and it keeps its lines, board entries and work inside the world as ordinary elements. This mark tells them apart: it holds the id of the world the room belongs to, or of the workshop session (a sitting) it was made in. With one of nine type-and-supertype pairs it makes a room element, which a lore view (a list, search, a graph) leaves out unless asked and a public view never shows; the TypeScript and Python SDKs export `ROOM_PAIRS` and `isRoomElement` / `is_room_element`. The pairs, each compared trimmed and without regard to case: Narrative `Message` (a line in the room), Narrative `Board` (a board entry), Relation `Work item` (a packet of work), Construct `Spec` (a workshop's spec), Relation `Heart` (one person's heart on a spec or an item), Relation `Take` (one member's take on a work item, which also carries `x_room_item`, the item's id), Relation `Vote` (one person's ranked picks), Event `Sitting` (a workshop's sitting) and Character `Member` (a member's card in the room). The mark, not the word, makes the room: a Narrative with supertype Message and no `x_room_of` is lore and stays in view. Since serial 83 the mark is read by its presence, as `x_charter_of` is: any value but null, a string only when something is left after trimming.

### Message

**[The message](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/message.md)** (since serial 72): no field of its own, the one definition of a message's addressing, its sender's proof, the read mark, the thread and the Note beside it, as [Messages between members](/docs/schema/profiles/messages) says.

### Checks

**[`x_checks_rules`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/checks.md)** (since serial 47): a work world's house rules as a machine can check them, on the Charter beside the text a person reads: the world's Charter as the [charter profile](#charter) selects it: the newest marked Charter. Each rule is its sentence plus one check from a closed set (a field present, a text matching a pattern, a link field holding at least n ids, a value from a list), scoped by type (one, or a list) and optionally supertype or subtype; a reader reports how many elements each rule scoped and which fall short, and names by name any rule it cannot apply (a list naming a type the schema does not know, a field one listed type lacks, a pattern outside the regex subset Python and JavaScript share), never passing it silently. A known-of stub is judged by no rule: its missing fields are unknown, not short (since serial 64 the fixture holds two stub cases, a bare one and one with its fields filled, so every reader is tested on it). The Python package's doctor reads it from 0.24.0, from the Charter only since 0.28.0.

### Names

**[`x_names`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md)** (since serial 48): a world's own words for the 22 types, on the World. In a work world a Character shows as *Employee*, an Institution as *Team*. Only what a person reads changes: the API, the folder, its directory names and every id keep the standard's names, and a tool that never reads the map shows Character as always. A folder's `world.json` carries it. The TypeScript and Python SDKs' `typeWord` / `type_word` give the word to print.

### Spine

**[`x_spine_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/spine.md)** (since serial 55): a world that maps a software ecosystem, what is built, the contracts it speaks, where each thing lives and who keeps it. Each kind is an element type with a supertype from a closed list (`Package`, `Repo`, `Profile`, `Charter`…); ownership is a Title with supertype `Seat` and the elements it links; thirteen `x_spine_*` keys carry what no field holds (address, truth, access, status, layer, audience, depends on, probe, what the probe last read, verified, the keeping seat's name on a public projection, the projection's source on its World, and the row a retirement Event retires). It counts days from 2012-01-01 and ships the calendar that reads them. The Python package reads it (`read_spine_element`); its 44 fixture cases are the test.

### Packet

**[`x_packet_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/packet.md)**: a packet of work about a world, a Relation with supertype `Work item` listing elements with a reason each (`x_packet_elements`), the world they belong to (`x_packet_source`) and the tool that made it (`x_packet_producer`); the Relation's own link fields carry the same elements, and the subtype is its state (`open`, `taken`, `done`). The [Python doctor](/docs/development/python#check-a-world)'s `--packet` prints its findings in this shape.

### Review

**[`x_review_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)**: two marks on any element. `x_review_proposed` (`by`, `evidence`, `expires`) on a new element written as proposed, shown apart from settled elements until a keeper acts (an empty value, `""`, `[]` or `{}`, is no mark: the API refuses a write carrying one with `422` [`review_mark_empty`](/api/errors/#review_mark_empty), and reads a stored one as absent, since 2026-10-29); `x_review_checked` (`by`, `at`, `against`) records who last confirmed it true, when, and against what. A proposed change to an existing element is a [proposal](/docs/development/api/proposals) beside it, not this mark. The TypeScript and Python SDKs read the mark with `proposedMarkOf` / `proposed_mark_of` and `handsOnAsProposed` / `hands_on_as_proposed`.

### Record

**[`x_record`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/record.md)** (since serial 102): a game's run kept in the world its Characters live in, so a character carries what they did from run to run. The run is an Event carrying the mark `x_record`: `tool` (the game's id in the tools list's form) and `played_at` (when it was played, RFC 3339 in UTC, a real calendar instant) are required; `version`, `seed` (a string), `outcome` (one lowercase word, 1 to 24 letters, such as `won` or `sunk`) and `seats` (a Character's id to the seat in the game's own words) are optional. Anything else in the value is no mark. The game keeps its own tally beside it under its own prefix, which the profile never reads. Who took part is the Event's `characters`, and nothing else. A Narrative that lists the Event in `events` and names a Character as `protagonist` (a story about them) or `narrator` (their own account) is that Character's story of the run. A run or a story still proposed is not read until a keeper settles it. A game writes the run and never edits an existing element: a character's experience is read from their records, never written into their fields. The recommended words are `Record` as the Event's supertype and the game's word as its subtype (`Battle`, `Crossing`); no reader keys on them. The TypeScript and Python SDKs read a Character's records, newest first, as `recordsOf` / `records_of` (4.124.0, 0.100.0).

### Landing

**[The landing](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/landing.md)** (since serial 103): the first picture of a world wherever a visitor arrives at it, such as an account's OnlyWorld on onlyworlds.com's landing. It adds no field. It reads the graph the [lens profile](/docs/lenses) defines for the visitor, so it shows exactly what they may see and nothing more. A real world shows its most-linked Characters, each with the elements one link away. A small world, with fewer elements in the visitor's graph than a size (24 by default), shows its gaps first: orphans and near-orphans, a Character whose `location` names no Location in the visitor's graph, and a Location no Character's `location` names. Any door may serve the answer, keyless or signed in, each read from the graph that door's reader is served; a key beside the five (onlyworlds.com's `baked`, its `lenses`) is the door's own and outside the profile, so a reader reads the five and passes the rest through. The packages' reader is `landingOf` in TypeScript and `landing_of` in Python (4.127.0, 0.102.0).

### Map space

**[Map space](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/map-space.md)** (since serial 105): how a reader turns a world's Maps, Zones, Markers and Pins into geometry. It adds no field and stores nothing; the standard already says what each field means, and this page states the reading once, with a fixture of 34 cases. It reads the elements as the reader is served them, so a hidden Zone and its Markers are not in a member's or a visitor's input and never come back. The answer has four parts, `{ maps, zones, pins, out }`, its coordinates whole numbers in the Map's pixels:

- `maps`: each Map's frame (`width`, `height`, `depth`, `z_max`, `scale`, `location`, `parent_map`). `scale` is metres per pixel, read from `x_metres_per_pixel` when the Map carries a positive number there, else `null`. A Map without a `width` or `height` reports the extent of its own placed points there (a point whose zone or map is not served, or without a whole `x` and `y`, measures nothing), marked `extent: "points"`.
- `zones`: one outline per Map a Zone has placed Markers on, its points taken from the Markers in `order`, then by id. `shape` closes it as a `polygon` or leaves it a `line`; empty, absent or any other value reads as `polygon`, `Line` included.
- `pins`: each Pin's point, with the element it stands for as `element_type` and `element_id`, both `null` for a Pin with neither or only one of the two.
- `out`: what the reading left aside, counted by reason: `no_point`, `no_markers`, `dangling`, `no_map`.

`x` and `y` count from the bottom left. `z` is a point's elevation upward, never a height: a Marker at `z` 300 sits 300 pixels up, and a `z` that is missing or not a whole number reads as 0. A `z` past the Map's `depth` is kept as written, and the Map's `z_max` shows the overrun. Two rows of one type with one id read as the last one served, and `type` is read as written: `Map` is no Map. The packages' reader is `mapSpace` in [TypeScript](/docs/development/typescript#lenses) and `map_space` in [Python](/docs/development/python#what-it-covers) (since 4.129.0 and 0.104.0; serial 106's rules since 4.129.1 and 0.104.1).

### Import map

The import map is not a field at all, but a table an import tool reads when it brings a world in from another tool.

**[The import map](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/import-map.md)** (since serial 67): for each source tool, the words its users write for their own categories, each mapped to one of the 22 types (`city` to Location, `organization` to Institution). LegendKeeper's table is the first. An import tool offers the table and applies it only on the user's yes; it never types anything silently. The [Python package](/docs/development/python)'s LegendKeeper door reads it since 0.58.0.

## On onlyworlds.com

- **[`x_charter_of`](#charter)**: the front door ([`front_door`](/docs/development/api/members#the-front-door)) names the Charter the profile selects, the newest marked Charter, and serves the three aids as [`reading_aids`](/docs/development/api/members#reading-aids).
- **[`x_names`](#names)**: onlyworlds.com stores it on the World since 2026-10-23.
- **[`x_strand`](#strand)**: onlyworlds.com stores it on the World and serves it only to a reader who can see the story it names (a story known only by name counts), so a guest or a stranger who cannot gets no key; the owner and co-builders read it as stored (since 2026-10-31). The front door serves the reading itself: [`reading_aids.strand`](/docs/development/api/members#reading-aids) on `GET /me` and an agent's join reply holds the six slots as the key reads the world, all of them `null` when there is no strand in its view (serial 100). The world page's Overview draws it after the Charter, Start here and the Domains, an empty slot as "Not yet".
