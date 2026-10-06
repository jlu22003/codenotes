// components/sections/projects-data.ts
export interface Project {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  // Optional dark-mode variant — only the personal-portfolio project has
  // one, since it's a real screenshot of this site itself (which actually
  // has a dark theme); client screenshots (Laylo Cafe, Boycott 1902) are
  // single captures of external sites, not theme-aware.
  imageDark?: string;
  category: string;
}

// Shared placeholder until each project has a real screenshot. Exported so
// the card component can detect it and visually mark it as a placeholder
// instead of letting it pass for a real screenshot. Self-hosted rather than
// pulled from a third-party demo-block CDN — it backed 4 of 6 project cards,
// a single point of failure outside this project's control.
export const PLACEHOLDER_IMAGE = "/images/placeholder-project.svg";

export const projects: Project[] = [
  {
    id: "laylo-cafe",
    title: "Laylo Cafe",
    summary:
      "Architected an AI-assisted Shopify theme workflow with custom Liquid components, giving the client independent control over product updates.",
    url: "/projects/laylocafe",
    image: "/images/projects/laylocafe.png",
    category: "Client Project",
  },
  {
    id: "boycott-1902",
    title: "Boycott 1902",
    summary:
      "Took ownership of an in-progress WordPress project as a contractor, maintaining site stability and managing delivery independently.",
    url: "/projects/boycott1902",
    image: "/images/projects/boycott1902.png",
    category: "Client Project",
  },
  {
    id: "maskimum-carnage",
    title: "Maskimum Carnage",
    summary:
      "A playable Unity/C# fighting game prototype shipped in 48 hours at Global Game Jam 2026, with enemy AI and progression systems.",
    url: "/projects/maskimumcarnage",
    image: "/images/projects/maskimumcarnage.png",
    category: "Game Jam",
  },
  {
    id: "equal-justice-studios",
    title: "Equal Justice Studios",
    summary:
      "Designed and shipped a client website end-to-end in WordPress, from stakeholder requirements to full ownership transition.",
    url: "/projects/equaljusticestudios",
    image: PLACEHOLDER_IMAGE,
    category: "Client Project",
  },
  {
    id: "personal-portfolio",
    title: "Personal Portfolio",
    summary:
      "A modular Next.js portfolio built with App Router and reusable React components, showcasing projects, skills, and blog posts.",
    url: "/projects/personalportfolio",
    image: "/images/projects/personalportfolio.png",
    imageDark: "/images/projects/personalportfolio-dark.png",
    category: "Personal Project",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    summary:
      "A C-based game engine using bitmap board representation to push win-condition checks toward constant-time complexity.",
    url: "/projects/tictactoe",
    image: PLACEHOLDER_IMAGE,
    category: "Personal Project",
  },
];
