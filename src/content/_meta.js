const meta = {
  portfolio: {
    title: "Portfolio",
    type: "page",
  },
  projects: {
    title: "Projects",
    type: "page",
    // Without this, Nextra auto-derives the link from the first visible
    // child in projects/_meta.js — since the real index.mdx is itself
    // hidden from the sidebar listing, that was always some individual
    // project page, never the actual "All Projects" index.
    href: "/projects",
  },
  gallery: {
    display: "hidden",
    // Hidden from the sidebar, but Nextra's prev/next pagination walks the
    // full page tree regardless of display:hidden — without this, this
    // unfinished test page ("these are not my photos, just an initial
    // implementation") was leaking into the Blog post's pagination footer
    // as "Photo Album," exposing it to real visitors via a path the
    // sidebar was deliberately built to hide.
    theme: {
      pagination: false,
    },
  },
  index: {
    display: "hidden",
    theme: {
      toc: false,
      layout: "full",
      sidebar: false,
      breadcrumb: false,
      pagination: false,
    },
  },
  blog: {
    title: "Blog",
    type: "page",
  },
};

export default meta;
