---
layout: default
title: Framework
nav_order: 3
has_children: true
has_toc: false
---

# Framework Overview

OnlyWorlds represents world data primarily through a world's **elements**, the parts that together make a whole. 

It currently defines 18 [categories](/docs/framework/categories/) of elements: from the more obvious **Character** to the less familiar **Construct** or **Title**.

Each of these categories has its own constellation of [fields](/docs/framework/fields/): a series of named attributes that can hold a value of text, number, or other element(s). Finding the right collections and definitions of these fields is critical to the operation and intuitiveness of the platform.

Finally, for every category there is a set of [typings](/docs/framework/typings/): a system of (sub)categorizations that help organize and operate a world. This is a system that requires robust customization solutions, as its definitions can vary widely across different world settings.

All a world's elements, each with their typings and field values, are compiled into a (currently JSON-formatted) text file, together with a table on [world metadata](/docs/framework/world-metadata/).

These files can be imported to and exported from the OnlyWorlds web server by any software that supports it. The data remains easy to access to users and in their full creative control. See [operation](/docs/framework/operation/) for more details on this system.

Take a look at the [origins](/docs/framework/origins/) page for some history on the creation of this platform so far. 





