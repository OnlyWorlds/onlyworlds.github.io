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

Each rung needs the one before it.

## What we read

1. **It is what it says.** The URL serves the tool, and we can read its code: the source is public, or it is private and you give the maintainers read access to the repository, with one sentence on why it is private. A tool whose code we can't read is not listed; you can still build it on OnlyWorlds and offer it anywhere. Your row on onlyworlds.com/tools shows the source after the maker: a link when `source` in the list's `tools.json` is an https address, or "source: not public." followed by the row's `source_note`, the reason, when it has one.
2. **Keys stay with the person.** The key and PIN someone gives your tool are kept on their device or in their own environment, never on your server.
3. **It names itself.** Your writes send a client name (`X-OW-Client`, see [Writes](/docs/development/api/writes#agent-writes)), your own fields sit under an `x_<tool>_` prefix (Atlas keeps its older `atlas_`, which the server keeps as written), and folders you make carry the `producer` line.
4. **It speaks the wire.** Your calls are ones the [API document](https://www.onlyworlds.com/api/docs) describes; a folder you write passes the folder lint; an `.owworld` file you write opens in the reference reader.
5. **It says what leaves the machine.** One sentence: what world data goes where (your server, a model provider, nowhere).
6. **The host answers.** Read from outside, signed out: https and its certificate, no dangling domain, the other hosts your first page loads from. We never go past the first click.
7. **Its core is open and free.** What your tool is for works for anyone, without paying and without an invite: opening, reading and changing a world. Extras can cost (hosting, models, exports, premium views). Your submission names the free core and the paid parts.

Lines 2 and 5 can't be seen from outside, so we read them in your code: a row marks them **read in source** when your source is public, and **read in private source** when it isn't, which tells a reader that nobody outside can check them. A listed row never rests them on your word alone. Every line carries the date it was read.

What a listing does not claim: that a tool is good, safe beyond these seven lines, or maintained. The date says when it was last true.

## Open with

A listed tool can also say how a link opens a world, or one element of it, in the tool: an address with `{world}` for the world's id and `{id}` for the element's, on the tool's own host, and what a person needs first (signed in, or the world already in the tool). It is the row's `open` key in `tools.json` ([its shape](https://github.com/OnlyWorlds/tools#open-with)), the one source OnlyWorlds' Open with menus move onto, surface by surface, offering listed tools only. Atlas's is `https://atlas.onlyworlds.com/#/open/{world}/element/{id}`. A desktop or game app that opens a world itself may use its own registered scheme instead (`myapp://open/{world}`), with the world needed on the device; never `ow:`, the standard's own address scheme. A tool that needs nothing first, not even a sign-in, is offered on a world's public page too. One that needs a sign-in shows there as a grey row that says "Needs an account" and opens nothing (the packages' menu since 4.130.0 and 0.105.0), and one that needs the world on the device is offered to members only. If your links open a public world for a visitor who is not signed in, though a private world needs a sign-in, set `opens_public` to `true` beside `needs: "account"`: the public page then offers your tool as a row that opens (the packages' menu since 4.133.0 and 0.107.0). If your element page does not open some elements (room elements, hidden or proposed ones, Maps, Pins and Markers, reading aids), say which in `element_skips`, so a menu never offers a link that can only fail. If it opens only some kinds of element (only Characters, say), list them in `element_types` (`["character"]`), and the menu offers it on those kinds alone, its world door included; `null` means every kind (the packages' menu since 4.132.0 and 0.106.0). The form has a field for each; a listed tool can send them later.

The whole list is also served as JSON at [`https://www.onlyworlds.com/tools.json`](https://www.onlyworlds.com/tools.json) (since 2026-10-29), so a tool can read it at run time. Any origin may fetch it (`Access-Control-Allow-Origin: *`), it is cached for an hour, and its `ETag` answers a matching `If-None-Match` with a `304`.

## After it is listed

We read listed tools again from time to time and whenever someone reports a problem. Taking a tool off the list is a person's decision, never an automatic check's. A delisted row stays, with its date and why.

## Before you submit

- Send your client name on writes: `new OwV2Client({ ..., client: 'mytool' })` in [TypeScript](/docs/development/typescript), `Client("ow_w_...", "1234", client="mytool")` in [Python](/docs/development/python).
- Keep your tool's own fields under `x_mytool_`: they round-trip as written, while an unknown key with no prefix is refused on write ([Writes](/docs/development/api/writes#field-rules)).
- A tool in a browser may call the API from any domain, its own included ([CORS](/docs/development/api/cors)).
