// components/sections/projects-data.ts
export interface Project {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

export const projects: Project[] = [
  {
    id: "project-1",
    title: "Portfolio Website",
    summary:
      "A fully responsive portfolio website showcasing projects, skills, and blog posts with smooth animations and ShadCN components.",
    url: "/projects/personalportfolio",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
  },
];


