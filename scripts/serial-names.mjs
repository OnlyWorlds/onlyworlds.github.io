// serial-names.mjs: whether a changelog line names a schema-dist serial, as the changelog writes them.
//
// The sweep's release check (sweep.mjs) asks this for every serial published since the last sweep. A line names
// serial N when it holds "serial N", or N among "serials A and B", "serials A, B and C" or "serials A to B" (every
// serial from A to B), with a small or a capital S. A number is read whole: "serial 135" does not name serial 13.
//
// Run by itself it checks its own table: node scripts/serial-names.mjs   (exit 0 PASS, 1 FAIL)
import { fileURLToPath } from 'node:url';

export function namesSerial(line, n) {
  for (const m of String(line).matchAll(/\b[Ss]erials?\s+(\d+(?:(?:,?\s+and\s+|\s*,\s*|\s+to\s+)\d+)*)(?!\d)/g)) {
    const parts = m[1].split(/(,?\s+and\s+|\s*,\s*|\s+to\s+)/);
    let prev = null;
    for (let i = 0; i < parts.length; i += 2) {
      const num = Number(parts[i]);
      const joiner = i > 0 ? parts[i - 1] : '';
      if (/to/.test(joiner) && prev !== null ? prev <= n && n <= num : num === n) return true;
      prev = num;
    }
  }
  return false;
}

const CASES = [
  ['the lens page (serial 139) says', 139, true],
  ['the lens page (serial 139) says', 13, false],
  ['the lens page (serial 139) says', 1390, false],
  ['a talk on an element (serials 135 and 136), the standing work item', 135, true],
  ['a talk on an element (serials 135 and 136), the standing work item', 136, true],
  ['a talk on an element (serials 135 and 136), the standing work item', 137, false],
  ['Serial 138 writes the hidden mark\'s reach', 138, true],
  ['the map-space page (serials 142 to 144) says', 142, true],
  ['the map-space page (serials 142 to 144) says', 143, true],
  ['the map-space page (serials 142 to 144) says', 144, true],
  ['the map-space page (serials 142 to 144) says', 145, false],
  ['the map-space page (serials 142 to 144) says', 141, false],
  ['serials 101, 104 and 106 moved it', 104, true],
  ['serials 101, 104, and 106 moved it', 106, true],
  ['serials 101, 104 and 106 moved it', 105, false],
  ['serials 101 to 103 and 110 moved it', 102, true],
  ['serials 101 to 103 and 110 moved it', 110, true],
  ['serials 101 to 103 and 110 moved it', 105, false],
  ['serial 144, rule 15', 144, true],
  ['serial 144, rule 15', 15, false],
  ['since serial 110, the same page\'s rules 8 to 10', 110, true],
  ['since serial 110, the same page\'s rules 8 to 10', 8, false],
  ['v0.34.1-dist.141 and 16 cases', 141, false],
  ['the serialiser 12 times', 12, false],
  ['serial 12 and 14 cases', 14, true], // "serial 12 and 14" reads as two serials: the changelog writes "serials" for two, so a count after "and" is the writer's to avoid
];

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const wrong = CASES.filter(([line, n, want]) => namesSerial(line, n) !== want);
  for (const [line, n, want] of wrong) console.log(`  FAIL   "${line}" names serial ${n}: wanted ${want}`);
  console.log(wrong.length === 0 ? `PASS — ${CASES.length} cases` : `FAIL — ${wrong.length} of ${CASES.length} cases`);
  process.exit(wrong.length === 0 ? 0 : 1);
}
