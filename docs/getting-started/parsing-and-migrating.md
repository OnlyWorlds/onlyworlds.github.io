---
layout: default
title: Parsing & Migrating
parent: Getting Started
nav_order: 2
---

# Parsing & Migrating

To enable your worlds for OnlyWorlds tools, you can go-by-hand with whichever tool suits best. But unless you're new to the world building business, you're likely to have a substantial amount of work across analog and/or digital formats and environments. AI automation can help structure this data into the OnlyWorlds format effectively, and OnlyWorlds currently offers two pipelines for this. 
 
The [parse tool](https://onlyworlds.com/parse_tool) can 'parse' any text into OnlyWorlds elements and field values: it will attempt to extract elements and field values. This parse mode runs on the OpenAI API using the developer's private API key and account. To limit costs from multi-user access, your account is rate limited using a Token Rating of 10k tokens per day.

This limit will not be sufficient for larger worlds. But the [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot) is also happy to parse and has more capacity, especially if you have a ChatGPT Plus subscription. 
OWBot does not (yet) have a direct integration with the OnlyWorlds World API, but the parse tool can act as proxy: OWBot does the parsing and formatting, and you can copy its output into the parse tool, which will recognize the JSON format and stage the elements so you can edit and upload them.

These tools and pipelines are a work in progress, experimental, and offer no guarantee of accuracy or completeness. Your feedback and experience in using them is, as always, very welcome.

<div style="text-align: center; margin: 40px 0; padding: 20px; background: #374151; border-radius: 8px; border-left: 4px solid #fbbf24;">
<p style="color: #d1d5db; margin: 0;">⚠️ <strong>Pre-Launch Status:</strong> OnlyWorlds launches August 2025. Parsing functionality is available but imperfect in the parse tool, and not yet activated for the OnlyWorldsBot.</p>
</div>


## Steps

1. Create a world on [onlyworlds.com](https://onlyworlds.com)
2. Go to the [parse tool](https://onlyworlds.com/parse_tool) and load in your world

### Using the parse tool

3. Copy world data into the middle text box
4. Click the 'parse' button
5. Edit and verify the parsed elements
6. Click 'save' or 'save all' to upload the elements to the world

### Using the [OnlyWorldsBot](https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot)
 
3. Say 'parse' or click the 'parse' suggestion
4. Paste in and send world data after OWBot has replied
5. Copy its JSON output into the middle text box
6. A button 'import elements' should appear. If it does not, tell OWBot to 'fix output'
7. Edit and verify the parsed elements
8. Click 'save' or 'save all' to upload the elements to the world


 