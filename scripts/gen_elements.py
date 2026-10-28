#!/usr/bin/env python3
"""gen_elements.py: write the field tables of the 22 element pages, and the example folder
snapshot, from schema-dist.

Usage: python scripts/gen_elements.py --dist <schema-dist checkout> [--check]

The schema is decoded by schema-dist's own walk (walk/schema_walk.py), imported from the
checkout, never copied here: one decoder for every consumer. The checkout is verified against
its MANIFEST.json before anything is read.

Each element page keeps its hand-written prose above the marker line; everything below the
marker is rewritten. --check writes nothing and exits 1 if any page would change (CI uses it
to show a stale page; the Pages build runs the generator itself, so the site is never stale).

The same run writes contract/folder-example.json: the standard's example world folder
(example/hyperion) as it is in the checkout, every file in it, each element file's kind, file
name, id and name, the walk's 22 kinds and the checkout's serial. The world folders page draws
it (FolderExample, through folders.mjs). One run, one checkout: the figure and the field tables
always come from the same serial. --check holds the snapshot too.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

MARKER = "<!-- generated:fields (scripts/gen_elements.py rewrites everything below this line) -->"
ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "src" / "content" / "docs" / "docs" / "schema" / "element_categories"
EXAMPLE = "example/hyperion"
SNAPSHOT = ROOT / "contract" / "folder-example.json"


def verify_manifest(dist: Path) -> dict:
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
    return files


def example_snapshot(dist: Path, files: dict, version: dict, kinds: list[str]) -> str:
    """The example folder as the verified checkout holds it. Records only what is on disk: the
    figure's module derives every file name by the rule, and the build and verify-figures.mjs
    judge it. Every file in the folder must be one the MANIFEST lists, and the other way."""
    prefix = EXAMPLE + "/"
    listed = sorted(rel for rel in files if rel.startswith(prefix))
    on_disk = sorted(p.relative_to(dist).as_posix() for p in (dist / EXAMPLE).rglob("*") if p.is_file())
    if not listed:
        sys.exit(f"schema-dist's MANIFEST.json lists no files under {EXAMPLE}/")
    if listed != on_disk:
        extra = sorted(set(on_disk) - set(listed)) + [f"(missing) {x}" for x in sorted(set(listed) - set(on_disk))]
        sys.exit(f"{EXAMPLE}/ and its MANIFEST.json entries differ: {', '.join(extra)}")
    root, elements = [], []
    for rel in listed:
        parts = rel[len(prefix):].split("/")
        if len(parts) == 1:
            root.append(parts[0])
        elif len(parts) == 3 and parts[0] == "elements" and parts[2].endswith(".json"):
            d = json.loads((dist / rel).read_text(encoding="utf-8"))
            if not isinstance(d.get("id"), str) or not d["id"]:
                sys.exit(f"{rel} holds no id")
            elements.append({"kind": parts[1], "file": parts[2], "id": d["id"], "name": d.get("name")})
        else:
            sys.exit(f"{rel}: the figure reads world.json-level files and elements/<kind>/<file>.json only")
    if "world.json" not in root:
        sys.exit(f"{EXAMPLE}/ has no world.json")
    world = json.loads((dist / prefix / "world.json").read_text(encoding="utf-8"))
    snap = {
        "source": f"schema-dist {EXAMPLE}, written by scripts/gen_elements.py from a checkout verified against its MANIFEST.json",
        "serial": version.get("serial"),
        "canonical": version.get("canonical"),
        "folder": EXAMPLE.rsplit("/", 1)[1],
        "kinds": list(kinds),
        "root": root,
        "world": {"id": world.get("id"), "name": world.get("name")},
        "elements": elements,
    }
    return json.dumps(snap, indent=2, ensure_ascii=False) + "\n"


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


def render(fields: list[dict], slug: str) -> str:
    out = ["## Fields", ""]
    if any(f["kind"] in ("single", "multi", "generic") for f in fields):
        # The schema page's link map opens on this category (its ?kind= parameter).
        out += [f"Drawn with the other categories: [what {slug.capitalize()} links to]"
                f"(/docs/schema/?kind={slug}#what-links-to-what).", ""]
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

    files = verify_manifest(a.dist)
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
        new = head + MARKER + "\n\n" + render(fields, slug)
        if new != text:
            stale.append(page.name)
            if not a.check:
                page.write_text(new, encoding="utf-8", newline="\n")
                written += 1

    snap = example_snapshot(a.dist, files, version, walk.ELEMENT_TYPES)
    old = SNAPSHOT.read_text(encoding="utf-8") if SNAPSHOT.exists() else None
    if snap != old:
        stale.append(SNAPSHOT.name)
        if not a.check:
            SNAPSHOT.write_text(snap, encoding="utf-8", newline="\n")
            written += 1

    print(f"gen_elements: schema-dist canonical {version.get('canonical')} serial {version.get('serial')}; "
          f"{len(walk.ELEMENT_TYPES)} types, {written} file(s) rewritten (the element pages and {SNAPSHOT.name})")
    for n in notes:
        print(f"  walk note: {n}")
    if a.check and stale:
        print(f"STALE: {', '.join(stale)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
