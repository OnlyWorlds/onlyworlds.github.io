---
layout: default
title: Magic Systems
parent: Guides
nav_order: 3
---

# Magic Systems

Design and structure magic systems using OnlyWorlds elements, showing how different categories work together to create complex, believable magical worlds.

---

## Core Concept

Magic systems aren't just lists of spells - they're interconnected webs of power sources, practitioners, limitations, and cultural impacts. OnlyWorlds excels at modeling these relationships by distributing magical concepts across multiple element categories.

---

## Simple Example: Crystal Magic

Let's create a basic magic system where practitioners channel energy through crystals.

### The Power Source

**Element**: Phenomenon  
**Name**: "Crystal Resonance"  
**Category**: Energy magic that flows through crystalline structures

```yaml
name: "Crystal Resonance"
category: "Phenomenon"
supertype: "Energy"
subtype: "Magical"
description: "Magical energy that flows through crystal formations, allowing trained individuals to channel elemental forces"
manifestation: "Visible as colored light within crystals"
strength: "Varies by crystal size and purity"
```

### The Focus Objects

**Element**: Species  
**Name**: "Resonance Crystals"  
**Category**: The natural crystal formations that conduct magic

```yaml
name: "Resonance Crystals"
category: "Species"
supertype: "Mineral"
subtype: "Magical"
description: "Naturally occurring crystals that conduct magical energy"
varieties:
  - "Fire Crystals (red)"
  - "Water Crystals (blue)"
  - "Earth Crystals (brown)"
  - "Air Crystals (white)"
habitat: "Deep caves and mountain peaks"
rarity: "Uncommon"
```

### The Practitioners

**Element**: Title  
**Name**: "Crystal Mage"  
**Category**: People who can use crystal magic

```yaml
name: "Crystal Mage"
category: "Title"
supertype: "Magical"
subtype: "Practitioner"
description: "A person trained to channel Crystal Resonance through focus crystals"
requirements:
  - "5+ years of training"
  - "Personal focus crystal"
  - "Mental discipline"
responsibilities:
  - "Protect crystal deposits"
  - "Maintain magical balance"
social_status: "Respected but rare"
```

### The Core Ability

**Element**: Ability  
**Name**: "Crystal Channeling"  
**Category**: The fundamental magical skill

```yaml
name: "Crystal Channeling"
category: "Ability"
supertype: "Magical"
subtype: "Elemental"
description: "The ability to direct Crystal Resonance energy through focus crystals"
requirements:
  - "Resonance Crystal focus"
  - "Magical training"
effects:
  - "Manipulate corresponding element"
  - "Create energy shields"
  - "Enhanced perception"
limitations:
  - "Requires physical crystal"
  - "Causes mental fatigue"
  - "Limited by crystal quality"
```

### The Limitation

**Element**: Trait  
**Name**: "Crystal Dependency"  
**Category**: The downside of crystal magic

```yaml
name: "Crystal Dependency"
category: "Trait"
supertype: "Magical"
subtype: "Affliction"
description: "Physical and mental reliance on crystal magic, causing withdrawal symptoms without access to crystals"
symptoms:
  - "Headaches without crystals"
  - "Reduced magical sensitivity"
  - "Anxiety and restlessness"
progression: "Worsens with years of use"
treatment: "Gradual crystal weaning"
```

### The Regulatory Body

**Element**: Institution  
**Name**: "Crystal Academy"  
**Category**: The organization that trains and regulates crystal mages

```yaml
name: "Crystal Academy"
category: "Institution"
supertype: "Educational"
subtype: "Magical"
description: "The primary institution for training Crystal Mages and regulating crystal use"
structure:
  - "Council of Master Mages"
  - "Training divisions by element"
  - "Research department"
location: "Crystal Mountain Sanctuary"
membership: "150+ active members"
purpose: "Safe magical education and regulation"
```

---

## System Relationships

### The Magic Flow

```
Crystal Resonance (Phenomenon) 
    ↓
Resonance Crystals (Species)
    ↓
Crystal Channeling (Ability)
    ↓
Crystal Mage (Title)
    ↓
Crystal Academy (Institution)
```

### The Limitation Chain

```
Crystal Channeling (Ability)
    ↓
Crystal Dependency (Trait)
    ↓
Academy Regulation (Institution)
```

### Visual Diagram

```
    🔮 Crystal Resonance (Phenomenon)
         |
         | flows through
         ↓
    💎 Resonance Crystals (Species)
         |
         | enables
         ↓
    ✨ Crystal Channeling (Ability)
         |
         | creates
         ↓
    🧙 Crystal Mage (Title) ←→ 🏛️ Crystal Academy (Institution)
         |                         |
         | suffers from            | regulates
         ↓                         ↓
    😵 Crystal Dependency (Trait)  📜 Magic Laws (Law)
```

---

## Element Overlap

Notice how elements serve multiple functions:

**Resonance Crystals function as:**
- **Species** (the mineral type)
- **Objects** (individual crystals)
- **Economic resources** (valuable commodities)
- **Religious artifacts** (sacred to mages)

**Crystal Mages exist as:**
- **Characters** (individual practitioners)
- **Titles** (social roles)
- **Collective members** (Academy students)
- **Ability users** (magical practitioners)

This overlap creates depth and realistic complexity.

---

## Expanding Your System

### Add Geographic Elements

**Element**: Location  
**Name**: "Crystal Caverns"  
Where crystals are found and mined

**Element**: Zone  
**Name**: "Magically Dead Areas"  
Regions where Crystal Resonance doesn't work

### Add Historical Context

**Element**: Event  
**Name**: "The Great Crystal Shatter"  
Historical disaster that shaped current regulations

**Element**: Narrative  
**Name**: "The Mage Chronicles"  
Cultural stories about crystal magic

### Add Social Complexity

**Element**: Law  
**Name**: "Crystal Mining Regulations"  
Legal framework governing crystal extraction

**Element**: Collective  
**Name**: "Anti-Magic Movement"  
Group opposing crystal magic use

---

## Design Principles

### Start Simple
1. **One power source** (Phenomenon)
2. **One focus method** (Object/Species)
3. **One core ability** (Ability)
4. **One limitation** (Trait)
5. **One organizing body** (Institution)

### Build Outward
- Add specialized abilities for variety
- Create historical events for context
- Include locations where magic happens
- Design social reactions to magic

### Maintain Balance
- Every power needs limitations
- Every benefit needs costs
- Every practitioner needs training
- Every system needs regulation

---

## Common Pitfalls

**Magic Too Powerful**: Add meaningful limitations (Traits, Laws)
**Magic Too Isolated**: Connect to society (Institutions, Events)
**Magic Too Simple**: Add element overlap and relationships
**Magic Too Complex**: Focus on core concepts first

---

## Quick Start Template

For any magic system, consider these elements:

1. **Phenomenon** - Your power source
2. **Ability** - How it's used
3. **Title** - Who uses it
4. **Trait** - What it costs
5. **Institution** - Who regulates it

Build these five elements first, then expand with locations, objects, events, and cultural elements as needed.

---

## Next Steps

1. **Define your core concept** - What makes your magic unique?
2. **Create the five basic elements** - Power, ability, user, cost, regulation
3. **Map the relationships** - How do elements connect?
4. **Add cultural integration** - How does magic affect society?
5. **Test the system** - What happens when things go wrong?

Remember: great magic systems aren't about the spells - they're about the consequences, costs, and cultural changes that magic brings to your world.