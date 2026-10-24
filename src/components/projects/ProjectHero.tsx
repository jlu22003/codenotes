// components/projects/ProjectHero.tsx
// The project's screenshot at the top of its write-up page, using the same
// treatment as its homepage carousel card.
import { projects } from "@/components/projects/Projects-Data";
import ProjectImage from "@/components/projects/ProjectImage";

export default function ProjectHero({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id);
  if (!project) return null;

  return (
    <ProjectImage
      project={project}
      sizes="(min-width: 768px) 75ch, 100vw"
      priority
      className="mb-8 aspect-16/9 max-w-[75ch]"
    />
  );
}
