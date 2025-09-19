---
layout: default
title: My First Tool
parent: Developer Support
nav_order: 1
---

# My First Tool
{: .no_toc }

Build your own OnlyWorlds tool without writing a single line of code by hand.

{: .warning }
> **Work in Progress**  
> This guide is being developed alongside the creation of Tactical Tangle, a showcase tool for ancient Greek warfare simulation.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

Modern AI tools can write entire applications from clear descriptions. This guide will help you create your first OnlyWorlds tool using AI assistants to handle all the technical work.

{: .note }
> **No coding experience required**  
> If you can describe what you want and follow step-by-step instructions, you can build a tool.

---

## Prerequisites

### 1. Create a GitHub account

GitHub hosts your code and publishes your tool to the web for free.

1. **Visit [github.com](https://github.com)** and click "Sign up"
2. **Choose a username** - This becomes part of your tool's web address
3. **Verify your email** - Check your inbox for confirmation
4. **Complete setup** - Skip optional steps for now

{: .important }
> Your username is permanent and visible in your tool's URL. Choose thoughtfully.

### 2. Install development tools

You need a code editor and Python to run the template locally.

#### Visual Studio Code or Cursor
Choose one editor (both are free):
- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com) - Microsoft's editor
- **Cursor**: [cursor.sh](https://cursor.sh) - AI-first editor based on VS Code

Install with default options. Both work identically for this guide.

#### Python
Required to run the template tool locally:
1. **Download Python** from [python.org](https://python.org/downloads)
2. **During installation**: Check "Add Python to PATH" 
3. **Verify installation**: Open terminal and type `python --version`

#### Git (optional but recommended)
For proper version control:
1. **Download Git** from [git-scm.com](https://git-scm.com)
2. **Install with defaults** - Accept all default options
3. **Configure Git** (in terminal):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Starting Your Tool

### Method 1: Use as Template (Recommended)

GitHub's template feature creates a clean new repository without forking history.

1. **Visit** [github.com/OnlyWorlds/tool-template](https://github.com/OnlyWorlds/tool-template)
2. **Click** "Use this template" → "Create a new repository"
3. **Name your repository** (e.g., `tactical-tangle` or `my-onlyworlds-tool`)
4. **Set to Public** (required for free GitHub Pages hosting)
5. **Click** "Create repository"

### Method 2: Fork (For Contributing Back)

Use this only if you plan to improve the template itself.

1. **Visit** [github.com/OnlyWorlds/tool-template](https://github.com/OnlyWorlds/tool-template)
2. **Click** "Fork" in top-right
3. **Rename if desired** and click "Create fork"

### Clone to Your Computer

1. **Copy your repository URL** from GitHub (green "Code" button)
2. **Open terminal** in your development folder
3. **Clone the repository**:
```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```
4. **Start the tool**:
```bash
python start.py
```
5. **Open browser** to `http://localhost:8000`

{: .note }
> The tool needs your OnlyWorlds API credentials to connect. Get them from your [OnlyWorlds profile](https://www.onlyworlds.com/profile).

---

## Next Steps

### Understand the Structure

The template tool is organized for easy modification:

```
tool-template/
├── index.html          # Main page (modify for your UI)
├── js/
│   ├── app.js         # Application controller
│   ├── api.js         # OnlyWorlds API integration (reuse this!)
│   ├── auth.js        # Authentication handling
│   └── constants.js   # OnlyWorlds element types
├── css/
│   └── styles.css     # Visual styling
└── start.py           # Local server
```

### Key Files to Keep

When building your tool, these files handle OnlyWorlds integration:
- `js/api.js` - Complete API wrapper
- `js/auth.js` - Credential management  
- `js/constants.js` - Element type definitions

### Making It Your Own

1. **Modify `index.html`** for your tool's interface
2. **Keep the auth system** - It handles API credentials
3. **Reuse API calls** - The template has all CRUD operations ready
4. **Add your features** - Game logic, visualizations, whatever you imagine!

---

## Publishing Your Tool

### Enable GitHub Pages

1. **Go to Settings** in your GitHub repository
2. **Scroll to Pages** section
3. **Source**: Deploy from a branch
4. **Branch**: Select `main` and `/ (root)`
5. **Save** and wait ~5 minutes

Your tool will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

### Custom Domain (Optional)

1. **Add a `CNAME` file** to your repository root with your domain
2. **Configure DNS** at your domain provider to point to GitHub

---

## Getting Help

### AI Assistants

- **[OnlyWorldsBot](onlyworldsbot.html)** - Custom ChatGPT trained for OnlyWorlds
- **Claude** - Excellent for code generation
- **GitHub Copilot** - Built into VS Code/Cursor

### Community

- **[Discord](https://discord.gg/twCjqvVBwb)** - OnlyWorlds community
- **[GitHub Discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions)** - Q&A and ideas

### Documentation

- **[API Reference](https://www.onlyworlds.com/api/docs)** - Complete API documentation
- **[Tool Template](https://github.com/OnlyWorlds/tool-template)** - Starting point with examples
- **[MCP Server](mcp-server.html)** - Advanced AI integration

---

## Example: Building Tactical Tangle

Follow along as we build a real tool from scratch:

### Part 1: Setup & Architecture
*Coming soon - Setting up the repository and basic structure*

### Part 2: OnlyWorlds Integration  
*Coming soon - Loading characters and world data*

### Part 3: Game Mechanics
*Coming soon - Adding physics and battle simulation*

### Part 4: AI Enhancement
*Coming soon - Connecting OpenAI for character decisions*

### Part 5: Polish & Deploy
*Coming soon - Final touches and publishing*

---

## Tips for Success

{: .highlight }
> **Start small** - Get basic functionality working before adding features  
> **Use the template's code** - Don't reinvent authentication and API calls  
> **Test locally first** - Use `python start.py` before publishing  
> **Ask for help** - The community loves seeing new tools!

---

## License Note

The tool template uses MIT license. Your tool can use any license, but consider keeping it open source to help the community grow.