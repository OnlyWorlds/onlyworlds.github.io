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

## Getting started

No signup is needed to start. The first screen leads with **Create a world**, and under it **Explore**, which opens Moppetopia, the public demo world, as an editable copy in your browser that never syncs back. Later, Settings → **Explore Moppetopia** opens it again.

Below them, **Watch how it works** is the guided tour, and **Other ways in** opens a world folder you have, downloads a world from OnlyWorlds, views a shared world, opens a world file or brings in notes or JSON.

### Create a world

On Chrome, Edge and Brave, a new world asks whether it goes in a folder on your drive, where your AI and other tools can work on it, or in this browser. A browser world can be moved to a folder later.

On Firefox and Safari a world lives in the browser, and that is a full home. Either way the world is plain JSON files you own, and Atlas works offline.

### Your first story

A new world's Home asks for its first story, one question at a time: the story's name and text, then who it is about, what happens in it, where it happened, and whether they are still there. The main character can take a Born date and the location a Founded date.

Each answer becomes a box joined to the one before. A step can wait (**Skip for now**), and a filled box's ⋯ menu has **Edit here** to change it in place.

A short line above each box says where it can grow: the story in the writing room, the event on the timeline in Charts, the location on a map, the character on their own page.

Once the world holds more than this first story and its parts, Home shows **Picture** and **Strand** as tabs. On Picture the story and its parts stand first, in the same places every time.

## Keeping your world

A world kept only in this browser asks for a copy once its first story is whole: **Download the whole world**, **Move to a folder** or **Make online**. If the browser clears its storage, a world kept only there goes with it.

### One file

**Download the whole world** saves the world as a single .zip: elements, pages, notes, charts and images. It leaves out the OnlyWorlds link and its key, and the record of which member and which tool last wrote each element, which a JSON export leaves out too. Atlas opens the file in any browser as a world of its own.

Atlas also opens a world file another tool saved as `.owworld`. Under any other name but `.json`, a file opens by what it holds.

A world file of a world already in Atlas can open beside it as a copy to read, never changed and never online. It is named in your list with the day the file was made, when the file says one, so last week's world sits next to today's.

A world folder or file whose `world.json` says `writable: false`, as a [snapshot](/docs/schema/folders#snapshots) does, opens view only.

### Import and export

Atlas imports and exports the same world file onlyworlds.com exports.

A world folder written by another tool opens in place. An element file in it that is damaged or has no id is left on disk as it is, and the element list says how many cannot be read and names them, so fixing one brings its element back. A world file with a damaged entry is refused, never half read.

Before you have a world, Other ways in → **Bring in a file, notes or JSON** opens the Data room. A world file opens as it is. OnlyWorlds JSON, such as the JSON an AI assistant makes from your notes, is reviewed first, then **Create world** makes a world from it.

## Features

- **Build and browse.** Every element type in an editor driven by the standard. Link fields are pickers, and every element lists what links to it.
- **Home.** A world's charter, its guide and its domains come first, each a link. They stay out of the element list, the counts, Search and Charts, so the world reads as its story. A world's charter is the newest one marked as its charter, and its owner or a co-builder sees **Mark as this world's charter** on an unmarked one's page.
- **Write.** Books, chapters and scenes (you set the tier names). Names in your prose become links with a click, and the find bar's **Link to element…** links every match at once. The words stay yours.
- **Web.** Any element's connections as a small graph, including everything that links to it. An element waiting for review or hidden on OnlyWorlds gets a dotted ring and the word beside its name.
- **Lenses.** The **Lens** button above the Web's graph reads the Web through any lens in your world: it shows what the lens keeps, and says how many it keeps and why the rest were left out. **Keep a lens on** (an element's name), in the same menu, saves one of that element and what links to it or from it.
- **Map.** Your own map images, nested maps, pins for any element, and zones drawn as areas or lines. Zones can be coloured by kind (rivers blue, roads dashed), and the style is saved with the world. **Trace** on the drawing strip turns a drag into a few points. A map laid out by a method, its pins placed by a rule, shows its recipe as a short card on its page: the method, the map it stands on, and that Atlas draws it flat. The recipe as written is one press away, and Atlas never rewrites it. A pin you place, create or drag on such a map is marked as placed by hand, so the next layout leaves it where you put it; the pin's page shows the mark as a card, and removing the mark lets the layout place that pin again. When a laid-out map has no picture of its own, Atlas draws the map it stands on under its pins: that map's picture, and its rivers, roads and regions as faint lines and areas. A map with its own picture keeps it.
- **Maps in time.** A map shows its zones and pins as of any date in the world's calendar: a zone by its own dates, a pin by its element's (a Character from its birth on, an Event from its start to its end). Anything undated always shows.
- **Chart.** Place elements on a time axis by their dates, on your world's own calendar. Charts can be saved and added to published pages.
- **Knowledge.** Track who knows what, per character or circle, and see the world as one of them knows it.
- **Calendars.** Custom calendars as a display layer over world time. Atlas reads the calendar profile's version 2, so Gregorian leap years (every 4, not every 100, yet every 400) and calendars with no year 0 read exact, and the calendar builder keeps the keys it does not draw.
- **On a phone.** Built for a bigger screen, Atlas holds together on a phone: a top bar with Home and Writing and the other rooms under ⋯, finger-sized buttons, each field's name above its value. On a touch screen help and the tour speak in taps, Writing has a button to find in the text, the sidebar has **Hide types**, and the chart zooms with two fingers, pans with one, and re-dates a tapped dot by sliding it. A map's drawing tools are finger-sized too, and inside a submap the way back up keeps its own row and the whole name of where it goes.
- **Light and dark.** Both themes across the whole app.

