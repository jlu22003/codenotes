// components/projects/ProjectContactCTA.tsx
// Closing call to action on each project write-up, pointing to the
// homepage contact form (/#contact-me).
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
