---
layout: default
title: packages
parent: development
nav_order: 4
---


## NPM Packages

### [@onlyworlds/sdk](https://www.npmjs.com/package/@onlyworlds/sdk)

TypeScript/JavaScript SDK for building web applications and tools. Current version **2.2.2** (speaks the v1 API dialect).

**Install:**
```bash
npm install @onlyworlds/sdk
```

**Features:**
- Complete TypeScript types for all 22 element categories
- Simple CRUD operations (create, get, list, update, delete)
- Automatic relationship handling
- Built-in authentication

### MCP server (hosted — no package to install)

AI-assistant integration is now a **hosted server**, not an npm package. Point any MCP client at `https://www.onlyworlds.com/mcp`.

The old `@onlyworlds/mcp-client` package is retired. See the [MCP setup guide](/docs/development/mcp/).


## Python Package

### onlyworlds

Python SDK for API integration. Needs testing and validation.

**Install:**
```bash
pip install onlyworlds
```

**TestPyPI Version** (pre-release):
```bash
pip install --index-url https://test.pypi.org/simple/ onlyworlds
```

 