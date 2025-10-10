---
layout: default
title: development
nav_order: 5
has_children: true
has_toc: false
---
  

OnlyWorlds is open source, license free, and encourages developers to use its infrastructure and tools for integration into existing or new tools. Feedback, co-development and other contributions from developers are appreciated. 

<div style="background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 24px; margin: 24px 0;">
  <div style="display: grid; gap: 12px;">
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="schema/" style="color: inherit;">Schema Repo</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">Primary GitHub repo with the core schema specifications (in YAML) and contribution guidelines </div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="api-reference/" style="color: inherit;">API Platform</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">API details for world data exchange </div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="packages/" style="color: inherit;">Packages</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">NPM and Python SDKs</div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="ai-integration/" style="color: inherit;">AI integration</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">Custom GPTs and MCP server to enable AI-powered development</div>
    </div>
  </div>
</div>
 
 
### Technical Notes

**Identifiers**: onlyworlds currently uses UUIDv7 for world and element IDs

**Format**: JSON API with YAML schema definitions

**Authentication**: API-Key and API-Pin headers for all requests

**Discovery**: Listed in [Context7 library](https://context7.com/OnlyWorlds/onlyworlds) for documentation search

