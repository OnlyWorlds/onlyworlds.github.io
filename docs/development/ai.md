---
layout: default
title: AI
parent: development
nav_order: 3
---

## General resources

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">LLM Guide</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">Standalone reference document for any AI to enable discussion, development, resources.</p>
<p style="margin-bottom: 0;"><a href="/assets/ow_llm_guide.txt" download>Download ow_llm_guide.txt</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">OnlyWorldsBot</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">ChatGPT custom GPT for quick parsing and worldbuilding questions.</p>
<p style="margin-bottom: 0;"><a href="https://chatgpt.com/g/g-dydgDFnOz-onlyworldbot">chatgpt.com/g/g-dydgDFnOz-onlyworldbot</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">TypeScript SDK</h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">Client library for reading and writing world data.</p>
<p style="margin-bottom: 0;"><code>npm install @onlyworlds/sdk</code>&ensp;·&ensp;<a href="/docs/development/packages">details</a></p>
</div>

<div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1.25rem; background: rgba(255,255,255,0.03);">
<h3 style="margin-top: 0;">MCP Server </h3>
<p style="font-size: 0.9rem; margin-bottom: 0.75rem;">A <a href="https://www.onlyworlds.com/mcp/">dedicated OnlyWorlds server</a> provides schema context. Also available in context7 library.</p>
<p style="margin-bottom: 0;"><code>npm install @onlyworlds/mcp-client</code></p>
</div>

</div>

---

## OnlyWorlds toolkit

Most powerful solution: a Claude Code plugin for world building development and OnlyWorlds integration & handling. Its skills and knowledge files can be used by other types of local or web agents as well.

**Repository**: [github.com/OnlyWorlds/toolkit](https://github.com/OnlyWorlds/toolkit)

**Skills:**

| Skill | Capability |
|-------|-----------|
| **onlyworlds-start** | Orientation and routing to the right workflow |
| **project-setup** | Set up for one or more worlds (credentials, caching) |
| **parsing** | Turn text or scattered data into OnlyWorlds elements |
| **modeling** | Structure proprietary or complex systems using element categories |
| **schema** | Look up fields, validate structure |
| **api** | Create, read, update, and delete world elements |
| **dev** | Set up SDK and scaffold tools |

 