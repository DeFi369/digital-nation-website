#!/usr/bin/env python3
"""Site integrity checker for the Aetheria static site.

Catches the corruption classes that scripted bulk edits have produced here
before: duplicated <main>/<header> blocks, orphaned dropdown markup, static
nav containers that should be empty (nav.js injects them), JS string literals
split across lines by naive regex passes, and unparseable data JSON.

Run locally:  python3 scripts/check_integrity.py
CI runs it on every push (.github/workflows/integrity.yml).
"""

import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages exempt from full-chrome checks (redirect stubs, standalone docs).
SKIP_CHROME = {"government-structure-map.html"}

failures = []


def fail(msg):
    failures.append(msg)


def check_html(path):
    name = os.path.basename(path)
    src = open(path, encoding="utf-8").read()

    if name not in SKIP_CHROME:
        for tag in ('<header class="site-header">', '<footer class="site-footer">', "</main>"):
            n = src.count(tag)
            if n != 1:
                fail(f"{name}: expected exactly 1 `{tag}`, found {n}")
        mains = len(re.findall(r'<main id="main"[^>]*>', src))
        if mains != 1:
            fail(f"{name}: expected exactly 1 `<main id=\"main\">`, found {mains}")
        # <header class="section-head"> etc. are legit — require balance only
        h_open = len(re.findall(r"<header\b", src))
        h_close = src.count("</header>")
        if h_open != h_close:
            fail(f"{name}: {h_open} <header> vs {h_close} </header>")
        for tag in ("<body", "</body>"):
            # <body may appear inside inline JS strings on map pages; require >= 1
            # real one and flag only if the count is 0.
            if src.count(tag) == 0:
                fail(f"{name}: missing `{tag}`")

        # nav containers must be EMPTY in static markup (nav.js injects them)
        if not re.search(r'<nav class="menu" id="site-menu" aria-hidden="true">\s*</nav>', src):
            fail(f"{name}: #site-menu is missing or not empty (nav.js must inject it)")
        if not re.search(r'<nav class="footer-nav"[^>]*>\s*</nav>', src):
            fail(f"{name}: .footer-nav is missing or not empty (nav.js must inject it)")

    # balanced dropdown markup (orphaned <summary> was a real regression)
    details_open = len(re.findall(r"<details\b", src))
    details_close = src.count("</details>")
    summaries = len(re.findall(r"<summary\b", src))
    if details_open != details_close:
        fail(f"{name}: {details_open} <details> vs {details_close} </details>")
    if summaries > details_open:
        fail(f"{name}: {summaries} <summary> but only {details_open} <details> (orphaned summary)")

    return src


def check_inline_scripts(path, src, node):
    """Syntax-check inline <script> blocks (no src=) with node --check."""
    name = os.path.basename(path)
    for i, m in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", src, re.S)):
        body = m.group(1).strip()
        if not body:
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as tmp:
            tmp.write(body)
            tmp_path = tmp.name
        try:
            r = subprocess.run([node, "--check", tmp_path], capture_output=True, text=True)
            if r.returncode != 0:
                first = (r.stderr.strip().splitlines() or ["syntax error"])[0]
                fail(f"{name}: inline script #{i + 1} fails node --check: {first}")
        finally:
            os.unlink(tmp_path)


def main():
    os.chdir(ROOT)
    node = shutil.which("node")

    pages = sorted(glob.glob("*.html"))
    if len(pages) < 50:
        fail(f"only {len(pages)} root pages found — did a bulk operation delete pages?")

    for page in pages:
        src = check_html(page)
        if node:
            check_inline_scripts(page, src, node)

    for js in sorted(glob.glob("assets/js/*.js")):
        if node:
            r = subprocess.run([node, "--check", js], capture_output=True, text=True)
            if r.returncode != 0:
                first = (r.stderr.strip().splitlines() or ["syntax error"])[0]
                fail(f"{js}: {first}")

    for data in sorted(glob.glob("assets/data/*.json")):
        try:
            json.load(open(data, encoding="utf-8"))
        except Exception as exc:
            fail(f"{data}: JSON parse error: {exc}")

    if not node:
        print("note: node not found — JS syntax checks skipped")

    if failures:
        print(f"INTEGRITY FAILURES ({len(failures)}):")
        for f in failures:
            print("  -", f)
        sys.exit(1)
    print(f"integrity OK: {len(pages)} pages, JS + JSON + nav containers clean")


if __name__ == "__main__":
    main()
