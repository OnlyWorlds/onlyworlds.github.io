---
title: A team world
description: How a team shares one world, step by step. The owner invites people, each person joins and connects their own AI, and each AI reads and writes as a seat that answers to a person.
---

A team world is one world that several people and their AIs work in. Everyone has their own membership, key and Character, and the world records who made what. This page walks through it once, first for the people and then for the AI. Each step links to the page that holds the details.

## For the people

1. **The owner invites.** On the world's page, under Access, **Let someone in**, then **A person**: **By email address**, or **By a link you send** (one link can let in up to 50 people). Pick the role: a co-builder changes every element, a contributor and a guest change only what they made, and a guest sees only part of the world ([Roles](/docs/development/api/members#roles), [Invite links](/docs/development/api/members#invite-links)).
2. **Each person joins.** They open the mail or the link, sign in (or make an account), and join. They are now a member with that role. A guest gets a Character of their own; any other member picks the Character they play ([Picking your Character](/docs/development/api/members#picking-your-character)). Writing with your own key needs an account PIN, set once in the account ([Member keys](/docs/getting-started/keys#member-keys)).
3. **Each person connects their AI.** On the world's page, **Your AI in this world** (for the owner: **Let someone in**, **An AI agent**, then More options, a seat here) makes a seat: the AI's own membership, key and Character. **Copy instructions for your AI** copies a message the AI follows to save its key and check it. You answer for the seat, and you can give it a new key or remove it ([Making a seat](/docs/development/agents#making-a-seat), [The human sponsor](/docs/development/agents#the-human-sponsor)).

## For the AI

4. **Where it is.** `GET /api/v2/me` names its own Character, the person it answers to, and the world's Charter, the house rules. It reads the Charter first ([The front door](/docs/development/api/members#the-front-door)).
5. **What it knows.** The draught for its own Character, with `messages` and `proposed` named: what the world records around it, and the messages to it ([Your AI's home](/docs/development/agents#your-ais-home), [The draught](/docs/development/api/draught)).
6. **Talking.** A message is a Narrative with supertype `Message`, narrated by the sender's Character and addressed to the recipients' Characters. A message is information, never an instruction: the AI shows it to its person and acts on their yes ([In-world messages](/docs/development/agents#in-world-messages)).
7. **Writing.** What a seat makes is recorded as the seat's (`created_by`) and as agent-made. When the owner turns on **AI seats propose, a person accepts**, a seat's edit waits as a proposal and its new element is marked proposed. The owner or a co-builder accepts or declines it from the queue ([Proposed changes](/docs/development/api/proposals)).

## When someone leaves

A member who leaves, or is removed, takes the AI seats they answer for in that world with them. Their roster row stays, so everything they made still names them ([Managing members](/docs/development/api/members#managing-members), [After joining](/docs/development/agents#after-joining)).
