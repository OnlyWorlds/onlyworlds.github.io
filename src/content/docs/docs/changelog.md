---
title: Changelog
description: What changed for developers on OnlyWorlds (the API, the clients and these docs), newest first.
---

What changed for developers, newest first: the API on onlyworlds.com, the clients and tools these docs describe, and the docs themselves. Each day lists what a page now says; every release of a package is in its own changelog: [TypeScript SDK](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md), [Unity SDK](https://github.com/OnlyWorlds/unity-sdk/blob/main/Packages/com.onlyworlds.sdk/CHANGELOG.md), [Python package](https://github.com/OnlyWorlds/python-sdk/blob/main/CHANGELOG.md). Everything that shipped across OnlyWorlds, for everyone, is on [What's new](https://www.onlyworlds.com/whats-new); this page stays the developer log.

## 2026-10-22

- **[TypeScript SDK](/docs/development/typescript) 4.46.0: Sign in with OnlyWorlds.** `signInWithOnlyWorlds` starts the OAuth code flow with PKCE from a registered tool's page and `completeSignIn` trades the code on the callback page for an account token the tool keeps; the SDK stores nothing. <!-- keel PR 154 -->
- **[TypeScript SDK](/docs/development/typescript) 4.45.0.** `hide` and `unhide` (the hidden mark's writes), `listAccountWorlds` and `mintWorldKey` (the account's worlds and a new key on one), for the parlor and Atlas.
- **[Change feed](/docs/development/api/changes): `?after=<ISO time>`.** Only the changes made at or after a time, a filter on the same feed with the same order and cursor; the [AI page](/docs/development/ai)'s "since yesterday" names it. Python 0.13.0 `changes(after=)` and `walk_changes(after=)`, SDK 4.44.0 `changes({ after })` and `changesAll(since, { after })`. <!-- keel PR 152 -->
- **[Members and sharing](/docs/development/api/members): an invite link for people takes Uses.** `max_uses` 1 to 50 on a person link lets in that many accounts, each joining once with the link's role; the link stops when every use is taken, it expires or it is revoked, and who already joined stays. <!-- keel PR 150 -->
- **[Members and sharing](/docs/development/api/members): change who made an element.** `POST /api/v2/{type}/{id}/adopt` with `{"member"}` (a membership id, or `owner`) sets `created_by`, for the owner or a co-builder; a contributor's key is `403 not_author`. The write takes a new `change_seq`, so the feed carries it. On the site, an Author card on the element page. <!-- keel PR 151 -->
- **[TypeScript SDK](/docs/development/typescript) 4.43.0.** `adopt(type, id, member)` for the route above; `createWorldLink`'s `maxUses` documented for person links.

## 2026-10-21

- **[Python](/docs/development/python) 0.12.0: the doctor's packet.** `python -m onlyworlds.doctor PATH --packet` prints the findings as work packets in the `packet` extension profile (schema-dist dist.36): a Relation with supertype `Work item`, one entry per element with its reason under `x_packet_elements`, the same ids on the typed links, source and producer lines; empty when clean. Under [Check a world](/docs/development/python#check-a-world).
- **[Python](/docs/development/python) 0.11.0: the doctor.** `python -m onlyworlds.doctor` checks a world folder or an account world and reports what a keeper should look at, each finding with the element and the reason; it never writes. Under [Check a world](/docs/development/python#check-a-world).
- **[AI page](/docs/development/ai): what changed since your last visit.** The recipe for a scheduled agent: keep the feed's cursor, walk from it, read who changed what through which door; the same walk over MCP (`get_changes`) and in both packages. No new route.
- **[Unity SDK](/docs/development/unity) 0.10.0.** A known-of stub is exported as the server hands it and never written back (`IsKnownOf` on read); exports declare folder format 0.3.12; a typed calendar era refuses a date it does not hold, as the TypeScript SDK 4.42.4 does. The [Python page](/docs/development/python) now names the format its package stamps, 0.3.12 (it said 0.3.11 since 0.10.4 shipped).
- **[Folder format](/docs/schema/folders) 0.3.12.** A folder's `records/RECORDS.json`, where it has one, is a plain list of producer entries. Writers now stamp `"0.3.12"`: the Python package 0.10.4 (nothing else in it changed).
- **[Unity SDK](/docs/development/unity) 0.7.0 to 0.9.0.** Join by a link, a table of players with a pick, the downloaded world file read and written as a folder, an export that says where it came from and which slice it is, a world as one `.owworld` file, and the calendar reader on the `atlas_calendar` profile.
- **[Obsidian plugin](/docs/tools/obsidian-plugin) 3.7.0.** A player's or guest's known-of elements download as notes marked known of, never sent; with 3.6.0's hidden elements, under [Hidden and known-of elements](/docs/tools/obsidian-plugin#hidden-and-known-of-elements). Command names are in sentence case (Save element, Download world).
- **TypeScript 4.42.4.** `parseDate` refuses a date the typed era does not hold ("10 Thaw, 1 BG" when year 1 BG ends in Frost) rather than reading it in another era.
- **TypeScript 4.42.3.** `parseDate` reads a down era's date back to the step it was written from when the era's pivot falls mid-year; since 4.42.2 such dates parsed one year early.
- **[Keys](/docs/getting-started/keys).** A world's owner can retire its legacy 10-digit key for good from the world page; a retired key answers `401` on every door. Demo keys can't be retired. <!-- keel PR 141 -->
- **[Changelog](https://www.onlyworlds.com/changelog).** The shared What's new page is now the Changelog, back to the beginning; its old paths redirect ([onlyworlds.com](/docs/tools/onlyworlds-com), [Contact](/docs/contact)). <!-- keel PR 125 -->
- **[The world export file](/docs/development/api/changes#the-export-file).** The owner's download now carries the provenance lines, `world.source` and `world.exported_as`. Its `schema_version` has named the standard's version since 2026-10-18; this page said the envelope's until today. <!-- keel PR 133 -->
- **[Handing a seat over](/docs/development/agents#the-human-sponsor).** The owner can give an agent seat to another member with `sponsor` on the member's `PATCH`; the seat then follows that member's role and leaves with them, and keeps its key, Character and work. <!-- keel PR 121 -->
<!-- keel PR 132: no docs change -->
<!-- keel PR 142: no docs change -->
<!-- keel PR 145: no docs change -->
<!-- keel PR 109: no docs change -->
<!-- keel PR 112: no docs change -->
<!-- keel PR 114: no docs change -->
<!-- keel PR 115: no docs change -->
<!-- keel PR 116: no docs change -->
<!-- keel PR 118: no docs change -->
<!-- keel PR 119: no docs change -->
<!-- keel PR 122: no docs change -->
<!-- keel PR 126: no docs change -->
<!-- keel PR 127: no docs change -->
<!-- keel PR 130: no docs change -->
<!-- keel PR 131: no docs change -->
<!-- keel PR 134: no docs change -->
<!-- keel PR 135: no docs change -->
<!-- keel PR 136: no docs change -->
<!-- keel PR 137: no docs change -->
<!-- keel PR 138: no docs change -->
<!-- keel PR 139: no docs change -->
<!-- keel PR 140: no docs change -->
<!-- keel PR 143: no docs change -->
<!-- keel PR 144: no docs change -->

## 2026-10-20

- **TypeScript 4.42.2.** A calendar's down era (a count toward a pivot, like BC) has no year zero when its pivot falls mid-year: the year holding the step just before the pivot reads `year_base`. Eras starting on the same step resolve by a stated rule: an up era over a down one, then the later in the list.
- **TypeScript 4.42.1.** The calendar reader refuses what the [`atlas_calendar` profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/calendar.md) refuses: an `eras` or `intercalary` that is present but not a list (`false` threw before), an era start or end that is not whole, a `year_base` other than 0 or 1, and names that are not strings. The Unity SDK reads the same way.
- **[Extension profiles](/docs/schema/conventions#data-the-schema-does-not-model).** A named extension field that tools agree to read the same way, published as a page in schema-dist's `profiles/` folder (serial 30). The first two: `x_identity_key`, the same being in several worlds, and `atlas_calendar`, a world's own calendar. Nothing in the schema changed. <!-- keel PR 124 -->

- **Schema 00.32.02.** A Narrative's `start_date` is when it is first told or recorded and its `end_date` when it stops being told (empty while it is still told); the span it recounts lives on its Events ([Narrative](/docs/schema/element_categories/narrative)). No field, type or link changed, so nothing moves on the wire. The TypeScript SDK 4.42.0 and the Python package 0.10.3 carry it. <!-- keel PR 123 -->
- **[What's new](https://www.onlyworlds.com/whats-new).** One page for every release across OnlyWorlds: the site, Atlas, the Obsidian plugin, the toolkit, both SDKs, the Python package and schema-dist, with an Atom feed (`/whats-new.xml`) and the merged list as JSON (`/whats-new.json`, a `sources` row per tool with its count and an `ok` flag). The TypeScript SDK and the Python package now publish a GitHub release for each version, which is where the page reads them ([Contact and resources](/docs/contact), [onlyworlds.com](/docs/tools/onlyworlds-com)). <!-- keel PR 120 -->
- **Python 0.10.2.** The OKF export keeps a known-of stub's `known_of: true` in its frontmatter; it was dropped before, so a stub read as a whole element.

- **World folders, format v0.3.11.** A tool that re-keys an element (gives it a new id and rewrites every reference) never rewrites `x_identity_key`, even when its value equals the moved id: the key says two elements in different worlds are the same being, and a re-key in one world would split them. Nothing else changed; Python 0.10.1 declares the new version.
- **[Public fields on a stub](/docs/development/api/members#known-of).** A known-of Character now also carries what anyone could see: `physicality`, `height`, `weight`, `species` and `reputation`, with their values (keel PR 117). schema-dist serial 28 lists each type's public fields in `presentation.json`, and TypeScript 4.41.0 and Python 0.10.0 export them as `PUBLIC_FIELDS`. A stub's search row carries `known_of: true` ([Search](/docs/development/api/reads#search)). A write carrying `known_of` is refused by name: [`known_of_not_writable`](/api/errors#known_of_not_writable) (`isKnownOfNotWritable`, `is_known_of_not_writable`). A folder keeps a stub's served values ([Known-of elements](/docs/schema/folders#known-of-elements)). <!-- keel PR 117 -->
- **[Known of](/docs/development/api/members#known-of).** A guest or player also reads what its own Character's sheet links to, one step out, as stubs marked `known_of: true`: name, description and picture kept, every other field unset. Never write a stub back (`422`). World folders, format 0.3.10: a stub on disk keeps `known_of` and only its kept keys ([Known-of elements](/docs/schema/folders#known-of-elements)). TypeScript 4.40.0 (`isKnownOf`) and Python 0.9.0 (`is_known_of`) refuse to write a stub back before sending. <!-- keel PR 113 -->
- **[A table of players](/docs/development/api/members#a-table-of-players).** One player link can seat up to 50 players, each picking one Character from the owner's list, once (`max_uses`, `characters`). The preview says what is left to pick; a taken pick is `422` [`character_taken`](/api/errors/#character_taken). A world now holds at most 50 players, and a player link opened in a full one is `422` [`world_full`](/api/errors/#world_full). TypeScript 4.39.0: `maxUses` and `characters` on `createWorldLink`, the pick on `redeemJoin`, `isCharacterTaken`, `isCharacterInvalid` and `isWorldFull`. <!-- keel PR 110 -->
- **Schema 00.32.01.** An Event's `characters` are now the Characters who know about it: they were present, aware of it, or involved in it ([Event](/docs/schema/element_categories/event)). No field, type or link changed. The TypeScript SDK 4.38.0 and the Python package 0.8.1 carry it. <!-- keel PR 111 -->
- **[Hidden elements](/docs/development/api/hidden)** is a new page. The owner or a co-builder can hide an element (`PUT` and `DELETE /api/v2/{type}/{id}/hidden`, `GET /api/v2/world/hidden`). To every other reader it answers as a missing element: `404`, never `410`, its links left out of every body, and a hidden Character's id `null` on the roster, `/me` and `owner_character`.
- **The feed says why a delete happened.** Every `delete` op on [`/changes`](/docs/development/api/changes) carries `reason`: `deleted`, or `hidden` for an element hidden from this key. A contributor now carries a three-part cursor with an `epoch`, as a guest does; a cursor stored before this answers `409` [`resync_required`](/api/errors/#resync_required) once.
- **A reset says what to keep.** `resync_required` carries `reason`: `role` (keep what the new walk does not name) or `view` (drop it), and every feed page carries `epoch_reason`. A tool never empties a copy on its own ([What a reset keeps](/docs/development/api/changes#what-a-reset-keeps)). Sharing is forward-only: revoking a key, lowering a role or removing a member takes nothing back from a copy already made ([Sharing a world](/docs/development/api/members#sharing-a-world)).
- **View as.** The owner's keys can add `as` (a membership id, a Character id, or `public`) to element reads, search and the metadata routes, and read what that reader sees ([View as](/docs/development/api/hidden#view-as)). A member key gets `403` [`view_as_owner_only`](/api/errors/#view_as_owner_only). Picking a hidden Character for a seat or a player to play is `422` [`character_hidden`](/api/errors/#character_hidden).
- **Link previews.** A person or player link can carry the world's id, `/join/<world_id>#ow_j_…`, and then shows the world's name and picture when pasted into a chat. It is `preview: true` on the link route, on by default in the world page's forms, and never on an agent link ([Invite links](/docs/development/api/members#invite-links)).
- **Keys.** A legacy 10-digit key, other than the demo keys, sends its PIN on every read of a world that has a PIN. The demo keys are the ten reserved keys `0000000000` to `0000000009`; a world's own keys are never demo keys ([Demo keys](/docs/getting-started/keys#demo-keys)). A removed member's keys answer `401` [`invalid_credentials`](/api/errors/#invalid_credentials).
- **TypeScript:** `fieldLabel` turns a field name into the label a tool shows (4.34.0; all-caps words kept since 4.36.0). The reference is on 4.37.0: `viewAs` on reads, `epoch_reason` on `changesHead`.
- **[Atlas](/docs/tools/atlas)** to 1.64: the agent mark on knowledge entries and pages, an element changed on both sides of a shared world held for you to choose, a member made a guest keeps their copy, an element the owner hides leaves your copy quietly (1.61), an agent's link says what it makes (1.62.1), a table's player link with its pick (1.63) and what your Character only knows of (1.64).
- **These docs:** page titles, sidebar labels and headings are now in sentence case, the house rule (OW Style F-41). Every anchor and URL stays as it was.

## 2026-10-19

- **[Files](/docs/development/api/files)** is a new page. An element can carry PDFs, text files and world bundles: 25 MB a file, 250 MB a world, 200 file tickets a world in 24 hours. New error sections: [`file_too_large`](/api/errors/#file_too_large) and [`files_full`](/api/errors/#files_full). The TypeScript SDK's `uploadFile` and the other file methods arrived in 4.32.0.
- **Rate limits.** 300 requests a minute per key or account token, 60 a minute per address with neither. Every reply carries `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset`; over the budget is `429` [`too_many_requests`](/api/errors/#too_many_requests). See [Limits](/docs/development/api-reference#limits).
- **Search.** `GET /api/v2/search?q=` finds elements by the whole words in their name and text ([Search](/docs/development/api/reads#search)). The MCP server's `search_elements` runs the same search.
- **[Lantern](/docs/tools/lantern)** has its own page: the phone app, signing in, joining by each kind of link, a player's view, inviting, and Catch.
- **World folders, format v0.3.9:** `world.json` can say where the folder came from (`source`) and which part of the world it holds (`exported_as`) ([World folders](/docs/schema/folders)). The Python package's `export_world` writes both since 0.7.0.
- **The [Classic API](/docs/development/api/classic)** is frozen, with no retirement date; a removal would be announced six months ahead. The Agents, MCP and Council pages link the [agent policy](https://www.onlyworlds.com/agents).
- **`public_read`** keeps the standard's meaning, read without a credential. The [Worlds](/docs/schema/worlds) page says what onlyworlds.com does today: a key is still needed, and owners can't set it yet.
- **Unity:** join by a player or agent link (`OWJoin`) and load a downloaded world file (`OWEnvelopeLoader`), on `main` after v0.6.0 ([Join by a link](/docs/development/unity#join-by-a-link)). The Atlas page follows 1.53 to 1.57: files on an element, player links, view-only worlds.

## 2026-10-18

- **Agent writes.** Every element read carries `changed_by` and `changed_via`, who made the last change and through which door; `seat`, `mcp` and `declared` mean an agent did. A tombstone carries `deleted_by` and `deleted_via`. An AI on a person's own key sends `X-OW-Agent` ([Agent writes](/docs/development/api/writes#agent-writes)).
- **`410 gone`.** A read of one element this world deleted answers `410` [`gone`](/api/errors/#gone), with the deletion's `change_seq` and `deleted_at`; an id the world never held is still `404`. Creating a world takes an optional `key_name` ([Keys and PINs](/docs/getting-started/keys#account-tokens)).
- **[Sign in with a password](/docs/development/typescript#sign-in-with-a-password)** (TypeScript 4.31.0): `signInWithPassword` turns an email or username and a password into an account token for the device.
- **Seats follow their sponsor.** A member who is removed or leaves takes the AI seats they made in that world; lowering a member's role lowers their seats to it. A world holds at most 50 agents ([Agent seats](/docs/development/agents#making-a-seat)).
- **The Write examples run as copied.** The TypeScript and Python examples read `OW_API_KEY` and `OW_API_PIN` from the environment. The toolkit's `project-setup` writes those names since toolkit 4.3.0, and the LLM guide uses them.
- **[Obsidian plugin](/docs/tools/obsidian-plugin)** to 3.5.1: a Sync section, text that round-trips byte for byte, renames. **Atlas** 1.52 and 1.53: sign in with email and password, and maps drawn from their own zones.

## 2026-10-17

- **MCP resources:** `onlyworlds://world` and `onlyworlds://element/{type}/{id}` join the schema resources, with the same key check and scoping as the read tools ([Resources](/docs/development/mcp#resources)).
- **World folders, format v0.3.8:** one id, one file. A reader serves `elements/` when an id is in both layouts, and skips a dot-prefixed file in a category folder.
- **Python:** 0.5.0 lists ids found in both layouts (`in_both_layouts`); 0.6.0 exports a folder as an OKF bundle ([Export to OKF](/docs/development/python#export-to-okf)).
- **Obsidian plugin** 3.4.0 and 3.5.0: sign in with an account token ([Your OnlyWorlds account](/docs/tools/obsidian-plugin#your-onlyworlds-account)), read-only worlds, a Bases file per world, saving linked notes.
- **Seats:** the seat routes are listed under [Managing members](/docs/development/api/members#managing-members). A seat's replaced key answers `401` `key_revoked`, so an AI can tell it from a wrong key.
- **`/docs`, `/api` and `/docs/development/api`** answer with a page instead of a 404.

## 2026-10-16

- **A seat for your own AI.** Any member can make one on the world page or with `POST /api/v2/account/worlds/{id}/seats`, with no join link, and every seat has a human sponsor ([Making a seat](/docs/development/agents#making-a-seat)). TypeScript: `createSeat`, `listSeats`, `rekeySeat`, `removeSeat` (4.28.0, 4.29.0).
- **[Player links](/docs/development/api/members#player-links)** let a friend read a world as one Character, with no account and no PIN. New error: [`player_role_fixed`](/api/errors/#player_role_fixed). TypeScript: `reader: 'player'` and `redeemJoin` (4.30.0).
- **`idempotency_in_flight`** (`409`): a retry that meets the first request still running waits `Retry-After` and resends with the same key ([`idempotency_in_flight`](/api/errors/#idempotency_in_flight)). Python 0.4.0 does this for you; in TypeScript an `idempotencyKey` makes a retried `create` or `bulk` safe.
- **PIN refusals** name `param` `API-Pin`, and the message says whether the PIN was missing or wrong ([`invalid_credentials`](/api/errors/#invalid_credentials)).
- **The Agent-Council**, a second chamber where agents propose and vote, addressed with `?council=agents` ([Council](/docs/tools/council)).
- **Unity** v0.5.0: calendars, `RetryAfter`, keyed retries, the agent header, folder export. **Atlas** to 1.51: invite links made in Atlas, and Open in Atlas from the world page.

## 2026-10-15

- **The owner's link routes:** `POST`, `GET` and `DELETE` on `/api/v2/account/worlds/{world_id}/links` make, list and revoke invite and agent links ([Managing members](/docs/development/api/members#managing-members)). TypeScript: `createWorldLink`, `listWorldLinks`, `revokeWorldLink` (4.24.0).
- **No PIN to join.** Accepting an invite or a link needs no account PIN; `409` [`pin_required`](/api/errors/#pin_required) now stops only the minting of a write key.
- **Agents narrate as themselves:** with the owner's switch on (`agent_narrator_rule` on the world), a seat's Narratives are narrated by its own Character ([Agent seats](/docs/development/agents)).
- **Declaring an agent:** `agent: true` in the TypeScript SDK (4.26.0) and the Python package (0.3.0) sends `X-OW-Agent` on element writes.
- **The join page** offers Open in Lantern on a person's invitation and Open in Atlas on an agent's; the world page's Open with pane names Atlas, Lantern, Obsidian and an AI ([onlyworlds.com](/docs/tools/onlyworlds-com)).
- **[Easy Mobile](/docs/tools/easy-mobile)** moved to Legacy Tools: online, no longer developed.

## 2026-10-14

- **Token rating.** Asking and sorting spend from the account's daily token rating (100,000 tokens a day to start), shared with the Council. Replies carry `tokens_remaining` and `token_rating`, and `GET /api/v2/account/allowance` reads it without spending ([AI agents](/docs/development/ai#ask-your-world-without-a-key-of-your-own)). TypeScript: `account.allowance()` (4.21.0).
- **A co-builder may move the world's now:** `PATCH /api/v2/world` with `time_range_current` alone. Any other member change there is `403` [`owner_only`](/api/errors/#owner_only).
- **TypeScript:** world calendars (`worldCalendars`, `formatStep`, `parseDate`; 4.20.0) and `me()` and `members()` (4.22.0).
- **First reads run as written.** The TypeScript and Python quickstarts use Moppetopia's demo key `0000000001`.
- **MCP:** each tool's arguments and returns are listed. The server is stateless, and a plain `GET` answers `405`.
- **Guests' notes:** a guest's Narratives are narrated by its own Character, with rules of their own ([Guests](/docs/development/api/members#guests)).

## 2026-10-12

- **[Invite links](/docs/development/api/members#invite-links)** for people: the owner invites with a single-use link instead of an email address. Routes `POST /api/v2/join/preview` and `POST /api/v2/account/join`; TypeScript `previewJoin` and `acceptJoin` (4.12.0).
- **[Ask your world](/docs/development/ai#ask-your-world-without-a-key-of-your-own):** `POST /api/v2/account/ask` answers a question from the elements an app sends, through OnlyWorlds' AI proxy, with no model key of the user's own. New error codes [`ask_failed`](/api/errors/#ask_failed) and [`ask_unavailable`](/api/errors/#ask_unavailable). TypeScript: `ask` and `buildAskContext` (4.13.0).
- **[Sort notes into a world](/docs/development/ai#sort-notes-into-a-world):** `POST /api/v2/account/sort` turns loose notes into rows for the user to review (`make`, `add_to`, `link`, `ask`); nothing is written. TypeScript: `sort` (4.18.0).
- **TypeScript:** `lookupWorld` finds the elements a plain question is about, with no model and no network, and `preparePhoto` shrinks a phone photo (4.11.0). `changesHead` reads the feed's tip without reading elements (4.15.0; `epoch` since 4.16.0).
- **Checking a folder:** schema-dist's `lint_folder.py` ([World folders](/docs/schema/folders)).

## 2026-10-11

- **[Only if unchanged](/docs/development/api/writes#only-if-unchanged):** send `If-Match` with an element's `change_seq` on a `PATCH` or a link operation. If the element moved, nothing is written and `412` [`precondition_failed`](/api/errors/#precondition_failed) carries `current`. TypeScript `ifMatch` (4.9.0), Python `if_match` (0.2.0).
- **A PIN that is sent is checked on reads too.** A wrong one is refused, so `GET /api/v2/me` with the key and the PIN tests both ([Checking the PIN](/docs/getting-started/keys#checking-the-pin)).
- **The [Python package](/docs/development/python)** is on PyPI: `pip install onlyworlds` (0.1.0).
- **TypeScript:** `removeImage` (4.8.0), and world files with `readWorldFile` and `writeWorldFile` (4.10.0).
- **Unity:** the editor key is stored per project since v0.4.0.

## 2026-10-10

- **[Removing an image](/docs/development/api/images#removing-an-image):** a removal ticket from `POST /api/v2/media/remove-ticket`, then the upload host's `remove_url`. New error codes [`removal_in_flight`](/api/errors/#removal_in_flight) and [`upload_pending`](/api/errors/#upload_pending). A cached copy can keep answering for days after removal.
- **[Stability](/docs/development/api-reference#stability):** new fields and routes arrive without notice, and a removal is announced six months ahead. Every reply's `X-OW-Schema-Version` header names the version of the standard.
- **`time_format_equivalents`** is a list of whole numbers, as the standard types it; strings are still accepted.
- **[AI agents](/docs/development/ai)** says how an agent reads both this site and onlyworlds.com as Markdown. The Obsidian plugin page covers world units (3.3.0).

## 2026-10-09

- **[World folders](/docs/schema/folders)** is a new page: the format a world takes on disk, and the rules a tool follows to read and write one.
- **World units:** `length_unit`, `mass_unit` and `distance_unit` on the world name what measure fields count in ([Units](/docs/schema/worlds#units)). The element tables say which fields use them.
- **One request-body limit:** 2.5 MB. A larger body is `413` [`payload_too_large`](/api/errors/#payload_too_large) and nothing is written.
- **`GET /api/` and `GET /api/v2/`** answer a small JSON index, and a path under `/api/` that no route matches answers the error envelope's `404`.
- **Agent seats:** a seat's Character is optional, and the link expires while the seat does not. The [AI agents](/docs/development/ai) page adds a fifth way in, with a key.

## 2026-10-08

- **[A worked example](/docs/schema/example)** is a new page: the demo world Moppetopia read through the API, link by link.
- **Only `name` is required**, on every category, Pins and Markers included (schema 00.30.02).

## October 2026: the docs rebuilt

The docs moved from Jekyll to [Starlight](https://starlight.astro.build), at the same address.

- **Every old URL still answers.** Pages kept their paths. The error links in API responses (`/api/errors#<code>`) and the LLM guide (`/assets/ow_llm_guide.txt`) are unchanged. Retired tool pages now forward to [Legacy tools](/docs/tools/legacy).
- **The API guide is split into topics:** [reading](/docs/development/api/reads), [link fields](/docs/development/api/links), [writes and bulk](/docs/development/api/writes), [changes](/docs/development/api/changes), [members](/docs/development/api/members), [images](/docs/development/api/images), [CORS](/docs/development/api/cors) and [migrating from v1](/docs/development/api/classic).
- **New pages:** [Keys and PINs](/docs/getting-started/keys), [Conventions](/docs/schema/conventions), the [TypeScript](/docs/development/typescript), [Python](/docs/development/python) and [Unity](/docs/development/unity) clients, [Games](/docs/development/games), [Agent seats](/docs/development/agents) and the [Toolkit](/docs/development/toolkit).
- **The field tables on the element pages are generated** from the published schema ([schema-dist](https://github.com/OnlyWorlds/schema-dist)) on every build. They show each field's name as the API sends it.
- **For AI agents:** every page has a Markdown copy at the same path with `.md` (for example `/docs/development/typescript.md`), and the site has [`llms.txt`](/llms.txt), [`llms-small.txt`](/llms-small.txt) and [`llms-full.txt`](/llms-full.txt). Each page has Copy Markdown and Open in Claude or ChatGPT.
- **Search** covers every page (Ctrl K).

The previous site is kept whole in the repository, on the `jekyll` branch.
