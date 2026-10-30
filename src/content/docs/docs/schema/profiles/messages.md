---
title: Messages
description: "The message profile: who a message between members is for, whether its sender is proved, what is unread, and what onlyworlds.com adds."
---

In-world messages are [Narratives](/docs/schema/element_categories/narrative) with supertype `Message`. The `narrator` is the Character credited with the message, `characters` names its recipients, `story` is the body and `parent_narrative` the message it answers. The [message profile](https://github.com/OnlyWorlds/schema-dist/blob/main/profiles/message.md) is the one definition, with a conformance fixture every reader agrees on.

## What every reader does

- **Addressed to a Character**: its id is in `characters`, or `characters` is empty, which means every member.
- **The sender is a claim until checked.** `narrator` is what a message claims; the element's `created_by` is what the server recorded. The sender is verified when the Character of that membership on the [members list](/docs/development/api/members) is the `narrator` (`created_by` null is the owner); otherwise it is a mismatch or unverifiable, and a reader says so rather than showing the name plainly. A message with no `narrator` is from nobody, not to everyone.
- **What a reader has read** is a Relation with supertype `Read`, `actor` the reader's Character and the ids read in `narratives`, counted only when the reader's own hand wrote it, and no other hand has changed it since (its `changed_by` is its `created_by`). A body read with no key carries no hands, so no mark counts there.
- **Unread for a Character** is the messages addressed to it, less the ids on its read mark and less its own messages. Read from the API, a message is its own only when the sender is verified, so one that merely claims to be from it still shows as unread; in a folder, where nothing records who wrote what, the `narrator` is trusted.
- **A list trimmed for its reader.** A key that may not see every Character is served a message with those ids left out, and `x_served_trimmed` names the field that lost one. An empty `characters` with that mark is to someone the reader cannot see, never to everyone, and a missing `narrator` with it is a sender the reader cannot see, never "from nobody". A request with no key gets no mark, so it never reads an empty list as "to everyone".
- **An edit is a later hand.** When a message's `changed_by` is not its `created_by`, a reader says who edited it; the sender's answer stays the same.
- **A message stays a Narrative.** In an element list, a story's context or a Character's knowledge it reads like any other; an inbox or a thread reads it by these rules too.
- **A Note is not a message.** A Narrative with supertype `Note` is a member's own line in the world: addressed to nobody, never unread, never in an inbox or a thread. A Character's line is its newest Note in its own hand that is neither hidden nor proposed.

The TypeScript and Python SDKs carry the readers (`isMessage`, `isAddressedTo`, `isToEveryone`, `hasUnseenRecipients`, `senderStatus`, `readMarkOf`, `unreadFor`, `threadOf`, `editedBy`, `isNote`, `noteOf`, and their snake-case twins).

## On onlyworlds.com

- **An inbox is not only a filtered read**: `GET /api/v2/narrative/?supertype=Message&characters=<character-id>` misses the messages sent to everyone, so read the Messages and filter by the rule.
- **Writing a trimmed list back.** A write carrying the `x_served_trimmed` mark is refused ([`served_trimmed_not_writable`](/api/errors/#served_trimmed_not_writable)); a trimmed list written back without it loses nobody.
