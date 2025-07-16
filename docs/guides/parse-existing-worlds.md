---
layout: default
title: Parse Existing Worlds
parent: Guides
nav_order: 2
---

# Parse Existing Worlds

Transform your existing worldbuilding content into structured OnlyWorlds data using two different parsing routes.

---

## Two Routes to Parsing

### Route 1: OnlyWorlds Custom GPT (Free, No Tokens)

Use the [OnlyWorlds Custom GPT](https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot) on ChatGPT to structure your content for free:

1. **Upload your content** - Stories, notes, world documents
2. **Ask it to structure** - "Convert this to OnlyWorlds format"
3. **Copy the output** - Formatted JSON/YAML data
4. **Paste into Parse Tool** - Import the structured data

**Why use this route?**
- Completely free (uses ChatGPT, not your tokens)
- Often better at understanding complex narratives
- Can handle large documents in one go
- Provides clean, structured output

### Route 2: Built-in Parse Tool (Uses Tokens)

Use the Parse Tool's AI directly at [onlyworlds.com/parser](https://onlyworlds.com/parser):

1. **Enter World Key and PIN**
2. **Paste raw text** in middle panel
3. **Click parse** - AI extracts elements
4. **Edit and save** the results

**Why use this route?**
- Integrated directly with your world
- Real-time element creation
- Immediate validation
- No copy-paste needed

---

## How Parsing Works

The AI analyzes your text to identify OnlyWorlds elements:

- **Characters** - Named beings with agency
- **Locations** - Named places in your world  
- **Events** - Things that happen in time
- **Objects** - Important items and artifacts
- **Abilities** - Powers, skills, and magic
- Plus 15+ other element types

Each element is extracted with:
- Name and description
- Category assignment
- Relationships to other elements
- Appropriate supertypes/subtypes

---

## Quick Example

**Input text:**
```
"The wizard Aldric lived in the Crystal Tower, where he studied 
the ancient art of time magic using the Chronos Amulet."
```

**Parsed elements:**
- Character: Aldric (wizard)
- Location: Crystal Tower  
- Ability: Time Magic
- Object: Chronos Amulet
- Relationships automatically linked

---

## Tips for Better Parsing

- **Name things clearly** - The AI looks for proper nouns
- **Group related content** - Parse chapters or sections together
- **Review before saving** - AI suggestions aren't perfect
- **Use the ChatGPT route for novels** - It handles narrative better
- **Use the built-in tool for lists** - Better for structured data

---

## Next Steps

After parsing:
- Review elements in the right panel
- Edit any that need adjustment
- Mark elements as "done" to save
- Use other tools to visualize your world