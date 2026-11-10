---
title: Reading worlds as a tool
description: "The @onlyworlds/sdk readers that turn a world into what a tool shows: search, lenses, the graph, a world's landing, map space, reading aids, the strand, records, messages, calendars, addresses and the Open with menu."
---

These functions, the readers, are part of [`@onlyworlds/sdk`](/docs/development/typescript). Each takes a world you have already read, as the person who will see the result is served it, and gives back what a tool shows: search hits, a lens's reading, a graph, a first picture, map space, the reading aids, a world's story in miniature, a Character's records, messages, dates and links. The last section draws the Open with menu on a page.

Most of them follow a profile: a convention published in schema-dist that every tool reads the same way, so two tools show one world alike ([Profiles](/docs/schema/profiles)).

Installing the package and reading a world are on the [TypeScript SDK](/docs/development/typescript) page; signing in, members and proposed changes on [Accounts, members and sharing](/docs/development/typescript-accounts).

## What every reader takes

The world is `{ elements }`: every element you read, of all 22 types (`mapSpace`, `recordsOf`, `buildWorldIndex` and the calendar readers take the array itself). The demo key reads the sample world:

```typescript
import { OwV2Client, ELEMENT_TYPES } from '@onlyworlds/sdk';

const client = new OwV2Client({ apiKey: '0000000001' });
const elements = [];
for (const type of ELEMENT_TYPES) for await (const el of client.listAll(type)) elements.push(el);
```

Lenses, the graph, the reading aids and the strand also take the viewer, the person the result is for, as `{ rung }` (the argument named `reader` in their signatures). A rung is how much of the world that viewer may see, one of four:

