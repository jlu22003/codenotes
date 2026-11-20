import type { MetadataRoute } from 'next'
import { getPageMap } from 'nextra/page-map'
import type { PageMapItem } from 'nextra'
import { SITE_URL } from '@/lib/site'

// Published pages only. A page or folder with `display: 'hidden'` in its
// _meta.js (the gallery test page, thin project stubs) is left out. `index`
// entries are the exception: the home page and /blog are hidden only to keep
// them out of the sidebar, not unpublished.
function publishedRoutes(items: PageMapItem[]): string[] {
  const meta = items.find((item) => 'data' in item)?.data ?? {}
  return items.flatMap((item) => {
    if (!('name' in item)) return []
    const entry = meta[item.name]
    const hidden = typeof entry === 'object' && entry.display === 'hidden'
    if ('children' in item) return hidden ? [] : publishedRoutes(item.children)
    return hidden && item.name !== 'index' ? [] : [item.route]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = publishedRoutes(await getPageMap())
  return routes.map((route) => ({ url: route === '/' ? SITE_URL : `${SITE_URL}${route}` }))
}
