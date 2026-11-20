import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../app/mdx-components'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'
import { alt, contentType, size } from '../opengraph-image'
 
export const generateStaticParams = generateStaticParamsFor('mdxPath')
 
export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  const route = `/${(params.mdxPath ?? []).join('/')}`
  // The home page leads with the name; every other page gets the layout's
  // "%s · Justin K. Lu" template. og:title doesn't go through that template,
  // so it is spelled out in full here.
  const fullTitle =
    route === '/' ? `${SITE_NAME} · ${metadata.title}` : `${metadata.title} · ${SITE_NAME}`
  return {
    ...metadata,
    title: route === '/' ? { absolute: fullTitle } : metadata.title,
    alternates: { canonical: route },
    // Replaces, rather than merges with, the layout's openGraph object, so
    // the shared fields are repeated, and it drops the file-based
    // src/app/opengraph-image.tsx too, so that is linked by hand.
    openGraph: {
      images: [{ url: '/opengraph-image', type: contentType, alt, ...size }],
      siteName: SITE_NAME,
      type: 'website',
      description: metadata.description ?? SITE_DESCRIPTION,
      title: fullTitle,
      url: route,
    },
  }
}
 
const Wrapper = getMDXComponents().wrapper
 
export default async function Page(props) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}