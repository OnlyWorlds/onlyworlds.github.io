---
layout: default
title: AI
parent: development
nav_order: 3
---

## Overview

OnlyWorlds data is structured, typed, and linked across 22 element categories. This makes it a natural fit for AI tooling: the schema is predictable, the API is consistent, and the format is the same regardless of the world's content. The resources below let any AI system read, write, and reason about OnlyWorlds data.

---

## General resources

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">LLM Guide</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">Standalone reference covering all 22 element types, their fields, and relationships. Drop this into any AI conversation to give it full schema context for building or discussing OnlyWorlds.</p>
<p style="margin-bottom: 0;"><a href="/assets/ow_llm_guide.txt" download>Download ow_llm_guide.txt</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">MCP Server</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">Model Context Protocol server that provides schema context to any MCP-compatible AI client. Also available on <a href="https://context7.com/onlyworlds/onlyworlds">Context7</a>. See the <a href="https://www.onlyworlds.com/mcp/">setup guide</a>.</p>
<p style="margin-bottom: 0;"><code>npm install @onlyworlds/mcp-client</code></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">OnlyWorldsBot</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">ChatGPT custom GPT preloaded with schema knowledge. Useful for worldbuilding questions and converting existing content into OnlyWorlds format.</p>
<p style="margin-bottom: 0;"><a href="https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot">chatgpt.com/g/g-dydgDFnOz-onlyworldbot</a></p>
</div>

</div>

---

## OnlyWorlds Toolkit

A Claude Code plugin with nine skills. Covers worldbuilding (parsing, modeling, exploring), world management (API operations, element linking), and development (SDK setup, schema reference, project configuration).

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

The toolkit also includes an orchestration agent (ow-agent) that coordinates multiple skills for complex multi-step operations, and a knowledge base covering schema reference, element type descriptions, and decision trees for ambiguous modeling choices.
