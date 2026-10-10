---
title: Images
description: How to host an element's or the world's picture on OnlyWorlds, in three steps.
---

An element's or the world's `image_url` takes any URL. To host the image on OnlyWorlds instead, there are three steps. The API never handles the image itself: it issues a ticket, and a separate upload host takes the bytes.

## 1. Get a Ticket

`POST /api/v2/media/ticket` with a write key and its PIN, and no body. Owner, legacy, member and agent-seat keys all work.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/media/ticket" \
  -H "API-Key: {key}" -H "API-Pin: {pin}"
```

`201`:

| Field | Meaning |
|:--|:--|
| `ticket` | Opaque: send it to `upload_url` as it is |
| `upload_url` | Where the image goes, on `upload.onlyworlds.com` |
| `prefix` | `u/<world_id>/`, the object key prefix this world's uploads land under |
| `max_bytes` | The most this ticket accepts: the per-image limit or what the uploading account has left, whichever is smaller |
| `exp` | Unix seconds after which the ticket is refused |
| `uses` | Always `1`: one ticket, one upload |
| `issued_to` | `{account, membership}`: who answers for the upload |

A ticket is valid for 10 minutes.

## 2. Upload the Bytes

```bash
curl -s -X POST "{upload_url}" \
  -H "Authorization: Bearer {ticket}" \
  --data-binary @shrike.webp
```

The body is the raw image: webp, png, jpeg or avif. The type is read from the bytes; SVG is not accepted. `201`: `{url, key, bytes, type, etag}`.

An optional `X-Key` header names the object yourself. It must start with the ticket's `prefix`, and an existing key is never overwritten.

The upload host is not part of the API and answers errors in its own shape: see [Upload Host Errors](/api/errors/#upload-host-errors).

## 3. Set the Picture

```bash
curl -s -X PATCH "https://www.onlyworlds.com/api/v2/creature/{id}" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "image_url": "{url}" }'
```

For the world's own picture, `PATCH /api/v2/world` with the same body (owner only).

## Removing an Image

An image uploaded with a ticket can be removed by its uploader, or by the world's owner key; an agent seat answers as its sponsor. Removal takes two calls, like the upload.

```bash
curl -s -X POST "https://www.onlyworlds.com/api/v2/media/remove-ticket" \
  -H "API-Key: {key}" -H "API-Pin: {pin}" -H "Content-Type: application/json" \
  -d '{ "key": "u/{world_id}/{name}.webp" }'
```

The `key` is the part of the `image_url` after `https://media.onlyworlds.com/`. The reply is `{ticket, exp, key, referenced}`: a single-use ticket for 10 minutes, and `referenced`, how many of the world's elements still show the image.

```bash
curl -s -X POST "https://upload.onlyworlds.com/v1/remove" \
  -H "Authorization: Bearer {ticket}"
```

`200`: `{removed, bytes, cache}`. The bytes go back to the uploading account's storage.

- **Removing doesn't touch the elements.** Clear or replace their `image_url` yourself; `referenced` says how many there are.
- **A copy can linger.** Images are cached as unchanging, so a copy the network already holds can keep answering for a while after removal. `cache: "may_linger"` says so.
- **Only ticket uploads.** Images uploaded any other way answer `404` [`not_found`](/api/errors/#not_found).
- **One removal at a time.** A second ticket for the same image within 10 minutes answers `409` [`removal_in_flight`](/api/errors/#removal_in_flight), with `Retry-After`.

## Limits

- **200 tickets per world per day.** More is `429` [`quota_exceeded`](/api/errors/#quota_exceeded), with `Retry-After`.
- **1 GB of images per uploading account** by default. Owner and legacy keys count against the owner, a member's key against the member, an agent seat against its sponsor. A full account gets `403` [`storage_full`](/api/errors/#storage_full) and no ticket.
- When image upload is not configured on the server, the ticket route answers `503` [`media_unavailable`](/api/errors/#media_unavailable).

Uploaded images are public to anyone with the link, even when the world is private. They stay until their uploader or the world's owner removes them.
