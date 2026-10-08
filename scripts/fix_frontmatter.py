"""Quote front-matter titles and descriptions that YAML would misread (a ': ' inside, or a leading
@ ` * [ { ' " character). Only those two keys, only when unquoted. Safe to rerun.

Usage: python scripts/fix_frontmatter.py
"""
import json
import re
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "src" / "content" / "docs"
KEY = re.compile(r"^(title|description): (.*)$")
changed = []
for p in DOCS.rglob("*.md*"):
    s = p.read_text(encoding="utf-8")
    if not s.startswith("---\n") or "\n---\n" not in s[4:]:
        continue
    fm, rest = s[4:].split("\n---\n", 1)
    out = []
    for line in fm.split("\n"):
        m = KEY.match(line)
        if m:
            v = m.group(2)
            quoted = v[:1] in ("'", '"')
            if not quoted and (": " in v or v.endswith(":") or v[:1] in "@`*[{&!%|>#"):
                line = f"{m.group(1)}: {json.dumps(v, ensure_ascii=False)}"
        out.append(line)
    new = "---\n" + "\n".join(out) + "\n---\n" + rest
    if new != s:
        p.write_text(new, encoding="utf-8", newline="\n")
        changed.append(str(p.relative_to(DOCS)))
print(f"fix_frontmatter: {len(changed)} file(s) quoted", *changed, sep="\n  ")
