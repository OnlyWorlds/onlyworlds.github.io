---
layout: default
title: AI-Assisted Tool Creation
parent: Developer Support
nav_order: 2
---

# AI-Assisted Tool Creation
{: .no_toc }

Build your own OnlyWorlds tool without writing a single line of code by hand.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

Modern AI tools can write entire applications from clear descriptions. This guide takes you from zero coding experience to a published OnlyWorlds tool, using AI assistants like Claude, ChatGPT, or GitHub Copilot to handle all the technical work.

You'll learn to:
- Set up essential accounts and tools
- Use a pre-built template as your foundation
- Describe what you want to build
- Guide AI to create your tool
- Publish it for others to use

{: .note }
> **No coding experience required**  
> If you can describe what you want and follow step-by-step instructions, you can build a tool.

---

## Part 1: Setting Up Your Foundation

### Create a GitHub account

GitHub hosts your code and publishes your tool to the web for free.

1. **Visit [github.com](https://github.com)** and click "Sign up"
2. **Choose a username** - This becomes part of your tool's web address (username.github.io)
3. **Verify your email** - Check your inbox for GitHub's confirmation
4. **Complete setup** - Skip all optional steps for now

{: .important }
> Your username is permanent and visible in your tool's URL. Choose thoughtfully.

### Install VS Code

Visual Studio Code is where you'll work with AI to build your tool.

1. **Download VS Code** from [code.visualstudio.com](https://code.visualstudio.com)
2. **Install it** - Accept all default options
3. **Open VS Code** - You'll see a welcome screen
4. **Install GitHub extension** - Click Extensions icon (four squares) on left sidebar
   - Search "GitHub Pull Requests"
   - Click Install on the first result

### Get your AI assistant ready

Choose one of these AI coding assistants:

#### Option A: Claude (Recommended)
1. **Install Claude desktop app** from [claude.ai](https://claude.ai)
2. **Sign up** for a free account
3. **Open Claude** and keep it ready alongside VS Code

#### Option B: GitHub Copilot
1. **In VS Code**, click Extensions icon
2. **Search** "GitHub Copilot"
3. **Install** and sign in with your GitHub account
4. **Start free trial** (or use student/teacher free access)

#### Option C: ChatGPT
1. **Visit** [chat.openai.com](https://chat.openai.com)
2. **Sign up** for free account
3. **Keep browser tab open** alongside VS Code

---

## Part 2: Clone the Template

### Use the OnlyWorlds tool template

We've prepared a complete starting template with everything configured.

1. **Visit** the template repository:
   ```
   github.com/OnlyWorlds/tool-template
   ```

2. **Click "Use this template"** button (green button, top right)

3. **Create your repository**:
   - Repository name: `my-onlyworlds-tool` (or your choice)
   - Description: "My OnlyWorlds tool for [your purpose]"
   - Set to **Public**
   - Click "Create repository"

4. **Clone to your computer**:
   - Click the green "Code" button
   - Click "Open with GitHub Desktop" (install if prompted)
   - Choose where to save it locally
   - Click "Clone"

5. **Open in VS Code**:
   - In GitHub Desktop: Repository → Open in Visual Studio Code
   - Or in VS Code: File → Open Folder → Select your cloned folder

### Understanding the template structure

```
my-onlyworlds-tool/
├── index.html          # Your tool's main page
├── src/
│   ├── main.ts        # Core application logic
│   ├── api.ts         # OnlyWorlds API connection
│   └── types.ts       # Data structure definitions
├── styles/
│   └── main.css       # Visual styling
├── public/            # Images and assets
├── package.json       # Project configuration
└── vite.config.ts     # Build configuration
```

{: .note }
> Don't worry about understanding these files. Your AI assistant will handle all the code.

---

## Part 3: Define Your Tool

### Write a Product Requirements Document (PRD)

A PRD tells the AI exactly what to build. Create a new file called `REQUIREMENTS.md` in your project:

1. **In VS Code**: File → New File
2. **Save as** `REQUIREMENTS.md`
3. **Copy this template** and fill it in:

```markdown
# OnlyWorlds Tool Requirements

## Tool Name
[Your tool name]

## Purpose
[One sentence: What problem does this solve?]

## Target Users
[Who will use this tool? Writers? Game masters? Map makers?]

## Core Features

### Must Have (Version 1)
1. Load world data using API key and PIN
2. [Feature 2]
3. [Feature 3]

### Nice to Have (Future)
- [Feature A]
- [Feature B]

## User Interface

### Main Screen
[Describe what users see first]
- [Element 1]
- [Element 2]

### Interactions
[What happens when users click/type/drag?]
- When user clicks [X], then [Y] happens
- When user types in [field], it filters [data]

## Data Elements
Which OnlyWorlds elements does your tool use?
- [ ] Characters
- [ ] Locations
- [ ] Objects
- [ ] Events
- [ ] Maps
- [ ] [Others as needed]

## Visual Style
[Modern? Fantasy? Minimal? Dark theme?]

## Examples
[If similar tools exist, link them here]

## Success Criteria
How do we know the tool works?
1. [Users can successfully...]
2. [The tool correctly...]
```

### PRD Examples

#### Example 1: Character Relationship Mapper
```markdown
## Tool Name
OnlyWorlds Relationship Web

## Purpose
Visualize all relationships between characters as an interactive network graph.

## Core Features
1. Load world data using API key and PIN
2. Display characters as nodes in a web
3. Show relationships as connecting lines
4. Click character to see details
5. Filter by relationship type (family, friends, rivals)
```

#### Example 2: Timeline Builder
```markdown
## Tool Name
OnlyWorlds Chronicle

## Purpose
Arrange events on an interactive timeline to visualize world history.

## Core Features
1. Load world data using API key and PIN
2. Display events on horizontal timeline
3. Zoom in/out for different time scales
4. Click events for full details
5. Filter by location or participants
```

---

## Part 4: Build with AI

### Starting the conversation

Open your AI assistant and start with this prompt:

```
I want to build an OnlyWorlds tool using TypeScript, Vite, and React. 
I have a template project set up and VS Code open.

Here's my requirements document:
[Paste your REQUIREMENTS.md content]

Please guide me step-by-step to build this tool. Start with the basic 
structure, then add features one at a time. For each step:
1. Explain what we're doing
2. Show me exactly what code to write and where
3. Tell me how to test it

Let's begin with setting up the basic page structure.
```

### Working with AI responses

The AI will provide code and instructions. Follow this pattern:

1. **Read the explanation** - Understand what you're building
2. **Copy the code** - The AI will show code in gray boxes
3. **Paste in VS Code** - Put it exactly where the AI specifies
4. **Save the file** - Ctrl+S (Windows) or Cmd+S (Mac)
5. **Test it** - Follow the AI's testing instructions

### Running your tool locally

First time setup (only once):
1. **Open VS Code terminal**: View → Terminal
2. **Type** `npm install` and press Enter
3. **Wait** for installation to complete

To see your tool:
1. **In terminal, type** `npm run dev`
2. **Click the link** that appears (usually http://localhost:5173)
3. **Your tool opens** in your browser
4. **Changes appear automatically** as you save files

To stop:
- Press Ctrl+C in the terminal

### Iteration process

Build your tool feature by feature:

```
You: "Great! The basic page loads. Now let's add the authentication 
      form where users enter their API key and PIN."

AI: [Provides code and instructions]

You: "Perfect! The form appears. Now let's make it actually load 
      the world data when submitted."

AI: [Provides code and instructions]

You: "The data loads! Now let's display the characters in a grid..."
```

### Common AI prompts for OnlyWorlds tools

Copy and customize these as needed:

#### Data fetching
```
Show me how to fetch world data from the OnlyWorlds API using 
the API key and PIN from the form inputs.
```

#### Display elements
```
Create a card component that displays a character with their 
name, description, and current location.
```

#### Filtering
```
Add a search box that filters the displayed characters by name 
or description as the user types.
```

#### Relationships
```
Show me how to resolve location IDs to actual location names 
when displaying where a character is.
```

#### Styling
```
Make the character cards look more visually appealing with 
shadows, rounded corners, and better spacing.
```

---

## Part 5: Deploy to GitHub Pages

### Enable GitHub Pages

Once your tool works locally:

1. **Commit your code**:
   - In VS Code: Source Control tab (left sidebar)
   - Type a message like "Initial working version"
   - Click checkmark to commit
   - Click "Sync Changes"

2. **Build for production**:
   - In terminal: `npm run build`
   - This creates a `dist` folder

3. **Deploy to GitHub Pages**:
   - In terminal: `npm run deploy`
   - Wait for "Published" message

4. **Enable Pages in GitHub**:
   - Go to your repository on github.com
   - Settings → Pages (left sidebar)
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Click Save

5. **Access your live tool**:
   ```
   https://[your-username].github.io/[repository-name]
   ```

{: .warning }
> First deployment takes 10-20 minutes. Be patient.

### Updating your tool

Every time you make changes:

1. **Test locally** with `npm run dev`
2. **Commit changes** in VS Code
3. **Build** with `npm run build`
4. **Deploy** with `npm run deploy`
5. **Wait** 2-5 minutes for updates to appear

---

## Part 6: Advanced Techniques

### Adding AI features to your tool

Make your tool smarter by integrating AI capabilities:

#### Pattern 1: AI-Powered Descriptions
```
You: "I want to add a button that uses AI to expand character 
      descriptions. When clicked, it should generate a more 
      detailed description based on the existing data."
```

#### Pattern 2: Suggestion Systems
```
You: "Add a feature that suggests relationships between characters 
      based on shared locations or events."
```

#### Pattern 3: Content Generation
```
You: "Create a 'Generate Quest' button that creates a new event 
      involving selected characters and locations."
```

### Working with the OnlyWorlds schema

Ask your AI to respect the data structure:

```
You: "Make sure any new elements we create follow the OnlyWorlds 
      schema. Every element needs an id and name field at minimum. 
      Check the types.ts file for the exact structure."
```

### Handling errors gracefully

```
You: "Add error handling so if the API call fails, users see a 
      helpful message instead of a broken page."
```

### Making it responsive

```
You: "Make the tool work well on mobile devices. The layout should 
      adapt to smaller screens."
```

---

## Part 7: Share and Iterate

### Documentation

Create a README.md file:

```markdown
# [Tool Name]

## What it does
[One paragraph description]

## How to use
1. Visit [your tool URL]
2. Enter your OnlyWorlds API key and PIN
3. [Step 3]
4. [Step 4]

## Features
- [Feature 1]
- [Feature 2]

## Screenshots
![Screenshot](screenshot.png)

## Feedback
[How to contact you or submit issues]
```

### Getting feedback

1. **Share in OnlyWorlds Discord** #tools channel
2. **Post in GitHub Discussions**
3. **Ask specific users** to test
4. **Watch how people use it** - What confuses them?

### Continuous improvement

Keep iterating with AI:

```
You: "Users are confused by [X]. How can we make this clearer?"

You: "Several people requested [feature]. Let's add it."

You: "The tool is slow with large worlds. How can we optimize?"
```

---

## Template Project Structure

The OnlyWorlds tool template includes:

### Core files

**package.json** - Defines your project
```json
{
  "name": "onlyworlds-tool-template",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "deploy": "vite build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "gh-pages": "^6.1.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**src/api.ts** - OnlyWorlds API connection
```typescript
const API_BASE = 'https://api.onlyworlds.com';

export async function loadWorld(apiKey: string, pin: string) {
  const response = await fetch(`${API_BASE}/world`, {
    headers: {
      'X-API-Key': apiKey,
      'X-PIN': pin
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to load world');
  }
  
  return response.json();
}

export async function updateElement(
  apiKey: string, 
  pin: string, 
  category: string, 
  element: any
) {
  // Implementation here
}
```

**src/types.ts** - OnlyWorlds data structures
```typescript
export interface Character {
  id: string;
  name: string;
  description?: string;
  location_id?: string;
  species_id?: string;
  // ... other fields
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  parent_location_id?: string;
  // ... other fields
}

export interface World {
  metadata: WorldMetadata;
  characters: Character[];
  locations: Location[];
  objects: Object[];
  // ... other categories
}
```

---

## Troubleshooting

### Common issues and solutions

{: .warning }
> **"npm not recognized"**  
> Install Node.js from [nodejs.org](https://nodejs.org). Choose the LTS version.

{: .warning }
> **"Cannot find module"**  
> Run `npm install` in the terminal to install dependencies.

{: .warning }
> **GitHub Pages shows 404**  
> Wait 20 minutes for first deployment. Check Settings → Pages is enabled.

{: .warning }
> **API returns 401 Unauthorized**  
> Check API key and PIN are correct. No spaces before/after.

{: .warning }
> **Changes don't appear**  
> 1. Save file (Ctrl+S)
> 2. Check terminal for errors
> 3. Refresh browser (Ctrl+R)

### Getting help

1. **Ask your AI assistant** - Describe the error message
2. **OnlyWorlds Discord** - #tools-help channel
3. **GitHub Issues** - On your repository
4. **Stack Overflow** - Search for Vite/React issues

---

## Next steps

You've built your first tool! Here's what to explore next:

1. **Add more features** - Ask AI to implement your "nice to have" list
2. **Improve the design** - "Make this look more professional/beautiful/unique"
3. **Add data visualization** - Charts, graphs, maps
4. **Connect to other services** - Export to other formats
5. **Build another tool** - Each one gets easier

Remember: You don't need to understand the code. You need to understand what you want to build and communicate it clearly to AI.

Welcome to the OnlyWorlds developer community!