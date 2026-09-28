"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useCursor, type CursorMode } from "@/components/providers/CursorProvider";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks";
import { EXPO, SPRING } from "@/lib/motion";

const SIZE: Record<CursorMode, number> = {
  default: 10,
  text: 40,
  view: 88,
  drag: 88,
  open: 76,
  hidden: 0,
};

const LABEL: Partial<Record<CursorMode, string>> = { view: "View", drag: "Drag", open: "Open ↗" };

/**
 * Premium cursor: a dot that becomes a ring on interactive text, and a
 * labelled disc on projects / draggables / external links. Springs from
 * Motion; state from `data-cursor` attributes (delegated) or the provider.
 * Off on touch and coarse pointers.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const { state, set, reset } = useCursor();
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, SPRING.cursor);
  const sy = useSpring(y, SPRING.cursor);

  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged) {
        const m = (tagged.dataset.cursor || "text") as CursorMode;
        set(m, tagged.dataset.cursorLabel);
        return;
      }
      if (t.closest("a, button, [role=button], label, input, textarea, select")) {
        set("text");
        return;
      }
      reset();
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const pdown = () => setDown(true);
    const pup = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", pdown);
    window.addEventListener("pointerup", pup);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", pdown);
      window.removeEventListener("pointerup", pup);
    };
  }, [enabled, set, reset, x, y, visible]);

  if (!enabled) return null;

  const mode = state.mode;
  const size = SIZE[mode];
  const label = state.label ?? LABEL[mode];
  const filled = mode === "view" || mode === "drag" || mode === "open";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1000] flex items-center justify-center"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        mixBlendMode: filled ? "normal" : "difference",
      }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full"
        animate={{
          width: size,
          height: size,
          opacity: visible && mode !== "hidden" ? 1 : 0,
          scale: down ? 0.85 : 1,
          backgroundColor: filled ? (mode === "view" ? "#FF4A17" : "#101010") : mode === "text" ? "rgba(241,239,233,0)" : "#F1EFE9",
          borderWidth: mode === "text" ? 1 : 0,
          borderColor: "rgba(241,239,233,0.9)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.5 }}
        style={{ borderStyle: "solid" }}
      >
        <AnimatePresence>
          {label && filled && (
            <motion.span
              key={label}
              className="label whitespace-nowrap text-paper"
              style={{ fontSize: 10 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EXPO, delay: 0.05 } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
