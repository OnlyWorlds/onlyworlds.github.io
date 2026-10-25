---
title: Sign in with OnlyWorlds
description: How a registered tool signs a person in through onlyworlds.com and gets an account token, and how consent is given and withdrawn.
---

A tool can sign a person in through onlyworlds.com instead of asking for their email and password. The tool sends the browser to onlyworlds.com, the person signs in there (and the first time presses Continue), and the browser comes back to the tool with a code. The tool trades the code once for an `ow_a_` [account token](/docs/getting-started/keys#account-tokens). The tool never sees a password.

It is OAuth 2.1's authorization code flow with PKCE (`S256`), for public clients: no client secret, no refresh token, no scopes. The token is an ordinary account token, with the same reach as one the person mints themselves. It adds a door and replaces nothing: email and password, and world keys, keep working.

## Registered tools

Only a registered tool can sign a person in. `GET /api/v2/auth/clients` lists them, with no credential:

```bash
curl -s "https://www.onlyworlds.com/api/v2/auth/clients"
```

```json
{ "clients": [ { "id": "atlas", "name": "Atlas",
    "redirect_uris": ["https://atlas.onlyworlds.com/signin/callback"] } ] }
```

| Field | Meaning |
|:--|:--|
| `id` | The `client_id` the tool sends |
| `name` | The tool's name, as the Continue page and the token's name show it |
| `redirect_uris` | The exact return addresses: a `redirect_uri` must equal one of them byte for byte |

The answer is sent `Cache-Control: public, max-age=60`, so a removed address stops being served within a minute. The list is kept by OnlyWorlds; no route adds to it. Every return address is `https://`. Tools that run on your own machine with a loopback address (`http://127.0.0.1`) are a later kind of client, not registered yet.

## Sending the person to sign in

The tool sends the browser to `https://www.onlyworlds.com/signin/authorize` with five query parameters:

| Parameter | Meaning |
|:--|:--|
| `client_id` | The tool's `id` in the registry |
| `redirect_uri` | One of that tool's registered return addresses, byte for byte: no tolerance for a trailing slash, a case change or an added query |
| `state` | The tool's own opaque value, up to 1024 characters, sent back untouched |
| `code_challenge` | The PKCE challenge: the base64url SHA-256 of a verifier the tool keeps |
| `code_challenge_method` | `S256`. `plain` is refused |

What the person sees:

- **Signed in, and has pressed Continue for this tool before:** nothing. The browser goes straight back to `redirect_uri?code=…&state=…`.
- **Signed in, the first time for this tool:** one page asking whether the tool may sign in as them, with Continue and Cancel. Continue sends the code back; Cancel sends `redirect_uri?error=access_denied&state=…`.
- **Not signed in:** the sign-in page first, then the same.

A request onlyworlds.com cannot trust is never redirected. An unknown `client_id`, a `redirect_uri` not on that tool's list, a missing or `plain` challenge method, a missing challenge or `state`, or a parameter named twice answers a `400` page on onlyworlds.com that says what is wrong, with no `Location` and no code. Every answer from this page, the redirect included, is sent `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.

## Trading the code

The tool's return page checks that `state` is the one it sent, then posts the code once to `POST /api/v2/auth/token`, as JSON, with no credential:

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/auth/token" \
  -H "Content-Type: application/json" \
  -d '{ "grant_type": "authorization_code", "code": "…", "code_verifier": "…",
        "client_id": "atlas", "redirect_uri": "https://atlas.onlyworlds.com/signin/callback" }'
