---
layout: default
title: Packages
parent: Developer Support
nav_order: 2
---

# Packages

Install OnlyWorlds packages for your development environment.

## NPM Packages

### MCP Server
Model Context Protocol server for AI assistants.
```bash
npm install @onlyworlds/mcp-client
```
- Claude integration ready
- Full API access
- Schema validation

### SDK (Coming Soon)
JavaScript/TypeScript SDK for web applications.
```bash
npm install @onlyworlds/sdk
```

## Python Package

### OnlyWorlds Client
Python SDK for API integration.
```bash
pip install onlyworlds
```

```python
from onlyworlds import OnlyWorldsClient

client = OnlyWorldsClient(api_key="your-key", api_pin="your-pin")
characters = client.get_elements("character")
```

**TestPyPI Version** (pre-release):
```bash
pip install --index-url https://test.pypi.org/simple/ onlyworlds
```

## Package Features

All packages include:
- Full CRUD operations
- Type definitions
- Schema validation
- Batch operations
- Error handling

Source code available on [GitHub](https://github.com/OnlyWorlds).