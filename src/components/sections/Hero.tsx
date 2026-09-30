"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import ParticleSphere from "@/components/sections/ParticleSphere";
import { STATUS_LINE_HEIGHT_PX } from "@/components/ui/StatusLine";

export default function Hero() {
  return (
    <section
      className="relative flex items-end bg-background"
      style={{
        // No breadcrumb term here: --nextra-breadcrumb-height isn't a real
        // Nextra CSS variable (confirmed absent from the installed package),
        // and the homepage explicitly disables breadcrumb anyway — subtracting
        // it was silently shrinking Hero by a phantom 48px on every load.
        height: `calc(100dvh - var(--nextra-navbar-height, 64px) - ${STATUS_LINE_HEIGHT_PX}px)`,
        // Floor so short viewports (landscape phones) can't shrink the
        // section below what the heading/subtitle/buttons actually need —
        // the section scrolls a little instead of the content overrunning it.
        minHeight: "480px",
      }}
    >
      {/* Background */}
      <div
        id="particle-sphere-background"
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <ParticleSphere />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-8 pb-20 md:pb-32">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl mb-4 leading-tight whitespace-nowrap">
            Justin K. Lu
          </h1>

          <p className="text-xl sm:text-2xl md:text-4xl text-muted-foreground mb-8">
            Software Engineer — Frontend &amp; Production Support
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="min-h-12 px-8 text-lg"
            >
              <Link href="/projects/wip">View Work</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 px-8 text-lg"
              aria-label="Contact Me"
            >
              <Link href="#contact-me">Contact Me</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}