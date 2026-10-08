---
title: "Unity SDK"
description: "The OnlyWorlds Unity SDK: typed C# models for the 22 element types, a client for the v2 API, and a world cache that lives in your project as an asset."
---

OnlyWorlds is an open schema for world data: characters, creatures, places, items, factions and events as 22 element types with typed links between them. Worlds are hosted on [onlyworlds.com](https://www.onlyworlds.com) and edited there or in any tool built on the schema. For what that gives a game, see [Games](/docs/development/games).

`com.onlyworlds.sdk` reads and writes those worlds from Unity. It has three parts:

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

## Read a World

No account yet? The demo key `0000000000` reads Hyperion, the public example world, with no PIN.

```csharp
using OnlyWorlds.Sdk;
using UnityEngine;

public class ReadWorld : MonoBehaviour
{
    // A read key (ow_r_) needs no PIN. A key in a build can be extracted from it,
    // so ship only a read key, and only for a world your players may read.
    [SerializeField] private string apiKey = "0000000000";

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

**Errors come in two kinds.** `OWApiError` means the server answered and refused: it carries `StatusCode`, `Code`, `Param`, `DocUrl` (a link into [Errors](/api/errors/)) and `IsRetryable`. `OWTransportError` means no answer arrived at all.

## Ship a World With Your Game

A cache is a world stored as an asset in your project. Fill it in the Editor, and the build carries it: no network, no key and no waiting at runtime.

1. Set a key in **Window → OnlyWorlds → World Browser → Settings**. It is stored per machine in `EditorPrefs`, never in the project or in version control.
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

The same steps run from code. `OWSync.BaselineAsync(client, cache)` fetches the whole world. `OWSync.IncrementalAsync(client, cache)` applies only what changed since the cache's cursor, from the [changes feed](/docs/development/api/changes), and falls back to a full baseline when the cursor can't be trusted. Edits to world metadata are not in the feed, so poll `GetWorldAsync` when those matter. `OWFolderLoader.LoadInto(cache, path)` reads a world folder and never writes to it.

## Write

Writes need a write key (`ow_w_`) and the world's PIN in `OWClientConfig.ApiPin`. Both can be extracted from a build, so write from the Editor, a server or a tool you control, never from a game you ship to players.

**Send only what changed.** A `PATCH` replaces every field it carries, so sending back an element fetched an hour ago undoes an hour of someone else's edits. `OWEdit` snapshots an element and sends the difference:

```csharp
var edit = OWEdit.Begin(character);
character.Level = 12;
await edit.CommitAsync(client, "character"); // sends { "level": 12 } and nothing else
```

**Change link lists with `EditLinksAsync`.** A `PATCH` with a link list replaces the whole list. `EditLinksAsync<OWCharacter>("character", id, "friends", add: new[] { friendId })` adds and removes on the server, in one atomic step.

**Check every bulk write.** `BulkAsync` answers HTTP 200 even when some items failed. Read the result's `Errors` and `Failed`, or call `ThrowIfAnyFailed()`.

**Other tools' data survives.** Extension fields (`x_*`) that the models don't know are kept verbatim through a read, an edit and a write, in the cache, and through Unity's serializer. The five fields the server owns (`world`, `type`, `created_at`, `updated_at`, `change_seq`) are stripped from every write, so a body you read can be written straight back.

`OWFolderWriter` writes elements and the world into a world folder, byte for byte as the format specifies, so a folder kept in git doesn't change from one machine to the next.

## Things That Will Bite You

- **`""` is how a string field is unset.** The API never sends `null` for text. Test with `string.IsNullOrEmpty`, never `== null`. A single link is different: its unset value is `null`.
- **`null` is not `0`.** Nullable numbers are `SerializableNullable<T>`, which keeps unset, a deliberate zero and absent apart. You can assign a plain `T`, but reading one makes you handle the unset case. The Inspector shows unset as `--`, never as `0`.
- **`UnityWebRequest` runs on the main thread only.** The client routes every request there, including the pages it fetches after an `await`. Never block on a request with `.Result` or `.Wait()` in the Editor: the completion arrives on the update loop, so blocking it deadlocks.
- **Only `name` is required.** Every other field can be empty, and the API sends the empty value (`null`, `""` or `[]`) rather than leaving the key out.

## Status

Early, and real. All 22 element models are generated, and a drift check in the repository keeps them in step with the pinned schema. The package README holds more on each rule above, and the repository's README explains how to work on the SDK itself and run its tests.
