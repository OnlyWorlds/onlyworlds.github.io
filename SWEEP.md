# The docs sweep

The docs state facts that other people's work changes: the API, the MCP server, the SDKs, the schema, the tools. Two habits keep them true.

**1. Docs follow what ships, the same hour.** When something the docs describe ships, its owner tells the docs' maintainer (Kael) with the commit; the page changes and deploys that hour, not at the next sweep. What counts: a new or changed route, field, error code or limit (keel); a new schema-dist serial; a new SDK, Python, Unity or Atlas version; a changed tool, link or name. The generated parts follow on their own (element tables from schema-dist at each build, error codes from keel's list, the TypeScript reference from the pinned SDK); the hand-written pages are the ones that need a person. A new keel error code is the exception that needs both: `node scripts/gen_errors.mjs --refresh` and its `### <code>` section the same hour, because keel's `doc_url` already points at that anchor (every 410 linked to a missing `#gone` until docs-next 12e90a0, 2026-10-18; CI only warns). The same commit adds the change's dated line to `/docs/changelog` (one entry stood for 161 commits until docs-next 1879d09, 2026-10-20). **Every keel PR from #109 on that is not labelled `internal` gets a marker in `changelog.md`, within a day of its merge**: `<!-- keel PR 109 -->` at the end of the line it produced, or `<!-- keel PR 109: no docs change -->` on its own line under that day's heading when the docs describe nothing it moved. The marker is what Boss's weekly reader checks against keel's merged PRs (h37 #8306); readers never see it. Commit subjects stay free.

**2. A sweep every week**, because the first habit misses what nobody thought to mention. `node scripts/sweep.mjs` does the measurable part and lists what moved; a person reads the rest. The Deck's gates badge shows `docs-sweep` and goes red by itself after two weeks without a run. The cadence can slacken once the docs stop moving fast.

## The procedure

1. **Run it.** `node scripts/sweep.mjs` (add `--no-links` for a quick one). Fix every STALE it prints: bump a pin, refresh a snapshot, mend a link, replace a word.
2. **Read MOVED against the pages that state it.** Each commit line names a source; the page to read is:
   - keel: `docs/development/api-reference.md`, `api/*` (reads, writes, links, changes, errors, images, members, cors), `mcp.md`, `agents.md`, the error table, `schema/worlds.md`
   - schema-dist: `schema/*`, `schema/conventions.md`; the element tables regenerate on their own
   - `@onlyworlds/sdk`: `typescript.md`, `packages.md`; its README is the repo's, kept in step by hand
   - the Python package: `python.md`; Atlas: `tools/atlas.md`, `getting-started/*`; Unity: `unity.md`, `games.md`; Obsidian: `tools/obsidian-plugin.md`
   - A link that sends the reader elsewhere for a claim: open the target and find the claim there. The link check sees that the page exists, not what it says (agents.md sent readers to Writes for the agent mark, which Writes never mentioned, 2026-10-18).
3. **Read for language** (the Captain's two standing complaints, 2026-10-09): OnlyWorlds explained again where a page has no need to; the 22 categories listed again; words that are not OnlyWorlds elements (a faction, an item, a realm) used as if they were. `sweep.mjs` names the pages that restate the 22 and flags the words it knows.
   Every page is edited here (since 2026-10-18, the Captain's word, h28 #6945: the content lane is Kael's whole; Skeld's content folder no longer syncs). Skeld brings facts: a keel change that moves a page's claim comes to the docs' maintainer in OW Infra the hour it ships, and the page follows that hour.
4. **Run `npm run build && npm run verify`,** push, check the deploy. A code block that was added or changed is run as extracted from the page source, never retyped: a Write example run from my own script passed while the page's copy lacked its import (2026-10-18).
5. **Walk the living map of sharing** (OW Collab #413): `node C:/Users/Titus/Carrier/Assembly/dossiers/ow-collab/living-map/check.mjs --write`. A DRIFT (a row names a route keel no longer has) is fixed in `rows.json` before the stamp. Its findings (a sharing route with no row, a route nothing classifies, a row with no walk or no control, a walk older than two weeks) are the sweep's walking list: re-walk what the docs' pages lean on, and route the rest to the row's owner in OW Collab.
6. **Stamp it below** and report the sweep as one line in the OW Infra room: what was stale, what was fixed, what is open.

**Last swept**: 2026-10-18, before the Captain's journey walk (all checks pass; the 10-16 round's 24 on Skeld's pages fixed, one half; 26 new on his, sent in h37 #6834: `writable` honoured by the Unity SDK, seats beyond links, the player kind, `mine` for members only. Mine, 28 of 29 applied (docs-next 6cf4756): TypeScript's sign-in section and `OwSignInError` (SDK 4.31.0), the Obsidian page against 3.5.0 with a Sync section, Python's folder v0.3.8, Unity v0.6.0's Atlas folders, Atlas 1.50 to 1.52's sign-in; the findings: `Assembly/Notes/2026-10-18-docs-sweep.md`).

## The terms (one place)

- **"the standard"** names the thing, for people. **"schema"** only for the files (`schema/*.yaml`, schema-dist) and the reference pages about them.
- Elements are the 22 categories: Character, Creature, Species, Family, Collective, Institution, Location, Object, Construct, Ability, Trait, Title, Language, Law, Event, Narrative, Phenomenon, Relation, Map, Pin, Marker, Zone. A game's own words go on the left of a mapping table, never in prose as if they were ours.
- The Python package is on PyPI since 2026-10-11: `pip install onlyworlds`. The old install line from GitHub (`git+https://…/python-sdk`) is a sweep check.
