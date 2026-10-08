---
title: Legacy Tools
description: Retired OnlyWorlds tools, their status, and where their work lives now.
---

These tools are no longer developed. Those marked online still answer at their links, and the rest have been replaced. Current tools are listed on the [Tools](/docs/tools/) page.

## Base Tool

An all-round element editor with full field support and both online and offline workflows.

- **Status:** online, no longer developed. [base-tool.onlyworlds.com](https://base-tool.onlyworlds.com)
- Full CRUD on the 22 element categories, with inline editing and relationship management.
- Online (API) or offline (local JSON) modes.
- AI chat through OpenAI, with free daily tokens or a personal key.
- An import pipeline that validates and resolves AI-parsed world data.

## Write Tool

A general element editor with writing, presentation and graph features.

- **Status:** online, no longer developed. [onlyworlds.github.io/write-tool](https://onlyworlds.github.io/write-tool/)
- Writing environments for narrative and event editing.
- Graph view of element relationships, and reverse links showing what connects to each element.
- Showcase mode for presentation-ready views, and PDF export of elements.

## Zoner

Draws zones (polygons and lines) on maps using markers.

- **Status:** online, no longer developed. [zoner.onlyworlds.com](https://zoner.onlyworlds.com)
- Click to place markers, then drag them, insert points, or delete with right-click.
- Takes a map image URL, or works on a grid fallback.
- Optional sync to OnlyWorlds as Map, Zone and Marker elements, or a fully local workflow.
- Exports JSON compatible with the Base Tool migrator.

## Mobile Companion

The oldest tool in the directory: element creation and editing with a progression system that teaches OnlyWorlds concepts while you build.

- **Status:** Android beta APK only, no longer developed. The iOS beta is closed. [Android APK](https://drive.google.com/file/d/1ZBgudPtApUy6eR-kE0OuMKkGBF61aru0/view?usp=sharing)
- Offline creation with manual sync.
- A timeline prototype for mapping events and customizing time settings.
- Guided challenges that unlock rewards and features.

To install the APK, enable installation from unknown sources in your Android settings, download the file from Google Drive, install it, then fetch an existing world or start a new one.

## Little Lens (Element Viewer)

A read-only viewer for browsing, searching and exploring a world's elements and their connections.

- **Status:** online, no longer developed. [little-lens.onlyworlds.com](https://little-lens.onlyworlds.com/)
- Card grid with type-coloured icons, descriptions and link counts.
- Filters across 18 browsable categories, search over names and descriptions, and sorting alphabetically or by connections.
- Detail view with all fields, outgoing and reverse connections, and element images.
- A radial connection graph, a timeline bar, and a breadcrumb trail with browser back and forward support.
- Moppetopia pre-loaded as a demo world.

## Tool History

Tools that have been retired and replaced:

- **Text Tool.** An AI-parsing and YAML-editing tool, retired with the 2026 platform rebuild. Parsing now lives in the [Toolkit](/docs/development/toolkit) and the [MCP server](/docs/development/mcp).
- **Map Tool.** Maps, pins and hierarchies, retired with the same rebuild. Mapping now lives in [Atlas](/docs/tools/atlas).
- **The Old Browser Editor.** The first web workspace, superseded by [Atlas](/docs/tools/atlas) and the [onlyworlds.com](/docs/tools/onlyworlds-com) portal.

