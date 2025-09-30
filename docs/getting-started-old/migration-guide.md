---
layout: default
title: Migration Guide
parent: Getting Started (Old)
nav_order: 2
---

# Migration Guide

Converting existing worldbuilding content into the OnlyWorlds format enables your work to function across all compatible tools and applications. This guide covers the available migration methods and demonstrates the conversion process using examples from the opening of Dan Simmons' Hyperion.

## Available Migration Tools

OnlyWorlds currently offers two AI-powered pipelines for converting unstructured text into OnlyWorlds elements:

### Parse Tool

The [parse tool](https://onlyworlds.com/parse_tool) processes any text into OnlyWorlds elements and field values. It runs on the OpenAI API using the developer's private API key and account. To limit costs from multi-user access, your account is rate limited using a Token Rating of 10k tokens per day.

### OnlyWorldsBot

The [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot) provides additional parsing capacity, especially useful for ChatGPT Plus subscribers. OWBot does not yet have direct integration with the OnlyWorlds World API, but the parse tool can act as proxy: OWBot does the parsing and formatting, and you can copy its output into the parse tool, which will recognize the JSON format and stage the elements for upload.

<div style="text-align: center; margin: 40px 0; padding: 20px; background: #374151; border-radius: 8px; border-left: 4px solid #fbbf24;">
<p style="color: #d1d5db; margin: 0;">⚠️ <strong>Note:</strong> These tools are experimental and offer no guarantee of accuracy or completeness. Your feedback and experience is welcome.</p>
</div>

## Migration Process

### Basic Steps

1. Create a world on [onlyworlds.com](https://onlyworlds.com)
2. Go to the [parse tool](https://onlyworlds.com/parse_tool) and load in your world
3. Either:
   - **Direct parsing**: Copy world data into the middle text box and click 'parse'
   - **Via OnlyWorldsBot**: Say 'parse' to OWBot, paste your data, then copy its JSON output into the parse tool
4. Review and edit the parsed elements
5. Click 'save' or 'save all' to upload the elements to your world

### Understanding the Conversion

When you migrate text to OnlyWorlds format, the AI identifies entities and concepts in your text and maps them to appropriate element categories. Let's examine how the opening of Hyperion converts:

#### Original Text
> The Hegemony Consul sat on the balcony of his ebony spaceship and played Rachmaninov's Prelude in C-sharp Minor on an ancient but well-maintained Steinway while great, green, saurian things surged and bellowed in the swamps below.

#### Parsed Elements

From this single sentence, the migration process identifies:

- **Character**: "Hegemony Consul" - the protagonist
- **Title**: "Consul of Hegemony" - their position
- **Institution**: "Hegemony" - the governing body
- **Objects**: "Ebony Spaceship", "Ancient Steinway", "Spaceship Balcony"
- **Location**: "Swamps Below" - where the scene takes place
- **Species**: "Marsh Saurian" - the creatures mentioned
- **Construct**: "Rachmaninov's Prelude in C-sharp Minor" - cultural artifact
- **Ability**: "Piano Playing" - a skill demonstrated

### Building on Migrated Content

After initial migration, you can expand your world by continuing to parse additional text or by manually adding related elements. For instance, after parsing the Consul's introduction, you might:

1. Parse the next section where Meina Gladstone's message arrives
2. This adds new elements: "Hyperion" (location), "Time Tombs" (location), "The Shrike" (creature)
3. These automatically become available for linking to existing elements

The migration creates a foundation you can build upon using any OnlyWorlds tool.

## Migration Examples

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Character with Context</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Original Text</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">
The Hegemony Consul sat on the balcony of his ebony spaceship...
</div>
</div>

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Parsed Character Element</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">
<strong>Name:</strong> Hegemony Consul<br>
<strong>Type:</strong> Human - Official<br>
<strong>Location:</strong> Spaceship Balcony<br>
<strong>Objects:</strong> Ebony Spaceship, Ancient Steinway<br>
<strong>Abilities:</strong> Piano Playing<br>
<strong>Titles:</strong> Consul of Hegemony
</div>
</div>

</div>
</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Locations and Phenomena</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Original Text</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">
A thunderstorm was brewing to the north. Bruise-black clouds silhouetted a forest of giant gymnosperms while stratocumulus towered nine kilometers high in a violent sky.
</div>
</div>

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Parsed Elements</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">
<strong>Phenomenon:</strong> Northern Thunderstorm<br>
<strong>Location:</strong> Forest of Giants<br>
<strong>Species:</strong> Giant Gymnosperm<br>
<strong>Phenomenon:</strong> Stratocumulus Clouds<br>
<strong>Phenomenon:</strong> Rippling Lightning
</div>
</div>

</div>
</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Complex Relationships</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Original Text</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">
'You have been chosen to return to Hyperion as a member of the Shrike Pilgrimage,' continued the voice.
</div>
</div>

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Parsed Elements</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">
<strong>Location:</strong> Hyperion (planet)<br>
<strong>Event:</strong> Shrike Pilgrimage<br>
<strong>Institution:</strong> Church of the Shrike<br>
<strong>Creature:</strong> The Shrike<br>
<strong>Construct:</strong> All Thing (governing body)
</div>
</div>

</div>
</details>

## Best Practices for Migration

### Preparing Your Content

1. **Organize by context**: Group related text together (all character descriptions, all location details)
2. **Include relationships**: Keep text that shows how elements relate to each other
3. **Preserve important details**: Names, titles, and specific descriptors help the AI categorize correctly

### Reviewing Parsed Elements

1. **Check element categories**: Ensure characters aren't mistakenly categorized as objects
2. **Verify relationships**: Confirm that location links and character associations are correct
3. **Add missing fields**: The AI might miss subtle details you can add manually

### Incremental Migration

Rather than parsing everything at once:

1. Start with core elements (main characters, key locations)
2. Build relationships between these foundation elements
3. Add secondary elements in layers
4. Review and refine at each stage

This approach, demonstrated with the Hyperion example, creates a more organized and accurate world structure.

---

**Previous: [Your First World](my-first-world)** | **Next: [Understanding OnlyWorlds](understanding-onlyworlds)**