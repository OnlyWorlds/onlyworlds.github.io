---
layout: default
title: Translation Examples
parent: Getting Started
nav_order: 4
---

# Translation ExamplesTwo texts, the openings of a science fiction and a historical fiction novel, are scraped here for <a href="/docs/specification/element_categories">OnlyWorlds elements</a>.

This shows how element categories can be understood, and how <a href="/docs/specification/types">types and subtypes</a> might be inferred. 


---
 

From Dan Simmons' **<a href="https://en.wikipedia.org/wiki/Hyperion_(Simmons_novel)">Hyperion</a>** (1989)

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Consul</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Original Text</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The <strong>Hegemony Consul</strong> sat on the balcony of his <strong>ebony spaceship</strong> and played <strong>Rachmaninov's Prelude in C-sharp Minor</strong> on an ancient but well-maintained <strong>Steinway</strong> while great, green, <strong>saurian things</strong> surged and bellowed in the <strong>swamps below</strong>.

</div>
</div>

<div>
<h4 style="color: #90cdf4; margin-bottom: 15px;">Parsed Elements</h4>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Hegemony'<br>
<span style="color: #a0aec0; margin-left: 40px;">Sovereignty - Imperial</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Hegemony Consul'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Official</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">military_tech</span><strong><a href="/docs/specification/element_categories/title">Title</a></strong> 'Consul of Hegemony'<br>
<span style="color: #a0aec0; margin-left: 40px;">Leadership</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Ebony Spaceship'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Spaceship</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Spaceship Balcony'<br>
<span style="color: #a0aec0; margin-left: 40px;">Component - Structural</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">auto_fix_normal</span><strong><a href="/docs/specification/element_categories/ability">Ability</a></strong> 'Piano Playing'<br>
<span style="color: #a0aec0; margin-left: 40px;">Musical - Piano</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Rachmaninov's Prelude in C-sharp Minor'<br>
<span style="color: #a0aec0; margin-left: 40px;">Composition - Creative</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Ancient Steinway'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Instrument</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Marsh Saurian'<br>
<span style="color: #a0aec0; margin-left: 40px;">Fauna</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">bug_report</span><strong><a href="/docs/specification/element_categories/creature">Creature</a></strong> 'Big Green Saurian'<br>
<span style="color: #a0aec0; margin-left: 40px;">Animal - Dinosaur</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Swamps Below'<br>
<span style="color: #a0aec0; margin-left: 40px;">Biome - Swamp</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Storm and Wildlife</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

A <strong>thunderstorm</strong> was brewing to the north. Bruise-black clouds silhouetted a <strong>forest of giant gymnosperms</strong> while <strong>stratocumulus</strong> towered nine kilometers high in a violent sky. <strong>Lightning</strong> rippled along the horizon.

