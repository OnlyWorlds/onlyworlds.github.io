---
layout: default
title: ai tooling
parent: development
nav_order: 4
---

### General Development

The OnlyWorlds API functions as a headless backend, enabling rapid tool and game development without managing database or authentication infrastructure. AI coding assistants (Claude Code, Cursor) work best when provided schema and API context through the MCP server or by accessing the SDK in the editor.

 
### OnlyWorldsBot 

**Access**: [chatgpt.com/g/g-dydgDFnOz-OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-OnlyWorldsBot)

General-purpose GPT for OnlyWorlds information and development assistance.

Can parse any text into OnlyWorlds-compatible structured data.


 
### OnlyWorldsParseBot 

**Access**: [chatgpt.com/g/g-68e266c5ac3c81919a28a671d3727936-onlyworldsparsebot](https://chatgpt.com/g/g-68e266c5ac3c81919a28a671d3727936-onlyworldsparsebot)

Experimental GPT that is specialized in parsing, using GPT 5 thinking mode. Uses a different approach than OnlyWorldsBot, and is still under development: mileage may vary. 

 
### MCP Server

Provides AI assistants with direct access to schema, API documentation, and development resources. Details and setup at [onlyworlds.com/mcp](https://onlyworlds.com/mcp).


#### Includes

- **Schema Summary** (`schema://summary`) - Compact list of all element types and fields (6KB)
- **API Endpoints** (`api://endpoints`) - All endpoints with examples
 