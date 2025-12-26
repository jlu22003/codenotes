"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative flex items-end bg-background"
      style={{
        height:
          "calc(100dvh - var(--nextra-navbar-height, 64px) - var(--nextra-breadcrumb-height, 48px))",
      }}
    >
      {/* Background */}
      <div
        id="unicorn-background"
        className="absolute inset-0 z-0"
        aria-label="Interactive background animation placeholder"
      >
        <div className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-8 pb-20 md:pb-32">
        <div className="max-w-4xl">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-4 leading-tight whitespace-nowrap">
            Justin K. Lu
          </h1>

          <p className="text-xl sm:text-2xl md:text-4xl text-muted-foreground mb-8 font-light">
            Software Engineer (Frontend)
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="text-lg px-8 py-6">
              <Link href="/projects/wip">View Work</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="#contact-me">Contact Me</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}