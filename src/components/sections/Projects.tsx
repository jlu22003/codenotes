"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ProjectImage from "@/components/projects/ProjectImage";

import { projects, Project } from "@/components/projects/Projects-Data";

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
            {projects.map((item: Project, index: number) => (
              <CarouselItem
                key={item.id}
                className="pl-4 md:max-w-[452px]"
                aria-label={`${index + 1} of ${projects.length}`}
              >
                <Link href={item.url} className="group flex flex-col h-full" aria-label={`View project: ${item.title}`}>
                  <ProjectImage
                    project={item}
                    sizes="(min-width: 768px) 452px, 100vw"
                    priority={index === 0}
                    interactive
                    className="aspect-3/2"
                  />

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
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Projects;
export { Projects };
