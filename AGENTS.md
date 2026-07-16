# AGENTS.md — rules for automated agents working in this repo

Read this AND `AUDIT.md` (work log + current state) before editing anything.
Most of the corruption cleaned up on 2026-07-04 (59 damaged pages) came from
scripted bulk edits that ignored the rules below.

## Hard rules

1. **Never edit nav or footer markup inside pages.** Every page carries an
   EMPTY `<nav class="menu" id="site-menu" aria-hidden="true"></nav>` and an
   EMPTY `<nav class="footer-nav" aria-label="Footer"></nav>`. They are filled
   at runtime by `assets/js/nav.js` from the single `NAV_GROUPS` list. To add
   or move a link anywhere in the site nav, edit `NAV_GROUPS` in nav.js —
   nothing else.

2. **No bulk regex over HTML without excluding inline `<script>` bodies.**
   Several pages (e.g. `structure.html`) embed HTML documents inside JS string
   literals. Past bulk passes matched `<head>` / `</body>` inside those strings
   and produced JS syntax errors. If you must script an edit, parse or skip
   `<script>` blocks first.

3. **Run `python3 scripts/check_integrity.py` before every commit.** It
   enforces: one header/main/footer per page, balanced `<details>/<summary>`,
   empty nav containers, valid JSON in `assets/data/`, and JS syntax (including
   inline scripts). CI runs the same check; a red build means your edit
   corrupted something.

4. **Shared metrics live in `assets/data/metrics.json` only** (member count,
   protocol version, uptime, citizen totals). Do not duplicate these values in
   per-page JSON — pages read the canonical file.

5. **Do not hard-reset the working tree or delete untracked files.** Another
   agent or human may have work in flight. Commit your own changes; never
   `git reset --hard` / `git clean` as a "sync" step.

6. **Page URLs stay flat** in the repo root. GitHub Pages has no server
   redirects; moving/renaming a page breaks inbound links. If a page must be
   retired, replace it with a meta-refresh stub (see
   `government-structure-map.html`) and update `sitemap.xml`.

7. **Menu/dropdown behavior lives in `site.js` only** (delegated listeners on
   `.menu`). Page scripts must not bind their own `setupMenu()`-style handlers
   — double-binding breaks the mobile menu.

## Layout conventions

- Body tag: `<body data-theme="foundations|governance|identity|policy|diplomacy|engagement">`
  drives per-cluster accents (`assets/css/page-theme.css`) and the ambient
  starfield (`assets/js/page-ambient.js`). Homepage uses `class="page-home"`
  + `home.css` instead.
- Page content order: `<h1>` → `<p class="lead">` → stats section → pillars
  section → topic sections.
- Fonts: Unbounded (display), IBM Plex Mono (telemetry/labels), Inter (body) —
  loaded per page via one Google Fonts URL.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
