"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useTheme } from "nextra-theme-docs";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import { projects, Project, PLACEHOLDER_IMAGE } from "./Projects-Data";

interface ProjectsProps {
  heading?: string;
  demoUrl?: string;
  className?: string;
}

const Projects = ({
  heading = "Projects",
  demoUrl = "/projects",
  className,
}: ProjectsProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { resolvedTheme } = useTheme();
  // Server doesn't know the visitor's theme preference, so the first
  // client render must match the server's (light) output — only swap to
  // a project's dark-mode screenshot after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!carouselApi) return;

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateSelection();
    carouselApi.on("select", updateSelection);

    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className={cn("py-24", className)}>
      {/* Header */}
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mb-16 flex flex-col justify-between md:flex-row md:items-end">
          <div>
            <h2 className="mb-4 text-3xl md:text-4xl text-foreground">
              {heading}
            </h2>
            <Link
              href={demoUrl}
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              View All Projects
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 flex shrink-0 items-center gap-2 md:mt-0">
            <Button
              aria-label="Previous Projects"
              size="icon"
              variant="outline"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              aria-label="Next Projects"
              size="icon"
              variant="outline"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="container mx-auto max-w-7xl px-8">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": { dragFree: true },
            },
          }}
          plugins={[WheelGesturesPlugin()]}
          className="relative"
        >
          <CarouselContent className="hide-scrollbar md:-ml-4">
            {projects.map((item: Project, index: number) => {
              const isPlaceholder = item.image === PLACEHOLDER_IMAGE;
              const useDark = mounted && resolvedTheme === "dark" && item.imageDark;
              const imageSrc = useDark ? item.imageDark! : item.image;
              return (
              <CarouselItem
                key={item.id}
                className="pl-4 md:max-w-[452px]"
                aria-label={`${index + 1} of ${projects.length}`}
              >
                <Link href={item.url} className="group flex flex-col h-full" aria-label={`View project: ${item.title}`}>
                  {/* Image Card */}
                  <div className="relative aspect-3/2 overflow-hidden rounded-xl">
                    <div
                      className={cn(
                        "relative h-full w-full transition-all duration-300 group-hover:scale-105",
                        isPlaceholder
                          ? // Placeholder art shouldn't out-compete a real
                            // screenshot for attention — recede, don't compete.
                            // No color to reveal on hover (it's a generic
                            // gray icon), but every card should still give
                            // some visible response to match the real-photo
                            // cards' color-reveal, so opacity lifts instead.
                            "opacity-60 grayscale group-hover:opacity-80"
                          : // Real screenshots are full-color photos/art,
                            // which stand out against the site's otherwise
                            // achromatic palette. Grayscale at rest keeps
                            // them in step with the rest of the page; full
                            // color reveals on hover, alongside the zoom.
                            "grayscale group-hover:grayscale-0"
                      )}
                    >
                      <Image
                        src={imageSrc}
                        alt={isPlaceholder ? `${item.title} (screenshot pending)` : item.title}
                        fill
                        sizes="(min-width: 768px) 452px, 100vw"
                        className="h-full w-full object-cover object-center"
                        priority={index === 0}
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

                  {/* Text Content */}
                  <div className="pt-4">
                    <Badge variant="outline" className="mb-3 font-mono">
                      {item.category}
                    </Badge>
                    <h3 className="mb-2 text-lg md:text-xl text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mb-6 text-sm md:text-base text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="inline-flex items-center text-sm font-medium text-foreground">
                      <span>Read more</span>
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Projects;
export { Projects };
