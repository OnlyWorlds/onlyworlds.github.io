---
layout: default
title: Location
parent: Categories
grand_parent: Framework 
---

Base Text 

---
## Locality
- **Scene**: Visual and environmental aspects of the location.
- **Activity**: Common activities or functions performed at this location.
- **Founding_date** (#): Date on which the location was founded or established.
- **Population_size** (#): Current population residing in or registered to the location.
- **Parent_location** (single-link: Location): The larger geographical or administrative area to which this location belongs.
- **Populations** (multi-link: Collective): Distinct groups or communities within the location.

## Culture
- **Traditions**: Cultural traditions that characterize the location.
- **Celebrations**: Major local festivals and celebrations.
- **Primary_cult** (single-link: Construct): Dominant cultural or religious group in the location.
- **Secondary_cults** (multi-link: Construct): Other significant cultural or religious groups.
- **Delicacies** (multi-link: Species): Specialty foods or culinary items associated with the location.

## World
- **Coordinates**: Geographic coordinates defining the location.
- **Founders** (multi-link: Character): Individuals or entities who founded the location.

## Construction
- **Logistics**: Logistical details concerning the construction and maintenance of the location.
- **Architecture**: Architectural styles and structures prevalent in the location.
- **Construction_rate** (# max:100): Rate at which construction projects are completed in the location.
- **Buildings** (multi-link: Location): Notable buildings and structures within the location.
- **Building_expertise** (multi-link: Construct): Expertise and skills available for construction in the location.

## Production
- **Extraction**: Natural resources extracted from the location.
- **Industry**: Key industries and economic activities in the location.
- **Extraction_output** (#): Quantity of resources extracted annually.
- **Industry_output** (#): Output from industrial activities.
- **Primary_resource** (single-link: Construct): Most significant resource extracted from the location.
- **Primary_industry** (single-link: Construct): Leading industry based in the location.
- **Secondary_resources** (multi-link: Construct): Other important resources available in the location.
- **Secondary_industries** (multi-link: Construct): Other significant industries operating in the location.

## Commerce
- **Trade**: Trade practices and common goods exchanged in the location.
- **Infrastructure**: Infrastructure supporting commercial activities.
- **Currency**: Local currency used for trade and transactions.
- **Primary_extraction_market** (single-link: Location): Main market for the primary resource extracted.
- **Primary_industry_market** (single-link: Location): Main market for the leading industry's products.
- **Secondary_extraction_markets** (multi-link: Location): Markets for secondary resources extracted from the location.
- **Secondary_industry_markets** (multi-link: Location): Markets for products from other significant industries.

## Localpolitics
- **Government**: Governing body or administration of the location.
- **Opposition**: Primary opposition groups or political rivals within the location.
- **Governing_title** (single-link: Title): Title of the main governing authority.
- **Primary_faction** (single-link: Institution): Leading political or administrative institution.
- **Secondary_factions** (multi-link: Institution): Secondary or minor political factions.

## Regionalpolitics
- **Territorial_policies**: Policies that govern territorial claims and management.
- **Territory** (single-link: Territory): Territorial jurisdiction of the location.
- **Rival** (single-link: Location): Neighboring rival locations.
- **Friend** (single-link: Location): Friendly neighboring locations.
- **Soft_influence_on** (multi-link: Location): Locations under the soft influence of this location.
- **Hard_influence_on** (multi-link: Location): Locations under the hard control or influence of this location.

## Strategics
- **Defensibility**: Assessment of the location’s defensibility against threats.
- **Height** (#): Elevation or strategic height of the location.
- **Primary_fighter** (single-link: Institution): Primary defensive institution or military presence.
- **Secondary_fighters** (multi-link: Institution): Supportive or auxiliary defensive forces.
- **Defenses** (multi-link: Location): Defensive structures or mechanisms in place.
- **Fortifications** (multi-link: Object): Fortifications built to protect the location.

