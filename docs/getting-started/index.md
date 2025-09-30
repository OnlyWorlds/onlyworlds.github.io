---
layout: default
title: Getting Started
nav_order: 2
has_children: true
has_toc: false
---
 
## Building worlds

Start here if you want to create or convert worldbuilding content.

1. **Create an account** at [onlyworlds.com](https://onlyworlds.com)
2. **Note your PIN** from your profile page
3. **Create a world** and copy its API key
4. **Choose your approach:**
   - **[Your First World](your-first-world/)** - Build Dan Simmons' Hyperion setting from the ground up
   - **[Migration Guide](migration-guide/)** - Convert existing content with free AI parsing (WorldAnvil exports, Google Docs, scattered notes, book text, even photos of handwritten notes)
   - **[Tool Directory](/docs/tool-directory/)** - Browse available tools for different workflows

The web interface handles basic element creation. The Parse Tool and OnlyWorldsBot convert unstructured text into structured OnlyWorlds elements automatically. Specialized tools offer better workflows for specific tasks.

## Developing tools

OnlyWorlds provides a REST API with no licensing requirements. Build whatever you need. The [Template Tool](https://github.com/OnlyWorlds/tool-template) is designed for extension by LLMs—anyone can build custom tools or commercial applications without writing code manually.

**Quick start:**
- **[My First Tool](/docs/developer-support/my-first-tool/)** - Build an application step by step
- **[Template Tool](https://github.com/OnlyWorlds/tool-template)** - Extensible foundation designed for LLM-assisted development
- **[GitHub Repository](https://github.com/OnlyWorlds/OnlyWorlds)** - Source code and contribution guidelines
- **[Developer Support](/docs/developer-support/)** - Packages, MCP server, OnlyWorldsBot, API reference

Authentication uses API-Key and API-Pin headers. The base URL is `https://www.onlyworlds.com/api/worldapi/`. Full documentation at [onlyworlds.com/api/docs](https://www.onlyworlds.com/api/docs).

## Contributing

The framework improves through community input on element definitions, field specifications, and tool requirements.

**Provide feedback through:**
- [GitHub Discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions) - Feature requests and framework improvements
- [Discord](https://discord.gg/twCjqvVBwb) - Direct discussion with other users
- [Parse Tool](https://onlyworlds.com/parse_tool) - Submit parsing feedback, earn token rewards
- [Email](mailto:info@onlyworlds.com) - Direct contact

See [Contribution](/docs/contribution/) for guidelines on submitting changes.

## Reference

- **[Specification](/docs/specification/)** - Complete technical documentation of all elements and fields
- **[Tool Directory](/docs/tool-directory/)** - Available applications for different workflows
- **[Vision & History](/docs/vision-history/)** - Project philosophy and development history