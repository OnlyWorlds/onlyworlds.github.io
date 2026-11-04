---
title: Reading worlds as a tool
description: "The @onlyworlds/sdk readers that turn a world into what a tool shows: lenses, the graph, a world's landing, map space, reading aids, the strand, records and the Open with menu."
---

These functions are part of [`@onlyworlds/sdk`](/docs/development/typescript). Each takes a world you have already read, as its reader is served it, and gives back what a tool shows: a lens's reading, a graph, a first picture, map space, the reading aids, a world's story in miniature, a Character's records. The last section draws the Open with menu on a page.

Installing the package and reading a world are on the [TypeScript SDK](/docs/development/typescript) page.

## What every reader takes

The world is `{ elements }`: every element you read, of all 22 types (`mapSpace` and `recordsOf` take the array itself). The demo key reads the sample world:

```typescript
import { OwV2Client, ELEMENT_TYPES } from '@onlyworlds/sdk';

const client = new OwV2Client({ apiKey: '0000000001' });
const elements = [];
for (const type of ELEMENT_TYPES) for await (const el of client.listAll(type)) elements.push(el);
```

The reader is who the result is for, given as `{ rung }`:

- `owner`: the whole world.
- `contributor`: the world less its hidden elements.
- `guest`: only the elements the guest was given, listed in `whole`, and those it knows of only by name, in `known_of`.
- `public`: the world less its hidden elements and its [room elements](/docs/schema/profiles#room).

Pass the rung of whoever will see the result, so a tool never shows a person more than they may see.

## Lenses

The [lens profile](/docs/lenses) has its reader: `resolveLens(world, lens, reader, { asOf, clock })` reads a world snapshot through a lens for one reader and returns the kept elements in order, the cut counted by reason, and the mail part when the lens names one; it never writes.

`isLens(el)` and `isTemplate(el)` say what an element is; `lensesInUse(membership, xLensUses)` gives a seat's chosen lenses (the membership's choice first, else a folder Character's `x_lens_uses`).

The reading's date is `asOf`, else the world's own now; the mail rule's thirty days run on `clock`, the wall clock.

The profile's date table is exported: `DATE_FIELD` gives each dated type's date field (an Event's `start_date`, a Character's `birth_date`; the ten timeless types are not in it), and `dateOf(el)` gives an element's date as that table reads it, the whole number in its type's date field, else null. A timeline dates elements exactly as the lens's fence does.

A lens's rows for a reader below the owner are the bodies the API serves that reader:

- a link to an element the reader cannot see is left out
- a lens kept as an element keeps only the notes on elements the reader sees
- `x_served_trimmed` names a message's `characters` and `narrator`, or a lens's anchor fields, for a contributor or a guest, never for the public
- a contributor's or a guest's row keeps a link to a proposed element it sees, and a lens's note keyed to one, as the API serves them; the public rung loses both

The owner's rows are the bodies as stored. No row carries a stored `x_served_trimmed`: the mark names only what this reading trimmed.

## A world as a graph

The profile's graph section ([A world as a graph](/docs/lenses/graph)) has its reader: `worldGraph(world, reader, options)` reads the same snapshot, for the same reader, as nodes and edges. It returns:

- `nodes`: `{ id, type, name, family, icon }`, by id
- `edges`: `{ source, field, target, index }`, one per link
- `edgesCut`: links to elements that are not nodes, counted by reason
- `cut`
- `unreadable`: the `x_lens` key a lens could not be read by, else null

Room elements, hidden and proposed elements, and map space (Maps, Pins and Markers; a Zone is a node like any other) are left out unless `rooms`, `hidden`, `proposed` or `mapSpace` brings them back. The reading aids (the charter, its guide, its domains) come back with `readingAids`, each marked `reading_aid`, in a graph without a lens.

`hidden` and `proposed` are the owner's alone, and a public reader takes no flag: a refused flag throws, naming it, before anything is read.

With `{ lens }` the nodes are exactly what the lens kept, and `outside_lens` counts the links from them to elements the reader sees but the lens did not reach.

```typescript
import { degreeOf, worldGraph } from '@onlyworlds/sdk';

const g = worldGraph({ elements }, { rung: 'owner' }, { rooms: true });
g.nodes; g.edges; g.edgesCut; // e.g. { map_space: 2, hidden: 1 }
degreeOf(g); // each node's edges, in or out, { [id]: count }
```

## Landing

The [landing profile](/docs/schema/profiles#landing) has its reader. `landingOf(graph, { heads, hops, size })` reads what `worldGraph` answered and returns `{ mode, size, clusters, unclustered, gaps }`:

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

The [map-space profile](/docs/schema/profiles#map-space) has its reader. `mapSpace(elements)` takes the elements as the reader is served them and returns `{ maps, zones, pins, out }`, all four always present:

- `maps` holds each Map's frame: `width`, `height`, `depth`, `z_max` (the largest z among its own points), `scale` (metres per pixel from `x_metres_per_pixel`, else `null`), `location` and `parent_map`. A missing `width` or `height` is measured from the Map's own placed points and marked `extent: "points"`.
- `zones` holds one outline per Map a Zone has Markers on, `{ zone, map, shape, points }`, each point `[x, y, z]`, the Markers in `order` and then by id.
- `pins` holds each Pin's point and its element: `{ pin, map, element_type, element_id, x, y, z }`.
- `out` counts what was left aside by reason: `no_point`, `no_markers`, `dangling`, `no_map`; a reason with nothing counted is absent.

A number counts when it is whole by value (`2.0` is 2) and a double holds it exactly: a value past 2^53 that the parse had to round is not whole. A row without a non-empty string `id` is no element, and two rows of one type with one id read as the last one served.

`z` is an elevation, never a height. The types are `OwMapSpace`, `OwMapSpaceMap`, `OwMapSpaceOutline`, `OwMapSpacePin`, `OwMapSpacePoint` and `OwMapSpaceOutReason`.

```typescript
import { mapSpace } from '@onlyworlds/sdk';

const { maps, zones, pins, out } = mapSpace(elements);
zones[0]; // { zone, map, shape: 'polygon', points: [[x, y, z], ...] }
out; // e.g. { dangling: 1 }
```

## Reading aids

The [charter profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/charter.md) has its reader (the API's own copy is [`reading_aids`](/docs/development/api/members#reading-aids)): `charterOf(world, reader)` returns what a world's front door shows first, `{ charter, guide, domains }`, as that reader sees them.

- `charter` is `{ id, name, rules, skill }` or null: the newest marked Charter, its `x_checks_rules` list (`[]` when none) and the Objects its text names, at most five.
- `guide` is `{ id, name }` or null.
- Each Domain is `{ id, name, sentence, hubs }`: its description up to the first line break, and the elements its links name that the reader sees, as `{ type, id }`.

`domainsOf(world, reader)` returns the Domains alone. `world` holds the elements as the owner is served them, with `open: true` for a world open to anyone (only then does a public reader see anything), and `reader` is a lens reader.

`isCharterElement(el)` reads the mark `x_charter_of` by its presence: any value but null, and a string only when something is left after trimming. `CHARTER_PAIRS` lists the three type-and-supertype pairs.

`readingAidOf(element)` answers which aid an element's type and supertype make it, `'charter'`, `'guide'`, `'domain'` or null, with the mark ignored: what a tool offers to mark it as.

```typescript
import { charterOf } from '@onlyworlds/sdk';

const { charter, guide, domains } = charterOf({ elements }, { rung: 'owner' });
```

## The strand

The [strand profile](/docs/schema/profiles#strand) has its reader: `strandOf(world, reader)` returns a world's story in miniature, `{ narrative, event, location, character, now, same }`, as that reader sees it.

The World's `x_strand` (`STRAND_FIELD`) names three ids: the story (a Narrative), one of its events and one of that event's places. Only the story is required: `event` and `location` null or absent read as unset, a strand begun. A mark with no story, or with an `event` or `location` that is neither an id nor unset, is no mark, and every slot is null.

- `narrative`, `event` and `location` are those elements, each only when it is of its kind, in the reader's view and in its parent's list (the event in the story's `events`, the place in the event's `locations`).
- `character` is the story's `protagonist` and `now` the hero's `location`.
- Each is `{ id, name }` or null, and no slot is filled from another.
- `same` is true when `now` and `location` are one place, false when two, and null when either is empty.

`world` holds the elements as the owner is served them, with `x_strand` and `open: true` for a world open to anyone, and `reader` is a lens reader.

```typescript
import { strandOf } from '@onlyworlds/sdk';

const strand = strandOf(world, { rung: 'owner' });
if (strand.narrative) console.log(strand.narrative.name, strand.same ? 'then and now one place' : '');
```

`me()` and an agent's `redeemJoin` answer carry the same reading as the server serves it, `reading_aids.strand` (`OwServedReadingAids` is `charterOf`'s three plus `strand`), so a tool can read a world's story from its first call.

## Records

The [record profile](/docs/schema/profiles#record) has its reader: `recordsOf(characterId, elements)` returns one Character's records, the game runs they took part in, newest first. `elements` are the world as the reader is served them.

A record is an Event whose `x_record` (`RECORD_FIELD`) names the game (`tool`) and when it was played (`played_at`, a real instant in UTC), with optional `version`, `seed`, `outcome` and `seats`. Who took part is the Event's `characters`.

Each entry is `{ event: { id, name }, tool, played_at, version, seed, outcome, seat, stories }`. `seat` is this Character's seat when the mark names one, and `stories` are the Narratives that list the run in `events` and name them as `protagonist`, `narrator` or `both`.

A run or a story still proposed is not read: that is exactly what [`proposedMarkOf`](/docs/development/typescript#messages) reads as proposed, so a run or story with an empty mark (`{}`, `""` or `[]`) is settled and read. An Event or a Narrative whose `id` is not a string is never read.

`recordMarkOf(element)` reads one Event's mark, or null when its shape is not the profile's.

```typescript
import { recordsOf } from '@onlyworlds/sdk';

for (const r of recordsOf(character.id, elements)) {
  console.log(r.event.name, r.tool, r.outcome ?? '', r.seat ?? '');
}
```

## The Open with menu, drawn

The subpath `@onlyworlds/sdk/waymark` draws the [Open with menu](/docs/development/typescript#open-with) for a page: `mountWaymark(target, options)` puts the OnlyWorlds mark beside a world's or an element's name, and the mark opens the menu (the name line, the Open with rows, the lenses you pass, Copy link). It returns a function that removes everything it added.

Every word in it comes from the readers on the TypeScript SDK page: the rows and their state words from `openersFor`, a member's "Last shaped" line from `doorsOf` and `doorWhere`. The main `@onlyworlds/sdk` import never loads it, so a server or a script that only reads worlds carries no page code.

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

Its stylesheet is `@onlyworlds/sdk/waymark.css`, for a dark or a paper page (`ground`). The other options:

- `reader` is `member`, `guest` or `public`. A public page shows the rows that need nothing, and a tool that needs an account as a grey row that says "Needs an account" and does nothing when pressed.
- `entry` picks the way in: the mark (`'mark'`, the default), an Open with item for your page's own menu (`'menu'`, given back as `entry` on the returned function), or both.

How the menu behaves:

- An Escape it handles stops there, so a page's own Escape on `document` does not also run.
- The fan-out measures the nearest box that clips it when it opens and opens toward the room it has (to the left of a right edge, above a bottom edge), or as the sheet from the bottom when neither side has room. At 480 px wide or less the menu is a sheet from the bottom.
- It reads the browser's connection at each open. Offline, a row that needs one is grey and leads nowhere, redrawn in place if the connection comes back while the menu is open.
- Your own tool's row, "You are here", is a plain item that closes the menu, drawn grey as where the reader already is.
- A row whose link is a web address opens in a new tab, and one that opens an app is handed to the device.
- The mark sits a little under the name's capitals (0.6em, never under 16 px).

From the keyboard, Tab goes from the mark through every row in order (in Safari too), the arrow keys, Home and End move within the menu, and Escape closes it and gives focus back to what opened it. Focus that leaves the menu closes it, including focus that comes back to the page on another control after the window lost it.
