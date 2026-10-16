# CodeNotes: Justin Lu's Portfolio

The source for **[justinklu.com](https://www.justinklu.com/)**, the portfolio and blog of Justin K. Lu, a software engineer working across frontend development and production support.

Most engineering portfolios show only what was shipped. This one also shows the other half of the job: incident response, monitoring, root-cause analysis and SLA discipline, alongside the build work. The site is itself one of the projects it presents.

## Highlights

- **Content-driven.** Every page, project write-up and blog post is MDX under [`src/content/`](src/content), rendered through Nextra 4 on the Next.js 15 App Router. Adding a project means adding a file and an entry in `_meta.js`.
- **Real project write-ups.** Client sites (Laylo Cafe, Equal Justice Studios, Boycott 1902), a Global Game Jam 2026 entry (Maskimum Carnage) and personal projects, each structured as Context → Implementation → Impact.
- **WebGL hero.** A Three.js particle sphere that follows the cursor and reacts to scroll speed. It recolours with the theme, renders a single still frame for `prefers-reduced-motion`, and is skipped entirely on devices without WebGL.
- **Site-wide search.** [Pagefind](https://pagefind.app/) indexes the built pages, and search runs fully client-side.
- **Working contact form.** Client-side validation, plus an API route that validates again on the server and sends the email through [Resend](https://resend.com/).
- **Accessibility as a feature.** It respects reduced motion, the skills marquee pauses on hover and keyboard focus, the mobile menu closes on Escape, and form errors are announced to screen readers.
- **One design system.** Neutral OKLCH palette with one warm accent reserved for interactive elements; Montserrat, Arial and JetBrains Mono. See [`DESIGN.md`](DESIGN.md).

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack), React 19, Nextra 4 (docs theme) |
| Language | TypeScript, MDX |
| Styling | Tailwind CSS v4, shadcn/ui on Radix UI, OKLCH design tokens |
| Motion & 3D | GSAP, Three.js |
| UI pieces | Embla Carousel, Lucide icons, react-photo-album |
| Search | Pagefind (indexed at build time) |
| Email | Resend |

## Getting started

**Prerequisites:** Node.js 20 or newer, and npm.

```bash
git clone https://github.com/jlu22003/codenotes.git
cd codenotes
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Search doesn't work under `npm run dev`, because the index is only built by `npm run build`. Use a production build (below) to try it.

### Environment variables

Only the contact form needs configuration. Create `.env.local` in the project root:

```bash
RESEND_API_KEY=re_xxxxxxxx
```

Without a key, the rest of the site works, but sending the contact form fails with an error. The sender and recipient addresses are set in [`src/app/api/contact/route.ts`](src/app/api/contact/route.ts).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build, then `postbuild` runs Pagefind to write the search index to `public/_pagefind/` |
| `npm run start` | Serves the production build (run `npm run build` first) |
| `npm run lint` | ESLint |

`public/_pagefind/` is generated output and is gitignored. Every build recreates it.

## Project structure

```
src/
├── app/
│   ├── [[...mdxPath]]/page.jsx   # renders every MDX page through Nextra
│   ├── api/contact/route.ts      # contact form endpoint (validation + Resend)
│   ├── layout.tsx                # Nextra layout, navbar, footer, fonts, theme colours
│   └── globals.css               # Tailwind v4 + OKLCH design tokens
├── components/
│   ├── sections/                 # home page sections: Hero, ParticleSphere, Projects,
│   │                             # Focus, Skills, LatestBlog, Contact, ResumeDownloadButton
│   └── ui/                       # shadcn/ui primitives and small site components
└── content/                      # all pages, as MDX
    ├── _meta.js                  # top-level navigation
    ├── index.mdx                 # home page
    ├── portfolio/                # about, experience, skills, education
    ├── projects/                 # one MDX file per project (+ _meta.js for order/visibility)
    └── blog/
public/
├── 2025Resume.pdf                # served by the floating "Resume" button
└── images/projects/              # project screenshots
```

### Adding content

- **A project or post:** add an `.mdx` file to `src/content/projects/` or `src/content/blog/`, then list it in that folder's `_meta.js`. The order in `_meta.js` is the sidebar and pagination order.
- **A home page project card:** add an entry to [`src/components/sections/Projects-Data.ts`](src/components/sections/Projects-Data.ts).
- **A hidden page:** set `display: 'hidden'` in `_meta.js` to keep it routable but out of the navigation (as with unfinished project stubs).
- **The Latest Writing card** picks the blog post with the newest front-matter `date`, and shows its `_meta.js` title.

## Deployment

The live site is deployed on [Vercel](https://vercel.com/). Pushing to `main` deploys to production.

- **Build command:** `npm run build`. This also runs `postbuild`, which generates the search index; without it, search returns no results.
- **Environment variable:** set `RESEND_API_KEY` in the Vercel project settings for the contact form.

Any other host that runs `npm run build` and serves Next.js works the same way.

## Further reading

- [`PRODUCT.md`](PRODUCT.md): audience, positioning and content principles
- [`DESIGN.md`](DESIGN.md): design tokens, typography and component rules
- [Portfolio in Nextra](https://www.justinklu.com/blog/nextraPortfolio): why the site is built on a documentation framework

## Contact

[justinklu.com](https://www.justinklu.com/) · [GitHub](https://github.com/jlu22003) · [LinkedIn](https://www.linkedin.com/in/justin-lu-jkl/)
