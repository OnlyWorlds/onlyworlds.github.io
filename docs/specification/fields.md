---
layout: default
title: Fields
parent: Specification
av_order: 3
has_toc: false
---

# Fields

Each element is given shape and meaning by the optional fields that its category offers. 

There are two types of fields:

1.  **Base Fields:** A common set of fields shared by *all* element categories
2.  **Category-Specific Fields:** Fields unique to each individual category

## Base Fields
 

| Field         | Type          | Required | Description                                                            |
| :------------ | :------------ | :------- | :--------------------------------------------------------------------- |
| `Id`          | string (uuid) | Yes      | Unique identifier for the element (uuidv7 format) |
| `Name`        | string        | Yes      | Name of the element                                                   |
| `Description` | string        | No       | Any text information about the element                                   |
| `Supertype`   | string        | No       | Primary classification of the element (see [Typings](./typings.md)). |
| `Subtype`     | string        | No       | Secondary classification of the element (as a subset of the supertype) |
| `Image_URL`   | string (url)  | No       | URL to an image representing the element                              |
| `World`       | string (uuid) | Yes      | UUID of the world the element is part of                            |
 
 

## Field Data Types

All fields are of one of the following types:

*   `string` (including specific formats like `uuid` or `url`)
*   `integer` (currently locked in at positives only, potentially with a maximum value) 
*   `single link` (a reference to maximum one other element)
*   `multi link` (a reference to any number of other elements)

