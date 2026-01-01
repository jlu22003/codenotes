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
  Bug,
  Wrench,
} from "lucide-react";

export const skillsRowOne = [
  { label: "JavaScript", icon: Code },
  { label: "TypeScript", icon: Braces },
  { label: "React", icon: Layout },
  { label: "Next.js", icon: Globe },
  { label: "Tailwind", icon: Paintbrush },
  { label: "HTML5", icon: Code },
  { label: "CSS3", icon: Layout },
  { label: "Git", icon: GitBranch },
  { label: "GSAP", icon: Cpu },
  { label: "shadcn/ui", icon: Paintbrush },
];

export const skillsRowTwo = [
  { label: "CI/CD", icon: Cloud },
  { label: "Debugging", icon: Bug },
  { label: "DevTools", icon: Wrench },
  { label: "REST APIs", icon: Cloud },
  { label: "UX Thinking", icon: Layout },
  { label: "Accessibility", icon: Globe },
  { label: "ServiceNow", icon: Terminal },
  { label: "Jira", icon: GitBranch },
  { label: "ASP.NET", icon: Database },
  { label: "Manual QA", icon: Bug },
];

export const allSkills = [...skillsRowOne, ...skillsRowTwo];
