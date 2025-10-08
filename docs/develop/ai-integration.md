---
layout: default
title: ai integration
parent: development
nav_order: 4
---

 
### OnlyWorldsBot (General Assistant)

**Access**: [chatgpt.com/g/g-dydgDFnOz-OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-OnlyWorldsBot)

General-purpose GPT for onlyworlds development and assistance.

 
### OnlyWorldsParseBot (Parsing Specialist)

**Access**: [chatgpt.com/g/g-68e266c5ac3c81919a28a671d3727936-onlyworldsparsebot](https://chatgpt.com/g/g-68e266c5ac3c81919a28a671d3727936-onlyworldsparsebot)

Specialized GPT for parsing prose and converting text into structured onlyworlds data.
Use of 'thinking mode' for GPT-5 has, so far, improved accuracy, but is not strictly necessary.

This GPT should be able to take any text in any format and identify OnlyWorlds elements and their field values. 
 
### MCP Server

Provides AI assistants with direct access to schema, API documentation, and development resources. Full details and setup instructions at [onlyworlds.com/mcp](https://onlyworlds.com/mcp).

### Quick Setup

**Claude Desktop:**
```bash
npx -y @onlyworlds/mcp-client
```

**Cursor (SSE):**
```
https://www.onlyworlds.com/mcp/bridge/
```

**Claude Code:**
```bash
claude mcp add onlyworlds -- npx @onlyworlds/mcp-client
```

### Available Resources

- **Schema Summary** (`schema://summary`) - Compact list of all element types and fields (6KB)
- **API Endpoints** (`api://endpoints`) - All endpoints with examples
 