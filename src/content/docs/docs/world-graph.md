---
title: World graph
description: "An OnlyWorlds world is a graph of typed elements and links: how to read part of one, and the ideas it sits beside."
---

An OnlyWorlds world is a graph. Its elements are the nodes: Characters, Locations, Institutions, Laws, Events and the rest of the 22 element types (what a knowledge graph would call types or classes; inside each element type, a supertype sorts it first, a Character's might be Wizard, and a subtype sorts further). Its links are the edges, and every link is typed: a Character's `birthplace` points at a Location, and the field's name says what the link means. A Relation is a node of its own, with an edge to each party, so a link that needs fields of its own (a start date, an intensity) can carry them. Links point at ids, not names: [an element's identity is its id](/docs/schema/folders#layout).

## Reading part of a world

Because a world is a graph, you can read part of it: start from a few elements and follow their links, either way, one step (a hop) at a time. Every reading is made for one reader, the key or person doing the reading, and never shows what that reader may not see. This section covers three ways to read:

- **[A lens](/docs/lenses)** is a saved recipe for a reading: a few starting elements (the anchors), how many hops to go from them, which element types to keep, and how much to return. Any reader can resolve a lens over a world it can see, and a lens only narrows.
- **[The draught](/docs/world-graph/draught)** is one Character's reading of the world in one call: who they are, the Titles they hold, the Events they were in, in story order, and what names them. Given a lens, it adds that lens's reading as one more frame in the answer.
- **[The graph itself](/docs/lenses/graph)**: the SDKs read a world, or a lens's reading of it, as nodes and edges (`worldGraph`, `world_graph`), and count each element's links (`degreeOf`, `degree_of`, its degree), which is what "most linked" means when a search ranks its results. What a lens's budget or rules leave out, and every link to an element outside the reading, is counted by its reason, never dropped silently.

[Atlas](/docs/tools/atlas) draws any element's connections as a small graph, if you want to see one.

## Related ideas

The idea of reading part of a large structure from a focus has a long history. They help place it:

- **Fisheye views.** Furnas ("Generalized Fisheye Views", CHI 1986) gave every item a degree of interest: its a priori importance minus its distance from the current focus. A view shows the items at or above a threshold, or the n most interesting. A lens's anchors and budget echo it, and "most linked" is one way to rank by importance.
- **Magic Lenses.** Bier, Stone, Pier, Buxton and DeRose ("Toolglass and Magic Lenses", SIGGRAPH 1993) described a movable see-through filter that changes how the objects beneath it are shown. Editing there was done by other tools, used beside the lens or combined with it. An OnlyWorlds lens stays a reading.
- **Bidirectional lenses.** Foster, Greenwald, Moore, Pierce and Schmitt (POPL 2005, and the journal version in TOPLAS 2007) defined a lens on tree-shaped data as a pair: one function that extracts a view, and one that takes an edited view with the original and returns the updated original, an answer to the view-update problem. OnlyWorlds' lenses have only the first half; writing goes through the elements themselves.
- **Ontology modules.** Cuenca Grau, Horrocks, Kazakov and Sattler ("Modular Reuse of Ontologies", JAIR 2008) showed how to cut a module from an ontology that gives the same answers as the whole over a chosen set of terms. A lens shares the aim of a smaller piece you can work from; it is a recipe, not a guarantee of that kind.

## Next to other knowledge bases

Knowledge kept for AI agents comes in several forms today. Markdown knowledge bases link files without saying what a link means. Graph and ontology platforms type their knowledge, and the ones we've read fill it by binding, syncing or mining other sources. Enterprise search fills its index by pulling from connected tools. A world is a typed layer whose elements people write on purpose, alone or with their AI, and which can live as a [folder of files](/docs/schema/folders).

That difference has a known edge. Graphs built by an LLM from documents carry duplicates, because the common tools merge entities by matching names (shown in preprints on LLM-built graphs). In a world, links and identity rest on ids, so nothing merges two elements because their names match.

Whether an AI answers better from a world than from the same content as files is not known. The one test so far, an internal one on a single document of about 15,000 tokens turned into a world, sat at the ceiling for both (110 of 110 questions from the files, 109 of 110 from the world).
