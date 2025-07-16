---
layout: default
title: Infrastructure
nav_order: 6
has_children: true
published: false
nav_exclude: true
---

# Infrastructure

## Ecosystem Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         CREATORS                                           │
│                                                                                            │
└───────────────────────────────────────────┬────────────────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
╔═══════════════════╗                ╔═══════════════════╗                ╔═══════════════════╗
║ CREATION TOOLS    ║                ║ OnlyWorlds.com    ║                ║ CONSUMPTION TOOLS ║
╟───────────────────╢◄──────────────►╟───────────────────╢◄──────────────►╟───────────────────╢
║                   ║   OnlyWorlds   ║ • REST API        ║   OnlyWorlds   ║                   ║
║                   ║    Format      ║ • World Storage   ║    Format      ║                   ║
║                   ║                ║ • User Accounts   ║                ║                   ║
╚═══════════════════╝                ╚═════════╤═════════╝                ╚═══════════════════╝
                                               │
                                               │
                            ╔══════════════════╧══════════════════╗
                            ║         Schema Repository           ║
                            ║      github.com/OnlyWorlds          ║
                            ║   • Element Definitions (YAML)      ║
                            ║   • JSON Schema Validation          ║
                            ║   • Version Control                 ║
                            ╚══════════════════╤══════════════════╝
                                               │
                                               │
                                               ▼
                ╔════════════════════════ FEEDBACK LOOP ═══════════════════════╗
                ║                                                              ║
                ║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ║
                ║  │GitHub Discussions│  │   Parse Tool    │  │Discord Community│  ║
                ║  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  ║
                ║  │• Schema proposals│  │• Direct feedback│  │• Real-time chat │  ║
                ║  │• Feature requests│  │• Token rewards  │  │• Brainstorming  │  ║
                ║  │• Technical specs │  │• Usage analytics│  │• Community help │  ║
                ║  └─────────────────┘  └─────────────────┘  └─────────────────┘  ║
                ║                              │                               ║
                ║                              └────────────┐                  ║
                ╚══════════════════════════════════════════╪══════════════════╝
                                                           │
                                                           ▲
                                          Feedback influences schema evolution
```

---

## Core Components

### OnlyWorlds.com
Central platform providing world storage, REST API access, and user authentication.

### Schema Repository
Authoritative source for all element definitions, maintained at [github.com/OnlyWorlds/spec](https://github.com/OnlyWorlds/spec).

### Community Feedback Loop
- **GitHub Discussions** - Formal proposals and technical discussions
- **Discord** - Real-time community support and brainstorming
- **Parse Tool** - Direct feedback submission with token rewards

---

## Building on OnlyWorlds

### For Tool Developers

**Integration Steps**:

1. **(Optional)** Consult the [OnlyWorlds Custom GPT](https://chat.openai.com/g/onlyworlds) for implementation guidance

2. **Import language files** or create new ones if not supplied for your platform
   - Check existing conversions in the [tools repository](https://github.com/OnlyWorlds/tools)
   - Follow the schema definitions precisely

3. **Set up core requirements**:
   - **OpenAPI Integration** - Connect to OnlyWorlds.com API
   - **UUID v7** - For generating unique identifiers
   - **JSON Schema validation** - Ensure data compliance
   - **UTF-8 encoding** - For international support

**Integration Priority**:
1. OpenAPI connection (recommended)
2. Direct JSON import/export
3. Schema validation
4. Custom extensions

---

## Contribution Guide

### For Non-Developers

**How to Contribute**:
- **Submit feedback** through the Parse Tool (earns token rewards)
- **Join discussions** on Discord
- **Test tools** and report issues
- **Share worlds** as examples
- **Write documentation** improvements

**Token Rating System**: Users receive daily tokens for using AI-powered OnlyWorlds tools (like the Parse Tool). Contributing feedback earns additional tokens.

### For Developers

**Contribution Opportunities**:

1. **Language Conversions**
   - Extend existing converters
   - Create new language mappings
   - Optimize conversion algorithms

2. **Tool Development**
   - Build new compatible tools
   - Submit to Tool Directory (must be free/freemium)
   - Integrate OnlyWorlds format

3. **Schema Enhancement**
   - Propose new element types
   - Suggest field additions
   - Create migration guides

4. **Infrastructure**
   - API client libraries
   - Validation tools
   - Testing frameworks

**Submission Process**:
1. Discuss idea in GitHub Discussions
2. Create pull request with changes
3. Include tests and documentation
4. Await community review

---

## Technical Standards

### Data Requirements
- **Format**: JSON with UTF-8
- **IDs**: UUID v7
- **Schema**: JSON Schema 2020-12
- **Time**: ISO 8601
- **References**: ID-based linking

### API Access
- **Endpoint**: `api.onlyworlds.com`
- **Auth**: OAuth 2.0 / API keys
- **Rate limit**: Based on account tier
- **Format**: RESTful JSON

---

## Roadmap

**Active Development**:
- Enhanced Parse Tool capabilities
- Language conversion library
- Real-time collaboration
- Mobile applications

**Community Driven**:
- Feature requests via GitHub
- Priority based on feedback
- Open development process