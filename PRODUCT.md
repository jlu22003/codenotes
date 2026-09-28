# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two confirmed audiences, evaluated together rather than sequentially:

- **Hiring managers and recruiters** assessing Justin Lu for full-time software engineering roles.
- **Freelance/contract clients** evaluating him for project-based work (the kind already represented by Laylo Cafe, Equal Justice Studios, and Boycott 1902).

Both audiences arrive to answer the same underlying question in a short visit: can this person actually build and run real software.

## Product Purpose
A personal portfolio site whose job is to get Justin hired — either into a full-time engineering role or for contract/freelance project work — by demonstrating real engineering capability, not by claiming it.

## Positioning
Most engineering portfolios show only what was shipped. This one also shows the half of the work most portfolios omit entirely: production support — incident response, monitoring, root-cause analysis, SLA discipline — alongside frontend build work. The dual identity (builds things, and keeps things running) is the site's actual differentiator, not a visual style.

## Operating Context
- Built with Next.js 15 + Nextra 4 (content-driven via MDX) + Tailwind CSS v4, deployed as a live, continuously-iterated site — not a one-time build.
- The site is itself one of the projects it showcases: its own architecture (App Router, component structure) is referenced as evidence of engineering practice on the Personal Portfolio project page.
- Content lives in `src/content/` (portfolio bio, project write-ups, blog) and is edited directly as new work happens — this is an active, evolving document, not a finished artifact.

## Capabilities and Constraints
- Real project write-ups exist for: Laylo Cafe Website, Equal Justice Studios, Boycott 1902, Personal Portfolio, Maskimum Carnage (Global Game Jam 2026), and Tic-Tac-Toe (bitmask C engine). Each follows a fixed Context → Implementation → Impact structure.
- Two additional real projects (Secure Chat App, Raspberry Pi video/object-detection) exist only as thin stubs and are intentionally hidden from navigation until they have real substance — never present a stub as a finished project.
- **Hard constraint, non-negotiable: never fabricate projects, experience, metrics, technical claims, screenshots, or outcomes.** Every claim on the site must trace back to the résumé, real shipped work, or explicitly-marked in-progress status (see the Work In Progress page).
- Contact form is functional (Resend-backed API route), not a placeholder.
- Site-wide search (Pagefind) is real and already live.

## Brand Commitments
- Name: Justin K. Lu / Justin Lu. Logo mark: "J."
- Voice: restrained and technical, deliberately avoiding generic portfolio language ("passionate developer," adjective-only claims). Prefers structured facts and real numbers over prose claims wherever the underlying evidence supports it.
- Visual system: neutral OKLCH palette with a single warm-brown accent color, reserved for interactive elements only (never decorative). Montserrat (headings) / Roboto (body) / JetBrains Mono (technical facts — tags, dates, stats, code) as the type system.
- Animation philosophy: motion is feedback, not decoration, with one deliberate exception (the hero's WebGL particle sphere, an intentional ambient signature) — everything else respects `prefers-reduced-motion`.

## Evidence on Hand
- Full résumé (real work history: CDI Credit, Insight Global; real stats — 200+ incidents resolved, 99% SLA, 5,000+ users, 30+ runbooks authored).
- Real live client sites: laylocafe.com, equaljusticestudios.com, boycott1902.com.
- Real personal/game-jam projects: Tic-Tac-Toe bitmask engine, Maskimum Carnage (Global Game Jam 2026, Unity/C#).
- GitHub (github.com/jlu22003) and LinkedIn (linkedin.com/in/justin-lu-jkl) profiles.
- **Explicit absence, do not fabricate to fill it:** no real screenshots exist yet for any project card — all six currently share one placeholder image. This is a known, tracked gap, not an oversight to paper over.

## Product Principles
1. Never fabricate — every claim on the site traces to the résumé or real, verifiable work.
2. Show both halves of the identity — building and running — on every major surface, not just one buried section.
3. Restraint over decoration — a visual or motion element earns its place only by carrying information.
4. Structured fact over prose adjective, wherever real evidence supports it (numbers, named technologies, concrete outcomes).
5. Iterate incrementally — refine the existing site as a living product; never blanket-redesign what's already working.
