// components/sections/projects-data.ts
export interface Project {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  category: string;
}

// Shared placeholder until each project has a real screenshot.
const PLACEHOLDER_IMAGE =
  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg";

export const projects: Project[] = [
  {
    id: "laylo-cafe",
    title: "Laylo Cafe Website",
    summary:
      "Architected an AI-assisted Shopify theme workflow with custom Liquid components, giving the client independent control over product updates.",
    url: "/projects/laylocafe",
    image: PLACEHOLDER_IMAGE,
    category: "Client Project",
  },
  {
    id: "maskimum-carnage",
    title: "Maskimum Carnage",
    summary:
      "A playable Unity/C# fighting game prototype shipped in 48 hours at Global Game Jam 2026, with enemy AI and progression systems.",
    url: "/projects/maskimumcarnage",
    image: PLACEHOLDER_IMAGE,
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
    id: "boycott-1902",
    title: "Boycott 1902",
    summary:
      "Took ownership of an in-progress WordPress project as a contractor, maintaining site stability and managing delivery independently.",
    url: "/projects/boycott1902",
    image: PLACEHOLDER_IMAGE,
    category: "Client Project",
  },
  {
    id: "personal-portfolio",
    title: "Personal Portfolio Website",
    summary:
      "A modular Next.js portfolio built with App Router and reusable React components, showcasing projects, skills, and blog posts.",
    url: "/projects/personalportfolio",
    image: PLACEHOLDER_IMAGE,
    category: "Personal Project",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe Engine",
    summary:
      "A C-based game engine using bitmap board representation to push win-condition checks toward constant-time complexity.",
    url: "/projects/tictactoe",
    image: PLACEHOLDER_IMAGE,
    category: "Personal Project",
  },
];