### Map styles

A map can be drawn from its own zones. **Map style** on the map's page (Plain, Ink on parchment, Modern atlas, Hatched) draws each zone whose subtype names a kind as that kind: coasts with their shore, ranges hatched, rivers cut at the coast, names along the lines.

The kinds are Landmass, Sea, Lake, Range, Forest, Marsh, Desert, Territory, River, Road (or Route, Path), Wall, Border and Coast, in any case. A subtype written `Class: kind` (`Border: treaty line`) is tried by its halves, the part before the colon first.

Your zones are never changed, and Plain brings the usual look back. Over a map's picture the zones take the style's lines and names but cover nothing. The style is saved on the Map as `atlas_map_style` and syncs.

## Sync with onlyworlds.com

Link a world to onlyworlds.com to push and pull. The folder stays the source of truth. For accounts and keys, see [onlyworlds.com](/docs/tools/onlyworlds-com).

### Signing in

Settings → OnlyWorlds → **Sign in with OnlyWorlds**: onlyworlds.com asks once whether Atlas may sign in as you, and you come back where you were, signed in. Your email or username and password still work, and an account token can be pasted in under **I have an account token**.

Signed in, your worlds on onlyworlds.com, your own and those shared with you, are listed under the first screen's buttons, and one click opens one.

Atlas keeps a token for this browser, never your password. The token is listed on your account page, where you can take it back.

**Forget** in Settings and **Forget everything in this browser** take that token back on onlyworlds.com too, and say whether it was confirmed. A token you pasted in yourself is never revoked. Signing in again revokes the token Atlas made before, once the new one is kept.

### Linking a world

Signed out, **Make online** and **New world on OnlyWorlds** start with Sign in with OnlyWorlds, and the world is then made on your account.

**Download a world from OnlyWorlds** takes a world's API key and PIN, downloads a full copy and keeps the two in sync. A mistyped PIN is called a wrong PIN, not a wrong key.

**Open in Atlas** on a world's page on onlyworlds.com opens it here. Signed in, Atlas asks once and opens the world, or the copy you already have; signed out, it asks you to sign in first.

### When a key stops working

If onlyworlds.com stops taking a linked world's key, Sync says why (revoked, unknown, a read key, a wrong PIN), and Settings → This world takes a new key in place. Signed in, Atlas makes one itself for a world on your account's list, unless you are a guest there.

The folder and the edits waiting to sync stay.

### Who changed what

An element, a knowledge entry or a page an agent changed last carries a quiet mark after its name; point at it or tap it to read who. A person's change carries none, and your own edit takes it away.

In a world on OnlyWorlds, the foot of an element's page says where it was last changed (in Atlas, in Lantern, on onlyworlds.com, in code or with an AI) and the tools before that, each with its time. It names tools, never people.

### Working with others

When others can change a world with you (people you invited, or an agent with a seat), Atlas holds an element changed both in your copy and online, marks it ⚠ and lets you choose which version stays, instead of letting your copy replace their newer words. A shared world also pulls the latest changes when it opens. Settings → This world shows the rule and can turn it off. Working alone, nothing changes.

