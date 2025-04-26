---
layout: default
title: Getting Started
nav_order: 2
has_children: false
---

# Getting Started

Welcome to OnlyWorlds! This guide will help you understand the basics and get your first world up and running.

## What You Need to Know First

OnlyWorlds is a standard for representing worlds as text-based data, not a single application. You can use various tools that understand this standard to create, view, edit, share, and operate your worlds.

At its core, an OnlyWorlds world utilizes a **structured data format**.
This means:
* Your world has defined metadata (name, owner, description, etc.).
* Elements are organized into logical categories (Character, Location, Object, Event, etc.).
* These elements have specific fields. All elements share a set of common **base fields** (like `Name`, `Id`, `Description`), and each category adds its own specific fields.
* Relationships between elements can be clearly defined (character X is located at place Y).

While this structure can be effectively  represented as JSON, the standard is flexible. Tools might store or interact with this data in various ways, but the underlying principle is organized, text-based information that enables interoperability.

## Creating Your First World

There are a few ways to get started with your first world:

### Method 1: Use the OnlyWorlds Website

The simplest way to begin:

1. Go to [OnlyWorlds.com](https://www.onlyworlds.com)
2. Create an account (or sign in)
3. Click "New World" 
4. Use the web interface to create and customize the world and its elements
 
### Method 2: Use Other Compatible Tools

Beyond the main website, you can work with OnlyWorlds data in other applications:

1. Check our [Tool Directory](../tool-directory/) for compatible applications (like Obsidian plugins or standalone editors).
2. Install the tool of your choice.
3. Look for options like "New OnlyWorlds Project" or follow the tool's specific setup guide.
4. Start building in that environment.

The OnlyWorlds format is designed to be tool-agnostic, allowing you to manage your world data across different applications.

## Basic Concepts

To make the most of OnlyWorlds, understand these key concepts:

* **Categories**: Different types of world elements (Character, Location, Object, Event, etc. - see the full list in the [Specification](../specification/)).
* **Fields**: Properties that describe an element. These include common **base fields** (like `Name`, `Id`, `Description`) shared by all elements, plus fields specific to each category.
* **Typings**: Sub-classifications within categories. These consist of 'Supertypes', each of which has a list of 'Subtypes'. This system is customizable, optional, and a work in progress. 

For more detail, see the [Core Concepts](../core-concepts/) section and the [Specification](../specification/).

## Recommended Workflow

A typical OnlyWorlds workflow might look like:

1. **Plan your world structure**: Decide on main characters, locations, and key elements
2. **Create your base elements**: Add the foundational pieces of your world
3. **Establish relationships**: Connect elements to each other (who knows whom, what belongs where)
4. **Refine and expand**: Gradually add detail and new elements
5. **Share or export**: Use your world in a game, story, or share with collaborators

## Getting Help

Stuck or have questions?

* Check the [FAQ](../faq/) for common questions
* Join tehe [Discord community](https://discord.gg/twCjqvVBwb) for real-time help
* Post on [GitHub Discussions](https://github.com/OnlyWorlds/OnlyWorlds/discussions) for technical questions
* Browse through more detailed guides in the [Guides](../guides/) section 