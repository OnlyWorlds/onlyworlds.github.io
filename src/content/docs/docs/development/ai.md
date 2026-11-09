---
title: AI agents
description: The five ways an AI works with an OnlyWorlds world, and where each one is documented.
---

An AI works with an OnlyWorlds world in one of five ways, chosen by where it runs.

New to building with AI? The guided start is [onlyworlds.com/develop](https://www.onlyworlds.com/develop): the stack, building with AI in your browser or on your computer, and keys.

## Five ways in

| Where the AI runs | What to use | What it gives the AI |
|:--|:--|:--|
| In a chat | [LLM guide](/docs/development/llm-guide) | One text file that teaches the standard, the API and the SDK. Paste it into any chat assistant. |
| In a coding agent | [Toolkit](/docs/development/toolkit) | Skills to import, model, read, draw and move worlds and to build tools on them. A Claude Code plugin; other agents can read its skill files. |
| With a key | [API reference](/docs/development/api-reference), [TypeScript](/docs/development/typescript) and [Python](/docs/development/python) | The world's key, read over the REST API or through the npm or Python package. Write access takes the PIN or a seat. |
| Over MCP | [MCP server](/docs/development/mcp) | A hosted Model Context Protocol server. Schema tools need no key, a key adds reads, a write key and PIN add writes. |
| Inside the world | [Agent seats](/docs/development/agents) | A seat makes an agent a member of a world (a member makes it for their own AI, or the owner sends a join link), with its own key and, by default, its own Character. Its writes carry its name, and a human answers for it. |

The five combine. An agent in Claude Code can carry the toolkit, connect over MCP, and hold a seat in a world at the same time.

## In a chat

The [LLM guide](/docs/development/llm-guide) is a single text file, [ow_llm_guide.txt](https://onlyworlds.github.io/assets/ow_llm_guide.txt). Give it to a chat assistant (ChatGPT, Claude, or a browser builder such as Lovable or Replit) and it can help you plan and build a tool on OnlyWorlds. For full field definitions, point the assistant at the [schema](/docs/schema/) or at `FIELD_SCHEMA` in the [SDK](/docs/development/typescript).

**OnlyWorldsBot** is a ChatGPT custom GPT preloaded with knowledge of the standard, for worldbuilding questions and for converting existing content into the OnlyWorlds format: [chatgpt.com/g/g-dydgDFnOz-onlyworldsbot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot).

**Pages as Markdown.** An agent can read both sites as Markdown:
- **This site:** every page has a Markdown copy at the same path with `.md`, and [llms.txt](/llms.txt) lists them.
- **onlyworlds.com:** every public page answers as Markdown when the request's `Accept` header prefers `text/markdown`, except the interactive API docs (`/api/docs`) and the MCP endpoint (`/mcp`, which serves a browser its page and answers any other `GET` with `405`), and it has its own [llms.txt](https://www.onlyworlds.com/llms.txt).

## In a coding agent

The [toolkit](/docs/development/toolkit) is a Claude Code plugin whose skills follow the life of a world: structure it, grow it, play in it and keep it true, move it, build on it. It works on a world folder with no account; an OnlyWorlds account world over the API is optional.

Install it in Claude Code:

```bash
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
```

Restart Claude Code to load it. Other coding agents (Cursor, Codex, Copilot and the like) take the skills with `npx skills add OnlyWorlds/toolkit`, or read the skill and knowledge files straight from [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit).

## With a key: the API or an SDK

An assistant or agent given a world's key reads it over the [REST API](/docs/development/api-reference) or through the [npm](/docs/development/typescript) or [Python](/docs/development/python) package. A read-only key (`ow_r_`) needs no PIN and is the one to give a tool that only reads. Writes take an `ow_w_` key with the PIN, or an [agent seat](/docs/development/agents), which gives the agent its own key and secret to use in place of the PIN. Two demo keys read public sample worlds with no account: `0000000000` and `0000000001`.

## Over MCP

The [MCP server](/docs/development/mcp) at `https://www.onlyworlds.com/mcp` lets an MCP client read and write worlds with nothing to install. In Claude Code:

```bash
claude mcp add --transport http onlyworlds https://www.onlyworlds.com/mcp
```

Add your key and PIN as headers to reach your own world. There is no delete tool, on purpose: an assistant can create and edit, and deleting stays with you, in the REST API and on onlyworlds.com.

## Inside the world

An [agent seat](/docs/development/agents) makes an AI agent a member of a world. Any member makes one for their own AI on the world's page, or the owner sends a join link that the agent redeems; either way it gets its own key and, by default, a Character that is it. Agents in the same world talk through in-world messages, and [ow_wire.py](https://www.onlyworlds.com/agents/ow_wire.py) is a one-file client for them.

## What changed since your last visit

An agent that visits a world on a schedule ("check the world for me every morning") asks one question first: what changed since I was here? The [change feed](/docs/development/api/changes) answers it with no extra route, as long as the agent keeps its cursor. Every row carries who made the change and through which door (`changed_by`, `changed_via` on an upsert's element; `deleted_by`, `deleted_via` on a delete), so the agent can tell a colleague's edit from another AI's.

The recipe: store the cursor from the last page you read; next visit, walk from it until `has_more` is false; store the new cursor. The first visit has no cursor and walks the whole world once, which is a full export; an agent that only steps in (reads the charter, its messages, then searches) can instead take `?head=true` once and keep that as its cursor, so its first "what changed" is from now on. With the Python package:

```python
import json, pathlib
from onlyworlds import Client

client = Client("0000000001")  # your own world's key works the same
state = pathlib.Path("cursor.json")
since = json.loads(state.read_text())["cursor"] if state.exists() else None
rows = []
while True:
    page = client.changes(since=since)
    rows.extend(page["changes"])
    since = page["cursor"]
    if not page["has_more"]:
        break
state.write_text(json.dumps({"cursor": since}))
for row in rows:
    who = row["element"].get("changed_via") if row["op"] == "upsert" else row.get("deleted_via")
    print(row["op"], row["type"], row["id"], who)
```

The same walk over MCP is the `get_changes` tool, and in the npm package `changes()` with the cursor passed back as `since`. Treat the cursor as opaque; it never expires. "Since yesterday" by the clock is `?after=<ISO time>` on the same feed (since 2026-10-22): the rows made at or after that time, in the same order with the same cursor, so a window is walked by passing the cursor back as `since` with the same `after`; in Python `walk_changes(after=...)`, in the npm package `changesAll(since, { after })`. A kept cursor is still the exact form, because it names what you have and have not seen; `after` answers a clock, and a change made twice in the window shows once, at its latest state.

## Ask your world, without a key of your own

For an app that wants to answer a question about a world without the user bringing their own model key, OnlyWorlds runs a small proxy: `POST /api/v2/account/ask`, with an account credential (`Authorization: Bearer ow_a_…`, a signed-in session, or an app client's `X-Session-Token`). The app does the search itself and sends the question (1 to 500 characters) with the elements it found, as text (1 to 8, at most 2,000 characters each and 12,000 in all); the proxy answers from those elements only, through a fast model, and says "The world doesn't say." when they do not hold the answer. The account must own the world or be a member of it. In TypeScript, the SDK's [`lookupWorld` and `renderElement`](/docs/development/typescript-readers#find-elements-in-a-world) do the search and write those texts.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/ask" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{"world_id": "…", "question": "Who holds Balkonon?",
       "context": ["Mira Thel (character)\ndescription: Holds the fort of Balkonon."]}'
```

`200` answers `{answer, model, stop_reason, usage: {input_tokens, output_tokens}, remaining, tokens_remaining, token_rating, paid_by}`. Each account has a daily token rating (100,000 tokens a day to start; early members have more), shared by asking, sorting and the Council. A call spends the tokens it actually used, input and output together. `token_rating` is that daily rating, `tokens_remaining` what is left of it today, and `remaining` how many more calls of this size still fit. A call needs at least its output cap left (1,024 tokens for an ask); short of that, `429` [`quota_exceeded`](/api/errors/#quota_exceeded) with `Retry-After` to midnight UTC, when the day's spending resets. When the proxy is switched off or paused for the day, `503` [`ask_unavailable`](/api/errors/#ask_unavailable); when the model gives no answer, `502` [`ask_failed`](/api/errors/#ask_failed). Neither spends anything. To read the token rating before a call, `GET /api/v2/account/allowance` (the same credential) answers `{token_rating, tokens_used_today, tokens_remaining, resets_at, own_key}` and spends nothing; in TypeScript, `account.allowance()`.

**Your own AI key.** An account can save its own Anthropic or OpenAI key on its [account page](https://www.onlyworlds.com/account/settings), under the token rating; the server checks it before saving, keeps it encrypted and shows only its last four characters. Once the day's token rating is spent, that account's asks and sorts run on its own key, billed by the provider, instead of answering `429`. `paid_by` on each answer says who paid: `rating`, or `own_key` (the rating's fields are then as they were), and the allowance's `own_key` is `{provider}` (`anthropic` or `openai`) when a key is saved, else `null`. A key the provider refuses (revoked, wrong, or out of credit) answers `422` [`own_key_refused`](/api/errors/#own_key_refused): nothing is counted and the call is not retried on the platform's key, so send the person to the account page to check or replace it, and do not retry. In TypeScript (SDK 4.131.0): `answer.paid_by`, `allowance.own_key`, and `err.isOwnKeyRefused`. The proxy keeps no questions and no answers; it records only how many questions an account asked and the tokens they took.

### Sort notes into a world

The same proxy turns loose notes into changes for the user to review: `POST /api/v2/account/sort`, with the same credential. The app sends the notes (1 to 8, each text up to 4,000 characters and 16,000 in all, or `{text, image_url}` with a picture already uploaded into this world, at most four) and a `slice`: up to 100 elements its own search found for them, each `{id, type, name, anchor?}`. One bad slice item refuses the whole sort with a `422` naming `slice`: a type that is not one of the 22, a name that is empty or over 200 characters, an anchor over 120.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/account/sort" \
  -H "Authorization: Bearer ow_a_…" -H "Content-Type: application/json" \
  -d '{"world_id": "…", "notes": ["Mira moved to Ostvik."],
       "slice": [{"id": "…", "type": "character", "name": "Mira Thel"},
                 {"id": "…", "type": "location", "name": "Ostvik"}]}'
```

`200` answers `{rows, not_proposed, model, stop_reason, usage, remaining, tokens_remaining, token_rating, paid_by}` (the token rating fields and the own key as for an ask). Each row is one of four kinds, with the `source_line` it came from: `make` (a new element: type, name, description), `add_to` (text to append to a field of a slice element), `link` (one slice element to another through a field) and `ask` (a question with `candidates`, when a name matches several elements or the sorter is unsure; its optional `then` is the `add_to` or `link` the user's pick completes). Every id in a row is from the slice, and names come from the slice too; a row naming anything else moves to `not_proposed` with its reason, as do lines the sorter could not place. At most 40 rows. Nothing is written: the app applies what the user accepts. A sort spends its tokens from the same token rating, with the same errors, and needs 4,096 tokens left; a failed sort (no answer from the model, or one the server cannot read) spends nothing. In TypeScript: `account.sort({ worldId, notes, slice })` (SDK 4.18.0).

### The AI door: a use by name

Asking and sorting also run through one door, where a tool names a use instead of sending a prompt: `POST /api/v2/account/ai/ask` and `POST /api/v2/account/ai/sort`, with the same credential and the same request bodies as the two routes above. The answer is the route's own plus `use_remaining`: the calls to this use the account has left today, or `null` when the use has no daily ceiling and the token rating is the only limit. The routes above keep working as they are.

`GET /api/v2/account/ai` lists the uses this server runs and spends nothing: for each, its `slug` (its name in the route), `owner`, `provider`, `model`, `effort`, `prompt_sha256` (two calls with the same hash ran the same prompt), `needs_world`, `input_caps`, `output_cap`, `structured`, `price_tokens` (a fixed price per call in rating tokens, or `null`), `ceiling` (calls per account per UTC day, or `null`), `calls_left` (this account's, today) and `on`. `on` is false while the server runs no AI, while the use is switched off, or once the use has spent its own budget for today; its calls then answer `503`. A call can still meet the server-wide pause for the day.

An `Idempotency-Key` header makes a retry safe: the same key and the same body bytes answer the first answer again and bill nothing, its meter included, so read [`/allowance`](#ask-your-world-without-a-key-of-your-own) for today's numbers after a replay. Only a `200` is kept; after a refusal the same key runs again. The door's refusals, each with `param: "use"`: `429` [`use_ceiling`](/api/errors/#use_ceiling) (today's calls to this use are made; retry after midnight UTC), `429` [`use_in_flight`](/api/errors/#use_in_flight) (another call to this use is still running for this account; retry after a few seconds) and `503` [`ask_unavailable`](/api/errors/#ask_unavailable) (this use is switched off or has spent its own budget today). The token rating's refusals are the same as above. Nothing is counted on any refusal.

**A token for the AI door only** (since 2026-11-09). A tool that only needs to ask or sort for a person can hold a token that opens nothing else. It asks for one in [the sign-in's code exchange](/docs/development/api/signin#an-ai-door-token) with `ai_uses`, or mints one from an account token it already holds: `POST /api/v2/account/tokens` with `{"ai_uses": ["ask"]}` (1 to 8 uses, by slug), answered like any minted token, with `audience: "ai"` and `ai_uses`. It is an `ow_a_` token that calls `GET /api/v2/account/ai` and the uses it names, as its account and on that account's token rating. A use it does not name answers `403` [`use_not_granted`](/api/errors/#use_not_granted), and every other route `401` [`wrong_audience`](/api/errors/#wrong_audience). It ends at the next midnight UTC, or sooner with `ai_lifetime_minutes` (1 to 1440), and then answers `401` `key_revoked`. It can revoke itself with `DELETE /api/v2/account/tokens/{its id}` and nothing else. Revoking it leaves every other token as it was. One minted with an account token goes when that token is revoked; one from the sign-in does not.

A `409` `idempotency_in_flight` on a key means its first call is still running: retry with the same key and body after `Retry-After`, a few times at most, and never under a new key to get past it. When the server could not store an answer, its key stays in flight for a day although the call ran and was billed, so a new key would pay a second time.

In the [TypeScript SDK](/docs/development/typescript) (4.137.0 on), `client.aiUses()` reads the list and `client.ai('ask', body, { idempotencyKey })` calls a use with its body as above (`world_id`, `question`, `context`); the answer adds `wasReplay`, read from the `Idempotent-Replay` header. `err.isUseCeiling` and `err.isUseInFlight` tell the door's two `429`s apart. The SDK never retries on its own. The Python package has no account calls yet.

## The same data everywhere

Every path reaches the same worlds. The MCP server is generated from the same schema registry and service layer as the [World API](/docs/development/api-reference), so a read or write through MCP is identical to the same operation through `/api/v2/`. The API's full reference is interactive at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).
