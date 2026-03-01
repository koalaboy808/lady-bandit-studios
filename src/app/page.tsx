import { Canvas } from "@/components/canvas/Canvas";
import { generateLayout } from "@/components/canvas/layout-engine";
import { PLACEHOLDER_PROJECTS } from "@/components/canvas/placeholder-data";

export default function Home() {
  const nodes = generateLayout(PLACEHOLDER_PROJECTS);

  return <Canvas nodes={nodes} />;
}
