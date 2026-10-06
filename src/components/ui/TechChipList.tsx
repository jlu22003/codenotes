// components/ui/TechChipList.tsx
// DESIGN.md's Mono-for-Facts rule already governs tech-stack tags
// elsewhere (the TOC sidebar on project pages), but the Skills page
// listed the same category of fact as plain comma-separated prose.
// Reuses the existing Badge/outline pattern rather than inventing a new one.
//
// No label prop: each chip group now sits under a real MDX ## heading
// instead of a styled <p>, so it participates in Nextra's heading-driven
// spacing and TOC — previously Skills had no sub-headings at all, so it
// got none of the generous section rhythm the Experience page has.
import { Badge } from "@/components/ui/badge";

export default function TechChipList({ items }: { items: string[] }) {
  return (
    <div className="mb-6 flex max-w-[75ch] flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="font-mono">
          {item}
        </Badge>
      ))}
    </div>
  );
}
