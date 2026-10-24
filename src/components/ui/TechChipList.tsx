// components/ui/TechChipList.tsx
// Tech-stack tags as mono outline badges (DESIGN.md's Mono-for-Facts rule).
// No label prop: put each list under an MDX ## heading so it gets Nextra's
// section spacing and a TOC entry.
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function TechChipList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex max-w-[75ch] flex-wrap gap-2", className)}>
      {items.map((item) => (
        <Badge key={item} variant="outline" className="font-mono">
          {item}
        </Badge>
      ))}
    </div>
  );
}