```

| Field | Meaning |
|:--|:--|
| `grant_type` | `authorization_code` |
| `code` | The code from the return address |
| `code_verifier` | The PKCE verifier, 43 to 128 characters, whose S256 hash was the `code_challenge` |
| `client_id`, `redirect_uri` | Exactly as the authorize request sent them |

```json
{ "token": "ow_a_…", "token_id": "…", "token_type": "bearer", "account": { "id": "…", "username": "…" } }
```

The answer is sent `Cache-Control: no-store`. `token` is shown only here: the tool keeps it and sends it as `Authorization: Bearer ow_a_…` on the [account routes](/docs/getting-started/keys#account-tokens), such as [managing members](/docs/development/api/members#managing-members). On the person's account page, under Account tokens, it is listed by the tool's name and the browser (`Atlas on Firefox`), and they can revoke it there. `token_id` (since 2026-10-25) is the token's id: a tool done with the token revokes it with `DELETE /api/v2/account/tokens/{token_id}`, sending the token itself as the bearer. That revoke withdraws the tool's consent too ([Consent and revoking](#consent-and-revoking)).

**A code lives 60 seconds and is spent by its first exchange,** whether that succeeds or fails. A code sent again is refused and also revokes the token its first exchange minted: a replayed code is treated as a stolen one. So take `code` out of the address bar before the exchange, and send the exchange before any other request: a reload would spend the code on a refusal.

## Errors

| Status | Code | When |
|:--|:--|:--|
| `400` | [`invalid_grant`](/api/errors/#invalid_grant) | The code is unknown, used, expired, or was issued for another `client_id`, `redirect_uri` or `code_verifier`. One body for every case, byte for byte. Start the sign-in again |
| `422` | [`invalid_request`](/api/errors/#invalid_request) | The body is not JSON (a form-encoded body included) or not an object, a field is missing or not text, or `grant_type` is not `authorization_code`. `param` names it. A code sent with it is spent |
| `429` | [`rate_limited`](/api/errors/#rate_limited) | Too many sign-in attempts from this address: this route and the password sign-in share one count, 40 in 5 minutes. Wait the `Retry-After` seconds |
| `429` | [`too_many_requests`](/api/errors/#too_many_requests) | Over the request budget, as on every route ([Limits](/docs/development/api-reference#limits)) |

The authorize page's refusals are pages, not API errors: see [Sending the person to sign in](#sending-the-person-to-sign-in).

## Consent and revoking

The Continue page appears once per account and tool. After that, the tool's sign-ins pass with no page until the consent is withdrawn, which happens in two ways:

- **Revoking the tool's token.** Revoking a token a tool got through Sign in with OnlyWorlds, on the account page or with `DELETE /api/v2/account/tokens/{token_id}`, withdraws that tool's consent: its next sign-in shows the Continue page again. The revoke a replayed code causes does the same.
- **A tool taken off the registry.** It loses every person's consent at the next deploy of onlyworlds.com. If it is ever listed again, each person is asked again.

What ties a token to its tool is how it was minted, never its name. Revoking a token you minted by hand on the account page changes no consent, even when it is named like a tool's. Revoking a token that is already revoked withdraws nothing.

## In the SDK

The [TypeScript SDK](/docs/development/typescript) has both halves, from 4.46.0, on a client with no key (`new OwV2Client()`):

- **`signInWithOnlyWorlds({ clientId, redirectUri, resume, storage })`** mints `state` and the verifier, keeps them under the client id in `storage`, and sends the browser to the authorize page (`navigate: false` only returns the URL). `redirectUri` is the registered address as a string, `https:` only, never built from `location.origin`. `resume` is small JSON the tool wants back after the redirect, such as an open link or a pending join code.
- **`completeSignIn({ clientId })`** runs on the return page. It checks `state` and that the page is the registered address, takes `code` and `state` out of the address bar, trades the code, and returns `{ token, tokenId, tokenType, account, resume }` (`tokenId` since 4.73.0, null from a server that does not send it). A refusal is an `OwSignInError` whose `reason` is `state_mismatch` (nothing was sent), `invalid_grant`, `rate_limited`, `offline` or `failed`.

`storage` is any object with `get`, `set` and `remove`. It defaults to the browser's `sessionStorage`; in Node it must be passed. The SDK keeps no token: the pending record is cleared on success and on refusal, and the token is the tool's to store. The [Python package](/docs/development/python) has no sign-in calls: a local tool needs the loopback kind of client, which is not registered yet.
