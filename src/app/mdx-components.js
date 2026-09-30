import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs' // nextra-theme-blog or your custom theme

// Get the default MDX components
const themeComponents = getThemeComponents()

// Nextra's <article> has no measure of its own — it just fills whatever
// space the sidebar/TOC layout leaves it. Cap markdown-sourced paragraphs
// at a comfortable reading width; this only touches real prose (project
// write-ups), never the homepage's hardcoded full-width section components.
function P(props) {
  return <p {...props} className={["max-w-[75ch]", props.className].filter(Boolean).join(" ")} />
}

// Merge components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    p: P,
    ...components
  }
}