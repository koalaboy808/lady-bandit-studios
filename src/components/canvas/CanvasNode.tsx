"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";
import type { CanvasNodeData } from "./types";

type CanvasNodeProps = {
  node: CanvasNodeData;
  onSelect: (id: string) => void;
};

export function CanvasNode({ node, onSelect }: CanvasNodeProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={() => onSelect(node.id)}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      transition={transitions.springGentle}
      className={cn(
        "absolute overflow-hidden rounded-lg",
        "cursor-pointer select-none",
        "shadow-sm hover:shadow-lg hover:shadow-black/10",
        "focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "focus-visible:outline-none",
        "transition-shadow duration-300",
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      aria-label={`View project: ${node.title}`}
    >
      {/* Colored placeholder — replaced by thumbnail in Phase 4 */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: node.color }}
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Project info */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-lg leading-tight tracking-tight text-white">
          {node.title}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-white/60">
          {node.category}
        </p>
      </div>
    </motion.button>
  );
}
