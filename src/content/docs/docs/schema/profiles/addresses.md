---
title: Addresses
description: "The address profile: one element, three spellings, so a link copied in one tool opens in another."
---

Every tool names an element by one triple: the world's id, the type word and the element's id. The [address profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/address.md) writes its three spellings once, so a link copied in one tool opens in another:

| Spelling | Form | Use |
|---|---|---|
| The human address | `https://www.onlyworlds.com/w/<world id>/<type>/<id>` | a link to give a person |
| Inside a world | `ow://<type>/<id>` | an element named in a text field of the same world |
| Across worlds | `ow://<world id>/<type>/<id>` | an element of another world, named in a text field |

A world by itself is `https://www.onlyworlds.com/w/<world id>` or `ow://<world id>`. An address may end in a moment, `@<step>` on its last path segment, and a lens, `?lens=<id>`. Addresses are written in lowercase and never percent-decoded; a reader refuses what the profile refuses, by the profile's own reason (`uppercase`, `segments`, `unknown_type`, `bad_id` and the rest). A writer given an empty string for the world, the type, the id or the lens refuses by that part's own reason (`bad_world`, `unknown_type`, `bad_id`, `bad_lens`): an empty string is never absent, only a missing key or `null` is. The TypeScript and Python SDKs carry the reader and the writer (`parseOwLink`, `elementAddress`, and their snake-case twins).

The lens key is `lens` exactly. `LENS` or `Lens` is refused as `bad_lens`, and a key with a space in it is another key, ignored like any other. The id the key holds is read in either case, as every id in an address is.

## The same id

Inside a world an id is written one way, lowercase in the form above: an element's own `id`, a link, an id in an `x_` value or as the key of an object. There, two ids are the same id when they are written the same, and an order by id is an order of the ids as written. A reader reads an id in either case, and takes it in lowercase, in two places only: an address, and a text that a profile says is searched for ids, as the [charter profile](/docs/schema/profiles#charter) searches a Charter's. What an id read there is matched against is read as written, so an element whose own `id` is not lowercase is not the element a lowercase id names. Any other spelling (upper case inside a world, no hyphens, braces, `urn:uuid:` before it, a space left on it) is another value. A writer writes lowercase, as onlyworlds.com serves every id and every link.
