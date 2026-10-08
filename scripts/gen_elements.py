#!/usr/bin/env python3
"""gen_elements.py: write the field tables of the 22 element pages from schema-dist.

Usage: python scripts/gen_elements.py --dist <schema-dist checkout> [--check]

The schema is decoded by schema-dist's own walk (walk/schema_walk.py), imported from the
checkout, never copied here: one decoder for every consumer. The checkout is verified against
its MANIFEST.json before anything is read.

Each element page keeps its hand-written prose above the marker line; everything below the
marker is rewritten. --check writes nothing and exits 1 if any page would change (CI uses it
to show a stale page; the Pages build runs the generator itself, so the site is never stale).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

MARKER = "<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->"
PAGES = Path(__file__).resolve().parent.parent / "src" / "content" / "docs" / "docs" / "schema" / "element_categories"


def verify_manifest(dist: Path) -> None:
    manifest = json.loads((dist / "MANIFEST.json").read_text(encoding="utf-8"))
    files = manifest.get("files", manifest)
    bad = []
    for rel, want in files.items():
        if not isinstance(want, str):
            continue
        got = hashlib.sha256((dist / rel).read_bytes()).hexdigest()
        if got != want.removeprefix("sha256:"):
            bad.append(rel)
    if bad:
        sys.exit(f"schema-dist checkout does not match its MANIFEST.json: {', '.join(bad)}")


def kind_label(f: dict) -> str:
    k = f["kind"]
    if k == "scalar_str":
        return "text"
    if k == "scalar_int":
        return "integer"
    if k == "single":
        return f"link to {f['target'].capitalize()}"
    if k == "multi":
        return f"links to {f['target'].capitalize()}"
    if k == "generic":
        return "link to any element"
    return k


def cell(s: str) -> str:
    return s.replace("|", "\\|").replace("\n", " ").strip()


def render(fields: list[dict]) -> str:
    out = ["## Fields", ""]
    section = None
    for f in fields:
        if f.get("section") != section:
            section = f.get("section")
            out += ["", f"### {section}", "", "| Field | Type | Description |", "|---|---|---|"]
        req = " (required)" if f.get("required") else ""
        if f["kind"] == "generic":
            # On the wire a generic link is two fields, <name>_type and <name>_id (the walk's own
            # note for pin.element; the live API answers element_type and element_id).
            # (Plain descriptions: the YAML's own text for this field describes the platform's storage.)
            out.append(f"| `{f['name']}_type`{req} | text: one of the 22 type names | The type of the linked element, any of the 22 |")
            out.append(f"| `{f['name']}_id`{req} | id of an element of that type | The id of the linked element |")
            continue
        out.append(f"| `{f['name']}`{req} | {kind_label(f)} | {cell(f.get('desc') or '')} |")
    return "\n".join(out).replace("\n\n\n", "\n\n").strip() + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", required=True, type=Path)
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")  # the walk's notes carry non-ASCII; Windows consoles default to cp1252

    verify_manifest(a.dist)
    sys.path.insert(0, str(a.dist / "walk"))
    import schema_walk as walk  # noqa: E402  (schema-dist's walk, from the verified checkout)

    version = dict(l.split(": ", 1) for l in (a.dist / "VERSION").read_text(encoding="utf-8").splitlines() if ": " in l)
    notes: list[str] = []
    stale, written = [], 0
    for slug in walk.ELEMENT_TYPES:
        page = PAGES / f"{slug}.md"
        if not page.exists():
            sys.exit(f"no page for {slug} at {page}")
        text = page.read_text(encoding="utf-8")
        if MARKER not in text:
            sys.exit(f"{page.name} has no generated-fields marker line")
        head = text.split(MARKER, 1)[0]
        doc = walk.load_yaml(a.dist / "schema", slug)
        fields = walk.flatten_fields(doc, slug, note=notes.append,
                                     include_required=True, include_desc=True, include_sections=True)
        new = head + MARKER + "\n\n" + render(fields)
        if new != text:
            stale.append(page.name)
            if not a.check:
                page.write_text(new, encoding="utf-8", newline="\n")
                written += 1

    print(f"gen_elements: schema-dist canonical {version.get('canonical')} serial {version.get('serial')}; "
          f"{len(walk.ELEMENT_TYPES)} types, {written} page(s) rewritten")
    for n in notes:
        print(f"  walk note: {n}")
    if a.check and stale:
        print(f"STALE: {', '.join(stale)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
