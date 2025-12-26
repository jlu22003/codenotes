// components/sections/Skills.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Card } from "@/components/ui/card";
import { skillsRowOne, skillsRowTwo } from "./Skills-data";

interface Skill {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SkillsRow({
  skills,
  direction = "left",
}: {
  skills: Skill[];
  direction?: "left" | "right";
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;

    const totalWidth = rowRef.current.scrollWidth / 2; // width of one set of skills

    // Reset position depending on direction
    gsap.set(rowRef.current, {
      x: direction === "left" ? 0 : -totalWidth,
    });

    gsap.to(rowRef.current, {
      x: direction === "left" ? -totalWidth : 0,
      duration: 40,
      ease: "linear",
      repeat: -1,
    });
  }, [direction]);

  return (
    <div className="overflow-hidden">
      <div
        ref={rowRef}
        className="flex gap-4 w-max"
      >
        {/* Duplicate the skill set twice for seamless looping */}
        {[...skills, ...skills].map((skill, index) => {
          const Icon = skill.icon;
          return (
            <Card
              key={`${skill.label}-${index}`}
              className="flex items-center gap-3 px-5 py-4 min-w-[180px] bg-card border border-border/60 shadow-sm"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {skill.label}
              </span>
            </Card>
          );
        })}
      </div>
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
            A focused toolkit built around modern frontend systems, performance,
            and thoughtful UI engineering.
          </p>
        </div>

        {/* Marquee Rows */}
        <div className="space-y-8">
          <SkillsRow skills={skillsRowOne} direction="left" />
          <SkillsRow skills={skillsRowTwo} direction="right" />
        </div>
      </div>
    </section>
  );
}
