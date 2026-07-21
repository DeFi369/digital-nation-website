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
    for i, m in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", src, re.S)):
        attrs, body = m.group(1), m.group(2).strip()
        if not body:
            continue
        type_m = re.search(r'type="([^"]+)"', attrs)
        if type_m and "javascript" not in type_m.group(1):
            continue  # JSON-LD, templates, etc. are not JS
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


def check_links(path, src, existing):
    """Every internal href/src must resolve to a file in the repo."""
    name = os.path.basename(path)
    for attr, target in re.findall(r'\b(href|src)="([^"]+)"', src):
        target = target.split("#")[0].split("?")[0].strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "data:", "//", "javascript:")):
            continue
        if target.startswith("./"):
            target = target[2:]
        target = target.lstrip("/")
        # pages carry <base href="/digital-nation-website/"> — strip it
        if target.startswith("digital-nation-website/"):
            target = target[len("digital-nation-website/"):]
        if target and target not in existing:
            fail(f"{name}: broken internal {attr} -> {target}")


def main():
    os.chdir(ROOT)
    node = shutil.which("node")

    existing = set()
    for base, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in files:
            existing.add(os.path.relpath(os.path.join(base, f), ".").replace(os.sep, "/"))

    pages = sorted(glob.glob("*.html"))
    if len(pages) < 50:
        fail(f"only {len(pages)} root pages found — did a bulk operation delete pages?")

    for page in pages:
        src = check_html(page)
        check_links(page, src, existing)
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

    # Leakage rule (governance-drift gate): the public site MUST NOT advertise
    # any office that GOVERNMENT-LATTICE-MAP.md has retired. We derive the
    # canonical retired-office list dynamically from the lattice map's
    # "POSITIONS RETIRED FROM OPERATIONAL/MAPPING VIEW" section so the rule
    # cannot drift out of sync, then:
    #   1. Flag any active href to a retired office's page (public HTML).
    #   2. Flag any retired office still wired into assets/js/nav.js.
    #   3. Flag any retired office's page still listed in sitemap.xml.
    # Historical/deprecated mentions (e.g. lineage notes) are NOT flagged —
    # only ACTIVE presentation (links/targets) constitutes drift.
    lattice_path = os.path.join(ROOT, "GOVERNMENT-LATTICE-MAP.md")
    lattice_text = open(lattice_path, encoding="utf-8").read() if os.path.exists(lattice_path) else ""

    # Retired office name -> public page that would advertise it (if present).
    RETIRED_PAGE_MAP = {
        "Secretary of Education": "education.html",
        "Secretary of Interior": "interior.html",
        "Secretary of Justice & Constitutional Compliance": "justice.html",
        "Senior Counsel to the President": "senior-counsel.html",
        "Director of Digital Operations": "digital-operations.html",
        "Director of Situational Awareness": "situational-awareness.html",
        "Attorney General": "attorney-general.html",
        "Secretary of Defense": "defense.html",
    }
    # Only treat an office as "must not be advertised" if the lattice map
    # explicitly lists it under its retired-positions section.
    sec_marker = "POSITIONS RETIRED FROM OPERATIONAL"
    retired_names = []
    if sec_marker in lattice_text:
        sec = lattice_text.split(sec_marker, 1)[1].split("\n---", 1)[0]
        for name in RETIRED_PAGE_MAP:
            if name.lower() in sec.lower():
                retired_names.append(name)

    # 1) Active href to a retired office's page == governance-drift leak.
    for page in pages:
        if page in SKIP_CHROME:
            continue
        psrc = open(page, encoding="utf-8").read()
        for name, target in RETIRED_PAGE_MAP.items():
            if name not in retired_names:
                continue
            if f'href="{target}"' in psrc:
                fail(f"{page}: active link to retired office page `{target}` ({name}; governance drift)")

    # 2) Retired office still wired into nav.js (the injected menu).
    nav_path = os.path.join(ROOT, "assets/js/nav.js")
    if os.path.exists(nav_path):
        nav_src = open(nav_path, encoding="utf-8").read()
        for name, target in RETIRED_PAGE_MAP.items():
            if name not in retired_names:
                continue
            if target in nav_src:
                fail(f"assets/js/nav.js: contains retired office link `{target}` ({name}; governance drift)")

    # 3) Retired office page still listed in sitemap.xml.
    sm_path = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sm_path):
        sm_src = open(sm_path, encoding="utf-8").read()
        for name, target in RETIRED_PAGE_MAP.items():
            if name not in retired_names:
                continue
            if target in sm_src:
                fail(f"sitemap.xml: contains retired office page `{target}` ({name}; governance drift)")

    if failures:
        print(f"INTEGRITY FAILURES ({len(failures)}):")
        for f in failures:
            print("  -", f)
        sys.exit(1)
    print(f"integrity OK: {len(pages)} pages, JS + JSON + nav containers clean")


if __name__ == "__main__":
    main()
