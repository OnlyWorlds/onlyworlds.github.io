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

In-world messages are [Narratives](/docs/schema/element_categories/narrative) with supertype `Message`. The `narrator` is the Character credited with the message, `characters` names its recipients, `story` is the body and `parent_narrative` the message it answers. The [message profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/message.md) is the one definition, with a conformance fixture every reader agrees on:

- **Addressed to a Character**: its id is in `characters`, or `characters` is empty, which means every member. So an inbox is not only a filtered read: `GET /api/v2/narrative/?supertype=Message&characters=<character-id>` misses the messages sent to everyone, so read the Messages and filter by the rule.
- **The sender is a claim until checked.** `narrator` is what a message claims; the element's `created_by` is what the server recorded. The sender is verified when the Character of that membership on the [members list](/docs/development/api/members) is the `narrator` (`created_by` null is the owner); otherwise it is a mismatch or unverifiable, and a reader says so rather than showing the name plainly. A message with no `narrator` is from nobody, not to everyone.
- **What a reader has read** is a Relation with supertype `Read`, `actor` the reader's Character and the ids read in `narratives`, counted only when the reader's own hand wrote it, and no other hand has changed it since (its `changed_by` is its `created_by`).
- **Unread for a Character** is the messages addressed to it, less the ids on its read mark and less its own messages. Read from the API, a message is its own only when the sender is verified, so one that merely claims to be from it still shows as unread; in a folder, where nothing records who wrote what, the `narrator` is trusted.
- **A list trimmed for its reader.** A key that may not see every Character is served a message with those ids left out, and `x_served_trimmed` names the field that lost one. An empty `characters` with that mark is to someone the reader cannot see, never to everyone, and a missing `narrator` with it is a sender the reader cannot see, never "from nobody". A request with no key gets no mark, so it never reads an empty list as "to everyone". A write carrying the mark is refused ([`served_trimmed_not_writable`](/api/errors/#served_trimmed_not_writable)); a trimmed list written back without it loses nobody.
- **An edit is a later hand.** When a message's `changed_by` is not its `created_by`, a reader says who edited it; the sender's answer stays the same.
- **A message stays a Narrative.** In an element list, a story's context or a Character's knowledge it reads like any other; an inbox or a thread reads it by these rules too.
- **A Note is not a message.** A Narrative with supertype `Note` is a member's own line in the world: addressed to nobody, never unread, never in an inbox or a thread. A Character's line is its newest Note in its own hand that is neither hidden nor proposed.

The TypeScript and Python SDKs carry the readers (`isMessage`, `isAddressedTo`, `isToEveryone`, `hasUnseenRecipients`, `senderStatus`, `readMarkOf`, `unreadFor`, `threadOf`, `editedBy`, `isNote`, `noteOf`, and their snake-case twins).

## Addresses

Every tool names an element by one triple: the world's id, the type word and the element's id. The [address profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/address.md) writes its three spellings once, so a link copied in one tool opens in another:

| Spelling | Form | Use |
|---|---|---|
| The human address | `https://www.onlyworlds.com/w/<world id>/<type>/<id>` | a link to give a person |
| Inside a world | `ow://<type>/<id>` | an element named in a text field of the same world |
| Across worlds | `ow://<world id>/<type>/<id>` | an element of another world, named in a text field |

A world by itself is `https://www.onlyworlds.com/w/<world id>` or `ow://<world id>`. An address may end in a moment, `@<step>` on its last path segment, and a lens, `?lens=<id>`. Addresses are written in lowercase and never percent-decoded; a reader refuses what the profile refuses, by the profile's own reason (`uppercase`, `segments`, `unknown_type`, `bad_id` and the rest). The TypeScript and Python SDKs carry the reader and the writer (`parseOwLink`, `elementAddress`, and their snake-case twins).

## Lenses

A lens is a saved way of reading a world: which elements, how far from a starting set, how much of each. It is a [Construct](/docs/schema/element_categories/construct) with supertype `Lens`, defined by the [lens profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/lens.md). A lens only narrows: it reads inside what the reader may already see, never more.

- **The anchors** are the lens's own links (its characters, locations, institutions and the rest), and nothing else. A lens that links other lenses through `constructs` is an umbrella of them; `titles` names the Titles it is the default for.
- **The recipe** sits in one extension field, `x_lens`: `depth` (0 the anchors only, 1 also what links to or from them, the default), `types`, a window back from the reading's date (`window`, or `from` and `to`), `undated`, `show` (`full`, `first_line`, `name`), `budget` (1 to 1000, default 50), `mail` and `notes` (a sentence per anchor). A value outside the profile's table makes the lens unreadable, the key named.
- **A template** is a lens with subtype `Template` and no anchors: it reads nothing until it is copied into a world and pointed at that world's things.
- **Reading one**: visibility comes first (a hidden or proposed element is not there to hop through), a hop reaches both ways, a Relation is crossed as an edge, a hop never crosses into or out of the room, and a date compares at the precision it states. What the budget or a rule leaves out is counted by reason, never dropped silently.

The TypeScript and Python SDKs read a lens over a world snapshot (`resolveLens`, `resolve_lens`).

**A world as a graph** (the profile's graph section): the elements a reader sees are the nodes, and each link between them is an edge, one per link field and target. A link held on both ends is two edges, and a Relation is a node with an edge to each party. Room elements, hidden and proposed elements, and map space (Maps, Pins, Markers, Zones) are left out unless the reader asks for each by name. `hidden` and `proposed` are the owner's alone, and a public reader asks for nothing. With a lens, the nodes are exactly what the lens kept, and no flag adds to them. A link to an element that is not a node is counted by the reason it is not there, never dropped silently. `outside_lens` counts a link from a kept element to one the reader can see but the lens did not reach, so a tool can draw "3 more links" at the lens's edge. The SDKs read it as `worldGraph` and `world_graph`, and count each element's links in it with `degreeOf` and `degree_of`: "most linked" as the reader sees it, for ranking a search.

**On the API**, the server reads the same profile:

- `GET /api/v2/world/{world_id}/lenses` lists every lens in the world you can see, templates marked, each with its recipe filled in, the Titles it is the default for and whether you chose it. With `resolve=true` it adds each lens's reading for you: the kept rows, the cut by reason, the mail part. The owner may read as another reader with `read_as` (`guest`, `contributor`, `co-builder`, `public`, or a membership id). A member key, the owner's keys or an account token; never keyless. SDK `worldLenses`, Python `world_lenses`.
- `PUT /api/v2/me/lenses` sets the lenses you start with, `{"lenses": [ids]}`, 0 to 20 in your order, an empty list a choice too; each must be a lens you can see. `GET /me` and `GET /members` show each holder's `lenses`. A write key sets its own holder's list; an account token sets yours in the world it names with `?world=<id>`. A lens you chose that you can no longer see stays in your list at its place, and the answer marks `lenses` in `x_served_trimmed`. SDK `setMyLenses`, Python `set_my_lenses`.
- `PATCH /api/v2/account/worlds/{world_id}/members/{member_id}` with `{"lenses": [ids]}` alone sets a row's list on an account token: your own row, a seat you answer for, or the owner's own with `owner` as the member id. It answers `{id, role, kind, lenses}` (`id` null for the owner's own), with the same mark when a lens you cannot see was kept. SDK `setMemberLenses`.
- The [draught](/docs/development/api/draught) takes `lens=<id>` and adds `lenses`, one frame with that lens read for your own view. With no lens and no policy parameter but `compact`, it adds one frame per lens you chose, in your order.

## Data the schema does not model

Two places hold what the categories have no field for:

- **Extension fields** (`x_*`) on the element itself, for small amounts of tool-specific data. They are stored and returned verbatim, up to 64 KB per element. See [Fields](/docs/schema/fields#extension-fields).
- **Your own database**, beside the world, for high-volume data such as logs, statistics or simulation state. Key each row by the element's `id`.

Data in either place travels only to the tools that read it. Anything another tool should understand belongs in the schema's own fields, or in a published extension profile: a named extension field that tools agree to read the same way. Profiles are published, each a page in schema-dist's [`profiles/`](https://github.com/OnlyWorlds/schema-dist/tree/main/profiles) folder:

- **[`x_identity_key`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/identity.md)**: the same being in several worlds. Two Characters or Creatures carrying the same UUID are one being; a value that is not a UUID means nothing, and a tool that lets people add their own fields reserves the `x_identity_` prefix.
- **[`atlas_calendar`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md)**: a world's own calendar, the names it gives its time line. It changes no date. Read by Atlas and by the TypeScript and Unity SDKs; it keeps its name from before the profile grammar. Version 2 (serial 68) adds a leap rule's exceptions and offset, enough for the Gregorian calendar.
- **[`x_room_of`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md)** (serial 45; the ninth pair serial 66): marks an element as part of a parlor's room, the world's or a sitting's id; with one of nine type-and-supertype pairs it makes a room element, which a lore view leaves out unless asked, and the TypeScript and Python SDKs export `ROOM_PAIRS` and `isRoomElement` / `is_room_element`. The pairs, each compared trimmed and without regard to case: Narrative `Message` (a line in the room), Narrative `Board` (a board entry), Relation `Work item` (a packet of work), Construct `Spec` (a workshop's spec), Relation `Heart` (one person's heart on a spec or an item), Relation `Take` (one member's take on a work item, which also carries `x_room_item`, the item's id), Relation `Vote` (one person's ranked picks), Event `Sitting` (a workshop's sitting) and Character `Member` (a member's card in the room). The mark, not the word, makes the room: a Narrative with supertype Message and no `x_room_of` is lore and stays in view.
- **[The message](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/message.md)** (serial 72; rule 1 serial 73; serial 75: the verified sender and the mark's last writer; serial 76: the trimmed list, the edit, Notes): no field of its own, the one definition of a message's addressing, its sender's proof, the read mark, the thread and the Note beside it, as [Messages between members](#messages-between-members) says.
- **[`x_checks_rules`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/checks.md)** (serial 47; serial 54 adds the list readings and three reader rules): a work world's house rules as a machine can check them, on the Charter beside the text a person reads: the newest Law with supertype Charter made by the owner or a co-builder, the one keel names in [`front_door`](/docs/development/api/members#the-front-door); a Law with supertype Charter made by anyone else is never the house rules. Each rule is its sentence plus one check from a closed set (a field present, a text matching a pattern, a link field holding at least n ids, a value from a list), scoped by type (one, or a list) and optionally supertype or subtype; a reader reports how many elements each rule scoped and which fall short, and names by name any rule it cannot apply (a list naming a type the schema does not know, a field one listed type lacks, a pattern outside the regex subset Python and JavaScript share), never passing it silently. A known-of stub is judged by no rule: its missing fields are unknown, not short (since serial 64 the fixture holds two stub cases, a bare one and one with its fields filled, so every reader is tested on it). The Python package's doctor reads it from 0.24.0, from the Charter only since 0.28.0.
- **[`x_names`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md)** (serial 48): a world's own words for the 22 types, on the World. In a work world a Character shows as *Employee*, an Institution as *Team*. Only what a person reads changes: the API, the folder, its directory names and every id keep the standard's names, and a tool that never reads the map shows Character as always. The TypeScript and Python SDKs' `typeWord` / `type_word` give the word to print. onlyworlds.com stores it on the World since 2026-10-23, and a folder's `world.json` carries it too.
- **[`x_spine_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/spine.md)** (serial 55): a world that maps a software ecosystem, what is built, the contracts it speaks, where each thing lives and who keeps it. Each kind is an element type with a supertype from a closed list (`Package`, `Repo`, `Profile`, `Charter`…); ownership is a Title with supertype `Seat` and the elements it links; eleven `x_spine_*` keys carry what no field holds (address, truth, access, status, layer, audience, depends on, probe, what the probe last read, verified, and an anonymous owner on a public projection). It counts days from 2012-01-01 and ships the calendar that reads them. The Python package reads it (`read_spine_element`); its 34 fixture cases are the test.

Two more mark work on a world:

- **[`x_packet_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/packet.md)**: a packet of work about a world, a Relation with supertype `Work item` listing elements with a reason each (`x_packet_elements`), the world they belong to (`x_packet_source`) and the tool that made it (`x_packet_producer`); the Relation's own link fields carry the same elements, and the subtype is its state (`open`, `taken`, `done`). The [Python doctor](/docs/development/python#check-a-world)'s `--packet` prints its findings in this shape.
- **[`x_review_*`](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)**: two marks on any element. `x_review_proposed` (`by`, `evidence`, `expires`) on a new element written as proposed, shown apart from settled elements until a keeper acts; `x_review_checked` (`by`, `at`, `against`) records who last confirmed it true, when, and against what. A proposed change to an existing element is a [proposal](/docs/development/api/proposals) beside it, not this mark. The TypeScript and Python SDKs read the mark with `proposedMarkOf` / `proposed_mark_of` and `handsOnAsProposed` / `hands_on_as_proposed`.

One more is not a field at all, but a table a door reads when it brings a world in from another tool:

- **[The import map](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/import-map.md)** (serial 67): for each source tool, the words its users write for their own categories, each mapped to one of the 22 types (`city` to Location, `organization` to Institution). LegendKeeper's table is the first. A door offers the table and applies it only on the user's yes; it never types anything silently. The [Python package](/docs/development/python)'s LegendKeeper door reads it since 0.58.0.

A new profile's field is named `x_<profile>_<field>`.

