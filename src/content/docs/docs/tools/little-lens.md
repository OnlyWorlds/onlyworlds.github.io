---
title: Little Lens
description: Little Lens shows an OnlyWorlds world as a web of its elements and links, through any of its lenses, on a time strip, and one element at a time. It only reads; a public world needs no account.
---

Little Lens lets you look at a world. The whole world is drawn as a web of its elements and the links between them, and you can look at it through one of the world's lenses, along its time line, or one element at a time. It only reads: it never changes a world. To change one, open it in [Atlas](/docs/tools/atlas) or [Lantern](/docs/tools/lantern).

| | |
|---|---|
| **URL** | [little-lens.onlyworlds.com](https://little-lens.onlyworlds.com) |
| **Type** | Web app in the browser; reads only |
| **Works with** | Any OnlyWorlds world: a public one, a world file or folder, or the worlds on your account |

## Ways in

The first screen offers:

- **Explore Moppetopia, a public world**: the demo world, with no account.
- **Sign in with OnlyWorlds**: the worlds you own or have joined.
- **Open a world file**: a `.owworld` file, or a `.zip` of a world folder.
- **Open a world folder**: a world folder as Atlas keeps one on your disk.
- **Small worlds from the OnlyWorlds standard**: the little worlds the standard's lenses and charters are tested on, bundled with the app.

**A public world** is one whose owner has opened it to everyone ([public worlds](/docs/development/api/public)). Little Lens reads it with no key and no sign-in, and shows it as the public sees it. Any public world opens at `little-lens.onlyworlds.com/#/w/<world id>`.

**A world file or folder** is read in your browser and kept only while the page is open. Nothing in it is sent anywhere or stored.

**Signing in** uses [Sign in with OnlyWorlds](/docs/development/api/signin), and works only at little-lens.onlyworlds.com. Little Lens keeps the sign-in in the page's memory and never stores it, so a reload asks you to sign in again. Signing out removes it from your account. If you close the browser instead, it ends by itself six hours after you signed in; until then you can remove it under Account settings on onlyworlds.com. Little Lens never makes keys on your account. Each world is read as your account sees it.

**From another tool**: an **Open with** menu, such as the one on onlyworlds.com, links to `#/open/<world id>`, or to `#/open/<world id>/element/<element id>` for one element. A world on your signed-in list opens as yours; any other opens as a public world if it is one, and otherwise asks you to sign in and then brings you back to it.

## What it shows

**Web, List and Time** are the three views of a world.

- **Web**: every element once, coloured by its type, with the most linked drawn larger and named. The same world always lands the same way. Filter by type, or search names and descriptions.
- **List**: the same elements as cards.
- **Time**: the world's dated elements on a strip, each at its own date (a Character's birth date, a Location's founding date, an Event's start), with the world's now marked. Dates are written in the world's calendar when it has exactly one. Drag along the strip, or use the arrow keys, to pick a moment: a line counts what is dated up to it, and the list below marks each element dated after it. Elements that could have a date but have none are counted, not placed.

**The Lens box** lists the world's [lenses](/docs/lenses) by name. Choosing one redraws the web and the list through it: exactly the elements the lens keeps, and the links between them. An element's own page still shows all of its links.

**An element's page** shows its fields in the standard's sections, its links as chips you can follow, and a small graph of its neighbours: solid lines for what it links to, dashed lines for what links to it.

**A draught at a moment** (on a Character's page, **Its draught at a moment**) shows what the world records around that Character up to a moment you pick, as OnlyWorlds serves [the draught](/docs/world-graph/draught). It also lists what is dated after that moment. **Copy as plain text** copies it as text you can paste into a chat with an AI. It says what the record holds up to a moment, never what a Character knew then. A world file has no draught: it comes from onlyworlds.com.

**Messages**: a world's messages (Narratives with the supertype Message) as conversations, read by the [message profile](/docs/schema/profiles/messages). Each says who it is from as far as the world can show it ("From Ada" when it can, "Claims to be from Ada" when it cannot), whom it is to, and who has read it. A message still waiting for approval says so.

## What it leaves out

The web follows the same rules as every OnlyWorlds graph ([World graph](/docs/world-graph)):

- Maps, pins and markers stay off the web, even when a lens keeps them.
- A world's reading aids (its Charter, Guide and Domains) are listed first, under **Read first**, rather than drawn into the whole world's web.
- Hidden elements, elements still waiting for approval, and a world's room (its members' conversations and work items) are left out, and the page says how many.