Closer to the ship, occasional vague, reptilian shapes would blunder into the <strong>interdiction field</strong>, cry out, and then crash away through indigo mists.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Northern Thunderstorm'<br>
<span style="color: #a0aec0; margin-left: 40px;">Meteorological - Storm</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Giant Gymnosperm'<br>
<span style="color: #a0aec0; margin-left: 40px;">Flora</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Forest of Giants'<br>
<span style="color: #a0aec0; margin-left: 40px;">Biome - Forest</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Stratocumulus Clouds'<br>
<span style="color: #a0aec0; margin-left: 40px;">Meteorological - Atmosphere</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Rippling Lightning'<br>
<span style="color: #a0aec0; margin-left: 40px;">Meteorological - Discharge</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Interdiction Field System'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Security</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Interdiction Field'<br>
<span style="color: #a0aec0; margin-left: 40px;">Machine - Security</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The <strong>fatline receiver</strong> chimed. The Consul stopped, fingers hovering above the keyboard, and listened. Thunder rumbled through the heavy air. From the direction of the gymnosperm forest there came the mournful ululation of a <strong>carrion-breed pack</strong>. Somewhere in the darkness below, a small-brained beast trumpeted its answering challenge and fell quiet.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Fatline System'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Communication</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Fatline Receiver'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Instrument</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Carrion-Breed Saurian'<br>
<span style="color: #a0aec0; margin-left: 40px;">Fauna</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">bug_report</span><strong><a href="/docs/specification/element_categories/creature">Creature</a></strong> 'Carrion Pack Alpha'<br>
<span style="color: #a0aec0; margin-left: 40px;">Animal - Carnivore</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Carrion-Breed Pack'<br>
<span style="color: #a0aec0; margin-left: 40px;">Cohort - Survivors</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Fatline Message</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'Damn,' said the Consul and went in to answer it. While the computer took a few seconds to convert and decode the burst of <strong>decaying tachyons</strong>, the Consul poured himself a glass of Scotch. He settled into the cushions of the <strong>projection pit</strong> just as the <strong>diskey</strong> blinked green. 'Play,' he said.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Tachyon Transmission'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Communication</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Glass of Scotch'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Consumable</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Projection Pit'<br>
<span style="color: #a0aec0; margin-left: 40px;">Component - Room</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Diskey'<br>
<span style="color: #a0aec0; margin-left: 40px;">Object - Machine</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Diskey'<br>
<span style="color: #a0aec0; margin-left: 40px;">Machine - Operation</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Consul Answers Call'<br>
<span style="color: #a0aec0; margin-left: 40px;">Knowledge - Receive</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'You have been chosen to return to <strong>Hyperion</strong>,' came a woman's husky voice. Full visuals had not yet formed; the air remained empty except for the pulse of transmission codes which told the Consul that this fatline squirt had originated on the Hegemony administrative world of <strong>Tau Ceti Center</strong>. The Consul did not need the transmission coordinates to know this. The aged but still beautiful voice of <strong>Meina Gladstone</strong> was unmistakable.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Hyperion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Celestial - Planet</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Tau Ceti Center'<br>
<span style="color: #a0aec0; margin-left: 40px;">Celestial - World</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Transmission Coordinates'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Data</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Meina Gladstone'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Leader</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Husky Voice'<br>
<span style="color: #a0aec0; margin-left: 40px;">Physical - Distinctive</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Eleven Years as Consul'<br>
<span style="color: #a0aec0; margin-left: 40px;">Career - Service</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'You have been chosen to return to Hyperion as a member of the <strong>Shrike Pilgrimage</strong>,' continued the voice. The hell you say, thought the Consul and rose to leave the pit. 'You and six others have been selected by the <strong>Church of the Shrike</strong> and confirmed by the <strong>All Thing</strong>,' said Meina Gladstone.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Shrike Pilgrimage'<br>
<span style="color: #a0aec0; margin-left: 40px;">Enterprise - Spiritual</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Shrike Pilgrimage'<br>
<span style="color: #a0aec0; margin-left: 40px;">Historical - Procedural</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Church of the Shrike'<br>
<span style="color: #a0aec0; margin-left: 40px;">Organization - Spiritual</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'All Thing'<br>
<span style="color: #a0aec0; margin-left: 40px;">Entity</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Crisis Explained</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'The situation is very confused,' said Meina Gladstone. Her voice was weary. 'The <strong>consulate</strong> and <strong>Home Rule Council</strong> fatlined us three standard weeks ago with the news that the <strong>Time Tombs</strong> showed signs of opening. The <strong>anti-entropic fields</strong> around them were expanding rapidly and the <strong>Shrike</strong> has begun ranging as far south as the <strong>Bridle Range</strong>.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Consulate'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Diplomatic</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Home Rule Council'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Governance</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Time Tomb Communication'<br>
<span style="color: #a0aec0; margin-left: 40px;">Knowledge - Supply</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Time Tombs'<br>
<span style="color: #a0aec0; margin-left: 40px;">Anomalous</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Anti-Entropic Fields'<br>
<span style="color: #a0aec0; margin-left: 40px;">Barrier</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">bug_report</span><strong><a href="/docs/specification/element_categories/creature">Creature</a></strong> 'The Shrike'<br>
<span style="color: #a0aec0; margin-left: 40px;">Monster</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Hundred-facet Ruby Gaze'<br>
<span style="color: #a0aec0; margin-left: 40px;">Physical - Distinctive</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Bridle Range'<br>
<span style="color: #a0aec0; margin-left: 40px;">Geographical - Mountain Range</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'<strong>AFORCE:space task force</strong> was immediately dispatched from <strong>Parvati</strong> to evacuate the <strong>Hegemony citizens</strong> on Hyperion before the Time Tombs open. Their <strong>time-debt</strong> will be a little more than three Hyperion years.' Meina Gladstone paused. The Consul thought he had never seen the <strong>Senate CEO</strong> look so grim.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'AFORCE'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Tactical</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Parvati'<br>
<span style="color: #a0aec0; margin-left: 40px;"></span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Hegemony Citizens'<br>
<span style="color: #a0aec0; margin-left: 40px;">Community - Resident</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Time Tombs Opening'<br>
<span style="color: #a0aec0; margin-left: 40px;">Future</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Time-Debt'<br>
<span style="color: #a0aec0; margin-left: 40px;">Temporal</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Time-Debt Accrual'<br>
<span style="color: #a0aec0; margin-left: 40px;">Scientific - Temporal</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Hegemony Senate'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Executive</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">military_tech</span><strong><a href="/docs/specification/element_categories/title">Title</a></strong> 'Senate CEO'<br>
<span style="color: #a0aec0; margin-left: 40px;">Leadership - Executive</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Ouster Threat</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'We do not know if the <strong>evacuation fleet</strong> will arrive in time,' she said, 'but the situation is even more complicated. An <strong>Ouster migration cluster</strong> of at least four thousand . . . units . . . has been detected approaching the <strong>Hyperion system</strong>. Our evacuation task force should arrive only a short while before the Ousters.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Evacuation Fleet'<br>
<span style="color: #a0aec0; margin-left: 40px;">Fleet - Support</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Hyperion Evacuation'<br>
<span style="color: #a0aec0; margin-left: 40px;">Future</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Hyperion System'<br>
<span style="color: #a0aec0; margin-left: 40px;">Celestial - System</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Ouster'<br>
<span style="color: #a0aec0; margin-left: 40px;">Folk</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Ouster Migration Cluster'<br>
<span style="color: #a0aec0; margin-left: 40px;">Fleet - Migration</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Ouster Invasion of Hyperion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Future</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

