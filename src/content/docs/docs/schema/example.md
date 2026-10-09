---
title: A Worked Example
description: One small world, Moppetopia, read through the API to show how the categories, links and timeline fit together.
---

Moppetopia is a demo world: a civilization of felt creatures called moppets, a navy that fights in puddles and in space, and an old war its people tell in different ways. Anyone can read it with its demo key `0000000001` (read-only, no PIN). Every call on this page runs as written.

```bash
curl -s "https://www.onlyworlds.com/api/v2/world" -H "API-Key: 0000000001"
```

## One Element

Admiral Fluffington is a Character: an individual with agency. His text fields (`description`, `physicality`, `mentality`, `background`) hold prose. His link fields hold the ids of other elements.

```bash
curl -s "https://www.onlyworlds.com/api/v2/character?name__icontains=fluffington" -H "API-Key: 0000000001"
```

The answer is a page of results, trimmed here to the link fields:

```json
{
  "data": [{
    "id": "0695db83-afd7-76ee-8000-00f4295f8866",
    "name": "Admiral Fluffington",
    "birth_date": 249,
    "location": "0695db83-972a-74da-8000-262f1559a7f1",
    "species": ["0695db8a-1642-7449-8000-c896529a4537", "0698c9df-422f-7255-8000-624e6f5e0a47"],
    "family": ["069945d9-d873-7076-8000-96d538f41a22"],
    "rivals": ["0695db83-b69a-772b-8000-557e9ba0dcc3"]
  }],
  "has_more": false,
  "next_cursor": null
}
```

`location` is a single link: one Location. `species`, `family` and `rivals` are multi links: lists. Fetch him by his `id` and add `?expand=` to read the names behind the ids:

```bash
curl -s "https://www.onlyworlds.com/api/v2/character/0695db83-afd7-76ee-8000-00f4295f8866?expand=location,family,rivals&fields=name,location,family,rivals" -H "API-Key: 0000000001"
```

He is in Feltropolis, an orbital station; his family is House Stuffington, a naval dynasty; his rival is Captain Snoot.

## Links Point One Way

A Character has no field for titles. The link lives on the Title: Admiral is a Title whose `holders` are three Characters and whose `body` is the Puddle Navy, an Institution.

```bash
curl -s "https://www.onlyworlds.com/api/v2/title?name=Admiral&expand=holders,body&fields=name,body,holders" -H "API-Key: 0000000001"
```

So to find what a Character holds, read the Titles and check their `holders`: there is no reverse lookup, and a filter on a link field is a `422` ([Filters](/docs/development/api/reads#filters)). Each link sits on the element that holds the field; the element pages ([Title](/docs/schema/element_categories/title), [Character](/docs/schema/element_categories/character)) show which side that is.

## Places Within Places

Locations nest through `parent_location`, the wider Location a place is part of. Feltropolis has seven levels, each its own Location whose parent is Feltropolis; the places on a level name that level as theirs, so The Dry Room and Whisper Gallery sit under Level 3, The Squeeze. A tool can draw the station as a tree from that one field.

## Same Name, Two Categories

The Treaty of Soft Landings ended the war, and Moppetopia holds it twice. As a **Law** it is the document: its `declaration` holds the wording, its `purpose` why it was made. As an **Event** it is the signing: a `start_date`, the Event that triggered it (The Great Puddle War), and the Locations where it happened. The name is shared; what each element can carry is set by its category.

## One Event, Two Stories

The Moistened Valley Massacre is an Event: a time-bound happening, with `triggers` (the Events that led to it), `consequences` (a text field) and the Characters involved. Three of the world's Narratives tell it:

| Narrative | Told by | Events |
| :--- | :--- | :--- |
| The Moistened Valley Account | `conservator`: the Treaty Council | The Great Puddle War, Treaty of Soft Landings, Moistened Valley Massacre |
| The Ballad of Splashworth | `conservator`: the Puddle Navy | Moistened Valley Massacre |
| Snoot's Counter-History | `narrator`: Captain Snoot | Moistened Valley Massacre, The Incident |

```bash
curl -s "https://www.onlyworlds.com/api/v2/narrative?expand=narrator,conservator,events&fields=name,narrator,conservator,events" -H "API-Key: 0000000001"
```

The call lists all of the world's Narratives, these three among them. The Event records what happened; each Narrative is one account of it, with a teller or a keeper and its own selection of Events. A fourth, What Happened in the Moistened Valley, has `subtype` `knowledge`: it holds what is actually true, and its `narrator` (Captain Snoot) and `collectives` are the ones who know. Descriptions say what the world believes; a knowledge Narrative says who knows better.

## A Connection With Its Own History

Fluffington's `rivals` field says he opposes Snoot, and nothing more. The Fluffington-Snoot Rivalry is a Relation: it has an `actor` (Fluffington), both Characters, an `intensity` of 85 on a scale of 0 to 100, a `start_date`, a Location (the Naval Academy), and a `background` explaining why. Use a plain link for the fact of a connection; use a Relation when the connection itself has a story. [Conventions](/docs/schema/conventions) covers the choice.

## Time

Dates are integers on the world's own timeline. Moppetopia counts in years (`time_basic_unit`), from 0 to 500, and its present is 453 (`time_range_current`). The massacre's `start_date` is 248, the signing's 250, Fluffington's `birth_date` 249: he was a baby when the Treaty was signed. How the world names those years (Year 203 YSL, Years Since Landing) is a calendar Construct, a tool convention rather than a schema field. [Worlds](/docs/schema/worlds) covers the timeline fields.

## What It Leaves Out

Moppetopia uses all 22 categories, several of them once: one Family, one Language, one Phenomenon, one Relation. Most of its elements leave most fields empty, and the world is still valid: [Fields](/docs/schema/fields) lists what is required. Its two Maps (a space map, and the planet's surface as its `parent_map` child) carry the Pins, Markers and Zones; [Maps](/docs/schema/element_categories/map) covers how those fit together.
