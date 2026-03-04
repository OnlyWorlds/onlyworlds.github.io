---
layout: default
title: world api
parent: development
nav_order: 2
---

A REST API for accessing and updating world data. Interactive docs at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).

**Base URL**: `https://www.onlyworlds.com/api/worldapi/`

**Format**: JSON

**Authentication**: API-Key and API-Pin headers

### Authentication

Required headers for all requests:
```http
API-Key: your-world-api-key
API-Pin: your-account-pin
```

Each API-Key is scoped to one world. Credentials are available at [onlyworlds.com/profile](https://www.onlyworlds.com/profile).

### Standard Operations

All 22 element types support identical CRUD operations. Endpoint names are **singular** (`/character/`, `/location/`, `/institution/`).

| Method | Endpoint | Purpose |
|:-------|:---------|:--------|
| GET | `/{element_type}/` | List elements (supports filtering) |
| POST | `/{element_type}/` | Create new element |
| GET | `/{element_type}/{uuid}/` | Get single element |
| PATCH | `/{element_type}/{uuid}/` | Update element (partial) |
| PUT | `/{element_type}/{uuid}/` | Replace element (full) |
| DELETE | `/{element_type}/{uuid}/` | Delete element |

**Example - List characters:**
```bash
curl -s -X GET "https://www.onlyworlds.com/api/worldapi/character/?world={world-uuid}" \
  -H "API-Key: {key}" \
  -H "API-Pin: {pin}"
```

**Example - Create location:**
```bash
curl -s -X POST "https://www.onlyworlds.com/api/worldapi/location/" \
  -H "API-Key: {key}" \
  -H "API-Pin: {pin}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hyperion",
    "description": "Time Tomb planet",
    "world": "{world-uuid}"
  }'
```

### Query Parameters

- `world={uuid}` — Filter by world
- `search={text}` — Search by name
- `supertype={value}` — Filter by supertype
- `subtype={value}` — Filter by subtype

### Link Fields

Multi-link fields (e.g. linking characters to a location) use different names on read vs write:

| Direction | Field name | Example |
|:----------|:-----------|:--------|
| GET (read) | `characters` | Returns list of linked UUIDs |
| POST/PATCH (write) | `characters_ids` | Send list of UUIDs to link |

Single-link fields use `_id` suffix on write (e.g. `location_id`).

### Response Structure

All elements share base fields:

```json
{
  "id": "01912a3b-4c5d-6e7f-8901-234567890abc",
  "name": "Element Name",
  "description": "Detailed description",
  "world": "01912a3b-4c5d-6e7f-8901-234567890def",
  "supertype": "optional-category",
  "subtype": "optional-subcategory",
  "image_url": "https://example.com/image.jpg"
}
```

Element-specific fields vary by type — see the [schema documentation](https://onlyworlds.github.io/docs/schema/) for details.

## CORS

The API accepts cross-origin requests from a wide range of hosting platforms.

**Pre-approved platforms:**

- **OnlyWorlds domains**: `*.onlyworlds.com` subdomains, `onlyworlds.github.io`
- **Static hosting**: GitHub Pages, GitLab Pages, Cloudflare Pages
- **Modern platforms**: Vercel, Netlify, Render, Railway, Fly.io
- **Traditional hosting**: Heroku, AWS Amplify, Firebase Hosting
- **Quick deploy**: Surge.sh, Glitch
- **Online IDEs**: Replit, CodeSandbox, StackBlitz, CodePen, JSFiddle
- **Local development**: `localhost` and `127.0.0.1` on any port

For custom domain CORS access, contact [info@onlyworlds.com](mailto:info@onlyworlds.com).
