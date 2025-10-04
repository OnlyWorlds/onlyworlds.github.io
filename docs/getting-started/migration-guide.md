---
layout: default
title: Migration Guide
parent: Getting Started
nav_order: 2
---

# Migration Guide
{: .no_toc }

Convert existing worldbuilding content into OnlyWorlds format using AI-powered parsing.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## What you can convert

OnlyWorlds provides free AI-powered tools to parse unstructured text into structured elements. You can convert:

- **Platform exports**: from other worldbuilding tools
- **Documents**: Google Docs, Word files, PDFs, Notion pages
- **Scattered notes**: Text files, wiki content, campaign logs
- **Published text**: Novels, short stories, published settings
- **Handwritten notes**: Photos of notebooks (requires OCR preprocessing)
- **Mixed formats**: Any combination of the above

The Parse Tool and OnlyWorldsBot extract entities, categorize them into OnlyWorlds elements, and map relationships automatically.

---

## Conversion tools

### Parse Tool

The [Parse Tool](https://onlyworlds.com/parse_tool) converts text directly into OnlyWorlds elements using the OpenAI API. Your account has a daily token limit (10,000 tokens) to manage API costs. This covers moderate parsing—approximately 3,000-4,000 words per day.

### OnlyWorldsBot

The [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot) provides higher parsing capacity, especially useful with ChatGPT Plus. It generates JSON output that you paste into the Parse Tool for upload to your world.

{: .note }
> These tools are experimental. Accuracy varies by source text quality and complexity. Always review parsed elements before saving.

---

## Basic workflow

### Quick start

1. **Create a world** at [onlyworlds.com](https://onlyworlds.com)
2. **Open the Parse Tool** and enter your API key and PIN
3. **Choose your method:**
   - **Direct Parse**: Paste text → Parse → Review → Save
   - **Via OnlyWorldsBot**: Paste in ChatGPT → Copy JSON → Import → Review → Save
4. **Build incrementally**: Parse in batches, review between passes

### Using the Parse Tool

1. Navigate to [Parse Tool](https://onlyworlds.com/parse_tool)
2. Enter your world's API key and PIN
3. Click **Load World**
4. Paste content into the text box
5. Click **Parse**
6. Review staged elements in the right panel
7. Edit field values as needed
8. Click **Save** or **Save All**

### Using OnlyWorldsBot

1. Open [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot)
2. Say "parse" or click the parse suggestion
3. Paste your content and send
4. Copy the JSON output
5. Paste JSON into Parse Tool text box
6. Click **Import Elements** (appears automatically for valid JSON)
7. Review and save

---

## Example: Parsing Hyperion

This example demonstrates how literary text converts to structured OnlyWorlds data using the opening of Dan Simmons' *Hyperion*.

### Source text

> The Hegemony Consul sat on the balcony of his ebony spaceship and played Rachmaninov's Prelude in C-sharp Minor on an ancient but well-maintained Steinway while great, green, saurian things surged and bellowed in the swamps below.

### Parsed elements

One sentence yields multiple structured elements:

- **Character**: "Hegemony Consul" (protagonist)
- **Title**: "Consul of Hegemony" (political position)
- **Institution**: "Hegemony" (governing body)
- **Objects**: "Ebony Spaceship", "Ancient Steinway", "Spaceship Balcony"
- **Location**: "Swamps Below"
- **Species**: "Marsh Saurian" (the creatures)
- **Construct**: "Rachmaninov's Prelude in C-sharp Minor" (cultural artifact)
- **Ability**: "Piano Playing"

### Building context

Continue parsing the next paragraph:

> A thunderstorm was brewing to the north. Bruise-black clouds silhouetted a forest of giant gymnosperms while stratocumulus towered nine kilometers high in a violent sky.

Additional elements identified:

- **Phenomenon**: "Northern Thunderstorm"
- **Location**: "Forest of Giants"
- **Species**: "Giant Gymnosperm"
- **Phenomenon**: "Stratocumulus Formation"

### Expanding the world

Parse the next section where the message arrives:

> 'You have been chosen to return to Hyperion as a member of the Shrike Pilgrimage,' continued the voice.

New elements:

- **Location**: "Hyperion" (planet)
- **Event**: "Shrike Pilgrimage"
- **Institution**: "Church of the Final Atonement"
- **Creature**: "the Shrike"

The Parse Tool identifies entities, categorizes them, and extracts relationships. Continue parsing incrementally to build the complete setting.

---

## Source-specific tips

### Other platform exports

- Export to Markdown or HTML
- Parse by category (all characters, then all locations)
- Verify relationships manually—export formats may lose connections
- Handle custom fields by adding them to element descriptions

### Google Docs / Word documents

- Copy text directly into Parse Tool
- Remove heavy formatting if it causes issues
- Parse in 5-10 page chunks
- Add context headers if documents lack setup ("Character: X in world Y")

### Novel or published text

- Start with opening scenes to establish setting
- Parse character introductions separately for clarity
- Build incrementally as story progresses
- Skip pure dialogue—focus on descriptive passages

### Campaign notes / wiki content

- Consolidate by topic before parsing
- Include relationship context ("X is the daughter of Y")
- Parse iteratively, refining categories as you go
- Use multi-pass approach: foundation elements first, details second

### Handwritten notes

- Use OCR software to convert photos to text
- Clean up OCR errors before parsing
- Add clarifying context where handwriting was ambiguous
- Parse in small batches to catch conversion issues

---

## Best practices

### Preparing content

**Add context if missing**
If your text lacks setup, add brief context: "In the world of Hyperion, the Consul is a diplomat serving the Hegemony."

**Group by type**
Parse all character descriptions together for consistency. Then parse locations, then institutions, etc.

**Include relationships**
Keep text showing how elements connect: "The Consul was born on Hyperion" links character to location.

### Reviewing parsed output

**Verify categories**
Ensure characters aren't categorized as objects, locations aren't events. Edit categories after parsing if needed.

**Check relationships**
Confirm links between elements are accurate. The Parse Tool identifies relationships from proximity and grammar.

**Fill gaps**
Add details the AI missed. Parsing captures obvious entities but may miss subtle attributes.

**Remove duplicates**
Merge similar elements created in different parsing passes. Use names as merge keys.

### Incremental building

Parse in layers for cleaner results:

1. **Foundation**: Main characters, key locations
2. **Context**: Institutions, species, phenomena
3. **Details**: Objects, events, secondary characters
4. **Connections**: Verify relationships, add missing links

This approach creates more organized data than parsing everything at once.

---

## Advanced techniques

### Multi-pass parsing

For complex worlds, use multiple focused passes:

**Pass 1: Core entities**
Parse only major characters and locations. Verify these foundation elements.

**Pass 2: Supporting elements**
Add institutions, species, objects. Link them to core entities.

**Pass 3: Events and narratives**
Parse timeline content. Connect events to established elements.

**Pass 4: Refinement**
Fill missing relationships, add detailed field values manually.

### Category forcing

If the Parse Tool miscategorizes consistently:

- Add explicit category hints: "Character: the Consul", "Location: Hyperion"
- Parse one category at a time with clear headers
- Edit categories in the Parse Tool interface after parsing

### Relationship verification

After parsing, verify critical relationships:

- Characters have correct birthplaces and current locations
- Objects have proper owners
- Events link to all participants
- Locations have accurate parent_location hierarchies

Use the web interface or Browse Tool to audit relationships.

### Handling ambiguity

When source text is ambiguous:

**The Shrike**—creature or character? Choose based on agency:
- **Creature**: Unknown motivations, acts as force of nature
- **Character**: Sentient being with goals and communication

**Consul's ship**—object or construct? Choose based on scale:
- **Object**: Personal spacecraft, movable
- **Construct**: Massive station, permanent structure

Make consistent choices for your world. The specification supports both interpretations.

---

## Troubleshooting

### Parse Tool returns empty results

**Cause**: Text too short, lacks clear entities, or exceeds token limit

**Solution**:
- Add context or rephrase input
- Break into smaller chunks
- Use OnlyWorldsBot for longer content

### Elements categorized incorrectly

**Cause**: Ambiguous source text or parsing heuristics

**Solution**:
- Edit category after parsing in the Parse Tool interface
- Add explicit category hints before parsing
- Manually create element with correct category

### Relationships missing

**Cause**: Relationships not explicit in source text

**Solution**:
- Parse text that explicitly states connections
- Add links manually in web interface or Browse Tool
- Use relational language when preparing text ("X owns Y", "A is located in B")

### Duplicate elements created

**Cause**: Same entity mentioned in different parsing passes

**Solution**:
- Use consistent names across source text
- Merge duplicates manually
- Delete extra elements, update references

### Token limit reached

**Cause**: Daily Parse Tool limit exhausted (10,000 tokens)

**Solution**:
- Switch to OnlyWorldsBot (higher capacity with ChatGPT Plus)
- Parse smaller chunks
- Request token rating increase via Parse Tool feedback system

### OnlyWorldsBot output won't import

**Cause**: JSON format error or unexpected structure

**Solution**:
- Tell OnlyWorldsBot to "fix output"
- Copy JSON carefully (no truncation)
- Verify JSON is complete (ends with closing braces)

---

## After migration

Once content is parsed and uploaded:

### Expand with tools

- **Browse Tool**: Advanced editing and field management
- **Map Tool**: Visualize spatial relationships
- **Obsidian Plugin**: Edit elements as markdown files
- **Mobile Companion**: Quick updates on mobile

### Refine incrementally

- Add field details the parser couldn't infer
- Build relationship networks manually
- Parse additional content as needed
- Use specification to verify field usage

### Export regularly

Backup your world as JSON:
- Navigate to **Worlds** in web interface
- Click **Export to JSON**
- Save locally

Your data is portable. Use it wherever you need.

### Build custom tools

Everything in your world is accessible via the REST API. Use the [Template Tool](https://github.com/OnlyWorlds/tool-template) as a foundation—it's designed for extension by LLMs, enabling custom tool development without manual coding.

---

## Migration examples

### Example 1: Campaign wiki

**Source**: 50-page D&D campaign wiki with character sheets, location descriptions, faction details

**Approach**:
1. Export wiki to Markdown
2. Parse character section (yields 12 characters)
3. Parse location section (yields 8 locations with hierarchies)
4. Parse faction section (yields 5 institutions)
5. Parse timeline (yields 15 events)
6. Manually verify character-faction relationships
7. Add objects (magic items, artifacts) manually

**Result**: 40+ elements with verified relationships, ready for mapping and session planning

### Example 2: Novel setting

**Source**: First three chapters of unpublished fantasy novel

**Approach**:
1. Parse protagonist introduction (1 character, 3 locations, 2 objects)
2. Parse world description passage (5 species, 2 phenomena, 3 institutions)
3. Parse inciting incident scene (1 event, 2 creatures, 4 characters)
4. Build location hierarchy manually
5. Add character relationships from context

**Result**: 23 elements capturing setting foundation, expandable as novel progresses

### Example 3: WorldAnvil migration

**Source**: 200-article WorldAnvil world with custom templates

**Approach**:
1. Export to HTML
2. Parse in category batches (characters, locations, organizations separately)
3. Use multi-pass strategy (foundation, context, details)
4. Map WorldAnvil custom fields to OnlyWorlds fields
5. Store unmapped fields in element descriptions
6. Verify relationships using original WorldAnvil graph

**Result**: Complete world migration with 200+ elements, relationships preserved, ready for new tools

---

## Getting help

### Community support

- **[Discord](https://discord.gg/twCjqvVBwb)**: Real-time discussion with other users
- **[GitHub Discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions)**: Feature requests and technical questions
- **[Parse Tool Feedback](https://onlyworlds.com/parse_tool)**: Report parsing issues, earn token rewards

### Improving parsing

Submit feedback through the Parse Tool interface to improve AI accuracy. High-quality feedback earns increased token ratings.

### Technical issues

For bugs or technical problems: [GitHub Issues](https://github.com/OnlyWorlds/OnlyWorlds/issues)

---

**Previous: [Your First World](your-first-world/)** | **Next: [Tool Directory](/docs/tool-directory/)**
