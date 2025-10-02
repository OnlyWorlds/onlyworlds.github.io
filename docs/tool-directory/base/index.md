---
layout: default
title: Base Tool
parent: Tool Directory
nav_order: 2
---

# Base Tool

TypeScript foundation for building OnlyWorlds tools.

**Repository:** [github.com/OnlyWorlds/base-tool](https://github.com/OnlyWorlds/base-tool)
**Live Demo:** [onlyworlds.github.io/base-tool](https://onlyworlds.github.io/base-tool)
**Type:** Development Template + Functional Tool

---

## What It Is

A complete, production-ready tool that works as both:
1. **Foundation for building** - Fork and extend for custom tools
2. **Functional editor** - Use directly for world editing

Built with TypeScript, OnlyWorlds SDK, and modular architecture optimized for AI-assisted development.

---

## Key Features

### Dual-Mode Operation
- **Online mode** - Connect to OnlyWorlds API with key/PIN
- **Local mode** - Work offline with JSON files in browser storage

### Full Element Support
- Create, read, update, delete for 20 element types
- Inline editing with auto-save
- Relationship management with UUID linking
- Broken reference handling

### Migration Pipeline
- Import AI-parsed world data
- Schema validation with clear error messages
- Name conflict detection (skip/overwrite options)
- Automatic name→UUID resolution

### Developer Features
- TypeScript + full type safety
- Modular CSS (13 files, individually removable)
- GitHub Pages deployment ready
- Unit test setup with Vitest
- Comprehensive modification guide

### Optional Components
- AI chat assistant (OpenAI integration)
- Dark/light theme
- JSON import/export
- Drag-and-drop support

---

## Using Base Tool

### As Direct Editor

1. Visit [onlyworlds.github.io/base-tool](https://onlyworlds.github.io/base-tool)
2. Choose online (API key/PIN) or local mode
3. Edit elements with inline editing
4. Changes auto-save after 2 seconds

### As Development Template

#### Quick Start
```bash
# Use GitHub template feature
1. Click "Use this template" on repository
2. Create your repository
3. Clone locally
4. npm install
5. npm run dev
```

#### Customization Approaches
- **Add features** - Visualizations, game mechanics, AI tools
- **Focus element types** - Character managers, location atlases
- **Remove UI** - Build CLI tools, bots, data processors
- **Replace framework** - React, Vue, Svelte, mobile apps

See [Modification Guide](https://github.com/OnlyWorlds/base-tool/blob/main/MODIFICATION-GUIDE.md) for transformation strategies.

---

## Project Structure

```
base-tool/
├── src/
│   ├── modes/           # Dual-mode system (online/local)
│   ├── services/        # Migration, validation, conflict detection
│   ├── ui/              # Modals, dialogs, column management
│   ├── llm/             # Optional AI chat (removable)
│   └── *.ts             # Core modules (auth, editor, viewer)
├── css/
│   ├── 01-07-*.css      # Core styles (required)
│   └── 08-13-*.css      # Optional features (removable)
├── index.html           # Main entry point
└── package.json         # Dependencies + scripts
```

---

## Technical Details

### Stack
- **Language:** TypeScript
- **SDK:** @onlyworlds/sdk (NPM)
- **Testing:** Vitest
- **Server:** http-server (development)
- **Deployment:** GitHub Pages (automated workflow)

### Browser Support
- Modern browsers with ES modules support
- Desktop-first design (mobile requires redesign)

### Prerequisites
- Node.js 18+
- npm 8+

---

## Resources

- **[Repository](https://github.com/OnlyWorlds/base-tool)** - Source code
- **[Modification Guide](https://github.com/OnlyWorlds/base-tool/blob/main/MODIFICATION-GUIDE.md)** - AI-optimized transformation guide
- **[Developer Guide](/docs/developer-support/my-first-tool/)** - Step-by-step tutorial
- **[API Documentation](https://www.onlyworlds.com/api/docs)** - OnlyWorlds API reference

---

## Support

- **Discord:** [discord.gg/twCjqvVBwb](https://discord.gg/twCjqvVBwb)
- **Issues:** [GitHub Issues](https://github.com/OnlyWorlds/base-tool/issues)
- **Email:** info@onlyworlds.com

---

*Start building immediately with a complete, tested foundation. No setup complexity - just fork and extend.*
