---
title: Import from other apps
description: "The onlyworlds Python package's importers: Campfire, Kanka, LegendKeeper, Notion and World Anvil, each read into a world folder."
---

The [`onlyworlds` Python package](/docs/development/python) brings a world in from five other worldbuilding apps: Campfire, Kanka, LegendKeeper, Notion and World Anvil. Each importer is a command (`python -m onlyworlds.<app>`) and a Python function, and each writes a [world folder](/docs/schema/folders) and a report of what it read.

Install the package first ([Install](/docs/development/python#install)). If you use a coding agent, the [toolkit](/docs/development/toolkit)'s `carry` skill also brings in an export from these apps.

## Campfire

Reads the html from Campfire's web app (File, Export Elements) into a world folder, with no AI and no account. Since 0.41.0.

```bash
python -m onlyworlds.campfire --file EXPORT.html OUT-DIR [--project NAME] [--plan]
```

From Python: `import_campfire`.

That export is a document, not data: it has no ids and no links. So each element's id comes from its type and name, a renamed element comes in as a new one, and `--project NAME` keeps two projects apart.

The file names no module, so each element's type is read from its panels (Basic Information with a Place of Residence is a Character, Location Details a Location) and the report names that evidence. One that matches none becomes a Narrative with supertype `Article`.

The description becomes `description`, and every panel value is kept as `x_campfire_<panel>_<label>`. A Place of Residence that names a Location in the same export becomes the Character's `location`.

## Kanka

Reads Kanka's JSON export (Campaign, Settings, Data, Export, JSON) into a world folder, with no AI and no account. Since 0.37.0.

```bash
python -m onlyworlds.kanka EXPORT.zip OUT-DIR [--plan]
```

From Python: `import_kanka`.

**What is read.** Characters, Locations (a child's parent as `parent_location`), organisations as Institutions and notes as Narratives (their text in `story`) are read on a real export. The other Kanka modules map by the same table and are believed until a real file shows them.

**Relations.** Kanka's own relations become Relation elements, a two-way pair one Relation.

**Duplicates.** Exact duplicates fold into one and the report names each fold; a near duplicate is kept.

**Nothing is dropped.** A key with no field is kept as `x_kanka_<key>`, and every one is named in the report.

**Hidden content.** What Kanka hides, the folder hides: a private entity becomes an element carrying `hidden: true`, and a private post or a part players cannot see becomes its own hidden Narrative linked to its entity.

**Starter entries.** Kanka seeds starter entries into a new campaign and nothing in the export marks them, so they are imported, and the report names the ones made within seconds of the campaign.

**Tags.** A tag becomes a Narrative that links what carries it, but a visible tag never links a hidden element (since 0.49.0).

**Pictures** are not imported. An element whose picture is in the export's `gallery/` keeps its reference as `x_kanka_image`, and the report names each one, since an OnlyWorlds picture is a web address and a world folder has no place for image files yet.

## LegendKeeper

Reads a LegendKeeper project through its own API v3 into a world folder, read-only and with no AI. Since 0.23.0.

```bash
LEGENDKEEPER_API_KEY=lk_... python -m onlyworlds.legendkeeper --project ID OUT-DIR [--plan] [--map TAG=TYPE ...] [--import-map]
```

From Python: `import_legendkeeper`. The key is yours, sent as the bearer and never stored, printed or written into the folder.

### From LegendKeeper's own export

Since 0.38.0 it also reads LegendKeeper's own export, with no key:

```bash
python -m onlyworlds.legendkeeper --file EXPORT.lk OUT-DIR
```

It takes the `.lk` or the `.json`; the Markdown export is lossy and not read. A real project of 41 resources is its fixture, and the `.lk` and `.json` give the same folder byte for byte. The export's templates carry `x_legendkeeper_template`; its tutorial pages are imported like any page, since nothing marks them.

### Element types

A resource becomes an element when a tag names one of the 22 types (or `--map place=location` says so). The rest become Narratives with supertype `Article`, and the report lists the tags a `--map` could use.

Since 0.58.0 the importer offers the shared [import map](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/import-map.md), LegendKeeper's common tags to the 22 types (`city` a Location, `organization` an Institution, `artifact` an Object, and so on). The report shows each row that would type a page, with how many, and nothing is typed by it until you say yes: `--import-map` for the run (`import_map=True` from Python), or `y` at the question a run at a terminal asks.

Your own `--map` wins for any tag it names, a template is never typed by the table, and a page whose tags name two types stays untyped and is named as ambiguous.

### Pages

Page blocks become Markdown in the description. A sidebar or infobox key becomes a field when its name is one, else `x_legendkeeper_<key>`.

A titled link list becomes a link field when the element's type has one of that name, else a Relation per target. Inline mentions keep their text and join `x_legendkeeper_mentions`.

### Maps

A map becomes a Map: its width and height from the map's bounds, its picture's address as `image_url`, which loads only while the LegendKeeper account's picture exists. Each pin becomes a Pin on it, placed from the bottom left and pointing at the page it links, the same pins on the same pixels from the export file and through the API.

Each region and path on a map becomes a Zone (`shape` `polygon` or `line`) with a Marker at each of its points, in order and placed the way pins are. A feature linking a page that comes in as a Zone, as an OnlyWorlds push writes them, gives its Markers to that Zone. Any other gets a Zone of its own naming the page in `x_legendkeeper_page`, which also becomes a Location's `zone` when the page is a Location with none set.

A region drawn as several polygons is a Zone made of parts: no Markers of its own, and one part Zone per polygon in its `linked_zones`, each with its Markers.

Labels are named in the report, not read.

### Timelines and calendars

A timeline's events become Events with the raw minutes and the formatted date kept as extensions. The timeline itself is a Narrative with supertype `Timeline` holding them, each lane a child Narrative.

Each calendar a timeline names becomes a Construct with supertype `calendar`, the LegendKeeper calendar kept whole in `x_legendkeeper_calendar`. When the [calendar profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md) can say it exactly, the Construct carries `atlas_calendar` (one step a day), the Events on it get `start_date` and `end_date` in days, and the world's `time_basic_unit` is `day`.

Five of LegendKeeper's six preset calendars are exact (Gregorian and Harptos in the profile's version 2); Scrolls keeps its minutes only, and the report says why.

A leap day's `day` is not read (LegendKeeper does not read it either), and the report counts the Events dated before a calendar's first era, which LegendKeeper still names and the profile reads with no era.

### Hidden content

Since 0.38.0, what LegendKeeper hides, the folder hides, never dropped. A hidden resource becomes an element carrying `hidden: true`, and a hidden page or a `secret` block on a visible resource becomes its own hidden Narrative (`<resource>: Secret`, its text in `story`, linked back), the page keeping only its visible text. The report counts each kind (`--include-hidden` and `--include-secrets` are gone).

### Boards

A board becomes a Map with supertype `Board` from either road, the API or the export:

- each page card a Pin on the page it shows (a card showing another board places that board's Map, which takes this one as `parent_map`);
- each frame a Zone (subtype `Frame`) with a Marker at each corner;
- each arrow between two cards or frames a Relation (supertype `Board link`);
- each note and text a Narrative pinned where it sits.

Positions are in the Map's own units from its bottom left, and the rest of the board is counted in the report. The board's records are kept whole in the folder's `records/legendkeeper/boards/`, named on the Map, so nothing is dropped and every element stays within the API's size limit.

### Ids and the round trip

Ids are UUIDv5 of the project and resource id, so a second import finds the same elements.

A project written by an OnlyWorlds push comes back as the same elements: a uuid in a key-value row `onlyworlds-id` is the element's id, tags `ow-supertype:` and `ow-subtype:` fill the two fields, and extension keys (`x_*`, `atlas_*`, `shadow_*`) return under their own names.

## Notion

Reads a Markdown & CSV export from Notion into a world folder, with no AI and no account. Since 0.19.0.

```bash
python -m onlyworlds.notion EXPORT.zip OUT-DIR
```

From Python: `import_notion`. `--plan` prints the same report and writes nothing.

**Layouts.** It reads both layouts real exports use: folders named by title alone, and a flat export with every page and table in one folder, where each table row is paired with its own page.

**How it maps:**

- A database becomes elements of one element type when its title names one (Characters, Locations) or a `Type` column does.
- A column maps to a field when its name, lowercased with spaces as underscores, is that field's name.
- A relation column maps to a link field of the same name, each target resolved by its Notion id or its title.
- A page becomes a Narrative with its Markdown as the description and its sub-pages their own.
- Attachments go to `media/notion/`.

**Nothing is dropped.** Every column the importer could not place is kept as `x_notion_<column>` and named in the report, with every link it could not resolve, so you see what to rename in Notion before the next export.

Ids are stable across exports of the same workspace. Built on the export's shape as seen in practice; a real export is the fixture still to be banked.

## World Anvil

Reads World Anvil's Export World page into a world folder, with no AI and no account. Since 0.39.0.

```bash
python -m onlyworlds.worldanvil --file EXPORT.html OUT-DIR [--plan]
```

From Python: `import_worldanvil`.

The Export World page is one print-style page, not data: save it from the browser and give the importer the file. The world's own page saved with every article on it reads the same way.

**Element types.** Each article becomes an element of its template's type. Character, Species, Geographic Location and Organization are read on real pages; the other templates are believed until a real file shows them, and an unknown one becomes a Narrative with supertype `Article`, named in the report.

**Dates.** An article's dates are kept as `x_worldanvil_created`, `_updated` and `_published`.

**Links and mentions.** A link to another article keeps its text, and its target's id joins `x_worldanvil_mentions`. A mention World Anvil left unresolved (`@Name`) is kept as written, and the report names each.

**Pictures.** A Character's uploaded portrait is its `image_url`, and any other picture the importer does not read is kept as `x_worldanvil_unread_images` and named.

**Template fields.** A template field that links, such as Birthplace, given as a place's name typed as text, links the one element of that type with that name, and the report lists each; Current Location fills `location`. A category is kept as `x_worldanvil_category`, and a template field with no OnlyWorlds name as `x_worldanvil_<field>`; the report names each.

**Ids.** Ids come from World Anvil's own article ids, so a second export of the same world gives the same elements.

**Hidden content.** An article that is not public comes in carrying `hidden: true`; a free account can't make one, so that path is untried on a real file.
