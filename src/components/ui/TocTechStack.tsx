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

// Route -> short status list, rendered under the tech stack in the same
// right-side TOC column instead of taking up body space.
const PROJECT_PLANNED_UPDATES: Record<string, string[]> = {
  "/projects/personalportfolio": [
    "Portfolio Page Updates",
    "Contact Section Updates",
  ],
};

export default function TocTechStack() {
  const pathname = usePathname();
  const tags = PROJECT_TECH_STACK[pathname];
  const plannedUpdates = PROJECT_PLANNED_UPDATES[pathname];

  if (!tags && !plannedUpdates) return null;

  return (
    <div className="flex flex-col gap-6">
      {tags && (
        <div className="flex flex-wrap justify-start gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {plannedUpdates && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Planned Updates
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {plannedUpdates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