An Ouster migration cluster might consist of ships ranging in size from single-person <strong>ramscouts</strong> to <strong>can cities</strong> and <strong>comet forts</strong> holding tens of thousands of the interstellar barbarians. 'The <strong>FORCE joint chiefs</strong> believe that this is the Ousters' big push,' said Meina Gladstone.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Ramscout'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Spacecraft</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Can City'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Spacecraft</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Comet Fort'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Spacecraft</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'FORCE Joint Chiefs'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Strategic</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'Whether they seek to control just Hyperion for the Time Tombs or whether this is an all-out attack on the <strong>Worldweb</strong> remains to be seen. In the meantime, a full <strong>FORCE:space battle fleet</strong> complete with a <strong>farcaster construction battalion</strong> has spun up from the <strong>Camn System</strong> to join the evacuation task force.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'WorldWeb'<br>
<span style="color: #a0aec0; margin-left: 40px;">Conglomerate - Syndicate</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Fleet Mobilization'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Deployment</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'FORCE:Space Battle Fleet'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Navy</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Farcaster Construction Battalion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Engineering</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Camn System'<br>
<span style="color: #a0aec0; margin-left: 40px;">Celestial - System</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Unless a <strong>military farcaster</strong> were hurriedly constructed in the Hyperion system – at staggering expense – there would be no way to resist the Ouster invasion. Whatever <strong>secrets the Time Tombs</strong> might hold would go to the Hegemony's enemy.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Military Farcaster'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Military</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Farcaster Construction'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Infrastructure</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Secrets of the Time Tombs'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Knowledge</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Ouster Invasion Defense Challenge'<br>
<span style="color: #a0aec0; margin-left: 40px;">Dilemma - Strategic</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The Consul tried to imagine the reality of <strong>armored Ouster troops</strong> stepping through <strong>farcaster portals</strong> into the undefended <strong>home cities</strong> on a hundred worlds.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Ouster Armor'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Military</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Ouster Armored Troops'<br>
<span style="color: #a0aec0; margin-left: 40px;">Warband - Raider</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Farcaster Portal'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Gateway</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Home Cities'<br>
<span style="color: #a0aec0; margin-left: 40px;">Settlement - Urban</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Pilgrimage Mission</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'You have been chosen to join the pilgrimage to the Shrike,' said the image of the old CEO whom the press loved to compare to Lincoln or Churchill or <strong>Alvarez-Temp</strong> or whatever other pre-<strong>Hegira</strong> legend was in historical vogue at the time. 'The <strong>Templars</strong> are sending their <strong>treeship Yggdrasill</strong>,' said Gladstone.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Alvarez-Temp'<br>
<span style="color: #a0aec0; margin-left: 40px;">Historical</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Hegira'<br>
<span style="color: #a0aec0; margin-left: 40px;">Historical</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Templars'<br>
<span style="color: #a0aec0; margin-left: 40px;">Organization</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Treeships'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Transport</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Treeship Yggdrasill'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Spacecraft</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'And the <strong>evacuation task force commander</strong> has instructions to let it pass. With a three-week time-debt, you can rendezvous with the Yggdrasill before it goes <strong>quantum</strong> from the Parvati system.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Evacuation Task Force Commander'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Commander</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Quantum Travel'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Transport</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'The six other pilgrims chosen by the Shrike Church will be aboard the treeship. Our <strong>intelligence reports</strong> suggest that at least one of the seven pilgrims is an <strong>agent of the Ousters</strong>. We do not . . . at this time . . . have any way of knowing which one it is.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Intelligence Reports on Ouster Agent'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Document</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Ouster Agent'<br>
<span style="color: #a0aec0; margin-left: 40px;">Unidentified</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Ouster Spy Identification'<br>
<span style="color: #a0aec0; margin-left: 40px;">Dilemma - Intelligence</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Or had she given him any crucial information? The fleet movements were detectable as soon as the ships used their <strong>Hawking drives</strong>, and if the Consul were the spy, the CEO's revelation might be a way to scare him off. The Consul's smile faded and he drank his Scotch. '<strong>Sol Weintraub</strong> and <strong>Fedmahn Kassad</strong> are among the seven pilgrims chosen,' said Gladstone.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Hawking Drive'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Propulsion</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Sol Weintraub'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'Fedmahn Kassad'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'We need your help,' said Meina Gladstone. 'It is essential that the <strong>secrets of the Time Tombs and Shrike</strong> be uncovered. This pilgrimage may be our last chance. If the Ousters conquer Hyperion, their agent must be eliminated and the Time Tombs sealed at all cost. The fate of the Hegemony may depend upon it.'

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Secrets of the Shrike'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Knowledge</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Potential Ouster Conquest of Hyperion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Invasion</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The transmission ended except for the pulse of <strong>rendezvous coordinates</strong>. 'Response?' asked the <strong>ship's computer</strong>. Despite the tremendous energies involved, the spacecraft was capable of placing a brief, <strong>coded squirt</strong> into the incessant babble of <strong>FTL bursts</strong> which tied the human portions of the galaxy together.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Consul Rendezvous Coordinates'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Spatial</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Ship's Computer'<br>
<span style="color: #a0aec0; margin-left: 40px;">System - Operations</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Coded Squirt Reply'<br>
<span style="color: #a0aec0; margin-left: 40px;">Information - Transmission</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'FTL Information Transmission'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Communication</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Reflections and Memory</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

