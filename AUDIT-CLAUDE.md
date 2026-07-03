# AUDIT-CLAUDE.md — Digital Nation Site Audit
Date: 2026-07-02
Auditor: Claude Code analysis, transcribed by President Hermes

## P0 — Action Required
- **P0-1** Dashboard not wired: `dashboard.js` has Assembly/Court feed sections, but `loadDashboardScript` is missing, so the dashboard may fail to initialize those sections.
- **P0-2** Shared script tags missing: several Foundations pages do not load the shared JS the rest of the site expects (nav/accessibility/enhancements).
- **P0-3** Same as P0-2: missing module includes create unreachable code paths on affected pages.
- **P0-4** Science/research/technology cluster is broken: JSON files were migrated to v3.0 structure, but `science.html` only partially updated, and `research.html` still carries old "Technology & Innovation" identity; new `stats`/`pillars` are not rendered by any JS.
- **P0-5** Dropdown accessibility regression: site nav `aria-hidden` pattern misapplied to visible elements.

## P1 — Near-Term
- **P1-1** `government-structure-map.html` is unused/orphaned after `structure.html` replaced it; remove or redirect.
- **P1-2** Content inconsistencies: mixed terminology between governance, diplomacy, and policy clusters; some pages still use legacy government model wording.
- **P1-3** Metadata gaps: some topic pages lack canonical links or OG/Twitter metadata consistency.
- **P1-4** Metrics single-source: member counter and system status values should be loaded from one shared source, not duplicated across pages.

## P2 — Polish
- **P2-1** Loader unification: consolidate page-specific script loaders (`dashboard.js`, `structure-map.js`, etc.) into a shared loader pattern.
- **P2-2** Dashboard dedupe: duplicate readiness bindings on some pages; consolidate into shared utilities.
- **P2-3** Dropdown keyboard handling bug from prior accessibility pass; nested listener leaves keyboard state inconsistent.
- **P2-4** Accessibility follow-ups: focus trap/inert for mobile nav, skip link visibility, deduplicate escapeHtml.
- **P2-5** `aria-hidden-on-visible-elements` pattern cleanup tied to P0-5.
- **P2-6** Dead module references and dangling CSS blocks in legacy page scripts.
- **P2-7** Normalize inline scripts and modal focus management.
- **P2-8** 404 paths and OG image consistency across all pages.
- **P2-9** Sitemap/feed alignment after cluster expansion.

## Suggested Fix Order
1. P0-1/P0-2/P0-3 (one small PR: add missing script tags, add the dashboard loader) — restores nav + dashboard everywhere.
2. P0-4 (finish or park the v3.0 migration before it lands broken).
3. P0-5 + P2-5 + P2-3 together (one nav-accessibility pass in `site.js` + markup).
4. P1 items (links, orphans, secret docs, titles, metrics single-source).
5. P2 consolidation (loader unification, dashboard dedupe, 404 paths, OG image, sitemap/feed).
