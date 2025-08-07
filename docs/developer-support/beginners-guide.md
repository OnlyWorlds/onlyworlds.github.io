---
layout: default
title: Beginners Guide
parent: Developer Support
nav_order: 2
---

# Beginners Guide

New to OnlyWorlds development? This guide will get you building in minutes.

## Quick Start

### 1. Get Credentials
- Create account at [onlyworlds.com](https://onlyworlds.com)
- Create a test world
- Note your API Key and PIN

### 2. Make Your First API Call

```bash
curl -X GET https://onlyworlds.com/api/worldapi/elements/character/ \
  -H "API-Key: your-world-key" \
  -H "API-Pin: your-pin"
```

### 3. Understand the Structure
- Worlds contain Elements
- Elements have Types (Character, Location, etc.)
- Elements can link to each other
- All data is JSON

## What to Build

### Starter Projects
- **World Visualizer**: Display world stats
- **Element Browser**: Simple CRUD interface  
- **Timeline Viewer**: Show events chronologically
- **Relationship Mapper**: Visualize connections

### Tool Ideas
- Game integrations (Unity, Godot)
- Writing tools (Scrivener, Google Docs)
- Visualization tools (family trees, maps)
- Export tools (PDF, ePub, wiki)

## Getting Help

- Check the [API Reference](../api-reference/)
- Join [Discord](https://discord.gg/twCjqvVBwb) #development channel
- Ask [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot) for code examples

Happy building!