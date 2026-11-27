---
title: Stability and deprecation
description: What can change under a tool built on the OnlyWorlds API, how far ahead a removal is announced, and every change announced today.
---

A tool built on the API needs to know what can change under it. This page gives the API's policy in its own words, lists every change that has been announced and has not yet taken effect, and says where an announcement appears.

## The policy

The [API document](https://www.onlyworlds.com/api/v2/openapi.json) states it under "Versions and deprecation":

> The path carries the API's version: `/api/v2` is current. The old `/api/worldapi` (v1) keeps answering for the tools built on it; it is frozen, not developed. New fields and routes arrive without notice and never change what existing fields mean. A field, route or behaviour is removed only after it has been announced on the feedback page's changelog and in this document, at least six months ahead. The `X-OW-Schema-Version` header says which version of the standard shapes a reply.

Read as a client:

- **Additions come without notice.** A new field can appear in any answer, and a new route beside any other. Read the fields you use and pass over the rest.
- **A removal comes with at least six months' notice.** The one change announced so far is a default that changes, and it was announced six months ahead.
- **No end date is announced for the old API.** The [Classic API](/docs/development/api/classic) is frozen and keeps answering; a removal would get the same notice.

What a client may branch on, error codes and field names but never error messages, is under [Stability](/docs/development/api-reference#stability) on the API overview.

## Changes announced

| Announced | Takes effect | What changes | What to do before then |
|:--|:--|:--|:--|
| 2026-11-02 | 2027-05-02 | `GET /api/v2/character/{id}/context`, the [draught](/docs/development/api/draught#compact): its default becomes the compact packet. A request that leaves `compact` out is answered as if it had sent `compact=true`: empty sections are left out, and so is every empty field of an element ([the announcement](https://www.onlyworlds.com/changelog#site-draught-compact-default-announced)). | Send `compact=false` if your code needs every section and every field present. The TypeScript SDK from 4.128.1 and the Python package from 0.103.1 send `compact=false` when you leave the option out; an older version sends nothing and gets the compact packet from that day. |

That is every change the API document announces. Nothing in it is marked `deprecated`. Both sentences are compared with the document each time this site deploys.

## Where an announcement appears

- **The site's [changelog](https://www.onlyworlds.com/changelog)**, which the [feedback page](https://www.onlyworlds.com/feedback) links. Each entry has a link of its own.
- **The API document**, in the description of the route or parameter that changes.
- **This page's table** and the [developer changelog](/docs/changelog), which follow the document.

### Watching the API document

A tool that watches the document reads it like this: ask for gzip (it is about 3 MB plain, about 300 KB compressed), keep the `ETag` the answer carries, and send it back on the next read in `If-None-Match` exactly as received (it may arrive weak, `W/"…"`; keel accepts either). An unchanged document answers `304` with no body; it also serves `Cache-Control: public, max-age=300`, so nothing is gained by reading it more often than every five minutes.

## The standard, the packages and this site

The policy above is the API's. Around it:

- **The standard**, the element types and their fields, changes in public, by motion and vote, at [council.onlyworlds.com](https://council.onlyworlds.com). A change there that drops or renames a field reaches the API under the same rule: the motion decides what the standard says, and the API keeps answering the old field until its removal has been announced six months ahead. The `X-OW-Schema-Version` header says which version of the standard shapes a reply. A field a motion adds arrives without notice.
- **The TypeScript SDK and the Python package** make the API's promise in their own terms. A patch release fixes and a minor release adds; neither removes nor renames a public name. A name that will go is marked first: in TypeScript with `@deprecated`, in Python in its docstring, and a Python function also warns with `DeprecationWarning` when it is called. The mark says since which release, what to use instead where something replaces it, and the release it leaves in. The name stays for at least six months after that release and goes only in a major one: SDK 5.0, or onlyworlds 1.0. Both majors are planned for the same day, not before 17 May 2027, six months after the last of the names marked so far; nothing is removed before then. The Python package keeps to this while it is 0.x, although its version number would allow more. A field the standard drops stays in both packages' types, marked deprecated, for as long as the API serves it. A check in each package's CI holds its public names and marks to this on every change. The reference lists [every deprecated name](/docs/development/typescript#deprecated-names) in the SDK with its mark, read from the package's own declarations each time this site builds.
- **This site** keeps its addresses: a page that moves leaves a redirect to the page that replaced it.
