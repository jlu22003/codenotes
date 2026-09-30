"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumeDownloadButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hidden while any card/carousel-heavy section actually occupies the
    // button's own bottom-right corner — confirmed via elementFromPoint
    // testing that this floating button was overlapping and intercepting
    // real clicks on Projects cards and Skills marquee content.
    //
    // rootMargin shrinks the effective viewport to just that bottom strip
    // (instead of "anywhere on screen"), so a tall section only counts as
    // intersecting while it's genuinely near the button — not for its
    // entire scroll duration, which was hiding the button for ~90% of the
    // page (including sections like Focus that never overlapped it).
    // threshold: 0 because the button-corner strip is far smaller than any
    // section's own height, so a percentage-of-target threshold would
    // almost never fire — any overlap with that strip is what matters here.
    const sectionIds = ["projects", "skills", "contact-me"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const intersecting = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }
        setHidden(intersecting.size > 0);
      },
      { threshold: 0, rootMargin: "-85% 0px 0px 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/2025Resume.pdf'; // Place your resume.pdf in the public folder
    link.download = '2025Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 group transition-opacity duration-300",
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      aria-hidden={hidden}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg">
          Download Resume
          {/* Arrow pointing down */}
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-foreground"></div>
        </div>
      </div>

      {/* Button — outline, not the filled/primary treatment, so this
          persistently-floating convenience action never competes with
          whatever the page's actual primary CTA is at any given scroll
          position (DESIGN.md's accent color stays reserved for one signal
          at a time). */}
      <Button
        onClick={handleDownload}
        variant="outline"
        size="lg"
        className="gap-2 group/btn"
        aria-label="Download Resume"
        tabIndex={hidden ? -1 : undefined}
      >
        <Download className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
        <span className="hidden sm:inline">Resume</span>
      </Button>
    </div>
  );
}
