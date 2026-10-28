---
title: The draught
description: "One Character's reading of a world in one call, and how it takes a lens."
---

The **draught** is one Character's reading of a world in one call: what the recorded world holds around that Character, gathered into one answer. It holds the Character's own element, the Titles they hold and the bodies they sit in, their open work, how they work, the Events they were in, in story order, the Narratives they know, everything else that names them, their sheet, what changed around them, and who plays whom. It is made for a storyteller speaking as the Character, or an agent working in their name, that would otherwise make a dozen reads a turn.

Like every reading of a [world graph](/docs/world-graph), it is made for one reader. Nothing in it is inferred: every element in it is the body the list route serves the same reader, with the links that brought it, a count and a grade, and what is hidden from the reader is in no section. Its `voice` mode reads as the Character would; its `act` mode reads through your own key's view, for an agent doing work in the Character's name.

It takes a [lens](/docs/lenses). Given one, it adds that lens's reading, read for your own view, as one more frame in the answer. With no lens, and no policy parameter but `compact`, it adds one frame per lens you chose.

The route, `GET /api/v2/character/{id}/context`, with who may read it, its policy, its packet, its horizon and its errors, is on [The draught](/docs/development/api/draught) in the API section. The [MCP server](/docs/development/mcp)'s `get_draught` and both SDKs read it too.
