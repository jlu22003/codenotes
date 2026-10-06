// components/ui/ProjectContactCTA.tsx
// None of the 6 project write-ups ended with any path back to Contact —
// the page just stopped after Impact, right at the moment a convinced
// reader is most likely to act. Routes to the homepage's real contact
// form (/#contact-me), not a new one.
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectContactCTA() {
  return (
    <div className="mt-8 max-w-[75ch]">
      <Button variant="outline" size="lg" asChild>
        <Link href="/#contact-me">Interested in similar work? →</Link>
      </Button>
    </div>
  );
}
