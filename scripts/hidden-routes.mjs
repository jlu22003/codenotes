// Routes hidden in Nextra `_meta.js` because they are unfinished (see PRODUCT.md):
// every `display: 'hidden'` page except a section's `index`, which is that
// section's landing page and only hidden from its own sidebar.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const CONTENT_DIR = path.join(import.meta.dirname, '../src/content')

async function meta(dir) {
  const file = path.join(dir, '_meta.js')
  return fs.existsSync(file) ? (await import(pathToFileURL(file).href)).default : {}
}

export async function hiddenRoutes() {
  const root = await meta(CONTENT_DIR)
  const hidden = []
  for (const entry of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const section = entry.name
    const sectionMeta = await meta(path.join(CONTENT_DIR, section))
    const sectionHidden = root[section]?.display === 'hidden'
    for (const file of fs.readdirSync(path.join(CONTENT_DIR, section))) {
      if (!file.endsWith('.mdx')) continue
      const name = file.replace(/\.mdx$/, '')
      if (name === 'index' && !sectionHidden) continue
      if (sectionHidden || sectionMeta[name]?.display === 'hidden') {
        hidden.push(name === 'index' ? `/${section}` : `/${section}/${name}`)
      }
    }
  }
  return hidden
}
