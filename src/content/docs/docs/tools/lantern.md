---
title: Lantern
description: Lantern holds your OnlyWorlds worlds on your phone, works without signal, and lets a friend read a world as their Character with no account.
---

Lantern holds your worlds on your phone. Find anything, follow its links, change a field, catch an idea, and run a game from the phone at the table. It is a web page you add to your home screen: it opens without signal and sends your changes when it can. A friend you invite can read a world in Lantern as their Character, with no account.

| | |
|---|---|
| **URL** | [lantern.onlyworlds.com](https://lantern.onlyworlds.com) |
| **Type** | Web app for phones, added to the home screen; works offline |
| **Works with** | [Atlas](/docs/tools/atlas) and every OnlyWorlds tool: the same worlds online, and the same world file |

## Getting Started

Open [lantern.onlyworlds.com](https://lantern.onlyworlds.com) in your phone's browser. The first screen asks you to add Lantern to your home screen before anything else: from there it opens without signal, and a world you start stays with it. **Add to home screen** opens the browser's own install dialog where there is one; on an iPhone it shows the steps (Share in Safari, then Add to Home Screen). The same button is in Settings.

The first screen offers:

- **Sign in to OnlyWorlds**: your worlds, the same ones Atlas opens.
- **Explore Moppetopia**: the demo world, to read, with nothing to sign up for.
- **Start a world on this phone**: no account needed; put it online later.
- **I have an invite link**, **I have a world key** and **I have a world file**.

On Android, a long press on Lantern's icon offers **Catch**, to keep an idea in one of your worlds.

## Signing In

**Sign in** asks for the email or username and the password of your onlyworlds.com account. Lantern keeps a token of its own for this phone, never your password. The token is named for the phone ("Lantern on iPhone", "Lantern on Android phone"), and you can take it back on onlyworlds.com ([Account Tokens](/docs/getting-started/keys#account-tokens)). A token made on onlyworlds.com still works, under **I have an account token**. With no account yet, the sign-in screen links to onlyworlds.com's sign-up page.

Changes to an online world need your account's four-digit [PIN](/docs/getting-started/keys#the-pin). Lantern asks for it once for all your account's worlds and keeps it on this phone until you sign out. A member whose account has no PIN yet opens a shared world to read; **Read only · why** says where to set one and tries again.

**Sign out** (Settings) keeps the worlds already on the phone. On a shared phone, **Sign out and remove your worlds from this phone** takes your account's worlds off too; a second tap says what goes, unsent changes counted.

## Your Worlds

**Your worlds** lists every world on the phone, under Pinned, Online, Opened with a key, On this phone only, and Demo. Pin a world to keep it at the top.

- **Online.** Signed in, your account's worlds are listed, your own and those shared with you. Tap one to open it on this phone: Lantern makes the phone a key of its own for that world (a read key for a player) and keeps a copy of the world on the phone.
- **On this phone only.** **Start a world on this phone** (or **New world**) makes a world with no account behind it. **Put it online**, under it, makes it a world on your account, the one Atlas opens, and the phone keeps working on it. It asks you to sign in first, then for your PIN; if your account has none yet, the four digits become it. The elements go in one batch: if onlyworlds.com refuses the batch, no element is sent. The phone-only copy is removed only once the world reads back whole.
- **Opened with a key.** **I have a world key** (or **Open with a key** on Your worlds, signed in) opens a world with a key someone gave you: `ow_w_`, `ow_r_` or a ten-digit key ([Key Types](/docs/getting-started/keys#key-types)). The PIN is needed only to make changes. An account token is refused there: sign in instead.
- **Demo.** Moppetopia, read only.

### World Files

A world file is one `.zip` holding a world folder, the way Atlas keeps a world. **Open a world file** (on Your worlds, or **I have a world file** on the first screen) opens one a friend sent as a world on this phone only. A world already on the phone is not opened twice. **Save a copy**, under a phone-only world, hands the file to the phone's share sheet (Save to Files, say) or downloads it. Atlas opens the copy too.

## Joining a World

An invite link looks like `https://www.onlyworlds.com/join#ow_j_…`. Paste it on **Join a world** (**I have an invite link** on the first screen, **Join with an invite link** on Your worlds), or tap **Open in Lantern** on onlyworlds.com's join page, which brings the link straight in. On Android, a link shared to Lantern from a chat opens the same screen. Lantern shows who invites you, to which world, as what, and until when the link works. A link works once. Joining needs signal.

What Lantern does with each kind of link:

- **A person's link** (a contributor, a co-builder, or a player with an account) joins with your own account: **Join** and the world's name. Signed out, the button reads **Sign in to join**, and the link waits through the sign-in. The world then opens on the phone like any of your account's worlds.
- **A player's link** needs no account and no PIN. Lantern asks for your name, as the game master sees it (optional), then **Open** and the world's name opens the world to read as the Character the game master chose. See [Player Links](/docs/development/api/members#player-links).
- **An agent's link** is for an AI, not a person. Lantern says so and joins nothing; ask for a link for a person. An AI joins with it as an [agent seat](/docs/development/agents).

A link that was used, expired or taken back is refused with one sentence: ask for a new one. A game master who opens their own player link on a phone that holds their own copy of the world keeps that copy. The link is used up then: remove the player it made from the world's members on onlyworlds.com.

## At the Table

### A Player's View

A player sees the world as their Character knows it ([Guests](/docs/development/api/members#guests)). Their home says "You play Mira. You see what Mira knows." and lists the newest things first, then everything they know. While Lantern is open and in front, it looks for changes every 20 seconds, so what the game master gives the party arrives during the session, with a short "New: …" line.

A player keeps notes of their own: the **Note** tab (where others have Catch) and **My notes**. Notes stay on this phone, without signal too, and nobody else sees them. A player who joined with an account can send one with **Share with the party**: it goes into the world as a Narrative told by their Character, to a group their Character is in, and the game master sees it too. The first share needs signal, and the account's PIN if the phone does not hold it yet. A player who came by a player link has no account, so their notes stay on the phone.

### Give It to the Party

On a thing's page, the game master taps **Give it to the party** to show the players something they found. The first time, Lantern asks which Collective is the party (those with supertype Party first, or **A new one called The Party**) and keeps the choice for that world. The sheet takes what the party sees (a name, the thing's own name to start with) and your line; the thing's picture goes along.

**Give it** makes a new Narrative with these, told to the party's Collective and linked to the thing. Every player whose Character is in that Collective sees it. The thing itself stays as hidden as it was: the players get the Narrative, not the thing's page. With no Character in the party yet, the sheet says no player would see it. Given offline, it is kept on the phone and sent when there is signal. **Given tonight**, on the world's home, lists the reveals this phone gave in the last day.

It is offered to anyone who can change an online world, except a player, on anything but a Narrative, a Collective, a Pin, a Marker or a Zone. A world on this phone only has no players, so the button is not there.

### Tonight

**Keep for tonight** on any page puts it on the world's **Tonight** list, at the top of its home, in the order kept. **Clear the list** empties it. The list is this phone's own and never changes the world.

## Inviting Someone

The owner of an online world finds **Invite someone** last on its home. **Who is it for?** offers three:

- **A contributor** sees the whole world and adds to it. They need a free account.
- **A player** sees only what their Character knows, with no account: they open it in Lantern. **They play as** offers a new Character for them, or one of the world's Characters (one still waiting to send is left out).
- **A player with an account**: the same, signed in to an account of their own.

Your name, as they will see it, goes with the link, and the phone remembers it for next time. **Make the link** makes a link that works once, for 7 days. **Send it** opens the phone's share sheet; **Copy** and a QR code to scan across the table are beside it. The link is shown only then: Lantern does not keep it, and you can make another at any time. **See or take back links on onlyworlds.com** opens the world's Access pane. Making a link needs signal. A world holds only so many open invites, player links included; at the cap, take some back under Access first. Atlas's **Invite someone** makes the same three links ([Atlas](/docs/tools/atlas)).

## Without Signal

Once opened online, Lantern opens without signal, and every world on the phone stays readable. A change is kept on the phone first and sent by itself when the phone has signal. **Waiting to send** (the pill on the world's home) lists what has not gone yet, with **Send now**. If someone changed the same field meanwhile, Lantern shows both values and asks which to keep; otherwise it sends yours without asking.

Signing in, joining, making an invite link and a player's first shared note need signal. Settings says whether the phone has agreed to keep your worlds; when it has not, **Ask the phone to keep your worlds** asks it, and adding Lantern to the home screen helps.

## What Lantern Does Not Do

- It never keeps your password: only the phone's own token.
- It never keeps an invite link once it has shown it. Seeing and taking back links is on the world's page on onlyworlds.com.
- A player's notes never leave the phone unless shared with the party.
- Give it to the party never shows the thing's own page.
- Tonight, Given tonight and pinned worlds are this phone's own and are never sent.
