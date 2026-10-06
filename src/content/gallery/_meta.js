const meta = {
  // Nextra's prev/next pagination walks the full page tree regardless of
  // the parent folder's display:hidden (confirmed in normalize-pages.js —
  // a hidden folder's children still get pushed into the flat list used
  // for pagination). The child itself needs display:hidden too.
  test: {
    display: 'hidden'
  },
}

export default meta;