'No,' said the Consul and went outside to lean on the balcony railing. Night had fallen and the clouds were low. No stars were visible. The darkness would have been absolute except for the intermittent flash of lightning to the north and a soft <strong>phosphorescence</strong> rising from the marshes. The Consul was suddenly very aware that he was, at that second, the only sentient being on an <strong>unnamed world</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Phosphorescent Damp'<br>
<span style="color: #a0aec0; margin-left: 40px;">Chemical</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Unnamed World'<br>
<span style="color: #a0aec0; margin-left: 40px;">Celestial - Planet</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

He listened to the antediluvian night sounds rising from the swamps and he thought about morning, about setting out in the <strong>Vikken EMV</strong> at first light, about spending the day in sunshine, about <strong>hunting big game</strong> in the <strong>fern forests</strong> to the south and then returning to the ship in the evening for a good steak and a cold beer.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Vikken EMV'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Transport</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">auto_fix_normal</span><strong><a href="/docs/specification/element_categories/ability">Ability</a></strong> 'Big Game Hunting'<br>
<span style="color: #a0aec0; margin-left: 40px;">Survival</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Fern Forests'<br>
<span style="color: #a0aec0; margin-left: 40px;">Biome - Forest</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

He climbed the <strong>spiral staircase</strong> to his sleeping cabin at the apex of the ship. The circular room was dark except for silent explosions of lightning which outlined rivulets of rain coursing the skylight. The Consul stripped, lay back on the firm mattress, and switched on the <strong>sound system</strong> and external audio pickups. He listened as the fury of the storm blended with the violence of Wagner's 'Flight of the Valkyries'. <strong>Hurricane winds</strong> buffeted the ship.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Spiral Staircase'<br>
<span style="color: #a0aec0; margin-left: 40px;">Component - Structural</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Sound System'<br>
<span style="color: #a0aec0; margin-left: 40px;">Machine - AudioVisual</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Hurricane Winds'<br>
<span style="color: #a0aec0; margin-left: 40px;">Meteorological - Wind</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Wagner is good only for thunderstorms, he thought. He closed his eyes but the lightning was visible through closed eyelids. He remembered the glint of <strong>ice crystals</strong> blowing through the <strong>tumbled ruins</strong> on the <strong>low hills near the Time Tombs</strong> and the colder gleam of steel on the Shrike's impossible tree of metal thorns. He remembered <strong>screams in the night</strong> and the hundred-facet, ruby-and-blood gaze of the Shrike itself.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Ice Crystals'<br>
<span style="color: #a0aec0; margin-left: 40px;">Resource - Natural</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Low Hills near the Time Tombs'<br>
<span style="color: #a0aec0; margin-left: 40px;">Geographical - Hills</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Tumbled Ruins'<br>
<span style="color: #a0aec0; margin-left: 40px;">Settlement - Abandoned</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Shrike's Tree of Metal Thorns'<br>
<span style="color: #a0aec0; margin-left: 40px;">Weapon - Supernatural</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Screams in the Night'<br>
<span style="color: #a0aec0; margin-left: 40px;">Violence</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The Consul silently commanded the computer to shut off all speakers and raised his wrist to cover his eyes. In the sudden silence he lay thinking about how insane it would be to return to Hyperion. During his eleven years as Consul on that distant and enigmatic world, the mysterious Church of the Shrike had allowed a dozen barges of <strong>offworld pilgrims</strong> to depart for the <strong>windswept barrens</strong> around the Time Tombs, north of the mountains. No one had returned.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Silent Computer Controls'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Operation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Offworld Pilgrimages to the Time Tombs'<br>
<span style="color: #a0aec0; margin-left: 40px;">Cultural - Journey</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Windswept Barrens'<br>
<span style="color: #a0aec0; margin-left: 40px;">Geographical - Plains</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Departure</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The Consul thought of the Shrike, free to wander everywhere on Hyperion, of the millions of indigenies and thousands of Hegemony citizens helpless before a creature which defied physical laws and which communicated only through death, and he shivered despite the warmth of the cabin. Hyperion. The night and storm passed. Another stormfront raced ahead of the approaching dawn. Gymnosperms two hundred meters tall bent and whipped before the coming torrent. Just before first light, the Consul's ebony spaceship rose on a tail of <strong>blue plasma</strong> and punched through thickening clouds as it climbed toward space and rendezvous.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Blue Plasma Tail'<br>
<span style="color: #a0aec0; margin-left: 40px;">Energy</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Consul Departs for Rendezvous'<br>
<span style="color: #a0aec0; margin-left: 40px;">Historical</span>
</div>

