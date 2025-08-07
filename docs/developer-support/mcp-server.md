---
layout: default
title: MCP Server
parent: Developer Support
nav_order: 4
---

# MCP Server

Integrate OnlyWorlds with AI assistants using the Model Context Protocol.

## What is MCP?

The Model Context Protocol allows AI assistants like Claude to directly interact with OnlyWorlds data. This enables:
- Natural language world queries
- Automated element creation
- AI-powered world analysis
- Integration with AI workflows

## Installation

### For Claude Desktop

1. Install via npm:
```bash
npm install -g @onlyworlds/mcp-server
```

2. Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "onlyworlds": {
      "command": "npx",
      "args": ["@onlyworlds/mcp-server"]
    }
  }
}
```

## Available Resources

The MCP server provides:
- **Schema Summary**: Compact list of all element types and fields
- **API Access**: Direct world data manipulation
- **Query Tools**: Search and filter elements

## Usage Examples

Once installed, you can ask Claude:
- "Show me all characters in my world"
- "Create a new location called Crystal Cave"
- "Find all events involving Elena"
- "Analyze the relationships in my world"

## Learn More

- [MCP Server Repository](https://github.com/OnlyWorlds/mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io)
- Visit [onlyworlds.com/mcp/](https://www.onlyworlds.com/mcp/) for details