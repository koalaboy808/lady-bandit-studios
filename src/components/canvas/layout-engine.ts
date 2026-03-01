import type { CanvasNodeData, NodeSize, NodeDimensions, ViewportBounds } from "./types";
import type { PlaceholderProject } from "./placeholder-data";

/** Pixel dimensions for each size tier */
const NODE_DIMENSIONS: Record<NodeSize, NodeDimensions> = {
  small: { width: 240, height: 180 },
  medium: { width: 320, height: 240 },
  large: { width: 420, height: 320 },
};

/** Total canvas field size in pixels */
export const CANVAS_WIDTH = 4000;
export const CANVAS_HEIGHT = 3000;

const GRID_COLS = 5;
const GRID_ROWS = 4;
const CELL_WIDTH = CANVAS_WIDTH / GRID_COLS;
const CELL_HEIGHT = CANVAS_HEIGHT / GRID_ROWS;

/** Jitter range as fraction of cell size (±40%) */
const JITTER = 0.35;

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Produces deterministic output so SSR and client hydration match.
 */
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using the seeded RNG.
 */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Compute the tight bounding box around all nodes, plus padding. */
export function computeContentBounds(
  nodes: CanvasNodeData[],
  padding = 200,
): ViewportBounds {
  if (nodes.length === 0) {
    return { left: 0, top: 0, right: CANVAS_WIDTH, bottom: CANVAS_HEIGHT };
  }

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const node of nodes) {
    left = Math.min(left, node.x);
    top = Math.min(top, node.y);
    right = Math.max(right, node.x + node.width);
    bottom = Math.max(bottom, node.y + node.height);
  }

  return {
    left: left - padding,
    top: top - padding,
    right: right + padding,
    bottom: bottom + padding,
  };
}

/**
 * Place projects on the canvas using a grid-with-jitter algorithm.
 * Each project lands in a unique grid cell with a random offset,
 * producing an organic but non-overlapping layout.
 */
export function generateLayout(
  projects: PlaceholderProject[],
): CanvasNodeData[] {
  const rng = createRng(42);

  // Generate all cell indices and shuffle them
  const cells: Array<{ col: number; row: number }> = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      cells.push({ col, row });
    }
  }
  const shuffledCells = shuffle(cells, rng);

  return projects.map((project, i) => {
    const cell = shuffledCells[i];
    const dims = NODE_DIMENSIONS[project.size];

    // Cell center
    const centerX = cell.col * CELL_WIDTH + CELL_WIDTH / 2;
    const centerY = cell.row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // Apply jitter
    const jitterX = (rng() - 0.5) * 2 * JITTER * CELL_WIDTH;
    const jitterY = (rng() - 0.5) * 2 * JITTER * CELL_HEIGHT;

    // Position node centered on jittered point, clamped to canvas bounds
    const x = Math.max(
      0,
      Math.min(CANVAS_WIDTH - dims.width, centerX + jitterX - dims.width / 2),
    );
    const y = Math.max(
      0,
      Math.min(
        CANVAS_HEIGHT - dims.height,
        centerY + jitterY - dims.height / 2,
      ),
    );

    return {
      id: project.id,
      title: project.title,
      category: project.category,
      color: project.color,
      x: Math.round(x),
      y: Math.round(y),
      width: dims.width,
      height: dims.height,
    };
  });
}
