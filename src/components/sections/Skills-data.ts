// components/sections/skills-data.ts
import {
  Code,
  Braces,
  Database,
  Globe,
  Layout,
  Terminal,
  GitBranch,
  Cpu,
  Cloud,
  Paintbrush,
} from "lucide-react";

export const skillsRowOne = [
  { label: "JavaScript", icon: Code },
  { label: "TypeScript", icon: Braces },
  { label: "React", icon: Layout },
  { label: "Next.js", icon: Globe },
  { label: "Tailwind CSS", icon: Paintbrush },
  { label: "HTML5", icon: Code },
  { label: "CSS3", icon: Layout },
  { label: "Git", icon: GitBranch },
  { label: "REST APIs", icon: Cloud },
  { label: "GSAP", icon: Cpu },
];

export const skillsRowTwo = [
  { label: "Node.js", icon: Terminal },
  { label: "Django", icon: Database },
  { label: "PostgreSQL", icon: Database },
  { label: "Docker", icon: Cpu },
  { label: "Linux", icon: Terminal },
  { label: "CI/CD", icon: Cloud },
  { label: "Figma", icon: Paintbrush },
  { label: "UX Thinking", icon: Layout },
  { label: "Performance", icon: Cpu },
  { label: "Accessibility", icon: Globe },
];
export const allSkills = [...skillsRowOne, ...skillsRowTwo];