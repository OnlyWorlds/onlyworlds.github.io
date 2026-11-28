---
title: "Games"
description: "Building a game on an OnlyWorlds world, your own or the one a player brings: carry it in the build, read it live, or write back into it, from Unity or any other engine."
---

A game on OnlyWorlds can stand on two kinds of world. It can ship with a world its makers wrote. Or it can take the world the player brings: their own characters, places and ties, as the game's cast and ground. The second is what a shared format is for. The player's world was written in some other tool, and your game reads it without knowing which.

To a game, either kind of world is content: characters, creatures, locations, objects, institutions, events and more, with links between them. It stays editable outside the game, on [onlyworlds.com](/docs/tools/onlyworlds-com), in [Atlas](/docs/tools/atlas) or in any tool built on the standard. So writers and designers can shape it without opening the engine, and the game picks up their work.

## The player brings the world

Three ways a player's world reaches your game:

- **Sign in with OnlyWorlds.** A registered tool sends the player to onlyworlds.com and gets an account token back, without ever seeing a password. The player then picks one of their worlds. See [Sign in with OnlyWorlds](/docs/development/api/signin).
- **A key they paste.** A key for a world of theirs. A read key (`ow_r_`) reads, cannot write, and needs no PIN. See [Keys and PINs](/docs/getting-started/keys).
- **A world file.** The player picks a world folder or a single `.owworld` file, and the game reads it from disk with no key, no account and no network. The [Unity SDK](/docs/development/unity) reads either today. See [World folders](/docs/schema/folders).

A stranger's world is small and uneven. It may hold thirty elements and no economy. So ask little of it: say what your game needs, check that on load, and name what is missing in words the player can act on. Subs asks for one Character in a world the player owns. A game that needs a whole setting accepts few worlds.

If the game writes into a player's world, the rules under [Write back](#write-back) apply: it is their work you are writing into.

## Three ways to hold a world

### Bake it in

Fetch the world at build time and ship it inside the game. It works offline, needs no key at runtime, and changes only when you rebuild. This fits a world that is written first and then played.

