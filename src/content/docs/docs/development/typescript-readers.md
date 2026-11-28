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

Lenses, the graph, the reading aids and the strand also take the viewer, the person the result is for, as `{ rung }` (the argument named `reader` in their signatures). A rung is how much of the world that viewer may see, one of five:

- `owner`: the whole world.
- `co-builder` (since 4.182.0): the whole world as the owner reads it, hidden elements included; the cut counts `anchor_not_visible` and `not_visible` stay the owner's.
- `contributor`: the world less its hidden elements, plus the hidden elements it made, listed in `whole` (since 4.182.0; before, none of the hidden).
- `guest`: only the elements the guest was given, listed in `whole`, and those it knows of only by name, in `known_of`. Hidden beats `known_of`: a hidden element `known_of` names is not in the guest's view at all.
- `public`: the world less its hidden elements and its [room elements](/docs/schema/profiles#room).

Pass the rung of whoever will see the result, so a tool never shows a person more than they may see. An owner can read as another reader with `{ rung: 'owner', as: { rung, … } }`: the view is that reader's, and the owner's two counts stay.

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

A proposed element you include carries `[proposed, not yet reviewed]` on its first line (`REVIEW_PROPOSED_LABEL` is the text inside the brackets), and a kept element's link to a left-out one reads as not present, so its name stays out too.

An element counts as proposed when its `x_review_proposed` is present: absent, null and an empty mark (`""`, White_Space only, `[]` or `{}`) are settled. It counts as hidden when `hidden` is anything but absent, null or false. `leftOut` holds three lists, `proposed`, `hidden` and `room`, and an element with several marks is listed once, in the first of hidden, proposed and room whose option is off: a hidden proposed element is listed under `hidden` only, and `includeProposed` alone never sends it.

The proxy's limits are counted after the marks: at most 8 elements, each cut to 2,000 characters (listed in `truncated`), 12,000 in all. `dropped` lists the elements past the 8th, or from the first one the total could not hold, so what is sent is always the top of the list as shown.

Each account has a token rating: the number of AI tokens it may spend on the proxy each day, the same meter the Council spends from. Asking spends from it: `reply.tokens_remaining` and `reply.token_rating`, and `reply.remaining` counts the answers of this size still in it. Used up, it throws with `err.isQuotaExceeded`. `account.allowance()` reads the token rating without spending anything: `{ token_rating, tokens_used_today, tokens_remaining, resets_at }`, where `resets_at` is the next midnight UTC. `account.aiUses()` lists the uses the proxy runs ([the AI door](/docs/development/ai#the-ai-door-a-use-by-name)).

The same proxy can also [sort loose notes](/docs/development/ai#sort-notes-into-a-world) into a world. You send a person's notes with a slice, the elements your lookup found for them, and get back rows for the person to review: each row makes an element, adds to one, links two, or asks which of some candidates is meant. Every id in a row comes from the slice, and nothing is written until your app applies what the person accepts:

```typescript
const slice = hits.slice(0, 100).map(({ element: e }) => ({ id: e.id, type: e.type, name: e.name }));
const { rows, not_proposed } = await account.ai('sort', { world_id: worldId, notes: ['Mira moved to Ostvik.'], slice });
// rows: make, add_to, link, or ask (with candidates); one question from the same token rating
```

## Lenses

A lens is a saved way of reading a world: which elements, how far from a starting set, how much of each. It is a Construct with supertype `Lens`, and it only narrows what the viewer may already see ([Lenses](/docs/lenses), the lens profile).

`resolveLens(world, lens, reader, { asOf, clock })` reads a world snapshot through a lens for one viewer and returns the kept elements in order, the cut counted by reason, and the mail part when the lens names one; it never writes. The lens's links are its anchors, and its `x_lens` is the recipe: `depth`, `types`, `window` or `from` and `to`, `undated`, `changed_within`, `show`, `budget`, `mail` and `notes`. The Python package's `resolve_lens` gives the same answers on the same input.

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

- a link to an element the viewer cannot see is left out: a single link reads null, and a Pin's `element_type` and `element_id` pair reads `""` and null
- a lens kept as an element keeps only the notes on elements the viewer sees
- `x_served_trimmed` names a message's `characters` and `narrator`, or a lens's anchor fields, for a contributor or a guest, never for the public
- a contributor's or a guest's row keeps a link to a proposed element it sees, and a lens's note keyed to one, as the API serves them; the public rung loses both

The owner's rows are the bodies as stored, and under `show: full` an owner's row of a hidden element carries `hidden: true`. No row carries a stored `x_served_trimmed`: the mark names only what this reading trimmed.

</details>

## A world as a graph

`worldGraph(world, reader, options)` reads the same snapshot, for the same viewer, as nodes and edges, by the lens profile's graph section ([A world as a graph](/docs/lenses/graph)). It returns:

- `nodes`: `{ id, type, name, family, icon }`, by id; `family` is the type's colour group (`blue`, `green`, `pink` or `amber`, as [`ELEMENT_GROUPS`](/docs/development/typescript#schema-constants) gives it), a key for drawing, never a label
- `edges`: `{ source, field, target, index }`, one per link: each link field of the schema, and the extension lists a profile reads as links, `DECLARED_LINKS` (`x_lens_leads_to`, `x_spine_depends_on`; since 4.168.0 exported, for a writer that builds one and must name each element once)
- `edgesCut`: links to elements that are not nodes, counted by reason
- `cut`: the elements left out, counted by reason: with a lens, the lens's own cut; without one, the kinds left out by default (`room`, `hidden` and `proposed` for a keeper only, the owner or a co-builder, `map_space`, `reading_aid`)
- `unreadable`: the `x_lens` key a lens could not be read by, else null

Room elements, hidden and proposed elements, and map space (Maps, Pins and Markers; a Zone is a node like any other) are left out unless `rooms`, `hidden`, `proposed` or `mapSpace` brings them back. The reading aids (the charter, its guide, its domains) come back with `readingAids`, each marked `reading_aid`, in a graph without a lens.

`hidden` and `proposed` are a keeper's, the owner's or a co-builder's (a co-builder since 4.184.0, and the owner reading `as` one), and a public viewer takes no flag: a refused flag throws, naming it, before anything is read.

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

## The most linked

`mostLinkedOf(graph, { perType })` (since 4.203.0) lists the most linked elements of each type in what `worldGraph` answered, and returns `{ per_type, by_type }`:

- `by_type` holds, for each type, at most `perType` (3 by default) of its elements as `{ id, name, degree }`, most linked first by the [landing profile](/docs/schema/profiles#landing)'s degree, ties by id in code point order. The types are in code point order, and a type with nothing to pick is left out.
- An element with no link and a guest's known-of element are never picked. The name is the graph's, or `null` when it has none.
- `per_type` is the count it was read at. A `perType` that is not a whole number of 1 or more is refused by name.

It counts only what the graph holds, so a reader is never pointed at what it is not served: hidden, proposed and room elements and map space stay out unless the graph brought them in.

Use it as "the most linked", not as "where to start". A world's secret is often its hub: a cover-up links everything it covers, so it comes first in its type. Where a world has a Guide, the Guide is where a reader starts.

It is a draft reading, held to a fixture in the package itself, `test/fixtures/most-linked.fixture.json`, with the same bytes as the Python package's copy, until the landing profile takes it.

```typescript
import { mostLinkedOf, worldGraph } from '@onlyworlds/sdk';

const most = mostLinkedOf(worldGraph({ elements }, { rung: 'public' }), { perType: 3 });
most.by_type.character; // [{ id, name, degree }, ...], most linked first
```

## Map space

`mapSpace(elements)` reads a world's Maps, Zones and Pins as frames, outlines and points, by the [map-space profile](/docs/schema/profiles#map-space). It takes the elements as the viewer is served them and returns `{ maps, zones, pins, out }`, all four always present:

- `maps` holds each Map's frame: `width`, `height`, `depth`, `z_max` (the largest z among its own points), `scale` (metres per pixel from `x_metres_per_pixel`, else `null`), `location` and `parent_map`. A whole-number `width` or `height` is answered as written, 0 and under 0 included (since 4.182.0); one that is missing or not a whole number is measured from the Map's own placed points and marked `extent: "points"`, and is `null` when the Map has no placed point of its own.
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

### A child Map on its parent

A Map that shows part of another (a town on its region, a room on its floor) says where it lies on the Map its `parent_map` names with `x_parent_frame`: a box `[x0, y0, x1, y1]` in the parent's pixels, from its bottom left. `carryOf(map, point, maps)` (since 4.183.0, the profile's rules 13 and 14) carries a point on a Map up that chain, one level at a time by each level's own frame, and answers `{ parent_frame, lint, points, stop }`:

- `parent_frame`: the Map's own `x_parent_frame` as written, or `null` when it is no frame.
- `lint`: what is wrong with the Map's own key, `no_parent` (a frame on a Map with no `parent_map`), `not_four_numbers` or `not_a_box`, else `null`.
- `points`: the point on the Map as given, then `{ map, x, y }` on each Map it is carried to.
- `stop`: why the walk ended: `top` (a Map with no `parent_map`), `dangling` (its parent is not served), `cycle`, `no_frame` (a Map with no frame on its parent) or `no_carry` (a written `width` or `height` that is not a whole number above 0).

`maps` is the Maps as the viewer is served them. A point outside the child is carried as written, and `z` is not carried. `mapSpace` and `layoutOf` do not read the key.

```typescript
import { carryOf } from '@onlyworlds/sdk';

const maps = elements.filter((e) => e.type === 'map');
const { points, stop } = carryOf(maps[0], [120, 80], maps);
points; // [{ map, x: 120, y: 80 }, { map: its parent's id, x, y }, ...]
stop; // 'top' once the walk reached a Map with no parent_map
```

### The Pins one viewer knows

A map drawn as one Character sees it shows a Pin only when that Character knows what the Pin places. `pinsKnownTo(pins, served)` (since 4.200.0) answers which Pins those are. `served` is the elements as that viewer was served them, and the function reads nothing else, so the map cannot show a viewer more than the world told them. It answers `{ known, unknown, out }`, all three always present:

- `known`: each Pin whose element is among `served`, as `{ pin, map, element_type, element_id, how }`, by Pin id. `how` is `whole`, or `known_of` when the element reached the viewer as a stub it only knows of (`isKnownOf`), so a drawing can tell a place heard of from a place known.
- `unknown`: how many Pins place an element the viewer was not served. A number, never their ids.
- `out`: `no_link` counts the Pins that place nothing; absent when there are none.

The two lists are two reads. `pins` comes from whichever read holds the map (a public world's, the owner's), and may be the whole world's elements: only the Pins in it are read. `served` is the viewer's own list, or the owner's read as that Character with `viewAs`. The answer carries ids and no name or body, and it does not ask whether a Pin has a point or its Map is there: `mapSpace` reads that, and a drawing keeps the Pins both name.

```typescript
import { ELEMENT_TYPES, mapSpace, pinsKnownTo } from '@onlyworlds/sdk';

// What one Character is served: the owner reads each type as that Character.
const served = [];
for (const type of ELEMENT_TYPES) for await (const el of owner.listAll(type, { viewAs: id })) served.push(el);

const { known, unknown } = pinsKnownTo(elements, served);
const how = new Map(known.map((k) => [k.pin, k.how]));
const drawn = mapSpace(elements).pins.filter((p) => how.has(p.pin)); // each with its point
how.get(drawn[0]?.pin); // 'whole' or 'known_of'
```

The type and the id are compared as written, and of two served rows with one type and id the last one decides. This is a rule of the two packages, not of the standard: the Python package's `pins_known_to` runs the same cases.

## A world's default picture

`layoutByKind(graph)` (since 4.167.0) lays out a world nobody laid out, from its graph as `worldGraph` answers it. Each kind gets a point on a circle, links pull, neighbours push apart, and the points are fitted into a frame of -1 to 1 on the longer axis. It answers `{ method: 'by-kind', version: 1, points }`, one `{ id, x, y }` per node in the order you passed them. `layoutAround(graph, focus, { steps })` draws one element at 0, 0 with its neighbours on rings, one or two steps out, as `{ id, depth, x, y }`.

The picture depends only on the world. Both functions put the graph in one order first, whatever order you hand it. An edge's `index` is its place in the list as that reader is served it, so two readers of one world (the owner and the public, say) can hold different numbers for one edge; the order is what counts, and it holds. The circle's points come from a table rather than from the runtime's `cos` and `sin`, so every browser and the Python package's `layout_by_kind` draw the same points, bit for bit. Nothing is saved: to keep a picture, save it as a layout Map yourself. Both methods are written out in the standard's [default layouts profile](/docs/schema/profiles#default-layouts), whose fixture the package's tests replay. A method's word is its version, so a saved layout says what made it by `method` alone; `version` stays 1.

`unplacedByKind(graph, placed)` and `unplacedAround(graph, focus, placed, { steps })` (since 4.170.0) answer what a saved layout does not place. A world that has grown since a layout was saved holds elements the Map has no Pin for; hand in the graph and the ids of the elements the Map's Pins stand for (a list or a Set: from `mapSpace`, the `element_id` of each pin whose `map` is that Map) and each answers the ids its method would place that are not among them, by id in code point order. For `by-kind` that is every node of the graph, for `around` the focus and every node within the steps. The answer's length is the count a tool shows. Neither function places anything.

```typescript
import { worldGraph, layoutByKind } from '@onlyworlds/sdk';

const graph = worldGraph({ elements }, { rung: 'owner' });
const { points } = layoutByKind(graph);   // [{ id, x, y }, ...], each x and y within -1..1
```

## A world laid out in 3D

`layoutByLinks3d(graph, elements?, { held, heldUnit })` (since 4.171.0) lays a whole graph out in three dimensions by its links. The most linked elements become centres, each with its group round it. The groups are packed apart and settled by 300 seeded steps, and what hangs off the body fans out from it. Since 4.182.0 every other piece of linked elements (elements joined to each other but not to the main piece) is laid out the same way on its own: a piece with a pinned or held element stands where those points put it, and every other one stands on a ring round the main picture, the largest first, a ring holding as many as fit before the next opens further out. An element linked to no other and pinned on no map is not placed: it is left out of the rows and listed in `unplaced` (before 4.182.0, everything off the main piece stood on a shelf under the picture). Pass the world's elements as the second argument and its maps join in: the Map that holds the most of the graph's elements by a Pin, three or more, becomes a flat plate with each pinned element at its Pin. Maps and Pins are read through `mapSpace` and `layoutOf`. A Pin's `z` is not read, and a layout map is never the plate. A Map whose `width` or `height` is not over 0 is no plate either: when it is the Map that holds the most, the world is laid out by its links alone (since 4.171.1; before that a width under 0 made the call throw).

It answers one row per placed node, in the order you passed them:

| Key | What it holds |
|---|---|
| `ids` | The placed nodes' ids. |
| `points` | A `Float64Array`: x, y, z of `ids[i]` at `3 * i`, in units where a link at rest is `BY_LINKS_3D_REST` (60) long. |
| `how` | How each was placed: `centre`, `with` (in a centre's group), `arm` or `link` (hanging off the body), `map` (at its Pin). An element of another piece takes the word its own piece's layout gives it. |
| `group` | The id of the centre the element stands with, or null. |
| `part` | For an element with no centre: `map` or `one-link`. Null where `group` is an id. |
| `centres` | The centres' ids: the main picture's in the method's rank order, then each other piece's, the pieces largest first. |
| `held` | True where the point is one you handed back. An element with a Pin on the map is never held, so false does not mean new. |
| `unplaced` | The ids of the nodes not placed (linked to no other node and pinned on no map, a held one too), by id in code point order. |

The same input gives the same points in every browser and in the Python package's `layout_by_links_3d`: to the last bit for a centre, a grouped element and a pinned one off the ring, and within a billionth of a rest for the rest and for every piece on the ring, which are placed with the runtime's own cosine, sine and arcsine. Both packages replay the method's published fixture (116 cases).

To keep a picture still as a world grows, hand an earlier answer's points back as `held` (element id to `[x, y, z]`), with `heldUnit: 1` when you saved them as whole numbers. A held element stays where it was (one with a Pin on the map stands at its Pin, held or not), and what is new is placed round it. To count what is new, count the ids you did not hand back, never `held: false`. A layout that hands every point back costs less than one from nothing (since 4.171.1). Nothing is saved: to keep a picture, save it as a layout Map yourself. A saved layout keeps points only; the groups are read again from the world.

The method's word, `by-links-3d`, is one of the [default layouts](/docs/schema/profiles#default-layouts) since the standard published its page (serial 137). `BY_LINKS_3D_VERSION` (since 4.174.0; 2 since 4.182.0, the pieces) says when a release has moved its points: it is raised exactly when a release moves an answer of the method, and never otherwise. A tool that keeps a picture to hand back as `held` stores the version beside the points, and lays the world out fresh when the two differ.

```typescript
import { worldGraph, layoutByLinks3d } from '@onlyworlds/sdk';

const graph = worldGraph({ elements }, { rung: 'owner' });
const layout = layoutByLinks3d(graph, elements);
layout.points;    // Float64Array: x, y, z of layout.ids[i] at 3 * i
layout.centres;   // the ids of the most linked elements, each the centre of a group
```

`unplacedByLinks3d(graph, placed)` (since 4.173.0) answers what a saved `by-links-3d` layout map does not place: the ids of the graph's nodes that are not in `placed`, by id in code point order. Every node counts, of any type, also one the method does not place (linked to no other node and pinned on no map), so for the Map an answer makes this is that answer's own `unplaced`. `placed` is the ids the Map's Pins stand for, a list or a Set, read as `unplacedByKind` reads it.

## A layout along a route

`trailByPlace(input)` lays a world out along a route on a ground map and answers a layout in the standard's own fields: a Map frame (`width`, `height`, `depth`) and one Pin per element, whole numbers in the Map's pixels, so `mapSpace` reads it back. It places and does not read: you hand it which elements are in, the order of travel and what hangs where, and it answers the same points for the same input.

- `places`, in travel order: each sits at its own `pin` on the ground map (the `margin` is added on every side), evenly `between` two pinned places, or on a ring inside a `parent` place.
- `hangers`: every other element, with the places it belongs to (`at`). Each sits on one spiral round the mean of those places' points, lifted to its kind's floor (`tiers`; `TRAIL_TIERS` is the default, each floor named by its kinds: location, object and zone on the ground at 0; character, collective, creature and species at 240; event at 480; the other eleven kinds at 720). A `hero` stands first on its spiral.
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

- `charter` is `{ id, type, name, rules, skill }` or null: the newest marked Charter, its `x_checks_rules` list (`[]` when none) and the Objects its text names, at most five.
- `guide` is `{ id, type, name }` or null.
- `domains` come in the order the Guide's `constructs` names them, then the rest by name.
- Each Domain is `{ id, type, name, sentence, hubs }`: its description trimmed, cut at its first line break, and trimmed again, and the elements its links name that the reader sees, each of the kind its field links to, as `{ type, id }`.
- `type` (since 4.177.0) is `law` on the Charter and `construct` on the Guide and on each Domain: the word the element routes use.

`domainsOf(world, reader)` returns the Domains alone. `world` holds the elements as the owner is served them, with `open: true` for a world open to anyone (only then does a public viewer see anything), and `reader` is the viewer's `{ rung }`, as in [What every reader takes](#what-every-reader-takes).

`isCharterElement(el)` reads the mark `x_charter_of` by its presence: any value but null, a string only when something is left after trimming, and since 4.163.0 an empty list or an empty object is no mark either. `CHARTER_PAIRS` lists the three type-and-supertype pairs. The pair without the mark is lore and stays in every view: a kingdom's Charter in a novel's world is a Law like any other. A tool's front door shows the aids first, and a lore view leaves them out by default. A reading aid is not a room element: `isRoomElement` answers false for one.

`readingAidOf(element)` answers which aid an element's type and supertype make it, `'charter'`, `'guide'`, `'domain'` or null, with the mark ignored: what a tool offers to mark it as.

```typescript
import { charterOf } from '@onlyworlds/sdk';

const { charter, guide, domains } = charterOf({ elements }, { rung: 'owner' });
```

`designPartsOf(world, reader)` (since 4.181.0, serial 135) answers the design parts that reader reads, each `{ type, id, state }`: an Object or a Construct it is served whole whose `subtype`, trimmed and in any case, is `in design` or `locked`, and that word as its `state` (`In Design ` is `in design`). It answers only where `charterOf` finds a Charter for the same reader, and `[]` everywhere else; a known-of stub has no design state, though it is served its subtype. It takes the same `world` and `reader` as `charterOf`.

## The strand

`strandOf(world, reader)` returns a world's story in miniature, `{ narrative, event, location, character, now, same }`, as that viewer sees it, by the [strand profile](/docs/schema/profiles#strand).

The World's `x_strand` (`STRAND_FIELD`) names three ids: the story (a Narrative), one of its events and one of that event's places. Only the story is required: `event` and `location` null or absent read as unset, a strand begun. A mark with no story, an empty string in any member, or an `event` or `location` that is neither a string nor unset, is no mark, and every slot is null. Nothing is trimmed: a member of white space alone, or an id with a space on it, names no element, so its slot is null (since schema-dist serial 134 the fixture holds both; `strandOf` read them that way before).

- `narrative`, `event` and `location` are those elements, each only when it is of its kind, visible to the viewer and in its parent's list (the event in the story's `events`, the place in the event's `locations`).
- `character` is the story's `protagonist` and `now` the hero's `location`.
- Each is `{ id, type, name }` or null, and no slot is filled from another. `type` (since 4.177.0) is the kind the slot holds, never the spelling stored: `narrative`, `event`, `location` or `character`, and `location` for `now`.
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

A record is an Event whose `x_record` (`RECORD_FIELD`) names the game (`tool`) and when it was played (`played_at`, a real instant, written as `2026-11-01T00:30:00Z` and read by the message profile's time grammar since 4.161.0: a time without its seconds is no record), with optional `version`, `seed`, `outcome` and `seats`. Who took part is the Event's `characters`.

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

A hand is the member whose key wrote an element: `created_by` records the hand that made it, `changed_by` the hand that last changed it. A sender is proved when the hand that made the message plays the Character it claims to be from (its `narrator`), and a read mark counts only in its own reader's hand. The message pair is exported as `MESSAGE_PAIR`. A read mark is a Relation with supertype `Read` whose `actor` is the reader, and it counts only when every write on it was the reader's: its `created_by` plays the reader's Character, and its `changed_by`, where it carries one, equals its `created_by`.

A world folder or an export carries no `created_by`, so there is no hand to check: `unreadFor` trusts a message's `narrator` (`senderStatus` still answers `unverifiable`), a read mark counts, and `members` can be left out. On the wire, pass `members`, or every message that claims to be from the reader stays unread for them.

```typescript
import { isMessage, isAddressedTo, senderStatus, readMarkOf, unreadFor } from '@onlyworlds/sdk';

const { character: myCharacter } = await client.me(); // the id of the Character you play here: a member's key (null for an owner's or the demo key)
if (!myCharacter) throw new Error('this key plays no Character here: read mail with a member key');
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

Only a message is addressed: for any other Narrative `recipientsOf` answers `[]` and `isAddressedTo` false (since 4.166.0). `isAddressedTo(m, id)` is true for a message to everyone (an empty `characters`), and `isToEveryone(m)` asks only that. Of several marks in your hand, `readMarkOf` takes the one with the newest readable `updated_at`; at the same instant, or when none can be read, the higher id by code point (since 4.161.0). `threadOf(messages, rootId)` lists a thread in order.

### Times

Every reader here orders by `created_at` as an instant, and the reader it uses is exported (since 4.159.0), so a tool that sorts with it orders exactly as they do. `instantOf(value)` gives `{ seconds, microseconds }` (whole seconds since 1970-01-01 UTC, and the fraction's first six digits), or `null` when the value cannot be read; `compareInstants(a, b)` puts earlier first, a `null` after every readable one, and two equal instants at 0, so a stable sort keeps the order given:

```typescript
import { instantOf, compareInstants } from '@onlyworlds/sdk';

items.sort((a, b) => compareInstants(instantOf(a.created_at), instantOf(b.created_at)));
instantOf('2026-11-12T10:00:00+02:00'); // { seconds: 1794470400, microseconds: 0 }
instantOf('2026-11-12');                // null: a date alone is not read
```

It reads the whole value as `YYYY-MM-DDTHH:MM:SS`, an optional fraction after `.`, then `Z`, `+HH:MM`, `-HH:MM` or nothing (read as UTC); `T` and `Z` in either case; each part in its range (a day that month has, an hour to 23, a minute and a second to 59). A year is any four of the digits 0 to 9, 0000 among them, on the Gregorian calendar run on in both directions, so 0000 is a leap year and an offset can carry an instant before 0000 or past the end of 9999. A fraction counts to its sixth digit, later digits dropped, never rounded. Not read: a date alone, a space for the `T`, a time without its seconds, an offset without its colon, a leap second, a trailing line break.

The readers know a message the server trimmed for its viewer (`x_served_trimmed`): an empty `characters` with the mark is to someone you cannot see, never to everyone. `hasUnseenRecipients(m)` says so, and a hidden sender is `senderStatus` `'unseen'` ("from someone you cannot see").

A body read with no key, as the public is served it, carries no hands and no trim mark. There, pass `{ keyless: true }`: `readMarkOf(marks, id, members, { keyless: true })` is `null`, `isToEveryone` is false, and `hasUnseenRecipients` is `null` (unknown) for a message. A body that is not a message (a Story, a Note) has no recipients, so `hasUnseenRecipients` is false for it, with a key or without.

`editedBy(m, members)` says whether a later hand changed a message, and whose. A Note (supertype `Note`) is a member's own line, never a message: `isNote(el)`, and `noteOf(narratives, characterId, members)` gives the id of that Character's newest Note in its own hand.

## Report threads

A report that continues earlier work names the first report of that work as its `parent_narrative`, and a closed talk's report names the board entry it hangs on. `reportThreadsOf(narratives)` reads the reports among the Narratives you give it, in the order you were served them, and tells the two apart, as the [report profile](/docs/schema/profiles#report)'s rule 9 says:

```typescript
import { reportThreadsOf } from '@onlyworlds/sdk';

const narratives = [];   // the reports and the board entries they may hang on: a parent not given reads 'missing'
for (const supertype of ['Report', 'Board'])
  for await (const n of client.listAll('narrative', { filter: { supertype } })) narratives.push(n);
const { parents, groups, lints } = reportThreadsOf(narratives);
for (const g of groups) {
  // g.kind 'report': a thread, g.parent its first report; 'board': the closed talks' reports under one board entry
  // g.reports: the ids that name g.parent, by created_at (equal times keep the order given)
}
```

`parents` says, for each report, what its parent is: `none`, `report`, `board`, `missing` (an id whose element you were not given), `other` or `self`. Only a Narrative with the pair and the room's mark `x_room_of` is a report or a board entry; without the mark it is lore. Nothing is walked further up: a report under a report that itself names another report is shown under the one it names, with a `chain` lint, and one that names itself gets a `self` lint and heads the thread of the reports that name it. A thread takes nothing away from where a report hangs: its `relations` still name its work item. `threadOf` reads messages; reports group by `reportThreadsOf`. Give it the reports as listed, with `parent_narrative` an id: a list read with `expand=parent_narrative` serves the parent as an object, which reads as no parent, so every report heads a thread of its own.

## Report lines

A completed report's `consequences` holds one line per change, and a line names the element it changed by its address. `readReportLines(text, { world })` (since 4.169.0) splits the text and reads each line as the [report profile](/docs/schema/profiles#report) says; `readReportLine(line, { world })` reads one:

```typescript
import { readReportLines } from '@onlyworlds/sdk';

for (const l of readReportLines(report.consequences ?? '', { world: worldId })) {
  // l.words: what to show; l.address: the element the line names, 'ow://<type>/<id>', or null
}
// "Renamed the Consul's Steinway: ow://object/01a1d4ef-0000-7000-8000-000000000084."
//   words: "Renamed the Consul's Steinway."   address: 'ow://object/01a1d4ef-0000-7000-8000-000000000084'
```

The text splits at every carriage return and line feed, and each line is trimmed of White_Space; an empty line is no line. A line's address is the last one in it that names an element of this world: an `ow://` or site address, its ids' hex in either case (the prefix, the host and the type word only in lowercase), whose world is `world` or is left out. Pass `world` lowercase, as the world holds its id: an address's world is read lowercase and compared with it exactly. An address of another world, a world alone or a slug is part of the words, and a line with none names nothing, which is no fault: a line may count many changes in words. The address leaves `words` only when nothing the writer wrote is lost: it is written exactly as the address profile writes it, with no moment and no lens, and stands apart (the line's start, White_Space or one colon before it; the end, White_Space or a closing mark `. , ; : ! ) ] } ' " ’ ” »` after it), alone or in a matched pair of brackets or quotes. Then it goes with the White_Space around it and one colon before it, and the halves join with one space. In any other shape, or when nothing stands before the address, the whole line is the words and `address` still names its element. Whether that element exists is yours to read. `reading`, `start` and `end` give the address as parsed and where it stands in the line.

## Talks

A line in a world's room that names an Object in its `objects` or a Construct in its `constructs` is in the talk on that element, whichever sitting it was said in ([room profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/room.md), serial 135). `talksOf(element)` (since 4.181.0) answers the talks a line is in, each `{ type: 'object' | 'construct', id }`; any element that is no line in the room (a Message without the mark, a board entry, a report) answers `[]`. Each id is read as written, its case and any space left on it included; an entry that is not a string, or is empty once trimmed, names nothing. `reportTalksOf(narrative)` answers the talks a report is shown with, its `objects` and `constructs` read the same way ([report profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/report.md)). Neither says which talk, if any, a report closed: the report alone cannot tell.

## Work items

A work item is a Relation with supertype `Work item`, and its subtype is its state ([packet profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/packet.md), serial 136). `workStateOf(item)` (since 4.181.0) answers `'open'`, `'taken'`, `'done'` or `'standing'`, matched trimmed and in any case, or null for no state: blank, missing, or any other word. `isOpenWork(item)` is true only for `open` and `taken`: a standing item is a kept order of work and never open work, and an item with no state is never open work either. `askerOf(item, world?)` answers the Character `x_packet_from` names, or null; it never falls back to the maker or `actor`, and with `world` only one of that world's Characters counts.

`workOf(items, world, source?)` reads the work items one reader is given together, `world` as `{ id, characters, others }` (the ids of its Characters and of every other element the reader holds), and the third argument the same for a world the packets name elements of. It answers `states` and `askers` (each keyed by an item's id), `shown` (every item, none hidden for its state), `openWork` (for each element an item names in `x_packet_elements`, the open work that names it), `elements` (each item's entries in order), `waitingOn` (for each Character of the world, the open work it asked for, so the work that waits on its answer) and `lints` (`{ kind: 'asker', item }` for an `x_packet_from` that is no one id, or names, written exactly so, another element the reader holds; an id that names nothing the reader holds is no lint). The Python package has no reader of work items.

## Proposed elements

An element an AI seat wrote as [proposed](/docs/development/api/proposals) follows the [review profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/review.md): `proposedMarkOf(el)` gives its mark as a viewer shows it, `{ by, expires, lapsed }`, or `null` for a settled element. `by` is the mark's own word, read as stored and never trimmed since 4.155.0 (`null` when it is not a string or is whitespace alone), to be shown as [the review profile](/docs/schema/profiles#review) says, as the mark's word and never as a fact. `handsOnAsProposed(el)` is what a reader function that hands a world on (a context for an AI, a share) leaves out, a malformed mark included. `buildAskContext` reads the same function.

## World calendars

A world's time is an integer line: the world's now (`time_range_current`) and an Event's `start_date` are points on it. A calendar names those points with months, days and eras.

A world's calendars sit on elements (a Construct by convention), each in an `atlas_calendar` field; a calendar is found by that field, never by its supertype. The field belongs to [Atlas](/docs/tools/atlas), the main OnlyWorlds workspace, which reads it with the same calendar code as the SDK: read it, never write it.

The Python package's LegendKeeper import also writes one, from a source calendar, by Atlas's rules.

```typescript
import { worldCalendars, speakingCalendar, formatStep, parseDate } from '@onlyworlds/sdk';

const calendars = worldCalendars(elements); // every element with a valid atlas_calendar
const cal = speakingCalendar(world, elements); // the calendar the World names, or the world's only one
if (cal) {
  formatStep(cal.config, 400);               // "4 Alturiak, 1 DR"
  parseDate(cal.config, '4 Alturiak, 1 DR'); // { step: 400 }
  parseDate(cal.config, '4th, 4 Alturiak, 1 DR'); // { step: 400 }: a weekday beside the date is read
  parseDate(cal.config, '3rd, 4 Alturiak, 1 DR'); // { error: 'that date falls on 4th, not 3rd' }
}
```

`world` is the World's own keys (what `GET /world` returns, `world.json` in a folder), any object type since 4.207.1, and `elements` the whole world's elements. Since 4.207.0 the World names its calendar in `x_calendar`, the id of the element that carries it (`WORLD_CALENDAR_KEY`), matched as written. A name that is not a calendar among the elements gives null, never another calendar in its place. With none named, the world's only calendar speaks, and several give null.

A tool with a person in front of it may keep that person's own pick over the World's: `resolveCalendar(elements, chosenId, { fallbackToOnly: true })` takes the id they picked. With `fallbackToOnly`, when none was ever picked (`undefined`) and the world holds exactly one calendar, that one is used; `null` means no calendar.

The dates in the example come from Harptos, one of the calendars the SDK's own tests read: point 400 is day 4 of the month Alturiak, in year 1 of the era written DR. Since 4.220.1 `parseDate` reads a weekday written beside a whole date, so a calendar whose `format` prints `{weekday}` reads its own dates back, and it refuses a weekday that is not that date's own, naming both; a day outside the week answers `that date has no weekday, not 1st`. A weekday alone names no date, and the separators are whitespace, the comma, the period and the word `year`: a template that prints brackets, a slash, a dash or a colon between its parts does not parse back.

No calendar, or a broken one, gives null: show the bare number.

`formatYearLabel(cal.config, 400)` gives the short year label for a wide axis (`"1 DR"`), and `breakdownStep(cal.config, 400)` the parts of a point: its year, era, month, day, weekday and intercalary day (a day that belongs to no month). Since 4.212.0 (schema-dist serial 149) the reader holds the profile's size bounds: a calendar with more than 256 eras, 64 months, a week of more than 64 steps or names, 16 days outside the months, an `except` longer than 8, a name or template longer than 256 characters, or a year longer than 2^53 - 1 is not a calendar, and `readCalendarConfig` answers `null`. To let its owner open such a calendar and cut it down, `readCalendarShape(value)` (since 4.217.0) reads it but for those bounds and gives `{ config, limit }`, `limit` the first bound it passes in `validateCalendarConfig`'s words; it is `null` only for a broken shape. A `config` with a `limit` is for an editor, never for formatting. A date past the exact range (its step, its year index plus a leap rule's `offset`, or its year in its era outside ±(2^53 - 1)) is shown as its plain number, and `breakdownStep` gives the step with every other part `null`, `absYear` and `year` included. In `parseDate`, a bare number is always the raw step. Formatting the step `parseDate` read from a label `formatStep` wrote gives that label back, though a format that drops detail may not give back the same step.

A page with no build step takes the same names from `@onlyworlds/sdk/calendar` (since 4.199.0): `dist/calendar.js` in the package is one file of about 26 KB that imports nothing, so a `<script type="module">` loads it as it ships. The main entry cannot be loaded that way, since it is split into several files and one of them imports a dependency by its bare name. A tool that bundles takes the names from the main entry.

The SDK reads the calendar profile's version 2: a leap day's rule can carry `except`, divisors that flip it in order, and `offset`, added to the year index before the rule (1 for a calendar with no year 0). Gregorian is `every_years: 4, except: [100, 400], offset: 1`. A calendar reader that knows only version 1 gives null for a version-2 calendar, so it shows the bare number, never a wrong date.

A calendar is data someone else may have written, so labelling a shared world should not cost what its calendar says. Since 4.201.2 a long template, a long month name and a month of millions of days each format in under a millisecond (Python 0.148.2 the same). Since 4.208.1 the eras cost in proportion to their count, no more: a calendar with 1,500 eras takes under a millisecond a label and one with 15,000 about 4 ms (Python 0.154.1: about 9 ms and 100 ms). Leap rules cost in proportion too. A tool that labels many dates from a world it does not own can still bound the eras it accepts.

Eras count up by default; one that counts down toward its start (years before a founding) is a down era. An era that counts up and has no `end` runs to the start of the next era that counts up, whatever order the eras are listed in. An era's `year_base` says whether its first year is numbered 0 or 1 (1 when left out); any other value makes the calendar unreadable, so the reader gives null.

## Addresses

The [address profile](/docs/schema/profiles/addresses) reads and writes an element's link: `parseOwLink(text)` reads any of the three spellings (the site's address, `ow://<type>/<id>`, `ow://<world>/<type>/<id>`) with its moment and lens, and `elementAddress(address)` writes one. A world by itself is `https://www.onlyworlds.com/w/<world id>` or `ow://<world id>`, and any address may end in a moment, `@<step>`, and a lens, `?lens=<id>`. A string the profile refuses throws an `OwAddressError` whose `reason` is the profile's own name. The profile's fixture is these functions' own test.

A field that holds an address is text: never resolve or fetch it on the server. Show one wording, "private or missing", both for a world you cannot read and for an element that is not there, so the answer says nothing about which.

```typescript
import { parseOwLink, elementAddress } from '@onlyworlds/sdk';

const r = parseOwLink('ow://character/0193f1c2-7a00-7000-8000-000000000001');   // { form: 'text', world: null, type: 'character', id, lens: null, moment: null, canonical: true, … }
const link = elementAddress({ form: 'human', world: worldId, type: 'character', id });   // https://www.onlyworlds.com/w/<world>/character/<id>
```

To find an address inside prose, `readOwLinkAt(text, index)` (since 4.161.0) reads the address that starts at `index` and answers `{ reading, end }`, or `null` when none starts there; since 4.165.0 it also answers `null` when the address would begin inside a word (after a letter, a combining mark or an underscore). What follows the address is prose, a full stop included; [An address in prose](/docs/schema/profiles/addresses#an-address-in-prose) has the rule. `index` and `end` count JavaScript string indexes (UTF-16 code units), so they match a string's own slice and search.

```typescript
import { readOwLinkAt } from '@onlyworlds/sdk';

const line = 'Built the gate: ow://object/01a1d4ef-0000-7000-8000-000000000084.';
const found = readOwLinkAt(line, line.indexOf('ow://'));
found?.end;          // 64: line[64] is the full stop
found?.reading.id;   // '01a1d4ef-0000-7000-8000-000000000084'
```

`findOwLinks(text)` (since 4.165.0) finds every address in a text, in order, as `{ start, end, reading }` each, none overlapping; it reads at each place a prefix starts, so it answers what `readOwLinkAt` answers there, in time linear in the text.

### Names in prose

`nameFinder` (since 4.194.0) finds a world's element names in any text, so a page can show which words are elements: a hover, a suggestion, a link a person chooses to make. It finds and never writes. Make the finder once per world, then call it on each text:

```ts
import { nameFinder } from '@onlyworlds/sdk';

const elements = [{ id: 'a1', name: 'Iron Gate' }, { id: 'b2', name: 'Kira' }];
const find = nameFinder(elements, { case: 'exact' });
const found = find("Kira's watch ends at the Iron Gate.");
// [{ start: 0, end: 4, element: elements[1] }, { start: 25, end: 34, element: elements[0] }]
```

`case` must be given, with no default: `'exact'` for a page that marks names unasked, `'folded'` (simple case folding, the fold the world file reader uses) for an editor that only suggests. `names` gives the names an element is found by, by default its `name` alone, so a tool can pass its own aliases. Which elements go in is the caller's choice.

- **A whole name only.** The character on each side is not a letter, a combining mark, a decimal digit or an underscore, in any script. `Kira's` and `Kira-led` hold the name; `Kiran` does not. A name that starts or ends with a letter outside ASCII is found the same way.
- **Trimmed, three characters at least.** A shorter name is never looked for.
- **The longest whole name wins** where several start at one place: `Iron Gate` over `Iron`.
- **A name two elements share is never answered**, and nothing inside it is: the text stays plain there. One element found by two of its own names is one element. `find.shared` (since 4.198.0) lists those names, each as `{ name, elements }`: the name as it is compared (trimmed, and folded when `case` is `'folded'`) and the elements that hold it, in the order given. A tool reads it to tell a writer why a name never links.
- **Nothing inside an address, a Markdown link** `[label](target)`, **a bare web address or an autolink** is read. A bare web address is `http://` or `https://` (in any ASCII case) to the next white space or `<`; an autolink is `<scheme:…>` (since 4.208.0).
- **Markdown on request.** `find(text, { markdown: true })` (since 4.208.0) is for a text you know is Markdown: nothing inside an inline code span, a fenced code block, an HTML tag or comment, or a reference definition's line is read either, so a link written over a found name never lands in code or a URL. It is off by default, so a rich-text node's literal backticks stay prose. An indented code block, a fence inside a quote or a list, and a definition's title on the next line are read as prose.
- **Every mention is answered**, in order, none overlapping. `element` is the object you passed in; `start` and `end` are string indexes into the text.

Three limits. Text is compared as written, with no Unicode normalisation, so a letter typed with a combining mark does not match its one-character form. A space in a name matches that one space. In a script written without spaces between words (Chinese, Japanese, Thai) a name is whole only between punctuation or spaces.

The work for one text grows with its length alone, whatever the names and however many (since 4.198.0; before it, at most the text's length times the longest name's length): the text is read once, and no character is read again for another name. This is a rule of the two packages, not of the standard: the Python package's `name_finder` runs the same file of cases.

### Open with

`openersFor(tools, kind, address, surface)` gives the rows of an **Open with** menu for a world or an element: onlyworlds.com first, then each [listed tool](/docs/development/list-your-tool) whose `open` key has a door for it, in the list's order. `TOOLS` is the tools list baked at this release.

Each row is `{ id, name, href, state }`; a menu draws the rows as given and decides no word of its own, so every surface says the same, and the Python package's `openers_for` answers every case the same way. `state` is null when the row opens now, or one of `You are here`, `Needs a connection`, `Needs an account`, `Sign in to <tool> first`, `Opens in your browser`, `Needs the world on this phone` or `Opens the world`.

`surface` says what the page knows:

- `audience` (required): who is looking. `member` is anyone with a seat in the world, a guest included; `public` is a signed-out visitor. A public page (`audience: 'public'`) gets the tools that need nothing, and each tool that needs an account as a row that says `Needs an account` and opens nothing, unless its row's `open.opens_public` is true (its links open a public world with no account), when it is a row that opens; a tool that needs the world on the device is not there.
- `tool`: your own tool's client name, whose row then says `You are here`; `onlyworlds` for the site itself.
- `online`: with `online: false` every row whose link is a web address says `Needs a connection`, the site's own row included; a row whose link opens an app is unaffected. Default true.
- `signedIn`: whether the viewer is signed in. Signed out in a browser, a tool that needs an account says `Sign in to <tool> first`. Null or absent when the page cannot know, and then no row says so.
- `browser`: false in a desktop app, which cannot see the browser's sign-in; a tool that needs an account then says `Opens in your browser`. Default true.
- `phone`: true on a phone, where a tool that needs the world on the device says `Needs the world on this phone`. Default false.

An element's menu takes the element as you were served it, `openersFor(tools, 'element', address, surface, { element })`. A tool whose element door does not open what it carries (a room element, a hidden or proposed one, a Map, Pin or Marker, a reading aid: the list's `element_skips`, each read as [`worldGraph`](#a-world-as-a-graph) reads it) has no row, rather than a link to a page that cannot open it. Without it every row is there. The element must be the one the address names: the address's id is read in either case, the element's own `id` as written ([the same id](/docs/schema/profiles/addresses#the-same-id)), so an element held in upper case is refused with a `TypeError` (`its id differs`).

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

const remove = mountWaymark(document.querySelector('#title')!, {
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
- `returnFocus`, with `'menu'` or `'both'`: your page's own visible element (its "..." button) that takes focus back when the menu, opened from the entry, closes by Escape; without it the entry takes it. It is refused with `'mark'`.
- `world` is `{ id, name }` as `getWorld()` or a folder's `world.json` gives them; its `x_names`, when present, words the type.
- `tools` is the tools list's rows, `TOOLS` by default.
- `lenses` is `[{ id, name }]`, the lenses your page offers, drawn as a Through row and never shown to the public; a lens chosen rides on the copied link as `?lens=`.

An unknown option is refused by name, and a value of the wrong kind with a `TypeError`, before anything is drawn.

Copy link copies the site's address with the world's id (`elementAddress`), never a slug, and says "Link copied". With no clipboard, or the copy refused, the menu stays open and says "Could not copy the link." over the address, selected in a read-only line to copy by hand, until the menu closes. The public face shows the name line without the last door, then the rows and Copy link.

No node carries a `style` attribute, so the menu runs under `style-src 'self'`; load `waymark.css` with the page. Every colour in it is one of its two grounds, `dark` and `paper`, declared once at the top of the file. The fan-out and the toast are set in the system's face; since 4.220.0 a page sets its own with `--ow-waymark-font` on `.ow-waymark` or any element around it (`.ow-waymark { --ow-waymark-font: Lato, sans-serif; }`), and the size stays the menu's.

The menu opens toward the room it has, becomes a sheet from the bottom on a narrow screen, greys the rows that need a connection while offline, and works from the keyboard. Not in this version: a moment picker (it needs a time bar), and the tools' own marks (every listed tool wears one generic glyph for now). To try it, run `npm run demo` in a clone of the [package's repository](https://github.com/OnlyWorlds/sdk): it builds the package and serves `demo/waymark.html`, where `?current=atlas` makes the page Atlas, so its row says "You are here".

<details>
<summary>How the menu behaves, in detail</summary>

- An Escape it handles stops there, so a page's own Escape on `document` does not also run.
- The fan-out measures the nearest box that clips it when it opens and opens toward the room it has (to the left of a right edge, above a bottom edge, with the classes `ow-waymark__pop--end` and `ow-waymark__pop--up`), or as the sheet from the bottom when neither side has room. At 480 px wide or less the menu is a sheet from the bottom, its rows at least 44 px tall, and the mark's tap area is at least 44 by 44 px at every width.
- It reads the browser's connection at each open (`navigator.onLine`), and the window's `online` and `offline` events while it is open. Offline, a row that needs one is grey and leads nowhere: a link with no href and `aria-disabled="true"`, still in the Tab order, redrawn in place if the connection comes back while the menu is open.
- Your own tool's row, "You are here", is a plain item that closes the menu, drawn grey as where the reader already is: a button with `aria-current="page"`, not a link.
- A row whose link is a web address opens in a new tab, and one that opens an app is handed to the device.
- The mark sits a little under the name's capitals (0.6em, never under 16 px).

From the keyboard, Tab goes from the mark through every row in order (in Safari too), the arrow keys, Home and End move within the menu, and Escape closes it and gives focus back to what opened it. Focus that leaves the menu closes it, including focus that comes back to the page on another control after the window lost it.

</details>
