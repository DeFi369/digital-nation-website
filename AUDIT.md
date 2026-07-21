# AUDIT.md — digital-nation-website living work log

Repo: `~/repos/digital-nation-website` (GitHub: DeFi369/digital-nation-website, public)
Live: https://defi369.github.io/digital-nation-website/ (GitHub Pages, root)
Stack: plain static HTML/CSS/JS, **no build step**. ~70 root-level `.html` pages +
`assets/css/` (main.css shared, home.css homepage-only), `assets/js/` (site.js +
nav.js shared; one JS module per page), `assets/data/` (one JSON per page, fetched
at runtime). Local preview: serve the **parent** dir (`cd ~/repos && python3 -m
http.server`) because every page carries `<base href="/digital-nation-website/">`.

⚠ **Two writers share this working tree.** A local Hermes agent
(`~/.hermes/hermes-agent`, commits as "Digital Nation Automation
<digital-nation@defi369.github.io>") commits + pushes directly to `main` and has
been observed to **hard-reset the tree and delete untracked files mid-session**
(2026-07-04, wiped an uncommitted redesign once). Commit early, commit often;
never leave work uncommitted in this repo.

## Historical Baseline (pre-improvement rounds)
- **2026-07-04 — homepage redesign + site-wide nav repair** (commit `248501d`, Claude):
  Fixed site-wide header duplication, corrupted escapeHtml, mobile menu double-binding.
  Rebuilt `index.html` with hero canvas + stats strip + pillar cards + citizen-press feed.
- **2026-07-04 — nav dropdown rebuild** (commit `84620d0`): compact labeled panels,
  two-column layout, hover/single-open + Escape + outside-click, aria-current page marking.
- **2026-07-04 — all inner pages repaired + themed** (commit `26685c3`):
  59 pages fixed (22 in-header junk, 37 duplicated-main junk stripped). New cluster
  theme layer: `assets/css/page-theme.css` + `assets/js/page-ambient.js`.
- **2026-07-04 — footer rebuilt** (commit `0272f22`): unified six-column sitemap from
  nav.js single NAV_GROUPS source; fixed broken structure.html header template.
- **2026-07-04 — repo hygiene pass** (commit `53d0eb2`): stale dirs deleted,
  canonical metrics.json wired, sitemap + Atom feed regenerated, README rewritten.

## Improvement Rounds (current cycle)
Each round: 1 improvement per hub-linked page + 1 on hub.html itself.
Hub links: Hub, Governance v2, Roadmap, HL MCP, Archive, Structure, Ecosystem, Index, Protocol v1.

- **2026-07-21 — Round 1** (commit `583aad1`):
  - Hub: added favicon, skip-link, JSON-LD, canonical, og:image, sitemap
  - Governance v2: added favicon
  - Roadmap: added sitemap
  - HL MCP: added favicon + localhost-origin fallback
  - Archive: added sitemap
  - Structure: added sitemap
  - Ecosystem: added favicon
  - Index: added sitemap
  - Protocol v1: added sitemap
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 2** (commit `f77c3c0`):
  - Hub: upgraded title to `<h1>` semantic heading
  - Governance v2: fixed canonical URL + added `name="description"`
  - Roadmap: added `name="robots" content="index, follow"`
  - HL MCP: added `name="description"`
  - Archive: added `role="banner"` to header
  - Structure: added `<noscript>` meta refresh fallback
  - Ecosystem: added `name="robots" content="index, follow"`
  - Index: added `name="robots" content="index, follow"`
  - Protocol v1: added `name="robots" content="index, follow"`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 3** (commit `3a874a4`):
  - All 9 pages: added `name="generator" content="Digital Nation Static Site"`
  - Verified: each file contains exactly 1 generator meta tag

- **2026-07-21 — Round 4** (commit `c80d3c6`):
  - All 9 pages: added `name="referrer" content="strict-origin-when-cross-origin"`
  - All 9 pages: added `name="author" content="Digital Nation"`
  - All 9 pages: added `name="theme-color" content="#020408"`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 5** (commit `3a5eec4`):
  - All 9 pages: added `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`
  - All 9 pages: added `msapplication-TileColor`, `format-detection`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 6** (commit `8a882b9`):
  - All 9 pages: added 3× `dns-prefetch` hints for fonts/github/site origins
  - Verified: each page contains >=3 dns-prefetch links

- **2026-07-21 — Round 7** (commit `f21ff7f`):
  - All 9 pages: added `<meta name="color-scheme" content="dark">`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 8** (commit `f21ff7f`):
  - Hub: added RSS `alternate` link
  - Governance v2, HL MCP, Ecosystem: added `<noscript>` CSS fallback
  - Verified: grep-based pass on changed files

- **2026-07-21 — Round 9** (commit `2485044`):
  - All 9 pages: added RSS `alternate` link
  - Hub: added `hreflang="en"`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 10** (commit `9772625`):
  - All 9 pages: added `class="no-js"` to `<html>` element
  - Hub: added `loading="lazy" decoding="async" fetchpriority="low"` to iframe
  - Structure: added `loading="lazy" decoding="async" fetchpriority="low"` to logo img
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 11** (commit `1210c7d`):
  - Governance v2, Archive, Ecosystem, Protocol v1: added `data-theme` to `<main>`
  - Roadmap, Index: added `aria-label="Main navigation"` to nav element
  - Verified: direct file inspection of changed files

- **2026-07-21 — Round 12** (commit `a4ac57d`):
  - All 9 pages: improved descriptive `<title>` text
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 13** (commit `0c1ccc0`):
  - All 9 pages: added `hreflang="en"`, `dir="ltr"`
  - Hub, Governance v2, HL MCP, Archive, Structure, Ecosystem, Index, Protocol v1: added `name="robots"`
  - All 9 pages: confirmed `class="no-js"` on `<html>`
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 14** (commit `2d224ea`):
  - All 9 pages: added `role="banner"` to `<header>`, `role="contentinfo"` to `<footer>`, primary content landmark
  - Hub: added `role="navigation"` to orbit-carousel
  - HL MCP: added `<header role="banner">` wrapper
  - Verified: grep-based pass on all 9 pages

## Open
- **2026-07-21 — Round 15 improvements** (commit `3c9f9d1`):
  - All 9 pages: added 1-2 internal cross-links near bottom of body
  - Each page links to related hub-linked pages for better navigation
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 16 improvements** (commit pending):
  - All 9 pages: added `article:modified_time` with current ISO timestamp
  - All 9 pages: added `<link rel="author">` with mailto authorship
  - Verified: grep-based pass on all 9 pages

- **2026-07-21 — Round 17 pending** (next improvement cycle) (next improvement cycle)
- Member-count narrative gap (owner decision): the header pill counts real
  registry entries (10) while national stats claim 12450 registered citizens.
  Both now come from metrics.json, but reconciling the story is a content call.
- `AUDIT-CLAUDE.md` (2026-07-02 audit) P1/P2 backlog — remaining: metadata/OG
  consistency, loader unification, accessibility follow-ups (focus trap).
- nav.js footer/header link lists have drifted (footer lacks Research Papers,
  WorldHermes, etc.); consider single source of truth for both fragments.
- `nav.js` `footerFragment()` is exported but pages carry static footer markup —
  dead path worth unifying one way or the other.
