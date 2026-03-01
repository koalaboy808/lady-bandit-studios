"use client";

import { useRef, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import type { ViewportBounds } from "./types";

const ZOOM_MAX = 3;
const ZOOM_SENSITIVITY = 0.005;

type CanvasGestureReturn = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  isDragging: RefObject<boolean>;
};

/**
 * Clamp pan values so content stays visible within the viewport.
 * When content exceeds viewport: edges can't reveal empty space.
 * When content fits: center it.
 */
export function clampPan(
  xVal: number,
  yVal: number,
  scaleVal: number,
  bounds: ViewportBounds,
  vpWidth: number,
  vpHeight: number,
): { x: number; y: number } {
  if (vpWidth === 0 || vpHeight === 0) return { x: xVal, y: yVal };

  const scaledLeft = bounds.left * scaleVal;
  const scaledRight = bounds.right * scaleVal;
  const scaledTop = bounds.top * scaleVal;
  const scaledBottom = bounds.bottom * scaleVal;
  const scaledW = scaledRight - scaledLeft;
  const scaledH = scaledBottom - scaledTop;

  let clampedX: number;
  if (scaledW <= vpWidth) {
    clampedX = (vpWidth - scaledW) / 2 - scaledLeft;
  } else {
    const minX = vpWidth - scaledRight;
    const maxX = -scaledLeft;
    clampedX = Math.max(minX, Math.min(maxX, xVal));
  }

  let clampedY: number;
  if (scaledH <= vpHeight) {
    clampedY = (vpHeight - scaledH) / 2 - scaledTop;
  } else {
    const minY = vpHeight - scaledBottom;
    const maxY = -scaledTop;
    clampedY = Math.max(minY, Math.min(maxY, yVal));
  }

  return { x: clampedX, y: clampedY };
}

/**
 * Encapsulates pan/zoom gesture logic for the infinite canvas.
 * Uses @use-gesture for input and Framer Motion motion values
 * for GPU-accelerated transforms (no React re-renders on drag).
 * Clamps pan to keep content bounds visible at all times.
 */
export function useCanvasGesture(
  containerRef: RefObject<HTMLDivElement | null>,
  contentBounds: ViewportBounds,
  viewportWidth: number,
  viewportHeight: number,
  zoomMin: number,
): CanvasGestureReturn {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const isDragging = useRef(false);

  // Keep latest values in refs for gesture callbacks
  const boundsRef = useRef(contentBounds);
  boundsRef.current = contentBounds;
  const vpRef = useRef({ width: viewportWidth, height: viewportHeight });
  vpRef.current = { width: viewportWidth, height: viewportHeight };
  const zoomMinRef = useRef(zoomMin);
  zoomMinRef.current = zoomMin;

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], first, last, event }) => {
        event.preventDefault();
        if (first) isDragging.current = true;
        if (last) isDragging.current = false;

        const newX = x.get() + dx;
        const newY = y.get() + dy;
        const clamped = clampPan(
          newX,
          newY,
          scale.get(),
          boundsRef.current,
          vpRef.current.width,
          vpRef.current.height,
        );
        x.set(clamped.x);
        y.set(clamped.y);
      },

      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();

        const oldScale = scale.get();
        const newScale = Math.min(
          ZOOM_MAX,
          Math.max(zoomMinRef.current, oldScale - dy * ZOOM_SENSITIVITY),
        );

        if (newScale === oldScale) return;

        // Zoom toward cursor: keep the point under the cursor fixed
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;

        const worldX = (cursorX - x.get()) / oldScale;
        const worldY = (cursorY - y.get()) / oldScale;

        const newX = cursorX - worldX * newScale;
        const newY = cursorY - worldY * newScale;

        const clamped = clampPan(
          newX,
          newY,
          newScale,
          boundsRef.current,
          vpRef.current.width,
          vpRef.current.height,
        );
        x.set(clamped.x);
        y.set(clamped.y);
        scale.set(newScale);
      },

      onPinch: ({ offset: [d], origin: [ox, oy], event }) => {
        event?.preventDefault();

        const oldScale = scale.get();
        const newScale = Math.min(ZOOM_MAX, Math.max(zoomMinRef.current, d));

        if (newScale === oldScale) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursorX = ox - rect.left;
        const cursorY = oy - rect.top;

        const worldX = (cursorX - x.get()) / oldScale;
        const worldY = (cursorY - y.get()) / oldScale;

        const newX = cursorX - worldX * newScale;
        const newY = cursorY - worldY * newScale;

        const clamped = clampPan(
          newX,
          newY,
          newScale,
          boundsRef.current,
          vpRef.current.width,
          vpRef.current.height,
        );
        x.set(clamped.x);
        y.set(clamped.y);
        scale.set(newScale);
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true, pointer: { keys: false } },
      wheel: { eventOptions: { passive: false } },
      pinch: {
        scaleBounds: () => ({ min: zoomMinRef.current, max: ZOOM_MAX }),
        from: () => [scale.get(), 0],
        eventOptions: { passive: false },
      },
    },
  );

  return { x, y, scale, isDragging };
}
