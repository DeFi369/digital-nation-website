#!/usr/bin/env python3
"""Site-wide rename: Noosphere / Noosphere -> Noosphere.
Safe: only replaces display text, never URL paths or dir names
('digital-nation-website' is hyphenated/lowercase, won't match).
Longest phrases first to avoid partial-match corruption.
"""
import os, pathlib

REPLACEMENTS = [
    ("Noosphere", "Noosphere"),
    ("Noosphere", "Noosphere"),
    ("Noosphere", "Noosphere"),
]

EXTS = {".html", ".htm", ".json", ".xml", ".css", ".js", ".md", ".txt", ".svg", ".yml", ".yaml"}
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".hermes"}

ROOT = pathlib.Path(__file__).resolve().parent.parent

def walk(root):
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix.lower() not in EXTS:
            continue
        yield p

changed = []
for p in walk(ROOT):
    try:
        text = p.read_text(encoding="utf-8")
    except Exception:
        continue
    new = text
    for old, repl in REPLACEMENTS:
        new = new.replace(old, repl)
    if new != text:
        p.write_text(new, encoding="utf-8")
        changed.append(str(p.relative_to(ROOT)))

print(f"Renamed in {len(changed)} files:")
for c in sorted(changed):
    print("  ", c)