- **Unity**: fill a [cache asset](/docs/development/unity#ship-a-world-with-your-game) in the Editor and reference it from your scripts.
- **Any engine**: read a world folder (one JSON file per element, the format Atlas, the [Python package](/docs/development/python) and the Unity SDK use), or take a [full export](/docs/development/api/changes#full-export) from the API, and convert it into the engine's own data.

### Read it live

The game reads the world from the API while it runs, so a new character or a rewritten place reaches players without a patch. Fetch the world once, then ask the [changes feed](/docs/development/api/changes) for what changed since your cursor, rather than fetching everything again.

A read key (`ow_r_`) is made for this: it reads, cannot write, and needs no PIN. A key inside a shipped game can be extracted, so assume your players can read the whole world, [hidden elements](/docs/development/api/hidden) included. See [Keys and PINs](/docs/getting-started/keys).

What a live read can count on:

- **It's free**, with no fee and no account tiers.
- **300 requests a minute per key**, reads and writes together. Every copy of a game that ships the same key shares that key's 300; each reply's `RateLimit-Remaining` header says what is left, and over the budget the server answers `429` [`too_many_requests`](/api/errors/#too_many_requests) with a `Retry-After` header. See [Limits](/docs/development/api-reference#limits). <!-- limit: requests_per_minute -->
- **Under load the server answers `503`** [`server_busy`](/api/errors/#server_busy) with a `Retry-After` header. Wait that long, then retry.
- **Image uploads have a daily cap** per world.
- **The API can be briefly unavailable**, and there is no uptime guarantee.

So a game that must never break should bake its world in, and read live only the content that may change.

### Write back

The game writes its outcomes into the world: who died, which town burned, what was found. The world becomes the record of play, and every other tool on it sees the result. Writing needs a write key and the PIN, so keep it on a server or in a tool you control, not in a game you ship to players.

Four rules keep a write from damaging work done elsewhere:

- **Send only the fields that changed.** A `PATCH` replaces every field it carries, so sending back an element fetched earlier undoes edits made since.
- **Change link lists with editLinks**, which adds and removes ids on the server. A `PATCH` with a link list replaces the whole list. See [Links](/docs/development/api/links).
- **Check every bulk response.** A bulk write answers HTTP 200 even when some items failed. See [Writes](/docs/development/api/writes).
- **Keep game-only state in extension fields** (`x_yourgame_*`), which the server stores and returns verbatim, up to 64 KB per element. A well-behaved client carries other tools' extensions through untouched. See [Extension fields](/docs/schema/fields#extension-fields). <!-- limit: extensions_bytes -->

## Engines

| Engine | The path today |
|---|---|
| **Unity** | The [Unity SDK](/docs/development/unity): typed C# models, a v2 client, a world cache that ships as an asset, and a world browser in the Editor. |
| **Browser games** (JavaScript, TypeScript) | The [TypeScript SDK](/docs/development/typescript). |
| **Godot** | The [Godot SDK](/docs/development/godot), a GDScript addon on the standard build, in Godot's Asset Library: a class for each element type, the API client, and world folders and `.owworld` files on disk. Its first run reads Moppetopia with no account. No share yet. |
| **Unreal** | The [Unreal SDK](https://github.com/OnlyWorlds/unreal-sdk#first-run), a C++ source plugin: a world on disk gives a Blueprint struct for each element, with no server; over the API its Blueprint nodes answer JSON text, which C++ turns into structs. Since 0.8.0 Blueprints also read a world's maps (each Map's frame, its Zones and Pins, which Pins a reader knows) and lay out its graph by kind, around one element or by links in 3D. Since 0.9.0 they read how an element is shown, from the schema's views: its one sentence, its banners and the order of its fields. Since 0.10.0 a game holds a world and keeps it current from the change feed (`UOWWorldCache` with `SyncWorld`, `BaselineWorld` and `HasWorldChanges`), as the Unity and Godot SDKs do, and a poll of an unchanged world is answered `304`. Since 0.11.0 an error names the [size limit](/docs/development/api/writes#field-rules) a write passed: `OWApiError::Limit()`, with `IsElementTooLarge()`, `IsElementTooManyLinks()` and `IsExtensionsTooLarge()`, in C++, and `Limit` on Blueprints' `FOWApiError`, empty when the refusal named none. Since 0.12.0 a body the client cannot send whole is refused before anything goes, kind `Refused`: a NaN or an infinity, named with its place, and a body nested more than 256 levels from its top. No share yet. |
| **Other engines** | A [world folder or `.owworld` file](/docs/schema/folders) read straight from disk, with no key and no network: one JSON file per element. Or the [REST API](/docs/development/api-reference) directly: HTTPS and JSON, with the key in a header (the call below). Generate a client from the [OpenAPI document](https://www.onlyworlds.com/api/v2/openapi.json), and a class per element type from [schema-dist](https://github.com/OnlyWorlds/schema-dist) (its decoder, the walk, is Python today). A reader of the archive of your own is graded by schema-dist's `fixtures/owworld/`. |
| **Build pipelines and tools** | The [Python package](/docs/development/python) reads and writes world folders and talks to the API. |

Every path ends in the same call. This one finds Admiral Fluffington in Moppetopia, a public sample world, with its
demo key, the same first run the SDKs start with:

```bash
curl -H "API-Key: 0000000001" \
  "https://www.onlyworlds.com/api/v2/character/?fields=id,name&name__icontains=fluffington"
```

Unity, Godot and Unreal each have an SDK of their own; any other engine's path is the folder or the API. In Claude Code, the [toolkit](/docs/development/toolkit)'s `develop` skill carries these paths for a game, the map's coordinates included.

## Game content in the standard

The element types cover most of what a game holds. A starting point:

| In your game | Element type |
|---|---|
| Player characters, NPCs | Character |
| Races and peoples | Species |
| Monster and animal types (goblin, frost wyrm, the stat block) | Species |
| Individual monsters (the goblin chief, a named dragon) | Creature, linked to its Species |
| Items, gear, loot | Object |
| Skills, spells, actions | Ability |
| Passive perks, qualities | Trait |
| Guilds, kingdoms, orders | Institution (organized) or Collective (no formal structure) |
| Magic systems, currencies, crafting rules | Construct |
| Rules of a faction or realm | Law |
| Ranks and offices | Title |
| Languages, including those spoken in dialogue | Language |
| Quests and storylines | Narrative |
| Battles and happenings | Event |
| Weather, curses, magic storms | Phenomenon |
| Reputation, rivalries, alliances | Relation |
| Towns, dungeons, levels | Location |
| Territories and regions | Zone |
| Maps and what is placed on them | Map, Pin, Marker |

The line between Character and Creature is agency, not species: an intelligent monster with goals of its own can be a Character. `supertype` and `subtype` hold your game's own kinds (a Creature with supertype `Boss`), so you don't need new element types for them. Where two types are close, [Conventions](/docs/schema/conventions) draws the line between them. Each type's fields are listed under [Schema](/docs/schema/).

## On OnlyWorlds today

[Tactical Tangle](https://tangle.onlyworlds.com) is a hoplite battle game in which your OnlyWorlds characters fight in the ranks of a phalanx. [Subs](https://subs.onlyworlds.com) is a convoy-escort game of the Second World War, in which one of your Characters captains the lead escort: you open a world you own from a link, sign in or connect it with its key, and the crossing is written back into that world as a record. Everything else built on OnlyWorlds is listed under [Tools](/docs/tools/).
