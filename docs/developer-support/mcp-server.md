---
layout: default
title: MCP Server
parent: Developer Support
nav_order: 4
---

# MCP Server

Integrate OnlyWorlds with AI assistants.

## Installation

```bash
npm install -g @onlyworlds/mcp-client
```

Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "onlyworlds": {
      "command": "npx",
      "args": ["@onlyworlds/mcp-client"]
    }
  }
}
```

## Features

- Schema summary for all element types
- Direct API access from Claude
- Natural language queries
- Automated element creation

## Usage

Ask Claude:
- "Show all characters in my world"
- "Create a location called Crystal Cave"
- "Find events involving Elena"
- "Analyze world relationships"

## Resources

- [GitHub Repository](https://github.com/OnlyWorlds/mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Setup Guide](https://www.onlyworlds.com/mcp/)