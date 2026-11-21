"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";
import { STATUS_LINE_HEIGHT_PX } from "@/components/ui/StatusLine";

// Every MDX page shares one catch-all route, so a static import put Three.js
// (~200 KB gzipped) in the JS of every page. Loading it dynamically keeps it
// in its own chunk, fetched only where the hero renders. ssr: false is free
// here: the sphere draws nothing until its client-side effect runs anyway,
// and its absolutely positioned wrapper below already reserves the space, so
// the late mount causes no layout shift.
const ParticleSphere = dynamic(
  () => import("@/components/sections/ParticleSphere"),
  { ssr: false }
);

export default function Hero() {
  return (
    <section
      className="relative flex items-end bg-background"
      style={{
        // No breadcrumb term here: --nextra-breadcrumb-height isn't a real
        // Nextra CSS variable (confirmed absent from the installed package),
        // and the homepage explicitly disables breadcrumb anyway — subtracting
        // it was silently shrinking Hero by a phantom 48px on every load.
        // min-height, not height: at enlarged browser text sizes the content
        // grows the section instead of clipping. The 480px floor keeps short
        // viewports (landscape phones) from shrinking it below the content.
        minHeight: `max(480px, calc(100dvh - var(--nextra-navbar-height, 64px) - ${STATUS_LINE_HEIGHT_PX}px))`,
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
          <h1 className="text-4xl sm:text-6xl md:text-8xl mb-4 leading-tight text-foreground">
            Justin K. Lu
          </h1>

          <p className="text-xl sm:text-2xl md:text-4xl text-muted-foreground mb-8">
            Software Engineer
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              // Default primary hover (bg-primary/90) only nudges opacity
              // 10% — barely perceptible over the particle sphere. A solid
              // token (not an alpha tint, which let the background through
              // and dropped label contrast to ~3:1) keeps the label ≥4.5:1
              // in both themes while still reading as a clear state change.
              className="min-h-12 px-8 text-lg hover:bg-foreground"
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