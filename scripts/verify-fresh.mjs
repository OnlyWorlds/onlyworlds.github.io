// Runs first in `npm run verify`: a built site older than its sources answers for a site that no longer exists, so
// every check after it would pass or fail on old pages. Exit 0 fresh, 2 CANNOT SEE (no build, or a source file newer
// than the build). verify-urls keeps its own copy of the age check; this one exists because the checks before it
// (verify-figures first) failed on a stale build with an ordinary FAIL, so the stale build was never named.
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SOURCES = ['src', 'contract', 'scripts', 'astro.config.mjs', 'package.json'].map((p) => join(ROOT, p));
const blind = (m) => { console.error(`CANNOT SEE: ${m}`); process.exit(2); };
const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => walk(join(p, f))) : [p]);

const index = join(DIST, 'index.html');
if (!existsSync(index)) blind('no built site (dist/index.html): run npm run check');
const built = statSync(index).mtimeMs;
const newer = SOURCES.filter(existsSync).flatMap(walk).filter((f) => statSync(f).mtimeMs > built);
if (newer.length) blind(`dist/ is older than ${newer.length} source file(s) (e.g. ${newer[0].slice(ROOT.length + 1)}): run npm run check`);
console.log('fresh: dist/ is newer than every file under src/, contract/, scripts/, astro.config.mjs and package.json');
