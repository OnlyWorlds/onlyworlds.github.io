---
title: "Games"
description: "Building a game on an OnlyWorlds world: carry it in the build, read it live, or write back into it, from Unity or any other engine."
---

To a game, a world on OnlyWorlds is content: characters, creatures, places, items, factions and events, with typed links between them. The world stays editable outside the game, on [onlyworlds.com](/docs/tools/onlyworlds-com), in [Atlas](/docs/tools/atlas) or in any tool built on the schema. So writers and designers can shape it without opening the engine, and the game picks up their work.

## Three Ways to Use a World

### Bake It In

Fetch the world at build time and ship it inside the game. It works offline, needs no key at runtime, and changes only when you rebuild. This fits a world that is written first and then played.

- **Unity**: fill a [cache asset](/docs/development/unity#ship-a-world-with-your-game) in the Editor and reference it from your scripts.
- **Any engine**: read a world folder (one JSON file per element, the format Atlas and the [Python package](/docs/development/python) use), or take a [full export](/docs/development/api/changes#full-export) from the API, and convert it into the engine's own data.

### Read It Live

The game reads the world from the API while it runs, so a new character or a rewritten place reaches players without a patch. Fetch the world once, then ask the [changes feed](/docs/development/api/changes) for what changed since your cursor, rather than fetching everything again.

A read key (`ow_r_`) is made for this: it reads, cannot write, and needs no PIN. A key inside a shipped game can be extracted, so assume your players can read the whole world. See [Keys and PINs](/docs/getting-started/keys).

What a live read can count on:

- **It's free**, with no fee and no account tiers.
- **There is no request quota on reads** per key.
- **Under load the server answers `503`** [`server_busy`](/api/errors/#server_busy) with a `Retry-After` header. Wait that long, then retry.
- **Image uploads have a daily cap** per world.
- **There is no uptime guarantee.**

So a game that must never break should bake its world in, and read live only the content that may change.

### Write Back

The game writes its outcomes into the world: who died, which town burned, what was found. The world becomes the record of play, and every other tool on it sees the result. Writing needs a write key and the PIN, so keep it on a server or in a tool you control, not in a game you ship to players.

Four rules keep a write from damaging work done elsewhere:

- **Send only the fields that changed.** A `PATCH` replaces every field it carries, so sending back an element fetched earlier undoes edits made since.
- **Change link lists with editLinks**, which adds and removes ids on the server. A `PATCH` with a link list replaces the whole list. See [Links](/docs/development/api/links).
- **Check every bulk response.** A bulk write answers HTTP 200 even when some items failed. See [Writes](/docs/development/api/writes).
- **Keep game-only state in extension fields** (`x_yourgame_*`), which the server stores and returns verbatim, up to 64 KB per element. A well-behaved client carries other tools' extensions through untouched. See [Extension Fields](/docs/schema/fields#extension-fields).

## Engines

| Engine | The path today |
|---|---|
| **Unity** | The [Unity SDK](/docs/development/unity): typed C# models, a v2 client, a world cache that ships as an asset, and a world browser in the Editor. |
| **Browser games** (JavaScript, TypeScript) | The [TypeScript SDK](/docs/development/typescript). |
| **Godot, Unreal and other engines** | The [REST API](/docs/development/api-reference) directly: HTTPS and JSON, with the key in a header (the call below). Generate a client from the [OpenAPI document](https://www.onlyworlds.com/api/v2/openapi.json), and types for the 22 element types from [schema-dist](https://github.com/OnlyWorlds/schema-dist) (its decoder, the walk, is Python today). |
| **Build pipelines and tools** | The [Python package](/docs/development/python) reads and writes world folders and talks to the API. |

Every path ends in the same call. This one reads three characters of Moppetopia, a public sample world, with its demo
key, the same first run the SDKs start with:

```bash
curl -H "API-Key: 0000000001" \
  "https://www.onlyworlds.com/api/v2/character/?fields=id,name&limit=3"
```

Unity is the first engine with an SDK of its own. Until another engine has one, its path is the API.

## Game Content in the Schema

The 22 element types cover most of what a game holds. A starting point:

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

The line between Character and Creature is agency, not species: an intelligent monster with goals of its own can be a Character. `supertype` and `subtype` hold your game's own categories (a Creature with supertype `Boss`), so you don't need new element types for them. Where two types are close, [Conventions](/docs/schema/conventions) draws the line between them. Each type's fields are listed under [Schema](/docs/schema/).

## On OnlyWorlds Today

[Tactical Tangle](https://tangle.onlyworlds.com) is a hoplite battle game in which your OnlyWorlds characters fight in the ranks of a phalanx. Everything else built on OnlyWorlds is listed under [Tools](/docs/tools/).
