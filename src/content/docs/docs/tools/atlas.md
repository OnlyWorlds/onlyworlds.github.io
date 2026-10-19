---
title: Atlas
description: Atlas is the main OnlyWorlds workspace, a local-first web app where a world lives as a folder of plain JSON files, on your drive or in your browser.
---

Atlas reads and writes your world as plain JSON files, in a folder on your own machine or in your browser's own storage. The folder is the world, and nothing is locked away.

| | |
|---|---|
| **URL** | [atlas.onlyworlds.com](https://atlas.onlyworlds.com) |
| **Type** | Local-first web application (any modern browser; a folder on your drive needs Chrome, Edge or Brave) |
| **Changelog** | [atlas.onlyworlds.com/changelog](https://atlas.onlyworlds.com/changelog) |

## Features

- **Build and Browse.** Every element category in an editor driven by the standard. Link fields are pickers, and every element lists what links to it.
- **Write.** Books, chapters and scenes (you set the tier names). Names in your prose become links with a click, and the find bar can link every match at once. The words stay yours.
- **Web.** Any element's connections as a small graph, including everything that links to it.
- **Map.** Your own map images, nested maps, pins for any element, and zones drawn as areas or lines. Zones can be coloured by kind (rivers blue, roads dashed), and the style is saved with the world. A map shows its zones and pins as of any date in the world's calendar: a zone by its own dates, a pin by its element's (a Character from its birth on, an Event from its start to its end). Anything undated always shows. Since 1.53.0 a map can be drawn from its own zones: Map style on the map's page (Plain, Ink on parchment, Modern atlas, Hatched) draws each zone whose subtype names a kind (Landmass, Sea, Lake, Range, Forest, Marsh, Desert, Territory, River, Road (or Route, Path), Wall, Border, Coast; any case) as that kind: coasts with their shore, ranges hatched, rivers cut at the coast, names along the lines. A subtype written `Class: kind` (`Border: treaty line`) is tried by its halves, the part before the colon first. Your zones are never changed, Plain brings the usual look back, and over a map's picture the zones take the style's lines and names but cover nothing. The style is saved on the Map as `atlas_map_style` and syncs. Trace on the drawing strip turns a drag into a few points.
- **Chart.** Place elements on a time axis by their dates, on your world's own calendar. Charts can be saved and added to published pages.
- **Knowledge.** Track who knows what, per character or circle, and see the world as one of them knows it.
- **Calendars.** Custom calendars as a display layer over world time.
- **On a phone.** Built for a bigger screen, Atlas holds together on a phone: a top bar with a More menu, finger-sized buttons, each field's name above its value. On a touch screen help and the tour speak in taps, Writing has a Find button, the sidebar has Hide types, and the chart zooms with two fingers, pans with one, and re-dates a tapped dot by sliding it.
- **Local-first.** Worlds are folders of plain JSON files you own, in a folder on your drive or in your browser, and Atlas works offline.
- **One file.** Download the whole world as a single .zip (elements, pages, notes, charts and images, without the OnlyWorlds link and its key). Atlas opens it on any browser as a world of its own.
- **Sync.** Link a world to onlyworlds.com to push and pull. The folder stays the source of truth. Signed out, Make online and New world on OnlyWorlds ask for your email or username and password, sign you in and make the world on your account (since 1.54.0; Atlas keeps a token for this browser, never your password). Download a world from OnlyWorlds takes a world's API key and PIN, downloads a full copy and keeps the two in sync; a mistyped PIN is called a wrong PIN, not a wrong key (since 1.55.1). Open in Atlas on a world's page on onlyworlds.com opens it here: signed in, Atlas asks once and opens the world, or the copy you already have; signed out, it asks you to sign in first. An element an agent changed last carries a quiet mark after its name; point at it or tap it to read who. A person's change carries none. If onlyworlds.com stops taking a linked world's key, Sync says why (revoked, unknown, a read key, a wrong PIN), and Settings → This world takes a new key in place; signed in, Atlas makes one itself for a world on your account's list, unless you are a guest there. The folder and the edits waiting to sync stay. In a world someone shared with you, onlyworlds.com takes changes to the world's own details, such as its description, only from its owner, though a co-builder may move the world's now: Atlas sends the now on its own (since 1.53.3), keeps the rest of such a change in your copy, says so once, and tries again when you change those details again (since 1.53.2).
- **Import and Export.** Import and export the same world file onlyworlds.com exports. A world folder written by another tool opens in place.
- **Sharing.** Publish read-only pages of your world to send to anyone. Needs an account; each world can have 20 published pages at a time. The owner of a linked world invites people from Settings → This world → Invite someone: signed in to your account, Atlas makes the link (a contributor; a player, who needs no account and reads in Lantern as one Character, picked or new, since 1.55.0; or a player with an account; each works once, for 7 days) with Copy and a QR code. Seeing and taking back links stays on the world's page on onlyworlds.com, and signed out the button opens that page. An invite link opened in Atlas joins you with your own OnlyWorlds account; a player's link opens the world to read as its Character, with no account and no PIN (since 1.55.0). If your account has no PIN yet, the world opens to read, with a line on where to set one.
- **Light and Dark.** Both themes across the whole app.

## Getting Started

No signup is needed to start. The first screen leads with two doors: **start a world**, and **Moppetopia**, the public demo world, which opens as an editable copy in your browser that never syncs back (later, Settings → Explore Moppetopia opens it again). The guided tour, a world folder and the other ways in sit one line below. Signed in (Settings → OnlyWorlds → Account, with your email or username and password, since 1.52.0; pasting an account token still works under "I have an account token"), your worlds on onlyworlds.com, your own and those shared with you, are listed under the doors, and one click opens one.

Where a world lives: on Chrome, Edge and Brave a new world asks whether it goes in a folder on your drive, where your AI and other tools can work on it, or in the browser, and a browser world can be moved to a folder later. On Firefox and Safari a world lives in the browser, and that is a full home. A new world's Home asks what you have (start fresh, bring in a world from somewhere else, or look around), then shows the next few steps in the order a world tends to grow.

To sync with onlyworlds.com, see [onlyworlds.com](/docs/tools/onlyworlds-com) for accounts and keys.
