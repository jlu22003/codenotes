// components/sections/skills-data.ts
import {
  Accessibility,
  Atom,
  Braces,
  Cloud,
  ClipboardCheck,
  Code2,
  Component,
  Database,
  FileCode,
  GitBranch,
  Globe,
  Kanban,
  Layout,
  LifeBuoy,
  Paintbrush,
  Palette,
  Terminal,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

export const skillsRowOne = [
  { label: "JavaScript", icon: FileCode },
  { label: "TypeScript", icon: Braces },
  { label: "React", icon: Atom },
  { label: "Next.js", icon: Globe },
  { label: "Tailwind", icon: Paintbrush },
  { label: "HTML5", icon: Code2 },
  { label: "CSS3", icon: Palette },
  { label: "Git", icon: GitBranch },
  { label: "GSAP", icon: Zap },
  { label: "shadcn/ui", icon: Component },
];

export const skillsRowTwo = [
  { label: "CI/CD", icon: Workflow },
  { label: "Debugging", icon: Terminal },
  { label: "DevTools", icon: Wrench },
  { label: "REST APIs", icon: Cloud },
  { label: "UX Thinking", icon: Layout },
  { label: "Accessibility", icon: Accessibility },
  { label: "ServiceNow", icon: LifeBuoy },
  { label: "Jira", icon: Kanban },
  { label: "ASP.NET", icon: Database },
  { label: "Manual QA", icon: ClipboardCheck },
];

export const allSkills = [...skillsRowOne, ...skillsRowTwo];
