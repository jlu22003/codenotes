"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

// Route -> tech stack tags shown under the "On This Page" TOC sidebar.
// Renders nothing on routes not listed here (i.e. every non-project page).
const PROJECT_TECH_STACK: Record<string, string[]> = {
  "/projects/laylocafe": [
    "Shopify",
    "Liquid",
    "21st.dev MCP",
    "Higgsfield MCP",
    "Impeccable",
  ],
  "/projects/equaljusticestudios": ["WordPress"],
  "/projects/boycott1902": ["WordPress"],
  "/projects/personalportfolio": [
    "Next.js",
    "React",
    "Tailwind CSS",
    "JavaScript",
    "HTML5",
    "CSS3",
  ],
  "/projects/maskimumcarnage": ["Unity", "C#"],
  "/projects/tictactoe": ["C"],
};

export default function TocTechStack() {
  const pathname = usePathname();
  const tags = PROJECT_TECH_STACK[pathname];
  if (!tags) return null;

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="font-mono">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
