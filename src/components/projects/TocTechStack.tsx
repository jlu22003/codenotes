"use client";

import { usePathname } from "next/navigation";
import { projects } from "@/components/projects/Projects-Data";
import TechChipList from "@/components/ui/TechChipList";

// Tech stack chips and planned updates for the current project page, shown
// under the "On This Page" TOC sidebar. Renders nothing on non-project pages.
export default function TocTechStack() {
  const pathname = usePathname();
  const project = projects.find((p) => p.url === pathname);
  if (!project) return null;

  const { tech, plannedUpdates } = project;

  return (
    <div className="flex flex-col gap-6">
      <TechChipList items={tech} className="mb-0 max-w-none" />
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
