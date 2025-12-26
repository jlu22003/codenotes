"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import { projects, Project } from "./Projects-Data";

interface ProjectsProps {
  heading?: string;
  demoUrl?: string;
  className?: string;
}

const Projects = ({
  heading = "Projects",
  demoUrl = "/projects/wip",
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

    return () => carouselApi.off("select", updateSelection);
  }, [carouselApi]);

  if (!projects || projects.length === 0) return null;

  return (
    <section className={cn("py-32", className)}>
      {/* Header */}
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mb-16 flex flex-col justify-between md:flex-row md:items-end">
          <div>
            <h2 className="mb-4 text-3xl md:text-4xl font-semibold text-foreground">
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
              size="icon"
              variant="outline"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
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
          className="relative"
        >
          <CarouselContent className="hide-scrollbar md:-ml-4">
            {projects.map((item: Project) => (
              <CarouselItem key={item.id} className="pl-4 md:max-w-[452px]">
                <Link href={item.url} className="group flex flex-col h-full">
                  {/* Image Card */}
                  <div className="aspect-3/2 overflow-hidden rounded-xl">
                    <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="pt-4">
                    <h3 className="mb-2 text-lg md:text-xl font-medium text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mb-6 text-sm md:text-base text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="inline-flex items-center text-sm font-medium">
                      {/* ✅ Changed from <Link> to plain text - entire card is already clickable */}
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
