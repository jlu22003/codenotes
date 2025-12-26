// components/ui/SectionDivider.tsx
import { cn } from "@/lib/utils";

export default function SectionDivider({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("relative py-12", className)}>
      <div className="mx-auto h-px max-w-7xl bg-border/60" />
    </div>
  );
}
