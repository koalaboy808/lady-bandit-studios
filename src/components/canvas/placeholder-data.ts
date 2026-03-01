import type { NodeSize } from "./types";

export type PlaceholderProject = {
  id: string;
  title: string;
  category: string;
  color: string;
  size: NodeSize;
};

/**
 * 15 placeholder projects with warm earth-tone colors.
 * Replaced by Sanity CMS data in Phase 4.
 */
export const PLACEHOLDER_PROJECTS: PlaceholderProject[] = [
  // Large (4)
  {
    id: "project-01",
    title: "Meridian",
    category: "Brand Identity",
    color: "#C4A882",
    size: "large",
  },
  {
    id: "project-02",
    title: "Flux",
    category: "Campaign",
    color: "#8B7D6B",
    size: "large",
  },
  {
    id: "project-03",
    title: "Prism",
    category: "Interface Design",
    color: "#7D8B7A",
    size: "large",
  },
  {
    id: "project-04",
    title: "Solstice",
    category: "Art Direction",
    color: "#9B8EA8",
    size: "large",
  },

  // Medium (6)
  {
    id: "project-05",
    title: "Dune",
    category: "Editorial",
    color: "#A89B8C",
    size: "medium",
  },
  {
    id: "project-06",
    title: "Terrace",
    category: "Packaging",
    color: "#B09080",
    size: "medium",
  },
  {
    id: "project-07",
    title: "Ember",
    category: "Brand Identity",
    color: "#C2A88E",
    size: "medium",
  },
  {
    id: "project-08",
    title: "Vesper",
    category: "Campaign",
    color: "#6B7D8B",
    size: "medium",
  },
  {
    id: "project-09",
    title: "Lume",
    category: "Motion",
    color: "#8A7B6A",
    size: "medium",
  },
  {
    id: "project-10",
    title: "Caldera",
    category: "Interface Design",
    color: "#A3927F",
    size: "medium",
  },

  // Small (5)
  {
    id: "project-11",
    title: "Opal",
    category: "Typography",
    color: "#7B8C7D",
    size: "small",
  },
  {
    id: "project-12",
    title: "Nomad",
    category: "Editorial",
    color: "#B8A090",
    size: "small",
  },
  {
    id: "project-13",
    title: "Cirrus",
    category: "Packaging",
    color: "#8D7E9B",
    size: "small",
  },
  {
    id: "project-14",
    title: "Rift",
    category: "Campaign",
    color: "#6D8190",
    size: "small",
  },
  {
    id: "project-15",
    title: "Halcyon",
    category: "Art Direction",
    color: "#C0AB8D",
    size: "small",
  },
];
