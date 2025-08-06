---
layout: default
title: Vision & History
nav_order: 8
has_toc: false
---

# Vision & History
 
When you build a world, you might want to do more than just organize text: visualize it on maps, run simulations of its economy or politics, build games within it, explore it through different interfaces. Each approach requires different tools, but recreating your world's data for each tool is wasteful and error-prone. Finding a data expression flexible enough for any world type while maintaining the structure needed for all these different uses is complex.

OnlyWorlds attempts to solve this through a data standard that any tool can read and write, focusing on the universal patterns found across all worlds rather than genre-specific details. Every world is unique, but all worlds share fundamental patterns and content. The goal is to capture these commonalities in a way that preserves each world's distinctiveness while enabling seamless tool interoperability. 

---

## Core Philosophy

### Open Source & Community-Defined
The standard evolves through community input with all decisions happening in the open. OnlyWorlds facilitates the improvement of definitions, and changes come from actual usage and feedback.

### Free Forever
No ads, premium tiers, or paywalls exist in the core system. The standard itself and basic tools remain free. Running costs stay minimal through efficient design rather than monetization.

### Complete User Ownership
Your worlds remain your property with full export and deletion rights at any time. The standard ensures no vendor lock-in, allowing your data to work with any compatible tool now and in the future.

### Universal Tool Support
Any developer can build on OnlyWorlds without licensing fees or permission requirements. The goal is maximum tool diversity, giving creators genuine choice in how they work with their worlds.

---

## Potentially Frequently Asked Questions

<div style="border-left: 4px solid #4a5568; padding-left: 20px; margin: 20px 0;">

<h3>Big Picture</h3>

<p><strong>Q: Is this just another of many field-sets we see in world building tools?</strong><br>
A: Yes, but with deliberate purpose. It originated from one developer's interest in translating social, economic, and political processes into data structures. The categories and fields emerged through years of experimentation, seeking structures that could make complex world systems computable. Community feedback now drives evolution, building on this initial foundation.</p>

<p><strong>Q: Is OnlyWorlds another worldbuilding tool?</strong><br>
A: OnlyWorlds itself isn't a tool but a data standard that tools can use. The tools provided (parse tool, map tool, etc.) are essentially prototypes demonstrating what's possible. The real potential lies in what other developers build using the standard, creating an ecosystem of interoperable tools.</p>

<p><strong>Q: What advantages do these definitions offer?</strong><br>
A: Your worlds become portable and alive. Instead of being locked into one tool, they can move between applications, be visualized in different ways, simulated, analyzed, and extended. Ideally, the framework definitions are (will become) flexible and intuitive to work with, giving you creative freedom but also potential for more than just creating.</p>

<p><strong>Q: Is it really free?</strong><br>
A: No catch. The standard and core tools (onlyworlds.com, API, tool directory) will remain free. AI-powered features use a daily token limit to cover API costs, but are not essential. Years of development time already went into this, but maintaining free access ensures the widest possible adoption and community growth.</p>

</div>

<div style="border-left: 4px solid #4a5568; padding-left: 20px; margin: 20px 0;">

<h3>Technical</h3>

<p><strong>Q: How is world data stored and accessed?</strong><br>
A: OnlyWorlds.com uses a database for live editing and sharing through the World API. Worlds can also be expressed as complete JSON objects via the WorldSync API, which enables instant export and offline / private storage. World data is text-only and therefore very compact.</p>

<p><strong>Q: How does this compare to existing worldbuilding formats?</strong><br>
A: Most existing formats are tied to specific tools and can't be used outside of a specific domain. OnlyWorlds focuses on being tool-agnostic, allowing any application to read and write the same world data.</p>

<p><strong>Q: Can this handle large, complex worlds?</strong><br>
A: While there's a technical upper limit of elements per world to prevent system abuse, this should far exceed practical needs. OnlyWorlds is exactly designed to serve the complexity of large, interconnected worlds and the processes that might play out in them.</p>

</div>

<div style="border-left: 4px solid #4a5568; padding-left: 20px; margin: 20px 0;">

<h3>Development</h3>

<p><strong>Q: How stable is the standard for long term use?</strong><br>
A: The schema will continue evolving significantly as the community discovers new needs. However, a robust versioning system ensures your worlds remain compatible. OnlyWorlds commits to providing migration paths and maintaining backward compatibility. Your world data created today will still work years from now, even as the standard improves.</p>

<p><strong>Q: Can I add custom element types for my specific needs?</strong><br>
A: Custom categories and fields aren't supported as they would break portability between tools (a more customiazble foundation would be advantageous, but not likely in the short term). Types (supertypes and subtypes) are currently optional and customizable, and will likely be expanded in the future into a templating system.</p>

<p><strong>Q: Does this support multiple people working on the same world?</strong><br>
A: The data structure fully supports collaborative editing, and it's up to tool developers to build such features. Currently, worlds can be shared via API keys for basic collaboration. Users can also share worlds directly with other members on onlyworlds.com, so that they have direct access to the other's world data with their own PIN.</p>

</div>

---

 
## Project History

**2011-2016** - Early work on complex worlds, through game and tool development in Java and Unity3D

**2016-2019** - Development of [Worldsmith](https://github.com/worldsmithdev/Worldsmith), an open-source Unity engine featuring a complete economic simulation of ancient Sicily. Proof of concept for turning structured, general world data into a simulation-ready format

**2020-2022** - Master's program at Leiden University, focused on academic research and practical projects exploring world building topics. Resulted in a [master's thesis](https://theses.liacs.nl/pdf/2021-2022-OostingTitus.pdf) exploring how political power dynamics can translate to data structures, with a [Unity project](https://github.com/tmoosting/Schemer) that executed some of these ideas

**2022 - 2024** - Concepting and creation of onlyworlds.com. Closed alpha release in 2024 with a mobile app and some Unity and Obsidian tooling

**2025** - New website and API infrastructure published, new tools (parse, map, browse) created. Public release of OnlyWorlds

 