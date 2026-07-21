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

## Open
- **2026-07-21 — Round 2 pending** (next improvement cycle)
- Member-count narrative gap (owner decision): the header pill counts real
  registry entries (10) while national stats claim 12450 registered citizens.
  Both now come from metrics.json, but reconciling the story is a content call.
- `AUDIT-CLAUDE.md` (2026-07-02 audit) P1/P2 backlog — remaining: metadata/OG
  consistency, loader unification, accessibility follow-ups (focus trap).
- nav.js footer/header link lists have drifted (footer lacks Research Papers,
  WorldHermes, etc.); consider single source of truth for both fragments.
- `nav.js` `footerFragment()` is exported but pages carry static footer markup —
  dead path worth unifying one way or the other.
