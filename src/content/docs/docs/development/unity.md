---
title: "Unity SDK"
description: "The OnlyWorlds Unity SDK: typed C# models for the 22 element types, a client for the v2 API, and a world cache that lives in your project as an asset."
---

`com.onlyworlds.sdk` reads and writes OnlyWorlds worlds from Unity, on [onlyworlds.com](https://www.onlyworlds.com) or in a world folder on disk. For what that gives a game, see [Games](/docs/development/games). It has three parts:

| Part | Assembly | What it is |
|---|---|---|
| **Bridge** | `OnlyWorlds.Sdk` | Typed models for the 22 element types, a client for the REST API v2, and sync from the changes feed. This is what game code links against. |
| **Cache** | `OnlyWorlds.Sdk` | A world as a `ScriptableObject` asset: inspectable, offline, and kept across domain reloads. Filled from the API or from a world folder on disk. |
| **Viewer** | `OnlyWorlds.Sdk.Editor` | A world browser in the Editor: **Window → OnlyWorlds → World Browser**. |

The models are generated from [schema-dist](https://github.com/OnlyWorlds/schema-dist) at a pinned tag, never written by hand. The source is [OnlyWorlds/unity-sdk](https://github.com/OnlyWorlds/unity-sdk), under the MIT licence.

:::note[Early]
The package is public and in use, but it carries no compatibility promise yet, so expect the interface to change between releases. The [changelog](https://github.com/OnlyWorlds/unity-sdk/blob/main/Packages/com.onlyworlds.sdk/CHANGELOG.md) says what each version holds.
:::

## Install

Unity 6 (6000.0) or later, with [Git](https://git-scm.com) installed: the Package Manager needs it to add a package from a git URL. In the Package Manager: **+ → Add package from git URL**, and paste:

```
https://github.com/OnlyWorlds/unity-sdk.git?path=/Packages/com.onlyworlds.sdk
```

To pin a release, add a tag from the [repository's tags](https://github.com/OnlyWorlds/unity-sdk/tags) to the end of the URL (`…com.onlyworlds.sdk#v<version>`). The package depends on Newtonsoft JSON (`com.unity.nuget.newtonsoft-json`), which the Package Manager resolves for you.

**Platforms**: the requests go through `UnityWebRequest`, and the JSON converters are marked to survive IL2CPP code stripping, which was checked by inspecting a stripped Android build. The package has not yet been run on a device, or in a WebGL build.

The package ships a **Quick Start** sample (Package Manager → OnlyWorlds SDK → Samples). It reads a world at runtime, from the API or from a cache asset, and shows nullable fields, link resolution and error handling.

## Read a world

No account yet? The demo key `0000000001` reads Moppetopia, a public sample world, with no PIN. It's the same key the
other SDKs start with, so the output matches theirs.

```csharp
using OnlyWorlds.Sdk;
using UnityEngine;

public class ReadWorld : MonoBehaviour
{
    // A read key (ow_r_) needs no PIN. A key in a build can be extracted from it,
    // so ship only a read key, and only for a world your players may read.
    [SerializeField] private string apiKey = "0000000001";

    private async void Start()
    {
        var client = new OWClient(new OWClientConfig
        {
            ApiKey = apiKey,
            Transport = new UnityWebRequestTransport(),
        });

        var characters = await client.ListAllAsync<OWCharacter>("character");
        foreach (var c in characters)
        {
            var level = c.Level.HasValue ? c.Level.Value.ToString() : "unset";
            Debug.Log($"{c.Name}: level {level}");
        }
    }
}
```

`ListAllAsync` follows the cursor through every page. `ListAsync` returns one page, and `GetAsync` one element by id. See [Keys and PINs](/docs/getting-started/keys) for the kinds of key.

**Links are ids.** `c.Location` is a location's id, or `null` when unset, and `c.Species` is a list of ids. A cache resolves them: `cache.Get<OWLocation>(c.Location)`, `cache.Resolve<OWSpecies>(c.Species)`. Without a cache, you fetch each by id.

**Errors come in two kinds.** `OWApiError` means the server answered and refused: it carries `StatusCode`, `Code`, `Param`, `DocUrl` (a link into [Errors](/api/errors/)), `IsRetryable` and `RetryAfter` (seconds to wait, or null); the client never retries on its own. `OWTransportError` means no answer arrived at all.

**Dates on the world's own calendar.** `OWCalendar` reads a world's calendar (the `atlas_calendar` field Atlas writes) and formats and parses dates the way Atlas and the [TypeScript SDK](/docs/development/typescript) do; `OWCalendarLens.WorldCalendars` finds the calendars a world holds. A missing or malformed calendar reads as `null`. Since v0.5.0; since v0.8.0 it follows the [`atlas_calendar` profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md) and passes the profile's conformance fixture, as the TypeScript SDK does.

**A world's own words for the types.** `OWNames.TypeWord(world, type, supertype, many)` reads the World's `x_names` (the [names profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/names.md)) and returns the word to show for a type, *Employee* for a Character in a work world, or `null` for the standard's name; the supertype's word comes first, and `many` asks for the plural. A display lookup only: routes, folders and field names keep the standard's. Since v0.14.0, on the profile's 23-case fixture.

## Ship a world with your game

A cache is a world stored as an asset in your project. Fill it in the Editor, and the build carries it: no network, no key and no waiting at runtime.

1. Set a key in **Window → OnlyWorlds → World Browser → Settings**. It is stored in `EditorPrefs` on this machine, for this project alone, never in the project's files or in version control. **Test Connection** names the world the key opens; with a PIN beside a write key it asks `/me`, so a wrong PIN shows there (`401 invalid_credentials`) rather than at your first write, while a write key with no PIN still connects, since reads need none (since v0.16.0).
2. **Connect**, then **Sync to Cache**. The cache asset is written under `Assets/OnlyWorlds/`. **Open Folder…** fills a cache from a world folder on disk instead.
3. Reference the asset from your scripts:

```csharp
[SerializeField] private OWWorldCache world;

void Start()
{
    foreach (var c in world.All<OWCharacter>("character"))
        Debug.Log($"{c.Name} lives in {world.Get<OWLocation>(c.Location)?.Name}");
}
```

The same steps run from code. `OWSync.BaselineAsync(client, cache)` fetches the whole world. `OWSync.IncrementalAsync(client, cache)` applies only what changed since the cache's cursor, from the [changes feed](/docs/development/api/changes), and falls back to a full baseline when the cursor can't be trusted. Edits to world metadata are not in the feed, so poll `GetWorldAsync` when those matter. `OWFolderLoader.LoadInto(cache, path)` reads a world folder and never writes to it. A folder Atlas wrote opens whole: its pins' and markers' links (`map_id`, `zone_id`) and the older `spatial/` layout, with an element found in both served from `elements/` (since v0.6.0).

**A downloaded world file.** `OWEnvelopeLoader.LoadInto(cache, path)` fills a cache from the one-file export an owner downloads from their world's page (`format: onlyworlds-world-export`), read-only: the file is a capture, with nothing to sync and no folder to write back to. `OWEnvelopeReader.Read(path)` returns what a folder read returns, plus the file's `SchemaVersion` and `ExportedAt`. A file whose `format` is anything else is refused whole. The file carries no images, members or time settings. `OWFolderExport.ExportFileAsync(path, folder)` writes the same file out as a world folder. Since v0.7.0.

**A world as one file, `.owworld`.** A world folder zipped under its own extension. Drop one into `Assets/` and it imports as a read-only cache; **Assets → OnlyWorlds → Pack World Folder…** packs a folder from anywhere on disk into the project, and `OWWorldArchive.Pack(folder, archive)` does the same from code. Packing writes only the archive, leaves out dot-folders and `.meta` files, carries `records/` byte for byte, drops `world.json`'s `api` block (it holds a key) unless you ask to keep it, and gives the same bytes for the same folder. The archive is read in memory and never extracted, and an entry name that climbs out of the world refuses the whole archive. Pictures in `media/` travel but are not imported yet. Since v0.8.0. From v0.11.0 the archive follows the [folder format](/docs/schema/folders)'s §4.7 and agrees with its 78-case conformance set: a refusal names its cause (`OWFolderFormatException.Reason`, one of the twelve `OWWorldArchiveReason` values, the same names the [TypeScript SDK](/docs/development/typescript#world-files) uses), a `mimetype` marker is read when present, the default budget is the spec's floor (500,000 entries, 2 GiB), names are strict and case-fold collisions refuse (Unicode simple case folding, pinned at 15.1.0), the `api` block is stripped on read, and `Pack` writes entries in code point order. `Pack` writes no marker yet (a Unity-packed file is marker-less, which the format allows), so a reader that wants one must not require it. From v0.12.0 an entry whose bytes fail its CRC-32 refuses the archive (every file, media and records included), and the conformance set runs as the package's own test (79 of 79 at schema-dist serial 40). From v0.15.0 `Pack` leaves out a producer's records marked private in `records/RECORDS.json` unless you pass `includePrivateRecords: true`, keeping `RECORDS.json` byte for byte (folder format 0.3.15, [private records](/docs/schema/folders#folders-and-onlyworldscom)); the set is at 85 on serial 49.

## Join by a link

A friend with no account can join a world from a [player link](/docs/development/api/members#player-links), and an AI agent from an [agent link](/docs/development/agents). `OWJoin.ParseLink(text)` takes the code out of a pasted link (`…/join#ow_j_…`) or a bare code. `OWJoin.PreviewAsync(code, transport)` (no key needed: pass `new UnityWebRequestTransport()`) says who the code is for (`Reader`: `player`, `agent` or `person`), the world and the role, without using the code. `OWJoin.RedeemAsync(code, transport, name: …)` spends it: a player gets a read key (`ow_r_`, no PIN) and the Character they read as; an agent, with `agentName`, gets its seat's write key and secret. The answer is shown once, so keep `Key` (and an agent's `Pin`) before anything else. A person's link is joined with an account on onlyworlds.com, not here. Every bad code (used, expired, revoked, unknown) is the same `404`. Since v0.7.0.

**A table of players** (a [party link](/docs/development/api/members#a-table-of-players), since v0.9.0): `IsTable` on the preview tells one apart, with `UsesLeft`, `NameRequired` and `Characters`, each an `OWJoinPick` with its id, name, picture and whether it is `Taken`. Pass the pick as `character` to `RedeemAsync`, or a `name` at a table that lists none. `OWApiError.IsCharacterTaken`, `IsCharacterInvalid` and `IsWorldFull` name the three refusals; none of them spends the code.

## Write

Writes need a write key (`ow_w_`) and a secret in `OWClientConfig.ApiPin`: best an [agent seat](/docs/development/agents)'s own `ow_s_` secret, which works in one world and can be removed, or else the account PIN. Both can be extracted from a build, so write from the Editor, a server or a tool you control, never from a game you ship to players.

**Send only what changed.** A `PATCH` replaces every field it carries, so sending back an element fetched an hour ago undoes an hour of someone else's edits. `OWEdit` snapshots an element and sends the difference:

```csharp
var edit = OWEdit.Begin(character);
character.Level = 12;
await edit.CommitAsync(client, "character"); // sends { "level": 12 } and nothing else
```

**Change link lists with `EditLinksAsync`.** A `PATCH` with a link list replaces the whole list. `EditLinksAsync<OWCharacter>("character", id, "friends", add: new[] { friendId })` adds and removes on the server, in one atomic step.

**Check every bulk write.** `BulkAsync` answers HTTP 200 even when some items failed. Read the result's `Errors` and `Failed`, or call `ThrowIfAnyFailed()`.

**Make a retry safe with a key.** Pass `idempotencyKey` to `CreateAsync` or `BulkAsync`: the ids of elements sent without one come from the key, so a retry after a lost answer replays the first instead of writing twice.

**Say when an agent is writing.** If an AI agent drives the client, set `Agent = true` on `OWClientConfig`: element writes then carry `X-OW-Agent`, and keel records them as agent-made. Leave it off in a tool people use. Every element reads `ChangedBy` and `ChangedVia`, and `OWWriteDoor.IsAgent(el.ChangedVia)` tells agent-made work apart.

**Name your tool, and write only on what you read** (since v0.16.0). `OWClientConfig.Client` names your tool on every element write (`X-OW-Client`, lower case letters, digits and hyphens; default `unity-sdk`), read back as `ChangedClient` and a tombstone's `DeletedClient`. `PatchAsync`, `DeleteAsync` and `EditLinksAsync` take `ifMatch` (the `change_seq` you read): a moved element is refused with `IsPreconditionFailed`, the element as it now stands in `Current`, nothing written. `ChangesAsync(headOnly: true)` sends the last tip's tag back and reads `Unchanged` on a `304`, so a quiet world costs no budget. The PIN is sent only where keel checks it (writes, `/me`, and every call of a ten-digit key). `/me` and an agent's join carry `OWFrontDoor` (who answers for the seat, its Character, the world's Charter), `OWRoom.IsRoomElement` keeps a parlor's room out of a lore view, and the six [proposal](/docs/development/api/proposals) calls are there, a `202` raised as `OWProposedError`.

**The world's own settings** (since v0.17.0). `PatchWorldAsync(partial)` writes to the world itself (`PATCH /world`): only the keys you send change, and it returns the world as the server now holds it. A `GetWorldAsync` body can go back whole, since the keys the server refuses there are left out (`OWPayload.WorldReadOnlyFields`). Where a world first came from is written as the plain keys `source` and `producer` and served back under `origin`; the World's own extension keys (`x_*`, `atlas_*`, `shadow_*`, 64 KB in all) go as given, and `null` removes one. A co-builder may send only `time_range_current`, `source`, `producer` and extension keys (anything more is `IsOwnerOnly`).

**Other tools' data survives.** Extension fields (`x_*`) that the models don't know are kept verbatim through a read, an edit and a write, in the cache, and through Unity's serializer. The five fields the server owns (`world`, `type`, `created_at`, `updated_at`, `change_seq`) are stripped from every write, so a body you read can be written straight back.

`OWFolderWriter` writes elements and the world into a world folder, byte for byte as the format specifies, so a folder kept in git doesn't change from one machine to the next. `OWFolderExport.ExportAsync(client, folder)` writes a whole account world into a world folder, map images included, the same files the Python package's `export_world` writes. Its `world.json` says where it came from (`source`) and, when the key's `GET /me` can say, which slice it is (`exported_as`), as the [folder format](/docs/schema/folders) asks; since v0.7.0. An export declares folder format 0.3.16 (since v0.17.0, carrying the world's `origin` as the server serves it; 0.3.15 from v0.16.0, 0.3.14 from v0.12.0) and writes the [`producer` line](/docs/schema/folders#worldjson) as the folder's maker, `{"tool": "com.onlyworlds.sdk", "version": "0.12.0", "input": "server"}`; a file export carries keel's line as it is and writes none when the file has none. It writes a [known-of](/docs/schema/folders#known-of-elements) stub as the server hands it: the keys a stub keeps, every field it was served with a value, and `known_of: true`, never its unset fields. `OWPayload.IsKnownOf(body)` and `OWElement.IsKnownOf` tell a stub from a whole element, and the client refuses to write one back. A typed calendar era refuses a date it does not hold (the same rule as `@onlyworlds/sdk` 4.42.4).

## Common pitfalls

- **`""` is how a string field is unset.** The API never sends `null` for text. Test with `string.IsNullOrEmpty`, never `== null`. A single link is different: its unset value is `null`.
- **`null` is not `0`.** Nullable numbers are `SerializableNullable<T>`, which keeps unset, a deliberate zero and absent apart. You can assign a plain `T`, but reading one makes you handle the unset case. The Inspector shows unset as `--`, never as `0`.
- **`UnityWebRequest` runs on the main thread only.** The client routes every request there, including the pages it fetches after an `await`. Never block on a request with `.Result` or `.Wait()` in the Editor: the completion arrives on the update loop, so blocking it deadlocks.
- **Only `name` is required.** Every other field can be empty, and the API sends the empty value (`null`, `""` or `[]`) rather than leaving the key out.

## Status

A drift check in the repository keeps the generated models in step with the pinned schema. The package README holds more on each rule above, and the repository's README explains how to work on the SDK itself and run its tests.
