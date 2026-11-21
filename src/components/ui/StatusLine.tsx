// components/ui/StatusLine.tsx
// Min-height (not padding-derived) so Hero.tsx can subtract the same value;
// it grows instead of clipping when the browser text size is enlarged.
export const STATUS_LINE_HEIGHT_PX = 32;

export default function StatusLine() {
  return (
    <div
      className="flex items-center bg-background"
      style={{ minHeight: STATUS_LINE_HEIGHT_PX }}
    >
      <div className="container mx-auto max-w-7xl px-8">
        <p className="font-mono text-xs text-muted-foreground">
          frontend · production support · atlanta, ga
        </p>
      </div>
    </div>
  );
}
