"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useFinePointer, useReducedMotionPref, useMounted } from "@/lib/hooks";

/**
 * Global mix-blend cursor. A white disc, difference-blended so it inverts
 * whatever sits under it, springs after the pointer and grows over interactive
 * elements.
 *
 * It grows by animating its width/height, NOT `transform: scale`. Scaling a
 * promoted (will-change) layer up rasterises the small disc once and stretches
 * the bitmap, which is what made the enlarged cursor look jagged/low-res over
 * cards. Animating the box makes the browser re-draw a crisp circle at every
 * size. Off on coarse pointers / reduced motion, where the native cursor stays.
 */
export default function MagicBlendCursor({
  /** resting diameter in px */
  size = 16,
  /** diameter multiplier over interactive elements */
  hoverScale = 2.4,
  opacity = 1,
}: {
  size?: number;
  hoverScale?: number;
  opacity?: number;
}) {
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 30, stiffness: 320, mass: 0.5 });
  const sy = useSpring(y, { damping: 30, stiffness: 320, mass: 0.5 });
  const [hovered, setHovered] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const clickable =
        !!t &&
        (!!t.closest?.('a, button, [role="button"], [data-cursor], input, textarea, select, label') ||
          getComputedStyle(t).cursor === "pointer");
      setHovered(clickable);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [enabled, x, y]);

  if (!enabled || !mounted) return null;

  const d = hovered ? Math.round(size * hoverScale) : size;

  return createPortal(
    <motion.div aria-hidden style={{ position: "fixed", top: 0, left: 0, x: sx, y: sy, zIndex: 99999, pointerEvents: "none", willChange: "transform" }}>
      <motion.div
        animate={{ width: d, height: d }}
        transition={{ type: "spring", damping: 22, stiffness: 320, mass: 0.5 }}
        style={{
          borderRadius: "50%",
          backgroundColor: "#fff",
          opacity,
          mixBlendMode: "difference",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>,
    document.body
  );
}
