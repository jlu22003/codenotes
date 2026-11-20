// Builds the Pagefind index from the Next.js output, leaving out the
// unfinished pages hidden in `_meta.js` so search never surfaces them.
import fs from 'node:fs'
import path from 'node:path'
import * as pagefind from 'pagefind'
import { hiddenRoutes } from './hidden-routes.mjs'

const SITE = path.join(import.meta.dirname, '../.next/server/app')
const OUTPUT = path.join(import.meta.dirname, '../public/_pagefind')

const hidden = new Set(await hiddenRoutes())
const { index } = await pagefind.createIndex()
let indexed = 0
for (const file of fs.readdirSync(SITE, { recursive: true })) {
  if (!file.endsWith('.html')) continue
  const route = '/' + file.replace(/\.html$/, '').replace(/(^|\/)index$/, '').split(path.sep).join('/')
  if (hidden.has(route) || route === '/_not-found') continue
  const { errors } = await index.addHTMLFile({ url: route, content: fs.readFileSync(path.join(SITE, file), 'utf8') })
  if (errors.length) throw new Error(`${route}: ${errors.join(', ')}`)
  indexed++
}
fs.rmSync(OUTPUT, { recursive: true, force: true })
const { errors } = await index.writeFiles({ outputPath: OUTPUT })
if (errors.length) throw new Error(errors.join(', '))
console.log(`Pagefind: indexed ${indexed} pages, skipped hidden ${[...hidden].join(', ')}`)
await pagefind.close()
