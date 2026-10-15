import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs' // nextra-theme-blog or your custom theme
import { LinkArrowIcon } from 'nextra/icons'

// Get the default MDX components
const themeComponents = getThemeComponents()

// Nextra's <article> has no measure of its own — it just fills whatever
// space the sidebar/TOC layout leaves it. Cap markdown-sourced paragraphs
// at a comfortable reading width; this only touches real prose (project
// write-ups), never the homepage's hardcoded full-width section components.
function P(props) {
  return <p {...props} className={["max-w-[75ch]", props.className].filter(Boolean).join(" ")} />
}

// Nextra appends its external-link arrow to string-children links without
// aria-hidden, so screen readers see an unlabelled graphic. Passing the
// children as an array stops Nextra adding its own icon; we append the same
// markup with aria-hidden instead (no visual change).
const ThemeA = themeComponents.a
function A({ href, children, ...props }) {
  if (typeof href === 'string' && /^https?:\/\//.test(href) && typeof children === 'string') {
    return (
      <ThemeA href={href} {...props}>
        {[
          children,
          '\u00a0',
          <LinkArrowIcon key="arrow" aria-hidden="true" height="1em" className="x:inline x:align-baseline x:shrink-0" />
        ]}
      </ThemeA>
    )
  }
  return <ThemeA href={href} {...props}>{children}</ThemeA>
}

// Merge components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    p: P,
    a: A,
    ...components
  }
}