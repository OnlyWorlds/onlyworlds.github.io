---
layout: default
title: world api
parent: development
nav_order: 2
---


OnlyWorlds provides REST APIs at [onlyworlds.com/api/docs](https://onlyworlds.com/api/docs) for accessing and updating world data.

## World API (Primary)

The primary REST API for individual world or element operations.

**Base URL**: `https://onlyworlds.com/api/worldapi/`
**Format**: JSON
**Authentication**: API-Key and API-Pin headers

### Authentication

Required headers for all requests:
```http
API-Key: your-world-api-key
API-Pin: your-account-pin
```

Credentials are available for users at [onlyworlds.com](https://onlyworlds.com/profile).

### Standard Operations

All 22 element types support identical CRUD operations:

| Method | Endpoint | Purpose |
|:-------|:---------|:--------|
| GET | `/{element_type}/` | List elements (supports filtering) |
| POST | `/{element_type}/` | Create new element |
| GET | `/{element_type}/{uuid}/` | Get single element |
| PUT | `/{element_type}/{uuid}/` | Update element |
| DELETE | `/{element_type}/{uuid}/` | Delete element |

**Example - List characters:**
```bash
GET /api/worldapi/character/?world={world-uuid}
```

**Example - Create location:**
```bash
POST /api/worldapi/location/
{
  "name": "Hyperion",
  "description": "Time Tomb planet",
  "world": "{world-uuid}"
}
```

### Query Parameters

- `world={uuid}` - Filter by world
- `name__icontains={text}` - Search by name
- `supertype={value}` - Filter by supertype
- `subtype={value}` - Filter by subtype  
 

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
  "image_url": "https://example.com/image.jpg", 
}
```

Element-specific fields vary by type (character has 42 total fields, location has fewer, etc.).

## World Sync API (Bulk Operations)

Legacy endpoint for full world import/export operations.

**Base URL**: `https://onlyworlds.com/api/worldsync/`

**Purpose**: Bulk data transfer, import/export entire worlds

**Format**: Full JSON payloads

Use World API for standard operations. WorldSync is for migration tools and bulk data operations.



## CORS

OnlyWorlds API accepts cross-origin requests from a wide range of hosting platforms to make it easy to build and deploy community tools.

**Pre-approved platforms:**

- **OnlyWorlds domains**: `*.onlyworlds.com` subdomains, `onlyworlds.github.io`
- **Static hosting**: GitHub Pages, GitLab Pages, Cloudflare Pages
- **Modern platforms**: Vercel, Netlify, Render, Railway, Fly.io
- **Traditional hosting**: Heroku, AWS Amplify, Firebase Hosting
- **Quick deploy**: Surge.sh, Glitch
- **Online IDEs**: Replit, CodeSandbox, StackBlitz, CodePen, JSFiddle
- **Local development**: `localhost` and `127.0.0.1` on any port

For custom domain CORS access, contact [info@onlyworlds.com](mailto:info@onlyworlds.com).
