---
title: Accounts, members and sharing
description: "The @onlyworlds/sdk calls that work with a person's account: signing in, invite links, who is in a world, a seat for your AI, a world on the account and proposed changes."
---

These calls are part of [`@onlyworlds/sdk`](/docs/development/typescript). They work with a person's OnlyWorlds account rather than one world: signing in, inviting people and AIs into a world, making a world, and changes a member proposes instead of writing.

Most of them need an account token (`ow_a_`), which stands for the person's account on one device (see [Keys and PINs](/docs/getting-started/keys#account-tokens)). In the examples, `account` is a client made with one: `new OwV2Client({ apiKey: token })`. `client` is a client made with a world key, as on the [TypeScript SDK](/docs/development/typescript) page, where installing the package, reading and writing are.

Everyone in a world has a [role](/docs/development/api/members#roles): `owner`, `co_builder`, `contributor` or `guest`, from the most they may see and change to the least. A keeper is the owner or a co-builder, who accepts or declines what others propose.

## Sign in with a password

`signInWithPassword` turns an OnlyWorlds email (or username) and password into an account token (`ow_a_`) for this device, so the person needs an account on onlyworlds.com. A client with no key can call it. With `OW_EMAIL` and `OW_PASSWORD` in a `.env` file, run this with `node --env-file=.env signin.mjs`:

```typescript
import { OwV2Client } from '@onlyworlds/sdk';

const { token } = await new OwV2Client().signInWithPassword({
  email: process.env.OW_EMAIL, // or username: '...'
  password: process.env.OW_PASSWORD,
  tokenName: 'My app on iPhone', // the name the token is listed under
});
const account = new OwV2Client({ apiKey: token }); // store the token: it is shown once
```

Pass exactly one of `email` and `username`; both or neither is a `TypeError` before anything is sent.

The answer is `{ token, id, name, last4 }`. The token is listed under `tokenName` on the account's tokens page (**Settings → Account tokens** in the [account portal](https://www.onlyworlds.com/account/)), where it can be revoked. Only the token is kept: the password is sent once and held nowhere.

<details>
<summary>What the call sends</summary>

The SDK signs in at onlyworlds.com's sign-in service, mints the token with `POST /api/v2/account/tokens`, then ends the sign-in session, whether the mint worked or not.

</details>

A refusal throws `OwSignInError`, whose `reason` is one of:

- `invalid_credentials`: a wrong email, username or password
- `email_unverified`: the account's email address is not confirmed yet
- `rate_limited`: too many attempts; wait `err.retryAfter` seconds when it is set
- `offline`: onlyworlds.com was not reached
- `mint_failed`: signed in, but no token was made
- `failed`: anything else, with the server's message

The password is never in an error.

## Sign in with OnlyWorlds

A tool with a web page, or a native app, can instead send the person to onlyworlds.com to sign in, so the tool never sees a password. The tool registers first ([Registered tools](/docs/development/api/signin#registered-tools)). On a client with no key, `signInWithOnlyWorlds({ clientId, redirectUri })` sends the browser to onlyworlds.com's sign-in page, and on the return page `completeSignIn({ clientId })` gives back the account token. [Sign in with OnlyWorlds](/docs/development/api/signin#in-the-sdk) has the SDK's `signInWithOnlyWorlds` and `completeSignIn` in full.

## Invite links

A world's owner can invite a person with a link (see [Invite links](/docs/development/api/members#invite-links)). The owner makes, lists and revokes the links with the account token. The code comes back once, in the answer that makes it:

```typescript
const made = await account.createWorldLink(worldId, { reader: 'person', role: 'contributor', days: 7 });
// made.link: https://www.onlyworlds.com/join#ow_j_…  (the link to send)
// made.code: ow_j_…  (the code: the part of the link after #)
// made.line: the one line to send (who invites, to which world, the link)
const links = await account.listWorldLinks(worldId);  // no codes: status pending | used | revoked | expired
await account.revokeWorldLink(worldId, made.id);
```

`reader` says who the link is for: `person` here, `agent` or `player` below.

On the invited person's side, the code is the part after `#`. Any client can preview it, since the preview sends no key, and the person accepts it with their own account token:

```typescript
const invite = await new OwV2Client().previewJoin(code); // who invites, which world, what role; sends no key
const membership = await account.acceptJoin(code);        // account: the invited person's client with an ow_a_ token
```

A bad code is one 404 (`err.isNotFound`). Accepting can answer `err.isAlreadyMember`; it needs no account PIN, though a write key for the new membership waits for one. A refusal never uses up the code.

`reader: 'agent'` makes a link an AI agent redeems for a seat instead (an [agent seat](/docs/development/api/members#agent-seats): the AI's own membership, key and secret), with `redeemJoin`: the answer has `kind: 'agent'`, the seat's key and secret, and its `.env` lines.

`createWorldLink` is the owner's own: any other account gets a 404. A co-builder makes guest and contributor links through the API ([a co-builder's links](/docs/development/api/members#a-co-builders-links)), which has no SDK call yet.

`reader: 'player'` makes a link for a friend with no account, who reads the world as a guest playing one Character and writes nothing (see [Members and sharing](/docs/development/api/members)). The friend's side needs no key at all:

```typescript
const link = await account.createWorldLink(worldId, { reader: 'player', character: 'new' }); // or a Character's id
// on the friend's device:
const phone = new OwV2Client();                       // no key: only health, previewJoin, redeemJoin and signInWithPassword work
const joined = await phone.redeemJoin(code, { name: 'Ana' }); // joined.kind === 'player'
const reader = new OwV2Client({ apiKey: joined.key }); // a read key, no PIN, shown once
```

The code is spent on redeem, and the answer can't be replayed: if it is lost, the owner sees the row never used, and sends a new link.

One player link can also seat a whole table (see [A table of players](/docs/development/api/members#a-table-of-players)). Each player picks one Character from the owner's list, and a refusal spends nothing:

```typescript
const table = await account.createWorldLink(worldId, { reader: 'player', maxUses: 4, characters: [aliceId, borinId] });
// on each player's device:
const seen = await phone.previewJoin(code);           // seen.uses_left, seen.characters: [{ id, name, image_url, taken }]
try {
  const joined = seen.name_required
    ? await phone.redeemJoin(code, { name: 'Ana' })   // no list: a fresh Character named for the player
    : await phone.redeemJoin(code, { character: seen.characters.find((c) => !c.taken).id });
} catch (err) {
  if (err.isCharacterTaken || err.isCharacterInvalid) { /* preview again and pick another */ }
  else if (err.isWorldFull) { /* the world has its 50 players */ }
  else throw err;
}
```

## Who is in a world

Once in, a world key can ask who it is and who else is there (see [Who am I](/docs/development/api/members#who-am-i)):

```typescript
const me = await client.me();          // { world, scope, kind, role, membership, character }
const roster = await client.members(); // the roster's rows: { id, kind, role, character, status }
```

An account token reads the roster too. On a client made with the token and `world` (`new OwV2Client({ apiKey: token, world: worldId })`), `members()` sends `GET /members?world=<id>` and reads it as the token's own access there: the owner as the owner, and a member as their own member key. An account with no access gets a `404`. Without `world` it refuses before sending.

## A seat for your AI

To let your own AI work in a world you own or belong to, make it a seat: its own membership, key and secret, with no link to pass around (see [Giving your AI access](/docs/development/agents#giving-your-ai-access)). With the account token:

```typescript
const made = await account.createSeat(worldId, { name: 'Quill', role: 'contributor', character: 'new' });
// made.env: the .env lines for the AI (OW_API_KEY, OW_API_PIN, OW_WORLD, ...), shown once
const seats = await account.listSeats(worldId);          // yours; every seat for the owner; no keys
const renewed = await account.rekeySeat(worldId, made.seat.id); // a new key and secret; the old stop
await account.removeSeat(worldId, made.seat.id);
```

`role` is at most your own; `character` is `new` (a Character of its own), `none`, or `mine` (it plays the Character you play).

None of these sends an `Idempotency-Key`, so a key is never stored for a replay: if an answer is lost, `listSeats` shows the seat, and `rekeySeat` gives it a new key.

## A world on the account

An account token makes a world: `createAccountWorld({ name, pin, keyName, source, producer })` answers the world and its one write key, shown once.

`pin` is the account's PIN. A fresh account has no PIN yet, so send four digits as `pin` on the first create, and they become the account's PIN; without it, the first create answers `422` with `err.param === 'pin'`. An account that has one may send it too, and the server checks it before it makes the world: a wrong one is a `401` with `err.param === 'pin'`, and nothing is made. Left out, the world takes the account's PIN, so a tool that holds the person's PIN can always send it.

`keyName` names the key (1 to 80 characters). `source` and `producer` are the [folder's provenance lines](/docs/schema/folders#worldjson), for a tool that makes the world from a folder, kept as the world's `origin`. `producer` names the tool that made the world and from what: `input: 'bare'` is a world born empty in a tool, one word from the folder format's closed list.

```typescript
const acct = new OwV2Client({ apiKey: 'ow_a_…' });
const made = await acct.createAccountWorld({ name: 'Hyperion', keyName: 'my tool', producer: { tool: 'my-tool', version: '1.0.0', input: 'bare' } });
```

The token also [reads a world](/docs/getting-started/keys#reading-a-world-with-an-account-token) with no key minted: give the client the world's id as `world`, and `list`, `listAll`, `get`, `getWorld` and `draught` read it as the account's own access there. The account calls keep working on the same client. Any other world call on such a client (a write, `changes`, `me`, files) is a `TypeError` before anything is sent.

With no key at all, the same option is the [public reader](/docs/development/api/public#the-keyless-reads), and `getWorld()` then carries `counts`.

```typescript
const reader = new OwV2Client({ apiKey: 'ow_a_…', world: worldId });
for await (const el of reader.listAll('character', { signal })) { /* … */ }
const open = new OwV2Client({ world: worldId });   // no key: what the public reads
```

A tool that stores a world key on the device mints it with `mintWorldKey(worldId, { keep: true })`, so signing out keeps the key; without `keep`, revoking a token from Sign in with OnlyWorlds revokes the keys it minted, unless another live token of the same tool remains. A token from `signInWithPassword`, or one made by hand on the account page, never takes its keys: those stay until revoked one by one ([the keys a token minted](/docs/development/api/signin#consent-and-revoking)).

## Proposed changes

A member can [propose a change](/docs/development/api/proposals) for a keeper to accept instead of writing it. A world's owner can make every agent seat work that way, with the switch **AI seats propose, a person accepts** on the world page ([the switch](/docs/development/api/proposals#the-switch)).

```typescript
const row = await client.propose('character', id, { fields: { reputation: 'Feared' }, evidence: 'Chapter 12', expires: new Date(Date.now() + 14 * 86_400_000).toISOString() });
const queue = await client.worldProposals({ state: 'open' });        // newest first; keepers see every row, others their own
const { proposal, element } = await client.acceptProposal('character', id, row.id); // the keeper's own write, one feed row
await client.declineProposal('character', id, row.id, { reason: 'not yet' });
await client.withdrawProposal('character', id, row.id);               // the proposer's
for (const r of queue.data) if (r.kind === 'new_element') await client.reviewNewElement(r.element_type, r.element_id, { decision: 'accept' }); // a seat's new element: accept clears the mark, decline deletes it
```

The queue holds two kinds of row, told apart by `kind`; narrow on it before reading a proposal's own keys:

- `OwProposal` (`kind: 'proposal'`): a proposed change. Its `fields` hold only the fields whose proposed value differs from the element's, and `omitted` names the fields an upsert (a whole replace) left out that were not empty on the element.
- `OwProposedNewElement` (`kind: 'new_element'`): a new element written as proposed, settled with `reviewNewElement`.

`next_cursor` is opaque.

`reviewNewElement` settles a new element a seat made under the switch; an element with no mark throws with `err.isNotProposed`.

With **AI seats propose, a person accepts** on for the world (`agent_writes_proposed` on `getWorld()`, read-only; `patchWorld` strips it), an agent seat's `patch`, `upsert` or `editLinks` on an existing element answers `202`. The client then throws `OwProposedError` (`err.isProposed`, `err.proposal`) rather than returning a body that is not the element; a `bulk` slot with `status: 202` stays in the result, typed.

An accept that finds a proposed field moved throws `OwStaleProposalError` (409, `err.isStaleProposal`, `err.conflicts`, `err.current`); the other codes are `isOwnProposal`, `isProposedOnly`, `isTooManyOpen` and `isFieldNotVisible`.

Nothing about a proposal reaches the change feed: poll the queue to learn of new ones.

How a reader shows an element still proposed, and leaves it out of what it hands on, is on the readers page: [Proposed elements](/docs/development/typescript-readers#proposed-elements).