- `owner`: the whole world.
- `contributor`: the world less its hidden elements.
- `guest`: only the elements the guest was given, listed in `whole`, and those it knows of only by name, in `known_of`.
- `public`: the world less its hidden elements and its [room elements](/docs/schema/profiles#room).

Pass the rung of whoever will see the result, so a tool never shows a person more than they may see.

<a id="find-things-in-a-world"></a>

## Find elements in a world

With a world's elements in memory (`elements`, read as in [What every reader takes](#what-every-reader-takes)), `lookupWorld` finds the ones a plain question is about. It uses no model and no network, and runs in a few milliseconds.

```typescript
import { buildWorldIndex, lookupWorld, renderElement } from '@onlyworlds/sdk';

const index = buildWorldIndex(elements); // once per world; each element needs id and type
const hits = lookupWorld(index, 'who runs the mill in Ostvik?');
// hits[0].element, hits[0].reasons: best first, with why each matched
const card = renderElement(hits[0].element, index); // a short text card, links by name
```

Names come first, then supertype and subtype, then one link step in either direction, then the elements' other text, custom fields (`x_*`) included. A card shows a custom field by its own name: `x_eye_colour` reads `eye colour: grey`.

For an answer in a sentence, a signed-in account can use OnlyWorlds' [AI proxy](/docs/development/ai#ask-your-world-without-a-key-of-your-own). It needs an account token ([Accounts, members and sharing](/docs/development/typescript-accounts#sign-in-with-a-password)):

```typescript
import { buildAskContext } from '@onlyworlds/sdk';

const { context, kept, leftOut } = buildAskContext(hits.slice(0, 8), index); // the hits you show, within the proxy's limits
const reply = await account.ai('ask', { world_id: worldId, question, context }, { idempotencyKey: crypto.randomUUID() }); // account: a client with an ow_a_ token
// reply.answer comes from those elements only, or is "The world doesn't say."
```

`kept` says which elements were sent, so the sources you show are the ones the answer used. Keep the idempotency key until the answer lands: a retry under it is answered from the first call and billed nothing ([the AI door](/docs/development/ai#the-ai-door-a-use-by-name)). The older `account.ask({ worldId, question, context })` and `account.sort(...)` still work; both are deprecated since 4.139.0 and leave in 5.0.

`buildAskContext` hands nothing on that a world holds back from an AI: proposed elements (the [review profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md)), [hidden](/docs/development/api/hidden) ones and the room's are left out unless you pass `includeProposed`, `includeHidden` or `includeRoom`, and `leftOut` lists them by id so you can say how many. (Versions before 4.72.0 do not leave them out.)

A proposed element you include carries `[proposed, not yet reviewed]` on its first line, and a kept element's link to a left-out one reads as not present, so its name stays out too.

Each account has a token rating: the number of AI tokens it may spend on the proxy each day. Asking spends from it: `reply.tokens_remaining` and `reply.token_rating`, and `reply.remaining` counts the answers of this size still in it. Used up, it throws with `err.isQuotaExceeded`. `account.allowance()` reads the token rating without spending anything: `{ token_rating, tokens_used_today, tokens_remaining, resets_at }`.

The same proxy can also [sort loose notes](/docs/development/ai#sort-notes-into-a-world) into a world. You send a person's notes with a slice, the elements your lookup found for them, and get back rows for the person to review: each row makes an element, adds to one, links two, or asks which of some candidates is meant. Every id in a row comes from the slice, and nothing is written until your app applies what the person accepts:

```typescript
const slice = hits.slice(0, 100).map(({ element: e }) => ({ id: e.id, type: e.type, name: e.name }));
const { rows, not_proposed } = await account.ai('sort', { world_id: worldId, notes: ['Mira moved to Ostvik.'], slice });
// rows: make, add_to, link, or ask (with candidates); one question from the same token rating
```

## Lenses

A lens is a saved way of reading a world: which elements, how far from a starting set, how much of each. It is a Construct with supertype `Lens`, and it only narrows what the viewer may already see ([Lenses](/docs/lenses), the lens profile).

`resolveLens(world, lens, reader, { asOf, clock })` reads a world snapshot through a lens for one viewer and returns the kept elements in order, the cut counted by reason, and the mail part when the lens names one; it never writes.

```typescript
import { isLens, isTemplate, resolveLens } from '@onlyworlds/sdk';

const lens = elements.find((el) => isLens(el) && !isTemplate(el)); // a template reads nothing until it is copied and pointed
if (lens) {
  const reading = resolveLens({ elements }, lens, { rung: 'owner' });
  reading.kept; // the kept elements' ids, in order
  reading.cut;  // e.g. { budget: 12, window: 3 }
}
```

`isLens(el)` and `isTemplate(el)` say what an element is; `lensesInUse(membership, xLensUses)` gives a seat's chosen lenses (the membership's choice first, else a folder Character's `x_lens_uses`).

onlyworlds.com reads lenses on the server too ([Lenses on the API](/docs/development/api/lenses)). `worldLenses(worldId, { resolve: true })` lists a world's lenses with each one's reading for this key. `setMyLenses(lensIds)` chooses the lenses this key's holder starts with, and `setMemberLenses(worldId, memberId, lensIds)`, with an account token, sets your own row's list or a seat's you answer for.

The reading's date is `asOf`, else the world's own now; the mail rule's thirty days run on `clock`, the wall clock.

The profile's date table is exported: `DATE_FIELD` gives each dated type's date field (an Event's `start_date`, a Character's `birth_date`; the ten timeless types are not in it), and `dateOf(el)` gives an element's date as that table reads it, the whole number in its type's date field, else null. A timeline dates elements exactly as the lens's fence does.

A lens's rows for a viewer below the owner are the bodies the API serves that viewer, so they never show more than that viewer may see.

<details>
<summary>What a row keeps for each viewer (the profile's rules)</summary>

- a link to an element the viewer cannot see is left out
- a lens kept as an element keeps only the notes on elements the viewer sees
- `x_served_trimmed` names a message's `characters` and `narrator`, or a lens's anchor fields, for a contributor or a guest, never for the public
- a contributor's or a guest's row keeps a link to a proposed element it sees, and a lens's note keyed to one, as the API serves them; the public rung loses both

The owner's rows are the bodies as stored. No row carries a stored `x_served_trimmed`: the mark names only what this reading trimmed.

</details>

## A world as a graph

`worldGraph(world, reader, options)` reads the same snapshot, for the same viewer, as nodes and edges, by the lens profile's graph section ([A world as a graph](/docs/lenses/graph)). It returns:

- `nodes`: `{ id, type, name, family, icon }`, by id; `family` is the type's colour group (`blue`, `green`, `pink` or `amber`, as [`ELEMENT_GROUPS`](/docs/development/typescript#schema-constants) gives it), a key for drawing, never a label
- `edges`: `{ source, field, target, index }`, one per link
- `edgesCut`: links to elements that are not nodes, counted by reason
- `cut`: the elements left out, counted by reason: with a lens, the lens's own cut; without one, the kinds left out by default (`room`, `hidden` and `proposed` for the owner only, `map_space`, `reading_aid`)
- `unreadable`: the `x_lens` key a lens could not be read by, else null

Room elements, hidden and proposed elements, and map space (Maps, Pins and Markers; a Zone is a node like any other) are left out unless `rooms`, `hidden`, `proposed` or `mapSpace` brings them back. The reading aids (the charter, its guide, its domains) come back with `readingAids`, each marked `reading_aid`, in a graph without a lens.

`hidden` and `proposed` are the owner's alone, and a public viewer takes no flag: a refused flag throws, naming it, before anything is read.

With `{ lens }` the nodes are exactly what the lens kept, and `outside_lens` counts the links from them to elements the reader sees but the lens did not reach.

```typescript
import { degreeOf, worldGraph } from '@onlyworlds/sdk';

const g = worldGraph({ elements }, { rung: 'owner' }, { rooms: true });
g.nodes; g.edges; g.edgesCut; // e.g. { map_space: 2, hidden: 1 }
degreeOf(g); // each node's edges, in or out, { [id]: count }
```

## Landing

`landingOf(graph, { heads, hops, size })` picks a world's first picture from what `worldGraph` answered, by the [landing profile](/docs/schema/profiles#landing), and returns `{ mode, size, clusters, unclustered, gaps }`:

- `clusters` are the most-linked Characters with at least one link, at most `heads` (5 by default), most linked first. Each node within `hops` steps (1 by default) joins its nearest head; a tie goes to the higher-ranked head.
- `unclustered` is the rest.
- `gaps` lists `orphan`, `near_orphan`, `no_place` (a Character whose `location` names no Location in the graph) and `nobody_here` (a Location no Character's `location` names).
- `mode` is `gaps` when the graph has fewer nodes than `size` (24 by default), else `graph`.

It returns structure only: a layout is yours, keyed by id.

A site may serve a landing too, keyless or signed in, each read from the graph its visitor is served. One served by a site may carry keys beside these five (onlyworlds.com adds `baked` and `lenses`). Those are the site's own and outside the profile: read `mode`, `size`, `clusters`, `unclustered` and `gaps`, and pass the rest through.

```typescript
import { landingOf, worldGraph } from '@onlyworlds/sdk';

const view = landingOf(worldGraph({ elements }, { rung: 'public' }));
view.mode; // 'graph' or 'gaps'
view.clusters[0]; // { head, members: [{ id, hops, degree }, ...] }
```

## Map space

`mapSpace(elements)` reads a world's Maps, Zones and Pins as frames, outlines and points, by the [map-space profile](/docs/schema/profiles#map-space). It takes the elements as the viewer is served them and returns `{ maps, zones, pins, out }`, all four always present:

- `maps` holds each Map's frame: `width`, `height`, `depth`, `z_max` (the largest z among its own points), `scale` (metres per pixel from `x_metres_per_pixel`, else `null`), `location` and `parent_map`. A missing `width` or `height` is measured from the Map's own placed points and marked `extent: "points"`.
- `zones` holds one outline per Map a Zone has Markers on, `{ zone, map, shape, points }`, each point `[x, y, z]`, the Markers in `order` and then by id.
- `pins` holds each Pin's point and its element: `{ pin, map, element_type, element_id, x, y, z }`.
- `out` counts what was left aside by reason: `no_point`, `no_markers`, `dangling`, `no_map`; a reason with nothing counted is absent.

`z` is an elevation, never a height. The types are `OwMapSpace`, `OwMapSpaceMap`, `OwMapSpaceOutline`, `OwMapSpacePin`, `OwMapSpacePoint` and `OwMapSpaceOutReason`.

```typescript
import { mapSpace } from '@onlyworlds/sdk';

const { maps, zones, pins, out } = mapSpace(elements);
zones[0]; // { zone, map, shape: 'polygon', points: [[x, y, z], ...] }
out; // e.g. { dangling: 1 }
```

<details>
<summary>Which numbers and rows count (the profile's rules)</summary>

A number counts when it is whole by value (`2.0` is 2) and a double holds it exactly: a value past 2^53 that the parse had to round is not whole. A row without a non-empty string `id` is no element, and two rows of one type with one id read as the last one served.

</details>

## A layout along a route

`trailByPlace(input)` lays a world out along a route on a ground map and answers a layout in the standard's own fields: a Map frame (`width`, `height`, `depth`) and one Pin per element, whole numbers in the Map's pixels, so `mapSpace` reads it back. It places and does not read: you hand it which elements are in, the order of travel and what hangs where, and it answers the same points for the same input.

- `places`, in travel order: each sits at its own `pin` on the ground map (the `margin` is added on every side), evenly `between` two pinned places, or on a ring inside a `parent` place.
- `hangers`: every other element, with the places it belongs to (`at`). Each sits on one spiral round the mean of those places' points, lifted to its kind's floor (`tiers`; `TRAIL_TIERS` is the default: places and things on the ground, the living above, what happened higher, what is told highest). A `hero` stands first on its spiral.
- Nothing shares a place's own point, and no two Pins share a point: a taken point moves along x from its own point, by element id order. Points round half to even.
- The answer is `{ map, pins, route, recipe, nudged, clamped }`. Each Pin carries `by`, why it stands there (your words, then the method's). `recipe` is the method's name and the settings it ran with, so the same layout runs again from the Map alone. Give `ground.map`, the ground Map's element id, and the recipe carries it, so a tool reading the Map finds the picture its pins stand on.

An input it cannot place is a `TypeError` naming what: an unknown key at any level, a place with none or two of `pin`, `between` and `parent`, a reference to a place it does not hold, a kind with no floor, an id given twice, a row of the frame (one height, one y) with more Pins than the frame is wide plus one. The same input and answer in Python: [`trail_by_place`](/docs/development/python#what-it-covers). The types are `OwTrailInput`, `OwTrailPlace`, `OwTrailHanger`, `OwTrailTier`, `OwTrailSpiral`, `OwTrailSettings`, `OwTrailLayout` and `OwTrailPin`.

```typescript
import { trailByPlace } from '@onlyworlds/sdk';

const layout = trailByPlace({
  ground: { map: routeMap, width: 3462, height: 4676 }, // the route map and its own frame
  margin: 300,
  depth: 900,
  places: [
    { id: stLouis, type: 'location', name: 'Saint Louis', pin: [2118, 4313] },
    { id: river, type: 'location', name: 'The Mississippi', between: [stLouis, orleans] },
    { id: orleans, type: 'location', name: 'New Orleans', pin: [2163, 484] },
  ],
  hangers: [{ id: boat, type: 'object', name: 'The boat', at: [river] }],
});
layout.map;     // { width: 4062, height: 5276, depth: 900 }
layout.pins[0]; // { element_type, element_id, name, x, y, z, by }
```

## The layout of a map

`layoutOf(map, maps, pins)` (4.142.0 on) reads a Map's two layout marks, as the [map-space profile](/docs/schema/profiles#map-space)'s layout rules state them: `x_layout` on the Map and `x_hand` on its Pins. Pass the Map, the Maps you are served and every Pin you hold; it keeps the Pins whose `map` is this Map.

```typescript
import { layoutOf } from '@onlyworlds/sdk';

const { layout, ground, hand } = layoutOf(map, maps, pins);
// layout: 'trail-by-place', 'hand' (a board), a method no page names, or null on a plain map
// ground: the id of the served Map the layout stands on, or null
// hand: the ids of the Pins a new lay-out keeps where they are, in code point order
```

A tool that cannot run the method draws the Pins where they are and never lays them out again. `layoutOf` returns neither the method's settings nor the ground's size: read `map.x_layout.settings` and the ground Map itself for those.

## Reading aids

`charterOf(world, reader)` returns what a world's front door shows first, `{ charter, guide, domains }`, as that viewer sees them, by the [charter profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/charter.md) (the API's own copy is [`reading_aids`](/docs/development/api/members#reading-aids)).

- `charter` is `{ id, name, rules, skill }` or null: the newest marked Charter, its `x_checks_rules` list (`[]` when none) and the Objects its text names, at most five.
- `guide` is `{ id, name }` or null.
- Each Domain is `{ id, name, sentence, hubs }`: its description up to the first line break, and the elements its links name that the reader sees, as `{ type, id }`.

`domainsOf(world, reader)` returns the Domains alone. `world` holds the elements as the owner is served them, with `open: true` for a world open to anyone (only then does a public viewer see anything), and `reader` is the viewer's `{ rung }`, as in [What every reader takes](#what-every-reader-takes).

`isCharterElement(el)` reads the mark `x_charter_of` by its presence: any value but null, and a string only when something is left after trimming. `CHARTER_PAIRS` lists the three type-and-supertype pairs.

`readingAidOf(element)` answers which aid an element's type and supertype make it, `'charter'`, `'guide'`, `'domain'` or null, with the mark ignored: what a tool offers to mark it as.

```typescript
import { charterOf } from '@onlyworlds/sdk';

const { charter, guide, domains } = charterOf({ elements }, { rung: 'owner' });
```

## The strand

`strandOf(world, reader)` returns a world's story in miniature, `{ narrative, event, location, character, now, same }`, as that viewer sees it, by the [strand profile](/docs/schema/profiles#strand).

The World's `x_strand` (`STRAND_FIELD`) names three ids: the story (a Narrative), one of its events and one of that event's places. Only the story is required: `event` and `location` null or absent read as unset, a strand begun. A mark with no story, or with an `event` or `location` that is neither an id nor unset, is no mark, and every slot is null.

- `narrative`, `event` and `location` are those elements, each only when it is of its kind, visible to the viewer and in its parent's list (the event in the story's `events`, the place in the event's `locations`).
- `character` is the story's `protagonist` and `now` the hero's `location`.
- Each is `{ id, name }` or null, and no slot is filled from another.
- `same` is true when `now` and `location` are one place, false when two, and null when either is empty.

`world` holds the elements as the owner is served them, with `x_strand` and `open: true` for a world open to anyone, and `reader` is the viewer's `{ rung }`.

```typescript
import { strandOf } from '@onlyworlds/sdk';

const strand = strandOf(world, { rung: 'owner' });
if (strand.narrative) console.log(strand.narrative.name, strand.same ? 'then and now one place' : '');
```

A tool that talks to the server may not need to compute the strand at all, because the server serves the same reading. [`me()`](/docs/development/typescript-accounts#who-is-in-a-world) and an agent's `redeemJoin` answer carry it as `reading_aids.strand` (`OwServedReadingAids` is `charterOf`'s three plus `strand`), so a tool can read a world's story from its first call.

## Records

`recordsOf(characterId, elements)` returns one Character's records, the game runs they took part in, newest first, by the [record profile](/docs/schema/profiles#record). `elements` are the world as the viewer is served them.

A record is an Event whose `x_record` (`RECORD_FIELD`) names the game (`tool`) and when it was played (`played_at`, a real instant in UTC), with optional `version`, `seed`, `outcome` and `seats`. Who took part is the Event's `characters`.

Each entry is `{ event: { id, name }, tool, played_at, version, seed, outcome, seat, stories }`. `seat` is this Character's seat when the mark names one, and `stories` are the Narratives that list the run in `events` and name them as `protagonist`, `narrator` or `both`.

A run or a story still [proposed](#proposed-elements) is not read.

`recordMarkOf(element)` reads one Event's mark, or null when its shape is not the profile's.

```typescript
import { recordsOf } from '@onlyworlds/sdk';

for (const r of recordsOf(character.id, elements)) {
  console.log(r.event.name, r.tool, r.outcome ?? '', r.seat ?? '');
}
```

<details>
<summary>Which runs and stories are read (the profile's rules)</summary>

A run or a story is proposed exactly when [`proposedMarkOf`](#proposed-elements) reads it as proposed, so a run or story with an empty mark (`{}`, `""` or `[]`) is settled and read. An Event or a Narrative whose `id` is not a string is never read.

</details>

## Messages

Messages between members follow the [message profile](/docs/schema/profiles/messages): who a message is for, whether its sender is proved, what is unread, and a thread. The readers take the roster from [`client.members()`](/docs/development/typescript-accounts#who-is-in-a-world).

A hand is the member whose key wrote an element: `created_by` records the hand that made it, `changed_by` the hand that last changed it. A sender is proved when the hand that made the message plays the Character it claims to be from (its `narrator`), and a read mark counts only in its own reader's hand.

```typescript
import { isMessage, isAddressedTo, senderStatus, readMarkOf, unreadFor } from '@onlyworlds/sdk';

const { character: myCharacter } = await client.me(); // the id of the Character you play here: a member's key (null for an owner's or the demo key)
const messages = [];
for await (const n of client.listAll('narrative', { filter: { supertype: 'Message' } })) if (isMessage(n)) messages.push(n);
const members = await client.members();
const marks = [];
for await (const r of client.listAll('relation', { filter: { supertype: 'Read' } })) marks.push(r);
const mark = readMarkOf(marks, myCharacter, members);   // only a mark in my own hand counts
for (const m of unreadFor(messages, myCharacter, mark, members)) {   // members: only a verified sender makes a message mine
  const { status, claimed, writtenBy } = senderStatus(m, members);
  // 'verified': show the sender; 'mismatch': "claims to be from <claimed>, written by <writtenBy>'s key";
  // 'unverifiable': "claims to be from <claimed>" (or "from nobody" when claimed is null)
}
```

`isAddressedTo(m, id)` is true for a message to everyone (an empty `characters`), and `isToEveryone(m)` asks only that. `threadOf(messages, rootId)` lists a thread in order.

The readers know a message the server trimmed for its viewer (`x_served_trimmed`): an empty `characters` with the mark is to someone you cannot see, never to everyone. `hasUnseenRecipients(m)` says so, and a hidden sender is `senderStatus` `'unseen'` ("from someone you cannot see").

A body read with no key, as the public is served it, carries no hands and no trim mark. There, pass `{ keyless: true }`: `readMarkOf(marks, id, members, { keyless: true })` is `null`, `isToEveryone` is false, and `hasUnseenRecipients` is `null` (unknown).

`editedBy(m, members)` says whether a later hand changed a message, and whose. A Note (supertype `Note`) is a member's own line, never a message: `isNote(el)`, and `noteOf(narratives, characterId, members)` gives the id of that Character's newest Note in its own hand.

## Proposed elements

An element an AI seat wrote as [proposed](/docs/development/api/proposals) follows the [review profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md): `proposedMarkOf(el)` gives its mark as a viewer shows it, `{ by, expires, lapsed }`, or `null` for a settled element. `handsOnAsProposed(el)` is what a reader function that hands a world on (a context for an AI, a share) leaves out, a malformed mark included. `buildAskContext` reads the same function.

## World calendars

A world's time is an integer line: the world's now (`time_range_current`) and an Event's `start_date` are points on it. A calendar names those points with months, days and eras.

A world's calendars sit on elements, each in an `atlas_calendar` field. The field belongs to [Atlas](/docs/tools/atlas), the main OnlyWorlds workspace, which reads it with the same calendar code as the SDK: read it, never write it.

The Python package's LegendKeeper import also writes one, from a source calendar, by Atlas's rules.

```typescript
import { worldCalendars, resolveCalendar, formatStep, parseDate } from '@onlyworlds/sdk';

const calendars = worldCalendars(elements); // every element with a valid atlas_calendar
const cal = resolveCalendar(elements, chosenId, { fallbackToOnly: true }); // the picked calendar, or the world's only one when none was picked
if (cal) {
  formatStep(cal.config, 400);               // "4 Alturiak, 1 DR"
  parseDate(cal.config, '4 Alturiak, 1 DR'); // { step: 400 }
}
```

The second argument is the id of the calendar the person picked. With `fallbackToOnly`, when none was ever picked (`undefined`) and the world holds exactly one calendar, that one is used; `null` means no calendar.

The dates in the example come from Harptos, one of the calendars the SDK's own tests read: point 400 is day 4 of the month Alturiak, in year 1 of the era written DR.

No calendar, or a broken one, gives null: show the bare number.

The SDK reads the calendar profile's version 2: a leap day's rule can carry `except`, divisors that flip it in order, and `offset`, added to the year index before the rule (1 for a calendar with no year 0). Gregorian is `every_years: 4, except: [100, 400], offset: 1`. A calendar reader that knows only version 1 gives null for a version-2 calendar, so it shows the bare number, never a wrong date.

Eras count up by default; one that counts down toward its start (years before a founding) is a down era. An era that counts up and has no `end` runs to the start of the next era that counts up, whatever order the eras are listed in. An era's `year_base` says whether its first year is numbered 0 or 1 (1 when left out); any other value makes the calendar unreadable, so the reader gives null.

## Addresses

The [address profile](/docs/schema/profiles/addresses) reads and writes an element's link: `parseOwLink(text)` reads any of the three spellings (the site's address, `ow://<type>/<id>`, `ow://<world>/<type>/<id>`) with its moment and lens, and `elementAddress(address)` writes one. A string the profile refuses throws an `OwAddressError` whose `reason` is the profile's own name.

```typescript
import { parseOwLink, elementAddress } from '@onlyworlds/sdk';

const r = parseOwLink('ow://character/0193f1c2-7a00-7000-8000-000000000001');   // { form: 'text', world: null, type: 'character', id, lens: null, moment: null, canonical: true, … }
const link = elementAddress({ form: 'human', world: worldId, type: 'character', id });   // https://www.onlyworlds.com/w/<world>/character/<id>
```

### Open with

`openersFor(tools, kind, address, surface)` gives the rows of an **Open with** menu for a world or an element: onlyworlds.com first, then each [listed tool](/docs/development/list-your-tool) whose `open` key has a door for it, in the list's order. `TOOLS` is the tools list baked at this release.

Each row is `{ id, name, href, state }`. `state` is null when the row opens now, or one of `You are here`, `Needs a connection`, `Needs an account`, `Sign in to <tool> first`, `Opens in your browser`, `Needs the world on this phone` or `Opens the world`.

`surface` says what the page knows:

- `audience` (required): who is looking. `member` is anyone with a seat in the world, a guest included; `public` is a signed-out visitor. A public page (`audience: 'public'`) gets the tools that need nothing, and each tool that needs an account as a row that says `Needs an account` and opens nothing, unless its row's `open.opens_public` is true (its links open a public world with no account), when it is a row that opens; a tool that needs the world on the device is not there.
- `tool`: your own tool's client name, whose row then says `You are here`; `onlyworlds` for the site itself.
- `online`: with `online: false` every row whose link is a web address says `Needs a connection`, the site's own row included; a row whose link opens an app is unaffected. Default true.
- `signedIn`: whether the viewer is signed in. Signed out in a browser, a tool that needs an account says `Sign in to <tool> first`. Null or absent when the page cannot know, and then no row says so.
- `browser`: false in a desktop app, which cannot see the browser's sign-in; a tool that needs an account then says `Opens in your browser`. Default true.
- `phone`: true on a phone, where a tool that needs the world on the device says `Needs the world on this phone`. Default false.

An element's menu takes the element as you were served it, `openersFor(tools, 'element', address, surface, { element })`. A tool whose element door does not open what it carries (a room element, a hidden or proposed one, a Map, Pin or Marker, a reading aid: the list's `element_skips`, each read as [`worldGraph`](#a-world-as-a-graph) reads it) has no row, rather than a link to a page that cannot open it. Without it every row is there.

A tool can also list the kinds of element it opens, in its row's `element_types`. On an element's menu, a tool whose list leaves out that element's type (read from the address) has no row, not even one to its world door. A world's menu is unchanged.

```typescript
import { openersFor, TOOLS, parseOwLink } from '@onlyworlds/sdk';

const rows = openersFor(TOOLS, 'element', parseOwLink(link), { audience: 'member', tool: 'lantern', signedIn: false });
// [{ id: 'onlyworlds', name: 'onlyworlds.com', href: 'https://www.onlyworlds.com/w/<world id>/character/<id>', state: null },
//  { id: 'atlas', name: 'Atlas', href: 'https://atlas.onlyworlds.com/#/open/…', state: 'Sign in to Atlas first' },
//  { id: 'lantern', name: 'Lantern', href: 'https://lantern.onlyworlds.com/#/open/…', state: 'You are here' },
//  { id: 'little-lens', name: 'Little Lens', href: 'https://little-lens.onlyworlds.com/#/open/…', state: null },
//  { id: 'tangle', name: 'Tactical Tangle', href: 'https://tangle.onlyworlds.com/#/open/…', state: 'Sign in to Tactical Tangle first' }]
```

### Door history

`doorsOf(element, tools = TOOLS)` reads an element's [door history](/docs/development/api/reads), the `doors` field a world's members are served: which tools wrote it, newest first, each `{ door, at, tool, last, from }`.

- `tool` is the listed tool whose client name is the door, or null for a door word (`site`, `mcp`, …).
- `last` marks the entry that made the element's last write, so a "by you" line compares `changed_by` with the viewer's own membership there.
- An element with no `doors` yet reads one entry from its last write (`from: 'last-write'`), and a public read gives `[]`.

It returns data, never words. `doorWhere(entry)` gives one entry's where in the words a "Last shaped" line uses: `in <tool name>` for a listed tool (such as `in Atlas`), `on onlyworlds.com` for `site`, `with an AI` for `seat`, `mcp` and `declared`, `by OnlyWorlds` for `server`, and `in code` for any other door. The rest of the sentence ("Last shaped", "by you", the time) stays the caller's.

```typescript
import { doorsOf, doorWhere } from '@onlyworlds/sdk';

const [newest] = doorsOf(element);
// { door: 'atlas', at: '2026-10-29T14:31:07.123456+00:00', tool: { id: 'atlas', name: 'Atlas' }, last: true, from: 'doors' }
doorWhere(newest); // 'in Atlas'
```

## The Open with menu, drawn

The subpath `@onlyworlds/sdk/waymark` draws the [Open with menu](#open-with) for a page: `mountWaymark(target, options)` puts the OnlyWorlds mark beside a world's or an element's name, and the mark opens the menu (the name line, the Open with rows, the lenses you pass, Copy link). It returns a function that removes everything it added.

Every word in it comes from the readers above: the rows and their state words from `openersFor`, a member's "Last shaped" line from `doorsOf` and `doorWhere`. The main `@onlyworlds/sdk` import never loads it, so a server or a script that only reads worlds carries no page code.

```typescript
import { mountWaymark } from '@onlyworlds/sdk/waymark';
import '@onlyworlds/sdk/waymark.css';

const remove = mountWaymark(document.querySelector('#title'), {
  world: { id: worldId, name: 'Moppetopia' },
  element,                       // the element as your page read it, or leave it out for the world
  reader: 'member',
  tool: 'lantern',               // your own tool's client name: its row says "You are here"
  signedIn: true,
  ground: 'dark',
});
// later: remove();
```

Its stylesheet is `@onlyworlds/sdk/waymark.css`. The options:

- `reader` is who is looking: `member`, `guest` or `public`. It plays the part of `openersFor`'s `audience`, with `member` and `guest` both read as `member`. A public page shows the rows that need nothing, and a tool that needs an account as a grey row that says "Needs an account" and does nothing when pressed, unless its row opens a public world with no account (`open.opens_public`).
- `tool`, `signedIn`, `browser` and `phone` are `openersFor`'s, as in [Open with](#open-with).
- `ground` is the page behind the menu: `dark` (the default, the mark in the brand cyan) or `paper` (the mark in a dark ink).
- `entry` picks the way in: the mark (`'mark'`, the default), an Open with item for your page's own menu (`'menu'`, given back as `entry` on the returned function), or both.

The menu opens toward the room it has, becomes a sheet from the bottom on a narrow screen, greys the rows that need a connection while offline, and works from the keyboard.

<details>
<summary>How the menu behaves, in detail</summary>

- An Escape it handles stops there, so a page's own Escape on `document` does not also run.
- The fan-out measures the nearest box that clips it when it opens and opens toward the room it has (to the left of a right edge, above a bottom edge), or as the sheet from the bottom when neither side has room. At 480 px wide or less the menu is a sheet from the bottom.
- It reads the browser's connection at each open. Offline, a row that needs one is grey and leads nowhere, redrawn in place if the connection comes back while the menu is open.
- Your own tool's row, "You are here", is a plain item that closes the menu, drawn grey as where the reader already is.
- A row whose link is a web address opens in a new tab, and one that opens an app is handed to the device.
- The mark sits a little under the name's capitals (0.6em, never under 16 px).

From the keyboard, Tab goes from the mark through every row in order (in Safari too), the arrow keys, Home and End move within the menu, and Escape closes it and gives focus back to what opened it. Focus that leaves the menu closes it, including focus that comes back to the page on another control after the window lost it.

</details>
