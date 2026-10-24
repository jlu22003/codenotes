// components/projects/ProjectImage.tsx
// Shared screenshot treatment for a project: picks the dark-mode variant
// when there is one, and marks the shared placeholder as "Screenshot
// pending" so it can't pass for a real screenshot.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "nextra-theme-docs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type Project, PLACEHOLDER_IMAGE } from "@/components/projects/Projects-Data";

interface ProjectImageProps {
  project: Project;
  sizes: string;
  priority?: boolean;
  // Hover response for cards inside a `group` link: zoom, plus a color
  // reveal on real screenshots or an opacity lift on the placeholder.
  interactive?: boolean;
  className?: string;
}

export default function ProjectImage({
  project,
  sizes,
  priority,
  interactive,
  className,
}: ProjectImageProps) {
  const { resolvedTheme } = useTheme();
  // Server doesn't know the visitor's theme preference, so the first
  // client render must match the server's (light) output — only swap to
  // the dark-mode screenshot after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isPlaceholder = project.image === PLACEHOLDER_IMAGE;
  const useDark = mounted && resolvedTheme === "dark" && project.imageDark;
  const src = useDark ? project.imageDark! : project.image;

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div
        className={cn(
          "relative h-full w-full",
          interactive && "transition-all duration-300 group-hover:scale-105",
          // Placeholder art recedes rather than competing with real
          // screenshots; real screenshots stay grayscale at rest on cards to
          // match the achromatic palette, revealing color on hover.
          isPlaceholder && "opacity-60 grayscale",
          isPlaceholder && interactive && "group-hover:opacity-80",
          !isPlaceholder && interactive && "grayscale group-hover:grayscale-0"
        )}
      >
        <Image
          src={src}
          alt={isPlaceholder ? `${project.title} (screenshot pending)` : project.title}
          fill
          sizes={sizes}
          className="h-full w-full object-cover object-center"
          priority={priority}
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
