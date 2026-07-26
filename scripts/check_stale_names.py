#!/usr/bin/env python3
"""Scan the site for stale brand names that should have been renamed to Noosphere.

Catches regressions where old names (Aetheria / Digital Nation / Principality of Aetheria)
reappear in HTML, JSON, MD, or XML files. Exits non-zero if any are found so it can be
wired into CI or a cron job.

Usage: python3 scripts/check_stale_names.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Patterns that should NOT appear anywhere (old brand names)
STALE = [
    "AETHERIA",
    "Aetheria",
    "aetheria",
    "The Principality of Aetheria",
    "Principality of Aetheria",
    "Digital Nation",
    "digital nation",
]

# Paths to skip (build artifacts, deps, git)
SKIP_DIRS = {".git", "node_modules", "dist", "__pycache__", ".venv", "venv"}
SKIP_FILES = {"check_stale_names.py"}

EXTS = {".html", ".json", ".md", ".xml", ".txt", ".svg"}

found = []

for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in files:
        if f in SKIP_FILES:
            continue
        if not any(f.endswith(e) for e in EXTS):
            continue
        path = os.path.join(dirpath, f)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
        except Exception:
            continue
        for pat in STALE:
            if pat in content:
                rel = os.path.relpath(path, ROOT)
                found.append(f"{rel}: contains '{pat}'")

if found:
    print(f"FAIL: {len(found)} stale-name reference(s) found:")
    for f in found:
        print(f"  - {f}")
    sys.exit(1)

print("OK: no stale brand names found.")
sys.exit(0)
