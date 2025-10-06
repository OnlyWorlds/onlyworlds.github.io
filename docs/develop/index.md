---
layout: default
title: Development
nav_order: 5
has_children: true
has_toc: false
---
 

onlyworlds provides open resources for building tools and integrations. All packages, APIs, and documentation are free to use with no commercial restrictions.

Feedback, forks, and contributions are encouraged. Use these resources to integrate onlyworlds into your existing tools or build new ones. onlyworlds strives to empower AI-assisted development.

## Development Resources

<div style="background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 24px; margin: 24px 0;">
  <div style="display: grid; gap: 12px;">
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="schema/" style="color: inherit;">Schema</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">YAML specifications for all 22 element categories, fields, and relationships</div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="api-reference/" style="color: inherit;">API Platform</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">World API, WorldSync, and Session API documentation</div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="packages/" style="color: inherit;">Packages</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">NPM and Python SDKs for TypeScript and Python integration</div>
    </div>
    <div style="border-left: 2px solid rgba(148, 163, 184, 0.5); padding-left: 16px;">
      <strong><a href="ai-integration/" style="color: inherit;">AI integration</a></strong>
      <div style="margin-top: 4px; font-size: 0.9em; opacity: 0.8;">Custom GPTs and MCP server for AI assistants</div>
    </div>
  </div>
</div>
 

## Technical Notes


**Identifiers**: onlyworlds currently uses UUIDv7 for world and element IDs

**Format**: JSON API with YAML schema definitions

**Authentication**: API-Key and API-Pin headers for all requests

**Discovery**: Listed in [Context7 library](https://context7.com/OnlyWorlds/onlyworlds) for documentation search 

**Modfiying or extending the schema in-software**: Is possible and encouraged (succesful or popular modifications might inspire schema changes). Note that the onlyworlds.com services and API is limited only current schema fields: customized data must be maintained externally.  

 