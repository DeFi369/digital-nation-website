# THE PRINCIPALITY OF AETHERIA — Public Website

A digital micronation experience built around transparent governance, cryptographic citizenship, and open protocol infrastructure.

Branding:
- Nation: THE PRINCIPALITY OF AETHERIA
- Motto: SOVEREIGN BY CODE

## Pages

- `index.html` — Hero vision, national identity, metrics, and entry points
- `about.html` — Governance, leadership, founding history, protocol/state model
- `goals.html` — Milestones using UN Montevideo criteria and Digital Nation specifics
- `initiatives.html` — Initiative portfolio and future roadmap
- `join.html` — Citizen onboarding and contribution paths
- `citizenship.html` — Passport framework, rights, duties, onboarding flow
- `recognition.html` — UN membership, Montevideo criteria, observer-state pathways, passport diplomacy
- `manifesto.html` — Modern sovereignty declaration
- `charter.html` — Transparent founding charter
- `contact.html` — Front office contacts
- `consular.html` — Embassies, consular support, recognition agreements
- `economy.html` — Self-sustaining citizen economy and settlement layer
- `symbols.html` — Flag concept, anthem direction, national ceremonial protocol
- `passport.html` — Living citizen credential, diplomatic access, verification
- `tools.html` — Interactive helpers for prospective citizens
- `faq.html` — Frequently asked questions
- `timeline.html` — Evolution from genesis protocols to open network era
- `dashboard.html` — Public participation metrics and network indicators
- `terms.html` — Terms of participation and acceptable use
- `privacy.html` — Privacy policy for citizen data and governance records
- `404.html` — Page-not-found experience with navigation shortcuts

## Shared Structure

- Shared stylesheet: `assets/css/main.css`
- Shared script: `assets/js/main.js`
- Shared logo: `assets/images/digital-nation-logo.svg`
- Canonical base URL: `https://defi369.github.io/digital-nation-website/`

## Stack

Static HTML/CSS/JS. No build step. No required frameworks beyond Inter from Google Fonts.

## Local Preview

Serve from the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Live Site

Public Pages deployment: https://defi369.github.io/digital-nation-website/

## Deployment Notes

- The repository is a plain static site. Push the root HTML files, `assets/`, `sitemap.xml`, and `robots.txt`.
- `sitemap.xml` and `robots.txt` are both present and use the canonical GitHub Pages base URL.
- `404.html` includes the standard site chrome so lost visitors can navigate back into the site.
- Legal notices use the `legal-block` pattern for consistency across content and policy pages.

## Government Structure

AETHERIA is organized as a layered digital republic with six distinct layers:

1. **Constitutional Core** — The President (single executive authority), Vice President, and Constitutional Council (7 members, staggered 4-year terms) set national strategy, interpret the charter, and safeguard constitutional compliance.
2. **Strategic Cabinet** — Seven department secretaries (External Affairs, Digital Economy, Civic Identity, Public Affairs, Technology & Innovation, Infrastructure & Human Services, Justice & Constitutional Compliance) report to the President and set national policy.
3. **Operational Offices** — Six specialized arms (Digital Operations, Data Governance, Open Records, Situational Awareness, Treasury & Resource Management, Community Stewardship) handle cross-cutting operational functions.
4. **Service Branches** — The Digital Service Corps (operational workforce) and Electoral Commission (elections and apportionment) deliver civic and operational services.
5. **Assembly of the Digital Nation** — A unicameral legislature that confirms appointments, approves charter amendments, passes resolutions, and holds hearings.
6. **Charter Tribunal** — The final arbiter of charter disputes and constitutional questions, with binding rulings across all departments and offices.

Public-facing content and design decisions are directed through protocol governance under the President's office and the Assembly.
