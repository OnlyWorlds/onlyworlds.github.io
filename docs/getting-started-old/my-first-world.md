---
layout: default
title: your first world
parent: getting started (old)
nav_order: 1
---

# Your First World
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Create a world

A 'world' in onlyworlds can be as big as a multidimensional megaverse or as small as a minor ant-hill.
Its physical spacing and shape is largely defined by its [location](/docs/specification/element_categories/location.html) elements.

Before you start creating planet or worker tunnel [locations](/docs/specification/element_categories/location.html), you'll need to create the world itself.
onlyworlds.com offers a world creation and management interface for this.

### Setting up your account

- Create an account at [onlyworlds.com](https://onlyworlds.com) 
- Navigate to the **Profile** section
- A secret PIN value was automatically created with your account. You can change it here by filling the 'current password' field and pressing Enter

{: .warning }
> **Security Notice**  
> This PIN is used for authenticating your worlds in external tools. Keep it private and secure.

### Creating your first world

- Navigate to the **Worlds** section
- Click the **+** button to create a new world
- Change the default 'OnlyWorld' to the name of your world

{: .important }
> **API Key Security**  
> Notice the API key that was automatically created for your world. This unique value identifies your world for external tools.  
> Anyone with this key and your PIN has full access to your world through external tools. Keep this world key private unless you are explicitly sharing your world.

{: .note }
> **Additional Features**  
> This section offers more functionality:
> 
> 1. **Share access** with others who have an onlyworlds account. This gives them access to the world API key using their own PIN, granting full read and write access. Use with caution and trust. You can revoke access at any time by pressing the 'x' in the field that appears.
> 
> 2. **Export your world** and all its content into a JSON file. Use this freely to backup your world and keep it local. Some tools allow direct import and export of this data format, meaning you're not locked in to using the onlyworlds.com hosting.
> 
> 3. **Import world data** by pasting structured world data into the 'Overwrite' box to replace a world. Use with caution as a way to duplicate worlds.

---

## Create a character, born at a location

You can create, modify and delete elements for a world that you have selected in the interface.
Press an icon at the top to select an element category.

{: .note }
> The interface on onlyworlds.com is functional but, arguably, not quite beautiful. Use it as you like or need, but remember that onlyworlds is meant to integrate with other tools and applications. There are other tools, such as the [Write Tool](/docs/tools/write-tool.html) or [Obsidian Plugin](/docs/tools/obsidian-plugin.html), that might provide a better UI experience.

### Creating your first character

- Click the <span class="material-symbols-outlined">person_4</span> [Character](/docs/specification/element_categories/character.html) icon (first icon)
- Click the **+** button to create a new character
- Change the name of the new character to "the Consul"
- Press the **Save** button to persist this name change

{: .important }
> All elements in onlyworlds require a value in their `name` field. Other fields are always optional.  
> The `description` field can hold as much text as you like, as a catch-all for any information that doesn't fit in other fields.

### Creating a birthplace

- Click the <span class="material-symbols-outlined">castle</span> [Location](/docs/specification/element_categories/location.html) icon (third icon)
- Create a new [location](/docs/specification/element_categories/location.html)
- Change the name of the new [location](/docs/specification/element_categories/location.html) to "Hyperion" (the planet where we first encounter the Consul)
- Press the **Save** button

### Connecting character to birthplace

- Navigate back to the Consul
- Write something about the Consul in the `description` field or something about their physical or mental qualities in the `physicality` or `mentality` fields
- Scroll down to the `birthplace` field and select Hyperion
- Save your changes

{: .note }
> The `birthplace` field is a [single-link](/docs/specification/fields.html) field, which can reference exactly 0 or 1 elements.

### Adding possessions

- Click the <span class="material-symbols-outlined">webhook</span> [Object](/docs/specification/element_categories/object.html) icon (second icon)
- Create three [objects](/docs/specification/element_categories/object.html) that currently exist in your world and rename them; for example: "Consul's ship", "ancient datasphere access codes", "ceremonial staff"

- Navigate back to the Consul
- Scroll down to the `objects` field and use **Ctrl+Click** to select two [objects](/docs/specification/element_categories/object.html) that belong to the Consul
- Save your changes

{: .note }
> The `objects` field is a [multi-link](/docs/specification/fields.html) field, which can reference any number of other elements.

---

## Map your world

The [Map Tool](/docs/tools/map_tool.html) lets you place your elements on any map that you have at hand.
Let's first place the Consul at a [location](/docs/specification/element_categories/location.html) to enable some additional map tool functionality.

### Establishing character location

- Create a new [location](/docs/specification/element_categories/location.html) called "Valley of the Time Tombs" (or use Hyperion if you prefer)
- Establish that the Consul is currently at this [location](/docs/specification/element_categories/location.html) by assigning it to their `location` field

{: .note }
> You can use the familiar onlyworlds.com interface for this or try other tools: the [Write Tool](/docs/tools/write-tool.html), [Text Tool](/docs/tools/text-tool.html), [Obsidian Plugin](/docs/tools/obsidian-plugin.html) and [Mobile Companion](/docs/tools/mobile-companion.html) all offer field editing.

### Creating your first map

- Open the [Map Tool](https://onlyworlds.com/map_tool) and fill in your world's API key and your PIN, then click **Load World**
- Click the **+** button, enter a name for what the map represents, then click **Create Map**
- Copy your map image URL into the 'map image url' field

{: .important }
> **Image Hosting**  
> onlyworlds does not currently offer image hosting. All elements have an `image_url` field that can link to a single online image.  
> For most elements, this image can represent a kind of profile picture.  
> [Maps](/docs/specification/element_categories/map.html) are special elements, for which the `image_url` should link to an image that can function as a map.  
> You will have to supply your own image and host it online to use it for an onlyworlds [map](/docs/specification/element_categories/map.html).

### Placing elements on the map

- Click the **Load Map** button to load the image into the canvas
- Find the [location](/docs/specification/element_categories/location.html) where the Consul is in the sidebar and click it to select it, then click on the canvas to place its pin (or drag it there directly)
- Save your map using the **Save New Map** button in the top right

{: .warning }
> Your map will not be saved to your world until you save the map this way.  
> This button is available as soon as a map is loaded into the canvas.  
> Afterwards, make sure to save your map after each change or set of changes.

### Spawning elements at locations

You have previously established that the Consul is at the [location](/docs/specification/element_categories/location.html) that you just pinned.

- Click this [location](/docs/specification/element_categories/location.html)'s pin to select it
- Click the little sprout button in the sidebar to spawn all elements that are currently at this [location](/docs/specification/element_categories/location.html)
- Additionally, you can click the button again to remove all spawned elements. Click the zoom button to its left to max zoom in, then spawn again, to place the pins at near-overlap positions.

### Local map stacks

Relations between parent and child locations can also be inferred to create 'stacks' of embedded maps.

{: .note }
> onlyworlds distinguishes between two map types: 'local' and 'global' maps.  
> Local maps directly represent a specific [location](/docs/specification/element_categories/location.html), while global maps exist in a separate hierarchy.  
> All global maps live in the same 'stack', determined by their hierarchy value.  
> Local maps can form stacks if their [locations](/docs/specification/element_categories/location.html) are embedded.  
> Click the help icon in the top-left of the map tool for more information.

- If you haven't already, ensure you have Hyperion as a [location](/docs/specification/element_categories/location.html) representing the planet
- Create, find or placehold a map image that represents the Valley of the Time Tombs (where the Consul is)
- In the Valley of the Time Tombs' `parent_location` field, assign Hyperion (the planet contains the valley)

- Create a new map for Hyperion, assign the image URL, load it into canvas, then save it
- For each map, assign the [location](/docs/specification/element_categories/location.html) that it represents in the dropdown that has default value 'Global Map', then save it
- Load the 'child' map into the canvas
- Notice that the 'parent' [location](/docs/specification/element_categories/location.html) has a little map icon and click it
- Because the child and parent [locations](/docs/specification/element_categories/location.html) are linked to each other using the `parent_location` field, the popup shows the 'stack' of ordered maps

{: .note }
> This stack can grow deeper if you place [locations](/docs/specification/element_categories/location.html) at another depth tier.  
> If you were to have two same-tier [locations](/docs/specification/element_categories/location.html), such as buildings in a city, you can manually order their positions using the hierarchy field next to the map location dropdown.

### Global map stacks

- Create and save two new maps that are not representative of any [location](/docs/specification/element_categories/location.html) (leave the dropdown at default value 'Global Map')
- Assign each of them a hierarchy value and save. This value is relative to the order value: the map that encompasses the other map's physical space should have a lower hierarchy
- Load one of the maps into the canvas
- Click on the **Maps** section in the sidebar
- Click on the small map icon in the sidebar next to the other global map
- Notice that a global stack map is shown, reflecting the hierarchy values of the two global maps

{: .note }
> **Map Stack Types**  
> You can have any number of local map stacks, depending on inter-location and location-map relationships. Each world only has one global map stack.

{: .important }
> **Maps Section Rules**  
> 1. The loaded map is never shown here, only other maps
> 2. Local maps can NOT be pinned to the canvas because this might conflict with their representation by a location-pin
> 3. The global map stack is currently NOT affected by global map pin placement, only by hierarchy values

---

## Expand your world

These steps give you an introduction to some key concepts of the onlyworlds language and workflows.

You can try different features and approaches to further building out and visualizing your worlds. Keep an eye on the [tools](/docs/tools/) for current and upcoming tools. If there are tools or features that you are eager to access, consider following the [My First Tool](/docs/getting-started/my-first-tool.html) guide to create whatever you want to use yourself.

Please feel free to leave feedback on any aspects of the framework. If there is someting unclear, incorrect, or missing in this guide, that feedback is [also welcome](https://github.com/OnlyWorlds/OnlyWorlds/discussions/categories/feedback-bug-reports).

---

**Previous: [Understanding onlyworlds](understanding-onlyworlds)** | **Next: [Migration Guide](migration-guide)**

