---
title: CORS
description: Which browser origins may call the OnlyWorlds API directly, and which headers they may send and read.
---

Browser code may call the API directly from the origins below. Requests from any other origin get no CORS headers, so the browser blocks the response. Server-side code, scripts and curl are not affected by CORS.

## Allowed Origins

| Platform | Origins |
|:--|:--|
| OnlyWorlds | `onlyworlds.com`, `www.onlyworlds.com`, `https://*.onlyworlds.com`, `https://onlyworlds.github.io` |
| GitHub Pages | `https://*.github.io` |
| GitLab Pages | `https://*.gitlab.io` |
| Cloudflare Pages | `https://*.pages.dev`, including branch previews (`https://*.*.pages.dev`) |
| Vercel | `https://*.vercel.app`, `https://*.now.sh` |
| Netlify | `https://*.netlify.app`, `https://*.netlify.com` |
| Render | `https://*.onrender.com` |
| Railway | `https://*.up.railway.app` |
| Fly.io | `https://*.fly.dev` |
| Heroku | `https://*.herokuapp.com` |
| AWS Amplify | `https://*.amplifyapp.com` |
| Firebase Hosting | `https://*.web.app`, `https://*.firebaseapp.com` |
| Surge | `https://*.surge.sh` |
| Glitch | `https://*.glitch.me` |
| Replit | `https://*.repl.co`, `https://*.replit.app` |
| CodeSandbox | `https://*.csb.app`, `https://*.codesandbox.io` |
| StackBlitz | `https://*.stackblitz.io` |
| CodePen | `https://codepen.io`, `https://cdpn.io` |
| JSFiddle | `https://jsfiddle.net` |
| Local development | `http://localhost`, `http://127.0.0.1` and `http://[::1]`, on any port |

The `*` stands for one subdomain label: `my-app.vercel.app` is allowed, `preview.my-app.vercel.app` is not. Hosting platform origins must use `https`.

For a custom domain, contact [info@onlyworlds.com](mailto:info@onlyworlds.com).

## Headers

- **Request headers** a browser may send include `API-Key`, `API-Pin`, `Idempotency-Key`, `Content-Type` and `Authorization`.
- **Response headers** a browser may read, besides the standard ones: `Retry-After`, `Idempotent-Replay` and `X-OW-Schema-Version`.
- **Credentials** (cookies) are not allowed. The API authenticates by header, so no browser client needs them.
- Preflight answers may be cached for a day.

A `503` [`server_busy`](/api/errors/#server_busy) also carries the CORS headers, so browser code can read its `Retry-After`.

:::caution
A key in browser code is visible to anyone who opens the page. Ship only an `ow_r_` read key in a public page, and keep write keys and PINs out of it.
:::
