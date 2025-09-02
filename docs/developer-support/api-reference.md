---
layout: default
title: API Reference
parent: Developer Support
nav_order: 3
---

# API Reference

RESTful API for OnlyWorlds data access.

## Base Configuration

**Endpoint**: `https://onlyworlds.com/api/worldapi/`  
**Format**: JSON  
**IDs**: UUIDv7 (time-sortable)

## Authentication

Required headers for all requests:
```
API-Key: {world-specific-key}
API-Pin: {your-account-pin}
```

Get credentials from your [profile](https://onlyworlds.com/profile/) and for a specific world.

## Operations

### Standard CRUD Pattern
All 22 element types support identical operations:

| Method | Path | Purpose |
|:-------|:-----|:--------|
| GET | `/{type}/` | List elements (paginated) |
| POST | `/{type}/` | Create element |
| GET | `/{type}/{id}/` | Get single element |
| PUT | `/{type}/{id}/` | Update element |
| DELETE | `/{type}/{id}/` | Delete element |

### Query Parameters
- `world={uuid}` - Filter by world
- `name__icontains={text}` - Search names
- `supertype={value}` - Filter by supertype
- `limit={n}` & `offset={n}` - Pagination

## Element Types

22 types organized by category:

**Entities**: `character`, `creature`, `species`, `family`, `collective`  
**Places**: `location`, `zone`, `construct`, `map`, `pin`, `marker`  
**Concepts**: `ability`, `trait`, `title`, `language`, `law`, `institution`  
**Content**: `event`, `narrative`, `object`, `phenomenon`, `relation`

## Response Structure

### Base Fields (all elements)
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