</div>
</div>

</div>

</details>

---  

From David Grann's **<a href="https://en.wikipedia.org/wiki/The_Wager:_A_Tale_of_Shipwreck,_Mutiny_and_Murder">The Wager: A Tale of Shipwreck, Mutiny and Murder</a>** (2021)

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The First Lieutenant</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Each man in <strong>the squadron</strong> carried, along with a <strong>sea chest</strong>, his own burdensome story. Perhaps it was of a scorned love, or a secret prison conviction, or a pregnant wife left on shore weeping. Perhaps it was a <strong>hunger for fame and fortune</strong>, or a <strong>dread of death</strong>.

<strong>David Cheap</strong>, the first lieutenant of the <strong>Centurion</strong>, the squadron's flagship, was no different. A burly Scotsman in his early forties with a protracted nose and intense eyes, he was in flight—from squabbles with his brother over their inheritance, from creditors chasing him, from debts that made it impossible for him to find a suitable bride.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'The Squadron'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Fleet</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Sea Chest'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Container</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Hunger for Fame and Fortune'<br>
<span style="color: #a0aec0; margin-left: 40px;">Ambition</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Fear of Death'<br>
<span style="color: #a0aec0; margin-left: 40px;">Dread</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Human'<br>
<span style="color: #a0aec0; margin-left: 40px;">Folk</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Scottish'<br>
<span style="color: #a0aec0; margin-left: 40px;">Ethnicity</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'David Cheap'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Commander</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">psychology</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Protracted Nose'<br>
<span style="color: #a0aec0; margin-left: 40px;">Physical - Distinctive</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">military_tech</span><strong><a href="/docs/specification/element_categories/title">Title</a></strong> 'First Lieutenant of the Centurion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Leadership - Executive</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Centurion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Vehicle - Ship</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Cheap's Troubles'<br>
<span style="color: #a0aec0; margin-left: 40px;">Personal</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Inheritance Dispute'<br>
<span style="color: #a0aec0; margin-left: 40px;">Personal - Legal</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'David Cheap's Brother'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Relation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Cheap's Creditors'<br>
<span style="color: #a0aec0; margin-left: 40px;">Social - Financial</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Posting on the Centurion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Assignment</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The <strong>wooden world of a ship</strong>—a world bound by the <strong>Navy's rigid regulations</strong> and the <strong>laws of the sea</strong> and, most of all, by the hardened fellowship of men—had provided him a refuge.

