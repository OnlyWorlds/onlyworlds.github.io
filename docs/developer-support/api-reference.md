---
layout: default
title: API Reference
parent: Developer Support
nav_order: 3
---

# API Reference

Complete documentation for the OnlyWorlds API.

## OpenAPI Specification

Full interactive documentation available at:
[https://onlyworlds.com/api/docs](https://onlyworlds.com/api/docs)

## Quick Reference

### Base URL
```
https://onlyworlds.com/api/worldapi/
```

### Authentication Headers
```
API-Key: {world-specific-key}
API-Pin: {your-account-pin}
```

### Common Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/elements/{type}/` | List all elements of type |
| GET | `/elements/{type}/{id}/` | Get specific element |
| POST | `/elements/{type}/` | Create new element |
| PUT | `/elements/{type}/{id}/` | Update element |
| DELETE | `/elements/{type}/{id}/` | Delete element |

### Element Types
`ability`, `character`, `collective`, `construct`, `creature`, `event`, `family`, `institution`, `language`, `law`, `location`, `map`, `marker`, `narrative`, `object`, `phenomenon`, `pin`, `relation`, `species`, `title`, `trait`, `zone`

## Response Format

All responses return JSON:
```json
{
  "id": "uuid-v7",
  "name": "Element Name",
  "description": "Description text",
  "world": "world-uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  // type-specific fields...
}
```

## Rate Limits
- 1000 requests/hour per world
- 10 requests/second burst

See [Using the API](/docs/getting-started/using-the-api/) for examples.