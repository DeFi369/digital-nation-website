# THE PRINCIPALITY OF AETHERIA — Public Website

A digital micronation experience built around transparent governance, cryptographic
citizenship, and open protocol infrastructure.

- Nation: **THE PRINCIPALITY OF AETHERIA** · Motto: **SOVEREIGN BY CODE**
- Live site: https://defi369.github.io/digital-nation-website/ (GitHub Pages, root)
- Stack: plain static HTML/CSS/JS. **No build step.**

> **Working on this repo (humans and agents): read [`AGENTS.md`](AGENTS.md) and
> [`AUDIT.md`](AUDIT.md) first.** They contain the architecture rules that keep
> 69 pages consistent, and the current work log.

## Architecture

~67 content pages live flat in the repo root (flat on purpose: GitHub Pages has no
server redirects, so moving pages breaks URLs). Shared infrastructure:

| Piece | Role |
| --- | --- |
| `assets/css/main.css` | Site-wide styles: header, nav dropdowns, footer, cards |
| `assets/css/home.css` | Homepage only (`body.page-home`): observatory hero, telemetry, sections |
| `assets/css/page-theme.css` | All inner pages (`body[data-theme]`): cluster accents, stats/pillar cards |
| `assets/js/nav.js` | **Single source of nav truth** (`NAV_GROUPS`) → header dropdowns + footer sitemap columns; auto-injects any empty `#site-menu` / `.footer-nav` |
| `assets/js/site.js` | Menu behavior, dropdown behavior (delegated), member counter + protocol badge (from `metrics.json`), per-page script loader |
| `assets/js/home-effects.js` | Homepage starfield/constellation canvas + scroll reveals |
| `assets/js/page-ambient.js` | Inner-page ambient starfield tinted by cluster accent |
| `assets/js/<page>.js` | One module per page; renders that page's `assets/data/<page>.json` |
| `assets/data/metrics.json` | **Canonical shared metrics** (members, protocol version, uptime…) — never duplicate these in per-page JSON |

Every page's `<body>` carries `data-theme="<cluster>"` (foundations / governance /
identity / policy / diplomacy / engagement), which drives its accent color and
ambient graphics. Headers and footers in page HTML are **empty containers** —
nav.js fills them at runtime. Never hand-edit nav markup in a page.

## Local preview

Pages carry `<base href="/digital-nation-website/">`, so serve the **parent**
directory and open the subpath:

```bash
cd ~/repos && python3 -m http.server 8080
# open http://localhost:8080/digital-nation-website/
```

(Serving the repo root directly breaks asset resolution because of the base href.)

## Integrity checks

```bash
python3 scripts/check_integrity.py
```

Validates every page's structure (single header/main/footer, balanced details,
empty nav containers, parseable JSON, JS syntax incl. inline scripts). Runs in CI
on every push (`.github/workflows/integrity.yml`) — run it locally before
committing, especially after any scripted bulk edit.

## Deployment

Push to `main` → GitHub Pages deploys the repo root. `sitemap.xml`, `feed.xml`
(Atom, generated from `assets/data/citizen-press.json`), and `robots.txt` use the
canonical base URL. `404.html` carries full site chrome.

## Government structure

AETHERIA is a layered digital republic — Constitutional Core, Strategic Cabinet,
Operational Offices, Service Branches, the Assembly, and the Charter Tribunal.
See `structure.html` for the interactive map and `charter.html` for the founding
charter.