The problem was that he could not get away from the damned land. He was trapped—cursed, really—at the <strong>dockyard in Portsmouth</strong>, along the <strong>English Channel</strong>, struggling with feverish futility to get the Centurion fitted out and ready to sail.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Wooden World of a Ship'<br>
<span style="color: #a0aec0; margin-left: 40px;">Concept - Social</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">gpp_bad</span><strong><a href="/docs/specification/element_categories/law">Law</a></strong> 'Navy Regulations'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Code</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">gpp_bad</span><strong><a href="/docs/specification/element_categories/law">Law</a></strong> 'Laws of the Sea'<br>
<span style="color: #a0aec0; margin-left: 40px;">Maritime - International</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Portsmouth'<br>
<span style="color: #a0aec0; margin-left: 40px;">Settlement - Port</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Portsmouth Dockyard'<br>
<span style="color: #a0aec0; margin-left: 40px;">Industrial - Naval</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'English Channel'<br>
<span style="color: #a0aec0; margin-left: 40px;">Geographic - Water</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Stuck at Portsmouth'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Stasis</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">Additional Passages</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

<strong>Onshore</strong>, Cheap seemed doomed, unable to navigate past life's unexpected shoals. Yet as he perched on the <strong>quarterdeck</strong> of a British man-of-war, cruising the vast oceans with a <strong>cocked hat</strong> and <strong>spyglass</strong>, he brimmed with <strong>confidence</strong>—even, some would say, a touch of <strong>haughtiness</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Quarterdeck'<br>
<span style="color: #a0aec0; margin-left: 40px;">Component - Command</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Cocked Hat'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Clothing</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Spyglass'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Instrument</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Confident on Water'<br>
<span style="color: #a0aec0; margin-left: 40px;">Temperament</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Suddenly he felt a crystalline order, a clarity of purpose. And Cheap's newest posting, despite the innumerable risks that it carried, from <strong>plagues</strong> and drowning to enemy <strong>cannon fire</strong>, offered what he longed for: a chance to finally claim a <strong>wealthy prize</strong> and rise to captain his own ship, becoming a lord of the sea.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">thunderstorm</span><strong><a href="/docs/specification/element_categories/phenomenon">Phenomenon</a></strong> 'Plague'<br>
<span style="color: #a0aec0; margin-left: 40px;">Biological - Disease</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Cannon Fire'<br>
<span style="color: #a0aec0; margin-left: 40px;">Technology - Military</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Wealthy Prize'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Acquisition</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Captaincy'<br>
<span style="color: #a0aec0; margin-left: 40px;">Title - Leadership</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Lieutenant's Hope'<br>
<span style="color: #a0aec0; margin-left: 40px;">Ambition</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">The Dockyard</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Its massive wooden <strong>hull</strong>, 144 feet long and 40 feet wide, was moored at a slip. <strong>Carpenters</strong>, caulkers, <strong>riggers</strong>, and <strong>joiners</strong> combed over its decks like <strong>rats</strong> (which were also plentiful).

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Centurion's Hull'<br>
<span style="color: #a0aec0; margin-left: 40px;">Component</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Carpenter'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Rigger'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Joiner'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Centurion Crew'<br>
<span style="color: #a0aec0; margin-left: 40px;">Workforce - Crew</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">crib</span><strong><a href="/docs/specification/element_categories/species">Species</a></strong> 'Rat'<br>
<span style="color: #a0aec0; margin-left: 40px;">Fauna</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">bug_report</span><strong><a href="/docs/specification/element_categories/creature">Creature</a></strong> 'Fattest Rat on the Centurion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Animal - Omnivore</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Centurion Rats'<br>
<span style="color: #a0aec0; margin-left: 40px;">Cohort - Survivors</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

