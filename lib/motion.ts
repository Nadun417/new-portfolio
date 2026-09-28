/**
 * Shared motion language for Motion (Framer Motion).
 * One easing family, a handful of durations. Nothing bouncy.
 */
export const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const QUART_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];
export const QUART_OUT: [number, number, number, number] = [0.25, 1, 0.5, 1];

export const DUR = {
  micro: 0.28,
  ui: 0.55,
  reveal: 0.95,
  section: 1.2,
} as const;

export const SPRING = {
  soft: { type: "spring", stiffness: 120, damping: 22, mass: 0.6 } as const,
  snappy: { type: "spring", stiffness: 300, damping: 30, mass: 0.5 } as const,
  cursor: { stiffness: 500, damping: 40, mass: 0.4 } as const,
  magnetic: { stiffness: 180, damping: 18, mass: 0.35 } as const,
};

export const maskUp = {
  hidden: { y: "110%" },
  visible: (i: number = 0) => ({
    y: "0%",
    transition: { duration: DUR.reveal, ease: EXPO, delay: i * 0.06 },
  }),
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EXPO, delay: i * 0.08 },
  }),
};
