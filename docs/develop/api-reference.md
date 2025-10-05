---
layout: default
title: api platform
parent: Develop
nav_order: 3
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

Get credentials from your [profile page](https://onlyworlds.com/profile).

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
- `ordering={field}` - Sort results (prefix with `-` for descending)
- `limit={n}` & `offset={n}` - Pagination

### Element Types

22 element categories available via the API:

**Entities**: `character`, `creature`, `species`, `family`, `collective`, `institution`
**Places**: `location`, `zone`, `map`, `pin`, `marker`
**Things**: `object`, `construct`, `title`
**Abstract**: `language`, `law`, `trait`, `ability`, `phenomenon`
**Narrative**: `event`, `narrative`, `relation`

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
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

Element-specific fields vary by type (character has 42 total fields, location has fewer, etc.).

## World Sync API (Bulk Operations)

Legacy endpoint for full world import/export operations.

**Base URL**: `https://onlyworlds.com/api/worldsync/`

**Purpose**: Bulk data transfer, import/export entire worlds

**Format**: Full JSON payloads

Use World API for standard operations. WorldSync is for migration tools and bulk data operations.

## Session API (Web Only)

Browser-based authentication alternative for web applications.

**Base URL**: `https://onlyworlds.com/api/worldapi/session/`

**Authentication**: Session cookies instead of API-Key/API-Pin headers

**Use case**: Web tools where users log in through the browser

Most developers should use World API with API-Key/API-Pin headers instead.

   

## CORS

API allows cross-origin requests from:
- `onlyworlds.com` domains
- `*.pages.dev` (Cloudflare Pages)
- Custom domains configured per request

For custom domain CORS access, contact [info@onlyworlds.com](mailto:info@onlyworlds.com).
