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

      {/* Feathered scrim behind the text block — a radial fade of the
          page background, not a literal blur: backdrop-filter doesn't
          composite against the particle sphere's WebGL canvas (confirmed —
          even a 40px blur produced zero visible change), so this reaches
          the same practical goal — the particle field recedes behind the
          text instead of competing with it — through a soft gradient
          fade instead, feathered via the gradient's own falloff rather
          than a hard-edged box. */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 25% 78%, var(--background) 0%, color-mix(in oklab, var(--background) 60%, transparent) 45%, transparent 75%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-8 pb-20 md:pb-32">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl mb-4 leading-tight whitespace-nowrap text-foreground">
            Justin K. Lu
          </h1>

          <p className="text-xl sm:text-2xl md:text-4xl text-muted-foreground mb-8">
            Software Engineer — Frontend &amp; Production Support
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              // Default primary hover (bg-primary/90) only nudges opacity
              // 10% — barely perceptible as a state change. Scoped here
              // rather than in the shared Button component since this is
              // the one primary CTA sitting directly over the busiest part
              // of the particle-sphere background, where a subtle shift is
              // hardest to notice.
              className="min-h-12 px-8 text-lg hover:bg-primary/75"
            >
              <Link href="#projects">View Work</Link>
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