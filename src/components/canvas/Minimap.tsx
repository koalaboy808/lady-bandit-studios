"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { MotionValue } from "framer-motion";
import { clampPan } from "./use-canvas-gesture";
import type { CanvasNodeData, ViewportBounds } from "./types";

type MinimapProps = {
  nodes: CanvasNodeData[];
  contentBounds: ViewportBounds;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  viewportWidth: number;
  viewportHeight: number;
  zoomMin: number;
};

/** Longest CSS edge of the minimap */
const LONG_EDGE = 200;
const PAD = 6;

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  nodes: CanvasNodeData[],
  mapBounds: ViewportBounds,
  vpL: number,
  vpT: number,
  vpR: number,
  vpB: number,
  accent: string,
) {
  const drawW = w - PAD * 2;
  const drawH = h - PAD * 2;
  const bw = mapBounds.right - mapBounds.left;
  const bh = mapBounds.bottom - mapBounds.top;
  const s = Math.min(drawW / bw, drawH / bh);

  ctx.clearRect(0, 0, w, h);

  // Nodes — soft glow + solid dot
  for (const n of nodes) {
    const cx = (n.x + n.width / 2 - mapBounds.left) * s + PAD;
    const cy = (n.y + n.height / 2 - mapBounds.top) * s + PAD;
    const r = Math.max(2.5, Math.min(n.width, n.height) * s * 0.18);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = n.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Viewport indicator
  const vx = (vpL - mapBounds.left) * s + PAD;
  const vy = (vpT - mapBounds.top) * s + PAD;
  const vw = (vpR - vpL) * s;
  const vh = (vpB - vpT) * s;

  ctx.fillStyle = accent + "10";
  ctx.beginPath();
  ctx.roundRect(vx, vy, vw, vh, 3);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(vx, vy, vw, vh, 3);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Minimap({
  nodes,
  contentBounds,
  x,
  y,
  scale,
  viewportWidth,
  viewportHeight,
  zoomMin,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  // Compute display size (matches window aspect ratio) and world-space bounds
  const { mapW, mapH, mapBounds } = useMemo(() => {
    if (viewportWidth === 0 || viewportHeight === 0 || zoomMin === 0) {
      return {
        mapW: 0,
        mapH: 0,
        mapBounds: contentBounds,
      };
    }

    const aspect = viewportWidth / viewportHeight;
    const mw = aspect >= 1 ? LONG_EDGE : Math.round(LONG_EDGE * aspect);
    const mh = aspect >= 1 ? Math.round(LONG_EDGE / aspect) : LONG_EDGE;

    // World area visible at max zoom-out — this IS the minimap's domain
    const worldW = viewportWidth / zoomMin;
    const worldH = viewportHeight / zoomMin;
    const cx = (contentBounds.left + contentBounds.right) / 2;
    const cy = (contentBounds.top + contentBounds.bottom) / 2;

    return {
      mapW: mw,
      mapH: mh,
      mapBounds: {
        left: cx - worldW / 2,
        top: cy - worldH / 2,
        right: cx + worldW / 2,
        bottom: cy + worldH / 2,
      },
    };
  }, [viewportWidth, viewportHeight, zoomMin, contentBounds]);

  // Read accent color from CSS tokens (updates on theme change)
  const accentRef = useRef("#B08968");
  useEffect(() => {
    const read = () => {
      accentRef.current =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim() || "#B08968";
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Block events from reaching the parent canvas gesture handler
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    el.addEventListener("wheel", stop, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, []);

  // Canvas rendering — subscribes to motion values for 60fps updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mapW === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(mapW * dpr);
    canvas.height = Math.round(mapH * dpr);

    const render = () => {
      const xv = x.get();
      const yv = y.get();
      const sv = scale.get();

      const vpL = -xv / sv;
      const vpT = -yv / sv;
      const vpR = (viewportWidth - xv) / sv;
      const vpB = (viewportHeight - yv) / sv;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, mapW, mapH, nodes, mapBounds, vpL, vpT, vpR, vpB, accentRef.current);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const schedule = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    };

    schedule();
    const unsubs = [
      x.on("change", schedule),
      y.on("change", schedule),
      scale.on("change", schedule),
    ];

    return () => {
      unsubs.forEach((u) => u());
      cancelAnimationFrame(rafId.current);
    };
  }, [mapW, mapH, mapBounds, nodes, viewportWidth, viewportHeight, x, y, scale]);

  // Click-to-jump
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || mapW === 0) return;

      const rect = canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;

      const bw = mapBounds.right - mapBounds.left;
      const bh = mapBounds.bottom - mapBounds.top;
      const drawW = mapW - PAD * 2;
      const drawH = mapH - PAD * 2;
      const s = Math.min(drawW / bw, drawH / bh);

      const worldX = (cssX - PAD) / s + mapBounds.left;
      const worldY = (cssY - PAD) / s + mapBounds.top;

      const sv = scale.get();
      const clamped = clampPan(
        viewportWidth / 2 - worldX * sv,
        viewportHeight / 2 - worldY * sv,
        sv,
        contentBounds,
        viewportWidth,
        viewportHeight,
      );
      x.set(clamped.x);
      y.set(clamped.y);
    },
    [mapW, mapH, mapBounds, contentBounds, x, y, scale, viewportWidth, viewportHeight],
  );

  if (mapW === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-5 right-5 z-10 hidden sm:block"
    >
      <div
        className="overflow-hidden rounded-xl border border-border/40 shadow-lg shadow-black/10 backdrop-blur-xl dark:shadow-black/40"
        style={{
          width: mapW,
          height: mapH,
          background: "color-mix(in srgb, var(--surface) 65%, transparent)",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="cursor-crosshair"
          style={{ width: mapW, height: mapH }}
        />
      </div>
    </div>
  );
}
