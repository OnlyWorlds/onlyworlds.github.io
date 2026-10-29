---
title: List your tool
description: How a tool built on OnlyWorlds gets listed, what we read, and the free-core rule.
---

Anyone can build a tool on OnlyWorlds now, with no sign-up: the [API](/docs/development/api-reference), the [SDKs](/docs/development/packages) and these docs are public. Being **listed** is a step further: we read your tool against seven lines, and its row in [the list](https://github.com/OnlyWorlds/tools/blob/master/tools.json) says what we read and when. Listed rows show on [onlyworlds.com/tools](https://www.onlyworlds.com/tools) with their listed date: in the tool's own card when the page already features it (matched by its URL), otherwise under Tools others build.

**[Submit your tool](https://github.com/OnlyWorlds/tools/issues/new?template=list-a-tool.yml)**: a form on GitHub, public, like the answer it gets. Never put a key, a PIN or a world's data in it.

## Three rungs

| Rung | What it means | Who decides |
|---|---|---|
| **Built on OnlyWorlds** | reads or writes worlds through the API, world folders or MCP, and names itself | nobody: a convention anyone may follow |
| **Listed** | read against the seven lines below, every one passed, on a date | the OnlyWorlds maintainer, tool by tool |
| **Signed in** | people can [sign in with OnlyWorlds](/docs/development/api/signin) to it | the maintainer, per tool, after it is listed |

A tool climbs in that order: nothing is signed in that is not listed, and nothing is listed that is not built.

## What we read

1. **It is what it says.** The URL serves the tool. The source is public, or your submission says why not. Your row on onlyworlds.com/tools shows the source after the maker: a link when `source` in the list's `tools.json` is an https address, or "source: not public." followed by the row's `source_note`, the reason, when it has one.
2. **Keys stay with the person.** The key and PIN someone gives your tool are kept on their device or in their own environment, never on your server.
3. **It names itself.** Your writes send a client name (`X-OW-Client`, see [Writes](/docs/development/api/writes#agent-writes)), your own fields sit under an `x_<tool>_` prefix (Atlas keeps its older `atlas_`, which the server keeps as written), and folders you make carry the `producer` line.
4. **It speaks the wire.** Your calls are ones the [API document](https://www.onlyworlds.com/api/docs) describes; a folder you write passes the folder lint; an `.owworld` file you write opens in the reference reader.
5. **It says what leaves the machine.** One sentence: what world data goes where (your server, a model provider, nowhere).
6. **The host answers.** Read from outside, signed out: https and its certificate, no dangling domain, the other hosts your first page loads from. We never go past the first click.
7. **Its core is open and free.** What your tool is for works for anyone, without paying and without an invite: opening, reading and changing a world. Extras can cost (hosting, models, exports, premium views). Your submission names the free core and the paid parts.

Lines 2 and 5 can't be seen from outside, so a row marks them **claimed** (you said so), or **read in source** when your source is public and we read it. Every line carries the date it was read.

What a listing does not claim: that a tool is good, safe beyond these seven lines, or maintained. The date says when it was last true.

## Open with

A listed tool can also say how a link opens a world, or one element of it, in the tool: an address with `{world}` for the world's id and `{id}` for the element's, on the tool's own host, and what a person needs first (signed in, or the world already in the tool). It is the row's `open` key in `tools.json` ([its shape](https://github.com/OnlyWorlds/tools#open-with)), the one source OnlyWorlds' Open with menus move onto, surface by surface, offering listed tools only. Atlas's is `https://atlas.onlyworlds.com/#/open/{world}/element/{id}`. The form has a field for it; a listed tool can send it later.

The whole list is also served as JSON at [`https://www.onlyworlds.com/tools.json`](https://www.onlyworlds.com/tools.json) (since 2026-10-29), so a tool can read it at run time. Any origin may fetch it (`Access-Control-Allow-Origin: *`), it is cached for an hour, and its `ETag` answers a matching `If-None-Match` with a `304`.

## After it is listed

We read listed tools again from time to time and whenever someone reports a problem. Taking a tool off the list is a person's decision, never an automatic check's. A delisted row stays, with its date and why.

## Before you submit

- Send your client name on writes: `new OwV2Client({ ..., client: 'mytool' })` in [TypeScript](/docs/development/typescript), `Client("ow_w_...", "1234", client="mytool")` in [Python](/docs/development/python).
- Keep your tool's own fields under `x_mytool_`: they round-trip as written, while an unknown key with no prefix is refused on write ([Writes](/docs/development/api/writes#field-rules)).
- If your tool runs in a browser on your own domain, check [CORS](/docs/development/api/cors) first.
