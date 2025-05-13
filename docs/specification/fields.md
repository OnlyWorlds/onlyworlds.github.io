---
layout: default
title: Fields
parent: Specification
av_order: 3
has_toc: false
---

# Fields

Fields are the specific attributes that define the properties of an element within OnlyWorlds. They hold the actual data for each character, location, object, etc.

There are two main types of fields:

1.  **Base Fields:** A common set of fields shared by *all* element categories.
2.  **Category-Specific Fields:** Fields unique to each individual [category](./categories.md).

## Base Fields

Every element in OnlyWorlds includes the following base fields (defined in `base_properties.yaml`):

| Field         | Type          | Required | Description                                                            |
| :------------ | :------------ | :------- | :--------------------------------------------------------------------- |
| `Id`          | string (uuid) | Yes      | Unique identifier for the element (uuidv7 format). Read-only.        |
| `Name`        | string        | Yes      | Name of the element.                                                   |
| `Description` | string        | No       | Detailed description of the element.                                   |
| `Supertype`   | string        | No       | The supertype category the element belongs to (see [Typings](./typings.md)). |
| `Subtype`     | string        | No       | The subtype category the element is classified under (see [Typings](./typings.md)). |
| `Image_URL`   | string (url)  | No       | URL to an image representing the element.                              |
| `World`       | string (uuid) | Yes      | UUID of the world the element is part of.                            |

*(Based on schema version 0.20.10)*

## Category-Specific Fields

In addition to the base fields, each element category has its own set of fields tailored to its specific purpose. For example:

*   A `Character` might have fields like `Age`, `Occupation`, or links to `Ability` elements.
*   A `Location` might have fields for `Size`, `Climate`, or links to contained `Object` or `Character` elements.

To see the specific fields for each category, please navigate to the individual category pages listed in the [Categories](./categories.md) section.

## Field Data Types

The underlying schema definition specifies the expected data type for each field, such as:

*   `string` (including specific formats like `uuid` or `url`)
*   `integer`
*   `number` (can include decimals)
*   `boolean` (true/false)
*   `array` (a list of values, often strings or links)
*   Links (represented as strings containing the `Id` of the target element)

Tooling that implements the standard should respect these data types for validation and proper functioning.