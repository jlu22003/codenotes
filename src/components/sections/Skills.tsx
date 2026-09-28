// components/sections/Skills.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Card } from "@/components/ui/card";
import { skillsRowOne, skillsRowTwo } from "./Skills-data";

interface Skill {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SkillCard({ skill }: { skill: Skill }) {
  const Icon = skill.icon;
  return (
    <Card className="flex items-center gap-3 px-5 py-4 min-w-[180px] bg-card border border-border/60 shadow-sm">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{skill.label}</span>
    </Card>
  );
}

function SkillsRow({
  label,
  skills,
  direction = "left",
}: {
  label: string;
  skills: Skill[];
  direction?: "left" | "right";
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !rowRef.current) return;

    const totalWidth = rowRef.current.scrollWidth / 2; // width of one set of skills

    // Reset position depending on direction
    gsap.set(rowRef.current, {
      x: direction === "left" ? 0 : -totalWidth,
    });

    const tween = gsap.to(rowRef.current, {
      x: direction === "left" ? -totalWidth : 0,
      duration: 40,
      ease: "linear",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [direction, prefersReducedMotion]);

  return (
    <div>
      <p className="mb-3 text-sm font-mono text-muted-foreground">{label}</p>
      {prefersReducedMotion ? (
        // Static, fully-visible fallback — the marquee would otherwise clip
        // most of this row's content for users who asked for less motion.
        <div className="flex flex-wrap gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.label} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden">
          <div ref={rowRef} className="flex gap-4 w-max">
            {/* Duplicate the skill set twice for seamless looping */}
            {[...skills, ...skills].map((skill, index) => (
              <SkillCard key={`${skill.label}-${index}`} skill={skill} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Skills() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Skills
          </h2>
          <p className="text-lg text-muted-foreground">
            A toolkit split the same way the work is: building things, and
            keeping them running.
          </p>
        </div>

        {/* Marquee Rows */}
        <div className="space-y-8">
          <SkillsRow label="Build" skills={skillsRowOne} direction="left" />
          <SkillsRow label="Operate & Support" skills={skillsRowTwo} direction="right" />
        </div>
      </div>
    </section>
  );
}
