"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCanvasGesture } from "./use-canvas-gesture";
import { useViewportCulling } from "./use-viewport-culling";
import { CANVAS_WIDTH, CANVAS_HEIGHT, computeContentBounds } from "./layout-engine";
import { CanvasNode } from "./CanvasNode";
import { Minimap } from "./Minimap";
import type { CanvasNodeData } from "./types";

type CanvasProps = {
  nodes: CanvasNodeData[];
};

export function Canvas({ nodes }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const contentBounds = useMemo(() => computeContentBounds(nodes), [nodes]);

  // Measure viewport on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Compute minimum zoom so all content can fit in viewport
  const zoomMin = useMemo(() => {
    if (viewport.width === 0 || viewport.height === 0) return 0.3;
    const boundsW = contentBounds.right - contentBounds.left;
    const boundsH = contentBounds.bottom - contentBounds.top;
    // Scale that fits all content with a 10% margin
    const fitScale = Math.min(viewport.width / boundsW, viewport.height / boundsH) * 0.9;
    return Math.max(0.1, fitScale);
  }, [viewport, contentBounds]);

  const { x, y, scale, isDragging } = useCanvasGesture(
    containerRef,
    contentBounds,
    viewport.width,
    viewport.height,
    zoomMin,
  );

  // Center canvas and set initial scale once viewport is measured
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (viewport.width > 0 && viewport.height > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const isMobile = viewport.width < 768;
      const s = isMobile ? 0.5 : 1;
      const boundsW = contentBounds.right - contentBounds.left;
      const boundsH = contentBounds.bottom - contentBounds.top;
      const ix = (viewport.width - boundsW * s) / 2 - contentBounds.left * s;
      const iy = (viewport.height - boundsH * s) / 2 - contentBounds.top * s;
      x.set(ix);
      y.set(iy);
      scale.set(s);
    }
  }, [viewport, contentBounds, x, y, scale]);

  const visibleNodes = useViewportCulling(
    nodes,
    x,
    y,
    scale,
    viewport.width,
    viewport.height,
  );

  const handleNodeSelect = useCallback((id: string) => {
    // Phase 3 will open the project modal here
    console.log("Selected project:", id);
  }, []);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Project canvas — drag to pan, pinch or scroll to zoom"
      aria-roledescription="interactive canvas"
      className={cn(
        "relative h-screen w-full overflow-hidden",
        "bg-background",
        prefersReducedMotion
          ? "cursor-default"
          : isDragging.current
            ? "cursor-grabbing"
            : "cursor-grab",
      )}
      style={{ touchAction: "none" }}
    >
      <motion.div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          x,
          y,
          scale,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          willChange: "transform",
        }}
      >
        {visibleNodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            onSelect={handleNodeSelect}
          />
        ))}
      </motion.div>

      <Minimap
        nodes={nodes}
        contentBounds={contentBounds}
        x={x}
        y={y}
        scale={scale}
        viewportWidth={viewport.width}
        viewportHeight={viewport.height}
        zoomMin={zoomMin}
      />
    </div>
  );
}
