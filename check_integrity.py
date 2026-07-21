#!/usr/bin/env python3
"""
check_integrity.py — Validates digital-nation-website against GOVERNMENT-LATTICE-MAP.md
Run as CI gate: python3 check_integrity.py
"""

import json
import re
import sys
from pathlib import Path

WEBSITE_ROOT = Path("/home/user/repos/digital-nation-website")
LATTICE_MAP = WEBSITE_ROOT / "GOVERNMENT-LATTICE-MAP.md"
NAV_JS = WEBSITE_ROOT / "assets/js/nav.js"
SITEMAP_XML = WEBSITE_ROOT / "sitemap.xml"
METRICS_JSON = WEBSITE_ROOT / "assets/data/metrics.json"

# Retired/Deprecated offices from lattice map (should NOT appear on public site)
RETIRED_OFFICES = {
    "secretary_of_justice_and_constitutional_compliance",
    "director_of_digital_operations",
    "director_of_situational_awareness",
    "secretary_of_education",
    "secretary_of_interior",
    "senior_counsel_to_the_president",
}

# Pages that should NOT exist (retired offices)
RETIRED_PAGES = {
    "justice.html",
    "education.html", 
    "situational-awareness.html",
    "digital-operations.html",
}

# Pages that SHOULD exist (active offices)
ACTIVE_PAGES = {
    "assembly.html",
    "court.html",
    "safety.html",
    "citizenship.html",
    "passport.html",
    "registry.html",
    "economy.html",
    "finance.html",
    "treasury.html",
    "environment.html",
    "sustainability.html",
    "science.html",
    "technology.html",
    "health-equity.html",
    "bandwidth.html",
    "health.html",
    "infrastructure.html",
    "diplomacy.html",
    "protocol.html",
    "consular.html",
    "culture.html",
    "communications.html",
}

def parse_lattice_map():
    """Parse GOVERNMENT-LATTICE-MAP.md for active/retired status."""
    content = LATTICE_MAP.read_text()
    
    active_offices = set()
    retired_offices = set()
    
    # Find lines with "— *Legacy operational office; deprecated.*" or "retired from active public structure"
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'deprecated' in line.lower() or 'retired from active' in line.lower():
            # Look for the office name in previous lines
            for j in range(max(0, i-3), i):
                if lines[j].strip().startswith('**') and lines[j].strip().endswith('**'):
                    office_name = lines[j].strip('*').strip()
                    retired_offices.add(office_name.lower().replace(' ', '_'))
    
    return active_offices, retired_offices

def check_nav_js():
    """Verify nav.js doesn't contain retired office links."""
    content = NAV_JS.read_text()
    errors = []
    
    for page in RETIRED_PAGES:
        if page.replace('.html', '') in content:
            errors.append(f"nav.js contains retired page: {page}")
    
    # Check justice.html and education.html specifically
    if 'justice.html' in content:
        errors.append("nav.js contains justice.html (should be retired)")
    if 'education.html' in content:
        errors.append("nav.js contains education.html (should be folded under Infrastructure)")
    if 'situational-awareness.html' in content:
        errors.append("nav.js contains situational-awareness.html (should be retired)")
    
    return errors

def check_sitemap():
    """Verify sitemap.xml doesn't contain retired pages."""
    content = SITEMAP_XML.read_text()
    errors = []
    
    for page in RETIRED_PAGES:
        if page in content:
            errors.append(f"sitemap.xml contains retired page: {page}")
    
    return errors

def check_metrics():
    """Verify metrics.json has honest citizen count."""
    content = json.loads(METRICS_JSON.read_text())
    errors = []
    
    if content.get('stats', {}).get('registeredCitizens', 0) > 100:
        errors.append(f"metrics.json registeredCitizens = {content['stats']['registeredCitizens']} (inflated, should be 10)")
    
    return errors

def check_retired_pages_deleted():
    """Verify retired pages are deleted or redirected."""
    errors = []
    
    for page in RETIRED_PAGES:
        path = WEBSITE_ROOT / page
        if path.exists() and page != "justice.html":  # justice.html is now a redirect stub
            errors.append(f"Retired page still exists: {page}")
    
    # Check justice.html is a redirect
    justice = WEBSITE_ROOT / "justice.html"
    if justice.exists():
        content = justice.read_text()
        if "court.html" not in content or "refresh" not in content.lower():
            errors.append("justice.html exists but is not a proper redirect to court.html")
    
    return errors

def check_active_pages_exist():
    """Verify active pages still exist."""
    errors = []
    missing = []
    
    for page in ACTIVE_PAGES:
        if not (WEBSITE_ROOT / page).exists():
            missing.append(page)
    
    if missing:
        errors.append(f"Active pages missing: {missing}")
    
    return errors

def main():
    all_errors = []
    
    print("🔍 Checking website integrity against GOVERNMENT-LATTICE-MAP.md...")
    
    all_errors.extend(check_nav_js())
    all_errors.extend(check_sitemap())
    all_errors.extend(check_metrics())
    all_errors.extend(check_retired_pages_deleted())
    all_errors.extend(check_active_pages_exist())
    
    if all_errors:
        print("\n❌ INTEGRITY CHECK FAILED:")
        for err in all_errors:
            print(f"  - {err}")
        return 1
    else:
        print("\n✅ All integrity checks PASSED")
        return 0

if __name__ == "__main__":
    sys.exit(main())