A cacophony of <strong>hammers</strong> and <strong>saws</strong>. The <strong>cobblestone streets</strong> past the shipyard were congested with rattling wheelbarrows and horse-drawn wagons, with porters, peddlers, pickpockets, sailors, and prostitutes.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Hammer'<br>
<span style="color: #a0aec0; margin-left: 40px;">Object - Tool</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Saw'<br>
<span style="color: #a0aec0; margin-left: 40px;">Object - Tool</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Rusty Saw'<br>
<span style="color: #a0aec0; margin-left: 40px;">Tool</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Noise at the shipyard'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Noise</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">castle</span><strong><a href="/docs/specification/element_categories/location">Location</a></strong> 'Cobblestone Streets'<br>
<span style="color: #a0aec0; margin-left: 40px;">Settlement - Roads</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">groups_3</span><strong><a href="/docs/specification/element_categories/collective">Collective</a></strong> 'Portsmouth Populace'<br>
<span style="color: #a0aec0; margin-left: 40px;">Community - Resident</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Shipyard Congestion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Movement</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Porter'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Peddler'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Pickpocket'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Sailor'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Prostitute'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Periodically, a <strong>boatswain</strong> blew a chilling <strong>whistle</strong>, and crewmen stumbled from <strong>ale shops</strong>, parting from old or new sweethearts, hurrying to their departing ships in order to avoid their officers' <strong>lashes</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">military_tech</span><strong><a href="/docs/specification/element_categories/title">Title</a></strong> 'Boatswain'<br>
<span style="color: #a0aec0; margin-left: 40px;">Leadership - Executive</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Boatswain'<br>
<span style="color: #a0aec0; margin-left: 40px;">Title - Leadership</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">webhook</span><strong><a href="/docs/specification/element_categories/object">Object</a></strong> 'Boatswain's Whistle'<br>
<span style="color: #a0aec0; margin-left: 40px;">Cultural - Signal</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Boatswain's Whistle'<br>
<span style="color: #a0aec0; margin-left: 40px;">Item - Instrument</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Ale Shop'<br>
<span style="color: #a0aec0; margin-left: 40px;">Object - Building</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Boatswain Whistles'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Summon</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Crewmen Return'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Deployment</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Officer's Lash'<br>
<span style="color: #a0aec0; margin-left: 40px;">Punishment - Professional</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

