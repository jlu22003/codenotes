import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // ... Add Nextra-specific options here
  search: { codeblocks: false },

});

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here

  turbopack: {
    resolveAlias: {
      // Path to your `mdx-components` file with extension
      "next-mdx-import-source-file": "./src/app/mdx-components.js",
    },
  },
});
