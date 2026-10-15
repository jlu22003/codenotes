import fs from 'node:fs'
import path from 'node:path'
import rootMeta from '../src/content/_meta.js'
import blogMeta from '../src/content/blog/_meta.js'
import galleryMeta from '../src/content/gallery/_meta.js'
import portfolioMeta from '../src/content/portfolio/_meta.js'
import projectsMeta from '../src/content/projects/_meta.js'

type MetaEntry = { title?: string; display?: string }
type Meta = Record<string, MetaEntry>

const CONTENT_DIR = path.join(__dirname, '../src/content')
const metas: Record<string, Meta> = {
  blog: blogMeta,
  gallery: galleryMeta,
  portfolio: portfolioMeta,
  projects: projectsMeta,
}

export type Page = { route: string; title?: string; date?: string; hiddenFromNav: boolean }

export const pages: Page[] = fs
  .readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap(({ name: section }) =>
    fs
      .readdirSync(path.join(CONTENT_DIR, section))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const name = file.replace(/\.mdx$/, '')
        const source = fs.readFileSync(path.join(CONTENT_DIR, section, file), 'utf8')
        const entry = metas[section]?.[name] ?? {}
        return {
          route: name === 'index' ? `/${section}` : `/${section}/${name}`,
          title: entry.title ?? source.match(/^title:\s*(.+)$/m)?.[1],
          date: source.match(/^date:\s*(.+)$/m)?.[1],
          hiddenFromNav:
            entry.display === 'hidden' || (rootMeta as Meta)[section]?.display === 'hidden',
        }
      }),
  )

export const routes = ['/', ...pages.map((page) => page.route)]

export function sidebarTitles(section: string): string[] {
  return Object.values(metas[section] ?? {})
    .filter((entry) => entry.display !== 'hidden' && entry.title)
    .map((entry) => entry.title!)
}

export const latestPost = pages
  .filter((page) => page.route.startsWith('/blog/') && page.date)
  .sort((a, b) => b.date!.localeCompare(a.date!))[0]
