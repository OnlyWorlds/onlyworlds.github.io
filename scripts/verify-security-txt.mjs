#!/usr/bin/env node
// verify-security-txt.mjs: the built /.well-known/security.txt (RFC 9116) has a Contact and an Expires
// at least 30 days ahead. RFC 9116 makes a file past its Expires stale, and nothing else would say so
// (the file was written 2026-10-24 for a year). Reads dist/, so it runs after a build,
// in `npm run verify`. Move Expires forward a year when this fails.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', '.well-known', 'security.txt');
if (!existsSync(FILE)) { console.log('CANNOT SEE: dist/.well-known/security.txt is missing (build first)'); process.exit(2); }
const fields = {};
for (const line of readFileSync(FILE, 'utf8').split('\n')) {
  const m = /^([A-Za-z-]+):\s*(.+)$/.exec(line.trim());
  if (m) (fields[m[1].toLowerCase()] ??= []).push(m[2]);
}
const bad = [];
if (!fields.contact?.length) bad.push('no Contact');
if (fields.expires?.length !== 1) bad.push(`Expires appears ${fields.expires?.length ?? 0} times, must be once`);
const exp = Date.parse(fields.expires?.[0] ?? '');
const days = (exp - Date.now()) / 86400000;
if (Number.isNaN(exp)) bad.push('Expires is not a date');
else if (days < 30) bad.push(`Expires ${fields.expires[0]} is ${Math.floor(days)} day(s) away: move it a year forward`);
if (bad.length) { console.log(`FAIL: security.txt: ${bad.join('; ')}`); process.exit(1); }
console.log(`PASS: security.txt: Contact ${fields.contact[0]}, Expires in ${Math.floor(days)} days`);
