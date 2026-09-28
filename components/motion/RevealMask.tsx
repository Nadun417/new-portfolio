"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EXPO, DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Dir = "up" | "down" | "left" | "right";

const CLIP: Record<Dir, [string, string]> = {
  up: ["inset(100% 0 0 0)", "inset(0 0 0 0)"],
  down: ["inset(0 0 100% 0)", "inset(0 0 0 0)"],
  left: ["inset(0 100% 0 0)", "inset(0 0 0 0)"],
  right: ["inset(0 0 0 100%)", "inset(0 0 0 0)"],
};

/**
 * Directional media reveal: the container stays still, the mask opens and
 * the child settles from scale 1.15 to 1. Use around <Image>, <video>, blocks.
 *
 * The in-view observer sits on an un-clipped wrapper: a fully clipped element
 * never intersects the viewport, so it would never reveal itself.
 */
export default function RevealMask({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = DUR.section,
  scaleFrom = 1.15,
  once = true,
  amount = 0.3,
  trigger = "view",
  visible,
}: {
  children: ReactNode;
  className?: string;
  direction?: Dir;
  delay?: number;
  duration?: number;
  scaleFrom?: number;
  once?: boolean;
  amount?: number;
  trigger?: "view" | "mount" | "manual";
  visible?: boolean;
}) {
  const reduced = useReducedMotion();
  const [from, to] = CLIP[direction];
  const clip = {
    hidden: { clipPath: from },
    visible: { clipPath: to, transition: { duration, ease: EXPO, delay } },
  };
  const inner = {
    hidden: { scale: scaleFrom },
    visible: { scale: 1, transition: { duration: duration + 0.2, ease: EXPO, delay } },
  };
  const anim = reduced
    ? { initial: "visible", animate: "visible" }
    : trigger === "mount"
      ? { initial: "hidden", animate: "visible" }
      : trigger === "manual"
        ? { initial: "hidden", animate: visible ? "visible" : "hidden" }
        : { initial: "hidden", whileInView: "visible", viewport: { once, amount } };

  return (
    <motion.div className={cn("relative", className)} {...anim}>
      <motion.div className="h-full w-full overflow-hidden will-change-[clip-path]" variants={clip}>
        <motion.div className="relative h-full w-full will-change-transform" variants={inner}>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
