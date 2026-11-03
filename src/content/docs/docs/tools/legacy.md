---
title: Legacy tools
description: Retired OnlyWorlds tools, their status, and where their work lives now.
---

These tools are no longer developed. Those marked online still answer at their links, and the rest have been replaced. Current tools are listed on the [Tools](/docs/tools/) page.

## Base Tool

An all-round element editor with full field support and both online and offline workflows.

- **Status:** online, no longer developed. [base-tool.onlyworlds.com](https://base-tool.onlyworlds.com)
- Full CRUD on every element type, with inline editing and relationship management.
- Online (API) or offline (local JSON) modes.
- AI chat through OpenAI, with free daily tokens or a personal key.
- An import pipeline that validates and resolves AI-parsed world data.

## Easy Mobile

A quick mobile web editor for elements, online or offline.

- **Status:** online, no longer developed. [easy-mobile.onlyworlds.com](https://easy-mobile.onlyworlds.com); its page: [Easy Mobile](/docs/tools/easy-mobile).
- On a phone today, [Atlas](/docs/tools/atlas) holds together on a touch screen.

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

The Element Viewer is now Little Lens, a current tool, listed under [Tools](/docs/tools/). [little-lens.onlyworlds.com](https://little-lens.onlyworlds.com/)

- It only reads: a whole world as a web of its elements and links, each element with what it links to and what links to it, a world's lenses, its dated elements on a time strip, a Character's draught at a moment, and a world's messages.
- It opens a public world with no account, a world file or folder in the browser with nothing sent anywhere, or, signed in with OnlyWorlds, the worlds you own or joined.

## Tool history

Tools that have been retired and replaced:

- **Text Tool.** An AI-parsing and YAML-editing tool, retired with the 2026 platform rebuild. Parsing now lives in the [Toolkit](/docs/development/toolkit)'s import skill and the [MCP server](/docs/development/mcp).
- **Map Tool.** Maps, pins and hierarchies, retired with the same rebuild. Mapping now lives in [Atlas](/docs/tools/atlas).
- **The Old Browser Editor.** The first web workspace, superseded by [Atlas](/docs/tools/atlas) and the [onlyworlds.com](/docs/tools/onlyworlds-com) portal.

