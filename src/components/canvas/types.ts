/** Data for a single project node positioned on the canvas */
export type CanvasNodeData = {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

/** Size tiers for visual variety in the layout */
export type NodeSize = "small" | "medium" | "large";

/** Pixel dimensions for each size tier */
export type NodeDimensions = {
  width: number;
  height: number;
};

/** Canvas transform state */
export type CanvasTransform = {
  x: number;
  y: number;
  scale: number;
};

/** World-space bounds for viewport culling */
export type ViewportBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
