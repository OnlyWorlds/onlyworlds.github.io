---
layout: default
title: Template Tool
parent: Prototype Tools
grand_parent: Tool Directory
nav_order: 5
---
TODO: rename fully to base tool
# Template Tool

Starter template for building OnlyWorlds tools.

**URL:** [onlyworlds.github.io/tool-template](https://onlyworlds.github.io/tool-template/)  
**Source:** [github.com/OnlyWorlds/tool-template](https://github.com/OnlyWorlds/tool-template)  
**Type:** Web Application / Development Template   

---

## Purpose

Dual-purpose tool that serves as:
1. **Development template** - Fork and extend for your own tools
2. **Basic editor** - Functional element editing capabilities

## Features

### As Editor
- Load worlds via API key/PIN
- View and edit all element types
- Single and multi-link field support
- Auto-save functionality
- Clean, minimal interface

### As Template
- ES modules structure
- No build process required
- Clear code organization
- Authentication handling
- API integration examples
- Field rendering patterns

## Getting Started

### To Use
Visit [onlyworlds.github.io/tool-template](https://onlyworlds.github.io/tool-template/) and enter credentials.

### To Build With
1. Fork the [repository](https://github.com/OnlyWorlds/tool-template)
2. Clone to your machine
3. Open index.html in browser
4. Modify to add your features

## Code Structure

```
tool-template/
├── index.html           # Entry point
├── css/
│   └── styles.css      # Minimal styling
└── js/
    ├── app.js          # Main application
    ├── auth.js         # API authentication
    ├── constants.js    # Element definitions
    └── modules/        # Feature modules
```

## Development Tips

- Start by modifying the UI in index.html
- Add new features as modules in js/modules/
- Keep authentication logic in auth.js
- Use constants.js for element type definitions

---

*Perfect starting point for developers new to OnlyWorlds. See [My First Tool](/docs/developer-support/my-first-tool/) guide for step-by-step instructions.*