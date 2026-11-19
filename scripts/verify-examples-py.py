"""verify-examples-py.py: every Python example on the pages type-checks against the installed onlyworlds package.

Usage: python scripts/verify-examples-py.py   (offline once installed; CI: pip install onlyworlds mypy)

Source: each ```python block under src/content, its own module, checked with ``mypy --strict`` against the
onlyworlds package this Python has (CI installs the newest from PyPI, as the nightly practice run does); the
version read is printed. A block often uses what an earlier block made (``client``) or a value the reader
brings (``world_id``). The first pass checks each block alone and reads which names it uses without defining
them; the second gives it exactly those, at the top: a name the package exports is imported from it (so the
export must exist), any other is declared with its type from CONTEXT. A name in neither fails by name.

Fails: a block that does not type-check (a function, a keyword, an attribute, a return type the package
does not have), or a name no table types. Not checked: the blocks are never run by it; element bodies are
``dict[str, Any]``, so a wrong key inside one passes; TypeScript (verify-examples.mjs), shell and JSON.

Exit: 0 PASS, 1 FAIL, 2 BLIND (onlyworlds or mypy not installed, or no block found: never a pass).
"""

from __future__ import annotations

import importlib.util
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "src" / "content"

# What the pages' prose says a name is when a block uses it without making it.
CONTEXT = {
    "client": "onlyworlds.Client",
    "writer": "onlyworlds.Client",
    "world_id": "str",
    "element_id": "str",
    "character_id": "str",
    "cid": "str",
    "eid": "str",  # a new element's id, written as proposed
    "elements": "list[dict[str, Any]]",
    "members": "list[dict[str, Any]]",
    "folder": "onlyworlds.Folder",
    "saved_cursor": "str | None",
}

FREE = re.compile(r'^(b\d+)\.py:(\d+): error: Name "([^"]+)" is (?:not defined|used before definition)')
ERROR = re.compile(r"^(b\d+)\.py:(\d+): error: (.*)$")


def blind(why: str) -> None:
    print(f"BLIND: {why}")
    sys.exit(2)


def blocks() -> list[tuple[Path, int, str]]:
    found: list[tuple[Path, int, str]] = []
    for page in sorted(p for p in PAGES.rglob("*") if p.suffix in (".md", ".mdx")):
        lines = page.read_text(encoding="utf-8").splitlines()
        i = 0
        while i < len(lines):
            m = re.match(r"^(\s*)```python\s*$", lines[i])
            if m:
                indent = len(m.group(1))
                j = i + 1
                while j < len(lines) and not re.match(r"^\s*```\s*$", lines[j]):
                    j += 1
                if j >= len(lines):
                    print(f"FAIL {page.relative_to(ROOT).as_posix()}:{i + 1}: a python block that never closes")
                    sys.exit(1)
                body = "\n".join(line[min(indent, len(line) - len(line.lstrip())) :] for line in lines[i + 1 : j])
                found.append((page, i + 2, body))
                i = j
            i += 1
    return found


def mypy(folder: Path, files: dict[str, str]) -> list[str]:
    for name, text in files.items():
        (folder / name).write_text(text, encoding="utf-8")
    r = subprocess.run(
        [sys.executable, "-m", "mypy", "--strict", "--no-error-summary", "--show-error-codes",
         "--cache-dir", str(folder / ".mypy_cache"), *sorted(files)],
        cwd=folder, capture_output=True, text=True, encoding="utf-8",
    )
    if r.returncode not in (0, 1):
        blind(f"mypy did not run: exit {r.returncode}: {(r.stdout + r.stderr).strip()[:300]}")
    out = [line for line in r.stdout.splitlines() if ": error: " in line]
    if (r.returncode == 0) != (not out):
        blind(f"mypy's exit ({r.returncode}) and its error lines ({len(out)}) disagree")
    return out


def main() -> None:
    try:
        import onlyworlds
    except ImportError:
        blind("the onlyworlds package is not installed (pip install onlyworlds)")
    if importlib.util.find_spec("mypy") is None:
        blind("mypy is not installed (pip install mypy)")
    exported = set(onlyworlds.__all__)
    version = getattr(onlyworlds, "__version__", "?")
    every = blocks()
    # A plain HTTP example (it imports requests and not the package) shows the API, not the package.
    plain = [
        b for b in every
        if re.search(r"^\s*(import|from) requests\b", b[2], re.M) and not re.search(r"^\s*(import|from) onlyworlds\b", b[2], re.M)
    ]
    found = [b for b in every if b not in plain]
    if not found:
        blind("no python block that uses the package found under src/content")
    key = {f"b{n:03d}": (page, line, body) for n, (page, line, body) in enumerate(found)}
    failed = 0
    with tempfile.TemporaryDirectory(prefix="ow-docs-examples-py-") as tmp:
        folder = Path(tmp)
        free: dict[str, set[str]] = {}
        for line in mypy(folder, {f"{k}.py": body + "\n" for k, (_, _, body) in key.items()}):
            m = FREE.match(line)
            if m:
                free.setdefault(m.group(1), set()).add(m.group(3))
        full: dict[str, str] = {}
        offset: dict[str, int] = {}
        for k, (page, line, body) in key.items():
            used = sorted(free.get(k, set()))
            from_pkg = [x for x in used if x in exported]
            declared = [x for x in used if x not in exported]
            for x in declared:
                if x not in CONTEXT:
                    print(f"FAIL {page.relative_to(ROOT).as_posix()}:{line}: `{x}` is used, and no earlier line of the "
                          "block makes it, the package does not export it and CONTEXT does not type it")
                    failed += 1
            head = ["from typing import Any", "import onlyworlds"]
            if from_pkg:
                head.append(f"from onlyworlds import {', '.join(from_pkg)}")
            head += [f"{x}: {CONTEXT[x]}" for x in declared if x in CONTEXT]
            head.append("_ = (Any, onlyworlds)")
            offset[k] = len(head)
            full[f"{k}.py"] = "\n".join(head) + "\n" + body + "\n"
        for err in mypy(folder, full):
            m = ERROR.match(err)
            if not m:
                print(f"FAIL (outside a block) {err}")
                failed += 1
                continue
            page, line, _ = key[m.group(1)]
            at = line + int(m.group(2)) - offset[m.group(1)] - 1
            print(f"FAIL {page.relative_to(ROOT).as_posix()}:{at}: {m.group(3)}")
            failed += 1
    pages = len({page for page, _, _ in found})
    if failed:
        print(f"FAIL: {failed} finding(s) in {len(found)} Python block(s) on {pages} page(s), against onlyworlds {version}.")
        sys.exit(1)
    print(f"PASS: {len(found)} Python block(s) on {pages} page(s) type-check against onlyworlds {version}. "
          f"Not checked: {len(plain)} plain HTTP block(s) (requests, no package); the blocks are never run by it; "
          "element bodies are untyped; shell and JSON blocks.")


if __name__ == "__main__":
    main()
