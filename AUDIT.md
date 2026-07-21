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

## Done
- **2026-07-04 — homepage redesign + site-wide nav repair** (commit `248501d`, Claude):
  - Fixed site-wide header duplication: `nav.js headerFragment()` used to emit the
    whole `.nav` block which every page injected INTO `#site-menu` → brand/member
    counter/hamburger duplicated inside the menu on all ~60 pages. Now emits menu
    links only.
  - `about.js`/`goals.js` called undefined `injectHeaderNav()` → init crashed, no
    stats/pillars/menu on those pages. Fixed to guarded `DigitalNationNav.injectHeader`.
  - `index.js`: removed duplicate `.menu-toggle` click binding (site.js owns the
    menu; double binding made the mobile menu open-then-instantly-close); fixed
    corrupted `escapeHtml` (entity replacements were no-ops, e.g. `&`→`&`).
  - `main.css`: compact sticky header (nav padding 14→8px, logo 32→24px, smaller
    member counter + dropdown summaries, uppercase top-level links, `.menu`
    overflow visible so dropdowns overlay, mobile panel anchored `top:100%`).
  - `index.html` rebuilt: full-viewport "cosmic observatory" hero (canvas starfield
    + citizen-lattice + meteors via new `assets/js/home-effects.js`, CSS nebulae/
    orbital rings/horizon glow), Unbounded display font + IBM Plex Mono telemetry,
    stats strip (data-driven `#index-stats`), numbered pillar cards
    (`#index-pillars`), feature tiles, manifesto ledger, status-lit project rows,
    citizen-press feed grid (`#citizen-press` is now an inner div so the JS no
    longer nukes the section heading), ghost-numbered join steps. All new styling
    scoped `.page-home` in new `assets/css/home.css` — other pages untouched.
  - Verified: desktop 1440 (fold/sections/tail), mobile 390 iframe rig + 500px
    direct, mobile menu opens (computed style + screenshot), no console errors.
  - Pushed to origin/main 2026-07-04 and verified LIVE on GitHub Pages
    (screenshot of deployed URL; home.css 200, new markup served).

- **2026-07-04 — nav dropdown rebuild** (commit `84620d0`): compact labeled
  panels, two-column for big groups, right-edge alignment, hover-open +
  single-open + Escape + outside-click close (old code bound before injection so
  outside-click NEVER worked), aria-current page marking, footer panels open up.
- **2026-07-04 — all inner pages repaired + themed** (commit `26685c3`):
  59 pages carried corrupted markup (22 in-header junk, 37 duplicated-main junk)
  — stripped; 15 pages had stats above the h1 — reordered; 37 scripts double-
  bound the menu, 42 had no-op escapeHtml, 8 never injected the nav — all fixed;
  nav.js now auto-injects empty menus (fixes passport/404); site.js got the
  missing loadDashboardScript (P0-1). New cluster theme layer:
  `assets/css/page-theme.css` + `assets/js/page-ambient.js`, wired into all 68
  inner pages with per-cluster accents (foundations blue / governance indigo /
  identity violet / policy teal / diplomacy gold / engagement rose).

- **2026-07-04 — footer rebuilt** (commit `0272f22`): footers had drifted into
  23 per-page variants; now injected from nav.js's single NAV_GROUPS source
  (shared with header dropdowns) as a six-column sitemap. structure.html's
  broken header template + inline-string SyntaxError fixed (map renders again);
  GitHub footer links point at the real repo.

- **2026-07-04 — repo hygiene pass** (commit `53d0eb2`, all verified LIVE):
  stale cluster dirs deleted; inject-nav.py (source of the header corruption)
  deleted; government-structure-map.html → redirect stub; canonical
  `assets/data/metrics.json` wired into member counter / protocol badge /
  homepage telemetry; sitemap (67 URLs) + Atom feed regenerated; README
  rewritten (correct preview instructions); `scripts/check_integrity.py` + CI
  workflow green on first run; `AGENTS.md` added with hard rules for agents.
  Lesson: Pages deploys can fail transiently ("try again later") — after
  pushing, confirm with `gh run list` or curl the live files.

- **2026-07-21 — Hub improvement round** (commit `583aad1`):
  - Hub: added `og:image`, `sitemap`, `favicon`, `skip-link`, JSON-LD, canonical
  - Governance v2: added `favicon`
  - Roadmap: added `sitemap`
  - HL MCP: added `favicon`
  - Archive: added `sitemap`
  - Structure: added `sitemap`
  - Ecosystem: added `favicon`
  - Index: added `sitemap`
  - Protocol v1: added `sitemap`
  - Verified: grep-based automated pass on all 9 pages

- **2026-07-21 — Round 2 improvements** (commit `f77c3c0`):
  - Hub: upgraded title to `<h1>` semantic heading
  - Governance v2: fixed canonical URL + added `name="description"`
  - Roadmap: added `name="robots" content="index, follow"`
  - HL MCP: added `name="description"`
  - Archive: added `role="banner"` to header
  - Structure: added `<noscript>` meta refresh fallback
  - Ecosystem: added `name="robots" content="index, follow"`
  - Index: added `name="robots" content="index, follow"`
  - Protocol v1: added `name="robots" content="index, follow"`
  - Verified: grep-based automated pass on all 9 pages


- **2026-07-21 — Round 3 improvements** (commit `3a874a4`):
  - All 9 pages: added `name="generator" content="Digital Nation Static Site"`
  - Verified: each file contains exactly 1 generator meta tag

- **2026-07-21 — Round 4 improvements** (commit `c80d3c6`):
  - All 9 pages: added `name="referrer" content="strict-origin-when-cross-origin"`
  - All 9 pages: added `name="author" content="Digital Nation"`
  - All 9 pages: added `name="theme-color" content="#020408"`
  - Verified: grep-based pass on all 9 pages for all 3 new tags each

## Open
- **2026-07-21 — Round 3 pending** (next improvement cycle)
- Member-count narrative gap (owner decision): the header pill counts real
  registry entries (10) while national stats claim 12450 registered citizens.
  Both now come from metrics.json, but reconciling the story is a content call.
- `AUDIT-CLAUDE.md` (2026-07-02 audit) P1/P2 backlog — remaining: metadata/OG
  consistency, loader unification, accessibility follow-ups (focus trap).
- nav.js footer/header link lists have drifted (footer lacks Research Papers,
  WorldHermes, etc.); consider single source of truth for both fragments.
- `nav.js` `footerFragment()` is exported but pages carry static footer markup —
  dead path worth unifying one way or the other.
