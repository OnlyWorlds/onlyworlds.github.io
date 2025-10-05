---
layout: default
title: mcp server
parent: Develop
nav_order: 4
---


The OnlyWorlds MCP (Model Context Protocol) server gives AI assistants direct access to OnlyWorlds schema, API documentation, and development resources.

## Installation Methods

### Method 1: NPM Package (Recommended)

Install the published package:

```bash
npm install -g @onlyworlds/mcp-client
```

**Links:**
- [NPM Package](https://www.npmjs.com/package/@onlyworlds/mcp-client)
- [GitHub Repository](https://github.com/OnlyWorlds/mcp-client)
- Also listed on [Packages page](packages/)

### Method 2: Direct Connection

Connect directly to the hosted server without installing:

```
https://www.onlyworlds.com/mcp/
```

Use this URL in your MCP client configuration for direct access.

## Configuration

### Claude Code

Add to your Claude Code MCP configuration file:

**Using NPM package:**
```json
{
  "mcpServers": {
    "onlyworlds": {
      "command": "npx",
      "args": ["-y", "@onlyworlds/mcp-client"]
    }
  }
}
```

**Using direct connection:**
```json
{
  "mcpServers": {
    "onlyworlds": {
      "url": "https://www.onlyworlds.com/mcp/"
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "onlyworlds": {
      "command": "npx",
      "args": ["-y", "@onlyworlds/mcp-client"]
    }
  }
}
```

### Cursor IDE

Add to Cursor's MCP settings:

1. Open Cursor Settings
2. Navigate to MCP Servers
3. Add new server:

**Using NPM package:**
```json
{
  "onlyworlds": {
    "command": "npx",
    "args": ["-y", "@onlyworlds/mcp-client"]
  }
}
```

**Using direct URL:**
```json
{
  "onlyworlds": {
    "url": "https://www.onlyworlds.com/mcp/"
  }
}
```

### Windsurf IDE

Similar to Cursor - add to MCP server configuration with either NPM package or direct URL method.

## Available Resources

The MCP server provides:

- **Element Schema**: Complete field specifications for all 22 element categories
- **API Quickstart**: REST API endpoints and authentication details
- **Field Information**: Detailed field types and validation rules
- **Category Icons**: Icon mappings for visual representations
- **Search Tools**: Query schema fields and element types

## Features

### Schema Access
- Get complete field lists for any element type
- Search schema fields across all categories
- Understand field types and relationships

### API Documentation
- Endpoint references for World API
- Authentication patterns (API-Key/API-Pin)
- Query parameter documentation

### Development Support
- Icon mappings for UI development
- Field validation information
- Relationship structure details

## Usage Examples

Once configured, your AI assistant can:

- "Show me the schema for the character element type"
- "What fields are available for locations?"
- "Search for fields related to combat"
- "Get the API quickstart guide"
- "What icons are available for different categories?"

## Supported Platforms

- Claude Desktop (macOS, Windows)
- Claude Code CLI
- Cursor IDE
- Windsurf IDE
- VSCode with MCP extension
- Any MCP-compatible client

## Resources

- [NPM Package](https://www.npmjs.com/package/@onlyworlds/mcp-client)
- [GitHub Repository](https://github.com/OnlyWorlds/mcp-client)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [OnlyWorlds API Docs](https://www.onlyworlds.com/api/docs)

## Troubleshooting

**Server not appearing in Claude:**
- Restart Claude after editing config
- Check JSON syntax in config file
- Verify NPM package is installed globally

**Direct connection issues:**
- Ensure URL is exactly `https://www.onlyworlds.com/mcp/`
- Check firewall settings
- Verify internet connection

**NPX command not found:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart terminal after installation
