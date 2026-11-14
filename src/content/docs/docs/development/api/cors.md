---
title: CORS
description: Calling the OnlyWorlds API from a browser page on any origin, and which headers a page may send and read.
---

Browser code may call the API directly from a page on any origin, a page opened from disk included. The key in the request decides what it may do. Server-side code, scripts and curl are not affected by CORS.

<a id="allowed-origins"></a>

## Origins

Every route under `/api/` (the API, the v1 adapter and the Council's routes) answers any origin, and a page opened from disk, whose origin is `null`, too (since 2026-11-14). The answer names the request's own origin in `Access-Control-Allow-Origin`, never `*`. So a page on your own domain, on any host, or on your machine reads a world with its key.

The site's own pages on onlyworlds.com are not the API and keep a short list of origins of their own; nothing there is meant to be called from another page.

## Headers

- **Request headers** a browser may send: `API-Key`, `API-Pin`, `Idempotency-Key`, `If-Match`, `Content-Type`, `Authorization`, `X-Session-Token`, `X-OW-Agent`, `X-OW-Client` and `If-None-Match`, and the common `Accept`, `Accept-Encoding`, `DNT`, `Origin`, `User-Agent`, `X-CSRFToken` and `X-Requested-With`.
- **Response headers** a browser may read, besides the standard ones: `Retry-After`, `Idempotent-Replay`, `X-OW-Schema-Version`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` and `ETag`. `X-OW-Schema-Version` is the version of the standard the server speaks (the API's own version is the `v2` in the path); the three rate-limit headers let a page pace itself ([Limits](/docs/development/api-reference#limits)); a page sends `ETag` back as `If-None-Match` ([Walking the feed](/docs/development/api/changes#walking-the-feed)).
- **Credentials** (cookies) are not allowed. The API authenticates by header, so no browser client needs them.
- Preflight answers may be cached for a day.

A `503` [`server_busy`](/api/errors/#server_busy) also carries the CORS headers, so browser code can read its `Retry-After`.

:::caution
A key in browser code is visible to anyone who opens the page. Ship only an `ow_r_` read key in a public page, and keep write keys and PINs out of it.

Any page may call the API, so the origin is no protection: the key decides what a request may do. See [Keeping credentials safe](/docs/getting-started/keys#keeping-credentials-safe).
:::