It was January 1740, and the <strong>British Empire</strong> was racing to mobilize for war against its imperial rival <strong>Spain</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'British Empire'<br>
<span style="color: #a0aec0; margin-left: 40px;">Sovereignty - Imperial</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Spanish Empire'<br>
<span style="color: #a0aec0; margin-left: 40px;">Sovereignty - Imperial</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'British War Mobilization'<br>
<span style="color: #a0aec0; margin-left: 40px;">Military - Buildup</span>
</div>

</div>
</div>

</div>

</details>

<details>
<summary style="cursor: pointer; font-weight: bold; margin: 20px 0;">George Anson</summary>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

And in a move that had suddenly raised Cheap's prospects, the captain under whom he served on the Centurion, <strong>George Anson</strong>, had been plucked by the <strong>Admiralty</strong> to be a <strong>commodore</strong> and lead the squadron of five warships against the Spanish.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Anson's Promotion'<br>
<span style="color: #a0aec0; margin-left: 40px;">Professional - Promotion</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">person_4</span><strong><a href="/docs/specification/element_categories/character">Character</a></strong> 'George Anson'<br>
<span style="color: #a0aec0; margin-left: 40px;">Human - Leader</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">business</span><strong><a href="/docs/specification/element_categories/institution">Institution</a></strong> 'Admiralty'<br>
<span style="color: #a0aec0; margin-left: 40px;">Division - Strategic</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'British Commodore'<br>
<span style="color: #a0aec0; margin-left: 40px;">Title - Leadership</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">military_tech</span><strong><a href="/docs/specification/element_categories/title">Title</a></strong> 'Commodore'<br>
<span style="color: #a0aec0; margin-left: 40px;">Leadership - Commanding</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

The promotion was unexpected. As the son of an obscure country squire, Anson did not wield the level of <strong>patronage</strong>, the grease—or "interest," as it was more politely called—that propelled many officers up the pole, along with their men.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Patronage'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Acquisition</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Anson, then forty-two, had joined the Navy at the age of fourteen, and served for nearly three decades without leading a major <strong>military campaign</strong> or snaring a <strong>lucrative prize</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Anson's Career'<br>
<span style="color: #a0aec0; margin-left: 40px;">History - Professional</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Military Campaign Leadership'<br>
<span style="color: #a0aec0; margin-left: 40px;">Occupation - Military</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Prize Capture'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Acquisition</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

Tall, with a long face and a high forehead, he had a <strong>remoteness</strong> about him. His <strong>blue eyes were inscrutable</strong>, and outside the company of a few trusted friends he <strong>rarely opened his mouth</strong>.

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Remoteness'<br>
<span style="color: #a0aec0; margin-left: 40px;">Temperament</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Inscrutable Blue Eyes'<br>
<span style="color: #a0aec0; margin-left: 40px;">Physical</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Usually Silent'<br>
<span style="color: #a0aec0; margin-left: 40px;">Social</span>
</div>

</div>
</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0;">

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #4a5568; line-height: 1.8;">

One statesman, after meeting with him, noted, "Anson, as usual, said little." Anson corresponded even more sparingly, as if he doubted the ability of words to convey what he saw or felt. "He loved reading little, and writing, or dictating his own letters less, and that seeming negligence…drew upon him the ill will of many," a relative wrote. A diplomat later quipped that Anson was so unknowing about the world that he'd been "round it, but never in it."

</div>
</div>

<div>
<div style="background: #2d3748; padding: 25px; border-radius: 8px; border-left: 3px solid #fbbf24; line-height: 1.6;">

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">flaky</span><strong><a href="/docs/specification/element_categories/trait">Trait</a></strong> 'Withdrawn'<br>
<span style="color: #a0aec0; margin-left: 40px;">Temperament</span>
</div>

<div style="margin-bottom: 15px;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">saved_search</span><strong><a href="/docs/specification/element_categories/event">Event</a></strong> 'Comment On Anson'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Social</span>
</div>

<div style="margin-bottom: 0;">
<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">api</span><strong><a href="/docs/specification/element_categories/construct">Construct</a></strong> 'Anson Being Aggravating'<br>
<span style="color: #a0aec0; margin-left: 40px;">Situation - Social</span>
</div>

</div>
</div>

</div>

</details>

