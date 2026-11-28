# Working in this repository

## What this repository is

The source of the OnlyWorlds documentation site, https://onlyworlds.github.io, built with Astro Starlight. A push to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/pages.yml`, so a merge is a release. The pages are Markdown in `src/content/docs/`; how the parts fit is in `README.md`.

## Set up and run the gates

CI uses Node 22 and Python 3.12. Every command here runs from the repository root in a POSIX shell (Git Bash on Windows); the setup and the build need the network. Work in a full clone, not a shallow one, and `git fetch origin` first. Set up once, then run the gates before you call a change done:

```bash
npm ci
pip install pyyaml
node scripts/gen_sdk_ref.mjs --check   # the TypeScript reference matches the pinned SDK
node scripts/gen_errors.mjs --check    # the errors table and contract floor rows match the snapshot
npm run check                          # npm run build, then npm run verify
node scripts/verify-commit-words.mjs origin/main..HEAD   # your commit messages
```

`npm run check` is the main local gate; it ends with `mutants-run: PASS`. The build runs the two generators without `--check`, so it rewrites the generated parts of three tracked files when they are behind (the TypeScript reference, the errors table, the floor rows of `contract/urls.tsv`): if `git status` shows a file you did not mean to change, do not commit it; say so in your pull request. Run `npm run verify` alone only right after a build: on a build older than any source file it answers `CANNOT SEE` with exit 2, which is not a pass. Run one build at a time.

`main` requires two checks: `build` (in `.github/workflows/ci.yml`: install, then `npm run build` and `npm run verify`) and `check` (in `.github/workflows/generated.yml`: the two `--check` commands above). A pull request also runs `commits` (`.github/workflows/commits.yml`, the commit-message check), which is not required but must be green.

The `build` job also runs report-only steps against live sources: the API, the MCP server, a CORS preflight, the practice world, schema-dist, the toolkit's newest release and PyPI. They print a warning and do not fail the job; you do not need to run them. Two of them, as CI runs them:

```bash
git clone --depth 1 https://github.com/OnlyWorlds/schema-dist ../schema-dist-clone
python scripts/gen_elements.py --dist ../schema-dist-clone --check   # exit 1: the pages or contract/folder-example.json are behind, or schema-dist is not what its MANIFEST says; report only
pip install onlyworlds mypy
python scripts/verify-examples-py.py   # without mypy it prints BLIND and exits 2: not a pass
```

Exit codes across `scripts/`: 0 pass, 1 a finding (FAIL or STALE), 2 BLIND or CANNOT SEE (the check could not read its source; never a pass). `gen_elements.py` is the exception: a source it cannot read exits 1. `npm run verify` also compares several snapshots with the live API document and prints `STALE` without failing; mention any `STALE` line in your pull request.

## How a change reaches main

Make a branch, open a pull request, and wait for the required checks to go green. `main` takes a commit only when its required checks passed on it; the rule has no bypass. Never push to `main`. A maintainer merges; you never merge your own pull request. Never create or push a tag: the deploy tags itself, and a tag is how a rollback is run. Never edit a file under `.github/workflows/`. Never change a version number, a dependency pin in `package.json`, the dated headings of `src/content/docs/docs/changelog.md`, or the version and changelog lines at the end of `public/assets/ow_llm_guide.txt`, unless the job says so.

## What must not be hand-edited

- `dist/`: build output, not committed.
- `src/content/docs/docs/development/typescript.md` below its `generated:sdk-reference` marker: written by `node scripts/gen_sdk_ref.mjs` from the pinned `@onlyworlds/sdk`.
- `src/content/docs/api/errors/index.mdx` between its `generated:error-codes` markers, and the `floor` rows of `contract/urls.tsv`: written by `node scripts/gen_errors.mjs` from `contract/error-codes.json`.
- `src/content/docs/docs/schema/element_categories/*.md` below their `generated:fields` marker, and `contract/folder-example.json`: written by `python scripts/gen_elements.py --dist <a clone of schema-dist>`. Every deploy regenerates them from a published tag of schema-dist; leave them alone unless the job is about them. The field descriptions are the standard's own text: a change to one belongs in https://github.com/OnlyWorlds/OnlyWorlds.
- `contract/*.json` snapshots. Each is refreshed by its script, never by hand: `error-codes.json` (`node scripts/gen_errors.mjs --refresh`), `callers.json`, `signin.json`, `time.json`, `write.json`, `draught.json`, `proposals.json` (`node scripts/gen_<name>.mjs --refresh`), `mcp.json`, `toolkit.json`, `shapes.json`, `limits.json`, `stability.json`, `sd-counts.json` (`node scripts/verify-<name>.mjs --refresh`). `cors.json`, `palettes.json`, `public.json` and `practice.json` are read from the server's private code and cannot be refreshed from a clone: stop and ask.
- `contract/urls.tsv` and `contract/old-urls.tsv`: the list of addresses the site promises. Never remove a row, move a listed page, or turn one into a redirect stub: a move changes the contract first, which is a stop-and-ask. `README.md` ("Old URLs are part of the contract") explains the row kinds.
- `package-lock.json`: changes only with a dependency change, which is a stop-and-ask.

## Words

Everything here is public, the commit messages included. `scripts/verify-public-words.mjs` (in `npm run verify`) reads the built site in `dist/` for words public text may not carry, its list in `scripts/public-words.mjs`; it does not read root files such as this one. `node scripts/verify-commit-words.mjs origin/main..HEAD` holds your commit messages to that list's words and refuses the team's names; exit 2 means git could not read the range (a ref this clone lacks), not a pass. A commit message says what the change does and why. It names no private repository, person or internal ticket. The terms the pages use are in `SWEEP.md` ("The terms").

## Where to stop and ask

Stop, do not guess, when the job would need any of these: a change to a file in the list above; a new dependency; a change to public behaviour the job did not name, such as a page's address or what a sample does; a failing gate you cannot explain, one that also fails on `origin/main` included (it is not yours to fix); two readings of the job that give different changes. Write the question as one comment on your pull request (with no pull request yet, in a file `ASK.md` at the root of your branch). Ask one question, push your branch as it stands, then end your turn.

## What a finished job looks like

The pull request's description says:

- what changed, and why;
- each gate you ran, with its last line of output;
- what you did not run, and why;
- a list headed "Looked wrong, left alone": anything outside the job that seemed wrong.
