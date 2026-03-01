"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MotionValue } from "framer-motion";
import type { CanvasNodeData } from "./types";

/** Extra pixels beyond viewport edges to render (prevents pop-in) */
const PADDING = 200;

/**
 * Returns the subset of nodes visible in the current viewport.
 * Subscribes to motion values and throttles via rAF so dragging
 * at 60fps doesn't trigger excessive React re-renders.
 */
export function useViewportCulling(
  nodes: CanvasNodeData[],
  x: MotionValue<number>,
  y: MotionValue<number>,
  scale: MotionValue<number>,
  viewportWidth: number,
  viewportHeight: number,
): CanvasNodeData[] {
  const [visibleNodes, setVisibleNodes] = useState<CanvasNodeData[]>(nodes);
  const rafId = useRef(0);
  const prevIds = useRef<string>("");

  const computeVisible = useCallback(() => {
    const sx = x.get();
    const sy = y.get();
    const sc = scale.get();

    if (viewportWidth === 0 || viewportHeight === 0) return;

    // Convert viewport bounds to world-space coordinates
    const worldLeft = -sx / sc - PADDING / sc;
    const worldTop = -sy / sc - PADDING / sc;
    const worldRight = (viewportWidth - sx) / sc + PADDING / sc;
    const worldBottom = (viewportHeight - sy) / sc + PADDING / sc;

    const filtered = nodes.filter(
      (node) =>
        node.x + node.width > worldLeft &&
        node.x < worldRight &&
        node.y + node.height > worldTop &&
        node.y < worldBottom,
    );

    // Only update state if the visible set actually changed
    const ids = filtered.map((n) => n.id).join(",");
    if (ids !== prevIds.current) {
      prevIds.current = ids;
      setVisibleNodes(filtered);
    }
  }, [nodes, x, y, scale, viewportWidth, viewportHeight]);

  useEffect(() => {
    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(computeVisible);
    };

    // Schedule initial computation via rAF (deferred, not synchronous)
    scheduleUpdate();

    // Subscribe to motion value changes
    const unsubX = x.on("change", scheduleUpdate);
    const unsubY = y.on("change", scheduleUpdate);
    const unsubScale = scale.on("change", scheduleUpdate);

    return () => {
      unsubX();
      unsubY();
      unsubScale();
      cancelAnimationFrame(rafId.current);
    };
  }, [x, y, scale, computeVisible]);

  return visibleNodes;
}
