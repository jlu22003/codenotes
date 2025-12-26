// components/sections/Focus.tsx
import { Card } from "@/components/ui/card";

const focusAreas = [
  {
    title: "Product-Minded Engineering",
    description:
      "I think beyond implementation. Every decision is grounded in user impact, clarity, and long-term maintainability.",
  },
  {
    title: "Systems & Architecture",
    description:
      "I care deeply about structure—clean boundaries, predictable patterns, and codebases that scale without friction.",
  },
  {
    title: "Intentional Motion & Polish",
    description:
      "Motion should guide attention, not distract. I use animation sparingly to reinforce hierarchy and meaning.",
  },
];

export default function Focus() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-8">
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
            Focus & Philosophy
          </h2>
          <p className="text-lg text-muted-foreground">
            I approach frontend engineering as a balance between design,
            performance, and long-term sustainability.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="grid gap-8 md:grid-cols-3">
          {focusAreas.map((item) => (
            <Card
              key={item.title}
              className="p-6 bg-card border border-border shadow-sm"
            >
              <h3 className="mb-2 text-xl font-medium text-foreground">
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


