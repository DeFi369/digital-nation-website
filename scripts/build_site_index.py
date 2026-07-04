#!/usr/bin/env python3
"""Generate assets/data/site-index.json — the machine-readable page manifest
advertised in llms.txt. Run after adding/retiring pages:

    python3 scripts/build_site_index.py
"""

import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://defi369.github.io/digital-nation-website/"
SKIP = {"404.html", "government-structure-map.html"}


def extract(pattern, src):
    m = re.search(pattern, src, re.S)
    return m.group(1).strip() if m else None


def main():
    os.chdir(ROOT)
    pages = []
    for path in sorted(glob.glob("*.html")):
        if path in SKIP:
            continue
        src = open(path, encoding="utf-8").read()
        slug = path[:-5]
        data_file = f"assets/data/{slug}.json"
        pages.append({
            "page": BASE + path,
            "title": extract(r"<title>(.*?)</title>", src),
            "description": extract(r'<meta name="description" content="(.*?)"', src),
            "cluster": extract(r'data-theme="([a-z]+)"', src) or ("home" if path == "index.html" else None),
            "data": BASE + data_file if os.path.exists(data_file) else None,
        })
    manifest = {
        "name": "The Principality of Aetheria — site index",
        "generated": __import__("datetime").date.today().isoformat(),
        "base": BASE,
        "metrics": BASE + "assets/data/metrics.json",
        "sitemap": BASE + "sitemap.xml",
        "feed": BASE + "feed.xml",
        "llms": BASE + "llms.txt",
        "pageCount": len(pages),
        "pages": pages,
    }
    out = "assets/data/site-index.json"
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"{out}: {len(pages)} pages")


if __name__ == "__main__":
    main()
