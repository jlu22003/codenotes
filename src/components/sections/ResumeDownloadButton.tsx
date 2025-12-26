"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ResumeDownloadButton() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/2025Resume.pdf'; // Place your resume.pdf in the public folder
    link.download = '2025Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 group">
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg">
          Download Resume
          {/* Arrow pointing down */}
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-foreground"></div>
        </div>
      </div>

      {/* Button */}
      <Button
        onClick={handleDownload}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-300 gap-2 group/btn"
        aria-label="Download Resume"
      >
        <Download className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
        <span className="hidden sm:inline">Resume</span>
      </Button>
    </div>
  );
}