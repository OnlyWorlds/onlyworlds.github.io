# The docs sweep

The docs state facts that other people's work changes: the API, the MCP server, the SDKs, the schema, the tools. Two habits keep them true.

**1. Docs follow what ships, the same hour.** When something the docs describe ships, its owner tells the docs' maintainer (Kael) with the commit; the page changes and deploys that hour, not at the next sweep. What counts: a new or changed route, field, error code or limit (keel); a new schema-dist serial; a new SDK, Python, Unity or Atlas version; a changed tool, link or name. The generated parts follow on their own (element tables from schema-dist at each build, error codes from keel's list, the TypeScript reference from the pinned SDK); the hand-written pages are the ones that need a person.

**2. A sweep every week**, because the first habit misses what nobody thought to mention. `node scripts/sweep.mjs` does the measurable part and lists what moved; a person reads the rest. The Deck's gates badge shows `docs-sweep` and goes red by itself after two weeks without a run. The cadence can slacken once the docs stop moving fast.

## The procedure

1. **Run it.** `node scripts/sweep.mjs` (add `--no-links` for a quick one). Fix every STALE it prints: bump a pin, refresh a snapshot, mend a link, replace a word.
2. **Read MOVED against the pages that state it.** Each commit line names a source; the page to read is:
   - keel: `docs/development/api-reference.md`, `api/*` (reads, writes, links, changes, errors, images, members, cors), `mcp.md`, `agents.md`, the error table, `schema/worlds.md`
   - schema-dist: `schema/*`, `schema/conventions.md`; the element tables regenerate on their own
   - `@onlyworlds/sdk`: `typescript.md`, `packages.md`; its README is the repo's, kept in step by hand
   - the Python package: `python.md`; Atlas: `tools/atlas.md`, `getting-started/*`; Unity: `unity.md`, `games.md`; Obsidian: `tools/obsidian-plugin.md`
3. **Read for language** (the Captain's two standing complaints, 2026-10-09): OnlyWorlds explained again where a page has no need to; the 22 categories listed again; words that are not OnlyWorlds elements (a faction, an item, a realm) used as if they were. `sweep.mjs` names the pages that restate the 22 and flags the words it knows.
4. **Run `npm run build && npm run verify`,** push, check the deploy.
5. **Stamp it below** and report the sweep as one line in the OW Infra room: what was stale, what was fixed, what is open.

**Last swept**: 2026-10-08 (the baseline: the docs overhaul, OW Infra #81)

## The terms (one place)

- **"the standard"** names the thing, for people. **"schema"** only for the files (`schema/*.yaml`, schema-dist) and the reference pages about them.
- Elements are the 22 categories: Character, Creature, Species, Family, Collective, Institution, Location, Object, Construct, Ability, Trait, Title, Language, Law, Event, Narrative, Phenomenon, Relation, Map, Pin, Marker, Zone. A game's own words go on the left of a mapping table, never in prose as if they were ours.
- The Python package installs from GitHub; there is no `pip install onlyworlds`. Saying so is a sweep check.
