#!/usr/bin/env python3
"""
Build script to inject shared nav template into all HTML pages.
Run: python3 scripts/inject-nav.py
"""

from pathlib import Path
import re

SITE_ROOT = Path('/home/user/repos/digital-nation-website')
TEMPLATE = SITE_ROOT / 'assets' / 'nav-template.html'

# Pages that use the standard nav (exclude visualization pages)
EXCLUDE = {'structure.html', 'government-structure-map.html'}

def inject_nav(page_path: Path, template_html: str) -> bool:
    """Inject nav template into page. Returns True if changed."""
    text = page_path.read_text()
    
    # Find the header section to replace
    # Pattern: from <header class="site-header"> to </header> (the closing one before main)
    header_pattern = r'<header class="site-header">.*?</header>\s*'
    
    # Check if page already has the new template structure
    if '<nav class="menu" id="site-menu" aria-hidden="true"></nav>' in text and 'assets/js/nav.js' in text:
        # Page already has the new structure, just ensure nav.js script is present
        if 'assets/js/nav.js' not in text:
            # Add nav.js before site.js
            text = text.replace('  <script src="assets/js/site.js"></script>', '  <script src="assets/js/nav.js"></script>\n  <script src="assets/js/site.js"></script>', 1)
            page_path.write_text(text)
            return True
        return False
    
    # Replace old header with template
    new_text = re.sub(header_pattern, template_html, text, count=1, flags=re.DOTALL)
    
    if new_text != text:
        page_path.write_text(new_text)
        return True
    return False

def main():
    template_html = TEMPLATE.read_text()
    changed = []
    
    for page in sorted(SITE_ROOT.glob('*.html')):
        if page.name in EXCLUDE:
            continue
        if inject_nav(page, template_html):
            changed.append(page.name)
            print(f"Updated: {page.name}")
    
    print(f"\nTotal pages updated: {len(changed)}")
    if changed:
        print("Changed:", ", ".join(changed))

if __name__ == '__main__':
    main()