// components/ui/TechChipList.tsx
// DESIGN.md's Mono-for-Facts rule already governs tech-stack tags
// elsewhere (the TOC sidebar on project pages), but the Skills page
// listed the same category of fact as plain comma-separated prose.
// Reuses the existing Badge/outline pattern rather than inventing a new one.
import { Badge } from "@/components/ui/badge";

export default function TechChipList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="mb-6 max-w-[75ch]">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="font-mono">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
