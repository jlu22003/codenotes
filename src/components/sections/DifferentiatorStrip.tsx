// components/sections/DifferentiatorStrip.tsx
// A compact, real-numbers signal of the production-support half of the
// identity, placed right after Hero. Hero is deliberately full-viewport
// (100dvh, the site's one Experience-mode entrance), so this strip sits
// just below the first fold rather than in it — the fuller story lives in
// Focus & Philosophy's three cards.
export default function DifferentiatorStrip() {
  return (
    <div className="border-y border-border/60 bg-card/50">
      <div className="container mx-auto max-w-7xl px-8 py-4">
        <p className="text-center text-sm font-mono text-muted-foreground">
          <span className="whitespace-nowrap">
            <span className="font-medium text-foreground">200+</span> incidents resolved
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="whitespace-nowrap">
            <span className="font-medium text-foreground">99%</span> SLA
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="whitespace-nowrap">
            <span className="font-medium text-foreground">5,000+</span> users served
          </span>
        </p>
      </div>
    </div>
  );
}
