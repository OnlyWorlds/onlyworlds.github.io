---
layout: default
title: Specification
nav_order: 3
has_children: true
has_toc: false
---     
 
*See the child.<a href="/docs/specification/element_categories/Character" title="Character"><span class="material-symbols-outlined" style="font-size: 18px;">person_4</span></a>
He is pale and thin,<a href="/docs/specification/element_categories/Trait" title="Trait"><span class="material-symbols-outlined" style="font-size: 18px;">flaky</span></a> he wears a thin and ragged linen shirt.<a href="/docs/specification/element_categories/Object" title="Object"><span class="material-symbols-outlined" style="font-size: 18px;">webhook</span></a> He stokes the scullery fire.<a href="/docs/specification/element_categories/Phenomenon" title="Phenomenon"><span class="material-symbols-outlined" style="font-size: 18px;">thunderstorm</span></a> Outside lie dark turned fields with rags of snow and darker woods beyond <a href="/docs/specification/element_categories/Location" title="Location"><span class="material-symbols-outlined" style="font-size: 18px;">castle</span></a> that harbor yet a few last wolves.<a href="/docs/specification/element_categories/Creature" title="Creature"><span class="material-symbols-outlined" style="font-size: 18px;">bug_report</span></a> His folk <a href="/docs/specification/element_categories/Family" title="Family"><span class="material-symbols-outlined" style="font-size: 18px;">supervisor_account</span></a> are known for hewers of wood and drawers of water <a href="/docs/specification/element_categories/Ability" title="Ability"><span class="material-symbols-outlined" style="font-size: 18px;">auto_fix_normal</span></a> but in truth his father <a href="/docs/specification/element_categories/Relation" title="Relation"><span class="material-symbols-outlined" style="font-size: 18px;">link</span></a> has been a schoolmaster.<a href="/docs/specification/element_categories/Title" title="Title"><span class="material-symbols-outlined" style="font-size: 18px;">military_tech</span></a> He lies in drink, he quotes from poets <a href="/docs/specification/element_categories/Construct" title="Construct"><span class="material-symbols-outlined" style="font-size: 18px;">api</span></a> whose names are now lost.*

*He rides up <a href="/docs/specification/element_categories/Event" title="Event"><span class="material-symbols-outlined" style="font-size: 18px;">saved_search</span></a> through the latterday republic of Fredonia <a href="/docs/specification/element_categories/Institution" title="Institution"><span class="material-symbols-outlined" style="font-size: 18px;">business</span></a> into the town of
Nacogdoches. The Reverend Green had been playing to a full house <a href="/docs/specification/element_categories/Collective" title="Collective"><span class="material-symbols-outlined" style="font-size: 18px;">groups_3</span></a> daily as long as the rain had
been falling and the rain had been falling for two weeks.<a href="/docs/specification/element_categories/Narrative" title="Narrative"><span class="material-symbols-outlined" style="font-size: 18px;">book</span></a>*

*He stood with others of his kind <a href="/docs/specification/element_categories/Species" title="Species"><span class="material-symbols-outlined" style="font-size: 18px;">crib</span></a> along the back wall. The only thing that might have
distinguished him in that crowd was that he was not armed. Neighbors, said the reverend, he couldn't stay out of these here hell,
hell, hellholes <a href="/docs/specification/element_categories/Language" title="Language"><span class="material-symbols-outlined" style="font-size: 18px;">edit_road</span></a> right here in Nacogdoches.* 

 
 


---
 

### Structure
- **[Worlds](worlds)** - Containers for any universe or setting
- **[Elements](element_categories/)** - Units that embody and define worlds
- **[Fields](fields)** - Properties that shape individual elements
- **[Types](types)** - Optional classification system for elements

### Implementation
- Schema defined in [YAML files](https://github.com/OnlyWorlds/OnlyWorlds/tree/main/schema) 
- Auto-generates language bindings
- RESTful API for tool integration
- Tools that integrate these bindings and interface with the API

### Data Format
- Elements use **UUIDv7** identifiers
- Relationships via **single & multi links** 
- Images via **URLs** (not embedded)