In a world someone shared with you, Atlas sends a change to the world's own details, such as its description, whole. onlyworlds.com takes those details from the owner and from a co-builder, all but the owner's Character, which Atlas never sends. When it refuses them, as it does for a contributor or a guest, Atlas sends only the world's current date (its now), keeps the rest of the change in your copy, says so once, and tries again when you change those details again.

If the owner makes you a guest, your copy keeps everything you had and Atlas says so once. What you no longer see online stays as it is and stops syncing, your changes to it stay in your copy, and a bigger role later brings those elements back into sync. Settings → This world names your role and how many elements are kept.

A page keeps its layout on the computer that built it, and OnlyWorlds holds its text. Opened anywhere else (a shared world, your own on a second device), the page shows that text, and adding to it there keeps it.

### Hidden elements

An element a world hides shows to you with the word Hidden, in a world on your disk or in this browser too. A published page leaves it out.

Making a world online sends its hidden elements hidden. When you own the world or build it with its owner, marking an element hidden after it went online hides it on OnlyWorlds as well, before your edit is sent. Taking the mark out of a file never shows it again there: unhide it on onlyworlds.com.

When the owner hides an element from you, it leaves your copy without asking, unless you changed it here. Then your change stays in your copy and stops syncing, your own elements keep their links to it, and it comes back when the owner shows it again.

### Files

In an online world, an element's page has a Files section: add a pdf, a text file, an image (png, jpg, webp or avif) or a world's own bundle, up to 25 MB each, with a label that says what it is for. The header shows how much of the world's 250 MB is used. <!-- limit: file_bytes files_world_bytes -->

Each file shows who added it and when, and an agent's is marked. Download fetches it fresh; Remove takes it off OnlyWorlds for everyone.

Files live on OnlyWorlds only, never in your copy of the world or its world file. The rules behind it: [Files](/docs/development/api/files).

## Sharing

Sharing is [forward-only](/docs/development/api/members#sharing-a-world).

### Published pages

Publish read-only pages of your world to send to anyone. Publishing needs an account, and each world can have 20 published pages at a time.

### Inviting people

The owner of a linked world invites people from Settings → This world → **Invite someone**. Signed in to your account, Atlas makes the link, with **Copy** and a QR code. Each link works once, for 7 days, and invites one of these:

- a contributor;
- a player, who needs no account and reads in Lantern as one Character, picked or new;
- a player with an account.

Seeing and taking back links stays on the world's page on onlyworlds.com. Signed out, the button opens that page at Access, also when the site asks you to sign in first.

### Joining from a link

An invite link opened in Atlas joins you with your own OnlyWorlds account. A player's link opens the world to read as its Character, with no account and no PIN.

A link to open a world works once. If the download is cancelled, closed or cut off by a reload, the world stays in your list as not downloaded yet: selecting it downloads it with nothing more spent, or you can remove it.

A link to a world whose owner has made it public on OnlyWorlds works with no account. Atlas asks first, in a card in the middle of the page (Open or Not now), then brings the world into this browser as a view-only copy: what its owner made public, with hidden elements and files left out, and nothing goes back to OnlyWorlds. If the world is yours, Sign in opens it as your own instead. The same link again opens the copy you already have, and says so if the world is no longer public.

A link can also open a world straight into its writing room, on one chapter or scene or at the start, and it still lands there after you sign in on the way.

A player link for a whole table ([A table of players](/docs/development/api/members#a-table-of-players)) says how many places are left and lists the Characters you may pick, taken ones greyed. Pick one and the world opens as that Character; a link with no list asks your name and makes one.

Playing a Character, you also see what your Character points to, one step out. What you only know of shows its name, picture and description, says so, and is never changed or sent back. A message whose sender or recipient your key may not see says "someone you cannot see", never who or how many.

A link made for an AI agent asks first, and says it joins as a seat its maker answers for, not as you. If your account has no PIN yet, the world opens to read, with a line on where to set one.

### View-only worlds

A world you can only view (a read key, a player's link, or a public world's copy) offers nothing it would refuse. Element pages show their values plainly, Writing and Knowledge open as text to read, pages open as their visitors see them, maps and charts move and zoom with nothing to drag into place, and no + appears.

Search, Find, opening and your own view settings work as before.
