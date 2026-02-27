/**
 * Shared motion tokens for Framer Motion.
 * Import these instead of defining animation values inline.
 */

export const easings = {
  smooth: [0.25, 0.1, 0.25, 1.0],
  out: [0.0, 0.0, 0.2, 1],
  in: [0.4, 0.0, 1, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const;

export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  page: 0.6,
} as const;

export const transitions = {
  default: { duration: durations.normal, ease: easings.smooth },
  fast: { duration: durations.fast, ease: easings.smooth },
  slow: { duration: durations.slow, ease: easings.smooth },
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 260, damping: 25 },
  page: { duration: durations.page, ease: easings.out },
} as const;
