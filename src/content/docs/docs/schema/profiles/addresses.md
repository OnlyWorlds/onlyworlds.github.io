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

A world by itself is `https://www.onlyworlds.com/w/<world id>` or `ow://<world id>`. An address may end in a moment, `@<step>` on its last path segment, and a lens, `?lens=<id>`. Addresses are written in lowercase and never percent-decoded; a reader refuses what the profile refuses, by the profile's own reason (`uppercase`, `segments`, `unknown_type`, `bad_id` and the rest). The TypeScript and Python SDKs carry the reader and the writer (`parseOwLink`, `elementAddress`, and their snake-case twins).
