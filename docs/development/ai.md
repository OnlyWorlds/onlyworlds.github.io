---
layout: default
title: AI
parent: development
nav_order: 3
---

## Overview

OnlyWorlds data is structured, typed, and linked across 22 element categories. This makes it a natural fit for AI tooling: the schema is predictable, the API is consistent, and the format is the same regardless of the world's content. The resources below let any AI system read, write, and reason about OnlyWorlds data.

New to AI tools, or unsure where to begin? The guided on-ramp is [onlyworlds.com/develop](https://www.onlyworlds.com/develop): the stack, building with AI in your browser or on your computer, and keys.

---

## General resources

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">LLM Guide</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">A single text file that teaches an AI assistant the standard, the 22 types, the v2 API and the SDK, so it can help you build a tool. For full field definitions, point it at the schema or `FIELD_SCHEMA` in the SDK.</p>
<p style="margin-bottom: 0;"><a href="/assets/ow_llm_guide.txt" download>Download ow_llm_guide.txt</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">MCP Server</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">Hosted Model Context Protocol server that lets an MCP-capable AI client read and write your worlds directly — no local install. Eleven tools (schema, read, write).</p>
<p style="margin-bottom: 0;"><a href="https://www.onlyworlds.com/mcp">https://www.onlyworlds.com/mcp</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">OnlyWorldsBot</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">ChatGPT custom GPT preloaded with schema knowledge. Useful for worldbuilding questions and converting existing content into OnlyWorlds format.</p>
<p style="margin-bottom: 0;"><a href="https://chatgpt.com/g/g-dydgDFnOz-onlyworldsbot">chatgpt.com/g/g-dydgDFnOz-onlyworldsbot</a></p>
</div>

</div>

---

## OnlyWorlds Toolkit

A Claude Code plugin (v4.0.0) with twelve skills that follow the life of a world: **structure it** (parsing, modeling, schema), **grow it** (survey, link), **play in it and keep it true** (context, resolve: keep AI sessions in sync with the world), and **build on it** (api, dev, council, project-setup). Works on a world folder with no account; the API is optional.

**Install** (in Claude Code):

```
/plugin marketplace add OnlyWorlds/toolkit
/plugin install toolkit@onlyworlds
```

**Repository**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

| Skill | What it does |
|-------|-----------|
| **onlyworlds-start** | Entry point that routes to the right workflows |
| **project-setup** | Configure credentials, cache world data locally, set up for one or more worlds |
| **parsing** | Extract characters, locations, events, and other elements from your own work, novels, campaign notes, wikis, any text |
| **modeling** | Decompose complex systems (magic, politics, economies, tech trees) into OnlyWorlds elements |
| **schema** | Look up fields, validate element structure, disambiguate between similar types |
| **api** | Read, create, update, and delete elements through natural language. Handles auth, endpoints, and field mapping |
| **dev** | Scaffold projects with the SDK, configure credentials, set up local development |
| **survey** | Fetch all elements from a world and synthesize a creative brief covering its themes, tensions, and structure |
| **link** | Analyze a world's elements for missing connections and suggest potential Relations |
| **context** | Load the right part of a world into each AI session: fresh, scoped, sourced |
| **resolve** | Write what happened in a session back into the world so canon holds |
| **council** | Browse and draft schema governance motions when the 22 types don't fit |

The toolkit also includes an orchestration agent (ow-agent) that coordinates multiple skills for complex multi-step operations, and a knowledge base covering schema reference, element type descriptions, and decision trees for ambiguous modeling choices.
