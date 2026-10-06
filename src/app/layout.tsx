import './globals.css'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { Montserrat, Roboto, JetBrains_Mono } from 'next/font/google'
import AccessibilityPatches from '@/components/ui/AcessibilityPatches';
import StatusLine from '@/components/ui/StatusLine';
import TocTechStack from '@/components/ui/TocTechStack';

// Configure Montserrat for headings
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
  preload: true,
})

// Configure Roboto for body text
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
  preload: true,
})

// Configure JetBrains Mono for technical facts: tags, dates, metrics, code
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  adjustFontFallback: true,
  preload: true,
})

export const metadata = {
  // Define your metadata here
  title: "Justin Lu Portfolio",
  description: "Frontend developer portfolio showcasing projects, skills, and contact information.",
  openGraph: {
    title: "Justin Lu Portfolio",
    description: "Frontend developer portfolio showcasing projects, skills, and contact information.",
    url: "https://justinklu.com",
    siteName: "Justin Lu Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Justin Lu Portfolio",
    description: "Frontend developer portfolio showcasing projects, skills, and contact information.",
  },
}

const navbar = (
  <>
    <Navbar
      logo={<b>J.</b>}
    projectLink='https://github.com/jlu22003'
    projectIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16" aria-label="GitHub repository" role="img">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>}
    chatLink='https://www.linkedin.com/in/justin-lu-jkl/'
    chatIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16" aria-label="LinkedIn profile" role="img">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    </svg>}
    />
    <StatusLine />
  </>
)

const search = <Search placeholder='Search...'></Search>

const footer = <Footer>© {new Date().getFullYear()} Justin Lu.</Footer>

export default async function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${montserrat.variable} ${roboto.variable} ${jetbrainsMono.variable}`}
    >
      <Head
        color={{
          // DESIGN.md names Highlighter Cream (the accent role), not the
          // achromatic primary, as the color for Nextra's own docs chrome —
          // "sidebar active item, TOC active section, search highlight."
          // Nextra doesn't just paint this hue flat: it generates an entire
          // primary-50..primary-950 TINT SCALE from these three values via
          // calc(lightness ± offset), used for both text (darker tints)
          // and background fills (lighter tints). An earlier attempt set
          // light-mode lightness to 87% — matching the accent's own
          // background-surface lightness directly — which works for a
          // flat fill but breaks the tint scale: every lighter tint
          // (primary-50/100/200/400, used for background fills like the
          // sidebar active-item pill) overflowed past 100% and clamped to
          // pure white, while the text tints rendered as unreadably pale
          // cream — measured 1.14-1.47:1 contrast in multiple places
          // (sidebar active item, TOC active links, MDX body prose links),
          // all catastrophic WCAG failures. Fixed by using the accent-
          // foreground token's hue/saturation (oklch(0.4015 0.0436
          // 37.9587), the color DESIGN.md actually specifies for text-on-
          // accent) at a mid-range lightness close to Nextra's own built-
          // in default (its schema default is 45% light / 55% dark) so
          // the generated scale stays within 0-100% at every tint and
          // produces a readable text color plus a genuinely tinted (not
          // clamped-white) background fill. Verified: text-primary-800 on
          // bg-primary-100 (sidebar active item) = 7.26:1; text-primary-
          // 600 on page background (TOC links, prose links) = 4.84:1.
          // Dark mode is untouched — its achromatic value (hue:0, sat:0)
          // was independently confirmed working correctly in both
          // contrast and rendering by three separate review passes.
          hue: { light: 14, dark: 0 },
          saturation: { light: 26, dark: 0 },
          lightness: { light: 45, dark: 88 }
        }}
        backgroundColor={{
          // A separate prop from `color` above — drives Nextra's own
          // --nextra-bg variable, used by the sidebar footer (theme
          // switcher + collapse-sidebar icon), the theme-switcher dropdown
          // panel, and the search results panel. Left unset, it defaults
          // to Nextra's stock rgb(250,250,250)/rgb(17,17,17) — close
          // enough to the real --background token in light mode to be
          // invisible, but badly mismatched in dark mode (real dark
          // --background is rgb(43,43,43), not rgb(17,17,17)), producing
          // a visibly contrasting box behind those controls.
          light: "rgb(249,249,249)",
          dark: "rgb(43,43,43)",
        }}
      />
      {/* Your additional tags should be passed as `children` of `<Head>` element */}

      <body>
        <AccessibilityPatches />
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/jlu22003/codenotes/tree/main"
          footer={footer}
          search={search}
          copyPageButton={false}
          editLink={false}
          feedback={{ content: false }}
          toc={{ extraContent: <TocTechStack /> }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
