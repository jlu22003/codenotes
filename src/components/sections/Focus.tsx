// components/sections/Focus.tsx
import { Card } from "@/components/ui/card";

interface FocusArea {
  title: string;
  description: string;
}

const focusAreas: FocusArea[] = [
  {
    title: "Product-Minded Engineering",
    description:
      "Contributed to evaluating and selecting Next.js for a legacy ASP.NET migration at CDI Credit, then implemented the frontend components and owned the responsive-testing pass before release.",
  },
  {
    title: "Systems & Architecture",
    description:
      "From a bitmask-based Tic-Tac-Toe engine to a modular Next.js portfolio built on App Router, I default to structures that make the next change cheap, not just the current one work.",
  },
  {
    title: "Production Reliability & Support",
    description:
      "Production incidents don't get resolved by luck — they get resolved through structured root-cause analysis and escalation workflows I designed and standardized, plus documentation written so the next person didn't have to solve it from scratch.",
  },
];

export default function Focus() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-8">
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-4 text-3xl text-foreground md:text-4xl">
            Focus & Philosophy
          </h2>
          <p className="text-lg text-muted-foreground">
            I approach engineering as a balance between building things well
            and keeping them running well—design, performance, and
            production reliability all matter.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="grid gap-8 md:grid-cols-3">
          {focusAreas.map((item) => (
            <Card
              key={item.title}
              className="p-6 bg-card border border-border shadow-sm"
            >
              <h3 className="mb-2 text-xl text-foreground">
                {item.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
