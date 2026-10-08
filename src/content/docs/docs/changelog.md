---
title: Changelog
description: Notable changes to the OnlyWorlds docs, newest first.
---

Notable changes to these docs, newest first. Changes to the packages are in each package's own changelog: [TypeScript SDK](https://github.com/OnlyWorlds/sdk/blob/main/CHANGELOG.md), [Unity SDK](https://github.com/OnlyWorlds/unity-sdk/blob/main/Packages/com.onlyworlds.sdk/CHANGELOG.md).

## October 2026: the docs rebuilt

The docs moved from Jekyll to [Starlight](https://starlight.astro.build), at the same address.

- **Every old URL still answers.** Pages kept their paths. The error links in API responses (`/api/errors#<code>`) and the LLM guide (`/assets/ow_llm_guide.txt`) are unchanged. Retired tool pages now forward to [Legacy Tools](/docs/tools/legacy).
- **The API guide is split into topics:** [reading](/docs/development/api/reads), [link fields](/docs/development/api/links), [writes and bulk](/docs/development/api/writes), [changes](/docs/development/api/changes), [members](/docs/development/api/members), [images](/docs/development/api/images), [CORS](/docs/development/api/cors) and [migrating from v1](/docs/development/api/classic).
- **New pages:** [Keys and PINs](/docs/getting-started/keys), [Conventions](/docs/schema/conventions), the [TypeScript](/docs/development/typescript), [Python](/docs/development/python) and [Unity](/docs/development/unity) clients, [Games](/docs/development/games), [Agent Seats](/docs/development/agents) and the [Toolkit](/docs/development/toolkit).
- **The field tables on the element pages are generated** from the published schema ([schema-dist](https://github.com/OnlyWorlds/schema-dist)) on every build. They show each field's name as the API sends it.
- **For AI agents:** every page has a Markdown copy at the same path with `.md` (for example `/docs/development/typescript.md`), and the site has [`llms.txt`](/llms.txt), [`llms-small.txt`](/llms-small.txt) and [`llms-full.txt`](/llms-full.txt). Each page has Copy Markdown and Open in Claude or ChatGPT.
- **Search** covers every page (Ctrl K).

The previous site is kept whole in the repository, on the `jekyll` branch.
