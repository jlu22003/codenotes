// components/ui/ProjectHero.tsx
// Renders the same screenshot/placeholder treatment the homepage carousel
// uses (Projects.tsx), on the individual project write-up page itself —
// previously the real screenshots (Laylo Cafe, Boycott 1902) and the
// "Screenshot pending" placeholder badge only ever appeared on the
// carousel card, never on the page built to showcase that exact project.
// Reads from Projects-Data.ts (the same source the carousel uses) so
// there's one place that knows which projects have real screenshots.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "nextra-theme-docs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { projects, PLACEHOLDER_IMAGE } from "@/components/sections/Projects-Data";

export default function ProjectHero({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id);
  const { resolvedTheme } = useTheme();
  // Server doesn't know the visitor's theme preference, so the first
  // client render must match the server's (light) output exactly — only
  // swap to the dark variant after mount, once resolvedTheme is reliable.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!project) return null;

  const isPlaceholder = project.image === PLACEHOLDER_IMAGE;
  const useDark = mounted && resolvedTheme === "dark" && project.imageDark;
  const src = useDark ? project.imageDark! : project.image;

  return (
    <div className="relative mb-8 aspect-16/9 max-w-[75ch] overflow-hidden rounded-xl">
      <div
        className={cn(
          "relative h-full w-full",
          isPlaceholder && "opacity-60 grayscale"
        )}
      >
        <Image
          src={src}
          alt={isPlaceholder ? `${project.title} (screenshot pending)` : project.title}
          fill
          sizes="(min-width: 768px) 75ch, 100vw"
          className="h-full w-full object-cover object-center"
          priority
        />
      </div>
      {isPlaceholder && (
        <Badge
          variant="outline"
          className="absolute bottom-2 left-2 font-mono bg-background/90"
        >
          Screenshot pending
        </Badge>
      )}
    </div>
  );
}
